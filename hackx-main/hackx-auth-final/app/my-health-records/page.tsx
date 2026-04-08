"use client";

import { useState } from "react";

interface Prescription {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Consultation {
  _id: string;
  title: string;
  createdAt: string;
  symptoms: string[];
  urgency: "RED" | "YELLOW" | "GREEN";
  status: string;
  doctorNotes?: string;
  prescription?: Prescription[];
}

interface Patient {
  name: string;
  gender: string;
  age: number;
  phone: string;
  bloodGroup: string;
  condition: string;
}

const mockPatient: Patient = {
  name: "Tanishq",
  gender: "Male",
  age: 21,
  phone: "7900011247",
  bloodGroup: "B+",
  condition: "BP",
};

const mockConsultations: Consultation[] = [
  {
    _id: "1",
    title: "Unconsciousness — Emergency",
    createdAt: "2026-03-26T14:43:00Z",
    symptoms: ["fever", "unconscious", "sweat"],
    urgency: "RED",
    status: "completed",
    doctorNotes:
      "Patient was unresponsive on arrival. Vitals stabilised after IV fluids. Monitor BP every 2 hours.",
    prescription: [
      { medicine: "Paracetamol 500mg", dosage: "1 tablet", frequency: "Twice daily", duration: "5 days" },
      { medicine: "ORS Sachet", dosage: "1 sachet", frequency: "After each loose stool", duration: "3 days" },
    ],
  },
  {
    _id: "2",
    title: "Fever — Needs Attention",
    createdAt: "2026-03-26T14:00:00Z",
    symptoms: ["fever"],
    urgency: "YELLOW",
    status: "completed",
    doctorNotes: "Mild fever 101°F. Advised rest and hydration. Follow up if temperature rises.",
    prescription: [
      { medicine: "Dolo 650mg", dosage: "1 tablet", frequency: "Every 6 hours", duration: "3 days" },
    ],
  },
];

const urgencyConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  RED:    { label: "Emergency",       color: "#EF4444", bg: "#FEF2F2", dot: "#EF4444" },
  YELLOW: { label: "Needs Attention", color: "#F59E0B", bg: "#FFFBEB", dot: "#F59E0B" },
  GREEN:  { label: "Routine",         color: "#10B981", bg: "#ECFDF5", dot: "#10B981" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
}

function generateHTML(patient: Patient, consultations: Consultation[]): string {
  const rows = consultations
    .map((c) => {
      const cfg = urgencyConfig[c.urgency] || urgencyConfig.GREEN;
      const prescRows = (c.prescription || [])
        .map(
          (p) =>
            `<tr><td style="padding:6px 10px;border-bottom:1px solid #f0f0f0">${p.medicine}</td><td style="padding:6px 10px;border-bottom:1px solid #f0f0f0">${p.dosage}</td><td style="padding:6px 10px;border-bottom:1px solid #f0f0f0">${p.frequency}</td><td style="padding:6px 10px;border-bottom:1px solid #f0f0f0">${p.duration}</td></tr>`
        )
        .join("");
      return `
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;border-left:4px solid ${cfg.color}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="width:10px;height:10px;border-radius:50%;background:${cfg.dot};display:inline-block"></span>
          <h3 style="margin:0;font-size:16px;color:#111">${c.title}</h3>
          <span style="margin-left:auto;background:${cfg.bg};color:${cfg.color};padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600">${cfg.label}</span>
        </div>
        <p style="margin:0 0 10px;color:#6b7280;font-size:13px">${formatDate(c.createdAt)}</p>
        <div style="margin-bottom:10px">${(c.symptoms || []).map((s) => `<span style="background:#f3f4f6;padding:2px 10px;border-radius:20px;font-size:12px;margin-right:6px">${s}</span>`).join("")}</div>
        ${c.doctorNotes ? `<div style="background:#f8fafc;border-radius:8px;padding:12px;margin-bottom:12px"><strong style="font-size:12px;color:#374151">Doctor Notes</strong><p style="margin:4px 0 0;font-size:13px;color:#4b5563">${c.doctorNotes}</p></div>` : ""}
        ${
          c.prescription?.length
            ? `<strong style="font-size:12px;color:#374151">Prescription</strong>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:13px">
          <thead><tr style="background:#f3f4f6"><th style="padding:6px 10px;text-align:left">Medicine</th><th style="padding:6px 10px;text-align:left">Dosage</th><th style="padding:6px 10px;text-align:left">Frequency</th><th style="padding:6px 10px;text-align:left">Duration</th></tr></thead>
          <tbody>${prescRows}</tbody>
        </table>`
            : ""
        }
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Health Records - ${patient.name}</title></head><body style="font-family:sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#111">
    <div style="text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #e5e7eb">
      <h1 style="margin:0;font-size:24px;color:#1d4ed8">🏥 My Health Records</h1>
      <p style="color:#6b7280;margin:4px 0 0">Official Medical Record</p>
    </div>
    <div style="background:#eff6ff;border-radius:12px;padding:20px;margin-bottom:30px">
      <div><strong style="font-size:20px">${patient.name}</strong><br><span style="color:#6b7280">${patient.gender} · ${patient.age} yrs · 📱 ${patient.phone}</span></div>
      <div style="display:flex;gap:20px;margin-top:12px">
        <div style="text-align:center"><strong style="font-size:18px">${patient.bloodGroup}</strong><br><small style="color:#6b7280">Blood Group</small></div>
        <div style="text-align:center"><strong style="font-size:18px">${patient.age}</strong><br><small style="color:#6b7280">Age</small></div>
        <div style="text-align:center"><strong style="font-size:18px">${patient.condition}</strong><br><small style="color:#6b7280">Condition</small></div>
      </div>
    </div>
    <h2 style="font-size:16px;margin-bottom:16px">📋 Past Consultations (${consultations.length})</h2>
    ${rows}
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:30px">Generated on ${new Date().toLocaleString("en-IN")} · HackX Health System</p>
  </body></html>`;
}

function downloadRecord(patient: Patient, consultations: Consultation[]): void {
  const html = generateHTML(patient, consultations);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `health-records-${patient.name.toLowerCase()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadSingleRecord(patient: Patient, consultation: Consultation): void {
  const html = generateHTML(patient, [consultation]);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `record-${consultation.title.replace(/\s+/g, "-").toLowerCase()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MyHealthRecordsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadAll = (): void => {
    setDownloading(true);
    setTimeout(() => {
      downloadRecord(mockPatient, mockConsultations);
      setDownloading(false);
    }, 400);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 50%, #f0fdf4 100%)",
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
        paddingBottom: 40,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .hrc-card { transition: all 0.2s ease; }
        .hrc-card:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(0,0,0,0.08) !important; }
        .hrc-pill { display:inline-flex; align-items:center; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:500; background:#f1f5f9; color:#475569; margin-right:6px; margin-bottom:4px; }
        .hrc-dl-btn { display:flex; align-items:center; gap:6px; padding:7px 14px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all 0.15s; }
        .hrc-dl-btn:hover { opacity:0.85; transform:scale(0.98); }
        .hrc-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:0.3px; }
        .hrc-presc-table { width:100%; border-collapse:collapse; font-size:13px; margin-top:8px; }
        .hrc-presc-table th { background:#f8fafc; padding:8px 12px; text-align:left; font-weight:600; color:#374151; font-size:12px; }
        .hrc-presc-table td { padding:8px 12px; border-bottom:1px solid #f1f5f9; color:#4b5563; }
        .hrc-presc-table tr:last-child td { border-bottom:none; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
          padding: "20px 20px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -20, left: "40%", width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            🏥
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>My Health Records</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Medical History</div>
          </div>
          <button
            onClick={handleDownloadAll}
            disabled={downloading}
            style={{
              marginLeft: "auto",
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 10,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              backdropFilter: "blur(10px)",
            }}
          >
            {downloading ? "⏳" : "⬇️"} {downloading ? "Preparing..." : "Download All"}
          </button>
        </div>

        {/* Patient Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: 16,
            padding: "16px 18px",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: 14,
                background: "#1d4ed8",
                border: "2px solid rgba(255,255,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 700, color: "#fff",
              }}
            >
              {mockPatient.name[0]}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 20 }}>{mockPatient.name}</div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                {mockPatient.gender} · {mockPatient.age} years · 📱 {mockPatient.phone}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Blood Group", value: mockPatient.bloodGroup },
              { label: "Age", value: mockPatient.age },
              { label: "Condition", value: mockPatient.condition },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(255,255,255,0.12)", borderRadius: 10,
                  padding: "10px 12px", textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{item.value}</div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consultations */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>Past Consultations</span>
          <span
            style={{
              background: "#1d4ed8", color: "#fff", borderRadius: "50%",
              width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
            }}
          >
            {mockConsultations.length}
          </span>
        </div>

        {mockConsultations.map((c) => {
          const cfg = urgencyConfig[c.urgency] || urgencyConfig.GREEN;
          const isOpen = expanded === c._id;
          return (
            <div
              key={c._id}
              className="hrc-card"
              style={{
                background: "#fff", borderRadius: 16, marginBottom: 12,
                border: "1px solid #e5e7eb", borderLeft: `4px solid ${cfg.color}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)", overflow: "hidden",
              }}
            >
              <div
                onClick={() => setExpanded(isOpen ? null : c._id)}
                style={{ padding: "16px 16px 12px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div
                    style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: cfg.dot, marginTop: 5, flexShrink: 0,
                      boxShadow: `0 0 8px ${cfg.dot}60`,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{c.title}</span>
                      <span className="hrc-badge" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 3 }}>{formatDate(c.createdAt)}</div>
                    <div style={{ marginTop: 8 }}>
                      {c.symptoms.map((s) => (
                        <span key={s} className="hrc-pill">{s}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                      <span style={{ fontSize: 12 }}>✅</span>
                      <span style={{ color: "#10b981", fontSize: 12, fontWeight: 600, fontStyle: "italic" }}>Completed</span>
                      <span style={{ marginLeft: "auto", color: "#9ca3af", fontSize: 12 }}>
                        {isOpen ? "▲ Hide" : "▼ Details"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Section */}
              {isOpen && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                  {c.doctorNotes && (
                    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "1px solid #e5e7eb" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 13 }}>🩺</span>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Doctor Notes
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>{c.doctorNotes}</p>
                    </div>
                  )}

                  {c.prescription && c.prescription.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 13 }}>💊</span>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Prescription
                        </span>
                      </div>
                      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                        <table className="hrc-presc-table">
                          <thead>
                            <tr>
                              {["Medicine", "Dosage", "Frequency", "Duration"].map((h) => (
                                <th key={h}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {c.prescription.map((p, i) => (
                              <tr key={i}>
                                <td style={{ fontWeight: 600, color: "#111" }}>{p.medicine}</td>
                                <td>{p.dosage}</td>
                                <td>{p.frequency}</td>
                                <td>{p.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <button
                    className="hrc-dl-btn"
                    onClick={() => downloadSingleRecord(mockPatient, c)}
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}
                  >
                    ⬇️ Download this record
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
