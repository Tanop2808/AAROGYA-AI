// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// const C = { primary: "#1B6CA8", primaryDark: "#0F4C7A", green: "#1E8449", red: "#C0392B", yellow: "#F39C12", bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC" };

// const SYMPTOMS_MAP: Record<string, { emoji: string; en: string }> = {
//   fever: { emoji: "🌡️", en: "Fever" }, chest: { emoji: "💔", en: "Chest Pain" },
//   breath: { emoji: "😮‍💨", en: "Breathlessness" }, cough: { emoji: "😮", en: "Cough" },
//   cold: { emoji: "🤧", en: "Cold" }, headache: { emoji: "🤕", en: "Headache" },
//   vomit: { emoji: "🤢", en: "Vomiting" }, diarrhea: { emoji: "💧", en: "Diarrhea" },
//   rash: { emoji: "🔴", en: "Skin Rash" }, pain: { emoji: "🦴", en: "Joint Pain" },
//   weakness: { emoji: "😴", en: "Weakness" }, stomach: { emoji: "😣", en: "Stomach Pain" },
//   eyes: { emoji: "👁️", en: "Eye Problem" }, back: { emoji: "🔙", en: "Back Pain" },
//   dizzy: { emoji: "💫", en: "Dizziness" }, swelling: { emoji: "🦵", en: "Swelling" },
//   chills: { emoji: "🥶", en: "Chills" }, body_ache: { emoji: "🤸", en: "Body Ache" },
//   sweat: { emoji: "💦", en: "Sweating" }, urine_burn: { emoji: "🔥", en: "Burning Urination" },
//   nausea: { emoji: "😰", en: "Nausea" }, unconscious: { emoji: "😵", en: "Unconsciousness" },
//   seizure: { emoji: "⚡", en: "Seizures" }, bleed: { emoji: "🩸", en: "Bleeding" },
// };

// export default function ReportPage() {
//   const router = useRouter();
//   const [patient, setPatient] = useState<any>(null);
//   const [result, setResult] = useState<any>(null);
//   const [symptoms, setSymptoms] = useState<string[]>([]);
//   const [medicines, setMedicines] = useState<Array<{ name: string; dose: string; note: string }>>([]);
//   const [now, setNow] = useState("");

//   useEffect(() => {
//     const p = localStorage.getItem("patient");
//     const r = localStorage.getItem("triageResult");
//     const s = localStorage.getItem("selectedSymptoms");
//     const m = localStorage.getItem("prescribedMedicines");
//     if (p) setPatient(JSON.parse(p));
//     if (r) setResult(JSON.parse(r));
//     if (s) setSymptoms(JSON.parse(s));
//     if (m) setMedicines(JSON.parse(m));
//     const d = new Date();
//     setNow(d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) + " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
//   }, []);

//   const urgencyColor = result ? { RED: C.red, YELLOW: C.yellow, GREEN: C.green }[result.urgency as string] : C.green;
//   const urgencyBg = result ? { RED: "#FDEDED", YELLOW: "#FEF9E7", GREEN: "#E8F8EF" }[result.urgency as string] : "#E8F8EF";

//   const handlePrint = () => window.print();

//   return (
//     <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
//       <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
//         {/* Nav */}
//         <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
//           <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: "none", fontSize: 18, cursor: "pointer" }}>←</button>
//           <div style={{ flex: 1 }}>
//             <div style={{ fontSize: 15, fontWeight: 700 }}>Medical Report</div>
//             <div style={{ fontSize: 11, color: C.muted }}>SehatSetu AI Health Report</div>
//           </div>
//           <button onClick={handlePrint} style={{ padding: "8px 14px", borderRadius: 10, background: C.primary, border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
//             🖨️ Print
//           </button>
//         </div>

//         <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px" }} id="report-content">

//           {/* Header */}
//           <div style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, borderRadius: 16, padding: 16, marginBottom: 14, textAlign: "center" }}>
//             <div style={{ fontSize: 24 }}>🏥</div>
//             <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginTop: 4 }}>SehatSetu</div>
//             <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>AI-Powered Health Report</div>
//             <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 4 }}>{now}</div>
//           </div>

