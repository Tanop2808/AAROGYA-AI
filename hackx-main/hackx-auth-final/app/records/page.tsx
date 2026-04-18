"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { getDB, seedOfflineData } from "@/lib/db-offline";

const C = {
  primary: "#1B6CA8", primaryDark: "#0F4C7A", green: "#1E8449",
  red: "#C0392B", yellow: "#D68910", bg: "#F0F4F8",
  card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC",
};

interface Consultation {
  _id: string;
  symptoms: string[];
  urgency: "RED" | "YELLOW" | "GREEN";
  triageResult: any;
  status: "pending" | "in-review" | "completed";
  doctorNotes?: string;
  prescription?: string;
  doctorName?: string;
  hospital?: string;
  slot?: string;
  queueNo?: string;
  uploadedRecords?: any[];
  createdAt: string;
}

interface PatientInfo {
  name: string;
  gender: string;
  age: number | string;
  phone: string;
  bloodGroup: string;
  condition: string;
}

const urgencyConfig: Record<string, { label: string; color: string; bg: string }> = {
  RED:    { label: "Emergency",       color: "#C0392B", bg: "#FDEDEC" },
  YELLOW: { label: "Needs Attention", color: "#D68910", bg: "#FEF9E7" },
  GREEN:  { label: "Routine",         color: "#1E8449", bg: "#EAFAF1" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
}

function getTitle(c: Consultation): string {
  if (c.triageResult?.conditionEn) return c.triageResult.conditionEn;
  if (c.symptoms?.length) {
    const s = c.symptoms.join(", ");
    const cfg = urgencyConfig[c.urgency];
    return cfg ? `${s.charAt(0).toUpperCase() + s.slice(1)} — ${cfg.label}` : s;
  }
  return "Consultation";
}

function generatePDF(patient: PatientInfo, consultations: Consultation[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 0;
  let pageNum = 1;

  const addHeader = () => {
    y = 0;
    // Top contact bar
    doc.setFillColor(245, 248, 250);
    doc.rect(0, 0, pageWidth, 18, "F");
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Aarogya AI Healthcare | contact@aarogyaai.org | www.aarogyaai.org | +91-1800-XXX-XXXX", pageWidth / 2, 11, { align: "center" });

    // Main header with logo
    doc.setFillColor(27, 108, 168);
    doc.rect(0, 18, pageWidth, 22, "F");

    // Logo circle
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 8, 29, 7, "F");
    doc.setFontSize(11);
    doc.setTextColor(27, 108, 168);
    doc.text("AA", margin + 8, 32, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("AAROGYA AI", margin + 20, 28);
    
    doc.setFontSize(9);
    doc.setTextColor(200, 220, 240);
    doc.text("AI-Powered Rural Healthcare Initiative", margin + 20, 35);

    // Report title on right
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("CLINICAL HANDOFF REPORT", pageWidth - margin, 28, { align: "right" });
    
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 240);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, pageWidth - margin, 35, { align: "right" });

    // Page number
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(`Page ${pageNum}`, pageWidth - margin, 14, { align: "right" });

    y = 48;
  };

  const addFooter = () => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text("Aarogya AI Clinical Handoff Report | Confidential Medical Document | Authorized Personnel Only", pageWidth / 2, pageHeight - 15, { align: "center" });
    doc.text(`Page ${pageNum} | Generated on ${new Date().toLocaleDateString("en-IN")}`, pageWidth / 2, pageHeight - 11, { align: "center" });
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 30) {
      addFooter();
      doc.addPage();
      pageNum++;
      addHeader();
    }
  };

  const drawSectionHeader = (title: string, sectionNum: string) => {
    doc.setFontSize(11);
    doc.setTextColor(27, 108, 168);
    doc.setFillColor(235, 244, 253);
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
    doc.text(`${sectionNum} ${title}`, margin + 4, y + 6);
    y += 12;
  };

  const drawSubsectionHeader = (title: string, num: string) => {
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "bold");
    doc.text(`${num} ${title}`, margin + 2, y);
    y += 7;
    doc.setFont("helvetica", "normal");
  };

  const drawField = (label: string, value: string, indent: number = 0) => {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${label}:`, margin + indent, y);
    
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(value || "N/A", margin + indent + 45, y);
    doc.setFont("helvetica", "normal");
    y += 6;
  };

  // ==================== COVER PAGE ====================
  // Centered title
  doc.setFillColor(27, 108, 168);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  
  doc.setFillColor(255, 255, 255);
  doc.circle(pageWidth / 2, pageHeight / 2 - 40, 25, "F");
  doc.setFontSize(24);
  doc.setTextColor(27, 108, 168);
  doc.text("AA", pageWidth / 2, pageHeight / 2 - 35, { align: "center" });
  
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text("AAROGYA AI", pageWidth / 2, pageHeight / 2 + 5, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(200, 220, 240);
  doc.text("Clinical Handoff Report", pageWidth / 2, pageHeight / 2 + 18, { align: "center" });
  
  doc.setFontSize(11);
  doc.setTextColor(180, 200, 220);
  doc.text("Confidential Medical Document", pageWidth / 2, pageHeight / 2 + 28, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(150, 170, 190);
  doc.text(`Patient: ${patient.name}`, pageWidth / 2, pageHeight / 2 + 45, { align: "center" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, pageWidth / 2, pageHeight / 2 + 53, { align: "center" });
  doc.text(`Report ID: AAR-${Date.now()}`, pageWidth / 2, pageHeight / 2 + 61, { align: "center" });

  doc.addPage();
  pageNum++;

  // ==================== MAIN CONTENT ====================
  addHeader();

  // SECTION I: PATIENT INFORMATION
  drawSectionHeader("Patient Information", "I.");

  // 1. Demographics
  drawSubsectionHeader("Demographics", "1.");
  
  doc.setFillColor(250, 252, 255);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, "F");
  y += 5;
  
  drawField("Patient Name", patient.name, margin + 5);
  drawField("Age", `${patient.age} years`, margin + 5);
  drawField("Gender", patient.gender, margin + 5);
  drawField("Phone", patient.phone, margin + 5);
  drawField("Blood Group", patient.bloodGroup, margin + 5);
  y += 5;

  // 2. Medical History
  drawSubsectionHeader("Medical History", "2.");
  
  doc.setFillColor(250, 252, 255);
  doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "F");
  y += 5;
  
  drawField("Medical Condition", patient.condition, margin + 5);
  y += 5;

  // Total consultations note
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Total Consultations on Record: ${consultations.length}`, margin + 5, y);
  y += 10;

  // SECTION II: CURRENT STATUS & CONSULTATION HISTORY
  checkPageBreak(60);
  drawSectionHeader("Current Status & Consultation History", "II.");

  consultations.forEach((c, idx) => {
    const cfg = urgencyConfig[c.urgency] || urgencyConfig.GREEN;

    checkPageBreak(80);

    // Consultation header box
    doc.setFillColor(cfg.bg);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "F");
    
    doc.setFontSize(11);
    doc.setTextColor(27, 108, 168);
    doc.setFont("helvetica", "bold");
    doc.text(`Consultation #${idx + 1}`, margin + 5, y + 7);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(c.createdAt), pageWidth - margin - 40, y + 7);
    
    // Urgency badge
    doc.setFillColor(cfg.color);
    doc.roundedRect(pageWidth - margin - 35, y + 3, 30, 10, 1, 1, "F");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(cfg.label, pageWidth - margin - 20, y + 9, { align: "center" });
    doc.setFont("helvetica", "normal");
    
    y += 20;

    // 1. Chief Complaints / Symptoms
    if (c.symptoms && c.symptoms.length > 0) {
      drawSubsectionHeader("Chief Complaints / Symptoms", `${idx + 1}.1`);
      
      doc.setFillColor(255, 250, 240);
      doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");
      y += 5;
      
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      const symptomsText = c.symptoms.join(", ");
      const symptomLines = doc.splitTextToSize(`• ${symptomsText}`, contentWidth - 10);
      doc.text(symptomLines, margin + 5, y);
      y += symptomLines.length * 5 + 6;
    }

    // 2. Appointment Details
    if (c.doctorName || c.hospital || c.slot) {
      checkPageBreak(30);
      drawSubsectionHeader("Appointment Details", `${idx + 1}.2`);
      
      doc.setFillColor(250, 252, 255);
      doc.roundedRect(margin, y, contentWidth, c.queueNo ? 22 : 17, 2, 2, "F");
      y += 5;
      
      if (c.doctorName) drawField("Doctor", `Dr. ${c.doctorName}`, margin + 5);
      if (c.hospital) drawField("Hospital", c.hospital, margin + 5);
      if (c.slot) drawField("Time", `${c.slot}${c.queueNo ? ` | Queue No: #${c.queueNo}` : ""}`, margin + 5);
      y += 5;
    }

    // 3. AI Triage Analysis
    if (c.triageResult) {
      checkPageBreak(30);
      drawSubsectionHeader("AI Triage Analysis", `${idx + 1}.3`);
      
      doc.setFillColor(250, 250, 255);
      doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "F");
      y += 5;
      
      if (c.triageResult.conditionEn) drawField("Condition", c.triageResult.conditionEn, margin + 5);
      if (c.triageResult.urgency) drawField("Urgency Level", c.triageResult.urgency, margin + 5);
      y += 5;
    }

    // 4. Attached Medical Records
    if (c.uploadedRecords && c.uploadedRecords.length > 0) {
      checkPageBreak(40);
      drawSubsectionHeader("Attached Medical Records", `${idx + 1}.4`);
      
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Number of Records: ${c.uploadedRecords.length}`, margin + 5, y);
      y += 6;
      
      const imgSize = 22;
      const imgGap = 5;
      let imgX = margin + 5;
      let imgRow = 0;

      for (let i = 0; i < Math.min(c.uploadedRecords.length, 8); i++) {
        const rec = c.uploadedRecords[i];
        if (rec && rec.dataUrl) {
          try {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.2);
            doc.rect(imgX, y + imgRow * (imgSize + imgGap), imgSize, imgSize);
            doc.addImage(rec.dataUrl, "JPEG", imgX + 1, y + 1 + imgRow * (imgSize + imgGap), imgSize - 2, imgSize - 2);

            if ((i + 1) % 5 === 0) {
              imgX = margin + 5;
              imgRow++;
            } else {
              imgX += imgSize + imgGap;
            }
          } catch (e) {}
        }
      }

      const totalRows = Math.ceil(Math.min(c.uploadedRecords.length, 8) / 5);
      y += totalRows * (imgSize + imgGap) + 8;
    }

    // 5. Doctor's Diagnosis
    if (c.doctorNotes) {
      checkPageBreak(35);
      drawSubsectionHeader("Doctor's Diagnosis & Notes", `${idx + 1}.${c.uploadedRecords?.length ? "5" : "4"}`);
      
      doc.setFillColor(253, 245, 245);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "F");
      y += 5;
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const notesLines = doc.splitTextToSize(c.doctorNotes, contentWidth - 10);
      doc.text(notesLines, margin + 5, y);
      y += notesLines.length * 5 + 8;
    }

    // 6. Prescription / Treatment
    if (c.prescription) {
      checkPageBreak(35);
      drawSubsectionHeader("Prescription / Treatment", `${idx + 1}.${c.doctorNotes ? "6" : c.uploadedRecords?.length ? "5" : "4"}`);
      
      doc.setFillColor(245, 255, 245);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "F");
      y += 5;
      
      doc.setFontSize(9);
      doc.setTextColor(50, 80, 50);
      const rxLines = doc.splitTextToSize(c.prescription, contentWidth - 10);
      doc.text(rxLines, margin + 5, y);
      y += rxLines.length * 5 + 8;
    }

    // Status
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const statusText = c.status === "completed" ? "✓ Completed" : c.status === "in-review" ? "◐ Under Review" : "○ Pending";
    doc.text(`Status: ${statusText}`, margin + 5, y);
    y += 10;

    // Divider between consultations
    if (idx < consultations.length - 1) {
      doc.setDrawColor(220, 225, 230);
      doc.setLineWidth(0.4);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margin + 10, y, pageWidth - margin - 10, y);
      doc.setLineDashPattern([], 0);
      y += 8;
    }
  });

  // ==================== SIGNATURE SECTION ====================
  checkPageBreak(50);
  y = pageHeight - 65;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  
  // First signature line
  doc.line(margin + 10, y + 12, margin + 80, y + 12);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Attending Physician Signature", margin + 45, y + 18, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Date & Stamp", margin + 45, y + 23, { align: "center" });

  // Second signature line
  doc.line(pageWidth - margin - 80, y + 12, pageWidth - margin - 10, y + 12);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Authorized by Aarogya AI Healthcare", pageWidth - margin - 45, y + 18, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Official Seal", pageWidth - margin - 45, y + 23, { align: "center" });

  // Disclaimer
  y += 32;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "F");
  
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  const disclaimerText = "This Clinical Handoff Report is a confidential medical document prepared by Aarogya AI Healthcare System. " +
    "It contains protected health information (PHI) and is intended solely for authorized healthcare professionals. " +
    "If you have received this document in error, please notify the issuing facility immediately.";
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 10);
  doc.text(disclaimerLines, margin + 5, y + 6);

  addFooter();

  // Save with professional filename
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`ClinicalHandoff_${patient.name.replace(/\s+/g, "_")}_${dateStr}.pdf`);
}

export default function RecordsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isOnline } = useOnlineStatus();
  const [lang, setLang] = useState("hi");
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "hi");
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || fetched) return;
    const identifier = (session?.user as any)?.phone || session?.user?.name || "";
    if (!identifier) return;

    setFetched(true);
    setFetching(true);

    // Seed offline data on first visit
    if (typeof window !== "undefined") {
      seedOfflineData().catch(console.error);
    }

    // If offline, load from IndexedDB
    if (!isOnline) {
      console.log("📡 Offline mode — loading records from IndexedDB");
      setIsOfflineMode(true);

      getDB()
        .consultations.toArray()
        .then((offlineRecords) => {
          // Convert IndexedDB format to Consultation interface
          const converted: Consultation[] = offlineRecords.map((rec) => ({
            _id: `offline-${rec.id}`,
            symptoms: rec.symptoms || [],
            urgency: rec.urgency,
            triageResult: typeof rec.triageResult === "string" ? JSON.parse(rec.triageResult) : rec.triageResult,
            status: "pending",
            createdAt: rec.createdAt instanceof Date ? rec.createdAt.toISOString() : String(rec.createdAt),
          }));

          setConsultations(converted);
          setFetching(false);
        })
        .catch((err) => {
          console.error("Failed to load offline records:", err);
          setFetching(false);
        });
      return;
    }

    // If online, fetch from server AND cache in IndexedDB
    fetch(`/api/consultations/my?identifier=${encodeURIComponent(identifier)}`)
      .then((res) => res.json())
      .then(async (data) => {
        const consultations = data.consultations || [];
        setConsultations(consultations);

        // Cache in IndexedDB for offline use
        if (typeof window !== "undefined" && consultations.length > 0) {
          try {
            const db = getDB();
            for (const c of consultations) {
              // Check if already exists
              const existing = await db.consultations
                .where("patientPhone")
                .equals(identifier)
                .first();

              if (!existing) {
                await db.consultations.add({
                  patientPhone: identifier,
                  patientName: (session?.user as any)?.name || "",
                  symptoms: c.symptoms || [],
                  urgency: c.urgency,
                  triageResult: JSON.stringify(c.triageResult || {}),
                  createdAt: new Date(c.createdAt),
                  needsSync: false,
                });
              }
            }
          } catch (err) {
            console.error("Failed to cache records:", err);
          }
        }
      })
      .catch(() => {
        const local = localStorage.getItem("myConsultations");
        if (local) setConsultations(JSON.parse(local));
      })
      .finally(() => setFetching(false));
  }, [status, isOnline]);

  if (status === "loading") {
    return (
      <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontSize: 20, color: "white" }}>⏳ Loading...</div>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user as any;

  const patient: PatientInfo = {
    name: user.name || "Patient",
    gender: user.gender === "female" ? t("महिला", "Female") : t("पुरुष", "Male"),
    age: user.age || "—",
    phone: user.phone || "—",
    bloodGroup: user.bloodGroup || "—",
    condition: user.conditions?.split(",")[0] || "—",
  };

  const handleDownloadAll = () => {
    setDownloading(true);
    setTimeout(() => {
      generatePDF(patient, consultations);
      setDownloading(false);
    }, 300);
  };

  const statusLabel: Record<string, string> = {
    pending:    t("⏳ डॉक्टर से जवाब का इंतज़ार", "⏳ Awaiting doctor response"),
    "in-review": t("👨‍⚕️ समीक्षा हो रही है", "👨‍⚕️ Doctor is reviewing"),
    completed:  t("✅ पूर्ण", "✅ Completed"),
  };

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; font-family: 'Outfit', 'Segoe UI', sans-serif; }
        .rec-card { transition: box-shadow 0.18s, transform 0.18s; }
        .rec-card:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,0,0,0.09) !important; }
        .rec-pill { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; background:#EBF4FD; color:${C.primary}; margin-right:5px; margin-bottom:3px; }
        .rec-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; font-size:13px; fontWeight:700; cursor:pointer; border:none; transition:opacity 0.15s, transform 0.1s; }
        .rec-btn:hover { opacity:0.85; transform:scale(0.98); }
        .rec-btn:active { transform:scale(0.96); }
        .rec-expand-row { cursor:pointer; }
        .rec-expand-row:hover .rec-chevron { color: ${C.primary}; }
      `}</style>

      <div style={{ width: 420, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {isOfflineMode ? (
          <div style={{ background: "#FEF9E7", padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#B7770D", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F39C12" }} />
            {t("ऑफलाइन — डिवाइस से रिकॉर्ड", "Offline — Records from device")}
          </div>
        ) : (
          <div style={{ background: "#E8F8EF", padding: "6px 16px", fontSize: 12, fontWeight: 700, color: C.green, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
            {t("लाइव डेटा — डेटाबेस से", "Live Data — from database")}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => router.push("/home")} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: "none", fontSize: 18, cursor: "pointer" }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{t("मेरे स्वास्थ्य रिकॉर्ड", "My Health Records")}</div>
            <div style={{ fontSize: 11, color: C.muted }}>My Health Records</div>
          </div>
          {consultations.length > 0 && (
            <button className="rec-btn" onClick={handleDownloadAll} disabled={downloading} style={{ background: C.primary, color: "#fff", fontSize: 12, padding: "7px 12px" }}>
              {downloading ? "⏳" : "📄"} {downloading ? t("तैयार हो रहा है...", "Preparing...") : t("डाउनलोड PDF", "Download PDF")}
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ background: "linear-gradient(135deg,#EBF4FD,#DDEEFF)", padding: "16px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "white", flexShrink: 0 }}>
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{patient.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                  {patient.gender} · {patient.age} {t("वर्ष", "years")} {user.phone ? `· 📱 ${user.phone}` : ""}
                </div>
              </div>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", gap: 10 }}>
              {[
                { v: patient.bloodGroup, l: t("रक्त समूह", "Blood Group") },
                { v: patient.age,        l: t("उम्र", "Age") },
                { v: patient.condition,  l: t("स्थिति", "Condition") },
              ].map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", padding: 10, background: C.bg, borderRadius: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{d.v}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{d.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>
              {t("पिछली विज़िट", "Past Consultations")}
            </span>
            {consultations.length > 0 && (
              <span style={{ background: C.primary, color: "white", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>
                {consultations.length}
              </span>
            )}
          </div>

          {fetching ? (
            <div style={{ textAlign: "center", padding: 32, color: C.muted }}>
              ⏳ {t("लोड हो रहा है...", "Loading records...")}
            </div>
          ) : consultations.length === 0 ? (
            <div style={{ background: C.card, borderRadius: 16, padding: 28, textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>🩺</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{t("कोई रिकॉर्ड नहीं", "No records yet")}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{t("लक्षण जाँचें और डॉक्टर बुक करें", "Check symptoms and book a doctor")}</div>
              <button className="rec-btn" onClick={() => router.push("/symptoms")} style={{ marginTop: 16, background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "white" }}>
                🩺 {t("लक्षण जाँचें", "Check Symptoms")}
              </button>
            </div>
          ) : (
            consultations.map((c, i) => {
              const cfg = urgencyConfig[c.urgency] || urgencyConfig.GREEN;
              const title = getTitle(c);
              const isOpen = expanded === (c._id || String(i));
              const cardId = c._id || String(i);

              return (
                <div key={cardId} className="rec-card" style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, borderLeft: `4px solid ${cfg.color}`, marginBottom: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                  <div className="rec-expand-row" onClick={() => setExpanded(isOpen ? null : cardId)} style={{ padding: "14px 14px 12px" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color, marginTop: 5, flexShrink: 0, boxShadow: `0 0 7px ${cfg.color}70` }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{title}</span>
                          <span style={{ background: cfg.bg, color: cfg.color, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                            {cfg.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{formatDate(c.createdAt)}</div>
                        <div style={{ marginTop: 6 }}>
                          {(c.symptoms || []).slice(0, 4).map((s) => (
                            <span key={s} className="rec-pill">{s}</span>
                          ))}
                        </div>
                        {(c.doctorName || c.slot) && (
                          <div style={{ fontSize: 11, color: C.primary, marginTop: 6 }}>
                            {c.doctorName && `🏥 ${c.doctorName}`}
                            {c.slot && ` · 🕐 ${c.slot}`}
                            {c.queueNo && ` · #${c.queueNo}`}
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
                          <span style={{ fontSize: 12, color: c.status === "completed" ? C.green : cfg.color, fontStyle: "italic" }}>
                            {statusLabel[c.status] || c.status}
                          </span>
                          <span className="rec-chevron" style={{ marginLeft: "auto", fontSize: 11, color: C.muted, fontWeight: 600 }}>
                            {isOpen ? "▲ Hide" : "▼ View Report"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ padding: "0 14px 16px", borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                      {(c.doctorName || c.hospital || c.slot || c.queueNo) && (
                        <div style={{ background: "linear-gradient(135deg, #EBF4FD, #DDEEFF)", borderRadius: 12, padding: "12px 14px", marginBottom: 12, border: `1px solid ${C.primary}30` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <span style={{ fontSize: 14 }}>📅</span>
                            <span style={{ fontWeight: 700, fontSize: 11, color: C.primary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              {t("अपॉइंटमेंट बुक", "Appointment Booked")}
                            </span>
                          </div>
                          {c.doctorName && <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>🏥 {t("डॉक्टर", "Doctor")}: {c.doctorName}</div>}
                          {c.hospital && <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>🏩 {t("अस्पताल", "Hospital")}: {c.hospital}</div>}
                          {c.slot && <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>🕐 {t("समय", "Time")}: {c.slot}{c.queueNo && ` · ${t("कतार No.", "Queue No.")} #${c.queueNo}`}</div>}
                        </div>
                      )}

                      {c.uploadedRecords && c.uploadedRecords.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <span style={{ fontSize: 14 }}>📎</span>
                            <span style={{ fontWeight: 700, fontSize: 11, color: C.text, textTransform: "uppercase" }}>
                              {t("अपलोड रिकॉर्ड", "Uploaded Records")} ({c.uploadedRecords.length})
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {c.uploadedRecords.map((rec: any, idx: number) => (
                              rec.dataUrl ? (
                                <div key={idx}>
                                  <img src={rec.dataUrl} alt={rec.name || "record"} style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.border}` }} />
                                </div>
                              ) : null
                            ))}
                          </div>
                        </div>
                      )}

                      {c.symptoms && c.symptoms.length > 0 && (
                        <div style={{ background: "#FEF9E7", borderRadius: 10, padding: "10px 14px", marginBottom: 12, border: "1px solid #F4D03F" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 14 }}>🤒</span>
                            <span style={{ fontWeight: 700, fontSize: 11, color: "#7D6608", textTransform: "uppercase" }}>{t("लक्षण", "Symptoms")}</span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {c.symptoms.map((s) => (
                              <span key={s} style={{ background: "#FFF9E6", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#7D6608" }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {c.doctorNotes ? (
                        <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", marginBottom: 12, border: `1px solid ${C.border}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 14 }}>🩺</span>
                            <span style={{ fontWeight: 700, fontSize: 11, color: C.text, textTransform: "uppercase" }}>{t("डॉक्टर नोट्स", "Doctor Notes")}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>{c.doctorNotes}</p>
                        </div>
                      ) : (
                        <div style={{ background: "#FAFAFA", borderRadius: 10, padding: "10px 14px", marginBottom: 12, border: `1px solid ${C.border}`, fontSize: 12, color: C.muted, fontStyle: "italic" }}>
                          🩺 {t("डॉक्टर के नोट्स अभी उपलब्ध नहीं", "Doctor notes not yet available")}
                        </div>
                      )}

                      {c.prescription ? (
                        <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "1px solid #BBF7D0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 14 }}>💊</span>
                            <span style={{ fontWeight: 700, fontSize: 11, color: "#166534", textTransform: "uppercase" }}>{t("नुस्खा", "Prescription")}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: "#166534", lineHeight: 1.7, whiteSpace: "pre-line" }}>{c.prescription}</p>
                        </div>
                      ) : (
                        <div style={{ background: "#FAFAFA", borderRadius: 10, padding: "10px 14px", marginBottom: 14, border: `1px solid ${C.border}`, fontSize: 12, color: C.muted, fontStyle: "italic" }}>
                          💊 {t("अभी कोई नुस्खा नहीं", "No prescription yet")}
                        </div>
                      )}

                      <button className="rec-btn" onClick={() => generatePDF(patient, [c])} style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, width: "100%", justifyContent: "center" }}>
                        📄 {t("PDF डाउनलोड करें", "Download PDF")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}