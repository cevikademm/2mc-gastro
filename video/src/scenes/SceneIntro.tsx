import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [20, 50], [30, 0], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
      <div style={{ transform: `scale(${scale})`, opacity, width: 280, height: 280, borderRadius: 32, overflow: "hidden", boxShadow: "0 30px 80px rgba(212,165,116,0.25)" }}>
        <Img src={staticFile("logo.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ transform: `translateY(${titleY}px)`, opacity: titleOpacity, color: theme.text, fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>
        2mc <span style={{ color: theme.accent }}>Gastro</span>
      </div>
    </AbsoluteFill>
  );
};
