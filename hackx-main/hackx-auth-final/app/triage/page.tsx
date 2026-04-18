"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TriageResult } from "@/lib/triage";
import { fallbackTriage } from "@/lib/triage";

const SYMPTOMS_MAP: Record<string, { emoji: string; hi: string; en: string }> = {
  fever: { emoji: "🌡️", hi: "बुखार", en: "Fever" }, chest: { emoji: "💔", hi: "सीने में दर्द", en: "Chest Pain" },
  breath: { emoji: "😮‍💨", hi: "सांस में तकलीफ", en: "Breathless" }, cough: { emoji: "😮", hi: "खांसी", en: "Cough" },
  cold: { emoji: "🤧", hi: "जुकाम", en: "Cold" }, headache: { emoji: "🤕", hi: "सिरदर्द", en: "Headache" },
  vomit: { emoji: "🤢", hi: "उल्टी", en: "Vomiting" }, diarrhea: { emoji: "💧", hi: "दस्त", en: "Diarrhea" },
  rash: { emoji: "🔴", hi: "दाने", en: "Skin Rash" }, pain: { emoji: "🦴", hi: "जोड़ों में दर्द", en: "Joint Pain" },
  weakness: { emoji: "😴", hi: "कमज़ोरी", en: "Weakness" }, stomach: { emoji: "😣", hi: "पेट में दर्द", en: "Stomach Pain" },
  eyes: { emoji: "👁️", hi: "आँखों में जलन", en: "Eye Pain" }, back: { emoji: "🔙", hi: "कमर दर्द", en: "Back Pain" },
  dizzy: { emoji: "💫", hi: "चक्कर", en: "Dizziness" }, swelling: { emoji: "🦵", hi: "सूजन", en: "Swelling" },
  chills: { emoji: "🥶", hi: "ठंड लगना", en: "Chills" }, body_ache: { emoji: "🤸", hi: "शरीर दर्द", en: "Body Ache" },
  sweat: { emoji: "💦", hi: "पसीना", en: "Sweating" }, urine_burn: { emoji: "🔥", hi: "पेशाब में जलन", en: "Burning Urination" },
  nausea: { emoji: "😰", hi: "जी मिचलाना", en: "Nausea" }, unconscious: { emoji: "😵", hi: "बेहोशी", en: "Unconscious" },
  seizure: { emoji: "⚡", hi: "दौरे", en: "Seizures" }, bleed: { emoji: "🩸", hi: "रक्तस्राव", en: "Bleeding" },
};

