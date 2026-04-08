"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  prescription?: string;   // plain string from DB
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

// ─── Urgency config ───────────────────────────────────────────────────────────
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

// ─── Derive a human-readable title from triage result or symptoms ─────────────
function getTitle(c: Consultation): string {
  if (c.triageResult?.conditionEn) return c.triageResult.conditionEn;
  if (c.symptoms?.length) {
    const s = c.symptoms.join(", ");
    const cfg = urgencyConfig[c.urgency];
    return cfg ? `${s.charAt(0).toUpperCase() + s.slice(1)} — ${cfg.label}` : s;
  }
  return "Consultation";
}

// ─── HTML generation for download ─────────────────────────────────────────────
function generateHTML(patient: PatientInfo, consultations: Consultation[]): string {
  const rows = consultations
    .map((c) => {
      const cfg = urgencyConfig[c.urgency] || urgencyConfig.GREEN;
      const title = getTitle(c);
      return `
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:20px;border-left:4px solid ${cfg.color}">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
          <span style="width:10px;height:10px;border-radius:50%;background:${cfg.color};display:inline-block;flex-shrink:0"></span>
          <h3 style="margin:0;font-size:16px;color:#111;flex:1">${title}</h3>
          <span style="background:${cfg.bg};color:${cfg.color};padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700">${cfg.label}</span>
        </div>
        <p style="margin:0 0 10px;color:#6b7280;font-size:13px">${formatDate(c.createdAt)}</p>
        <div style="margin-bottom:10px">
          ${(c.symptoms || []).map((s) => `<span style="background:#f3f4f6;padding:2px 10px;border-radius:20px;font-size:12px;margin-right:6px;display:inline-block;margin-bottom:4px">${s}</span>`).join("")}
        </div>
        ${c.doctorNotes ? `
          <div style="background:#f8fafc;border-radius:8px;padding:12px;margin-bottom:12px;border:1px solid #e5e7eb">
            <strong style="font-size:12px;color:#374151;text-transform:uppercase;letter-spacing:0.5px">🩺 Doctor Notes</strong>
            <p style="margin:6px 0 0;font-size:13px;color:#4b5563;line-height:1.6">${c.doctorNotes}</p>
          </div>` : ""}
        ${c.prescription ? `
          <div style="background:#f0fdf4;border-radius:8px;padding:12px;border:1px solid #bbf7d0">
            <strong style="font-size:12px;color:#166534;text-transform:uppercase;letter-spacing:0.5px">💊 Prescription</strong>
            <p style="margin:6px 0 0;font-size:13px;color:#166534;line-height:1.6;white-space:pre-line">${c.prescription}</p>
          </div>` : ""}
        <p style="margin:10px 0 0;font-size:12px;color:#6b7280;font-style:italic">Status: ${c.status}</p>
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Health Records - ${patient.name}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #111; background: #f9fafb; }
    @media print { body { background: #fff; } }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #e5e7eb">
    <h1 style="margin:0;font-size:24px;color:#1B6CA8">🏥 My Health Records</h1>
    <p style="color:#6b7280;margin:4px 0 0;font-size:13px">Official Medical Record — HackX Health System</p>
  </div>
  <div style="background:#EBF4FD;border-radius:12px;padding:20px;margin-bottom:30px;border:1px solid #BFDBFE">
    <div style="display:flex;align-items:center;gap:14px">
      <div style="width:52px;height:52px;border-radius:50%;background:#1B6CA8;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:white;flex-shrink:0">
        ${patient.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <div style="font-size:20px;font-weight:800">${patient.name}</div>
        <div style="color:#6b7280;font-size:13px;margin-top:2px">${patient.gender} · ${patient.age} yrs · 📱 ${patient.phone}</div>
      </div>
    </div>
    <div style="display:flex;gap:16px;margin-top:14px">
      <div style="text-align:center;background:rgba(255,255,255,0.7);padding:10px 16px;border-radius:10px;flex:1">
        <div style="font-size:18px;font-weight:800">${patient.bloodGroup}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px">Blood Group</div>
      </div>
      <div style="text-align:center;background:rgba(255,255,255,0.7);padding:10px 16px;border-radius:10px;flex:1">
        <div style="font-size:18px;font-weight:800">${patient.age}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px">Age</div>
      </div>
      <div style="text-align:center;background:rgba(255,255,255,0.7);padding:10px 16px;border-radius:10px;flex:1">
        <div style="font-size:18px;font-weight:800">${patient.condition || "—"}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px">Condition</div>
      </div>
    </div>
  </div>
  <h2 style="font-size:15px;margin-bottom:16px;color:#111">📋 Past Consultations (${consultations.length})</h2>
  ${rows}
  <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb">
    Generated on ${new Date().toLocaleString("en-IN")} · HackX Health System
  </p>
</body>
</html>`;
}

function triggerDownload(html: string, filename: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RecordsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [lang, setLang] = useState("hi");
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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

    fetch(`/api/consultations/my?identifier=${encodeURIComponent(identifier)}`)
      .then((res) => res.json())
      .then((data) => setConsultations(data.consultations || []))
      .catch(() => {
        const local = localStorage.getItem("myConsultations");
        if (local) setConsultations(JSON.parse(local));
      })
      .finally(() => setFetching(false));
  }, [status]);

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
      const html = generateHTML(patient, consultations);
      triggerDownload(html, `health-records-${patient.name.toLowerCase().replace(/\s+/g, "-")}.html`);
      setDownloading(false);
    }, 300);
  };

  const handleDownloadOne = (c: Consultation) => {
    const title = getTitle(c).replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
    const html = generateHTML(patient, [c]);
    triggerDownload(html, `record-${title}.html`);
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
        .rec-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; border:none; transition:opacity 0.15s, transform 0.1s; }
        .rec-btn:hover { opacity:0.85; transform:scale(0.98); }
        .rec-btn:active { transform:scale(0.96); }
        .rec-expand-row { cursor:pointer; }
        .rec-expand-row:hover .rec-chevron { color: ${C.primary}; }
      `}</style>

      <div style={{ width: 420, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Live indicator */}
        <div style={{ background: "#E8F8EF", padding: "6px 16px", fontSize: 12, fontWeight: 700, color: C.green, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          {t("लाइव डेटा — डेटाबेस से", "Live Data — from database")}
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => router.push("/home")} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: "none", fontSize: 18, cursor: "pointer" }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{t("मेरे स्वास्थ्य रिकॉर्ड", "My Health Records")}</div>
            <div style={{ fontSize: 11, color: C.muted }}>My Health Records</div>
          </div>
          {consultations.length > 0 && (
            <button
              className="rec-btn"
              onClick={handleDownloadAll}
              disabled={downloading}
              style={{ background: C.primary, color: "#fff", fontSize: 12, padding: "7px 12px" }}
            >
              {downloading ? "⏳" : "⬇️"} {downloading ? t("तैयार हो रहा है...", "Preparing...") : t("सब डाउनलोड करें", "Download All")}
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

          {/* Profile card */}
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

          {/* Consultations header */}
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

          {/* States */}
          {fetching ? (
            <div style={{ textAlign: "center", padding: 32, color: C.muted }}>
              ⏳ {t("लोड हो रहा है...", "Loading records...")}
            </div>
          ) : consultations.length === 0 ? (
            <div style={{ background: C.card, borderRadius: 16, padding: 28, textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>🩺</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{t("कोई रिकॉर्ड नहीं", "No records yet")}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{t("लक्षण जाँचें और डॉक्टर बुक करें", "Check symptoms and book a doctor")}</div>
              <button
                className="rec-btn"
                onClick={() => router.push("/symptoms")}
                style={{ marginTop: 16, background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "white" }}
              >
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
                <div
                  key={cardId}
                  className="rec-card"
                  style={{
                    background: C.card,
                    borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    borderLeft: `4px solid ${cfg.color}`,
                    marginBottom: 10,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                  }}
                >
                  {/* Card header — tappable to expand */}
                  <div
                    className="rec-expand-row"
                    onClick={() => setExpanded(isOpen ? null : cardId)}
                    style={{ padding: "14px 14px 12px" }}
                  >
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

                  {/* Expanded report section */}
                  {isOpen && (
                    <div style={{ padding: "0 14px 16px", borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>

                      {/* Doctor Notes */}
                      {c.doctorNotes ? (
                        <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", marginBottom: 12, border: `1px solid ${C.border}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 14 }}>🩺</span>
                            <span style={{ fontWeight: 700, fontSize: 11, color: C.text, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              {t("डॉक्टर नोट्स", "Doctor Notes")}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>{c.doctorNotes}</p>
                        </div>
                      ) : (
                        <div style={{ background: "#FAFAFA", borderRadius: 10, padding: "10px 14px", marginBottom: 12, border: `1px solid ${C.border}`, fontSize: 12, color: C.muted, fontStyle: "italic" }}>
                          🩺 {t("डॉक्टर के नोट्स अभी उपलब्ध नहीं", "Doctor notes not yet available")}
                        </div>
                      )}

                      {/* Prescription */}
                      {c.prescription ? (
                        <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "12px 14px", marginBottom: 14, border: "1px solid #BBF7D0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 14 }}>💊</span>
                            <span style={{ fontWeight: 700, fontSize: 11, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              {t("नुस्खा", "Prescription")}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: "#166534", lineHeight: 1.7, whiteSpace: "pre-line" }}>{c.prescription}</p>
                        </div>
                      ) : (
                        <div style={{ background: "#FAFAFA", borderRadius: 10, padding: "10px 14px", marginBottom: 14, border: `1px solid ${C.border}`, fontSize: 12, color: C.muted, fontStyle: "italic" }}>
                          💊 {t("अभी कोई नुस्खा नहीं", "No prescription yet")}
                        </div>
                      )}

                      {/* Download single record */}
                      <button
                        className="rec-btn"
                        onClick={() => handleDownloadOne(c)}
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, width: "100%", justifyContent: "center" }}
                      >
                        ⬇️ {t("यह रिकॉर्ड डाउनलोड करें", "Download this Report")}
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
