import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  VolumeX, 
  Sliders, 
  Link, 
  Copy, 
  LayoutGrid, 
  Monitor, 
  Palette, 
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Award
} from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  role: string;
  isConnected: boolean;
  isMuted: boolean;
  isCamOff: boolean;
  speakingVolume: number; // 0 to 100 for volume levels simulation
  avatarUrl: string;
  streamColor: string;
}

interface LiveGuestStageProps {
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const STREAM_BACKGROUNDS = [
  { id: 'slate', name: 'FAST Slate Dark (Default)', style: 'bg-slate-950 border-slate-800' },
  { id: 'synthwave', name: 'Synthwave Cyber Neon', style: 'bg-gradient-to-br from-purple-950 via-slate-950 to-pink-950 border-fuchsia-900/30' },
  { id: 'nebula', name: 'Cosmic Star Nebula', style: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-sky-950 border-sky-900/30' },
  { id: 'retro', name: 'CRT Matrix Green', style: 'bg-gradient-to-b from-stone-950 via-slate-950 to-emerald-950 border-emerald-950/30' },
  { id: 'editorial', name: 'Minimal Cream Warm', style: 'bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950 border-amber-900/20' }
];

export default function LiveGuestStage({ addToast }: LiveGuestStageProps) {
  const [guests, setGuests] = useState<Guest[]>([
    { id: 'g1', name: 'Dr. Sarah Lin', role: 'AI Cloud Researcher', isConnected: true, isMuted: false, isCamOff: false, speakingVolume: 45, avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80', streamColor: 'border-sky-500' },
    { id: 'g2', name: 'Marcus Vance', role: 'FAST Program Lead', isConnected: true, isMuted: false, isCamOff: false, speakingVolume: 12, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', streamColor: 'border-emerald-500' },
    { id: 'g3', name: 'Dianne K.', role: 'OTT Systems Specialist', isConnected: false, isMuted: true, isCamOff: true, speakingVolume: 0, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', streamColor: 'border-purple-500' },
    { id: 'g4', name: 'Jesse Lepota', role: 'CastPilot Host', isConnected: false, isMuted: true, isCamOff: true, speakingVolume: 0, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80', streamColor: 'border-indigo-500' }
  ]);

  const [activeLayout, setActiveLayout] = useState<'grid' | 'split' | 'speaker' | 'solo'>('grid');
  const [selectedBg, setSelectedBg] = useState('nebula');
  const [customLogoUrl, setCustomLogoUrl] = useState('https://ai.studio/build/favicon.png');
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const [inviteUrl] = useState('https://castpilot.live/invite/fast-session-8821');

  // Simulate vocal speaking volume fluctuations for active connected guests
  useEffect(() => {
    const timer = setInterval(() => {
      setGuests(prev => prev.map(g => {
        if (!g.isConnected || g.isMuted) return { ...g, speakingVolume: 0 };
        // Occasionally let them speak louder
        const speaks = Math.random() > 0.4;
        const volume = speaks ? Math.floor(Math.random() * 85) + 15 : Math.floor(Math.random() * 15);
        return { ...g, speakingVolume: volume };
      }));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const toggleMute = (id: string) => {
    setGuests(prev => prev.map(g => {
      if (g.id === id) {
        const nextMuted = !g.isMuted;
        addToast(`${g.name} ${nextMuted ? 'muted' : 'unmuted'} on the stream audio master.`, 'info');
        return { ...g, isMuted: nextMuted, speakingVolume: nextMuted ? 0 : g.speakingVolume };
      }
      return g;
    }));
  };

  const toggleCam = (id: string) => {
    setGuests(prev => prev.map(g => {
      if (g.id === id) {
        const nextCamOff = !g.isCamOff;
        addToast(`${g.name} webcam ${nextCamOff ? 'deactivated' : 'enabled'}.`, 'info');
        return { ...g, isCamOff: nextCamOff };
      }
      return g;
    }));
  };

  const toggleConnection = (id: string) => {
    setGuests(prev => prev.map(g => {
      if (g.id === id) {
        const nextConnected = !g.isConnected;
        addToast(`${g.name} ${nextConnected ? 'joined the live stage' : 'disconnected and placed on standby'}.`, 'success');
        return { 
          ...g, 
          isConnected: nextConnected, 
          isMuted: !nextConnected,
          isCamOff: !nextConnected,
          speakingVolume: 0
        };
      }
      return g;
    }));
  };

  const activeConnectedGuests = guests.filter(g => g.isConnected);

  return (
    <div className="space-y-6">
      {/* Invite banner */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-xl shrink-0">
            <Users2 className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Stream Guest Stage Link</h3>
            <p className="text-[11px] text-slate-400">Send this secure invitation link to remote guests to have them stream directly into your layout</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] select-all bg-slate-950 p-2 rounded-lg border border-slate-850">
          <span className="text-indigo-400 truncate flex-1 md:w-64" title={inviteUrl}>
            {inviteUrl}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteUrl);
              addToast("Guest invite link copied to clipboard!", 'success');
            }}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-sans text-[10px] font-bold rounded-md flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Copy className="h-3 w-3" />
            Copy Link
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stage Video Frame Monitor (7 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Monitor className="h-4 w-4 text-sky-400 animate-pulse" />
              Main Stream Frame Layout Output Preview
            </span>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
              {[
                { id: 'grid', label: 'Grid 2x2', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
                { id: 'split', label: 'Split', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
                { id: 'speaker', label: 'Speaker', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
                { id: 'solo', label: 'Solo Focus', icon: <LayoutGrid className="h-3.5 w-3.5" /> }
              ].map(lay => (
                <button
                  key={lay.id}
                  onClick={() => {
                    setActiveLayout(lay.id as any);
                    addToast(`Stream layout changed to ${lay.label}`, 'info');
                  }}
                  className={`px-2.5 py-1 text-[10px] rounded font-semibold transition flex items-center gap-1 ${
                    activeLayout === lay.id ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={lay.label}
                >
                  {lay.icon}
                  {lay.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Video canvas with selected background frame styling */}
          <div className={`h-[380px] rounded-xl border-2 relative overflow-hidden flex flex-col justify-between p-4 ${
            STREAM_BACKGROUNDS.find(b => b.id === selectedBg)?.style || 'bg-slate-950 border-slate-850'
          }`}>
            
            {/* Top branding ribbon bar */}
            <div className="flex justify-between items-center z-10 pointer-events-none">
              <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[9px] font-mono font-bold tracking-widest text-white uppercase">FAST LIVESTREAM DECK</span>
              </div>

              {isLogoVisible && customLogoUrl && (
                <div className="bg-slate-950/80 border border-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                  <img src={customLogoUrl} alt="Logo Preset" className="h-3.5 w-3.5 rounded object-contain" onError={() => setIsLogoVisible(false)} />
                  <span className="text-[10px] font-bold font-mono text-slate-400 tracking-wider">PILOT</span>
                </div>
              )}
            </div>

            {/* Simulated grids / boxes based on active connected guests */}
            <div className="flex-1 my-4 flex items-center justify-center">
              {activeConnectedGuests.length === 0 ? (
                <div className="text-center text-xs text-slate-500 max-w-sm flex flex-col items-center gap-2">
                  <Users2 className="h-12 w-12 text-slate-700 animate-bounce" />
                  <p className="font-bold text-slate-400">All guests are on standby</p>
                  <p className="text-[10px] text-slate-500 font-mono">Use the 'Guest Standby & Allocations' panel on the right to bring remote guests onto the live on-air stage.</p>
                </div>
              ) : (
                <div className={`w-full h-full gap-3 ${
                  activeLayout === 'solo' 
                    ? 'flex' 
                    : activeLayout === 'split' && activeConnectedGuests.length >= 2 
                    ? 'grid grid-cols-2'
                    : activeLayout === 'speaker' && activeConnectedGuests.length >= 2
                    ? 'grid grid-cols-4 grid-rows-4'
                    : 'grid grid-cols-2'
                }`}>
                  
                  {activeLayout === 'solo' ? (
                    // Focus on first active connected guest
                    <div className={`w-full h-full rounded-lg bg-slate-950/90 border-2 ${activeConnectedGuests[0].streamColor} relative overflow-hidden flex flex-col justify-end p-3.5 shadow-2xl animate-scaleUp`}>
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                        {activeConnectedGuests[0].isCamOff ? (
                          <div className="h-20 w-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl font-bold font-mono text-slate-400">
                            {activeConnectedGuests[0].name.slice(0, 2).toUpperCase()}
                          </div>
                        ) : (
                          <img src={activeConnectedGuests[0].avatarUrl} alt={activeConnectedGuests[0].name} className="h-32 w-32 rounded-full object-cover border-4 border-sky-500/30 animate-pulse" />
                        )}
                      </div>
                      
                      <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-lg z-10 flex justify-between items-center max-w-sm">
                        <div>
                          <p className="font-bold text-white text-xs">{activeConnectedGuests[0].name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{activeConnectedGuests[0].role}</p>
                        </div>
                        {activeConnectedGuests[0].speakingVolume > 20 && (
                          <div className="flex gap-0.5 items-end h-3 w-5" title="Speaking">
                            <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-1" />
                            <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-3" />
                            <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : activeLayout === 'speaker' ? (
                    // 1 large active guest, others in miniature bottom row
                    <>
                      <div className="col-span-4 row-span-3 rounded-lg bg-slate-950/90 border-2 border-sky-500 relative overflow-hidden flex flex-col justify-end p-3 shadow-xl">
                        <div className="absolute inset-0 flex items-center justify-center">
                          {activeConnectedGuests[0].isCamOff ? (
                            <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-400">
                              {activeConnectedGuests[0].name.slice(0,2)}
                            </div>
                          ) : (
                            <img src={activeConnectedGuests[0].avatarUrl} alt={activeConnectedGuests[0].name} className="h-24 w-24 rounded-full object-cover border-2 border-sky-400/30" />
                          )}
                        </div>
                        <div className="bg-slate-950/80 border border-slate-850 px-2 py-1 rounded text-[11px] max-w-max z-10">
                          <p className="font-bold text-white">{activeConnectedGuests[0].name} (Speaker)</p>
                        </div>
                      </div>
                      
                      <div className="col-span-4 row-span-1 flex gap-2">
                        {activeConnectedGuests.slice(1).map(g => (
                          <div key={g.id} className="flex-1 rounded-lg bg-slate-950/90 border border-slate-800 relative overflow-hidden flex items-end p-1.5">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <img src={g.avatarUrl} alt={g.name} className="h-8 w-8 rounded-full object-cover" />
                            </div>
                            <span className="bg-slate-950/90 text-[8px] font-bold text-slate-300 px-1 py-0.5 rounded truncate w-full block text-center font-mono">
                              {g.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    // Grid and Split
                    activeConnectedGuests.map(g => (
                      <div key={g.id} className={`rounded-lg bg-slate-950/90 border border-slate-800 relative overflow-hidden flex flex-col justify-end p-2.5 shadow-md animate-fadeIn`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          {g.isCamOff ? (
                            <div className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold font-mono text-slate-400">
                              {g.name.slice(0, 2).toUpperCase()}
                            </div>
                          ) : (
                            <img src={g.avatarUrl} alt={g.name} className="h-20 w-20 rounded-full object-cover border border-slate-800" />
                          )}
                        </div>
                        
                        <div className="bg-slate-950/90 border border-slate-850 p-1.5 rounded-md z-10 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-white text-[10px]">{g.name}</p>
                            <p className="text-[8px] text-slate-400 font-mono truncate">{g.role}</p>
                          </div>
                          
                          {/* Simulated mini volume waveform bar */}
                          {g.speakingVolume > 5 && (
                            <div className="flex gap-0.5 items-end h-2 w-4">
                              <div className="w-0.5 bg-sky-400 rounded-full animate-bounce" style={{ height: '40%' }} />
                              <div className="w-0.5 bg-sky-400 rounded-full animate-bounce" style={{ height: '90%' }} />
                              <div className="w-0.5 bg-sky-400 rounded-full animate-bounce" style={{ height: '60%' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                </div>
              )}
            </div>

            {/* Bottom branding crawler info bar */}
            <div className="bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center justify-between text-[10px] pointer-events-none z-10">
              <span className="font-semibold text-slate-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Feed Sync: <strong>30+ Destinations Online</strong>
              </span>
              <span className="font-mono text-slate-500">EcoQuest Live Q&A Block</span>
            </div>
          </div>
        </div>

        {/* Guest Standby & Allocations (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Box 1: Guest list */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users2 className="h-4 w-4 text-sky-400" />
                  Standby Guest Console
                </h4>
                <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono font-bold">
                  {activeConnectedGuests.length}/4 Active
                </span>
              </div>

              <div className="space-y-3.5">
                {guests.map(g => (
                  <div key={g.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    g.isConnected 
                      ? 'bg-slate-900/40 border-sky-500/20' 
                      : 'bg-slate-950 border-slate-900 text-slate-500'
                  }`}>
                    
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img src={g.avatarUrl} alt={g.name} className={`h-8 w-8 rounded-full object-cover border-2 ${
                          g.isConnected ? 'border-sky-500/60' : 'border-slate-800 filter grayscale'
                        }`} />
                        <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-slate-950 ${
                          g.isConnected ? 'bg-emerald-500' : 'bg-slate-700'
                        }`} />
                      </div>

                      <div className="min-w-0">
                        <h5 className={`font-semibold text-xs leading-none truncate ${g.isConnected ? 'text-slate-200' : 'text-slate-500'}`}>
                          {g.name}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{g.role}</p>
                      </div>
                    </div>

                    {/* Microphone and Camera controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {g.isConnected ? (
                        <>
                          <button
                            onClick={() => toggleMute(g.id)}
                            className={`p-1.5 rounded transition ${
                              g.isMuted 
                                ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/20' 
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                            }`}
                            title={g.isMuted ? 'Unmute Audio' : 'Mute Audio'}
                          >
                            {g.isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                          </button>
                          
                          <button
                            onClick={() => toggleCam(g.id)}
                            className={`p-1.5 rounded transition ${
                              g.isCamOff 
                                ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/20' 
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                            }`}
                            title={g.isCamOff ? 'Enable Webcam' : 'Disable Webcam'}
                          >
                            {g.isCamOff ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                          </button>
                        </>
                      ) : null}

                      <button
                        onClick={() => toggleConnection(g.id)}
                        className={`px-2 py-1 text-[10px] rounded font-semibold transition ${
                          g.isConnected 
                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                        }`}
                      >
                        {g.isConnected ? 'Standby' : 'Go Live'}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Box 2: Styling and stream overlay customizer branding */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Palette className="h-4 w-4 text-sky-400 animate-pulse" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Stream Frame Branding</h4>
            </div>

            <div className="space-y-3.5 text-xs">
              
              {/* Preset selection */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold block">Backdrop Frame Theme</label>
                <select
                  value={selectedBg}
                  onChange={(e) => {
                    setSelectedBg(e.target.value);
                    addToast(`Stream frame background updated to ${STREAM_BACKGROUNDS.find(b => b.id === e.target.value)?.name}`, 'success');
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  {STREAM_BACKGROUNDS.map(bg => (
                    <option key={bg.id} value={bg.id}>{bg.name}</option>
                  ))}
                </select>
              </div>

              {/* Logo custom URL insertion */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400 font-semibold">Custom Sponsor Logo URL</label>
                  <button
                    onClick={() => setIsLogoVisible(!isLogoVisible)}
                    className="text-[9px] font-mono text-sky-400 hover:underline"
                  >
                    {isLogoVisible ? 'Hide logo' : 'Show logo'}
                  </button>
                </div>
                <input
                  type="text"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-900">
                <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h5 className="font-bold text-[10px] text-indigo-300 uppercase tracking-wider">Dynamic Layout engine</h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      CastPilot automatically coordinates overlay sizing and frame parameters to keep speaker visual frames balanced and avoid clipping graphics.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
