
import React, { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (blobUrl: string) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const MAX_DURATION = 180; // 3 minutes per PRD

  useEffect(() => {
    startRecording();
    return () => stopRecording();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onRecordingComplete(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setDuration(d => {
          if (d >= MAX_DURATION) {
            stopRecording();
            return d;
          }
          return d + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 bg-siilah-sage/10 p-4 rounded-2xl border border-siilah-sage/20 animate-in fade-in duration-300">
      <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center animate-pulse">
        <i className="fa-solid fa-microphone"></i>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-siilah-slate uppercase tracking-widest">Recording Voice Note</span>
          <span className="text-[10px] font-bold text-red-500">{formatTime(duration)} / 3:00</span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-1000 linear" 
            style={{ width: `${(duration / MAX_DURATION) * 100}%` }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onCancel}
          className="w-8 h-8 rounded-full bg-white text-gray-400 flex items-center justify-center hover:text-red-500 transition-colors shadow-sm"
        >
          <i className="fa-solid fa-xmark text-xs"></i>
        </button>
        <button 
          onClick={stopRecording}
          className="px-4 py-1.5 bg-siilah-sage text-white text-[10px] font-bold uppercase rounded-full shadow-md"
        >
          Done
        </button>
      </div>
    </div>
  );
};