//           {/* Patient Info */}
//           <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${C.border}` }}>
//             <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>👤 Patient Information</div>
//             {[
//               { label: "Name", val: patient?.name || "—" },
//               { label: "Age", val: patient?.age ? `${patient.age} years` : "—" },
//               { label: "Village / City", val: patient?.village || "—" },
//               { label: "Phone", val: patient?.phone || "—" },
//               { label: "Gender", val: patient?.gender || "—" },
//               { label: "Known Conditions", val: Array.isArray(patient?.conditions) ? patient.conditions.join(", ") : patient?.conditions || "None" },
//               { label: "Blood Group", val: patient?.bloodGroup || "—" },
//             ].map((row, i) => (
//               <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 6 ? `1px solid ${C.border}` : "none" }}>
//                 <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{row.label}</span>
//                 <span style={{ fontSize: 12, color: C.text, fontWeight: 700, textAlign: "right", maxWidth: "55%" }}>{row.val}</span>
//               </div>
//             ))}
//           </div>

//           {/* Triage Result */}
//           {result && (
//             <div style={{ background: urgencyBg, borderRadius: 16, padding: 14, marginBottom: 12, border: `2px solid ${urgencyColor}` }}>
//               <div style={{ fontSize: 12, fontWeight: 800, color: urgencyColor, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>
//                 🤖 AI Triage Result
//               </div>
//               <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
//                 <div style={{ padding: "6px 16px", borderRadius: 20, background: urgencyColor, color: "white", fontSize: 14, fontWeight: 800 }}>
//                   {result.urgency === "RED" ? "🔴" : result.urgency === "YELLOW" ? "🟡" : "🟢"} {result.urgency}
//                 </div>
//                 <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{result.conditionEn}</div>
//               </div>
//               <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6, fontStyle: "italic" }}>{result.summary}</div>
//             </div>
//           )}

//           {/* Symptoms */}
//           <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${C.border}` }}>
//             <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>🩺 Reported Symptoms</div>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//               {symptoms.length === 0 && <span style={{ fontSize: 12, color: C.muted }}>No symptoms recorded</span>}
//               {symptoms.map(id => {
//                 const s = SYMPTOMS_MAP[id];
//                 if (!s) return null;
//                 return (
//                   <span key={id} style={{ background: "#EBF4FD", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, color: C.primary }}>
//                     {s.emoji} {s.en}
//                   </span>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Medicines */}
//           <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `2px solid ${C.green}` }}>
//             <div style={{ fontSize: 12, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>💊 Medicines Prescribed by AI</div>
//             {medicines.length === 0 && <span style={{ fontSize: 12, color: C.muted }}>No medicines prescribed</span>}
//             {medicines.map((med, i) => (
//               <div key={i} style={{ padding: "10px 0", borderBottom: i < medicines.length - 1 ? `1px solid ${C.border}` : "none" }}>
//                 <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>💊 {med.name}</div>
//                 <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, marginTop: 3 }}>📋 Dosage: {med.dose}</div>
//                 <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>⚠️ {med.note}</div>
//               </div>
//             ))}
//             <div style={{ background: "#FEF9E7", borderRadius: 8, padding: "8px 10px", marginTop: 10, fontSize: 11, color: "#7D6608" }}>
//               ⚠️ These are AI suggestions only. Please consult a qualified doctor before taking any medication.
//             </div>
//           </div>

//           {/* Doctor recommendation */}
//           {result && (
//             <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${C.border}` }}>
//               <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>👨‍⚕️ Doctor Recommendation</div>
//               {[
//                 { label: "Specialist", val: result.docType?.en },
//                 { label: "Consult Within", val: result.wait?.en },
//                 { label: "Contagious", val: result.contagious?.en },
//                 { label: "Emergency", val: result.emergency ? "YES — Call 108 immediately" : "No" },
//               ].map((row, i) => (
//                 <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
//                   <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{row.label}</span>
//                   <span style={{ fontSize: 12, fontWeight: 700, color: row.label === "Emergency" && result.emergency ? C.red : C.text }}>{row.val}</span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Footer */}
//           <div style={{ textAlign: "center", padding: "10px 0", fontSize: 11, color: C.muted }}>
//             Generated by SehatSetu AI · {now}<br />
//             This report is for informational purposes only.<br />
//             Always consult a qualified medical professional.
//           </div>
//         </div>

