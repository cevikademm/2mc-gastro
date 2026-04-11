import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

const Card: React.FC<{ delay: number; label: string }> = ({ delay, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  return (
    <div style={{ transform: `scale(${s})`, opacity: s, backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 24, width: 220, height: 260, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ width: "100%", height: 140, borderRadius: 12, background: `linear-gradient(135deg, ${theme.accent}33, ${theme.accent}11)`, border: `1px solid ${theme.accent}44` }} />
      <div style={{ color: theme.text, fontSize: 18, fontWeight: 600 }}>{label}</div>
    </div>
  );
};

export const SceneDiamond: React.FC = () => {
  const frame = useCurrentFrame();
  const titleO = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [-20, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, padding: 80, flexDirection: "column", gap: 50 }}>
      <div style={{ opacity: titleO, transform: `translateY(${titleY}px)` }}>
        <div style={{ color: theme.accent, fontSize: 24, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>01 — Modül</div>
        <div style={{ color: theme.text, fontSize: 72, fontWeight: 800, marginTop: 8 }}>Diamond Katalog</div>
        <div style={{ color: theme.textDim, fontSize: 28, marginTop: 12 }}>Binlerce ürün, akıllı filtreler, 3 farklı görünüm</div>
      </div>
      <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 20 }}>
        {["Buzdolapları", "Fırınlar", "Pişirme", "Hazırlık", "Servis", "Bulaşık"].map((l, i) => (
          <Card key={l} delay={30 + i * 8} label={l} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
