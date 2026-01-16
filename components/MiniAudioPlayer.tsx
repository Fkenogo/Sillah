
import React, { useState, useRef, useEffect } from 'react';

interface MiniAudioPlayerProps {
  url: string;
  label?: string;
  compact?: boolean;
}

export const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = ({ url, label = "Audio Msg", compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', onEnded);
    };
  }, [url]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`flex items-center gap-3 px-3 py-2 bg-white/60 rounded-xl border border-white ${compact ? '' : 'shadow-sm'}`}>
      <audio ref={audioRef} src={url} preload="metadata" />
      <button 
        onClick={togglePlayback}
        className="w-8 h-8 bg-siilah-sage text-white rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all flex-shrink-0"
      >
        <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-[10px] ${!isPlaying && 'ml-0.5'}`}></i>
      </button>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full relative overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-siilah-sage rounded-full transition-all duration-100 linear" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-[8px] font-bold uppercase text-gray-400 whitespace-nowrap">{label}</span>
    </div>
  );
};
