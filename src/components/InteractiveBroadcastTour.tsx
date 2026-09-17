import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Radio,
  Tv,
  Film,
  Layers,
  Sparkles,
  Volume2,
  ShieldCheck,
  Zap,
  Sliders,
  Play,
  Flame,
  Award,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Share2,
  Video,
  Eye,
  Key,
  Keyboard,
  Clock,
  ExternalLink,
  Check,
  RotateCw,
  Compass
} from 'lucide-react';

interface InteractiveBroadcastTourProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  onTriggerTestLive?: () => void;
}

interface TourSlide {
  id: string;
  stepNumber: number;
  tabTarget: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  standardsBadge: string;
  industryStandardInfo: {
    rule: string;
    details: string;
    authority: string;
  };
  summary: string;
  coreConcepts: {
    label: string;
    desc: string;
    icon: React.ReactNode;
  }[];
  actionLabel: string;
  interactiveTip: string;
}

export default function InteractiveBroadcastTour({
  isOpen,
  onClose,
  setActiveTab,
  onTriggerTestLive
}: InteractiveBroadcastTourProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(() => {
    return localStorage.getItem('castpilot_tour_dismissed') === 'true';
  });
  const [testStreamActive, setTestStreamActive] = useState<boolean>(false);

  // Keyboard navigation: Left/Right arrows for slides, Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('castpilot_tour_dismissed', 'true');
    } else {
      localStorage.removeItem('castpilot_tour_dismissed');
    }
    onClose();
  };

  const handleToggleDontShowAgain = () => {
    const nextVal = !dontShowAgain;
    setDontShowAgain(nextVal);
    if (nextVal) {
      localStorage.setItem('castpilot_tour_dismissed', 'true');
    } else {
      localStorage.removeItem('castpilot_tour_dismissed');
    }
  };

  const slides: TourSlide[] = [
    {
      id: 'architecture',
      stepNumber: 1,
      tabTarget: 'dashboard',
      title: 'Welcome to Master Control & 24/7 Linear Playout',
      subtitle: 'The foundational architecture behind Tier-1 television network automation',
      badge: 'CORE ARCHITECTURE',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      icon: <Radio className="h-6 w-6 text-sky-400" />,
      standardsBadge: 'SMPTE ST 2110 & ST 2022-7',
      industryStandardInfo: {
        rule: 'Continuous 24/7 Zero-Gap Playout & Hitless Failover',
        details: 'Unlike on-demand video (VOD) where viewers pick a clip and playback stops, Linear Television operates on an uninterrupted broadcast schedule. SMPTE ST 2022-7 provides dual independent network paths (Path A and Path B) so if a primary fiber cuts, the signal switches instantaneously with zero dropped frames.',
        authority: 'SMPTE / ITU'
      },
      summary: 'CastPilot functions like master control automation suites used at BBC, NBC, and Sky TV. It unifies ingest, scheduling, live vision switching, and multi-platform distribution into a single real-time cockpit.',
      coreConcepts: [
        {
          label: '24/7 Continuous Playout',
          desc: 'Automated sequencing guarantees continuous video stream with zero dead air or black frames.',
          icon: <Clock className="h-4 w-4 text-sky-400" />
        },
        {
          label: 'PTP Sub-Microsecond Genlock',
          desc: 'Synchronized via IEEE 1588 / ST 2059-2 grandmaster clock for seamless, tear-free frame cuts.',
          icon: <Zap className="h-4 w-4 text-emerald-400" />
        },
        {
          label: '1+1 Redundant Failover',
          desc: 'Real-time hitless switching between Primary and Backup playout servers with 1 click.',
          icon: <ShieldCheck className="h-4 w-4 text-purple-400" />
        }
      ],
      actionLabel: 'Explore Master Dashboard',
      interactiveTip: 'Pro Tip: You can switch channels anytime using the MCN dropdown in the top header.'
    },
    {
      id: 'mam-vault',
      stepNumber: 2,
      tabTarget: 'mam',
      title: 'Media Asset Management (MAM) & FCC Compliance',
      subtitle: 'Ingesting media, AI metadata enrichment, and CALM Act audio loudness limits',
      badge: 'MEDIA VAULT (MAM)',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: <Film className="h-6 w-6 text-indigo-400" />,
      standardsBadge: 'FCC CALM Act & EBU R128 (-24 LUFS)',
      industryStandardInfo: {
        rule: 'Commercial Advertisement Loudness Mitigation (CALM Act)',
        details: 'By international law (ATSC A/85 & EBU R128), TV commercials and programs must maintain integrated loudness within -24.0 LUFS (±1.0 LUFS). Ingested media that peaks too hot is flagged with a red warning to protect viewer hearing.',
        authority: 'FCC (CFR 47 § 73.682) / EBU R128'
      },
      summary: 'The Media (MAM) Vault organizes programs, sponsor commercials, station idents, and audio tracks. Built-in AI automatically screens content for safety ratings, detects scene mood, and inserts SCTE-35 ad cue points.',
      coreConcepts: [
        {
          label: 'Automated QC Loudness Metering',
          desc: 'Real-time analysis calculates integrated loudness. Out-of-spec audio triggers compliance alerts.',
          icon: <Volume2 className="h-4 w-4 text-amber-400" />
        },
        {
          label: 'Pre-Fade Listen (PFL) Cue Bus',
          desc: 'Audition audio privately through your studio headphones before routing it to the broadcast air.',
          icon: <Sliders className="h-4 w-4 text-sky-400" />
        },
        {
          label: 'AI Metadata & Cue Extraction',
          desc: 'Gemini AI automatically tags categories, extracts optimal dayparts, and pinpoints ad splice cues.',
          icon: <Sparkles className="h-4 w-4 text-indigo-400" />
        }
      ],
      actionLabel: 'Open Media (MAM) Vault',
      interactiveTip: 'Try clicking "PFL Cue" on any asset to private-audition without interrupting Program playout.'
    },
    {
      id: 'scheduler',
      stepNumber: 3,
      tabTarget: 'scheduler',
      title: 'Building a Linear Rundown & SCTE-35 Ad Insertion',
      subtitle: 'Dayparting, zero-gap playout, and digital ad triggers for FAST platforms',
      badge: 'BROADCAST SCHEDULING',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Layers className="h-6 w-6 text-emerald-400" />,
      standardsBadge: 'SCTE-35 & SCTE-104 Digital Insertion',
      industryStandardInfo: {
        rule: 'Digital Program Insertion (DPI) via SCTE-35 Splice Cues',
        details: 'SCTE-35 is the universal standard used by cable headends, Pluto TV, Samsung TV Plus, Roku, and Tubi. It injects timestamped cue packets into MPEG transport streams telling downstream edge servers to splice in dynamic ads.',
        authority: 'Society of Cable Telecommunications Engineers'
      },
      summary: 'Build your 24-hour program rundown with time-accurate sequencing. Use the AI Rundown Doctor to spot airtime gaps and auto-fill them with station bumpers to ensure your channel never goes black.',
      coreConcepts: [
        {
          label: 'Dayparting & Demand Targeting',
          desc: 'Organize shows for Morning Rush, Daytime Lifestyle, Primetime Tentpoles, and Late Night blocks.',
          icon: <Clock className="h-4 w-4 text-emerald-400" />
        },
        {
          label: 'AI Rundown Doctor (Zero Gaps)',
          desc: 'Detects schedule timing drift and auto-inserts filler clips to align precisely with the top of the hour.',
          icon: <ShieldCheck className="h-4 w-4 text-sky-400" />
        },
        {
          label: 'SCTE-35 Ad Cue Markers',
          desc: 'Automated 30-second and 2-minute splice cues trigger dynamic programmatic monetization.',
          icon: <Flame className="h-4 w-4 text-rose-400" />
        }
      ],
      actionLabel: 'Open TV Schedule Rundown',
      interactiveTip: 'Press "C" on your keyboard anytime to fire an instant 30-second SCTE-35 commercial break!'
    },
    {
      id: 'multicam',
      stepNumber: 4,
      tabTarget: 'multicam',
      title: 'Vision Mixing, Multi-Cam NDI & WebRTC Live Guests',
      subtitle: 'Professional broadcast switcher architecture with Preview (PVW) and Program (PGM)',
      badge: 'VISION MIXING STUDIO',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: <Video className="h-6 w-6 text-purple-400" />,
      standardsBadge: 'NDI 5 & SMPTE ST 2110-20 Video',
      industryStandardInfo: {
        rule: 'Tally Protocol & Program / Preview Bus Switching',
        details: 'In television studios, cameras use Red Tally lights to signify "Live on Program (PGM)" and Green Tally lights for "Staged on Preview (PVW)". Directors preview camera adjustments before cutting with the master crossbar.',
        authority: 'SMPTE / NewTek NDI'
      },
      summary: 'Route studio PTZ cameras, remote mobile backpacks, and browser-based remote interview guests through a low-latency 10×8 routing matrix with 1-click Cut/Take and slow-motion instant replay.',
      coreConcepts: [
        {
          label: 'PVW / PGM Cut-Bus',
          desc: 'Stage next camera on Preview, then hit the Spacebar to execute an instant, clean cut to Program.',
          icon: <Sliders className="h-4 w-4 text-purple-400" />
        },
        {
          label: 'Remote WebRTC Guest Stage',
          desc: 'Send a one-click browser link to field reporters or interview guests with sub-100ms return feed.',
          icon: <Globe className="h-4 w-4 text-sky-400" />
        },
        {
          label: 'Instant Replay & PTZ Presets',
          desc: 'Cue instant slow-motion 0.5x highlights with bug overlays and steer PTZ cameras with presets.',
          icon: <Tv className="h-4 w-4 text-amber-400" />
        }
      ],
      actionLabel: 'Open Multi-Cam NDI Studio',
      interactiveTip: 'Press numeric keys "1" through "4" to directly cut cameras to air like a real Technical Director.'
    },
    {
      id: 'playout-eas',
      stepNumber: 5,
      tabTarget: 'playout',
      title: 'Master Playout Monitor & FCC Emergency Alert System',
      subtitle: 'On-air broadcast canvas, live graphics overlays, and federal emergency override slates',
      badge: 'MASTER CONTROL (MCR)',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: <Tv className="h-6 w-6 text-rose-400" />,
      standardsBadge: 'FCC Part 11 EAS (47 CFR Part 11)',
      industryStandardInfo: {
        rule: 'Emergency Alert System (EAS) Dual-Tone Audio Crawl',
        details: 'All broadcast stations must be capable of immediately interrupting programming to air presidential, weather, or civil defense emergencies using standard 853 Hz + 960 Hz dual-frequency attention signals and high-contrast red crawlers.',
        authority: 'FCC / FEMA / NOAA'
      },
      summary: 'The Playout Controller renders the active Program video output with real-time station logos, lower-third headlines, live audience poll meters, and emergency slate overrides.',
      coreConcepts: [
        {
          label: 'Live Broadcast Canvas',
          desc: 'High-framerate rendering with dynamic bug, time code clock, and audio PPM peak bars.',
          icon: <Eye className="h-4 w-4 text-rose-400" />
        },
        {
          label: 'FCC Emergency Alert (EAS)',
          desc: 'Synthesizes authentic dual-tone warning and overlays high-priority emergency crawlers.',
          icon: <AlertTriangle className="h-4 w-4 text-amber-400" />
        },
        {
          label: 'Seamless Skip & Panic Slate',
          desc: 'Instantly advance past compromised segments or cut to an off-air standby slide with zero lag.',
          icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />
        }
      ],
      actionLabel: 'Open Playout Controller',
      interactiveTip: 'Press "E" on your keyboard to test the Emergency Alert System (EAS) slate override.'
    },
    {
      id: 'monetization',
      stepNumber: 6,
      tabTarget: 'standards',
      title: 'Monetization, Real-Time Bidding & Proof-of-Performance',
      subtitle: 'Dynamic Ad Insertion (DAI), FAST yield optimization, and certified As-Run logs',
      badge: 'REVENUE & STANDARDS',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <Award className="h-6 w-6 text-amber-400" />,
      standardsBadge: 'IAB VAST 4.2 / FAST RTB Protocol',
      industryStandardInfo: {
        rule: 'As-Run Reconciliation & Proof of Performance',
        details: 'Television advertising contracts require certified "As-Run Logs" that record the exact millisecond, duration, and channel an ad aired. These logs are reconciled against traffic systems to bill national sponsors without disputes.',
        authority: 'IAB / 4A\'s Broadcast Standards'
      },
      summary: 'Monetize your linear stream across CTV and FAST platforms. CastPilot tracks impressions, effective CPMs ($18–$35 for connected TV), fill rates, and automated sponsor fulfillment.',
      coreConcepts: [
        {
          label: 'Programmatic RTB Ad Server',
          desc: 'Real-time bidding fills SCTE-35 ad pods with high-yield dynamic sponsors (e.g. Nike, Apple, Tesla).',
          icon: <Flame className="h-4 w-4 text-amber-400" />
        },
        {
          label: 'As-Run Broadcast Audit Log',
          desc: 'Frame-accurate timestamps recording every commercial, sponsor bumper, and promo aired.',
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        },
        {
          label: 'PTP & Standards Compliance Audit',
          desc: 'Live telemetry tracks ST 2059 PTP jitter, closed-caption timing, and CALM Act audio limits.',
          icon: <ShieldCheck className="h-4 w-4 text-sky-400" />
        }
      ],
      actionLabel: 'View Broadcast Standards & Yield',
      interactiveTip: 'Check the As-Run log anytime in the Standards tab for full legal verification of every second aired.'
    },
    {
      id: 'going-live',
      stepNumber: 7,
      tabTarget: 'syndication',
      title: 'Going Live! Multi-Platform Syndication & Uplinks',
      subtitle: 'Your step-by-step checklist to transmit your channel to global audiences',
      badge: 'GO LIVE CHECKLIST',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
      icon: <Globe className="h-6 w-6 text-red-400" />,
      standardsBadge: 'RTMP / RTMPS / SRT / HLS Delivery',
      industryStandardInfo: {
        rule: 'Secure Reliable Transport (SRT) & CDN Ingest',
        details: 'SRT optimizes video delivery across unpredictable public internet networks with packet recovery and AES-128/256 encryption. It replaces expensive satellite transponders for modern broadcast syndication.',
        authority: 'SRT Alliance / Haivision'
      },
      summary: 'Syndicate your continuous linear channel simultaneously to YouTube Live, Twitch, Kick, Facebook, Pluto TV, and your custom website HLS embed with a single click.',
      coreConcepts: [
        {
          label: 'Step 1: Check Rundown Health',
          desc: 'Ensure your TV Schedule has a current "playing" program and queued items without air gaps.',
          icon: <Check className="h-4 w-4 text-emerald-400" />
        },
        {
          label: 'Step 2: Verify Audio & PTP Clock',
          desc: 'Confirm the header shows "ST 2059 PTP: LOCKED" and master loudness is around -24 LUFS.',
          icon: <Check className="h-4 w-4 text-emerald-400" />
        },
        {
          label: 'Step 3: Toggle Destination to LIVE',
          desc: 'In the Syndication tab, enter your stream key and click the Live toggle switch to start broadcasting.',
          icon: <Check className="h-4 w-4 text-emerald-400" />
        }
      ],
      actionLabel: 'Open Syndication & Streaming Hub',
      interactiveTip: 'Click the button below to test your uplink and simulate taking the station live right now!'
    },
    {
      id: 'hotkeys-mastery',
      stepNumber: 8,
      tabTarget: 'playout',
      title: 'Master Control Hotkeys & Operator Certification',
      subtitle: 'Keyboard commands for lightning-fast live production and muscle memory',
      badge: 'PRO CERTIFICATION',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Award className="h-6 w-6 text-emerald-400" />,
      standardsBadge: 'Tier-1 MCR Certified Operator',
      industryStandardInfo: {
        rule: 'Standard Vision Mixer Cut-Bus Keyboards',
        details: 'Professional broadcast control surfaces (Grass Valley, Ross Video, Sony MVS) map direct physical keys to Cut, Take, Audio Mute, and Emergency Slates so operators can respond in milliseconds without touching a mouse.',
        authority: 'NAB / Master Control Protocols'
      },
      summary: 'You now possess a complete understanding of end-to-end 24/7 broadcast automation, FCC compliance, and master control switching. You are ready to run a television station!',
      coreConcepts: [
        {
          label: 'Spacebar: CUT / TAKE',
          desc: 'Instantly swaps the Preview (PVW) and Program (PGM) video feeds with zero latency.',
          icon: <Keyboard className="h-4 w-4 text-sky-400" />
        },
        {
          label: 'Keys "1" through "4": Direct Cuts',
          desc: 'Directly punches Camera 1, 2, 3, or 4 onto the live Program feed.',
          icon: <Zap className="h-4 w-4 text-emerald-400" />
        },
        {
          label: 'Key "C": SCTE-35 Ad / Key "E": EAS Slate',
          desc: 'Fires instant commercial break or emergency public safety override crawler.',
          icon: <Flame className="h-4 w-4 text-rose-400" />
        }
      ],
      actionLabel: 'Complete Tour & Enter Master Control',
      interactiveTip: 'You can press "?" anywhere in the software at any time to open the full Hotkeys HUD!'
    }
  ];

  const currentSlide = slides[currentSlideIndex];
  const progressPercent = ((currentSlideIndex + 1) / slides.length) * 100;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-slide-title"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-750 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Row with Step Indicator, Progress, and Close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Compass className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm sm:text-base text-white">
                  CastPilot Masterclass & Broadcast Tour
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  Step {currentSlide.stepNumber} of {slides.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Interactive onboarding & television broadcast industry standards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close Tutorial (Esc)"
              aria-label="Close Tutorial"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Pill Navigation Quick Bar */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto no-scrollbar shrink-0">
          {slides.map((s, idx) => {
            const isActive = idx === currentSlideIndex;
            const isCompleted = idx < currentSlideIndex;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : isCompleted
                    ? 'bg-slate-800 text-sky-300 hover:bg-slate-750'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3 text-sky-400" />
                ) : (
                  <span className="font-mono text-[10px]">{idx + 1}</span>
                )}
                <span className="text-[11px]">{s.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Main Slide Content Area */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-300">
          {/* Slide Heading & Badge */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${currentSlide.badgeColor}`}>
                {currentSlide.badge}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                {currentSlide.standardsBadge}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0 mt-1">
                {currentSlide.icon}
              </div>
              <div>
                <h2 id="tour-slide-title" className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
                  {currentSlide.title}
                </h2>
                <p className="text-xs sm:text-sm text-sky-400 font-medium mt-0.5">
                  {currentSlide.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Overview text */}
          <div className="rounded-xl bg-slate-950/60 border border-slate-800/90 p-4 leading-relaxed text-xs sm:text-sm text-slate-300">
            {currentSlide.summary}
          </div>

          {/* Core Concept Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {currentSlide.coreConcepts.map((concept, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-950/40 border border-slate-800 p-3.5 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {concept.icon}
                  </div>
                  <h4 className="font-semibold text-xs text-white">
                    {concept.label}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {concept.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Industry Standards & Regulatory Deep Dive Box */}
          <div className="rounded-xl bg-gradient-to-br from-indigo-950/30 to-slate-950 border border-indigo-500/20 p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold break-words">
                <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="break-words">BROADCAST REGULATION & STANDARD: {currentSlide.industryStandardInfo.rule}</span>
              </div>
              <span className="text-[10px] font-mono text-indigo-400/80 bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 rounded shrink-0">
                Governing Body: {currentSlide.industryStandardInfo.authority}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto text-box-scroll pr-1">
              {currentSlide.industryStandardInfo.details}
            </p>
          </div>

          {/* Slide 7 Specific: Interactive Test Uplink Simulator */}
          {currentSlide.id === 'going-live' && (
            <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <span>1-Click Live Uplink Simulator</span>
                </div>
                <p className="text-xs text-slate-300">
                  Ready to test? Arm your encoder and test your channel’s streaming playout right now.
                </p>
              </div>
              <button
                onClick={() => {
                  setTestStreamActive(!testStreamActive);
                  if (onTriggerTestLive) onTriggerTestLive();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg ${
                  testStreamActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                <Radio className={`h-4 w-4 ${testStreamActive ? 'animate-ping' : ''}`} />
                <span>{testStreamActive ? 'Stop Test Stream' : 'Test Uplink: Go Live!'}</span>
              </button>
            </div>
          )}

          {/* Interactive Pro Tip */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-sky-950/20 border border-sky-500/20 text-sky-300 text-xs">
            <Zap className="h-4 w-4 text-sky-400 shrink-0" />
            <span>{currentSlide.interactiveTip}</span>
          </div>
        </div>

        {/* Footer Controls Row */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Don't show again toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={handleToggleDontShowAgain}
              className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Don&apos;t show this tutorial automatically on startup</span>
          </label>

          {/* Action & Slide Nav Buttons */}
          <div className="flex items-center gap-2.5 justify-end">
            {/* Direct Jump to Tab Button */}
            <button
              onClick={() => {
                setActiveTab(currentSlide.tabTarget);
                handleDismiss();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              title={`Jump directly to ${currentSlide.actionLabel}`}
            >
              <span>{currentSlide.actionLabel}</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Previous Slide Button */}
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlideIndex === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            {/* Next or Finish Button */}
            {currentSlideIndex < slides.length - 1 ? (
              <button
                onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleDismiss}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg"
              >
                <Check className="h-4 w-4" />
                <span>Finish & Enter Master Control</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
