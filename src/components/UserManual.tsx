import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Tv, 
  Cpu, 
  Layers, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  Smartphone, 
  ChevronRight, 
  Zap, 
  HelpCircle, 
  Copy, 
  Check, 
  ShieldCheck,
  Volume2,
  Video,
  Radio,
  FileText,
  AlertTriangle,
  Sliders,
  Play,
  Flame,
  Award,
  Printer,
  Keyboard,
  MonitorCheck,
  Terminal,
  Download
} from 'lucide-react';

interface UserManualProps {
  setActiveTab: (tabId: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onOpenHotkeys?: () => void;
}

interface ManualSection {
  id: string;
  category: 'beginner' | 'playout' | 'scheduling' | 'ai' | 'standards' | 'glossary' | 'faq';
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function UserManual({ setActiveTab, addToast, onOpenHotkeys }: UserManualProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'beginner' | 'playout' | 'scheduling' | 'ai' | 'standards' | 'glossary' | 'faq'>('all');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('beginner-quick-start');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedCheatSheet, setCopiedCheatSheet] = useState<boolean>(false);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    addToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyCheatSheet = () => {
    const cheatSheet = `# CASTPILOT LIVE — CONTROL ROOM QUICK REFERENCE
## Master Control Switcher Shortcuts
- Space : CUT / TAKE (Preview to Program)
- 1 - 4 : Direct Cut to Camera 1, 2, 3, or 4
- E : Emergency Slate Kill Switch (Panic Screen)
- C : SCTE-35 30s Commercial Ad Splice
- S : Skip to Next Queued Item
- M : Master Audio Mute
- R : Instant Replay (15s @ 0.5x slow-mo)
- T : Teleprompter Mirror Glass Mode
- G : On-Air Lower Thirds & Ticker
- ? : Studio Hotkeys HUD

## Standard Operating Procedures
1. Schedule Rundown: TV Schedule -> Click "AI Rundown Doctor" to seal gaps.
2. Playout Feed: Playout MCR -> Verify Program tally (Red = On-Air).
3. Redundancy: Primary and Backup DR mirror automatically.
4. OBS Overlay: Add Browser Source -> https://[URL]/?overlay=true
5. Audio Safe: ITU-R BS.1770 / EBU R128 (-24 LKFS standard).`;

    navigator.clipboard.writeText(cheatSheet);
    setCopiedCheatSheet(true);
    addToast("Copied 1-Page Control Room Reference Sheet!", "success");
    setTimeout(() => setCopiedCheatSheet(false), 2500);
  };

  const handlePrintGuide = () => {
    window.print();
  };

