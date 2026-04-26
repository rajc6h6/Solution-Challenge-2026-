'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        setIsProcessing(true);
        onRecordingComplete(blob);
        setTimeout(() => setIsProcessing(false), 3000);
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown microphone error';
      console.error('Mic error:', errorMessage);
      alert('Microphone access denied. Please allow microphone access.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`relative flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
          isRecording
            ? 'bg-red-600 border border-red-400/50 text-white animate-record shadow-lg shadow-red-900/40'
            : isProcessing
            ? 'bg-cyan/10 border border-cyan/30 text-cyan cursor-wait'
            : 'bg-cyan text-obsidian hover:bg-cyan/90 shadow-lg shadow-cyan/20 border border-cyan/50'
        }`}
      >
        {isRecording ? (
          <><Square className="w-4 h-4 fill-current" /> Stop Recording</>
        ) : isProcessing ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
        ) : (
          <><Mic className="w-4 h-4" /> Ask CASCADE</>
        )}

        {/* Recording indicator rings */}
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-xl ring-2 ring-red-400/40 animate-ping" />
          </>
        )}
      </button>

      {isRecording && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full"
              style={{
                height: `${8 + Math.random() * 20}px`,
                animation: `sound-bar 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes sound-bar {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
