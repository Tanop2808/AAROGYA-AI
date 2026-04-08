"use client";
import Link from "next/link";
import { useEffect } from "react";
import { seedOfflineData } from "@/lib/db-offline";

export default function SplashPage() {

  useEffect(() => {
    // Seed offline DB on first load
    seedOfflineData().catch(console.error);
  }, []);

  return (
    <div style={{ background: "#1B6CA8", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="phone-shell" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 24px", gap: 0, background: "transparent", border: "8px solid #111" }}>
        
        {/* LOGO BOX WITH ACTUAL IMAGE */}
        <div style={{ width: 90, height: 90, background: "rgba(255,255,255,.15)", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, border: "2px solid rgba(255,255,255,.25)", boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
          <img src="/icon-192.png" alt="Aarogya AI Logo" style={{ width: 50, height: 50, objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
        </div>
        
        <div style={{ fontFamily: "var(--font-hi)", fontSize: 40, fontWeight: 800, color: "white", textAlign: "center", lineHeight: 1.1 }}>AAROGYA.AI</div>
        <div style={{ fontFamily: "var(--font-en)", fontSize: 28, fontWeight: 800, color: "white", textAlign: "center", lineHeight: 1.1, letterSpacing: -0.5 }}>AAROGYA.AI</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.8)", textAlign: "center", marginTop: 6 }}>Bridge to Health — स्वास्थ्य का सेतु</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", textAlign: "center", marginTop: 4, fontStyle: "italic" }}>ग्रामीण टेलीमेडिसिन · AI-Powered · Offline-First</div>
        
        <div style={{ width: 48, height: 3, background: "rgba(255,255,255,.25)", borderRadius: 3, margin: "20px auto" }} />
        
        {/* BUTTONS */}
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <Link href="/login" onClick={() => localStorage.setItem("lang", "hi")} style={{ flex: 1, padding: 16, borderRadius: 14, border: "none", fontSize: 18, fontWeight: 800, cursor: "pointer", background: "white", color: "#0F4C7A", fontFamily: "var(--font-hi)", textAlign: "center", textDecoration: "none" }}>हिंदी</Link>
          <Link href="/login" onClick={() => localStorage.setItem("lang", "en")} style={{ flex: 1, padding: 16, borderRadius: 14, border: "2px solid rgba(255,255,255,.4)", fontSize: 17, fontWeight: 800, cursor: "pointer", background: "transparent", color: "white", textAlign: "center", textDecoration: "none" }}>English</Link>
        </div>
        
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", textAlign: "center", marginTop: 16 }}>Works offline · काम करता है बिना इंटरनेट</div>
      </div>
    </div>
  );
}
