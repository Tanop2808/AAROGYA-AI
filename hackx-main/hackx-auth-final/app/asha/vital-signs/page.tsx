"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const C = { primary: "#27AE60", primaryDark: "#1E8449", red: "#C0392B", bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC" };

export default function ASHAVitalSignsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [lang, setLang] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    patientPhone: "",
    patientName: "",
    bpSystolic: "",
    bpDiastolic: "",
    heartRate: "",
    temperature: "",
    spo2: "",
    weight: "",
    randomBloodSugar: "",
    respiratoryRate: "",
    notes: "",
  });

  const T = (hi: string, en: string) => lang === "hi" ? hi : en;
  const ashaPhone = session?.user?.phone || "";
  const ashaName = session?.user?.name || "";

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "hi");
    if (status === "unauthenticated" || session?.user?.role !== "ashaworker") router.replace("/asha/login");
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/vital-signs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          bpSystolic: form.bpSystolic ? parseFloat(form.bpSystolic) : null,
          bpDiastolic: form.bpDiastolic ? parseFloat(form.bpDiastolic) : null,
          heartRate: form.heartRate ? parseFloat(form.heartRate) : null,
          temperature: form.temperature ? parseFloat(form.temperature) : null,
          spo2: form.spo2 ? parseFloat(form.spo2) : null,
          weight: form.weight ? parseFloat(form.weight) : null,
          randomBloodSugar: form.randomBloodSugar ? parseFloat(form.randomBloodSugar) : null,
          respiratoryRate: form.respiratoryRate ? parseFloat(form.respiratoryRate) : null,
          recordedBy: ashaPhone,
          recordedByName: ashaName,
          recordedAt: new Date(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { setSuccess(false); router.push("/asha/dashboard"); }, 2000);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to record vital signs");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>⏳</div>;
  if (!session) return null;

  const vitalFields = [
    { label: "BP Systolic", key: "bpSystolic", unit: "mmHg", icon: "❤️", placeholder: "120" },
    { label: "BP Diastolic", key: "bpDiastolic", unit: "mmHg", icon: "❤️", placeholder: "80" },
    { label: "Heart Rate", key: "heartRate", unit: "bpm", icon: "💓", placeholder: "72" },
    { label: "Temperature", key: "temperature", unit: "°F", icon: "🌡️", placeholder: "98.6" },
    { label: "SpO2", key: "spo2", unit: "%", icon: "🫁", placeholder: "98" },
    { label: "Weight", key: "weight", unit: "kg", icon: "⚖️", placeholder: "65" },
    { label: "Random Blood Sugar", key: "randomBloodSugar", unit: "mg/dL", icon: "🩸", placeholder: "140" },
    { label: "Respiratory Rate", key: "respiratoryRate", unit: "breaths/min", icon: "💨", placeholder: "16" },
  ];

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => router.push("/asha/dashboard")} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: "none", fontSize: 18, cursor: "pointer" }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{T("वाइटल साइन रिकॉर्ड करें", "Record Vital Signs")}</div>
            <div style={{ fontSize: 11, color: C.muted }}>Vital Signs Entry</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {success && (
            <div style={{ background: "#E8F8EF", border: "1px solid #27AE60", borderRadius: 12, padding: 16, marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>Vital signs recorded successfully!</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Redirecting...</div>
            </div>
          )}

          {[
            { label: "Patient Phone *", key: "patientPhone", type: "tel", placeholder: "9876501001" },
            { label: "Patient Name *", key: "patientName", type: "text", placeholder: "Ramkali Devi" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>{f.label}</label>
              <input required type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `2px solid ${C.border}`, fontSize: 14 }} />
            </div>
          ))}

          <div style={{ background: "#E8F8EF", borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.primaryDark, marginBottom: 8 }}>🫀 Vital Parameters</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {vitalFields.map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.text, display: "block", marginBottom: 2 }}>
                    {f.icon} {f.label} ({f.unit})
                  </label>
                  <input type="number" step="0.1" placeholder={f.placeholder} value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `2px solid ${C.border}`, fontSize: 14 }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.text, display: "block", marginBottom: 4 }}>Notes</label>
            <textarea rows={3} placeholder="Additional observations..." value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `2px solid ${C.border}`, fontSize: 14, resize: "vertical" }} />
          </div>

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", cursor: loading ? "wait" : "pointer", fontWeight: 700, fontSize: 15, background: loading ? "#ccc" : `linear-gradient(135deg,${C.primary},${C.primaryDark})`, color: "white", marginTop: 8 }}>
            {loading ? "⏳ Recording..." : "✅ Record Vital Signs"}
          </button>
        </form>
      </div>
    </div>
  );
}
