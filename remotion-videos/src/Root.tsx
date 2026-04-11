import { Composition } from "remotion";
import { SpiralMixerVideo } from "./SpiralMixerVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SpiralMixer"
        component={SpiralMixerVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
