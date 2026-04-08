// "use client";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// const C = { primary: "#1B6CA8", primaryDark: "#0F4C7A", green: "#1E8449", red: "#C0392B", bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC" };

// const MED_DB: Record<string, Array<{ name: string; village: string; dist: string; phone: string; qty: number; inStock: boolean }>> = {
//   Paracetamol: [
//     { name: "Nabha Medical Store", village: "Nabha", dist: "1.2", phone: "9876500001", qty: 200, inStock: true },
//     { name: "Punjab Pharmacy", village: "Kesri", dist: "3.4", phone: "9876500002", qty: 100, inStock: true },
//     { name: "Sharma Medical", village: "Barnala Road", dist: "5.8", phone: "9876500003", qty: 150, inStock: true },
//   ],
//   Metformin: [
//     { name: "Nabha Medical Store", village: "Nabha", dist: "1.2", phone: "9876500001", qty: 50, inStock: true },
//     { name: "Punjab Pharmacy", village: "Kesri", dist: "3.4", phone: "9876500002", qty: 0, inStock: false },
//     { name: "Sharma Medical", village: "Barnala Road", dist: "5.8", phone: "9876500003", qty: 80, inStock: true },
//   ],
//   ORS: [
//     { name: "Nabha Medical Store", village: "Nabha", dist: "1.2", phone: "9876500001", qty: 500, inStock: true },
//     { name: "Punjab Pharmacy", village: "Kesri", dist: "3.4", phone: "9876500002", qty: 300, inStock: true },
//     { name: "Sharma Medical", village: "Barnala Road", dist: "5.8", phone: "9876500003", qty: 0, inStock: false },
//   ],
//   Amoxicillin: [
//     { name: "Nabha Medical Store", village: "Nabha", dist: "1.2", phone: "9876500001", qty: 0, inStock: false },
//     { name: "Punjab Pharmacy", village: "Kesri", dist: "3.4", phone: "9876500002", qty: 80, inStock: true },
//     { name: "Sharma Medical", village: "Barnala Road", dist: "5.8", phone: "9876500003", qty: 60, inStock: true },
//   ],
// };

// export default function MedicinePage() {
//   const router = useRouter();
//   const lang = typeof window !== "undefined" ? localStorage.getItem("lang") || "hi" : "hi";
//   const t = (hi: string, en: string) => lang === "hi" ? hi : en;
//   const [active, setActive] = useState("Paracetamol");
//   const [search, setSearch] = useState("Paracetamol");

//   const results = MED_DB[active] || [];