//         {/* Bottom */}
//         <div style={{ position: "fixed", bottom: 0, width: 390, background: C.card, borderTop: `2px solid ${C.border}`, padding: "10px 16px", display: "flex", gap: 8, zIndex: 50 }}>
//           <button onClick={() => router.push("/medicine")} style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: `linear-gradient(135deg,#27AE60,#1E8449)`, color: "white" }}>
//             💊 Find Medicine
//           </button>
//           <button onClick={handlePrint} style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "white" }}>
//             🖨️ Print Report
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



//-------------------------------------new claude ke bhaje se =------------------------------////




// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// const C = { primary: "#1B6CA8", primaryDark: "#0F4C7A", green: "#1E8449", red: "#C0392B", yellow: "#F39C12", bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC" };

// const SYMPTOMS_MAP: Record<string, { emoji: string; en: string }> = {
//   fever: { emoji: "🌡️", en: "Fever" }, chest: { emoji: "💔", en: "Chest Pain" },
//   breath: { emoji: "😮‍💨", en: "Breathlessness" }, cough: { emoji: "😮", en: "Cough" },
//   cold: { emoji: "🤧", en: "Cold" }, headache: { emoji: "🤕", en: "Headache" },
//   vomit: { emoji: "🤢", en: "Vomiting" }, diarrhea: { emoji: "💧", en: "Diarrhea" },
//   rash: { emoji: "🔴", en: "Skin Rash" }, pain: { emoji: "🦴", en: "Joint Pain" },
//   weakness: { emoji: "😴", en: "Weakness" }, stomach: { emoji: "😣", en: "Stomach Pain" },
//   eyes: { emoji: "👁️", en: "Eye Problem" }, back: { emoji: "🔙", en: "Back Pain" },
//   dizzy: { emoji: "💫", en: "Dizziness" }, swelling: { emoji: "🦵", en: "Swelling" },
//   chills: { emoji: "🥶", en: "Chills" }, body_ache: { emoji: "🤸", en: "Body Ache" },
//   sweat: { emoji: "💦", en: "Sweating" }, urine_burn: { emoji: "🔥", en: "Burning Urination" },
//   nausea: { emoji: "😰", en: "Nausea" }, unconscious: { emoji: "😵", en: "Unconsciousness" },
//   seizure: { emoji: "⚡", en: "Seizures" }, bleed: { emoji: "🩸", en: "Bleeding" },
// };

// export default function ReportPage() {
//   const router = useRouter();
//   const [patient, setPatient] = useState<any>(null);
//   const [result, setResult] = useState<any>(null);
//   const [symptoms, setSymptoms] = useState<string[]>([]);
//   const [medicines, setMedicines] = useState<Array<{ name: string; dose: string; note: string }>>([]);
//   const [now, setNow] = useState("");

//   useEffect(() => {
//     const p = localStorage.getItem("patient");
//     const r = localStorage.getItem("triageResult");
//     const s = localStorage.getItem("selectedSymptoms");
//     const m = localStorage.getItem("prescribedMedicines");
//     if (p) setPatient(JSON.parse(p));
//     if (r) setResult(JSON.parse(r));
//     if (s) setSymptoms(JSON.parse(s));
//     if (m) setMedicines(JSON.parse(m));
//     const d = new Date();
//     setNow(d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) + " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
//   }, []);

//   const urgencyColor = result ? { RED: C.red, YELLOW: C.yellow, GREEN: C.green }[result.urgency as string] : C.green;
//   const urgencyBg = result ? { RED: "#FDEDED", YELLOW: "#FEF9E7", GREEN: "#E8F8EF" }[result.urgency as string] : "#E8F8EF";

//   const handlePrint = () => window.print();

