'use client';

import { useState } from 'react';
import { collection, getDocs, query as firestoreQuery, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Mic, MicOff } from 'lucide-react';

type BrowserRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserRecognitionCtor = new () => BrowserRecognition;

interface SpeechCapableWindow extends Window {
  SpeechRecognition?: BrowserRecognitionCtor;
  webkitSpeechRecognition?: BrowserRecognitionCtor;
}

function getRecognitionCtor(): BrowserRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const speechWindow = window as SpeechCapableWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export default function AudioInterface() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  async function handleVoiceCommand() {
    const RecognitionCtor = getRecognitionCtor();
    if (!RecognitionCtor) {
      setError('Voice recognition not supported. Use Chrome or Edge browser.');
      return;
    }

    setError('');
    setTranscript('');
    setResponse('');

    try {
      const recognition = new RecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        console.log('Voice recognition started');
      };
      
      recognition.onend = () => {
        setIsListening(false);
        console.log('Voice recognition ended');
      };
      
      recognition.onerror = (event: any) => {
        setIsListening(false);
        console.error('Voice recognition error:', event);
        setError(`Error: ${event.error || 'Unknown error'}`);
      };

      recognition.onresult = async (event: any) => {
        try {
          const userQuery = String(event?.results?.[0]?.[0]?.transcript ?? '').trim();
          console.log('Recognized:', userQuery);
          
          if (!userQuery) {
            setError('No speech detected. Please try again.');
            return;
          }
          
          setTranscript(userQuery);
          const agentResponse = await processVoiceQuery(userQuery);
          setResponse(agentResponse);

          // Speak response
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(agentResponse);
            utterance.rate = 0.95;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
          }
        } catch (err) {
          console.error('Processing error:', err);
          setError('Failed to process voice command');
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Recognition start error:', err);
      setError('Failed to start voice recognition');
      setIsListening(false);
    }
  }

  async function processVoiceQuery(input: string): Promise<string> {
    const q = input.toLowerCase();

    if (q.includes('at risk') || q.includes('high risk') || q.includes('risk')) {
      try {
        const atRiskSnapshot = await getDocs(
          firestoreQuery(collection(db, 'shipments'), where('status', '==', 'at_risk'))
        );
        const reroutedSnapshot = await getDocs(
          firestoreQuery(collection(db, 'shipments'), where('status', '==', 'rerouted'))
        );

        const atRiskCount = atRiskSnapshot.size;
        const reroutedCount = reroutedSnapshot.size;
        const totalRisk = atRiskCount + reroutedCount;

        if (totalRisk === 0) {
          return 'All shipments are currently on track. No high-risk alerts at this time.';
        }

        return `${totalRisk} shipments need attention. ${atRiskCount} are at risk and ${reroutedCount} have been autonomously rerouted by CASCADE.`;
      } catch (err) {
        console.error('Query error:', err);
        return 'Unable to fetch shipment data at this time.';
      }
    }

    if (q.includes('autonomous') || q.includes('executed') || q.includes('agent') || q.includes('action')) {
      try {
        const decisionsSnapshot = await getDocs(
          firestoreQuery(collection(db, 'decisions'), where('executedBy', '==', 'CASCADE_AGENT'))
        );
        const count = decisionsSnapshot.size;
        return `I have autonomously executed ${count} decisions, including reroutes and workflow automations. All actions are logged and monitored in real-time.`;
      } catch (err) {
        console.error('Query error:', err);
        return 'Unable to fetch decision data at this time.';
      }
    }

    if (q.includes('hello') || q.includes('hi')) {
      return 'Hello! I am CASCADE, your autonomous supply chain agent. Ask me about at-risk shipments or autonomous decisions.';
    }

    return 'I am CASCADE, your autonomous supply chain agent. You can ask me about at-risk shipments, autonomous actions, or agent decisions.';
  }

  return (
    <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 rounded-xl shadow-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <Mic className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Voice Command</h2>
          <p className="text-xs text-cyan-300">Ask CASCADE about your fleet</p>
        </div>
      </div>

      <button
        onClick={handleVoiceCommand}
        disabled={isListening}
        className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
          isListening 
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg shadow-red-500/50' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/50'
        }`}
      >
        <span className="flex items-center justify-center gap-3">
          {isListening ? (
            <>
              <MicOff className="w-6 h-6 animate-pulse" />
              Listening...
            </>
          ) : (
            <>
              <Mic className="w-6 h-6" />
              Ask CASCADE
            </>
          )}
        </span>
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm font-semibold text-red-300">⚠️ {error}</p>
          <p className="text-xs text-red-400 mt-1">Try using Chrome or Edge browser for voice support.</p>
        </div>
      )}

      {transcript && (
        <div className="mt-4 p-4 bg-white/5 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
          <p className="text-sm font-bold text-cyan-400 mb-1">You said:</p>
          <p className="text-base text-white">"{transcript}"</p>
        </div>
      )}

      {response && (
        <div className="mt-3 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/50 rounded-lg backdrop-blur-sm">
          <p className="text-sm font-bold text-cyan-300 mb-2">CASCADE Response:</p>
          <p className="text-base text-white leading-relaxed">{response}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-cyan-300/70 space-y-1">
        <p>💡 Try asking:</p>
        <ul className="list-disc list-inside space-y-1 text-cyan-400/60">
          <li>"How many shipments are at risk?"</li>
          <li>"What autonomous actions have been executed?"</li>
          <li>"Tell me about agent decisions"</li>
        </ul>
      </div>
    </div>
  );
}
