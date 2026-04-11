import { AbsoluteFill, Series } from "remotion";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneTagline } from "./scenes/SceneTagline";
import { SceneDiamond } from "./scenes/SceneDiamond";
import { SceneDesignStudio } from "./scenes/SceneDesignStudio";
import { SceneBOM } from "./scenes/SceneBOM";
import { ScenePDF } from "./scenes/ScenePDF";
import { SceneLanguages } from "./scenes/SceneLanguages";
import { SceneOutro } from "./scenes/SceneOutro";

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0f", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Series>
        <Series.Sequence durationInFrames={150}><SceneIntro /></Series.Sequence>
        <Series.Sequence durationInFrames={180}><SceneTagline /></Series.Sequence>
        <Series.Sequence durationInFrames={240}><SceneDiamond /></Series.Sequence>
        <Series.Sequence durationInFrames={240}><SceneDesignStudio /></Series.Sequence>
        <Series.Sequence durationInFrames={240}><SceneBOM /></Series.Sequence>
        <Series.Sequence durationInFrames={240}><ScenePDF /></Series.Sequence>
        <Series.Sequence durationInFrames={240}><SceneLanguages /></Series.Sequence>
        <Series.Sequence durationInFrames={270}><SceneOutro /></Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