  const manualSections: ManualSection[] = [
    {
      id: 'beginner-quick-start',
      category: 'beginner',
      title: '🌱 Absolute Beginner Quick Start: Launch Your Broadcast in 5 Steps',
      description: 'Never broadcasted before? Follow this simple 5-step checklist to get your channel running in 5 minutes.',
      icon: <Sparkles className="h-5 w-5 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300">
            <h4 className="font-bold text-sm text-emerald-200 flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Welcome to Television Broadcasting Made Simple!
            </h4>
            <p className="text-xs text-emerald-300/90 leading-normal">
              You do not need to be an engineer or understand confusing television jargon to use CastPilot. Follow these five straightforward steps to program and run your channel.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-xs flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-mono text-[11px] font-bold">1</span>
                  Check Your Media Assets
                </span>
                <button 
                  onClick={() => setActiveTab('mam')}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold underline flex items-center gap-1"
                >
                  Open Media Library &rarr;
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Head to the <strong>Media (MAM)</strong> tab. Here you will find pre-loaded programs, sponsor ads, and short station bumpers. You can click <strong>"PFL Audition"</strong> on any video to watch it privately on your headphones without showing it to viewers.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-xs flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-[11px] font-bold">2</span>
                  Generate a 24-Hour Lineup with AI
                </span>
                <button 
                  onClick={() => setActiveTab('scheduler')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1"
                >
                  Open TV Schedule &rarr;
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Click the <strong>TV Schedule</strong> tab. In the AI prompt box, type what your channel is about (e.g. <em>"Action-packed nature shows and science discoveries"</em>) and click <strong>"Generate Linear Schedule"</strong>. The AI automatically plans a whole day of shows and commercial breaks for you.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-xs flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[11px] font-bold">3</span>
                  Heal Your Lineup with the AI Rundown Doctor
                </span>
                <button 
                  onClick={() => setActiveTab('scheduler')}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1"
                >
                  Run Rundown Doctor &rarr;
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Above your schedule, click the <strong>"🩺 AI Rundown Doctor"</strong> button. The AI checks if any shows end early leaving an awkward blank screen. If it finds any gaps, it inserts station logos or sponsor bumpers to keep your channel rolling without a single black frame!
              </p>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-xs flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono text-[11px] font-bold">4</span>
                  Preview on the Playout Screen
                </span>
                <button 
                  onClick={() => setActiveTab('playout')}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
                >
                  Open Playout MCR &rarr;
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Go to the <strong>Playout MCR</strong> tab. Look at the big monitor in the center: your channel is playing live! You will see show countdowns, audio volume meters, and on-air graphics in real time.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-xs flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono text-[11px] font-bold">5</span>
                  Go Live to the World
                </span>
                <button 
                  onClick={() => setActiveTab('syndication')}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline flex items-center gap-1"
                >
                  Open Syndication &rarr;
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Click the <strong>Syndication</strong> tab to toggle on streaming destinations (such as Pluto TV, Samsung TV Plus, YouTube, or your own website's video player). Congratulations, you are officially broadcasting!
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'what-is-linear-tv',
      category: 'beginner',
      title: '📺 What is CastPilot & Linear TV? (The Plain-English Concept)',
      description: 'Understanding the difference between on-demand video (YouTube/Netflix) and continuous 24/7 TV channels.',
      icon: <Tv className="h-5 w-5 text-sky-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Most modern platforms like YouTube or Netflix are <strong>On-Demand (VOD)</strong>: a viewer searches for a video, clicks it, watches it, and then the video stops.
          </p>
          <p>
            <strong>CastPilot is a Linear TV Playout System</strong>. That means it acts like a real television cable channel or broadcast network (like HBO, CNN, or ESPN). It runs 24 hours a day, 7 days a week on an exact clock.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block">On-Demand (YouTube/Netflix)</span>
              <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc pl-4">
                <li>Viewer must choose what to watch</li>
                <li>Stops playing when the video ends</li>
                <li>Awkward silence between videos</li>
                <li>No synchronized live experience</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Linear FAST TV (CastPilot)</span>
              <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc pl-4">
                <li>Instant playback the moment someone tunes in</li>
                <li>Automated schedule moves from show to show</li>
                <li>Automatic commercials and sponsor idents</li>
                <li>Shared live experience across millions of screens</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-300">
            <strong>What does FAST stand for?</strong> FAST stands for <em>Free Ad-Supported Streaming TV</em>. These are the free live channels on Smart TVs (like Samsung TV Plus, LG Channels, Roku, and Pluto TV) where viewers watch continuous programming for free while automated commercials generate advertising revenue.
          </div>
        </div>
      )
    },
    {
      id: 'playout-and-switcher',
      category: 'playout',
      title: '🎮 Playout Control Room & The Video Switcher',
      description: 'Understand Program (PGM), Preview (PVW), the TAKE button, and the Emergency Kill Switch.',
      icon: <Radio className="h-5 w-5 text-rose-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            The <strong>Playout Control Room</strong> is modeled after the master control room of a major television studio. It gives you complete command over what viewers see.
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-rose-400 text-xs">🔴 PGM (Program Monitor)</strong>
                <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono font-bold">ON AIR</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                This is what is actively broadcasting to your audience right now. Any video, graphic, or camera assigned to PGM is live.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-emerald-400 text-xs">🟢 PVW (Preview Monitor)</strong>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">NEXT UP</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Your private preparation screen. You can load the next camera angle or video here to check lighting and sound before showing it to viewers.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-sky-400 text-xs">⚡ TAKE Button</strong>
                <span className="text-[9px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">TRANSITION</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Clicking <strong>TAKE</strong> performs a broadcast cut or cross-dissolve, swapping Preview onto Program.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-rose-500/40 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-rose-400 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  🚨 EMERGENCY SLATE (The Kill Switch)
                </strong>
                <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded font-mono font-bold animate-pulse">PANIC BUTTON</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                If a guest says something inappropriate, a camera dies, or an accident happens on set, click <strong>"EMERGENCY SLATE"</strong>. The broadcast immediately cuts to a clean <em>"Technical Difficulties — Please Stand By"</em> card with music until your team fixes the issue and clicks <em>"Restore Live Feed"</em>.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'multicam-studio-guide',
      category: 'playout',
      title: '🎥 Multi-Camera Studio: 4 Cameras, PTZ Joystick & Instant Replay',
      description: 'Switch cameras, control motorized PTZ cameras with a joystick, and run slow-motion sports replays.',
      icon: <Video className="h-5 w-5 text-indigo-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            The <strong>Multi-Camera Studio</strong> lets you run a professional multi-angle broadcast without needing a massive physical switcher.
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-indigo-300 text-xs">Tally Lights (Red vs. Green)</strong>
              <p className="text-slate-400 text-[11px]">
                Every camera feed has a tally border: <strong>Red</strong> means that camera is live on air right now (tell your presenter to look at that camera!). <strong>Green</strong> means that camera is queued up in Preview and will be live next.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-indigo-300 text-xs">PTZ Camera Joystick (Pan, Tilt, Zoom)</strong>
              <p className="text-slate-400 text-[11px]">
                Under the PTZ Controller, use the on-screen joystick or directional arrows to steer motorized cameras around your studio. Use the zoom slider to push in for an emotional close-up or pull out for a wide stage shot. You can also click the 4 Preset buttons (Wide, Host, Guest, Overhead) for instant movement.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-indigo-300 text-xs">AI Auto-Framing Keyer</strong>
              <p className="text-slate-400 text-[11px]">
                When enabled, the AI acts as your robotic camera operator. It detects who is speaking on microphone and automatically pans and frames them without any manual intervention.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-indigo-300 text-xs">Instant Replay Caster</strong>
              <p className="text-slate-400 text-[11px]">
                Click the <strong>"REPLAY"</strong> button to immediately play back the last 15 seconds of action at 0.5x slow motion with an authentic on-screen "INSTANT REPLAY" graphic bug.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'scheduling-and-doctor',
      category: 'scheduling',
      title: '🗓️ TV Scheduling & The AI Rundown Doctor',
      description: 'Build gap-free daily lineups, export EPG TV guides, and let AI heal scheduling mismatches.',
      icon: <Layers className="h-5 w-5 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            In television, every hour has 60 minutes and 0 seconds. If your show is 42 minutes long, you need exactly 18 minutes of commercials and sponsor bumpers. If there is a single 1-second gap, digital TVs will freeze.
          </p>

          <h4 className="text-white font-bold text-xs">How the AI Rundown Doctor Solves This:</h4>
          <p className="text-slate-400">
            Whenever you adjust your schedule, open the <strong>🩺 AI Rundown Doctor</strong>. It scans your lineup, detects gaps or timing overruns, calculates an overall Rundown Integrity Score, and suggests exact station bumpers and ad spots to make the schedule mathematically perfect.
          </p>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-[11px]">
            <strong>Exporting Your TV Guide:</strong> Click <strong>"Export EPG (XMLTV)"</strong> to download an official XMLTV file. This is the industry-standard file uploaded to Smart TVs and cable operators so viewers can see show titles and descriptions on their TV Guide.
          </div>
        </div>
      )
    },
    {
      id: 'teleprompter-and-scripts',
      category: 'playout',
      title: '📜 Scriptwriting & Hardware Teleprompter Studio',
      description: 'Generate speech-ready scripts, screen for FCC legal compliance, and use mirror-glass teleprompting.',
      icon: <FileText className="h-5 w-5 text-indigo-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            The <strong>Script & Teleprompter Studio</strong> gives your on-air hosts confidence by displaying scrolling scripts right behind your camera lens.
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-indigo-300 text-xs">AI Scriptwriting with Broadcast Tones</strong>
              <p className="text-slate-400 text-[11px]">
                Type your topic and pick a tone: <em>Authoritative News</em>, <em>Casual Friendly</em>, <em>Energetic Hype</em>, or <em>Retro Vintage</em>. Gemini writes natural anchor dialogue with built-in timing cues like <code>[PAUSE]</code> and <code>[LOOK TO CAM 2]</code>.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-indigo-300 text-xs">AI Legal & Compliance Screening</strong>
              <p className="text-slate-400 text-[11px]">
                Before you go live, click <strong>"Compliance Audit"</strong>. The AI screens your script against FCC Title 47, OFCOM, and defamation laws to catch profanity, unverified medical claims, or undisclosed sponsorships.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-indigo-300 text-xs">Mirror Glass Mode</strong>
              <p className="text-slate-400 text-[11px]">
                If you place an iPad or tablet under a real beam-splitter teleprompter glass, clicking <strong>"MIRROR GLASS"</strong> flips the text backwards so it reads completely normally in the glass reflection.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-indigo-300 text-xs">Yellow-Coat Contrast Mode</strong>
              <p className="text-slate-400 text-[11px]">
                Switches the text to bright studio yellow on pure black, which reduces eye strain under bright studio keylights.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'audience-graphics-overlays',
      category: 'playout',
      title: '💬 Audience Graphics, Tickers, Live Polls & Soundboard',
      description: 'Overlay scrolling news tickers, interactive viewer voting polls, and on-air breaking alerts.',
      icon: <MessageSquare className="h-5 w-5 text-sky-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Static video without graphics feels empty. CastPilot includes an entire on-air graphics department to engage your audience:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-sky-300 text-xs">Scrolling News Ticker</strong>
              <p className="text-slate-400 text-[11px]">
                Displays smooth scrolling headlines, sports scores, and website announcements along the bottom edge of your video, just like CNN or BBC.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-300 text-xs">Live Interactive Polls</strong>
              <p className="text-slate-400 text-[11px]">
                Ask viewers a question with multiple choices. The percentage bars update live with animated graphics over your video.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-purple-300 text-xs">Soundboard & Follow Alerts</strong>
              <p className="text-slate-400 text-[11px]">
                Trigger cheering, applause, or sponsor chimes with animated graphic badges when viewers subscribe or follow your stream.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-rose-300 text-xs">Urgent On-Air Bulletins</strong>
              <p className="text-slate-400 text-[11px]">
                Display bold banners across the top of the screen for breaking news or weather advisories, with built-in voice narration (TTS).
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'gemini-ai-features-guide',
      category: 'ai',
      title: '🤖 Gemini 3.8 Flash AI Suite: Your Digital Co-Producer',
      description: 'A complete overview of all 7 specialized broadcast AI capabilities built into CastPilot.',
      icon: <Cpu className="h-5 w-5 text-purple-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            CastPilot features dedicated broadcast intelligence endpoints powered by Google Gemini 3.8 Flash to automate editorial, legal, and operational workflows:
          </p>

          <div className="space-y-2.5">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold shrink-0">1</span>
              <div>
                <strong className="text-slate-100 text-xs">AI Scriptwriter Copilot (Teleprompter Tab)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Synthesizes anchor dialogue formatted with stage directions and pacing markers.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold shrink-0">2</span>
              <div>
                <strong className="text-slate-100 text-xs">AI S&P Compliance Auditor (Teleprompter Tab)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Scans scripts against FCC Part 73, OFCOM, and defamation standards with a detailed report.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold shrink-0">3</span>
              <div>
                <strong className="text-slate-100 text-xs">AI Rundown Doctor (TV Schedule Tab)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Detects timing drift and fills empty schedule slots with precision bumpers for zero-frame black screen playout.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold shrink-0">4</span>
              <div>
                <strong className="text-slate-100 text-xs">AI SCTE-35 Ad Break Finder (Media MAM Tab)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Finds natural narrative scene transitions so commercial breaks never cut someone off mid-sentence.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold shrink-0">5</span>
              <div>
                <strong className="text-slate-100 text-xs">AI Multilingual Subtitle Generator (Media MAM Tab)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Produces CEA-708 closed captions in English, Spanish, and French with direct WebVTT file download.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold shrink-0">6</span>
              <div>
                <strong className="text-slate-100 text-xs">AI Engagement Synthesizer (Overlays Tab)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Creates 5 news crawl ticker headlines, interactive voting polls, and broadcast trivia quizzes based on any topic.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold shrink-0">7</span>
              <div>
                <strong className="text-slate-100 text-xs">AI MAM Video Auto-Enricher (Media MAM Tab)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">Writes TV Guide synopses, technical keywords, and calculates official TV ratings (TV-G, TV-PG, TV-14, TV-MA).</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sound-and-standards',
      category: 'standards',
      title: '🛡️ Sound Normalization & Broadcast Standards',
      description: 'Why your commercials won’t blast viewers’ ears (CALM Act) and how PTP clocks keep video smooth.',
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Professional television is strictly regulated by law to protect viewers from deafening volume changes and video glitches:
          </p>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <strong className="text-emerald-400 text-xs flex items-center gap-1.5">
                <Volume2 className="h-4 w-4" />
                Audio Loudness Normalization (CALM Act / ITU-R BS.1770)
              </strong>
              <p className="text-slate-400 text-[11px]">
                Under federal law in the US (the CALM Act) and Europe (EBU R128), TV commercials cannot be louder than the show they air during. CastPilot automatically monitors audio and normalizes all programs and commercials to <strong>-24 LKFS / -23 LUFS</strong>. Viewers will never have to rush to turn down the volume during ad breaks!
              </p>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <strong className="text-indigo-400 text-xs flex items-center gap-1.5">
                <Sliders className="h-4 w-4" />
                PTP Clock Synchronization (SMPTE ST 2059-2)
              </strong>
              <p className="text-slate-400 text-[11px]">
                In television studios, every camera and video server must be synchronized down to the microsecond. CastPilot locks to a master PTP clock so that when you switch cameras or cut to a commercial, there is zero screen tearing or jitter.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <strong className="text-sky-400 text-xs flex items-center gap-1.5">
                <Radio className="h-4 w-4" />
                Hitless Dual-Path Redundancy (SMPTE ST 2022-7)
              </strong>
              <p className="text-slate-400 text-[11px]">
                Sends your broadcast through two separate network routes at the same time. If one internet line experiences packet loss or drops, the system seamlessly uses the other with 0 dropped frames.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'plain-english-glossary',
      category: 'glossary',
      title: '📖 Broadcast Terms Demystified (Plain-English Glossary)',
      description: 'A beginner-friendly dictionary explaining SCTE-35, PGM/PVW, NDI, PTZ, CALM Act, and FAST in everyday terms.',
      icon: <BookOpen className="h-5 w-5 text-amber-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p className="text-slate-400 mb-2">
            Click on any term or search below to understand the industry abbreviations used in broadcast control rooms:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <strong className="text-sky-300 font-mono text-[11px] block">PGM (Program)</strong>
              <span className="text-slate-400 text-[11px]">What is actively on-air and seen by your viewers.</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <strong className="text-emerald-300 font-mono text-[11px] block">PVW (Preview)</strong>
              <span className="text-slate-400 text-[11px]">Your private rehearsal screen to preview content before taking it live.</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <strong className="text-purple-300 font-mono text-[11px] block">FAST</strong>
              <span className="text-slate-400 text-[11px]">Free Ad-Supported Streaming TV channels (like Pluto TV, Samsung TV Plus, Roku).</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <strong className="text-amber-300 font-mono text-[11px] block">SCTE-35</strong>
              <span className="text-slate-400 text-[11px]">Digital cue markers in video streams telling platforms to insert localized commercials.</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <strong className="text-indigo-300 font-mono text-[11px] block">NDI</strong>
              <span className="text-slate-400 text-[11px]">Transmitting studio video over standard computer network cables.</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <strong className="text-rose-300 font-mono text-[11px] block">PTZ</strong>
              <span className="text-slate-400 text-[11px]">Pan, Tilt, Zoom. Motorized cameras controlled with a joystick.</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <strong className="text-emerald-300 font-mono text-[11px] block">CALM Act</strong>
              <span className="text-slate-400 text-[11px]">Law forbidding TV commercials from being louder than normal TV shows.</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <strong className="text-sky-300 font-mono text-[11px] block">PFL (Pre-Fade Listen)</strong>
              <span className="text-slate-400 text-[11px]">Listening to a video in your private headphones without playing it on the live stream.</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <strong className="text-amber-300 font-mono text-[11px] block">EPG / XMLTV</strong>
              <span className="text-slate-400 text-[11px]">The electronic on-screen TV Guide file that shows what plays when.</span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <strong className="text-rose-300 font-mono text-[11px] block">As-Run Log</strong>
              <span className="text-slate-400 text-[11px]">The legal proof log given to advertisers proving their commercial actually aired.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq-and-troubleshooting',
      category: 'faq',
      title: '❓ Frequently Asked Questions & Emergency Response',
      description: 'Quick solutions for common questions: timeline gaps, stream buffering, and accidental on-air incidents.',
      icon: <HelpCircle className="h-5 w-5 text-sky-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <strong className="text-white block font-sans text-xs mb-1">Q: What should I do if something inappropriate happens live on air?</strong>
              <p className="text-slate-400 text-[11px]">
                A: Immediately press the bright red <strong>"🚨 EMERGENCY SLATE"</strong> button in the Playout MCR tab. It cuts away to an attractive <em>"Technical Difficulties"</em> screen with music until you resolve the issue on set and click <em>"Restore Live Feed"</em>.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <strong className="text-white block font-sans text-xs mb-1">Q: Why is there a red warning about a "Timeline Gap" in my schedule?</strong>
              <p className="text-slate-400 text-[11px]">
                A: This means your scheduled shows leave an empty gap before the next program. Go to the <strong>TV Schedule</strong> tab, click <strong>"🩺 AI Rundown Doctor"</strong>, and it will automatically fill the gap with station logos or short videos so your screen never goes black.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <strong className="text-white block font-sans text-xs mb-1">Q: How do I put the live graphics over my OBS Studio stream?</strong>
              <p className="text-slate-400 text-[11px]">
                A: In OBS Studio, add a new <strong>Browser Source</strong> and set the URL to <code>https://your-app-url/?overlay=true</code>. Your news ticker, live polls, and on-air alerts will appear over your video with a 100% transparent background!
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <strong className="text-white block font-sans text-xs mb-1">Q: How do I switch between Day Studio and Night Control Room modes?</strong>
              <p className="text-slate-400 text-[11px]">
                A: Click the Sun/Moon icon in the top header bar next to the clock. Day Studio mode provides a clean, bright layout for daylight offices, while Night mode uses deep navy tones to reduce eye strain in darkened control rooms.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'keyboard-shortcuts-hotkeys',
      category: 'playout',
      title: '⌨️ Master Control Keyboard Hotkeys HUD',
      description: 'Drive video cuts, camera switches, SCTE-35 ad breaks, and panic slates with instant physical hotkeys.',
      icon: <Keyboard className="h-5 w-5 text-sky-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            During live high-pressure television broadcasts, reaching for a mouse can cause missed cues. CastPilot provides instant physical keyboard shortcuts for directors and master control operators:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block text-xs">CUT / TAKE Switch</strong>
                <span className="text-slate-400 text-[11px]">Swap Preview source into live on-air Program</span>
              </div>
              <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono text-sky-400 font-bold text-xs">
                Space
              </kbd>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block text-xs">Direct Camera Cut</strong>
                <span className="text-slate-400 text-[11px]">Instantly switch to Camera 1, 2, 3, or 4</span>
              </div>
              <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono text-sky-400 font-bold text-xs">
                1 - 4
              </kbd>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-rose-400 block text-xs">Emergency Kill Slate</strong>
                <span className="text-slate-400 text-[11px]">Cut live feed to "Technical Difficulties" card</span>
              </div>
              <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono text-rose-400 font-bold text-xs">
                E
              </kbd>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-amber-300 block text-xs">SCTE-35 Commercial Splice</strong>
                <span className="text-slate-400 text-[11px]">Trigger automated 30s ad break marker</span>
              </div>
              <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono text-amber-400 font-bold text-xs">
                C
              </kbd>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block text-xs">Instant Replay Caster</strong>
                <span className="text-slate-400 text-[11px]">Cue last 15 seconds at 0.5x slow motion</span>
              </div>
              <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono text-sky-400 font-bold text-xs">
                R
              </kbd>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block text-xs">Master Audio Mute</strong>
                <span className="text-slate-400 text-[11px]">Silence main transmission audio cleanly</span>
              </div>
              <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono text-sky-400 font-bold text-xs">
                M
              </kbd>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block text-xs">Teleprompter Mirror Mode</strong>
                <span className="text-slate-400 text-[11px]">Reverse text for beam-splitter prompter glass</span>
              </div>
              <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono text-sky-400 font-bold text-xs">
                T
              </kbd>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-white block text-xs">Hotkeys HUD Overlay</strong>
                <span className="text-slate-400 text-[11px]">Display or dismiss on-screen shortcut guide</span>
              </div>
              <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded font-mono text-emerald-400 font-bold text-xs">
                ?
              </kbd>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'advanced-troubleshooting-logs',
      category: 'standards',
      title: '🛠️ Diagnostics, System Health & As-Run Audit Logs',
      description: 'Inspect real-time PTP sync jitter, SMPTE 2022-7 redundancy, and export official advertiser As-Run proof logs.',
      icon: <Terminal className="h-5 w-5 text-indigo-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            When delivering linear television feeds to cable headends, satellite uplinks, and OTT platforms, broadcast engineers require rigorous proof of signal delivery and compliance:
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-indigo-300 text-xs">PTP IEEE 1588 Precision Time Protocol</strong>
              <p className="text-slate-400 text-[11px]">
                CastPilot locks to atomic master clocks (Grandmaster PTP) with sub-microsecond jitter accuracy. If a camera drifts out of frame phase, check the <strong>Broadcast Standards</strong> tab to trigger an instantaneous <em>Resync PTP Engine</em> command.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-emerald-300 text-xs">SMPTE 2022-7 Hitless Redundancy</strong>
              <p className="text-slate-400 text-[11px]">
                Video packets are mirrored across two independent network paths (Path A and Path B). If a physical network cable is severed or an uplink fails, CastPilot reconstitutes the stream with zero dropped video frames and zero on-air glitches.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-300 text-xs">As-Run Log Verification & CSV Export</strong>
              <p className="text-slate-400 text-[11px]">
                Every single show and commercial broadcast logs an immutable As-Run entry timestamped down to the millisecond. Go to <strong>Broadcast Standards &rarr; As-Run Compliance</strong> and click <strong>"Export As-Run CSV"</strong> to provide verified billing proof to advertisers.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'system-requirements-hardware',
      category: 'beginner',
      title: '💻 System Requirements & Dual-Monitor Setup',
      description: 'Recommended browser versions, multi-monitor control room configurations, and network bandwidth for NDI streams.',
      icon: <MonitorCheck className="h-5 w-5 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            CastPilot is engineered to run in standard high-performance web browsers without requiring proprietary PCIe capture cards:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <strong className="text-white block text-xs">Supported Browsers</strong>
              <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
                <li>Google Chrome (v110+)</li>
                <li>Microsoft Edge (v110+)</li>
                <li>Mozilla Firefox (v115+)</li>
                <li>Apple Safari (v16.4+)</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <strong className="text-white block text-xs">Control Room Setup</strong>
              <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
                <li>Display 1: CastPilot Master Control</li>
                <li>Display 2: Fullscreen Multi-Viewer / PGM</li>
                <li>Display 3: Teleprompter / Guest Stage</li>
                <li>1080p or 4K display resolution</li>
              </ul>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <strong className="text-white block text-xs">Network & Bandwidth</strong>
              <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
                <li>Gigabit Ethernet LAN for NDI-HB</li>
                <li>15+ Mbps uplink for 1080p60 SRT/RTMP</li>
                <li>30+ Mbps uplink for 4K UHD streaming</li>
                <li>WebRTC low-latency STUN/TURN</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = manualSections.filter(section => {
    const matchesCategory = activeCategory === 'all' || section.category === activeCategory;
    const matchesQuery = section.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         section.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="user-manual-academy">
      
      {/* Academy Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-semibold uppercase">Beginner-Friendly Field Guide</span>
          </div>
          <h2 className="text-lg font-bold font-display text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-400" />
            CastPilot Live — User Manual & Field Guide
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-normal">
            Step-by-step instructions written in simple, clear language so anyone can schedule 24/7 TV channels, switch live multi-camera angles, run teleprompters, and monetize FAST streams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 z-10 self-start md:self-center">
          <button
            onClick={() => {
              setActiveCategory('beginner');
              setExpandedSectionId('beginner-quick-start');
              addToast("Opened Beginner Quick Start!", "info");
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Quick Start
          </button>
          <button
            onClick={handleCopyCheatSheet}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            title="Copy 1-page control room cheat sheet"
          >
            {copiedCheatSheet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-sky-400" />}
            {copiedCheatSheet ? 'Copied!' : 'Cheat Sheet'}
          </button>
          <button
            onClick={handlePrintGuide}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            title="Print or export field guide to PDF"
          >
            <Printer className="h-3.5 w-3.5 text-amber-400" />
            Print Guide
          </button>
          {onOpenHotkeys && (
            <button
              onClick={onOpenHotkeys}
              className="px-3 py-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              title="Show physical keyboard shortcuts HUD"
            >
              <Keyboard className="h-3.5 w-3.5" />
              Hotkeys ( ? )
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Categories + Section Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left hand Filter Controls (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search bar */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5">
            <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">Search The Manual</h4>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search topics (e.g. teleprompter, audio, ads)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Categories select list */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1">
            <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 px-2 py-1 mb-1">Topics & Guides</h4>
            {[
              { id: 'all', label: 'All Manual Chapters', icon: BookOpen },
              { id: 'beginner', label: '🌱 Beginner Quick Start (Start Here!)', icon: Sparkles },
              { id: 'playout', label: '📺 Playout & Multi-Cam Studio', icon: Radio },
              { id: 'scheduling', label: '🗓️ TV Scheduling & Rundowns', icon: Layers },
              { id: 'ai', label: '🤖 Gemini 3.8 Flash AI Suite', icon: Cpu },
              { id: 'standards', label: '🛡️ Standards & Sound Normalizer', icon: ShieldCheck },
              { id: 'glossary', label: '📖 Plain-English Glossary', icon: Award },
              { id: 'faq', label: '❓ FAQ & Emergency Response', icon: HelpCircle }
            ].map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition flex items-center justify-between ${
                    activeCategory === cat.id
                      ? 'bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                    <span>{cat.label}</span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-40 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <HelpCircle className="h-4 w-4 text-sky-400" />
              Need Quick Help?
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Press <kbd className="bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-sky-300 font-mono">Enter</kbd> in the top search bar anytime to instantly jump to any show, camera, or tool in the entire suite.
            </p>
          </div>
        </div>

        {/* Right hand Manual Chapters (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredSections.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center space-y-3">
              <Search className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                No manual chapters match your search query. Try searching for "teleprompter", "audio", "ads", or "schedule".
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 text-xs rounded-lg border border-slate-800 font-semibold"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredSections.map(section => {
              const isExpanded = expandedSectionId === section.id;
              return (
                <div 
                  key={section.id} 
                  className={`rounded-xl border transition-all ${
                    isExpanded 
                      ? 'border-sky-500/40 bg-slate-950 shadow-xl' 
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                    className="w-full p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 text-left transition"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`p-2 rounded-lg border ${
                        isExpanded 
                          ? 'bg-sky-500/10 border-sky-500/30' 
                          : 'bg-slate-900 border-slate-800'
                      }`}>
                        {section.icon}
                      </div>
                      <div>
                        <h3 className={`text-sm font-bold tracking-tight ${isExpanded ? 'text-white' : 'text-slate-200'}`}>
                          {section.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 p-1 text-slate-500">
                      <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-sky-400' : ''}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-5 sm:px-5 border-t border-slate-800/80 pt-4 animate-fadeIn">
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
