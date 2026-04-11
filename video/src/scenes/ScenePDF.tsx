import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export const ScenePDF: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const s = spring({ frame: frame - 30, fps, config: { damping: 14 } });
  const r = interpolate(frame, [30, 200], [-8, 4]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, padding: 80, flexDirection: "row", alignItems: "center", gap: 80 }}>
      <div style={{ flex: 1, opacity: o }}>
        <div style={{ color: theme.accent, fontSize: 24, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>04 — Modül</div>
        <div style={{ color: theme.text, fontSize: 72, fontWeight: 800, marginTop: 8 }}>PDF Teklif</div>
        <div style={{ color: theme.textDim, fontSize: 26, marginTop: 16, lineHeight: 1.5 }}>
          Hologram filigranlı, marka kimliğine uygun<br />profesyonel teklif çıktısı.
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 420, height: 560, background: "#fff", borderRadius: 8, boxShadow: "0 40px 100px rgba(212,165,116,0.3)", transform: `scale(${s}) rotate(${r}deg)`, padding: 32, display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${theme.accent}22, transparent 60%)`, pointerEvents: "none" }} />
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0a0a0f" }}>2mc Gastro</div>
          <div style={{ fontSize: 14, color: "#666" }}>TEKLİF — TK-2026-0407</div>
          <div style={{ height: 2, background: theme.accent, margin: "8px 0" }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#333" }}>
              <div>Kalem {i}</div>
              <div style={{ color: theme.accent, fontWeight: 700 }}>€{(i * 980).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
