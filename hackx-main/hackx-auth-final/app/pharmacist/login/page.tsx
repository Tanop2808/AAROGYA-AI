"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useLang } from "@/lib/useLang";

const C = {
  primary: "#E67E22", primaryDark: "#D35400", green: "#1E8449",
  bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93",
  border: "#DDE3EC", red: "#C0392B", orange: "#E67E22",
};

type Screen = "login" | "register_phone" | "register_otp" | "register_details";

export default function PharmacistLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { lang, setLang, mounted } = useLang();

  const [screen, setScreen] = useState<Screen>("login");

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Registration state
  const [regPhone, setRegPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [reg, setReg] = useState({
    name: "", storeName: "", village: "", district: "Nabha",
    address: "", licenseNumber: "", type: "Private", distanceKm: "",
    email: "", ownerAge: "", qualification: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRef0 = useRef<HTMLInputElement>(null);
  const otpRef1 = useRef<HTMLInputElement>(null);
  const otpRef2 = useRef<HTMLInputElement>(null);
  const otpRef3 = useRef<HTMLInputElement>(null);
  const otpRef4 = useRef<HTMLInputElement>(null);
  const otpRef5 = useRef<HTMLInputElement>(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3, otpRef4, otpRef5];

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "pharmacist") {
      router.replace("/pharmacist/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(s => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const T = (hi: string, en: string) => lang === "hi" ? hi : en;

  if (!mounted) return null;

  // ─── HANDLERS ───────────────────────────────────────────

  const handleLogin = async () => {
    if (loginPhone.length !== 10) { setError(T("10 अंक का नंबर दर्ज करें", "Enter valid 10-digit number")); return; }
    if (!loginPassword) { setError(T("पासवर्ड दर्ज करें", "Enter your password")); return; }
    setError(""); setLoading(true);
    const res = await signIn("pharmacist-credentials", { phone: loginPhone, password: loginPassword, redirect: false });
    if (res?.ok) {
      // Always set a minimal localStorage entry first so dashboard never bounces
      localStorage.setItem("pharmacist", JSON.stringify({ phone: loginPhone, name: "", storeName: "", village: "", district: "", address: "", type: "Private", distanceKm: "", licenseNumber: "", stock: [] }));
      // Then try to enrich it with real data from DB
      try {
        const data = await fetch(`/api/pharmacist?phone=${loginPhone}`).then(r => r.json());
        if (data.pharmacist) {
          localStorage.setItem("pharmacist", JSON.stringify(data.pharmacist));
        }
      } catch {}
      router.replace("/pharmacist/dashboard");
    } else {
      setError(T("नंबर या पासवर्ड गलत है", "Incorrect phone number or password"));
    }
    setLoading(false);
  };

  const sendOtp = async () => {
    if (regPhone.length !== 10) { setError(T("10 अंक का नंबर दर्ज करें", "Enter valid 10-digit number")); return; }
    try {
      const check = await fetch(`/api/pharmacist?phone=${regPhone}`);
      const data = await check.json();
      if (data.pharmacist) {
        setError(T("यह नंबर पहले से रजिस्टर है। लॉगिन करें।", "This number is already registered. Please login.")); return;
      }
    } catch {}
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: regPhone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || T("OTP नहीं भेज सका", "Could not send OTP")); setLoading(false); return; }
      if (data.devOtp) setDevOtp(data.devOtp);
    } catch {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setDevOtp(code);
    }
    setLoading(false); setScreen("register_otp"); setTimer(30);
  };

  const verifyOtp = async () => {
    const entered = otp.join("");
    if (entered.length !== 6) { setError(T("6 अंक का OTP दर्ज करें", "Enter 6-digit OTP")); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: regPhone, otp: entered }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || T("OTP गलत है", "Incorrect OTP")); setLoading(false); return; }
    } catch {
      if (entered !== devOtp) { setError(T("OTP गलत है", "Incorrect OTP")); setLoading(false); return; }
    }
    setLoading(false); setScreen("register_details");
  };

  const handleRegister = async () => {
    if (!reg.name || !reg.storeName || !reg.village) {
      setError(T("नाम, दुकान और गाँव ज़रूरी है", "Name, store and village are required")); return;
    }
    if (!reg.licenseNumber) {
      setError(T("लाइसेंस नंबर ज़रूरी है", "License number is required")); return;
    }
    if (!password || password.length < 6) {
      setError(T("कम से कम 6 अक्षर का पासवर्ड चुनें", "Choose a password with at least 6 characters")); return;
    }
    if (password !== password2) {
      setError(T("पासवर्ड मेल नहीं खाता", "Passwords do not match")); return;
    }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/pharmacist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: regPhone, password, ...reg, stock: [] }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setLoading(false); return; }
      const signInRes = await signIn("pharmacist-credentials", { phone: regPhone, password, redirect: false });
      if (signInRes?.ok) {
        try {
          const d = await fetch(`/api/pharmacist?phone=${regPhone}`).then(r => r.json());
          if (d.pharmacist) localStorage.setItem("pharmacist", JSON.stringify(d.pharmacist));
        } catch {}
        router.replace("/pharmacist/dashboard");
      } else {
        setError(T("रजिस्ट्रेशन हुआ! अब लॉगिन करें।", "Registered! Please login now."));
        setScreen("login"); setLoginPhone(regPhone);
      }
    } catch {
      setError(T("कुछ गलत हुआ", "Something went wrong"));
    }
    setLoading(false);
  };

  const handleOtpKey = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) otpRefs[idx + 1].current?.focus();
    if (!val && idx > 0) otpRefs[idx - 1].current?.focus();
  };

  // ─── SHARED STYLES ──────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", border: `2px solid ${C.border}`,
    borderRadius: 12, fontSize: 15, fontFamily: "inherit", background: C.card,
    color: C.text, outline: "none", boxSizing: "border-box",
  };
  const btnPrimary: React.CSSProperties = {
    width: "100%", marginTop: 16, padding: 17, borderRadius: 14, border: "none",
    cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 16,
    background: loading ? "#ccc" : `linear-gradient(135deg,${C.orange},${C.primaryDark})`,
    color: "white",
  };
  const btnOutline: React.CSSProperties = {
    width: "100%", padding: 14, borderRadius: 14, border: `2px solid ${C.border}`,
    background: C.card, color: C.orange, fontWeight: 700, fontSize: 14, cursor: "pointer",
  };

  const Header = ({ title, sub, onBack }: { title: string; sub: string; onBack?: () => void }) => (
    <div style={{ background: `linear-gradient(135deg,${C.orange},${C.primaryDark})`, padding: "56px 24px 32px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -20, top: -20, fontSize: 120, opacity: .06 }}>💊</div>
      {onBack && (
        <button onClick={onBack} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, color: "white", padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>
          ← {T("वापस", "Back")}
        </button>
      )}
      <div style={{ width: 52, height: 52, background: "rgba(255,255,255,.2)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 14 }}>🏪</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0 }}>{title}</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 8 }}>{sub}</p>
    </div>
  );

  const ErrorBox = () => error ? (
    <div style={{ background: "#FDEDED", border: "1px solid #F1948A", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.red, fontWeight: 600 }}>⚠ {error}</div>
  ) : null;

  const wrap = (children: React.ReactNode) => (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );

  // ─── SCREEN: LOGIN ───────────────────────────────────────

  if (screen === "login") return wrap(<>
    <Header title={T("फार्मासिस्ट लॉगिन", "Pharmacist Login")} sub={T("अपनी दवाई की दुकान मैनेज करें", "Manage your medical store")} />
    <div style={{ flex: 1, padding: "28px 20px" }}>
      <ErrorBox />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={() => setLang(lang === "hi" ? "en" : "hi")}
          style={{ background: "rgba(230,126,34,.12)", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: C.orange, cursor: "pointer" }}>
          {lang === "hi" ? "English" : "हिंदी"}
        </button>
      </div>

      <label style={{ fontSize: 13, fontWeight: 700, color: C.muted, display: "block", marginBottom: 8 }}>📱 {T("मोबाइल नंबर", "Mobile Number")}</label>
      <div style={{ display: "flex", border: `2px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: C.card, marginBottom: 16 }}>
        <div style={{ background: C.bg, padding: "0 16px", display: "flex", alignItems: "center", borderRight: `2px solid ${C.border}`, fontSize: 15, fontWeight: 700, color: C.muted }}>+91</div>
        <input style={{ flex: 1, border: "none", outline: "none", fontSize: 20, fontWeight: 700, padding: "14px", background: "transparent", color: C.text, letterSpacing: 1 }}
          type="tel" inputMode="numeric" value={loginPhone}
          onChange={e => { setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
          placeholder="98765 00001" autoFocus />
      </div>

      <label style={{ fontSize: 13, fontWeight: 700, color: C.muted, display: "block", marginBottom: 8 }}>🔒 {T("पासवर्ड", "Password")}</label>
      <div style={{ display: "flex", border: `2px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: C.card }}>
        <input style={{ flex: 1, border: "none", outline: "none", fontSize: 16, padding: "14px 16px", background: "transparent", color: C.text }}
          type={showLoginPwd ? "text" : "password"} placeholder="••••••••" value={loginPassword}
          onChange={e => { setLoginPassword(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleLogin()} />
        <button onClick={() => setShowLoginPwd(s => !s)}
          style={{ background: "none", border: "none", padding: "0 16px", cursor: "pointer", fontSize: 18, color: C.muted }}>
          {showLoginPwd ? "🙈" : "👁️"}
        </button>
      </div>

      <button onClick={handleLogin} disabled={loading} style={btnPrimary}>
        {loading ? "..." : `→ ${T("लॉगिन करें", "Login")}`}
      </button>

      <div style={{ height: 1, background: C.border, margin: "24px 0" }} />

      <p style={{ fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 12 }}>
        {T("नया अकाउंट बनाएं?", "Don\'t have an account?")}
      </p>
      <button onClick={() => { setScreen("register_phone"); setError(""); }} style={btnOutline}>
        🏪 {T("फार्मासिस्ट रजिस्ट्रेशन", "Register as Pharmacist")}
      </button>

      <div style={{ height: 12 }} />
      <button onClick={() => router.push("/login")} style={{ ...btnOutline, color: "#888", borderColor: "#eee" }}>
        ← {T("मरीज़ लॉगिन पर जाएं", "Go to Patient Login")}
      </button>
    </div>
  </>);

  // ─── SCREEN: REGISTER — PHONE ────────────────────────────

  if (screen === "register_phone") return wrap(<>
    <Header
      title={T("नया रजिस्ट्रेशन", "New Registration")}
      sub={T("OTP से नंबर सत्यापित करें", "Verify your number with OTP")}
      onBack={() => { setScreen("login"); setError(""); setRegPhone(""); }}
    />
    <div style={{ flex: 1, padding: "28px 20px" }}>
      <ErrorBox />

      <div style={{ background: "rgba(230,126,34,.08)", border: "1px solid rgba(230,126,34,.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#8a4a00" }}>
        ℹ️ {T("रजिस्ट्रेशन के लिए OTP सत्यापन ज़रूरी है", "OTP verification is required for registration")}
      </div>

      <label style={{ fontSize: 13, fontWeight: 700, color: C.muted, display: "block", marginBottom: 8 }}>📱 {T("मोबाइल नंबर", "Mobile Number")}</label>
      <div style={{ display: "flex", border: `2px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: C.card }}>
        <div style={{ background: C.bg, padding: "0 16px", display: "flex", alignItems: "center", borderRight: `2px solid ${C.border}`, fontSize: 15, fontWeight: 700, color: C.muted }}>+91</div>
        <input style={{ flex: 1, border: "none", outline: "none", fontSize: 20, fontWeight: 700, padding: "14px", background: "transparent", color: C.text, letterSpacing: 1 }}
          type="tel" inputMode="numeric" value={regPhone}
          onChange={e => { setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
          placeholder="98765 00001" autoFocus />
      </div>

      <button onClick={sendOtp} disabled={loading || regPhone.length !== 10} style={btnPrimary}>
        {loading ? "..." : `📲 ${T("OTP भेजें", "Send OTP")} →`}
      </button>

      <div style={{ height: 1, background: C.border, margin: "24px 0" }} />
      <p style={{ fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 12 }}>
        {T("पहले से खाता है?", "Already have an account?")}
      </p>
      <button onClick={() => { setScreen("login"); setError(""); }} style={btnOutline}>
        → {T("लॉगिन करें", "Login")}
      </button>
    </div>
  </>);

  // ─── SCREEN: REGISTER — OTP ──────────────────────────────

  if (screen === "register_otp") return wrap(<>
    <div style={{ background: `linear-gradient(135deg,${C.orange},${C.primaryDark})`, padding: "56px 24px 32px" }}>
      <button onClick={() => { setScreen("register_phone"); setError(""); setOtp(["","","","","",""]); }}
        style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, color: "white", padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>
        ← {T("वापस", "Back")}
      </button>
      <div style={{ width: 52, height: 52, background: "rgba(255,255,255,.2)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 14 }}>🔐</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>{T("OTP दर्ज करें", "Enter OTP")}</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 6 }}>+91 {regPhone}</p>
    </div>
    <div style={{ flex: 1, padding: "32px 20px" }}>
      <p style={{ fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 20 }}>
        {T(`+91 ${regPhone} पर 6 अंक का OTP भेजा गया`, `A 6-digit OTP was sent to +91 ${regPhone}`)}
      </p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
        {otp.map((d, i) => (
          <input key={i} ref={otpRefs[i]}
            style={{ width: 48, height: 56, borderRadius: 12, border: `2px solid ${error ? C.red : d ? C.orange : C.border}`, background: C.card, textAlign: "center", fontSize: 24, fontWeight: 800, color: C.text, outline: "none" }}
            type="tel" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleOtpKey(e.target.value, i)}
            onKeyDown={e => e.key === "Backspace" && !otp[i] && i > 0 && otpRefs[i - 1].current?.focus()} />
        ))}
      </div>
      {error && <p style={{ fontSize: 13, color: C.red, textAlign: "center", fontWeight: 600, marginBottom: 12 }}>⚠ {error}</p>}
      <button onClick={verifyOtp} disabled={loading} style={btnPrimary}>
        {loading ? "..." : `✓ ${T("OTP सत्यापित करें", "Verify OTP")}`}
      </button>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        {timer > 0
          ? <p style={{ fontSize: 13, color: C.muted }}>{T(`दोबारा भेजें (${timer}s)`, `Resend in ${timer}s`)}</p>
          : <button onClick={sendOtp} style={{ background: "none", border: "none", color: C.orange, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
              {T("OTP दोबारा भेजें", "Resend OTP")}
            </button>}
      </div>
      {devOtp && (
        <div style={{ background: "#FEF9E7", borderRadius: 12, padding: 12, marginTop: 20, border: "1px solid #F4D03F" }}>
          <p style={{ fontSize: 12, color: "#7D6608", margin: 0 }}>💡 Dev OTP: <strong>{devOtp}</strong></p>
        </div>
      )}
    </div>
  </>);

  // ─── SCREEN: REGISTER — DETAILS ──────────────────────────

  const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
    <div style={{ background: "rgba(230,126,34,.07)", borderRadius: 12, padding: "12px 14px", margin: "20px 0 16px", fontSize: 12, fontWeight: 700, color: C.orange }}>
      {icon} {title}
    </div>
  );

  return wrap(<>
    <Header
      title={T("दुकान रजिस्टर करें", "Register Your Store")}
      sub={`+91 ${regPhone} ✓ ${T("सत्यापित", "Verified")}`}
      onBack={() => { setScreen("register_otp"); setError(""); }}
    />
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 40px" }}>
      <ErrorBox />

      <SectionHeader icon="👤" title={T("व्यक्तिगत जानकारी", "Personal Information")} />
      {[
        { key: "name",          label: T("👤 आपका पूरा नाम *", "👤 Full Name *"),          ph: T("राजेश कुमार", "Rajesh Kumar"),         type: "text"   },
        { key: "ownerAge",      label: T("🎂 आयु", "🎂 Age"),                              ph: "35",                                     type: "number" },
        { key: "qualification", label: T("🎓 योग्यता", "🎓 Qualification"),                ph: "B.Pharma / D.Pharma",                    type: "text"   },
        { key: "email",         label: T("📧 ईमेल (वैकल्पिक)", "📧 Email (optional)"),     ph: "pharmacist@example.com",                 type: "email"  },
      ].map(f => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>{f.label}</label>
          <input style={inputStyle} type={f.type} placeholder={f.ph}
            value={reg[f.key as keyof typeof reg]}
            onChange={e => { setReg({ ...reg, [f.key]: e.target.value }); setError(""); }} />
        </div>
      ))}

      <SectionHeader icon="🏪" title={T("दुकान की जानकारी", "Store Information")} />
      {[
        { key: "storeName",     label: T("🏪 दुकान का नाम *", "🏪 Store Name *"),        ph: T("राजेश मेडिकल स्टोर", "Rajesh Medical Store"), type: "text"   },
        { key: "licenseNumber", label: T("📋 लाइसेंस नंबर *", "📋 License Number *"),    ph: "PH/2024/001",                                   type: "text"   },
        { key: "village",       label: T("🏘️ गाँव / क्षेत्र *", "🏘️ Village / Area *"),  ph: T("केसरी", "Kesri"),                              type: "text"   },
        { key: "district",      label: T("📍 जिला", "📍 District"),                      ph: "Nabha",                                         type: "text"   },
        { key: "address",       label: T("🗺️ पूरा पता", "🗺️ Full Address"),              ph: T("मेन मार्केट, नाभा", "Main Market, Nabha"),     type: "text"   },
        { key: "distanceKm",    label: T("📏 PHC से दूरी (km)", "📏 Distance from PHC"),  ph: "2.5",                                           type: "number" },
      ].map(f => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>{f.label}</label>
          <input style={inputStyle} type={f.type} placeholder={f.ph}
            value={reg[f.key as keyof typeof reg]}
            onChange={e => { setReg({ ...reg, [f.key]: e.target.value }); setError(""); }} />
        </div>
      ))}

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 8 }}>{T("🏷️ दुकान का प्रकार", "🏷️ Store Type")}</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ v: "Private", l: T("प्राइवेट", "Private"), e: "🏪" }, { v: "Jan Aushadhi", l: "Jan Aushadhi", e: "🏛️" }, { v: "Govt Free", l: T("सरकारी", "Govt Free"), e: "🏥" }].map(g => (
            <button key={g.v} onClick={() => setReg({ ...reg, type: g.v })}
              style={{ flex: 1, padding: "12px 6px", borderRadius: 12, border: `2px solid ${reg.type === g.v ? C.orange : C.border}`, background: reg.type === g.v ? "#FEF3E8" : C.card, cursor: "pointer", fontSize: 12, fontWeight: 700, color: reg.type === g.v ? C.orange : C.text }}>
              {g.e}<br /><span style={{ fontSize: 10 }}>{g.l}</span>
            </button>
          ))}
        </div>
      </div>

      <SectionHeader icon="🔒" title={T("लॉगिन सुरक्षा", "Login Security")} />

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>{T("🔒 पासवर्ड बनाएं *", "🔒 Create Password *")}</label>
        <div style={{ display: "flex", border: `2px solid ${C.border}`, borderRadius: 12, overflow: "hidden", background: C.card }}>
          <input style={{ flex: 1, border: "none", outline: "none", padding: "13px 16px", fontSize: 15, fontFamily: "inherit", background: "transparent", color: C.text }}
            type={showRegPwd ? "text" : "password"} placeholder="••••••••" value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }} />
          <button onClick={() => setShowRegPwd(s => !s)} style={{ background: "none", border: "none", padding: "0 14px", cursor: "pointer", fontSize: 16, color: C.muted }}>
            {showRegPwd ? "🙈" : "👁️"}
          </button>
        </div>
        {password && (
          <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
            {[
              { l: "6+ chars", ok: password.length >= 6 },
              { l: "Uppercase", ok: /[A-Z]/.test(password) },
              { l: "Number", ok: /\d/.test(password) },
            ].map(r => (
              <span key={r.l} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: r.ok ? "#D5F5E3" : "#FDEDED", color: r.ok ? "#1E8449" : C.red }}>
                {r.ok ? "✓" : "✗"} {r.l}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 6 }}>{T("🔒 पासवर्ड दोबारा दर्ज करें *", "🔒 Confirm Password *")}</label>
        <div style={{ display: "flex", border: `2px solid ${password2 && password !== password2 ? C.red : C.border}`, borderRadius: 12, overflow: "hidden", background: C.card }}>
          <input style={{ flex: 1, border: "none", outline: "none", padding: "13px 16px", fontSize: 15, fontFamily: "inherit", background: "transparent", color: C.text }}
            type={showRegPwd ? "text" : "password"} placeholder="••••••••" value={password2}
            onChange={e => { setPassword2(e.target.value); setError(""); }} />
        </div>
        {password2 && password !== password2 && (
          <p style={{ fontSize: 11, color: C.red, marginTop: 4, fontWeight: 600 }}>⚠ {T("पासवर्ड मेल नहीं खाता", "Passwords do not match")}</p>
        )}
        {password2 && password === password2 && password2.length > 0 && (
          <p style={{ fontSize: 11, color: C.green, marginTop: 4, fontWeight: 600 }}>✓ {T("पासवर्ड मेल खाता है", "Passwords match")}</p>
        )}
      </div>

      <button onClick={handleRegister} disabled={loading} style={btnPrimary}>
        {loading ? "..." : `✓ ${T("दुकान रजिस्टर करें", "Register Store")}`}
      </button>

      <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 12 }}>
        {T("रजिस्ट्रेशन करने पर आप हमारी शर्तों से सहमत हैं", "By registering you agree to our terms of service")}
      </p>
    </div>
  </>);
}
