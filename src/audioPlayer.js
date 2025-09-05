import { createContext, useContext, useRef, useState } from "react";
import song from "./song.mp3";


const AudioContext = createContext();

export function AudioPlayer({ children }) {
  const audioRef = useRef(new Audio(song));
  audioRef.current.loop = true;
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <AudioContext.Provider value={{ isPlaying, togglePlay }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}