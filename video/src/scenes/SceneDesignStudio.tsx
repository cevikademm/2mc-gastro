import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

export const SceneDesignStudio: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const rotate = interpolate(frame, [0, 240], [0, 360]);
  const x = interpolate(frame, [0, 30], [-60, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, padding: 80, flexDirection: "row", alignItems: "center", gap: 80 }}>
      <div style={{ flex: 1, opacity: o, transform: `translateX(${x}px)` }}>
        <div style={{ color: theme.accent, fontSize: 24, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>02 — Modül</div>
        <div style={{ color: theme.text, fontSize: 72, fontWeight: 800, marginTop: 8 }}>Design Studio</div>
        <div style={{ color: theme.textDim, fontSize: 26, marginTop: 16, lineHeight: 1.5 }}>
          Mutfağını sürükle-bırak ile tasarla.<br />
          <span style={{ color: theme.accent2 }}>Meshy AI</span> ile anında 3D model üretimi.
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 420, height: 420, perspective: 1000 }}>
          <div style={{ width: "100%", height: "100%", transform: `rotateY(${rotate}deg) rotateX(15deg)`, transformStyle: "preserve-3d", position: "relative" }}>
            {[
              { t: "translateZ(120px)", c: theme.accent },
              { t: "translateZ(-120px)", c: theme.accent2 },
              { t: "rotateY(90deg) translateZ(120px)", c: "#8b6b3f" },
              { t: "rotateY(-90deg) translateZ(120px)", c: "#b88a52" },
              { t: "rotateX(90deg) translateZ(120px)", c: "#e5b878" },
              { t: "rotateX(-90deg) translateZ(120px)", c: "#6b4e2a" },
            ].map((f, i) => (
              <div key={i} style={{ position: "absolute", inset: "50% 50%", width: 240, height: 240, marginLeft: -120, marginTop: -120, background: f.c, opacity: 0.85, border: `2px solid ${theme.accent}`, transform: f.t }} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
