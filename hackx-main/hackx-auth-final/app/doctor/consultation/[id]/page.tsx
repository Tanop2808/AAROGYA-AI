"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const VideoCallModal = dynamic(() => import("@/components/VideoCallModal"), { ssr: false });

const C = {
  primary: "#1B6CA8", primaryDark: "#0F4C7A", green: "#1E8449", greenLight: "#27AE60",
  red: "#C0392B", redLight: "#E74C3C", bg: "#F0F4F8", card: "#FFFFFF",
  text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC",
};

const URGENCY_COLOR: Record<string, string> = { RED: C.red, YELLOW: "#B7770D", GREEN: C.green };
const URGENCY_BG: Record<string, string> = { RED: "#FDEDED", YELLOW: "#FEF9E7", GREEN: "#E8F8EF" };

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
  doctorNotes?: string;
  prescription?: string;
  patientContext?: any;
  uploadedRecords?: any[];
};

export default function ConsultationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [rx, setRx] = useState("");
  const [saving, setSaving] = useState(false);
  const [callOpen, setCallOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchConsultation = async () => {
      try {
        // Fetch the specific consultation by its ID
        const res = await fetch(`/api/consultations?id=${id}`);
        const data = await res.json();
        const found: Consultation = data.consultation;
        if (found) {
          setConsultation(found);
          setNotes(found.doctorNotes || "");
          setRx(found.prescription || "");
        }
      } catch {
        /* offline */
      }
      setLoading(false);
    };
    fetchConsultation();
  }, [id]);

  const saveAndComplete = async () => {
    setSaving(true);
    try {
      await fetch("/api/consultations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "completed", doctorNotes: notes, prescription: rx }),
      });
      router.push("/doctor/dashboard");
    } catch { /* offline */ }
    setSaving(false);
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      await fetch("/api/consultations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, doctorNotes: notes, prescription: rx }),
      });
    } catch { /* offline */ }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: 14 }}>Loading consultation...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: C.muted, padding: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Consultation not found</div>
            <button onClick={() => router.push("/doctor/dashboard")} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: C.primary, color: "white", fontWeight: 700, cursor: "pointer" }}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const urgencyColor = URGENCY_COLOR[consultation.urgency] || C.muted;
  const urgencyBg = URGENCY_BG[consultation.urgency] || C.bg;
  const initial = consultation.patientName?.[0]?.toUpperCase() || "?";
  const aiNote = consultation.triageResult?.summary || consultation.triageResult?.aiSummary || "";
  const urgencyEmoji = consultation.urgency === "RED" ? "🔴" : consultation.urgency === "YELLOW" ? "🟡" : "🟢";

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        <div style={{ background: "#E8F8EF", padding: "6px 16px", fontSize: 12, fontWeight: 700, color: C.green, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
          Online · Syncing in real-time
        </div>

        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => router.push("/doctor/dashboard")} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: "none", fontSize: 18, cursor: "pointer" }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Consultation Detail</div>
            <div style={{ fontSize: 11, color: C.muted }}>{consultation.patientName} — {consultation.urgency} Urgency</div>
          </div>
          <span style={{ background: urgencyBg, color: urgencyColor, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
            {urgencyEmoji} {consultation.urgency}
          </span>
        </div>

        <div style={{ background: urgencyBg, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: urgencyColor, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18 }}>
            {initial}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{consultation.patientName}</div>
            <div style={{ fontSize: 12, color: C.muted }}>📱 {consultation.patientPhone}</div>
            {consultation.slot && (
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                🕐 {consultation.slot}{consultation.queueNo ? ` · #${consultation.queueNo}` : ""}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

          {consultation.symptoms?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>🩺 SYMPTOMS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {consultation.symptoms.map((sym, i) => (
                  <span key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>{sym}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>🤖 AI TRIAGE RESULT</div>
            <div style={{ background: C.card, borderRadius: 16, padding: 14, border: `1px solid ${C.border}`, borderLeft: `4px solid ${urgencyColor}` }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: urgencyColor }}>
                {urgencyEmoji} {consultation.urgency === "RED" ? "Needs Immediate Attention" : consultation.urgency === "YELLOW" ? "Needs Attention" : "Stable"}
              </div>
              {aiNote && (
                <>
                  <div style={{ height: 1, background: C.border, margin: "10px 0" }} />
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{aiNote}</div>
                </>
              )}
            </div>
          </div>

          {consultation.patientContext && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>📝 PATIENT HISTORY</div>
              <div style={{ background: C.card, borderRadius: 16, padding: 14, border: `1px solid ${C.border}` }}>
                {consultation.patientContext.duration && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Symptom Duration:</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{consultation.patientContext.duration}</div>
                  </div>
                )}
                {consultation.patientContext.additionalSymptoms?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Additional Symptoms:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {consultation.patientContext.additionalSymptoms.map((sym: string, i: number) => (
                        <span key={i} style={{ background: "#FDF2E9", color: "#E67E22", borderRadius: 8, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>{sym}</span>
                      ))}
                    </div>
                  </div>
                )}
                {consultation.patientContext.diseases?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Pre-existing Conditions:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {consultation.patientContext.diseases.map((d: string, i: number) => (
                        <span key={i} style={{ background: "#F5EEF8", color: "#8E44AD", borderRadius: 8, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>{d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {consultation.patientContext.otherDisease && (
                  <div>
                    <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Other Conditions:</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{consultation.patientContext.otherDisease}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {consultation.uploadedRecords && consultation.uploadedRecords.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>📎 ATTACHED MEDICAL RECORDS</div>
              <div style={{ display: "grid", gap: 10 }}>
                {consultation.uploadedRecords.map((file, i) => (
                  <div key={i} style={{ background: C.card, borderRadius: 12, padding: 12, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EBF4FD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                      {file.type.includes("pdf") ? "📄" : "🖼️"}
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>Attached Record</div>
                    </div>
                    <a href={file.dataUrl} download={file.name} style={{ background: C.primary, color: "white", textDecoration: "none", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>📋 DOCTOR NOTES</div>
            <textarea
              style={{ width: "100%", padding: "14px 16px", border: `2px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontFamily: "inherit", background: C.card, color: C.text, outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
              rows={3}
              placeholder="Add your clinical notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>💊 PRESCRIPTION</div>
            <textarea
              style={{ width: "100%", padding: "14px 16px", border: `2px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontFamily: "inherit", background: C.card, color: C.text, outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
              rows={3}
              placeholder="e.g. 1. Paracetamol 500mg - twice daily"
              value={rx}
              onChange={(e) => setRx(e.target.value)}
            />
          </div>

          <button
            onClick={() => setCallOpen(true)}
            style={{ width: "100%", padding: 13, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "white", marginBottom: 10 }}
          >
            📞 Call Patient
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={saveAndComplete}
              disabled={saving}
              style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: `linear-gradient(135deg,#27AE60,#1E8449)`, color: "white", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving..." : "✓ Mark Complete"}
            </button>
            <button
              onClick={saveNotes}
              disabled={saving}
              style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: `linear-gradient(135deg,${C.redLight},${C.red})`, color: "white", opacity: saving ? 0.7 : 1 }}
            >
              🏥 In-Person Visit
            </button>
          </div>
        </div>
      </div>

      {callOpen && (
        <VideoCallModal
          isOpen={true}
          onClose={() => setCallOpen(false)}
          patientName={consultation.patientName}
          patientId={consultation.patientPhone}
          isDoctor={true}
        />
      )}
    </div>
  );
}