//   return (
//     <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
//       <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
//         <div style={{ background: "#FDEDED", padding: "6px 16px", fontSize: 12, fontWeight: 700, color: C.red, display: "flex", alignItems: "center", gap: 6 }}>
//           <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red }} />
//           {t("ऑफलाइन — फार्मेसी डेटा डिवाइस से", "Offline — Pharmacy data from device")}
//         </div>
//         <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
//           <button onClick={() => router.push("/home")} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: "none", fontSize: 18, cursor: "pointer" }}>←</button>
//           <div>
//             <div style={{ fontSize: 15, fontWeight: 700 }}>{t("दवाई खोजें", "Find Medicine")}</div>
//             <div style={{ fontSize: 11, color: C.muted }}>Find Medicine Nearby</div>
//           </div>
//         </div>
//         {/* Search */}
//         <div style={{ padding: "10px 16px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
//           <div style={{ display: "flex", alignItems: "center", border: `2px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: C.bg }}>
//             <span style={{ padding: "12px 14px", fontSize: 18 }}>🔍</span>
//             <input style={{ flex: 1, border: "none", outline: "none", fontSize: 16, padding: "12px 0", background: "transparent", fontFamily: "inherit" }}
//               placeholder={t("दवाई का नाम लिखें...", "Type medicine name...")} value={search}
//               onChange={e => { setSearch(e.target.value); const k = Object.keys(MED_DB).find(k => k.toLowerCase().includes(e.target.value.toLowerCase())); if (k) setActive(k); }} />
//           </div>
//           <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto", paddingBottom: 4 }}>
//             {Object.keys(MED_DB).map(med => (
//               <button key={med} onClick={() => { setActive(med); setSearch(med); }}
//                 style={{ padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, flexShrink: 0, background: active === med ? C.primary : C.bg, color: active === med ? "white" : C.text, transition: "all .2s" }}>
//                 💊 {med}
//               </button>
//             ))}
//           </div>
//         </div>
//         {/* Fake map */}
//         <div style={{ height: 130, position: "relative", background: "#E8F0E0", flexShrink: 0, overflow: "hidden" }}>
//           <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(150,170,130,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(150,170,130,.3) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
//           <div style={{ position: "absolute", top: "40%", left: 0, right: 0, height: 6, background: "#D4C5A0" }} />
//           <div style={{ position: "absolute", top: "70%", left: 0, right: 0, height: 4, background: "#D4C5A0" }} />
//           <div style={{ position: "absolute", left: "30%", top: 0, bottom: 0, width: 5, background: "#D4C5A0" }} />
//           {[["32%","42%"],["62%","30%"],["20%","66%"]].map(([l, tp], i) => (
//             <div key={i} style={{ position: "absolute", left: l, top: tp, fontSize: 20 }}>📍</div>
//           ))}
//           <div style={{ position: "absolute", bottom: 6, right: 8, fontSize: 11, color: C.muted, background: "rgba(255,255,255,.8)", padding: "3px 8px", borderRadius: 8, fontWeight: 600 }}>🗺️ Nabha District</div>
//         </div>
//         {/* Results */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 16px" }}>
//           <div style={{ fontSize: 13, fontWeight: 700, margin: "10px 0 6px" }}>
//             {active} — {results.filter(p => p.inStock).length} {t("दुकानों में उपलब्ध", "pharmacies available")}
//           </div>
//           {results.map((p, i) => (
//             <div key={i} style={{ background: C.card, borderRadius: 16, padding: 16, marginBottom: 10, border: `1px solid ${C.border}`, opacity: p.inStock ? 1 : .65 }}>
//               <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
//                 <div style={{ width: 40, height: 40, borderRadius: 10, background: p.inStock ? "#E8F8EF" : "#FDEDED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💊</div>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
//                   <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
//                     {p.village} · {p.dist} km · <span style={{ color: p.inStock ? C.green : C.red, fontWeight: 700 }}>{p.inStock ? `✓ ${t("उपलब्ध", "In Stock")} (${p.qty})` : `✗ ${t("उपलब्ध नहीं", "Out of Stock")}`}</span>
//                   </div>
//                 </div>
//               </div>
//               {p.inStock && (
//                 <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
//                   <button style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>📞 {p.phone}</button>
//                   <button style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "none", background: "#25D366", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>💬 WhatsApp</button>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }




//--------------------------------------------------new claude ke bhajje se --------------------------------------------------//

"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const C = { primary: "#1B6CA8", primaryDark: "#0F4C7A", green: "#1E8449", red: "#C0392B", bg: "#F0F4F8", card: "#FFFFFF", text: "#1A2332", muted: "#6B7C93", border: "#DDE3EC" };

interface Medicine { name: string; dose: string; note: string; }

// Data is now fetched dynamically from MongoDB

