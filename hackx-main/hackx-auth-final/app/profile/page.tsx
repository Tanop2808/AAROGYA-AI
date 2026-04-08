"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

const C = {
  primary: "#1B6CA8",
  primaryDark: "#0F4C7A",
  bg: "#F0F4F8",
  card: "#FFFFFF",
  text: "#1A2332",
  muted: "#6B7C93",
  border: "#DDE3EC",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const lang = typeof window !== "undefined" ? localStorage.getItem("lang") || "hi" : "hi";
  const t = (hi: string, en: string) => (lang === "hi" ? hi : en);

  if (loading) {
    return (
      <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontSize: 20 }}>⏳ {t("लोड हो रहा है", "Loading...")}</div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  const conditions = Array.isArray(user.conditions) 
    ? user.conditions 
    : (user.conditions ? (user.conditions as any).split(",") : []);

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.15)", border: "none", color: "white", fontSize: 18, cursor: "pointer" }}>←</button>
          <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{t("मेरी प्रोफाइल", "My Profile")}</div>
        </div>

        {/* Profile Avatar Area */}
        <div style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, padding: "20px 20px 30px", textAlign: "center", borderBottomLeftRadius: 24, borderBottomRightRadius: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto", border: "3px solid rgba(255,255,255,.4)" }}>
            👤
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: "12px 0 4px" }}>{user.name}</h2>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.7)" }}>{user.phone}</div>
        </div>

        <div style={{ flex: 1, padding: "24px 16px" }}>
          
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            
            <DetailRow icon="📅" label={t("उम्र", "Age")} value={`${user.age || "—"} ${t("वर्ष", "years")}`} />
            <Divider />
            
            <DetailRow icon="🚻" label={t("लिंग", "Gender")} value={user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "—"} />
            <Divider />
            
            <DetailRow icon="🩸" label={t("ब्लड ग्रुप", "Blood Group")} value={user.bloodGroup || "—"} />
            <Divider />
            
            <DetailRow icon="🏘️" label={t("गाँव", "Village")} value={user.village || "—"} />
            <Divider />
            
            <div style={{ padding: "16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ fontSize: 20 }}>💊</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 4 }}>{t("बीमारियाँ (Medical Conditions)", "Medical Conditions")}</div>
                {conditions.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {conditions.map((c: string, i: number) => (
                      <span key={i} style={{ background: "#FDEBD0", color: "#D35400", padding: "4px 10px", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                        {c.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{t("कोई नहीं", "None")}</div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: string, label: string, value: string }) {
  return (
    <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: "#6B7C93", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1A2332", marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#DDE3EC", margin: "0 16px" }} />;
}
