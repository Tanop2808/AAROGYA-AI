"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useLang } from "@/lib/useLang";
import dynamic from "next/dynamic";
const VideoCallModal = dynamic(() => import("@/components/VideoCallModal"), { ssr: false });

const C = {
  primary: "#1B6CA8",
  primaryDark: "#0F4C7A",
  green: "#1E8449",
  greenLight: "#27AE60",
  red: "#C0392B",
  redLight: "#E74C3C",
  yellow: "#F39C12",
  bg: "#F0F4F8",
  card: "#FFFFFF",
  text: "#1A2332",
  muted: "#6B7C93",
  border: "#DDE3EC",
};

type Consultation = {
  _id: string;
  patientPhone: string;
  patientName: string;
  symptoms: string[];
  urgency: "RED" | "YELLOW" | "GREEN";
  triageResult: { summary?: string; aiSummary?: string };
  slot?: string;
  queueNo?: string;
  status: string;
  createdAt: string;
  uploadedRecords?: any[];
};

const PHARMACY_STOCK = [
  { name: "Paracetamol 500mg", qty: 320, min: 50, unit: "strips" },
  { name: "ORS Sachets", qty: 45, min: 100, unit: "pkts" },
  { name: "Amoxicillin 500mg", qty: 12, min: 30, unit: "strips" },
  { name: "Metformin 500mg", qty: 180, min: 40, unit: "strips" },
  { name: "Azithromycin 500mg", qty: 8, min: 20, unit: "strips" },
  { name: "Cetirizine 10mg", qty: 95, min: 30, unit: "strips" },
  { name: "Aspirin 75mg", qty: 60, min: 30, unit: "strips" },
  { name: "ORS (Electral)", qty: 22, min: 50, unit: "pkts" },
];

const BADGE: Record<string, object> = {
  RED: { background: "#FDEDED", color: C.red },
  YELLOW: { background: "#FEF9E7", color: "#B7770D" },
  GREEN: { background: "#E8F8EF", color: C.green },
};

const URGENCY_INITIAL: Record<string, string> = { RED: "R", YELLOW: "Y", GREEN: "G" };
const URGENCY_COLOR: Record<string, string> = { RED: C.red, YELLOW: "#B7770D", GREEN: C.green };
const URGENCY_BG: Record<string, string> = { RED: "#FDEDED", YELLOW: "#FEF9E7", GREEN: "#E8F8EF" };