export default function MedicinePage() {
  const router = useRouter();
  const [lang, setLang] = useState("hi");
  const [prescribedMeds, setPrescribedMeds] = useState<Medicine[]>([]);
  const [active, setActive] = useState("");
  const [search, setSearch] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [pharmacists, setPharmacists] = useState<any[]>([]);

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "hi");
    const raw = localStorage.getItem("prescribedMedicines");
    if (raw) {
      try {
        const meds: Medicine[] = JSON.parse(raw);
        setPrescribedMeds(meds);
        if (meds.length > 0) { setActive(meds[0].name); setSearch(meds[0].name); }
      } catch { /* ignore */ }
    }
    
    // Fetch live pharmacists without caching
    fetch(`/api/pharmacist?_t=${Date.now()}`)
      .then(r => r.json())
      .then(d => {
        if (d.pharmacies) setPharmacists(d.pharmacies);
      })
      .catch(() => {});
      
    setHydrated(true);
  }, []);

  const T = (hi: string, en: string) => lang === "hi" ? hi : en;
  const displayMed = active || search;
  const hasPrescribed = prescribedMeds.length > 0;

  if (!hydrated) return null;

  const pharmacyRows = pharmacists.map(p => {
    const medStock = displayMed ? p.stock?.find((s: any) => s.medicineName.toLowerCase().includes(displayMed.toLowerCase())) : null;
    return {
      id: p._id,
      name: p.storeName || p.name,
      village: p.village,
      dist: p.distanceKm || "—",
      phone: p.phone,
      type: p.type || "Private",
      qty: medStock?.qty || 0,
      inStock: medStock?.inStock || false,
      price: medStock?.price || "—",
    };
  }).sort((a, b) => (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0));

  const availableCount = pharmacyRows.filter(p => p.inStock).length;

  return (
    <div style={{ background: "#0d1520", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 390, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Status bar */}
        <div style={{ background: "#FDEDED", padding: "6px 16px", fontSize: 12, fontWeight: 700, color: C.red, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red }} />
          {T("ऑफलाइन — फार्मेसी डेटा डिवाइस से", "Offline — Pharmacy data from device")}
        </div>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", gap: 10, background: C.card, borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => router.push("/home")} style={{ width: 36, height: 36, borderRadius: 10, background: C.bg, border: "none", fontSize: 18, cursor: "pointer" }}>←</button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{T("दवाई खोजें", "Find Medicine")}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{T("पास की फार्मेसी में उपलब्धता", "Availability at nearby pharmacies")}</div>
          </div>
        </div>
        {/* Prescribed banner */}
        {hasPrescribed && !manualMode && (
          <div style={{ background: "#E8F8EF", padding: "7px 14px", borderBottom: "1px solid #A9DFBF", display: "flex", alignItems: "center", gap: 6 }}>
            <span>✅</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{T("ट्राइएज से निर्धारित दवाएं", "Showing your prescribed medicines")}</span>
          </div>
        )}
        {/* Search + tabs */}
        <div style={{ padding: "10px 14px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
          {hasPrescribed && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {prescribedMeds.map(med => (
                <button key={med.name} onClick={() => { setActive(med.name); setSearch(med.name); setManualMode(false); }}
                  style={{ padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0, background: active === med.name && !manualMode ? C.primary : C.bg, color: active === med.name && !manualMode ? "white" : C.text, transition: "all .2s" }}>
                  💊 {med.name.split(" ")[0]}
                </button>
              ))}
              <button onClick={() => { setManualMode(true); setSearch(""); setActive(""); }}
                style={{ padding: "7px 14px", borderRadius: 20, border: `1px dashed ${C.border}`, cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0, background: manualMode ? "#EBF4FD" : C.bg, color: C.primary }}>
                🔍 {T("अन्य", "Other")}
              </button>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", border: `2px solid ${manualMode ? C.primary : C.border}`, borderRadius: 12, overflow: "hidden", background: C.bg }}>
            <span style={{ padding: "10px 14px", fontSize: 18 }}>🔍</span>
            <input style={{ flex: 1, border: "none", outline: "none", fontSize: 15, padding: "10px 0", background: "transparent", fontFamily: "inherit" }}
              placeholder={T("दवाई का नाम लिखें...", "Type medicine name...")} value={search}
              onChange={e => { setSearch(e.target.value); setActive(e.target.value); setManualMode(true); }} />
          </div>
          {/* Dose hint */}
          {!manualMode && active && (() => {
            const med = prescribedMeds.find(m => m.name === active);
            if (!med) return null;
            return (
              <div style={{ marginTop: 8, background: "#EBF4FD", borderRadius: 10, padding: "8px 12px" }}>
                <div style={{ fontSize: 12, color: C.primary, fontWeight: 700 }}>💊 {T("खुराक:", "Dose:")} {med.dose}</div>
                {med.note && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" }}>{med.note}</div>}
              </div>
            );
          })()}
        </div>
        {/* Map placeholder */}
        <div style={{ height: 110, position: "relative", background: "#E8F0E0", flexShrink: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(150,170,130,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(150,170,130,.3) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
          <div style={{ position: "absolute", top: "42%", left: 0, right: 0, height: 5, background: "#D4C5A0" }} />
          <div style={{ position: "absolute", top: "68%", left: 0, right: 0, height: 3, background: "#D4C5A0" }} />
          <div style={{ position: "absolute", left: "28%", top: 0, bottom: 0, width: 4, background: "#D4C5A0" }} />
          {[["20%","38%"],["55%","28%"],["70%","60%"],["38%","62%"]].map(([l,tp],i)=>(
            <div key={i} style={{ position:"absolute", left:l, top:tp, fontSize:18 }}>📍</div>
          ))}
          <div style={{ position: "absolute", bottom: 6, right: 8, fontSize: 11, color: C.muted, background: "rgba(255,255,255,.85)", padding: "3px 8px", borderRadius: 8, fontWeight: 600 }}>🗺️ Nabha District</div>
        </div>
        {/* Results */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 80px" }}>
          {displayMed ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, margin: "10px 0 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{displayMed}</span>
                <span style={{ fontSize: 12, color: availableCount > 0 ? C.green : C.red, fontWeight: 700 }}>
                  {availableCount}/{pharmacists.length} {T("उपलब्ध", "available")}
                </span>
              </div>
              {pharmacyRows.map((p, i) => (
                <div key={i} style={{ background: C.card, borderRadius: 16, padding: 14, marginBottom: 10, border: `1px solid ${C.border}`, opacity: p.inStock ? 1 : .6 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: p.inStock ? "#E8F8EF" : "#FDEDED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>💊</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>📍 {p.village} · {p.dist} km</div>
                        </div>
                        <span style={{ background: p.type === "Govt Free" ? "#E8F8EF" : p.type === "Jan Aushadhi" ? "#EBF4FD" : C.bg, color: p.type === "Govt Free" ? C.green : p.type === "Jan Aushadhi" ? C.primary : C.muted, borderRadius: 8, padding: "3px 8px", fontSize: 10, fontWeight: 700 }}>{p.type}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: p.inStock ? C.green : C.red }}>
                          {p.inStock ? `✓ ${T("उपलब्ध", "In Stock")}` : `✗ ${T("उपलब्ध नहीं", "Out of Stock")}`}
                          {p.inStock ? ` (${p.qty})` : ""}
                        </span>
                        {p.inStock && <span style={{ fontSize: 13, fontWeight: 800, color: C.primary }}>{p.price}</span>}
                      </div>
                    </div>
                  </div>
                  {p.inStock && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <a href={`tel:${p.phone}`} style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "none", color: C.text, textAlign: "center" }}>📞 {p.phone}</a>
                      <a href={`https://wa.me/91${p.phone}`} target="_blank" rel="noreferrer"
                        style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "none", background: "#25D366", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "none", textAlign: "center" }}>💬 WhatsApp</a>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{T("दवाई का नाम लिखें", "Type a medicine name to search")}</div>
            </div>
          )}
        </div>
        {/* Bottom nav */}
        <div style={{ position: "fixed", bottom: 0, width: 390, background: C.card, borderTop: `2px solid ${C.border}`, padding: "10px 16px", display: "flex", gap: 8, zIndex: 50 }}>
          <button onClick={() => router.push("/report")} style={{ flex: 1, padding: 12, borderRadius: 14, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: "linear-gradient(135deg,#7B1FA2,#4A0072)", color: "white" }}>
            📋 {T("रिपोर्ट देखें", "View Report")}
          </button>
          <button onClick={() => router.push("/home")} style={{ flex: 1, padding: 12, borderRadius: 14, border: `1px solid ${C.border}`, cursor: "pointer", fontWeight: 700, fontSize: 13, background: C.bg, color: C.text }}>
            🏠 {T("होम", "Home")}
          </button>
        </div>
      </div>
    </div>
  );
}