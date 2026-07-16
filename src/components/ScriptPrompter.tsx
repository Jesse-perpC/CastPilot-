import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Type, 
  ChevronRight, 
  Download, 
  Save, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Languages, 
  Cpu, 
  RefreshCw,
  Eye,
  Plus
} from 'lucide-react';
import { ScheduleItem } from '../types';

interface ScriptPrompterProps {
  schedules: ScheduleItem[];
  channelName: string;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface ScriptDraft {
  id: string;
  title: string;
  segmentType: string;
  body: string;
  durationSec: number;
}

export default function ScriptPrompter({ schedules, channelName, addToast }: ScriptPrompterProps) {
  const currentPlaying = schedules.find(s => s.status === 'playing' && s.channelName === channelName);

  // Script Drafts Catalog
  const [scripts, setScripts] = useState<ScriptDraft[]>([
    {
      id: 'sc-1',
      title: 'EcoQuest Nature Series - Episode 1 Intro',
      segmentType: 'program',
      body: "Welcome back to CastPilot Nature Network. Tonight, we embark on an extraordinary journey deep into the heart of the Amazon basin. In this episode of EcoQuest, our camera crews capture never-before-seen animal behaviors and talk with top conservationists working around the clock to safeguard this fragile ecosystem. Stay with us as we uncover nature's ultimate sanctuary, starting... right now.",
      durationSec: 45
    },
    {
      id: 'sc-2',
      title: 'EcoQuest Ad Insertion - Premium Sponsor Spot',
      segmentType: 'commercial',
      body: "This segment of EcoQuest is proudly brought to you by EarthBound Outfitters—designed for durability, engineered for adventure. For over three decades, EarthBound has supplied explorers with eco-friendly gear that leaves no trace. Visit earthbound-gear.com today and use promo code LIVECAST for twenty percent off your first outdoor equipment purchase. Live adventure. Live clean.",
      durationSec: 30
    },
    {
      id: 'sc-3',
      title: 'Late Night Retro Hour - Opener & Host Greeting',
      segmentType: 'program',
      body: "Adjust your tracking and buckle up, late-night night owls. You are tuned in to CastPilot's Primetime Retro Hour, your premier portal to synthesized memories, vintage commercials, and classic sci-fi reels. I am your host, Jesse Lepota. Coming up next in our rotation is a rare 1984 concept reel that will take you straight back to neon horizons. Turn up the volume and get ready.",
      durationSec: 40
    }
  ]);

  const [selectedScriptId, setSelectedScriptId] = useState<string>('sc-1');
  const activeScript = scripts.find(s => s.id === selectedScriptId) || scripts[0];

  // Editor states
  const [editedBody, setEditedBody] = useState<string>(activeScript.body);
  const [editedTitle, setEditedTitle] = useState<string>(activeScript.title);
  const [editedDuration, setEditedDuration] = useState<number>(activeScript.durationSec);

  // Sync editor when script selection changes
  useEffect(() => {
    if (activeScript) {
      setEditedBody(activeScript.body);
      setEditedTitle(activeScript.title);
      setEditedDuration(activeScript.durationSec);
    }
  }, [selectedScriptId]);

  // Teleprompter Playout states
  const [isPrompterOpen, setIsPrompterOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(3); // 1-10
  const [fontSize, setFontSize] = useState<number>(32); // 20-64 px
  const [isMirrored, setIsMirrored] = useState(false);
  const [isContrastInverted, setIsContrastInverted] = useState(false);

  // AI draft states
  const [isDraftingAI, setIsDraftingAI] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiVibe, setAiVibe] = useState('engaging');

  const prompterScrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll effect
  useEffect(() => {
    if (isScrolling && isPrompterOpen && prompterScrollRef.current) {
      const interval = setInterval(() => {
        if (prompterScrollRef.current) {
          const currentScroll = prompterScrollRef.current.scrollTop;
          const maxScroll = prompterScrollRef.current.scrollHeight - prompterScrollRef.current.clientHeight;
          
          if (currentScroll >= maxScroll - 2) {
            setIsScrolling(false);
            addToast("Teleprompter reached the end of the script.", "info");
          } else {
            prompterScrollRef.current.scrollTop = currentScroll + (scrollSpeed * 0.4);
          }
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isScrolling, isPrompterOpen, scrollSpeed]);

  const handleSaveScript = () => {
    setScripts(prev => prev.map(s => {
      if (s.id === selectedScriptId) {
        return {
          ...s,
          title: editedTitle,
          body: editedBody,
          durationSec: editedDuration
        };
      }
      return s;
    }));
    addToast("Broadcast script draft updated in workspace catalog.", "success");
  };

  const handleCreateNewScript = () => {
    const newId = `sc-${Date.now()}`;
    const newScript: ScriptDraft = {
      id: newId,
      title: 'Untitled Segment Draft',
      segmentType: 'program',
      body: 'Type your broadcast script here. Click Save to log to workspace...',
      durationSec: 30
    };
    setScripts(prev => [...prev, newScript]);
    setSelectedScriptId(newId);
    addToast("Blank script draft initialized.", "success");
  };

  // Simulated AI Script generation (using local templates + prompt details)
  const handleAiScriptGenerate = () => {
    if (!aiTopic) {
      addToast("Please provide a topic or prompt for the AI draft script.", "error");
      return;
    }
    setIsDraftingAI(true);
    setTimeout(() => {
      let generatedBody = "";
      if (aiVibe === 'formal') {
        generatedBody = `Good evening and welcome to our premier linear broadcast block. In our focal segment tonight, we explore the intricate details of ${aiTopic}. As we analyze the latest developments and speak with accredited experts, we aim to present a comprehensive, balanced look at this unfolding story. Please stay with us for key insights, coming up next.`;
      } else if (aiVibe === 'retro') {
        generatedBody = `Hey there, night owls and synth riders! Tune in and gear up because we are dialing back the clock to take a deep look into ${aiTopic}. We are bringing you those warm VHS vibes, classic commercial breaks, and retro concept reels you know and love. Let's fire up the engine and dive straight into the grid right now.`;
      } else {
        generatedBody = `Hey, welcome back to the live show! Today we are diving into something absolutely huge: ${aiTopic}. You guys have been asking for this in the chat all week, so we are super excited to break it down. Don't forget to hit that subscribe button and drop your comments in the live feed. Let's get right into the action!`;
      }

      const newId = `sc-ai-${Date.now()}`;
      const newScript: ScriptDraft = {
        id: newId,
        title: `AI Draft: ${aiTopic.slice(0, 30)}`,
        segmentType: 'program',
        body: generatedBody,
        durationSec: 45
      };

      setScripts(prev => [...prev, newScript]);
      setSelectedScriptId(newId);
      setIsDraftingAI(false);
      setAiTopic('');
      addToast("Gemini AI successfully drafted a professional segment script!", "success");
    }, 1500);
  };

  const handleImportCurrentlyPlaying = () => {
    if (!currentPlaying) {
      addToast("No active segment is currently streaming on-air.", "error");
      return;
    }
    const newId = `sc-live-${Date.now()}`;
    const newScript: ScriptDraft = {
      id: newId,
      title: `On-Air Sync: ${currentPlaying.title}`,
      segmentType: currentPlaying.type,
      body: `Welcome back to ${channelName}. Currently streaming on-air: ${currentPlaying.title}. This segment is targeted at ${currentPlaying.targetAudience} with a scheduled duration of ${currentPlaying.duration} minutes. Stay tuned for dynamic interactive programming.`,
      durationSec: 60
    };
    setScripts(prev => [...prev, newScript]);
    setSelectedScriptId(newId);
    addToast(`Imported live segment metadata for "${currentPlaying.title}".`, "success");
  };

  return (
    <div className="space-y-6" id="teleprompter-script-studio">
      
      {/* Intro block */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-semibold uppercase">Broadcaster Tools</span>
          </div>
          <h2 className="text-lg font-bold font-display text-white tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-400" />
            Live Scripting & Mirror Teleprompter Studio
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Write show scripts, generate high-engagement host remarks using AI, and run the hardware-ready mirror teleprompter console during live linear broadcasts.
          </p>
        </div>

        <div className="flex gap-2 self-start md:self-center">
          <button
            onClick={handleImportCurrentlyPlaying}
            disabled={!currentPlaying}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 disabled:opacity-40 transition flex items-center gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            Import On-Air segment
          </button>
          <button
            onClick={handleCreateNewScript}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white rounded-lg transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Script
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left hand: Scripts index & AI Assistant (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Scripts List */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Workspace Script Catalog</h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
              {scripts.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScriptId(s.id)}
                  className={`w-full p-2.5 rounded-lg border text-left transition flex items-center justify-between gap-3 ${
                    s.id === selectedScriptId
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                      : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate">{s.title}</h4>
                    <p className="text-[10px] font-mono mt-0.5 capitalize">{s.segmentType} • {s.durationSec}s read</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Gemini AI remark generator */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Cpu className="h-4 w-4 text-sky-400" />
              Gemini Showremark Copilot
            </h3>
            <p className="text-[11px] text-slate-400 mb-3.5 leading-normal">
              Need host intros, teaser scripts, or ad bumpers? Let CastPilot AI generate speech-optimized copy for you.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">What's the segment or topic about?</label>
                <input
                  type="text"
                  placeholder="e.g. EcoQuest Amazon expedition highlights"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Presenter Vibe</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'engaging', label: 'Casual / Live' },
                    { id: 'formal', label: 'News / Anchor' },
                    { id: 'retro', label: 'Retro / Synth' },
                  ].map(v => (
                    <button
                      key={v.id}
                      onClick={() => setAiVibe(v.id)}
                      className={`py-1 text-[10px] font-semibold border rounded transition ${
                        aiVibe === v.id
                          ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                          : 'bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAiScriptGenerate}
                disabled={isDraftingAI}
                className="w-full py-1.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-xs font-bold text-white rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                {isDraftingAI ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Drafting host script...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate Script Remarks
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right hand: Script Editor & Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl space-y-4">
            
            {/* Title / Duration edit line */}
            <div className="grid gap-4 sm:grid-cols-4 items-end">
              <div className="sm:col-span-3">
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Segment Title</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Pacing read time (Sec)</label>
                <input
                  type="number"
                  value={editedDuration}
                  onChange={(e) => setEditedDuration(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                  min="5"
                  max="600"
                />
              </div>
            </div>

            {/* Script Text Body Area */}
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1.5">Presenter Speech Copy</label>
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={8}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
                placeholder="Write script content here..."
              />
            </div>

            {/* Control Tray */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-900 flex-wrap">
              <div className="flex gap-2">
                <button
                  onClick={handleSaveScript}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5 text-sky-400" />
                  Save Draft
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrompterOpen(true)}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-sky-500/10"
                >
                  <Eye className="h-4 w-4" />
                  Launch Hardware Teleprompter
                </button>
              </div>
            </div>

          </div>

          {/* Prompting Guide tip */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 flex items-start gap-3">
            <span className="text-amber-500 text-lg">💡</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              <strong>Studio Teleprompter Setup:</strong> In physical studios, a mirrored beam-splitter glass splits the camera lens field of view from the text. Turn on the <strong>"Mirror Mirror"</strong> option on the teleprompter window to reverse text rendering for standard hardware beam-splitter rigs.
            </p>
          </div>

        </div>

      </div>

      {/* Hardware Teleprompter Overlay/Modal */}
      {isPrompterOpen && (
        <div className="fixed inset-0 bg-slate-950/98 z-50 flex flex-col animate-fadeIn">
          
          {/* Header Dashboard of prompter */}
          <div className="p-4 border-b border-slate-900 bg-slate-950 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="text-sm font-bold text-white font-display leading-none">{editedTitle}</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Active Prompter Session • Paced read: {editedDuration}s
                </p>
              </div>
            </div>

            {/* Hardware settings panel on top bar */}
            <div className="flex items-center gap-3 flex-wrap">
              
              {/* Font Size */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                <Type className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] text-slate-500 font-mono">Size:</span>
                <input
                  type="range"
                  min="20"
                  max="64"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-16 accent-sky-500 cursor-pointer h-1"
                />
                <span className="text-[10px] text-white font-mono">{fontSize}px</span>
              </div>

              {/* Speed scroll */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                <Sliders className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] text-slate-500 font-mono">Speed:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(Number(e.target.value))}
                  className="w-16 accent-sky-500 cursor-pointer h-1"
                />
                <span className="text-[10px] text-white font-mono">{scrollSpeed}</span>
              </div>

              {/* Mirror toggle */}
              <button
                onClick={() => setIsMirrored(!isMirrored)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                  isMirrored 
                    ? 'bg-red-500/10 border-red-500/30 text-red-400 font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Mirrors text horizontally for teleprompter rig glasses"
              >
                MIRROR GLASS
              </button>

              {/* Invert contrast */}
              <button
                onClick={() => setIsContrastInverted(!isContrastInverted)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition ${
                  isContrastInverted 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Invert screen contrast"
              >
                YELLOW COAT
              </button>

              {/* Close button */}
              <button
                onClick={() => {
                  setIsScrolling(false);
                  setIsPrompterOpen(false);
                }}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                EXIT
              </button>
            </div>
          </div>

          {/* Teleprompter Scrolling Stage */}
          <div className="flex-1 bg-black relative flex flex-col items-center justify-center overflow-hidden">
            
            {/* Guide line indicators in center to show active speaker line */}
            <div className="absolute left-0 right-0 h-20 border-y border-dashed border-red-500/30 bg-red-500/[0.02] pointer-events-none z-10 flex items-center justify-between px-6">
              <span className="text-red-500 text-xs font-mono font-bold tracking-widest uppercase">Presenter Focus</span>
              <span className="text-red-500 text-xs font-mono font-bold tracking-widest uppercase">Speaker line</span>
            </div>

            {/* Actual text viewer box */}
            <div 
              ref={prompterScrollRef}
              className={`w-full max-w-4xl h-full overflow-y-auto no-scrollbar py-[45vh] px-8 select-none transition-all ${
                isMirrored ? '-scale-x-100' : ''
              } ${
                isContrastInverted ? 'text-yellow-400' : 'text-white'
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              <p className="font-semibold leading-relaxed font-sans text-center md:text-left break-words">
                {editedBody}
              </p>
            </div>

            {/* Bottom floating playback bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-800 px-6 py-3.5 rounded-full flex items-center gap-6 shadow-2xl backdrop-blur-md">
              <button
                onClick={() => {
                  if (prompterScrollRef.current) prompterScrollRef.current.scrollTop = 0;
                  setIsScrolling(false);
                  addToast("Teleprompter reset to beginning.", "info");
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-full transition"
                title="Restart Script"
              >
                <RotateCcw className="h-5 w-5" />
              </button>

              <button
                onClick={() => setIsScrolling(!isScrolling)}
                className={`p-4 rounded-full transition-all shadow-lg text-slate-950 ${
                  isScrolling ? 'bg-red-500 text-white' : 'bg-emerald-400 hover:bg-emerald-300'
                }`}
                title={isScrolling ? 'Pause Playout' : 'Start Auto-scroll'}
              >
                {isScrolling ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-slate-950" />}
              </button>

              <div className="text-xs text-slate-400 font-mono select-none">
                Scroll state: <strong className={isScrolling ? 'text-emerald-400' : 'text-amber-500'}>{isScrolling ? 'Scrolling' : 'Paused'}</strong>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