//   return (
//     <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
//       <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
//         {/* Nav */}
//         <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
//           <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: "none", fontSize: 18, cursor: "pointer" }}>←</button>
//           <div style={{ flex: 1 }}>
//             <div style={{ fontSize: 15, fontWeight: 700 }}>Medical Report</div>
//             <div style={{ fontSize: 11, color: C.muted }}>AAROGYA.AI AI Health Report</div>
//           </div>
//           <button onClick={handlePrint} style={{ padding: "8px 14px", borderRadius: 10, background: C.primary, border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
//             🖨️ Print
//           </button>
//         </div>

//         <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px" }} id="report-content">

//           {/* Header */}
//           <div style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, borderRadius: 16, padding: 16, marginBottom: 14, textAlign: "center" }}>
//             <div style={{ fontSize: 24 }}>🏥</div>
//             <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginTop: 4 }}>AAROGYA.AI</div>
//             <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>AI-Powered Health Report</div>
//             <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", marginTop: 4 }}>{now}</div>
//           </div>

//           {/* Patient Info */}
//           <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${C.border}` }}>
//             <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>👤 Patient Information</div>
//             {[
//               { label: "Name", val: patient?.name || "—" },
//               { label: "Age", val: patient?.age ? `${patient.age} years` : "—" },
//               { label: "Village / City", val: patient?.village || "—" },
//               { label: "Phone", val: patient?.phone || "—" },
//               { label: "Gender", val: patient?.gender || "—" },
//               { label: "Known Conditions", val: Array.isArray(patient?.conditions) ? patient.conditions.join(", ") : patient?.conditions || "None" },
//               { label: "Blood Group", val: patient?.bloodGroup || "—" },
//             ].map((row, i) => (
//               <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 6 ? `1px solid ${C.border}` : "none" }}>
//                 <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{row.label}</span>
//                 <span style={{ fontSize: 12, color: C.text, fontWeight: 700, textAlign: "right", maxWidth: "55%" }}>{row.val}</span>
//               </div>
//             ))}
//           </div>

//           {/* Triage Result */}
//           {result && (
//             <div style={{ background: urgencyBg, borderRadius: 16, padding: 14, marginBottom: 12, border: `2px solid ${urgencyColor}` }}>
//               <div style={{ fontSize: 12, fontWeight: 800, color: urgencyColor, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>
//                 🤖 AI Triage Result
//               </div>
//               <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
//                 <div style={{ padding: "6px 16px", borderRadius: 20, background: urgencyColor, color: "white", fontSize: 14, fontWeight: 800 }}>
//                   {result.urgency === "RED" ? "🔴" : result.urgency === "YELLOW" ? "🟡" : "🟢"} {result.urgency}
//                 </div>
//                 <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{result.conditionEn}</div>
//               </div>
//               <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6, fontStyle: "italic" }}>{result.summary}</div>
//             </div>
//           )}

//           {/* Symptoms */}
//           <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${C.border}` }}>
//             <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>🩺 Reported Symptoms</div>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//               {symptoms.length === 0 && <span style={{ fontSize: 12, color: C.muted }}>No symptoms recorded</span>}
//               {symptoms.map(id => {
//                 const s = SYMPTOMS_MAP[id];
//                 if (!s) return null;
//                 return (
//                   <span key={id} style={{ background: "#EBF4FD", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, color: C.primary }}>
//                     {s.emoji} {s.en}
//                   </span>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Medicines */}
//           <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `2px solid ${C.green}` }}>
//             <div style={{ fontSize: 12, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>💊 Medicines Prescribed by AI</div>
//             {medicines.length === 0 && <span style={{ fontSize: 12, color: C.muted }}>No medicines prescribed</span>}
//             {medicines.map((med, i) => (
//               <div key={i} style={{ padding: "10px 0", borderBottom: i < medicines.length - 1 ? `1px solid ${C.border}` : "none" }}>
//                 <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>💊 {med.name}</div>
//                 <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, marginTop: 3 }}>📋 Dosage: {med.dose}</div>
//                 <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>⚠️ {med.note}</div>
//               </div>
//             ))}
//             <div style={{ background: "#FEF9E7", borderRadius: 8, padding: "8px 10px", marginTop: 10, fontSize: 11, color: "#7D6608" }}>
//               ⚠️ These are AI suggestions only. Please consult a qualified doctor before taking any medication.
//             </div>
//           </div>

