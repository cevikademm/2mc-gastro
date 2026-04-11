import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

const langs = [
  { code: "TR", label: "Türkçe" },
  { code: "EN", label: "English" },
  { code: "DE", label: "Deutsch" },
  { code: "FR", label: "Français" },
  { code: "NL", label: "Nederlands" },
];

export const SceneLanguages: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, padding: 80, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 60 }}>
      <div style={{ opacity: o, textAlign: "center" }}>
        <div style={{ color: theme.accent, fontSize: 24, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>05 — Global</div>
        <div style={{ color: theme.text, fontSize: 72, fontWeight: 800, marginTop: 8 }}>5 Dil, Tek Platform</div>
      </div>
      <div style={{ display: "flex", gap: 30 }}>
        {langs.map((l, i) => {
          const s = spring({ frame: frame - 25 - i * 10, fps, config: { damping: 12 } });
          return (
            <div key={l.code} style={{ transform: `scale(${s})`, opacity: s, width: 200, height: 200, borderRadius: 24, background: theme.bgCard, border: `2px solid ${theme.accent}55`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ fontSize: 56, fontWeight: 900, color: theme.accent }}>{l.code}</div>
              <div style={{ fontSize: 20, color: theme.textDim }}>{l.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
