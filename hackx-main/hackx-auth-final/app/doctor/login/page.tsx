"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useLang } from "@/lib/useLang";

const C = {
  primary: "#1B6CA8", primaryDark: "#0F4C7A", green: "#1E8449",
  bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332",
  muted: "#6B7C93", border: "#DDE3EC", red: "#C0392B",
};

export default function DoctorLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail]       = useState("doctor@sehat.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "doctor") {
      router.replace("/doctor/dashboard");
    }
  }, [status, session, router]);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true); setError("");

    const res = await signIn("doctor-credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.ok) {
      router.push("/doctor/dashboard");
    } else {
      setError(res?.error ?? "Invalid credentials. Use doctor@sehat.com");
    }
  };

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1A2332,#2C3E50)", padding: "56px 24px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -20, top: -20, fontSize: 120, opacity: .05 }}>👨‍⚕️</div>
          <div style={{ width: 52, height: 52, background: "rgba(255,255,255,.12)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16 }}>🏥</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Doctor Login</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 6 }}>Nabha Civil Hospital · Staff Portal</p>
        </div>

        <div style={{ flex: 1, padding: "24px 20px" }}>
          {error && (
            <div style={{ background: "#FDEDED", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.red, fontWeight: 600 }}>
              ⚠ {error}
            </div>
          )}

          {[
            { lbl: "📧 Email / Employee ID", val: email,    set: setEmail,    type: "email"    },
            { lbl: "🔑 Password",            val: password, set: setPassword, type: "password" },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>{f.lbl}</label>
              <input
                style={{ width: "100%", padding: "14px 16px", border: `2px solid ${C.border}`, borderRadius: 12, fontSize: 15, fontFamily: "inherit", background: C.card, outline: "none", boxSizing: "border-box" }}
                value={f.val}
                onChange={e => { f.set(e.target.value); setError(""); }}
                type={f.type}
                placeholder={f.type === "password" ? "••••••••" : undefined}
              />
            </div>
          ))}

          {/* Demo hint */}
          <div style={{ background: "#EBF5FB", borderRadius: 10, padding: "10px 14px", marginBottom: 14, border: `1px solid ${C.primary}33`, fontSize: 12, color: C.primary }}>
            💡 Demo: <strong>doctor@sehat.com</strong> · any password
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 15, background: "linear-gradient(135deg,#1A2332,#2C3E50)", color: "white", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Verifying…" : "→ Login"}
          </button>

          <div style={{ height: 1, background: C.border, margin: "20px 0" }} />
          <button
            onClick={() => router.push("/login")}
            style={{ width: "100%", padding: 14, borderRadius: 14, border: `2px solid ${C.border}`, background: C.bg, color: C.primary, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            ← Patient Login
          </button>
        </div>
      </div>
    </div>
  );
}