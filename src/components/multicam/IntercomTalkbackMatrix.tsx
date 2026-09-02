import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Shield,
  Zap,
  Check,
  AlertTriangle,
  Play,
  Square,
  Lock,
  Unlock,
  Activity,
  Users
} from 'lucide-react';
import { VideoFeed } from '../MultiCamNdiIngestion';
import { IntercomChannel } from './types';

interface IntercomTalkbackMatrixProps {
  feeds: VideoFeed[];
  onToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const DEFAULT_INTERCOM_CHANNELS: IntercomChannel[] = [
  { id: 'chan-all-cams', name: 'All Camera Operators', role: 'Camera Crew Partyline', destination: 'CAMS 1-8 Tally Intercom', isActive: false, isLatched: false, volume: 85, isMuted: false, isIfb: false, duckingLevelDb: -12, isTalentOnline: true },
  { id: 'chan-ifb-anchor', name: 'IFB 1 • Lead Anchor', role: 'Dr. Sarah Lin (Desk A)', destination: 'In-Ear Wireless Receiver #1', isActive: false, isLatched: false, volume: 90, isMuted: false, isIfb: true, duckingLevelDb: -18, isTalentOnline: true },
  { id: 'chan-ifb-coanchor', name: 'IFB 2 • Co-Anchor Panel', role: 'Marcus Vance (Desk B)', destination: 'In-Ear Wireless Receiver #2', isActive: false, isLatched: false, volume: 85, isMuted: false, isIfb: true, duckingLevelDb: -18, isTalentOnline: true },
  { id: 'chan-ifb-guest', name: 'IFB 3 • Remote WebRTC Guest', role: 'Elena Rostova (Geneva)', destination: 'WebRTC Low-Latency Return', isActive: false, isLatched: false, volume: 80, isMuted: false, isIfb: true, duckingLevelDb: -12, isTalentOnline: true },
  { id: 'chan-floor', name: 'Floor Stage Manager', role: 'Studio Floor Director', destination: 'Wireless Beltpack #4', isActive: false, isLatched: false, volume: 75, isMuted: false, isIfb: false, duckingLevelDb: -6, isTalentOnline: true },
  { id: 'chan-audio', name: 'Audio Control Room (A1/A2)', role: 'Sound Engineer Booth', destination: 'Dante Intercom Matrix Ch 5', isActive: false, isLatched: false, volume: 80, isMuted: false, isIfb: false, duckingLevelDb: -6, isTalentOnline: true },
  { id: 'chan-jib', name: 'Robotic Jib & PTZ Operator', role: 'Crane & Gimbal Crew', destination: 'Hardwired Intercom Box 3', isActive: false, isLatched: false, volume: 75, isMuted: false, isIfb: false, duckingLevelDb: -6, isTalentOnline: true },
  { id: 'chan-lighting', name: 'Lighting & Visual FX Tech', role: 'Gaffer & DMX Board', destination: 'Grid Intercom Station', isActive: false, isLatched: false, volume: 70, isMuted: false, isIfb: false, duckingLevelDb: -6, isTalentOnline: true },
];

export default function IntercomTalkbackMatrix({ feeds, onToast }: IntercomTalkbackMatrixProps) {
  const [channels, setChannels] = useState<IntercomChannel[]>(DEFAULT_INTERCOM_CHANNELS);
  const [masterTalkAllActive, setMasterTalkAllActive] = useState<boolean>(false);
  const [masterDuckingDb, setMasterDuckingDb] = useState<number>(-18);
  const [isToneGenerating, setIsToneGenerating] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(68);

  // Simulated mic peak flutter when talking
  useEffect(() => {
    const isAnyActive = masterTalkAllActive || channels.some(c => c.isActive || c.isLatched);
    if (!isAnyActive) {
      setMicLevel(0);
      return;
    }

    const timer = setInterval(() => {
      setMicLevel(Math.floor(55 + Math.random() * 35));
    }, 120);

    return () => clearInterval(timer);
  }, [masterTalkAllActive, channels]);

  // Push-to-Talk (PTT) Press / Release handlers
  const handlePttDown = (channelId: string) => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, isActive: true } : c));
  };

  const handlePttUp = (channelId: string) => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, isActive: c.isLatched ? true : false } : c));
  };

  const toggleLatch = (channelId: string) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        const nextLatch = !c.isLatched;
        onToast(`Channel "${c.name}" ${nextLatch ? 'Talk Latched ON' : 'Unlatched'}`, 'info');
        return { ...c, isLatched: nextLatch, isActive: nextLatch };
      }
      return c;
    }));
  };

  // Master Talk To All
  const handleTalkAllToggle = () => {
    const next = !masterTalkAllActive;
    setMasterTalkAllActive(next);
    setChannels(prev => prev.map(c => ({ ...c, isActive: next })));
    onToast(next ? '★ MASTER TALKBACK ACTIVE: Broadcasting to All Channels & IFBs (Ducking Active)' : 'Master Talkback Disengaged', next ? 'success' : 'info');
  };

  // 1kHz Test Tone
  const handleToggleTestTone = () => {
    const next = !isToneGenerating;
    setIsToneGenerating(next);
    onToast(next ? '1kHz Reference Tone (-20 dBFS) Active on all IFB Lines.' : 'Test tone stopped.', next ? 'info' : 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-xs font-bold uppercase tracking-wider">
                <Headphones className="h-3.5 w-3.5 text-cyan-400" />
                DIRECTOR TALKBACK & IFB MATRIX
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                DANTE / AES67 LOW-LATENCY AUDIO
              </span>
            </div>
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              Intercom Command Matrix & Talent IFB Earpieces
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Discrete Push-To-Talk (PTT) routing to camera operators, stage directors, and talent in-ear monitors (IFB) with auto-program audio ducking and reference tone generators.
            </p>
          </div>

          {/* Master Talk All Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleTalkAllToggle}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-xl ${
                masterTalkAllActive
                  ? 'bg-red-600 text-white animate-pulse shadow-red-500/40'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <Mic className="h-4 w-4" />
              <span>{masterTalkAllActive ? 'TALK TO ALL (ON-AIR)' : 'MASTER TALK TO ALL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Director Audio Control & Auto-Ducking Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mic Level VU */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 text-cyan-400" />
              <span>Director Mic Input Level</span>
            </span>
            <span className={micLevel > 80 ? 'text-amber-400' : 'text-emerald-400'}>{micLevel > 0 ? `${micLevel}%` : 'MUTED'}</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                micLevel > 85 ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
              }`}
              style={{ width: `${micLevel}%` }}
            />
          </div>
        </div>

        {/* Auto-Ducking Selector */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Program Audio Auto-Ducking</span>
            </span>
            <span className="text-indigo-400">{masterDuckingDb} dB</span>
          </div>
          <div className="flex items-center gap-1">
            {[-6, -12, -18, -96].map((db) => (
              <button
                key={db}
                onClick={() => {
                  setMasterDuckingDb(db);
                  onToast(`IFB Program Ducking set to ${db === -96 ? 'Full Mute' : `${db} dB`}`, 'info');
                }}
                className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition ${
                  masterDuckingDb === db
                    ? 'bg-indigo-500 text-slate-950 font-extrabold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {db === -96 ? 'MUTE' : `${db}dB`}
              </button>
            ))}
          </div>
        </div>

        {/* 1kHz Line Test Tone */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-amber-400" />
              <span>1kHz Alignment Tone</span>
            </span>
            <span className={isToneGenerating ? 'text-amber-400 animate-pulse' : 'text-slate-500'}>
              {isToneGenerating ? 'GENERATING' : 'OFF'}
            </span>
          </div>
          <button
            onClick={handleToggleTestTone}
            className={`w-full py-1 rounded-lg text-xs font-mono font-bold transition border ${
              isToneGenerating
                ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            {isToneGenerating ? 'DISENGAGE TONE' : 'INJECT 1kHz TONE (-20 dBFS)'}
          </button>
        </div>
      </div>

      {/* Discrete 8-Channel Talkback Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            <span>Discrete Talkback & IFB Channels (8 Destinations)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Hold PTT to talk • Click Latch to lock open</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((chan) => {
            const isTalking = chan.isActive || chan.isLatched || masterTalkAllActive;
            return (
              <div
                key={chan.id}
                className={`rounded-2xl border p-4 space-y-3 transition-all flex flex-col justify-between shadow-lg ${
                  isTalking
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-cyan-500/10'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      chan.isIfb ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {chan.isIfb ? 'TALENT IFB' : 'INTERCOM'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> LINK OK
                    </span>
                  </div>

                  <div className="font-bold text-white text-xs truncate">{chan.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{chan.role}</div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">{chan.destination}</div>
                </div>

                {/* Volume Slider */}
                <div className="space-y-1 border-t border-slate-800/80 pt-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>EARPIECE GAIN:</span>
                    <span className="text-cyan-300">{chan.volume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={chan.volume}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setChannels(prev => prev.map(c => c.id === chan.id ? { ...c, volume: val } : c));
                    }}
                    className="w-full accent-cyan-500 bg-slate-800 h-1 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Action Buttons (PTT & Latch) */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {/* Push-to-Talk Button (2 Cols) */}
                  <button
                    onMouseDown={() => handlePttDown(chan.id)}
                    onMouseUp={() => handlePttUp(chan.id)}
                    onTouchStart={() => handlePttDown(chan.id)}
                    onTouchEnd={() => handlePttUp(chan.id)}
                    className={`col-span-2 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition select-none shadow-md ${
                      isTalking
                        ? 'bg-cyan-400 text-slate-950 shadow-cyan-400/30 font-extrabold'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>{isTalking ? 'TALKING' : 'HOLD PTT'}</span>
                  </button>

                  {/* Latch Lock Toggle */}
                  <button
                    onClick={() => toggleLatch(chan.id)}
                    className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center transition border ${
                      chan.isLatched
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={chan.isLatched ? 'Channel latched open' : 'Click to latch channel open'}
                  >
                    {chan.isLatched ? <Lock className="h-3.5 w-3.5 text-amber-400" /> : <Unlock className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
