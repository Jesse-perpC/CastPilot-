import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Tv, 
  Cpu, 
  Layers, 
  MessageSquare, 
  Terminal, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  Smartphone, 
  Laptop, 
  TrendingUp, 
  Award,
  ChevronRight,
  ExternalLink,
  Zap,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface UserManualProps {
  setActiveTab: (tabId: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface ManualSection {
  id: string;
  category: 'core' | 'advanced' | 'blueprints' | 'faq';
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function UserManual({ setActiveTab, addToast }: UserManualProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'advanced' | 'blueprints' | 'faq'>('all');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('get-started');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    addToast("Code snippet copied to clipboard!", "success");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const manualSections: ManualSection[] = [
    {
      id: 'get-started',
      category: 'core',
      title: 'Getting Started: The CastPilot Architecture',
      description: 'Learn the fundamentals of Linear Playout, Media Asset Management (MAM), and FAST Scheduling.',
      icon: <BookOpen className="h-5 w-5 text-sky-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Welcome to the <strong>CastPilot Executive Producer Console</strong>. CastPilot is a comprehensive, full-stack Linear FAST (Free Ad-Supported Streaming TV) playout and scheduling orchestration system designed for modern digital broadcasters, linear TV networks, and mobile-first content creators.
          </p>
          <p>
            Unlike traditional video-on-demand (VOD) services, CastPilot operates as a <strong>continuous linear playout scheduler</strong>. It acts as an automated TV channel, organizing your videos into strict, sequential 24/7 timelines with <strong>frame-accurate alignments</strong>, SCTE-35 ad-marker insertions, and real-time streaming syndications.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-sky-400 block uppercase">1. Ingest Media</span>
              <p className="text-[11px] text-slate-400">
                Load video assets (programs, ads, bumpers) into the Media Library (MAM) with precise durations and metadata taggings.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-emerald-400 block uppercase">2. Sequence with AI</span>
              <p className="text-[11px] text-slate-400">
                Use the AI Scheduling engine to automatically generate seamless timelines with zero gaps, resolving schedule blockages instantly.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-purple-400 block uppercase">3. Syndicate & Engage</span>
              <p className="text-[11px] text-slate-400">
                Syndicate to custom RTMP / HLS manifests, deploy interactive viewer tickers and engagement polls, and track ad yields.
              </p>
            </div>
          </div>

          <div className="bg-sky-500/10 border-l-4 border-sky-500 p-3.5 rounded-r-lg text-sky-300">
            <strong>Pro Tip:</strong> Want to fast-track your setup? Go to the <strong>AI Scheduling</strong> tab, enter your channel topic, select the program duration pacing, and click <strong>"Instruct Gemini to Generate Linear Schedule"</strong>.
          </div>
        </div>
      )
    },
    {
      id: 'ai-scheduling-guide',
      category: 'core',
      title: 'AI Scheduling & Timeline Harmonization',
      description: 'Master the art of gap-free linear timelines, automatic filler insertions, and SCTE-35 ad insertions.',
      icon: <Layers className="h-5 w-5 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Creating a linear schedule manually requires meticulous math to ensure that videos align precisely with hourly clocks. A single 1-second gap can cause video players to freeze or crash downstream.
          </p>
          <h4 className="text-white font-bold text-xs">How to use the AI Scheduler:</h4>
          <ol className="list-decimal pl-4 space-y-2 text-slate-300">
            <li>
              Navigate to the <span className="text-sky-400 font-bold cursor-pointer" onClick={() => setActiveTab('scheduler')}>AI Scheduling</span> tab.
            </li>
            <li>
              Enter a prompt in the AI Scheduler input (e.g., <em>"Create a premium prime-time sequence focusing on nature adventures with highly engaging sponsor bumps"</em>).
            </li>
            <li>
              Set the <strong>Primary Vibe</strong> (Informative, High Energy, Retro/Vintage, etc.) and click <strong>Generate</strong>.
            </li>
            <li>
              If any black screen or sequence gaps remain, click <strong>"Inject Curated Fillers"</strong>. This will run our gap-fill algorithm, querying your asset catalog to inject standard idents or commercial bumpers to fill the gaps perfectly.
            </li>
          </ol>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2.5">
            <span className="p-1 bg-emerald-500/10 rounded text-emerald-400 font-mono text-[9px] font-bold">ALGORITHM</span>
            <div className="space-y-1">
              <h5 className="font-semibold text-slate-200 text-xs">SCTE-35 Dynamic Ad Insertion (DAI)</h5>
              <p className="text-slate-400 text-[11px]">
                Our scheduling logic injects precise ad-markers before and after primary programs. The scheduler ensures that commercial blocks do not exceed 15% of total broadcast time to maintain high viewer retention.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'prompter-copilot',
      category: 'core',
      title: 'Live Scripting & Teleprompter Studio',
      description: 'Utilize Gemini Showremarks to generate script copy and run the scrolling hardware-prompter overlay.',
      icon: <Cpu className="h-5 w-5 text-indigo-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            For live linear channels featuring live hosts, introducing upcoming segments or sponsor promos with polished scripts is paramount. The <strong>Show Scripts & Prompter</strong> suite gives you high-fidelity teleprompting tools right in your browser.
          </p>
          
          <h4 className="text-white font-bold text-xs">Acing the Teleprompter Workflow:</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
            <li>
              <strong>AI Script Drafting:</strong> Input your upcoming segment topic in the <strong>Gemini Showremark Copilot</strong> panel, select your presenter vibe (Casual, News, Retro), and hit generate. Gemini will write speech-optimized, high-conversion presenter scripts.
            </li>
            <li>
              <strong>On-Air Sync:</strong> If a segment is currently playing on-air, click <strong>"Import On-Air segment"</strong> to pull metadata (title, category, tags) directly into a script draft layout.
            </li>
            <li>
              <strong>Launching the Prompter:</strong> Click <strong>"Launch Hardware Teleprompter"</strong>. This launches a full-screen, high-contrast, distraction-free stage.
            </li>
            <li>
              <strong>Beam-Splitter Rig Integration:</strong> If you are using physical teleprompter glass mirrors, click <strong>"MIRROR GLASS"</strong> to reverse the text horizontally, matching hardware beam-splitters. Turn on <strong>"YELLOW COAT"</strong> for eye-safe yellow-on-black high contrast.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'audience-overlays',
      category: 'core',
      title: 'Audience Alerts & Graphics Studio',
      description: 'Deploy real-time live overlays, polling widgets, and customized crawlers to simulate OTT broadcast experiences.',
      icon: <MessageSquare className="h-5 w-5 text-sky-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Static linear streams can experience high viewer drop-off. By adding interactive graphic overlays—such as breaking news ticker tapes, live engagement polls, and viewer alert pops—you can increase average viewer session durations by up to <strong>40%</strong>.
          </p>

          <h4 className="text-white font-bold text-xs">Simulating Live Engagement:</h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="h-5 w-5 rounded bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 font-bold font-mono">1</span>
              <div>
                <strong className="text-slate-200">Interactive Tickers:</strong> Use the "News Ticker Tape" customizer to create scrolling text updates spanning the bottom layout of your stream monitor in real-time. Use this for emergency alerts or coupon call-to-actions.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="h-5 w-5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold font-mono">2</span>
              <div>
                <strong className="text-slate-200">Live Interactive Polling:</strong> Program poll questions and custom answers. Simulate active audience input, letting viewers feel integrated in your linear programming.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="h-5 w-5 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 font-bold font-mono">3</span>
              <div>
                <strong className="text-slate-200">Soundboard Alerts:</strong> Use the live soundboard triggers to simulate follower alerts, new subscriber animations, or direct sponsorships, with bouncy animations over the stream view.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'diagnostics-alarms',
      category: 'advanced',
      title: 'Diagnostic Alarms & Blockage Resolutions',
      description: 'Understanding linear warnings: overlapping assets, resource lockouts, and compliance conflicts.',
      icon: <ShieldAlert className="h-5 w-5 text-rose-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Linear broadcasting operates on strict rules. Our real-time <strong>Diagnostic Alarms & Blockages</strong> engine monitors your schedule and alerts you when compliance or resource boundaries are breached.
          </p>

          <div className="space-y-2">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400 text-xs">High-Priority Alarm: Shared Resource Overlap</span>
                <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 rounded uppercase font-mono font-bold">AL-109</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                Triggered when a primary server attempts to render high-bitrate programs while secondary backup encoders are locked out or exceeding GPU capacity.
              </p>
              <div className="mt-2 text-[10px] text-slate-400 bg-black/40 p-2 rounded">
                <strong className="text-sky-400">Resolution:</strong> Go to the <strong>Resource Allocator</strong>, allocate extra GPU nodes to the primary cluster, or click <strong>Apply Correction</strong> on the dashboard alarm card to hot-swap to lower bitrate rendering profiles.
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-xs">Compliance Warning: Licensing SCTE Ad Breach</span>
                <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 rounded uppercase font-mono font-bold">AL-112</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">
                Triggered when consecutive commercial intervals contain the exact same sponsor brand, violating linear brand-exclusivity clauses.
              </p>
              <div className="mt-2 text-[10px] text-slate-400 bg-black/40 p-2 rounded">
                <strong className="text-sky-400">Resolution:</strong> Use the <strong>AI Sequence Builder</strong> to shuffle commercial rotations, or manual-delete duplicate assets under the scheduling calendar grid.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'packaging-native',
      category: 'advanced',
      title: 'Compiling to Native APKs & Electron Desktop',
      description: 'Instructions to export and package CastPilot as standalone local applications.',
      icon: <Terminal className="h-5 w-5 text-sky-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            To deploy CastPilot on physical devices (such as Android TV tablets, production PCs, or teleprompter monitors), packaging the web codebase into a native shell is optimal.
          </p>

          <h4 className="text-white font-bold text-xs">1. Desktop Standalone: Electron Application</h4>
          <p className="text-slate-400">
            Our codebase is pre-configured with a dual entry-point structure (`electron.js` and `preload.js`). Run the following locally:
          </p>
          <div className="bg-slate-900 rounded-lg p-3 relative font-mono text-[11px]">
            <button
              onClick={() => handleCopy("npm install -D electron electron-builder\nnpx electron .", "elec-code")}
              className="absolute top-2.5 right-2.5 p-1 bg-slate-950/80 hover:bg-slate-950 rounded text-slate-400 hover:text-white transition"
            >
              {copiedCode === "elec-code" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <pre>
{`# Install Electron dependencies
npm install -D electron electron-builder

# Run the live desktop app in dev mode
npx electron .

# Package into .exe, .dmg, or .AppImage binaries
npx electron-builder build`}
            </pre>
          </div>

          <h4 className="text-white font-bold text-xs mt-3">2. Mobile Creator App: Capacitor & Gradle APK</h4>
          <p className="text-slate-400">
            Package into a physical, signed APK to run on mobile phones or tablet teleprompting stands.
          </p>
          <div className="bg-slate-900 rounded-lg p-3 relative font-mono text-[11px]">
            <button
              onClick={() => handleCopy("npm install -D @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init \"CastPilot\" \"com.castpilot.studio\"\nnpm run build\nnpx cap add android\nnpx cap sync", "cap-code")}
              className="absolute top-2.5 right-2.5 p-1 bg-slate-950/80 hover:bg-slate-950 rounded text-slate-400 hover:text-white transition"
            >
              {copiedCode === "cap-code" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <pre>
{`# Install Capacitor wrappers
npm install -D @capacitor/core @capacitor/cli @capacitor/android

# Sync configuration & build production assets
npm run build
npx cap add android
npx cap sync android

# Open in Android Studio to build APK
npx cap open android`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'success-blueprints',
      category: 'blueprints',
      title: 'Success Blueprints: Maximizing Yield & Reach',
      description: 'Read the playbooks of top-performing linear channels and monetized FAST streams.',
      icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            To achieve sustainable audience growth and maximized programmatic revenues, apply these three specialized linear operation blueprints:
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <h5 className="font-bold text-white text-xs flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                Blueprint A: The Multi-Device Mobile Presenter Setup
              </h5>
              <p className="text-slate-400 text-[11px]">
                Ideal for independent podcasters or live creators. Run your linear streaming feed on a primary studio PC. Open the <strong>Show Scripts & Teleprompter</strong> console on an iPad placed directly on a physical camera ring-light. Use an Android phone opened to the <strong>Audience Alerts & Graphics Studio</strong> tab to monitor chat, deploy polls, and click simulated superchat alerts as your broadcast streams live.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <h5 className="font-bold text-white text-xs flex items-center gap-1">
                <Tv className="h-3.5 w-3.5 text-sky-400" />
                Blueprint B: The Max-Revenue FAST Network Schedule
              </h5>
              <p className="text-slate-400 text-[11px]">
                To maximize your programmatic ad-yield metrics (which you can monitor under the <strong>Programmatic Ad Yield Dashboard</strong>): structure your schedule around <strong>45-minute programs</strong>, preceded by a <strong>30-second Sponsor Ident</strong>, followed by exactly <strong>5 minutes of programmatic SCTE-35 ad spots</strong>. Keep your fill rates high. Go to the <strong>Resource Allocator</strong> and configure <strong>High Bandwidth CDN profiles</strong> to completely eradicate frame-buffering on-air.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <h5 className="font-bold text-white text-xs flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-yellow-400" />
                Blueprint C: Corporate Stream Syndication Broadcast
              </h5>
              <p className="text-slate-400 text-[11px]">
                For scheduled continuous corporate webinars: ingest your training modules under the Media Library (MAM), tag with target departments, and syndicate your live output concurrently to YouTube Live, Twitch, and a secure internal corporate RTMP server using the <strong>Streaming & VOD</strong> manager. Maintain zero timeline gaps with active internal branding idents as filler.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq-guide',
      category: 'faq',
      title: 'Frequently Asked Questions & Support',
      description: 'Quick diagnostics: why is the stream buffering? How to change resolution? SCTE integration.',
      icon: <HelpCircle className="h-5 w-5 text-indigo-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <div>
              <strong className="text-white block font-sans text-xs">Q: Why am I seeing "Overlapping Timeline Gaps" in the Alarms section?</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">
                A: This means your scheduled content does not line up sequentially. Go to the <strong>AI Scheduling</strong> tab and click the <strong>"Fill Playlist Gaps"</strong> button. The system will search your asset inventory and auto-fill gaps with bumpers.
              </p>
            </div>
            <div className="border-t border-slate-900 pt-2.5">
              <strong className="text-white block font-sans text-xs">Q: Can I stream in 4K resolution?</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">
                A: Yes! Go to the <strong>Setup & Logins</strong> tab, modify the <strong>Default Feed Quality</strong> dropdown to <strong>4K UHD (2160p)</strong>, and click <strong>"Update Profile Credentials"</strong> to sync with high-bitrate encoders.
              </p>
            </div>
            <div className="border-t border-slate-900 pt-2.5">
              <strong className="text-white block font-sans text-xs">Q: What is the purpose of SCTE-35 ad markers?</strong>
              <p className="text-slate-400 text-[11px] mt-0.5">
                A: SCTE-35 markers are digital cues injected into live streams indicating exact start and end points of commercial spots, prompting OTT players to substitute live localized ads.
              </p>
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
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sky-500/5 to-transparent pointer-events-none" />
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-sky-400" />
            <span className="text-[10px] font-mono tracking-widest text-sky-400 font-semibold uppercase">Knowledge Base</span>
          </div>
          <h2 className="text-lg font-bold font-display text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-400" />
            CastPilot Live - Executive Producer Academy & Manual
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-normal">
            Master the controls of linear television playout scheduling, live dynamic overlays, AI script writing, and custom native APK/desktop application packaging.
          </p>
        </div>

        <div className="flex gap-2 shrink-0 z-10 self-start md:self-center">
          <button
            onClick={() => {
              setActiveTab('scheduler');
              addToast("Redirecting to AI Scheduler...", "info");
            }}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-semibold transition flex items-center gap-1"
          >
            <Zap className="h-3.5 w-3.5 text-sky-400" />
            Launch AI Scheduler
          </button>
        </div>
      </div>

      {/* Main Grid: Controls + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left hand Filter Controls (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Search bar */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4.5 space-y-3">
            <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">Search Guide</h4>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Categories select list */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4.5 space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 mb-2">Manual categories</h4>
            {[
              { id: 'all', label: 'All Manual Chapters' },
              { id: 'core', label: 'Core Broadcasting' },
              { id: 'advanced', label: 'Advanced Native Apps' },
              { id: 'blueprints', label: 'Revenue & Success Blueprints' },
              { id: 'faq', label: 'FAQ & Support' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`w-full p-2.5 rounded-lg text-left text-xs font-semibold transition flex items-center justify-between ${
                  activeCategory === cat.id
                    ? 'bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span>{cat.label}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-40 shrink-0" />
              </button>
            ))}
          </div>

          {/* System Specs panel */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4.5 space-y-2 text-[11px] text-slate-400">
            <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1 mb-1">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              Console Specifications
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span>Engine Status:</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span>Bitrate Target:</span>
              <span className="text-slate-200 font-mono">1080p60 (CBR 6.5M)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span>Playout Buffer:</span>
              <span className="text-slate-200 font-mono">0.05 seconds (Ultra Low)</span>
            </div>
            <div className="flex justify-between py-1">
              <span>AI Engine:</span>
              <span className="text-sky-400 font-bold">Gemini 3.5 Flash SDK</span>
            </div>
          </div>

        </div>

        {/* Right hand Accordion Content (9 cols) */}
        <div className="lg:col-span-9 space-y-4">
          
          {filteredSections.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-12 text-center text-slate-500 text-xs">
              No manual chapters match your search query. Try typing other keywords such as "APK", "SCTE", "Teleprompter", or "Scheduler".
            </div>
          ) : (
            filteredSections.map(section => {
              const isExpanded = expandedSectionId === section.id;
              return (
                <div 
                  key={section.id}
                  className={`rounded-xl border transition-all ${
                    isExpanded 
                      ? 'bg-slate-950 border-slate-700/80 shadow-xl' 
                      : 'bg-slate-950/70 border-slate-850 hover:bg-slate-950/90'
                  }`}
                >
                  {/* Collapsible Header */}
                  <button
                    onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                    className="w-full p-5 text-left flex items-start gap-4"
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${isExpanded ? 'bg-sky-500/10' : 'bg-slate-900'}`}>
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="text-sm font-bold text-white font-display tracking-tight leading-snug">{section.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">{section.description}</p>
                    </div>
                    <span className="text-slate-500 font-bold self-center text-lg shrink-0">
                      {isExpanded ? '−' : '+'}
                    </span>
                  </button>

                  {/* Expanded Body Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1.5 border-t border-slate-900">
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