// Dedicated medicines per symptom combination — clinically accurate
const MEDICINES_FOR_SYMPTOMS = (symptomIds: string[]): Array<{ name: string; dose: string; note: string }> => {
  const s = symptomIds;
  const has = (id: string) => s.includes(id);

  // ── RED EMERGENCIES ────────────────────────────────────────────────────────
  // Cardiac: chest + breathlessness = highest priority
  if (has("chest") && has("breath")) return [
    { name: "Aspirin 325mg", dose: "1 tablet — CHEW immediately, do not swallow whole", note: "⚠️ CALL 108 NOW — do not wait. Chew aspirin only if not allergic" },
    { name: "Sorbitrate (Isosorbide 5mg)", dose: "1 tablet under the tongue", note: "Only if patient has been prescribed this before" },
  ];
  // Heart attack: chest + sweating
  if (has("chest") && has("sweat")) return [
    { name: "Aspirin 325mg", dose: "1 tablet — CHEW immediately", note: "⚠️ CALL 108 NOW — possible heart attack. Chew, do not swallow whole" },
    { name: "Sorbitrate (Isosorbide 5mg)", dose: "1 tablet under the tongue", note: "Only if previously prescribed — helps open arteries" },
  ];
  // Breathlessness alone (RED)
  if (has("breath") && (has("dizzy") || has("sweat") || has("chest"))) return [
    { name: "No medication — CALL 108", dose: "Emergency — do not give anything by mouth", note: "⚠️ Sit patient upright, open windows, call 108 immediately" },
  ];
  // Dengue/Meningitis: fever + rash + headache
  if (has("fever") && has("rash") && has("headache")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "⛔ Do NOT give Aspirin or Ibuprofen — risk of bleeding in dengue" },
    { name: "ORS Sachet", dose: "1 sachet in 1L water, sip continuously", note: "Hydration is critical — dengue/meningitis suspected" },
  ];
  // Severe dehydration: vomit + diarrhea + dizzy + weakness
  if (has("vomit") && has("diarrhea") && has("dizzy") && has("weakness")) return [
    { name: "ORS Sachet", dose: "Small sips every 5 minutes — do not gulp", note: "⚠️ URGENT — go to hospital for IV drip if not improving" },
    { name: "Zinc 20mg", dose: "1 tablet daily for 10 days", note: "Reduces diarrhea severity and duration" },
  ];
  // Unconsciousness
  if (has("unconscious")) return [
    { name: "No medication — CALL 108", dose: "Emergency — do not give anything by mouth", note: "⚠️ Turn patient on side, call 108, do not leave alone" },
  ];
  // Seizure
  if (has("seizure")) return [
    { name: "No medication — CALL 108", dose: "Emergency — do not restrain patient", note: "⚠️ Clear area of objects, turn on side, call 108 immediately" },
  ];
  // Severe bleeding
  if (has("bleed")) return [
    { name: "No oral medication — apply pressure", dose: "Press firmly with clean cloth and do not remove", note: "⚠️ CALL 108 — elevate if possible, keep pressure on wound" },
  ];

  // ── YELLOW — MULTI-SYMPTOM COMBOS ─────────────────────────────────────────
  // Chest pain alone — YELLOW (not RED, no breath/sweat)
  if (has("chest")) return [
    { name: "Aspirin 325mg", dose: "1 tablet — chew slowly", note: "⚠️ Get ECG today — do not ignore chest pain. Avoid exertion" },
    { name: "Pantoprazole 40mg", dose: "1 tablet 30 min before food", note: "If pain is due to acidity/reflux" },
    { name: "Sorbitrate (Isosorbide 5mg)", dose: "Under tongue if prescribed", note: "Only if cardiologist has prescribed previously" },
  ];
  // Malaria: fever + chills
  if (has("fever") && has("chills")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "For fever relief" },
    { name: "Artemether + Lumefantrine (Coartem)", dose: "As prescribed after positive malaria test", note: "Do NOT take without confirmed malaria test" },
    { name: "ORS Sachet", dose: "1 sachet in 1L water", note: "Stay hydrated — malaria causes heavy sweating" },
  ];
  // Dengue: fever + rash (no headache)
  if (has("fever") && has("rash")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "⛔ Do NOT give Aspirin or Ibuprofen — increases bleeding risk in dengue" },
    { name: "ORS Sachet", dose: "1 sachet in 1L water — drink throughout the day", note: "Dengue suspected — stay well hydrated" },
  ];
  // Pneumonia: fever + cough + breathlessness
  if (has("fever") && has("cough") && has("breath")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "For fever" },
    { name: "Amoxicillin 500mg", dose: "1 capsule 3 times daily for 5-7 days", note: "After doctor confirms bacterial pneumonia" },
    { name: "Salbutamol Inhaler", dose: "2 puffs every 4-6 hours as needed", note: "For breathlessness — if available" },
  ];
  // Typhoid: fever + headache + vomiting
  if (has("fever") && has("headache") && has("vomit")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "For fever and headache" },
    { name: "Ondansetron 4mg", dose: "1 tablet before meals, 3 times daily", note: "For vomiting — typhoid suspected" },
    { name: "ORS Sachet", dose: "1 sachet in 1L boiled water", note: "Only boiled or filtered water — typhoid spreads via water" },
  ];
  // Viral flu: fever + body ache
  if (has("fever") && has("body_ache")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours (max 4 per day)", note: "For fever and body ache" },
    { name: "Ibuprofen 400mg", dose: "1 tablet after food, twice daily", note: "For body ache — ⛔ not if dengue suspected" },
    { name: "ORS Sachet", dose: "1 sachet in 1L water", note: "Prevent dehydration from fever" },
  ];
  // Viral fever with cough
  if (has("fever") && has("cough")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "For fever" },
    { name: "Dextromethorphan Syrup", dose: "10ml every 6 hours", note: "For dry cough" },
    { name: "Cetirizine 10mg", dose: "1 tablet at bedtime", note: "For throat irritation and allergic cough" },
  ];
  // Fever with headache (no vomiting)
  if (has("fever") && has("headache")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "For fever and headache" },
    { name: "ORS Sachet", dose: "1 sachet in 1L water", note: "Stay hydrated" },
  ];
  // Gastroenteritis: vomiting + diarrhea
  if (has("vomit") && has("diarrhea")) return [
    { name: "ORS Sachet", dose: "1 sachet in 1L water — sip every 15 min", note: "Most critical — prevents dangerous dehydration" },
    { name: "Zinc 20mg", dose: "1 tablet daily for 10 days", note: "Reduces diarrhea severity" },
    { name: "Ondansetron 4mg", dose: "1 tablet every 8 hours", note: "For vomiting" },
  ];
  // UTI: burning urination
  if (has("urine_burn")) return [
    { name: "Nitrofurantoin 100mg", dose: "1 tablet twice daily for 5 days", note: "UTI antibiotic — only after urine test confirms" },
    { name: "Phenazopyridine 200mg", dose: "1 tablet 3 times daily for 2 days", note: "Relieves burning sensation quickly" },
    { name: "Water", dose: "3 litres per day minimum", note: "Flush out infection — most important" },
  ];
  // Migraine: headache + vomiting (no fever)
  if (has("headache") && has("vomit")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "For headache pain" },
    { name: "Ondansetron 4mg", dose: "1 tablet dissolved under tongue", note: "For vomiting — fast acting" },
    { name: "Domperidone 10mg", dose: "1 tablet 30 min before food", note: "Reduces nausea" },
  ];
  // Low BP / anaemia: dizziness + weakness
  if (has("dizzy") && has("weakness")) return [
    { name: "ORS Sachet", dose: "1 sachet in 1L water", note: "Immediate — low BP or dehydration" },
    { name: "Iron + Folic Acid", dose: "1 tablet daily after food", note: "If anaemia suspected" },
    { name: "Glucose-D Powder", dose: "2 spoons in 1 glass water", note: "Immediate energy boost" },
  ];
  // Stomach infection with fever
  if (has("stomach") && has("fever")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "For fever" },
    { name: "Metronidazole 400mg", dose: "1 tablet 3 times daily for 5 days", note: "For stomach infection — after doctor confirms" },
    { name: "Pantoprazole 40mg", dose: "1 tablet 30 min before breakfast", note: "For stomach pain and acidity" },
  ];
  // Nausea + vomiting
  if (has("nausea") && has("vomit")) return [
    { name: "Ondansetron 4mg", dose: "1 tablet every 8 hours", note: "Fast acting anti-nausea" },
    { name: "Domperidone 10mg", dose: "1 tablet 30 min before food", note: "Reduces nausea and vomiting" },
    { name: "ORS Sachet", dose: "1 sachet in 1L water — small sips", note: "Replace fluids lost" },
  ];

  // ── GREEN — SINGLE SYMPTOMS ────────────────────────────────────────────────
  // Fever alone
  if (has("fever")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours (max 4/day)", note: "Take with water — not on empty stomach" },
    { name: "ORS Sachet", dose: "1 sachet in 1L water throughout the day", note: "Prevent dehydration" },
  ];
  // Headache alone (no fever)
  if (has("headache")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet, repeat after 6 hours if needed", note: "Drink 2 full glasses of water with it" },
    { name: "Ibuprofen 400mg", dose: "1 tablet after food if Paracetamol insufficient", note: "Adults only — take with food to protect stomach" },
  ];
  // Cold / runny nose
  if (has("cold")) return [
    { name: "Cetirizine 10mg", dose: "1 tablet at night", note: "For runny nose, sneezing, itchy eyes" },
    { name: "Steam Inhalation", dose: "Twice daily for 10 minutes", note: "Add Vicks VapoRub or tulsi leaves to hot water" },
    { name: "Paracetamol 500mg", dose: "Only if fever is also present", note: "For fever component only" },
  ];
  // Cough alone (no fever)
  if (has("cough")) return [
    { name: "Dextromethorphan Syrup", dose: "10ml every 6 hours", note: "For dry cough — do not give to children under 2" },
    { name: "Ambroxol Syrup", dose: "10ml 3 times daily", note: "For wet/productive cough" },
    { name: "Honey in warm water", dose: "1 spoon honey in warm water, twice daily", note: "Safe natural remedy for all ages" },
  ];
  // Back pain
  if (has("back")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "For pain relief" },
    { name: "Ibuprofen 400mg", dose: "1 tablet after food, twice daily", note: "Anti-inflammatory — reduces back pain" },
    { name: "Diclofenac Gel", dose: "Apply on affected area 3 times daily", note: "External use only — massage gently" },
  ];
  // Stomach pain / indigestion (no fever)
  if (has("stomach")) return [
    { name: "Pantoprazole 40mg", dose: "1 tablet 30 min before breakfast", note: "For acidity, heartburn and stomach pain" },
    { name: "Digene Syrup", dose: "2 spoons after meals", note: "For gas and bloating" },
    { name: "Domperidone 10mg", dose: "1 tablet 30 min before food", note: "For nausea and indigestion" },
  ];
  // Eye problem
  if (has("eyes")) return [
    { name: "Ciprofloxacin Eye Drops 0.3%", dose: "2 drops in each eye, every 4 hours", note: "Keep tip clean — do not let it touch eye surface" },
    { name: "Sodium Chloride 0.9% Eye Wash", dose: "Wash eyes with clean water twice daily", note: "Soothes irritation" },
  ];
  // Skin rash
  if (has("rash")) return [
    { name: "Cetirizine 10mg", dose: "1 tablet at night for 5 days", note: "For allergic rash, hives, itching" },
    { name: "Calamine Lotion", dose: "Apply on affected area twice daily", note: "Soothes, cools and dries rash" },
    { name: "Hydrocortisone Cream 1%", dose: "Thin layer twice daily on rash", note: "For inflammation — avoid face and broken skin" },
  ];
  // Joint pain
  if (has("pain")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "For mild to moderate pain" },
    { name: "Ibuprofen 400mg", dose: "1 tablet after food, twice daily", note: "Anti-inflammatory — for joint swelling and pain" },
    { name: "Diclofenac Gel", dose: "Apply on joint 3 times daily", note: "External use only — for local pain relief" },
  ];
  // Weakness alone
  if (has("weakness")) return [
    { name: "Iron + Folic Acid Tablet", dose: "1 tablet daily after food", note: "For anaemia and weakness — take with vitamin C" },
    { name: "Vitamin B-Complex", dose: "1 tablet daily", note: "For energy, nerve health and fatigue" },
    { name: "Glucose-D Powder", dose: "2 spoons in 1 glass water", note: "Quick energy — especially if not eating well" },
  ];
  // Swelling
  if (has("swelling")) return [
    { name: "Ibuprofen 400mg", dose: "1 tablet after food, twice daily", note: "Reduces swelling and inflammation" },
    { name: "Diclofenac Gel", dose: "Apply on swollen area twice daily", note: "External use only" },
  ];
  // Dizziness alone
  if (has("dizzy")) return [
    { name: "Meclizine 25mg", dose: "1 tablet twice daily", note: "For vertigo and dizziness" },
    { name: "ORS Sachet", dose: "1 sachet in 1L water", note: "If dizziness is from dehydration or heat" },
  ];
  // Nausea alone
  if (has("nausea")) return [
    { name: "Domperidone 10mg", dose: "1 tablet 30 min before food", note: "For nausea and vomiting feeling" },
    { name: "Ondansetron 4mg", dose: "1 tablet dissolved under tongue", note: "Fast-acting anti-nausea" },
  ];
  // Body ache alone
  if (has("body_ache")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "For generalized body ache" },
    { name: "Ibuprofen 400mg", dose: "1 tablet after food, twice daily", note: "Anti-inflammatory for muscle aches" },
  ];
  // Chills alone
  if (has("chills")) return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours", note: "For fever and chills" },
    { name: "ORS Sachet", dose: "1 sachet in 1L water", note: "Stay hydrated" },
  ];
  // Breathlessness alone (no red boosters)
  if (has("breath")) return [
    { name: "Salbutamol Inhaler", dose: "2 puffs, repeat after 20 minutes if needed", note: "If patient has asthma — see doctor today" },
    { name: "No other medicine without doctor", dose: "—", note: "⚠️ Breathlessness always needs doctor evaluation" },
  ];
  // Excessive sweating
  if (has("sweat")) return [
    { name: "ORS Sachet", dose: "1 sachet in 1L water throughout the day", note: "Replace fluids and electrolytes" },
    { name: "Paracetamol 500mg", dose: "If fever is also present", note: "Check for fever — sweating can indicate infection" },
  ];

  // Default fallback
  return [
    { name: "Paracetamol 500mg", dose: "1 tablet every 6 hours if needed", note: "General pain and fever relief" },
    { name: "ORS Sachet", dose: "1 sachet in 1L water", note: "Stay hydrated" },
  ];
};