//           {/* Doctor recommendation */}
//           {result && (
//             <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${C.border}` }}>
//               <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: .8, marginBottom: 10 }}>👨‍⚕️ Doctor Recommendation</div>
//               {[
//                 { label: "Specialist", val: result.docType?.en },
//                 { label: "Consult Within", val: result.wait?.en },
//                 { label: "Contagious", val: result.contagious?.en },
//                 { label: "Emergency", val: result.emergency ? "YES — Call 108 immediately" : "No" },
//               ].map((row, i) => (
//                 <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
//                   <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{row.label}</span>
//                   <span style={{ fontSize: 12, fontWeight: 700, color: row.label === "Emergency" && result.emergency ? C.red : C.text }}>{row.val}</span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Footer */}
//           <div style={{ textAlign: "center", padding: "10px 0", fontSize: 11, color: C.muted }}>
//             Generated by AAROGYA.AI AI · {now}<br />
//             This report is for informational purposes only.<br />
//             Always consult a qualified medical professional.
//           </div>
//         </div>

//         {/* Bottom */}
//         <div style={{ position: "fixed", bottom: 0, width: 390, background: C.card, borderTop: `2px solid ${C.border}`, padding: "10px 16px", display: "flex", gap: 8, zIndex: 50 }}>
//           <button onClick={() => router.push("/medicine")} style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: `linear-gradient(135deg,#27AE60,#1E8449)`, color: "white" }}>
//             💊 Find Medicine
//           </button>
//           <button onClick={handlePrint} style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "white" }}>
//             🖨️ Print Report
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



//-------------------------------------new claude ke bhaje se =------------------------------////




"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { TriageResult } from "@/lib/triage";

