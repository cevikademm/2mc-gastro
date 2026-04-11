import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
  Easing,
} from "remotion";

// Single flour particle
const FlourParticle: React.FC<{
  x: number;
  y: number;
  size: number;
  delay: number;
  speedX: number;
  speedY: number;
  rotation: number;
  opacity: number;
}> = ({ x, y, size, delay, speedX, speedY, rotation, opacity }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - delay);

  const currentX = x + speedX * t * 0.8;
  const currentY = y + speedY * t * 0.5 + t * t * 0.008; // slight gravity
  const currentRotation = rotation + t * 2;
  const fadeOut = interpolate(t, [0, 40, 80], [0, opacity, 0], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(t, [0, 20, 80], [0.3, 1, 0.5], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${currentX}%`,
        top: `${currentY}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,248,230,${fadeOut}) 0%, rgba(240,225,190,${fadeOut * 0.5}) 100%)`,
        transform: `rotate(${currentRotation}deg) scale(${scale})`,
        filter: `blur(${size > 10 ? 2 : 0.5}px)`,
        pointerEvents: "none",
      }}
    />
  );
};

// Flour cloud / dust wave
const FlourCloud: React.FC<{
  x: number;
  y: number;
  delay: number;
  scale: number;
  direction: number;
}> = ({ x, y, delay, scale, direction }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - delay);

  const spread = interpolate(t, [0, 60, 150], [0, 120 * scale, 200 * scale], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(t, [0, 20, 80, 150], [0, 0.25, 0.15, 0], {
    extrapolateRight: "clamp",
  });
  const yDrift = interpolate(t, [0, 150], [0, -30], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y + yDrift * 0.1}%`,
        width: spread,
        height: spread * 0.6,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, rgba(255,245,220,${fadeOut}) 0%, rgba(240,220,180,${fadeOut * 0.3}) 60%, transparent 100%)`,
        transform: `translate(-50%, -50%) scaleX(${direction > 0 ? 1 : -1})`,
        filter: "blur(20px)",
        pointerEvents: "none",
      }}
    />
  );
};

// Generate deterministic random
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export const SpiralMixerVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // === CAMERA / SCENE MOTION ===
  // Slow cinematic drift
  const sceneX = interpolate(frame, [0, 100, 200, 300], [0, -15, 10, 0], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const sceneY = interpolate(frame, [0, 80, 180, 300], [0, -8, 5, 0], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const sceneScale = interpolate(
    frame,
    [0, 50, 150, 250, 300],
    [1.15, 1.05, 1.1, 1.02, 1.08],
    {
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    }
  );
  const sceneRotation = interpolate(
    frame,
    [0, 150, 300],
    [0, -0.8, 0.3],
    {
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.sin),
    }
  );

  // === PRODUCT ANIMATION ===
  // Fade in from dark
  const productOpacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Subtle floating motion
  const floatY = Math.sin(frame * 0.04) * 6;
  const floatX = Math.cos(frame * 0.03) * 4;

  // === CINEMATIC LIGHTING ===
  // Moving spotlight
  const lightX = interpolate(
    frame,
    [0, 100, 200, 300],
    [30, 60, 40, 55],
    { extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) }
  );
  const lightY = interpolate(
    frame,
    [0, 100, 200, 300],
    [20, 35, 25, 30],
    { extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) }
  );
  const lightIntensity = interpolate(
    frame,
    [0, 30, 150, 300],
    [0, 0.7, 0.85, 0.6],
    { extrapolateRight: "clamp" }
  );

  // === BACKGROUND ===
  const bgBrightness = interpolate(frame, [0, 50, 250, 300], [0, 0.12, 0.15, 0.05], {
    extrapolateRight: "clamp",
  });

  // Generate flour particles
  const particles = [];
  for (let i = 0; i < 120; i++) {
    const seed = i;
    particles.push({
      x: 30 + seededRandom(seed * 1) * 40,
      y: 25 + seededRandom(seed * 2) * 50,
      size: 3 + seededRandom(seed * 3) * 18,
      delay: seededRandom(seed * 4) * 200,
      speedX: (seededRandom(seed * 5) - 0.5) * 3,
      speedY: (seededRandom(seed * 6) - 0.5) * 2,
      rotation: seededRandom(seed * 7) * 360,
      opacity: 0.15 + seededRandom(seed * 8) * 0.45,
    });
  }

  // Generate flour clouds
  const clouds = [];
  for (let i = 0; i < 8; i++) {
    clouds.push({
      x: 35 + seededRandom(i * 10 + 1) * 30,
      y: 35 + seededRandom(i * 10 + 2) * 30,
      delay: 10 + seededRandom(i * 10 + 3) * 120,
      scale: 0.8 + seededRandom(i * 10 + 4) * 1.5,
      direction: seededRandom(i * 10 + 5) > 0.5 ? 1 : -1,
    });
  }

  // Vignette pulse
  const vignetteIntensity = interpolate(
    frame,
    [0, 50, 250, 300],
    [1, 0.6, 0.65, 0.9],
    { extrapolateRight: "clamp" }
  );

  // Final fade out
  const fadeOut = interpolate(frame, [260, 300], [1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Dark cinematic background with subtle warm tone */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${lightX}% ${lightY}%, rgba(60,45,25,${bgBrightness}) 0%, rgba(15,12,8,0.95) 60%, #0a0a0a 100%)`,
        }}
      />

      {/* Scene container with camera motion */}
      <AbsoluteFill
        style={{
          transform: `translate(${sceneX}px, ${sceneY}px) scale(${sceneScale}) rotate(${sceneRotation}deg)`,
          opacity: fadeOut,
        }}
      >
        {/* Flour clouds - behind product */}
        {clouds.map((c, i) => (
          <FlourCloud key={`cloud-${i}`} {...c} />
        ))}

        {/* Back flour particles - behind product */}
        {particles.slice(0, 60).map((p, i) => (
          <FlourParticle key={`bp-${i}`} {...p} />
        ))}

        {/* Cinematic spotlight on product */}
        <div
          style={{
            position: "absolute",
            left: `${lightX - 15}%`,
            top: `${lightY - 20}%`,
            width: "50%",
            height: "60%",
            borderRadius: "50%",
            background: `radial-gradient(ellipse, rgba(255,240,200,${lightIntensity * 0.12}) 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* PRODUCT - Spiral Mixer */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translate(${floatX}px, ${floatY}px)`,
            opacity: productOpacity,
            filter: `brightness(${0.85 + lightIntensity * 0.3}) contrast(1.15) drop-shadow(0 20px 60px rgba(0,0,0,0.8)) drop-shadow(0 0 100px rgba(180,150,100,${lightIntensity * 0.15}))`,
            width: "55%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Img
            src={staticFile("spiral-mixer.png")}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Front flour particles - in front of product */}
        {particles.slice(60).map((p, i) => (
          <FlourParticle key={`fp-${i}`} {...p} />
        ))}

        {/* Secondary burst waves */}
        {[80, 140, 200].map((burstFrame, i) => {
          const burstT = Math.max(0, frame - burstFrame);
          const burstRadius = interpolate(burstT, [0, 60], [0, 600], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });
          const burstOpacity = interpolate(burstT, [0, 10, 60], [0, 0.08, 0], {
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={`burst-${i}`}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: burstRadius,
                height: burstRadius,
                borderRadius: "50%",
                border: `2px solid rgba(255,240,200,${burstOpacity})`,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Cinematic vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,${vignetteIntensity}) 100%)`,
          pointerEvents: "none",
          opacity: fadeOut,
        }}
      />

      {/* Film grain overlay */}
      <AbsoluteFill
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
          transform: `translate(${(frame * 7) % 128}px, ${(frame * 11) % 128}px)`,
          pointerEvents: "none",
          mixBlendMode: "overlay",
        }}
      />

      {/* Letterbox bars for extra cinematic feel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "5%",
          background: "linear-gradient(to bottom, #000 60%, transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "5%",
          background: "linear-gradient(to top, #000 60%, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};
