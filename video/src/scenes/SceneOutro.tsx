import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14 } });
  const o2 = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });
  const o3 = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: "clamp" });
  const pulse = 1 + Math.sin(frame / 10) * 0.03;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 36 }}>
      <div style={{ transform: `scale(${s * pulse})`, width: 200, height: 200, borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 80px rgba(212,165,116,0.4)" }}>
        <Img src={staticFile("logo.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ opacity: o2, fontSize: 76, fontWeight: 800, color: theme.text, textAlign: "center" }}>
        2mc <span style={{ color: theme.accent }}>Gastro</span>
      </div>
      <div style={{ opacity: o3, fontSize: 32, color: theme.textDim, textAlign: "center", maxWidth: 1200, lineHeight: 1.4 }}>
        Mutfağınızı dijitalleştirin.<br />
        <span style={{ color: theme.accent2 }}>2mcgastro.com</span>
      </div>
    </AbsoluteFill>
  );
};
