import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

export const SceneTagline: React.FC = () => {
  const frame = useCurrentFrame();
  const o1 = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const o2 = interpolate(frame, [40, 65], [0, 1], { extrapolateRight: "clamp" });
  const y1 = interpolate(frame, [0, 25], [40, 0], { extrapolateRight: "clamp" });
  const y2 = interpolate(frame, [40, 65], [40, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30, padding: 80 }}>
      <div style={{ opacity: o1, transform: `translateY(${y1}px)`, fontSize: 32, color: theme.accent, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase" }}>
        Profesyonel Mutfak Platformu
      </div>
      <div style={{ opacity: o2, transform: `translateY(${y2}px)`, fontSize: 72, color: theme.text, fontWeight: 800, textAlign: "center", lineHeight: 1.15, maxWidth: 1400 }}>
        Katalogdan teklife,<br />tasarımdan siparişe — <span style={{ color: theme.accent }}>tek platform</span>
      </div>
    </AbsoluteFill>
  );
};