const GRAD: Record<string, string> = {
  RED: "linear-gradient(160deg,#922B21,#C0392B)",
  YELLOW: "linear-gradient(160deg,#B7770D,#E67E22)",
  GREEN: "linear-gradient(160deg,#1A6B3A,#27AE60)",
};
const C = { primary: "#1B6CA8", primaryDark: "#0F4C7A", green: "#1E8449", greenLight: "#27AE60", red: "#C0392B", yellow: "#F39C12", bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC" };

export default function TriagePage() {
  const router = useRouter();
  const [lang, setLang] = useState<"hi" | "en">("hi"); // default "hi" matches server render
  const t = (hi: string, en: string) => lang === "hi" ? hi : en;

  const [result, setResult] = useState<TriageResult | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [medicines, setMedicines] = useState<Array<{ name: string; dose: string; note: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState<{ duration?: string; diseases?: string[]; otherDisease?: string; fileNames?: string[] } | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    // Sync lang from localStorage after mount (avoids hydration mismatch)
    const storedLang = localStorage.getItem("lang");
    if (storedLang === "en") setLang("en");
    const saved = localStorage.getItem("triageResult");
    const triageMode = localStorage.getItem("triageMode");
    const syms = JSON.parse(localStorage.getItem("selectedSymptoms") || "[]");
    const detail = localStorage.getItem("symptomDetailData");
    if (detail) setDetailData(JSON.parse(detail));
    setSelectedSymptoms(syms);
    const meds = MEDICINES_FOR_SYMPTOMS(syms);
    setMedicines(meds);
    // Save medicines for report
    localStorage.setItem("prescribedMedicines", JSON.stringify(meds));

    // Check if we're in offline mode
    if (triageMode === "offline") {
      setIsOfflineMode(true);
      localStorage.removeItem("triageMode"); // Clear after reading
    }

    if (saved) {
      setResult(JSON.parse(saved));
    } else {
      setResult(fallbackTriage(syms));
      setIsOfflineMode(true);
    }
    setLoading(false);
  }, []);

  const urgColor = result ? { RED: C.red, YELLOW: C.yellow, GREEN: C.green }[result.urgency] : C.green;

  if (loading || !result) {
    return (
      <div style={{ background: "linear-gradient(160deg,#0F4C7A,#1B6CA8)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 60 }}>🤖</div>
        <div style={{ width: 48, height: 48, border: "4px solid rgba(255,255,255,.3)", borderTop: "4px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ color: "white", fontSize: 18, fontWeight: 800 }}>{t("AI जाँच रहा है...", "AI is analyzing...")}</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Hero */}
        <div style={{ padding: "44px 16px 22px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: GRAD[result.urgency] }}>
          {/* Offline indicator */}
          {isOfflineMode && (
            <div style={{ background: "rgba(0,0,0,.3)", borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.9)", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
              ⚡ {t("ऑफलाइन विश्लेषण", "Offline Analysis")}
            </div>
          )}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 30, fontSize: 17, fontWeight: 800, color: "white", background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.4)", marginBottom: 10 }}>
            {result.urgency === "RED" ? "🔴" : result.urgency === "YELLOW" ? "🟡" : "🟢"} {result.urgency}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{lang === "hi" ? result.conditionHi : result.conditionEn}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 4 }}>{lang === "hi" ? result.conditionEn : result.conditionHi}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, justifyContent: "center" }}>
            {selectedSymptoms.map(id => {
              const s = SYMPTOMS_MAP[id];
              if (!s) return null;
              return <span key={id} style={{ background: "rgba(255,255,255,.15)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,.85)" }}>{s.emoji} {lang === "hi" ? s.hi : s.en}</span>;
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 150px" }}>

          {/* PATIENT CONTEXT CARD — shown if detail data exists */}
          {detailData && (
            <div style={{ background: C.card, borderRadius: 16, padding: 14, marginTop: 12, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>🩺 {t("रोगी की जानकारी", "Patient Context")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {detailData.duration && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#EBF4FD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⏱️</div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{t("कितने दिनों से", "Duration")}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                        {{ "1day": lang === "hi" ? "1 दिन" : "1 Day", "2-3days": lang === "hi" ? "2–3 दिन" : "2–3 Days", "4-7days": lang === "hi" ? "4–7 दिन" : "4–7 Days", "1-2weeks": lang === "hi" ? "1–2 हफ्ते" : "1–2 Weeks", "2weeks+": lang === "hi" ? "2+ हफ्ते" : "2+ Weeks" }[detailData.duration] || detailData.duration}
                      </div>
                    </div>
                  </div>
                )}
                {detailData.diseases && detailData.diseases.filter(d => d !== "none").length > 0 && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FDEDED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🏥</div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{t("पुरानी बीमारियाँ", "Known Conditions")}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                        {detailData.diseases.filter(d => d !== "none").map((d, i) => (
                          <span key={i} style={{ background: "#FDEDED", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "#C0392B", fontWeight: 600 }}>{d}</span>
                        ))}
                        {detailData.otherDisease && (
                          <span style={{ background: "#FDEDED", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "#C0392B", fontWeight: 600 }}>{detailData.otherDisease}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {detailData.fileNames && detailData.fileNames.length > 0 && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#F5EEF8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📎</div>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{t("अपलोड की गई फ़ाइलें", "Uploaded Records")}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                        {detailData.fileNames.map((f, i) => (
                          <span key={i} style={{ background: "#F5EEF8", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "#8E44AD", fontWeight: 600 }}>📄 {f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MEDICINES SECTION */}
          <div style={{ background: C.card, borderRadius: 16, padding: 14, marginTop: 12, border: `2px solid #27AE60` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>
              💊 {t("AI द्वारा सुझाई दवाइयाँ", "AI Recommended Medicines")}
            </div>
            {medicines.map((med, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < medicines.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E8F8EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>💊</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{med.name}</div>
                  <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, marginTop: 2 }}>📋 {med.dose}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>⚠️ {med.note}</div>
                </div>
              </div>
            ))}
            <div style={{ background: "#FEF9E7", borderRadius: 8, padding: "8px 10px", marginTop: 8, fontSize: 11, color: "#7D6608" }}>
              ⚠️ {t("ये सुझाव केवल प्रारंभिक मार्गदर्शन हैं। कोई भी दवाई लेने से पहले डॉक्टर से सलाह लें।", "These are preliminary suggestions only. Always consult a doctor before taking any medicine.")}
            </div>
          </div>

          {[
            { title: t("✅ अभी यह करें", "✅ Do This Now"), items: result.doNow, cross: false, numBg: C.bg, numColor: C.primary },
            { title: t("🚫 यह बिलकुल न करें", "🚫 Do NOT Do This"), items: result.doNot, cross: true, numBg: "#FDEDED", numColor: C.red },
            { title: t("⚠️ इन पर ध्यान दें", "⚠️ Watch For These"), items: result.warnings, cross: false, numBg: "#FEF9E7", numColor: "#B7770D" },
          ].map((section, si) => (
            <div key={si} style={{ background: C.card, borderRadius: 16, padding: 14, marginTop: 12, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>{section.title}</div>
              {section.items.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: i < section.items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: section.numBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: section.numColor, flexShrink: 0, marginTop: 1 }}>
                    {section.cross ? "✗" : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{lang === "hi" ? item.hi : item.en}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{lang === "hi" ? item.en : item.hi}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Info cards */}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {[
              { label: t("डॉक्टर", "Doctor"), val: lang === "hi" ? result.docType.hi : result.docType.en },
              { label: t("प्रतीक्षा", "Wait"), val: lang === "hi" ? result.wait.hi : result.wait.en, red: result.urgency === "RED" },
              { label: t("संक्रामक?", "Contagious?"), val: lang === "hi" ? result.contagious.hi : result.contagious.en },
            ].map((info, i) => (
              <div key={i} style={{ flex: 1, background: C.card, borderRadius: 12, padding: 12, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase" }}>{info.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: info.red ? C.red : C.text, marginTop: 4 }}>{info.val}</div>
              </div>
            ))}
          </div>

          {result.summary && (
            <div style={{ background: C.card, borderRadius: 16, padding: 14, marginTop: 12, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.primary}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 6 }}>🤖 AI Clinical Summary</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, fontStyle: "italic" }}>{result.summary}</div>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div style={{ position: "fixed", bottom: 0, width: 390, background: C.card, borderTop: `2px solid ${C.border}`, padding: "10px 16px", display: "flex", flexDirection: "column", gap: 7, zIndex: 50 }}>
          {result.emergency && (
            <a href="tel:108" style={{ background: "linear-gradient(135deg,#E74C3C,#922B21)", color: "white", padding: 13, borderRadius: 14, fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", textDecoration: "none" }}>
              📞 {t("108 पर कॉल करें — आपातकाल", "Call 108 — Emergency")}
            </a>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => router.push("/confirm")} style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "white" }}>
              📅 {t("डॉक्टर बुक करें", "Book Doctor")}
            </button>
            <button onClick={() => router.push("/medicine")} style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: `linear-gradient(135deg,#27AE60,#1E8449)`, color: "white" }}>
              💊 {t("दवाई खोजें", "Find Medicine")}
            </button>
          </div>
          <button onClick={() => router.push("/report")} style={{ width: "100%", padding: 13, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: `linear-gradient(135deg,#8E44AD,#6C3483)`, color: "white" }}>
            📄 {t("रिपोर्ट देखें / डाउनलोड करें", "View / Download Report")}
          </button>
        </div>
        <style>{`@keyframes epulse{0%,100%{box-shadow:0 4px 16px rgba(231,76,60,.5)}50%{box-shadow:0 4px 32px rgba(231,76,60,.9)}}`}</style>
      </div>
    </div>
  );
}