type SOSAlert = { _id: string; village: string; description: string; affectedCount: number; ashaWorkerName: string; ashaWorkerPhone: string; createdAt: string; doctorNotes?: string; };

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { lang, setLang, mounted } = useLang();
  const [tick, setTick] = useState(30);
  const [activeTab, setActiveTab] = useState<"queue" | "pharmacy">("queue");
  const [queue, setQueue] = useState<Consultation[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [markingDone, setMarkingDone] = useState<string | null>(null);
  const [callPatient, setCallPatient] = useState<{ id: string; name: string } | null>(null);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [selectedSOS, setSelectedSOS] = useState<SOSAlert | null>(null);
  const [sosNote, setSosNote] = useState("");
  const [savingSOS, setSavingSOS] = useState(false);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/consultations?status=pending");
      const data = await res.json();
      setQueue(data.consultations || []);
    } catch {
      /* offline */
    }
    setLoadingQueue(false);
  }, []);

  const fetchSOS = useCallback(async () => {
    try {
      const res = await fetch("/api/sos");
      const data = await res.json();
      setSosAlerts(data.alerts || []);
    } catch { }
  }, []);

  useEffect(() => {
    fetchQueue();
    fetchSOS();
  }, [fetchQueue, fetchSOS]);

  useEffect(() => {
    const iv = setInterval(() => {
      setTick((t) => {
        if (t <= 1) {
          fetchQueue();
          fetchSOS();
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [fetchQueue]);

  const markDone = async (id: string) => {
    setMarkingDone(id);
    try {
      await fetch("/api/consultations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "completed" }),
      });
      setQueue((q) => q.filter((c) => c._id !== id));
    } catch {
      /* offline */
    }
    setMarkingDone(null);
  };

  const openSOSModal = (alert: SOSAlert) => {
    setSelectedSOS(alert);
    setSosNote(alert.doctorNotes || "");
  };

  const saveSOSNote = async () => {
    if (!selectedSOS) return;
    setSavingSOS(true);
    try {
      await fetch("/api/sos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedSOS._id, doctorNotes: sosNote }),
      });
      setSosAlerts((prev) => prev.map((a) => a._id === selectedSOS._id ? { ...a, doctorNotes: sosNote } : a));
      setSelectedSOS((prev) => prev ? { ...prev, doctorNotes: sosNote } : null);
    } catch { /* offline */ }
    setSavingSOS(false);
  };

  const resolveSOSAlert = async () => {
    if (!selectedSOS) return;
    setSavingSOS(true);
    try {
      await fetch("/api/sos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedSOS._id, status: "resolved", doctorNotes: sosNote }),
      });
      setSosAlerts((prev) => prev.filter((a) => a._id !== selectedSOS._id));
      setSelectedSOS(null);
    } catch { /* offline */ }
    setSavingSOS(false);
  };

  const acknowledgeSOSAlert = async () => {
    if (!selectedSOS) return;
    setSavingSOS(true);
    try {
      await fetch("/api/sos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedSOS._id, status: "acknowledged", doctorNotes: sosNote }),
      });
      setSosAlerts((prev) => prev.map((a) => a._id === selectedSOS._id ? { ...a, doctorNotes: sosNote } : a));
      setSelectedSOS(null);
    } catch { /* offline */ }
    setSavingSOS(false);
  };

  const redCount = queue.filter((p) => p.urgency === "RED").length;
  const yellowCount = queue.filter((p) => p.urgency === "YELLOW").length;
  const greenCount = queue.filter((p) => p.urgency === "GREEN").length;

  const T = (hi: string, en: string) => lang === "hi" ? hi : en;

  if (!mounted) return null;

  return (
    <>
      <div
        style={{
          background: "#0d1520",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 390,
            background: C.bg,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Status bar */}
          <div
            style={{
              background: "#E8F8EF",
              padding: "6px 16px",
              fontSize: 12,
              fontWeight: 700,
              color: C.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: C.green,
                  animation: "pulse 2s infinite",
                }}
              />
              {T("ऑनलाइन · स्वतः रीफ्रेश हो रहा है ", "Online · Auto-refreshing in ")}{tick}s
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => { const newLang = lang === "hi" ? "en" : "hi"; setLang(newLang); }} style={{ background: C.primary, border: "none", borderRadius: 12, padding: "4px 12px", fontSize: 11, fontWeight: 800, color: "white", cursor: "pointer" }}>
                {lang === "hi" ? "EN" : "हिं"}
              </button>
              <button
                onClick={() => router.push("/login")}
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "none",
                  borderRadius: 12,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.muted,
                  cursor: "pointer",
                }}
              >
                {T("लॉग आउट", "Logout")}
              </button>
            </div>
          </div>

          {/* Header */}
          <div style={{ background: "#1A2332", padding: "14px 16px" }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "white", margin: 0 }}>
              Dr. Arvind Kumar
            </h2>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 2 }}>
              {T("सामान्य चिकित्सक · नाभा सिविल अस्पताल", "General Physician · Nabha Civil Hospital")}
            </p>
          </div>

          {/* SOS banner — live from DB */}
          {sosAlerts.length > 0 && sosAlerts.map(alert => (
            <div key={alert._id}
              onClick={() => openSOSModal(alert)}
              style={{ background: `linear-gradient(135deg,${C.redLight},${C.red})`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            >
              <span style={{ fontSize: 18, animation: "shake .6s infinite", display: "inline-block" }}>🚨</span>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 12, fontWeight: 800, color: "white", margin: 0 }}>
                  SOS: {alert.village} — {T("ASHA अलर्ट", "ASHA Alert")}
                </h4>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.75)", margin: 0, marginTop: 1 }}>
                  {alert.ashaWorkerName} reports {alert.affectedCount} affected — {alert.description || "Emergency"}
                </p>
              </div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: 6 }}>
                Tap →
              </span>
            </div>
          ))}

          {/* Stats */}
          <div style={{ display: "flex" }}>
            {[
              { n: redCount, l: "🔴 RED", bg: "#FDEDED", c: C.red },
              { n: yellowCount, l: "🟡 YELLOW", bg: "#FEF9E7", c: "#B7770D" },
              { n: greenCount, l: "🟢 GREEN", bg: "#E8F8EF", c: C.green },
              { n: queue.length, l: `📋 ${T("कुल", "Total")}`, bg: C.bg, c: C.muted },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  textAlign: "center",
                  background: s.bg,
                  borderBottom: `2px solid ${C.border}`,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.n}</div>
                <div style={{ fontSize: 10, color: s.c, fontWeight: 700 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: C.card,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {[
              { id: "queue", l: T("मरीज़ों की कतार", "Patient Queue") },
              { id: "pharmacy", l: T("फार्मेसी स्टॉक", "Pharmacy Stock") },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  flex: 1,
                  padding: "11px 8px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  color: activeTab === tab.id ? C.primary : C.muted,
                  borderBottom:
                    activeTab === tab.id ? `3px solid ${C.primary}` : "3px solid transparent",
                }}
              >
                {tab.l}
              </button>
            ))}
          </div>

          {/* Queue Tab */}
          {activeTab === "queue" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px 16px" }}>
              {loadingQueue && (
                <div
                  style={{ textAlign: "center", padding: "30px 20px", color: C.muted }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                  <div style={{ fontSize: 13 }}>{T("कतार लोड हो रही है...", "Loading queue...")}</div>
                </div>
              )}
              {!loadingQueue && queue.length === 0 && (
                <div
                  style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}
                >
                  <div style={{ fontSize: 40 }}>✅</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 12 }}>
                    {T("कतार खाली है!", "Queue is clear!")}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>{T("कोई लंबित मरीज़ नहीं", "No pending patients")}</div>
                </div>
              )}
              {queue.map((p) => {
                const initial =
                  URGENCY_INITIAL[p.urgency] || p.patientName[0]?.toUpperCase() || "?";
                const avC = URGENCY_COLOR[p.urgency] || C.muted;
                const avBg = URGENCY_BG[p.urgency] || C.bg;
                const timeAgo = (() => {
                  const diff = Date.now() - new Date(p.createdAt).getTime();
                  const mins = Math.floor(diff / 60000);
                  if (mins < 60) return `${mins} min ago`;
                  return `${Math.floor(mins / 60)} hr ago`;
                })();
                const aiNote =
                  p.triageResult?.summary || p.triageResult?.aiSummary || "";
                return (
                  <div
                    key={p._id}
                    style={{
                      background: C.card,
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 10,
                      border: `1px solid ${C.border}`,
                      borderLeft: `4px solid ${avC}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: avBg,
                          border: `2px solid ${avC}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          fontWeight: 800,
                          color: avC,
                          flexShrink: 0,
                        }}
                      >
                        {initial}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800 }}>
                          {p.patientName}{" "}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "3px 8px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              ...BADGE[p.urgency],
                            }}
                          >
                            {p.urgency === "RED"
                              ? "🔴 RED"
                              : p.urgency === "YELLOW"
                                ? "🟡 YELLOW"
                                : "🟢 GREEN"}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                          📱 {p.patientPhone}
                          {p.slot ? ` · 🕐 ${p.slot}` : ""}
                          {p.queueNo ? ` · #${p.queueNo}` : ""}
                        </div>
                      </div>
                    </div>

                    {p.symptoms.length > 0 && (
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "8px 0" }}
                      >
                        {p.symptoms.slice(0, 4).map((sym, j) => (
                          <span
                            key={j}
                            style={{
                              background: C.bg,
                              borderRadius: 6,
                              padding: "3px 8px",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {sym}
                          </span>
                        ))}
                        {p.symptoms.length > 4 && (
                          <span
                            style={{
                              background: C.bg,
                              borderRadius: 6,
                              padding: "3px 8px",
                              fontSize: 11,
                              color: C.muted,
                            }}
                          >
                            +{p.symptoms.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {aiNote ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: C.muted,
                          fontStyle: "italic",
                          marginBottom: 8,
                        }}
                      >
                        🤖 {aiNote}
                      </div>
                    ) : null}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 11, color: C.muted }}>⏱️ {timeAgo} {p.uploadedRecords && p.uploadedRecords.length > 0 && "📎"}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => markDone(p._id)}
                          disabled={markingDone === p._id}
                          style={{
                            padding: "7px 12px",
                            borderRadius: 8,
                            border: "none",
                            background: "#E8F8EF",
                            color: C.green,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            opacity: markingDone === p._id ? 0.6 : 1,
                          }}
                        >
                          {markingDone === p._id ? "..." : `✓ ${T("पूर्ण", "Done")}`}
                        </button>
                        <button
                          onClick={() => setCallPatient({ id: p.patientPhone, name: p.patientName })}
                          style={{
                            padding: "7px 10px",
                            borderRadius: 8,
                            border: "none",
                            background: "#EBF4FD",
                            color: C.primary,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          📞 {T("कॉल", "Call")}
                        </button>
                        <button
                          onClick={() => router.push(`/doctor/consultation/${p._id}`)}
                          style={{
                            padding: "7px 12px",
                            borderRadius: 8,
                            border: "none",
                            background: C.primaryDark,
                            color: "white",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {T("खोलें", "Open")} →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pharmacy Tab */}
          {activeTab === "pharmacy" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px 16px" }}>
              <div
                style={{
                  background: "#EBF4FD",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                  border: "1px solid #AED6F1",
                  display: "flex",
                  gap: 8,
                }}
              >
                <span>💊</span>
                <p style={{ fontSize: 13, color: C.primary, fontWeight: 600, margin: 0 }}>
                  PHC Dispensary — Nabha Civil Hospital stock levels
                </p>
              </div>
              {PHARMACY_STOCK.map((item, i) => {
                const pct = Math.min(
                  100,
                  Math.round((item.qty / (item.min * 4)) * 100)
                );
                const low = item.qty < item.min;
                const critical = item.qty < item.min / 2;
                return (
                  <div
                    key={i}
                    style={{
                      background: C.card,
                      borderRadius: 14,
                      padding: 14,
                      marginBottom: 10,
                      border: `1px solid ${critical ? "#F1948A" : low ? "#F4D03F" : C.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                          {item.qty} {item.unit} · Min: {item.min}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: critical ? C.red : low ? "#B7770D" : C.green,
                          background: critical ? "#FDEDED" : low ? "#FEF9E7" : "#E8F8EF",
                          padding: "5px 10px",
                          borderRadius: 10,
                        }}
                      >
                        {critical ? "🔴 Critical" : low ? "🟡 Low" : "🟢 OK"}
                      </span>
                    </div>
                    <div
                      style={{
                        background: C.bg,
                        borderRadius: 4,
                        height: 8,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: critical ? C.red : low ? C.yellow : C.green,
                          borderRadius: 4,
                          transition: "width .3s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  background: "#FEF9E7",
                  borderRadius: 12,
                  padding: 12,
                  border: "1px solid #F4D03F",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "#7D6608" }}>
                  ⚠️ 3 items need restocking
                </div>
                <div style={{ fontSize: 12, color: "#7D6608", marginTop: 4 }}>
                  ORS Sachets, Amoxicillin, Azithromycin are below minimum levels
                </div>
              </div>
            </div>
          )}

          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-10deg)}75%{transform:rotate(10deg)}}`}</style>
        </div>
      </div>

      {callPatient && (
        <VideoCallModal
          isOpen={true}
          onClose={() => setCallPatient(null)}
          patientName={callPatient.name}
          patientId={callPatient.id}
          isDoctor={true}
        />
      )}

      {selectedSOS && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setSelectedSOS(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white", borderRadius: "20px 20px 0 0",
              padding: 20, width: "100%", maxWidth: 390,
              maxHeight: "80vh", overflowY: "auto",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.red }}>
                🚨 SOS: {selectedSOS.village}
              </h3>
              <button
                onClick={() => setSelectedSOS(null)}
                style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {/* ASHA Worker Info */}
            <div style={{ background: "#FDEDED", borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.red }}>{selectedSOS.ashaWorkerName}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>📱 {selectedSOS.ashaWorkerPhone}</div>
                </div>
                <span style={{
                  background: C.red, color: "white", borderRadius: 20,
                  padding: "4px 10px", fontSize: 12, fontWeight: 700,
                }}>
                  {selectedSOS.affectedCount} affected
                </span>
              </div>
              <div style={{
                fontSize: 13, color: C.text, marginTop: 10,
                background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "8px 10px",
              }}>
                {selectedSOS.description}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
                {(() => {
                  const diff = Date.now() - new Date(selectedSOS.createdAt).getTime();
                  const mins = Math.floor(diff / 60000);
                  return "🕐 " + (mins < 60 ? mins + " min ago" : Math.floor(mins / 60) + " hr ago");
                })()}
              </div>
            </div>

            {/* Existing note preview if any */}
            {selectedSOS.doctorNotes && (
              <div style={{
                background: "#EBF4FD", borderRadius: 10, padding: "8px 12px",
                marginBottom: 12, fontSize: 12, color: C.primary,
                borderLeft: "3px solid " + C.primary,
              }}>
                <span style={{ fontWeight: 700 }}>Previous note: </span>{selectedSOS.doctorNotes}
              </div>
            )}

            {/* Doctor Notes Input */}
            <label style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "block", marginBottom: 6 }}>
              📝 Doctor Notes
            </label>
            <textarea
              value={sosNote}
              onChange={(e) => setSosNote(e.target.value)}
              placeholder="Write your assessment, action plan, or instructions for the ASHA worker..."
              rows={4}
              style={{
                width: "100%", borderRadius: 10, border: "1.5px solid " + C.border,
                padding: "10px 12px", fontSize: 13, fontFamily: "inherit",
                resize: "none", outline: "none", boxSizing: "border-box",
                color: C.text, background: "#F8FAFC", lineHeight: 1.5,
              }}
            />

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                onClick={saveSOSNote}
                disabled={savingSOS}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
                  background: "#EBF4FD", color: C.primary, fontWeight: 700,
                  fontSize: 13, cursor: savingSOS ? "not-allowed" : "pointer",
                  opacity: savingSOS ? 0.6 : 1,
                }}
              >
                {savingSOS ? "Saving..." : "💾 Save Note"}
              </button>
              <button
                onClick={resolveSOSAlert}
                disabled={savingSOS}
                style={{
                  flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
                  background: C.green, color: "white", fontWeight: 700,
                  fontSize: 13, cursor: savingSOS ? "not-allowed" : "pointer",
                  opacity: savingSOS ? 0.6 : 1,
                }}
              >
                {savingSOS ? "..." : "✓ Mark Done"}
              </button>
            </div>

            {/* Acknowledge button */}
            <button
              onClick={acknowledgeSOSAlert}
              disabled={savingSOS}
              style={{
                width: "100%", marginTop: 8, padding: "11px 0", borderRadius: 10,
                border: "1.5px solid #F39C12", background: "#FEF9E7",
                color: "#B7770D", fontWeight: 700, fontSize: 13,
                cursor: savingSOS ? "not-allowed" : "pointer",
                opacity: savingSOS ? 0.6 : 1,
              }}
            >
              👁 Acknowledge (Keep Active)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
