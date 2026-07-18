import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Radio, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  Mic, 
  Volume1, 
  Sliders, 
  Headphones 
} from 'lucide-react';

interface PflCueDeckProps {
  cuedItem: {
    id: string;
    title: string;
    type: 'program' | 'commercial' | 'promo' | 'filler';
    duration: number;
    category?: string;
    safetyRating?: string;
    loudnessDb?: number;
    description?: string;
  } | null;
  onClose: () => void;
}

export default function PflCueDeck({ cuedItem, onClose }: PflCueDeckProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [progress, setProgress] = useState<number>(0);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState<boolean>(true);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Web Audio Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const arpeggiatorTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Log function
  const addLog = (msg: string) => {
    setSystemLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 4)
    ]);
  };

  // Initialize Audio Context on user play
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const analyser = ctx.createAnalyser();

      // Configure analyser
      analyser.fftSize = 64;

      // Connect nodes
      filter.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);

      // Set initial state
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);

      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
      filterRef.current = filter;
      analyserRef.current = analyser;

      addLog("Studio PFL Audio Engine initialized");
    } catch (err) {
      console.error("Failed to initialize Web Audio API:", err);
      addLog("Audio Engine Error: browser restriction");
    }
  };

  // Sound generator
  const startSynthesizer = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      // 1. Warm base carrier drone (low sine/triangle)
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2 note
      
      const filterNode = filterRef.current;
      if (filterNode) {
        osc1.connect(filterNode);
      }
      osc1.start();
      osc1Ref.current = osc1;

      // 2. Dynamic arpeggio melody to sound like a program track
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220, ctx.currentTime);
      if (filterNode) {
        osc2.connect(filterNode);
      }
      osc2.start();
      osc2Ref.current = osc2;

      addLog(`Audition active for: "${cuedItem?.title}"`);

      // Arpeggiator pattern loop (futuristic broadcast signal)
      const notes = cuedItem?.type === 'commercial' 
        ? [261.63, 329.63, 392.00, 523.25] // Upbeat C Major triad (Commercials)
        : cuedItem?.type === 'filler'
        ? [220.00, 277.18, 329.63, 440.00] // Relaxing A Major triad (Filler/Ambient)
        : [146.83, 174.61, 220.00, 293.66]; // Dramatic D minor triad (Programs / Promos)

      let noteIndex = 0;
      const playMelody = () => {
        if (!osc2Ref.current || !audioCtxRef.current) return;
        const currentNote = notes[noteIndex % notes.length];
        
        // Add a bit of frequency slide (glide)
        osc2Ref.current.frequency.exponentialRampToValueAtTime(
          currentNote, 
          audioCtxRef.current.currentTime + 0.15
        );

        // Apply dynamic filter modulation
        if (filterRef.current && audioCtxRef.current) {
          const filterSweep = 400 + Math.sin(audioCtxRef.current.currentTime * 2) * 300;
          filterRef.current.frequency.setValueAtTime(filterSweep, audioCtxRef.current.currentTime);
        }

        noteIndex++;
        arpeggiatorTimerRef.current = window.setTimeout(playMelody, 300);
      };

      playMelody();

      // Trigger text-to-speech announcement
      if (isSpeechEnabled) {
        announceItem();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stopSynthesizer = () => {
    if (osc1Ref.current) {
      try { osc1Ref.current.stop(); } catch (e) {}
      osc1Ref.current.disconnect();
      osc1Ref.current = null;
    }
    if (osc2Ref.current) {
      try { osc2Ref.current.stop(); } catch (e) {}
      osc2Ref.current.disconnect();
      osc2Ref.current = null;
    }
    if (arpeggiatorTimerRef.current) {
      clearTimeout(arpeggiatorTimerRef.current);
      arpeggiatorTimerRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Text-To-Speech Cue Operator Announcement
  const announceItem = () => {
    if (!window.speechSynthesis || !cuedItem) return;
    window.speechSynthesis.cancel(); // Stop current speech

    const durationText = cuedItem.duration > 0 ? `${cuedItem.duration} minutes` : 'unknown duration';
    const typeLabel = cuedItem.type === 'program' ? 'full program sequence' : cuedItem.type;
    const ratingText = cuedItem.safetyRating ? `rated ${cuedItem.safetyRating}` : '';
    const text = `Pre-Fade Listen activated. Auditioning ${typeLabel} titled: ${cuedItem.title}. Duration is ${durationText}. ${ratingText}. Checking loudness parameters... compliant. Monitoring feed established.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // slightly deeper voice for professional radio feel

    // Find a nice English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en-') && v.name.includes('Google')) || 
                    voices.find(v => v.lang.startsWith('en-'));
    if (enVoice) utterance.voice = enVoice;

    utterance.onstart = () => {
      addLog("Voice-over announcement initiated");
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handle Play Toggle
  const handlePlayToggle = () => {
    if (!cuedItem) return;

    if (isPlaying) {
      stopSynthesizer();
      setIsPlaying(false);
      addLog("PFL feed paused");
    } else {
      initAudio();
      setIsPlaying(true);
      addLog("PFL feed resumed");
    }
  };

  // Handle Volume Change
  useEffect(() => {
    const currentVolume = isMuted ? 0 : volume;
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(currentVolume, audioCtxRef.current.currentTime);
    }
    if (window.speechSynthesis && isSpeechEnabled && isPlaying) {
      // Adjust speaking voice on-the-fly for any new sentences
    }
  }, [volume, isMuted]);

  // Effect to handle item change
  useEffect(() => {
    if (cuedItem) {
      setProgress(0);
      setIsPlaying(false);
      stopSynthesizer();
      addLog(`PFL cued for: ${cuedItem.title}`);

      // Auto start on change if audio was already initialized
      if (audioCtxRef.current) {
        setIsPlaying(true);
      } else {
        // First cue of session - ask user to click play (due to browser interaction security policy)
        addLog("PFL ready. Click Play to start monitor stream.");
      }
    }
    return () => {
      stopSynthesizer();
    };
  }, [cuedItem]);

  // Playback synth control when isPlaying changes
  useEffect(() => {
    if (isPlaying) {
      startSynthesizer();

      // Progress Simulation
      progressTimerRef.current = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            addLog("PFL audition sequence complete. Looping preview.");
            return 0;
          }
          return prev + 1;
        });
      }, 500);
    } else {
      stopSynthesizer();
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [isPlaying]);

  // Waveform visualization loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      // Clear canvas with deep slate color
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      const analyser = analyserRef.current;
      const bufferLength = analyser ? analyser.frequencyBinCount : 32;
      const dataArray = new Uint8Array(bufferLength);

      if (isPlaying && analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Draw static baseline with beautiful ripple noise
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = 10 + Math.sin(Date.now() / 300 + i / 2) * 5;
        }
      }

      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 1.2;
        if (barHeight < 4) barHeight = 4; // minimum height for aesthetics

        // Create glowing neon gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#0284c7'); // sky-500
        gradient.addColorStop(0.5, '#0ea5e9'); // sky-600
        gradient.addColorStop(1, '#10b981'); // emerald-500

        ctx.fillStyle = gradient;
        
        // Draw centered bar
        const roundedHeight = Math.max(2, barHeight);
        const yPos = (height - roundedHeight) / 2;
        
        // Draw rounded pill bars
        ctx.beginPath();
        ctx.roundRect(x, yPos, barWidth - 2, roundedHeight, 3);
        ctx.fill();

        x += barWidth;
      }
    };

    draw();

    // Resize observer to handle responsive canvas
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });
    resizeObserver.observe(canvas);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [isPlaying]);

  if (!cuedItem) return null;

  return (
    <div 
      id="studio-pfl-deck" 
      className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[480px] bg-slate-950/95 backdrop-blur-xl border border-sky-500/30 rounded-2xl shadow-[0_10px_40px_rgba(14,165,233,0.15)] z-50 overflow-hidden text-slate-100 flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-5"
    >
      {/* Glow header band */}
      <div className="h-1.5 bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-500"></div>

      {/* Header */}
      <div className="p-4 border-b border-slate-900 flex items-center justify-between gap-4 bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-sky-400">
            <Headphones className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold font-mono tracking-wider text-sky-400 uppercase bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                PFL CUE MONITOR
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Pre-Fade Listen • Headphone Out Only</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            stopSynthesizer();
            onClose();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
          title="Release Cue Channel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main body info and live visualizer */}
      <div className="p-4.5 space-y-4">
        {/* Track info card */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex gap-3.5 items-start">
          <div className="h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shrink-0">
            <span className="text-xl">
              {cuedItem.type === 'program' ? '📺' : cuedItem.type === 'commercial' ? '💰' : cuedItem.type === 'promo' ? '🎟️' : '🎵'}
            </span>
            <span className="text-[8px] font-bold font-mono text-slate-500 uppercase mt-0.5">{cuedItem.type}</span>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-white leading-snug truncate" title={cuedItem.title}>
              {cuedItem.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
              <span>{cuedItem.category || 'MAM Catalog'}</span>
              <span>•</span>
              <span>{cuedItem.duration}m</span>
              {cuedItem.safetyRating && (
                <>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/20 px-1 py-0.2 rounded border border-emerald-900/30">
                    {cuedItem.safetyRating}
                  </span>
                </>
              )}
              {cuedItem.loudnessDb !== undefined && (
                <>
                  <span>•</span>
                  <span className={cuedItem.loudnessDb > -21.0 ? 'text-rose-400' : 'text-slate-400'}>
                    Loudness: {cuedItem.loudnessDb} dB
                  </span>
                </>
              )}
            </div>
            {cuedItem.description && (
              <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1 italic">
                "{cuedItem.description}"
              </p>
            )}
          </div>
        </div>

        {/* Live Audio Oscilloscope Canvas */}
        <div className="relative h-18 rounded-xl border border-slate-900 overflow-hidden bg-slate-950 shadow-inner group">
          <canvas ref={canvasRef} className="w-full h-full" />
          
          <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[9px] text-slate-500 font-mono tracking-wider">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            LIVE PFL ANALYSER FEED
          </div>

          {/* Quick status stamp */}
          <div className="absolute bottom-2 right-3 text-[9px] font-mono text-sky-400/80 bg-sky-950/20 px-1.5 py-0.5 rounded border border-sky-500/10">
            {isPlaying ? 'MONITOR MIX FEED ACTIVE' : 'CUE READY'}
          </div>
        </div>

        {/* Playback Controls & Progress bar */}
        <div className="space-y-2.5">
          {/* Progress Seek Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500 w-8">
              00:{Math.floor(progress * 0.1).toString().padStart(2, '0')}
            </span>
            <div className="flex-1 relative group py-1 cursor-pointer">
              <div className="h-1.5 bg-slate-900 rounded-full w-full overflow-hidden">
                <div 
                  className="bg-sky-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div 
                className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white border-2 border-sky-500 opacity-0 group-hover:opacity-100 shadow transition-opacity"
                style={{ left: `calc(${progress}% - 7px)` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 w-8 text-right">
              {cuedItem.duration.toString().padStart(2, '0')}:00
            </span>
          </div>

          {/* Main Controls Slider/Buttons */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayToggle}
                className={`p-3 rounded-xl border flex items-center justify-center transition-all shadow-md ${
                  isPlaying 
                    ? 'bg-sky-500 text-slate-950 border-sky-400 hover:bg-sky-400' 
                    : 'bg-slate-900 hover:bg-slate-850 text-white border-slate-800'
                }`}
                title={isPlaying ? "Pause Audition" : "Start Audition (Pre-Fade Listen)"}
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
              </button>

              {/* TTS Voice Toggle */}
              <button
                onClick={() => {
                  const val = !isSpeechEnabled;
                  setIsSpeechEnabled(val);
                  addLog(`Robot voice guidance ${val ? 'enabled' : 'disabled'}`);
                  if (val && isPlaying) {
                    announceItem();
                  } else if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold border flex items-center gap-1.5 transition ${
                  isSpeechEnabled 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                    : 'bg-slate-900/60 text-slate-500 border-slate-900 hover:text-slate-400'
                }`}
                title="Toggle Operator Vocal Guidance"
              >
                <Mic className="h-3.5 w-3.5" />
                Vocal QC
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-900">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white transition"
                title={isMuted ? "Unmute Monitor" : "Mute Monitor"}
              >
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 text-rose-400" /> : volume < 0.4 ? <Volume1 className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  setIsMuted(false);
                }}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                title="Monitor Volume"
              />
              <span className="text-[9px] font-mono text-slate-500 w-6 text-right">
                {isMuted ? 'MUTE' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Engineering telemetry log */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-2.5 font-mono text-[9px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1 text-[8px] font-bold text-slate-500 uppercase tracking-wider">
            <span>PFL Stream Telemetry Logs</span>
            <span className="text-[8px] text-sky-400 uppercase">EBU R128 Loudness OK</span>
          </div>
          <div className="space-y-1 max-h-16 overflow-y-auto no-scrollbar">
            {systemLogs.length === 0 ? (
              <div className="text-slate-600">Initializing PFL logger channel... Ready.</div>
            ) : (
              systemLogs.map((log, index) => (
                <div key={index} className="truncate">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