const C = { primary: "#1B6CA8", primaryDark: "#0F4C7A", green: "#1E8449", red: "#C0392B", yellow: "#F39C12", bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC" };

interface Patient { name: string; age: string; village: string; phone: string; gender?: string; conditions?: string; bloodGroup?: string; }
interface Medicine { name: string; dose: string; note: string; }

const SYMPTOMS_MAP: Record<string, { emoji: string; hi: string; en: string }> = {
  fever: { emoji: "🌡️", hi: "बुखार", en: "Fever" },
  chest: { emoji: "💔", hi: "सीने में दर्द", en: "Chest Pain" },
  breath: { emoji: "😮‍💨", hi: "सांस में तकलीफ", en: "Breathless" },
  cough: { emoji: "😮", hi: "खांसी", en: "Cough" },
  cold: { emoji: "🤧", hi: "जुकाम", en: "Cold" },
  headache: { emoji: "🤕", hi: "सिरदर्द", en: "Headache" },
  vomit: { emoji: "🤢", hi: "उल्टी", en: "Vomiting" },
  diarrhea: { emoji: "💧", hi: "दस्त", en: "Diarrhea" },
  rash: { emoji: "🔴", hi: "दाने", en: "Skin Rash" },
  pain: { emoji: "🦴", hi: "जोड़ों में दर्द", en: "Joint Pain" },
  weakness: { emoji: "😴", hi: "कमज़ोरी", en: "Weakness" },
  stomach: { emoji: "😣", hi: "पेट में दर्द", en: "Stomach Pain" },
  eyes: { emoji: "👁️", hi: "आँखों में जलन", en: "Eye Pain" },
  back: { emoji: "🔙", hi: "कमर दर्द", en: "Back Pain" },
  dizzy: { emoji: "💫", hi: "चक्कर", en: "Dizziness" },
  swelling: { emoji: "🦵", hi: "सूजन", en: "Swelling" },
};

const URG_BG: Record<string, string> = {
  RED: "linear-gradient(135deg,#922B21,#C0392B)",
  YELLOW: "linear-gradient(135deg,#B7770D,#E67E22)",
  GREEN: "linear-gradient(135deg,#1A6B3A,#27AE60)",
};
const URG_COLOR: Record<string, string> = { RED: "#C0392B", YELLOW: "#F39C12", GREEN: "#1E8449" };

export default function ReportPage() {
  const router = useRouter();
  const [lang, setLang] = useState("hi");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [reportDate] = useState(() => new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }));

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "hi");
    try { const p = localStorage.getItem("patient"); if (p) setPatient(JSON.parse(p)); } catch { /* ignore */ }
    try { const r = localStorage.getItem("triageResult"); if (r) setResult(JSON.parse(r)); } catch { /* ignore */ }
    try { const m = localStorage.getItem("prescribedMedicines"); if (m) setMedicines(JSON.parse(m)); } catch { /* ignore */ }
    try { const s = localStorage.getItem("selectedSymptoms"); if (s) setSymptoms(JSON.parse(s)); } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  const t = (hi: string, en: string) => lang === "hi" ? hi : en;

  if (!hydrated) return null;

  if (!result) {
    return (
      <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{t("कोई रिपोर्ट नहीं मिली", "No Report Found")}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>{t("पहले लक्षण जाँच करें", "Please complete a symptom check first")}</div>
          <button onClick={() => router.push("/symptoms")}
            style={{ marginTop: 24, padding: "14px 28px", borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "white" }}>
            🩺 {t("लक्षण जाँचें", "Check Symptoms")}
          </button>
        </div>
      </div>
    );
  }

  const urgColor = URG_COLOR[result.urgency] || C.green;

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ background: URG_BG[result.urgency] || URG_BG.GREEN, padding: "44px 16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.2)", border: "none", fontSize: 18, cursor: "pointer", color: "white" }}>←</button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>{t("स्वास्थ्य रिपोर्ट", "Health Report")}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>{reportDate}</div>
            </div>
            <button onClick={() => window.print()}
              style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "rgba(255,255,255,.2)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              🖨️ {t("प्रिंट", "Print")}
            </button>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 30, fontSize: 16, fontWeight: 800, color: "white", background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.4)" }}>
            {result.urgency === "RED" ? "🔴" : result.urgency === "YELLOW" ? "🟡" : "🟢"} {result.urgency} — {lang === "hi" ? result.conditionHi : result.conditionEn}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 100px" }}>

          {/* Patient */}
          <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>👤 {t("मरीज़ की जानकारी", "Patient Details")}</div>
            {patient ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
                {[
                  { l: t("नाम", "Name"), v: patient.name },
                  { l: t("उम्र", "Age"), v: `${patient.age} ${t("वर्ष", "yrs")}` },
                  { l: t("गाँव", "Village"), v: patient.village },
                  { l: t("फ़ोन", "Phone"), v: patient.phone },
                  ...(patient.gender ? [{ l: t("लिंग", "Gender"), v: patient.gender }] : []),
                  ...(patient.bloodGroup ? [{ l: t("ब्लड ग्रुप", "Blood Group"), v: patient.bloodGroup }] : []),
                  ...(patient.conditions ? [{ l: t("मौजूदा बीमारी", "Conditions"), v: patient.conditions }] : []),
                ].map((row, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{row.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 2 }}>{row.v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: C.muted }}>{t("मरीज़ की जानकारी नहीं मिली", "Patient info not available")}</div>
            )}
          </div>

          {/* Symptoms */}
          <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>🩺 {t("लक्षण", "Symptoms Reported")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {symptoms.map(id => {
                const s = SYMPTOMS_MAP[id];
                if (!s) return null;
                return <span key={id} style={{ background: "#EBF4FD", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: C.primary }}>{s.emoji} {lang === "hi" ? s.hi : s.en}</span>;
              })}
              {symptoms.length === 0 && <span style={{ fontSize: 13, color: C.muted }}>{t("लक्षण नहीं मिले", "No symptoms recorded")}</span>}
            </div>
          </div>

          {/* AI Diagnosis */}
          <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${C.border}`, borderLeft: `4px solid ${urgColor}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>🤖 {t("AI निदान", "AI Diagnosis")}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: urgColor }}>{lang === "hi" ? result.conditionHi : result.conditionEn}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{lang === "hi" ? result.conditionEn : result.conditionHi}</div>
            {result.summary && (
              <div style={{ marginTop: 10, background: C.bg, borderRadius: 10, padding: "10px 12px", fontSize: 13, color: C.text, lineHeight: 1.6, fontStyle: "italic" }}>{result.summary}</div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {[
                { l: t("डॉक्टर", "Doctor"), v: lang === "hi" ? result.docType.hi : result.docType.en },
                { l: t("प्रतीक्षा", "Wait"), v: lang === "hi" ? result.wait.hi : result.wait.en, red: result.urgency === "RED" },
                { l: t("संक्रामक?", "Contagious?"), v: lang === "hi" ? result.contagious.hi : result.contagious.en },
              ].map((info, i) => (
                <div key={i} style={{ flex: 1, background: C.bg, borderRadius: 10, padding: 10, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 9, color: C.muted, fontWeight: 600, textTransform: "uppercase" }}>{info.l}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: info.red ? C.red : C.text, marginTop: 3 }}>{info.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Medicines */}
          <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>💊 {t("निर्धारित दवाएं", "Prescribed Medicines")}</div>
            {medicines.length > 0 ? medicines.map((med, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < medicines.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E8F8EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💊</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{med.name}</div>
                  <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, marginTop: 2 }}>{med.dose}</div>
                  {med.note && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" }}>{med.note}</div>}
                </div>
              </div>
            )) : (
              <div style={{ fontSize: 13, color: C.muted }}>{t("कोई दवा निर्धारित नहीं", "No medicines prescribed")}</div>
            )}
          </div>

          {/* Do Now */}
          <div style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 12, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>✅ {t("अभी यह करें", "Do This Now")}</div>
            {result.doNow.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: i < result.doNow.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.primary, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{lang === "hi" ? item.hi : item.en}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{lang === "hi" ? item.en : item.hi}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Doctor rec */}
          <div style={{ background: result.urgency === "RED" ? "#FDEDED" : "#E8F8EF", borderRadius: 16, padding: 14, border: `1px solid ${result.urgency === "RED" ? "#F1948A" : "#A9DFBF"}`, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: result.urgency === "RED" ? C.red : C.green, marginBottom: 4 }}>
              {result.urgency === "RED" ? "🚨 " : "🏥 "}{lang === "hi" ? result.docType.hi : result.docType.en}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>{t("अनुशंसित प्रतीक्षा समय:", "Recommended wait time:")} <strong>{lang === "hi" ? result.wait.hi : result.wait.en}</strong></div>
            {result.emergency && (
              <a href="tel:108" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10, background: "linear-gradient(135deg,#E74C3C,#922B21)", color: "white", padding: "12px", borderRadius: 12, textDecoration: "none", fontWeight: 800, fontSize: 14 }}>
                📞 {t("108 पर कॉल करें — आपातकाल", "Call 108 — Emergency")}
              </a>
            )}
          </div>

          {/* Disclaimer */}
          <div style={{ background: "#FEF9E7", borderRadius: 12, padding: 12, border: "1px solid #F4D03F" }}>
            <div style={{ fontSize: 11, color: "#7D6608", lineHeight: 1.5 }}>
              ⚠️ {t("यह रिपोर्ट AI द्वारा तैयार की गई है। यह डॉक्टर की सलाह का विकल्प नहीं है।", "This report is AI-generated and is not a substitute for professional medical advice.")}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{ position: "fixed", bottom: 0, width: 390, background: C.card, borderTop: `2px solid ${C.border}`, padding: "10px 16px", display: "flex", gap: 8, zIndex: 50 }}>
          <button onClick={() => router.push("/confirm")} style={{ flex: 1, padding: 12, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "white" }}>
            📅 {t("डॉक्टर बुक करें", "Book Doctor")}
          </button>
          <button onClick={() => router.push("/medicine")} style={{ flex: 1, padding: 12, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: "linear-gradient(135deg,#27AE60,#1E8449)", color: "white" }}>
            💊 {t("दवाई खोजें", "Find Medicine")}
          </button>
        </div>
      </div>
    </div>
  );
}






