// components/AudioToggleButton.jsx
import { useAudio } from "./audioPlayer.js";
import playIcon from "./imagesTest/icons/play-icon.webp";
import pauseIcon from "./imagesTest/icons/pause-icon.webp";

export default function AudioToggleButton() {
  const { isPlaying, togglePlay } = useAudio();

  return (
    <button
      onClick={togglePlay}
      style={{
        position: "fixed",
        bottom: "2%",
        right: "2%",
        width: "7vw",
        height: "6vw",
        cursor: "pointer",
        border: "none",
        background: "none",
        zIndex: 99, 
      }}
    >
      <img
        src={isPlaying ? pauseIcon : playIcon}
        alt={isPlaying ? "Pause" : "Play"}
        style={{ width: "100%", height: "100%",zIndex: 30, }}
      />
    </button>
  );
}