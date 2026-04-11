import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

const rows = [
  { name: "Endüstriyel Buzdolabı 600L", qty: 2, price: "€2.450" },
  { name: "Konveksiyonlu Fırın", qty: 1, price: "€3.890" },
  { name: "6'lı Gazlı Ocak", qty: 1, price: "€1.650" },
  { name: "Paslanmaz Hazırlık Tezgahı", qty: 4, price: "€780" },
  { name: "Bulaşık Makinesi", qty: 1, price: "€2.100" },
];

export const SceneBOM: React.FC = () => {
  const frame = useCurrentFrame();
  const titleO = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const total = interpolate(frame, [120, 200], [0, 14620], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, padding: 80, flexDirection: "column", gap: 40 }}>
      <div style={{ opacity: titleO }}>
        <div style={{ color: theme.accent, fontSize: 24, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>03 — Modül</div>
        <div style={{ color: theme.text, fontSize: 72, fontWeight: 800, marginTop: 8 }}>BOM & Sepet</div>
        <div style={{ color: theme.textDim, fontSize: 26, marginTop: 8 }}>Proje malzeme listesi ve maliyet hesabı</div>
      </div>
      <div style={{ background: theme.bgCard, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 32 }}>
        {rows.map((r, i) => {
          const o = interpolate(frame, [30 + i * 12, 50 + i * 12], [0, 1], { extrapolateRight: "clamp" });
          const x = interpolate(frame, [30 + i * 12, 50 + i * 12], [-40, 0], { extrapolateRight: "clamp" });
          return (
            <div key={r.name} style={{ display: "flex", justifyContent: "space-between", padding: "18px 0", borderBottom: `1px solid ${theme.border}`, opacity: o, transform: `translateX(${x}px)` }}>
              <div style={{ color: theme.text, fontSize: 26 }}>{r.name}</div>
              <div style={{ display: "flex", gap: 60 }}>
                <div style={{ color: theme.textDim, fontSize: 26 }}>×{r.qty}</div>
                <div style={{ color: theme.accent, fontSize: 26, fontWeight: 700, width: 140, textAlign: "right" }}>{r.price}</div>
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 24 }}>
          <div style={{ color: theme.text, fontSize: 32, fontWeight: 700 }}>Toplam</div>
          <div style={{ color: theme.accent2, fontSize: 40, fontWeight: 800 }}>€{Math.round(total).toLocaleString("de-DE")}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
