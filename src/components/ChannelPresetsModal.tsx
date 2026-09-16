import React, { useState } from 'react';
import { 
  X, 
  Tv, 
  Sparkles, 
  Check, 
  Flame, 
  Radio, 
  Film, 
  Trophy, 
  HeartHandshake, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { ScheduleItem, ContentAsset } from '../types';

interface ChannelPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (
    channelName: string, 
    schedules: ScheduleItem[], 
    assets: ContentAsset[], 
    presetTitle: string
  ) => void;
}

interface ChannelArchetype {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description?: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  highlights: string[];
  schedules: ScheduleItem[];
  assets: ContentAsset[];
}

export default function ChannelPresetsModal({ isOpen, onClose, onApplyPreset }: ChannelPresetsModalProps) {
  const [selectedId, setSelectedId] = useState<string>('news-24');

  if (!isOpen) return null;

  const archetypes: ChannelArchetype[] = [
    {
      id: 'news-24',
      name: 'News 24 Global Live',
      category: '24/7 Live News & World Events',
      tagline: 'Rolling news bulletins, market ticks, and live studio desks',
      badge: 'POPULAR',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: <Radio className="h-5 w-5 text-rose-400" />,
      highlights: [
        'Top-of-the-hour 30-minute news rundowns',
        'Breaking news lower-third ticker tape',
        '3 live studio cameras (Anchor, Panel, London)',
        'FCC-compliant 2-minute sponsor breaks'
      ],
      schedules: [
        {
          id: 'preset-n-1',
          channelName: 'News 24 Global Live',
          startTime: '08:00',
          title: 'Global Morning Headline Bulletin',
          type: 'program',
          duration: 30,
          status: 'playing',
          demandScore: 94,
          targetAudience: 'Global Commuters & Investors',
          aiRationale: 'Primetime morning headline demand index peaking at 08:00.'
        },
        {
          id: 'preset-n-2',
          channelName: 'News 24 Global Live',
          startTime: '08:30',
          title: 'Perp Corp Global Markets & Commodities',
          type: 'commercial',
          duration: 2,
          status: 'queued',
          demandScore: 88,
          targetAudience: 'Financial Decision Makers',
          aiRationale: 'High-CPM commercial segment inserted at natural segment conclusion.'
        },
        {
          id: 'preset-n-3',
          channelName: 'News 24 Global Live',
          startTime: '08:32',
          title: 'Tech Bureau Deep Dive: AI Revolution',
          type: 'program',
          duration: 26,
          status: 'queued',
          demandScore: 91,
          targetAudience: 'Tech Leaders & Analysts',
          aiRationale: 'High engagement tech showcase with London Bureau link.'
        },
        {
          id: 'preset-n-4',
          channelName: 'News 24 Global Live',
          startTime: '08:58',
          title: 'Station Ident & Next Hour Teaser',
          type: 'filler',
          duration: 2,
          status: 'queued',
          demandScore: 75,
          targetAudience: 'General Public',
          aiRationale: 'Zero-frame station bumper to lock EPG hour boundary.'
        }
      ],
      assets: [
        {
          id: 'asset-n-1',
          title: 'Global Morning Headline Bulletin',
          type: 'program',
          duration: 30,
          category: 'News & Current Affairs',
          tags: ['news', 'live', 'morning', 'anchor'],
          isQCed: true,
          safetyRating: 'TV-G',
          loudnessDb: -24.0,
          optimalSlot: 'Morning Rush (07:00 - 09:00)',
          adMarkers: ['00:15:00', '00:28:00'],
          description: 'Live studio newscast covering overnight international headlines and markets.'
        },
        {
          id: 'asset-n-2',
          title: 'Perp Corp Global Markets Spot',
          type: 'commercial',
          duration: 2,
          category: 'Finance Sponsor',
          tags: ['sponsor', 'finance', 'markets'],
          isQCed: true,
          safetyRating: 'TV-G',
          loudnessDb: -24.0,
          optimalSlot: 'Business News Breaks',
          adMarkers: [],
          description: '30s national financial infrastructure sponsor reel.'
        },
        {
          id: 'asset-n-3',
          title: 'Tech Bureau Deep Dive',
          type: 'program',
          duration: 26,
          category: 'Technology',
          tags: ['tech', 'london', 'ai'],
          isQCed: true,
          safetyRating: 'TV-PG',
          loudnessDb: -24.0,
          optimalSlot: 'Mid-Morning Technology Slot',
          adMarkers: ['00:14:00'],
          description: 'In-depth interviews with global AI researchers.'
        }
      ]
    },
    {
      id: 'fast-cinema',
      name: 'CineVault FAST 24/7',
      category: 'Movies, Series & Episodic Documentaries',
      tagline: 'Continuous indie films, docuseries, and CALM Act compliant commercial pods',
      badge: 'MONETIZED',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <Film className="h-5 w-5 text-emerald-400" />,
      highlights: [
        'Curated feature films & episodic series',
        'SCTE-35 ad break markers at scene transitions',
        'ITU-R BS.1770 normalized audio (-24 LKFS)',
        'Full XMLTV EPG data with parental ratings'
      ],
      schedules: [
        {
          id: 'preset-c-1',
          channelName: 'CineVault FAST 24/7',
          startTime: '19:00',
          title: 'The Oceanic Horizon (Feature Doc)',
          type: 'program',
          duration: 52,
          status: 'playing',
          demandScore: 96,
          targetAudience: 'Film Enthusiasts & Nature Lovers',
          aiRationale: 'Evening primetime centerpiece with 4K HDR master assets.'
        },
        {
          id: 'preset-c-2',
          channelName: 'CineVault FAST 24/7',
          startTime: '19:52',
          title: 'EcoDrive Electric Vehicles (Sponsor Ad)',
          type: 'commercial',
          duration: 3,
          status: 'queued',
          demandScore: 84,
          targetAudience: 'Environmentally Conscious Consumers',
          aiRationale: 'High yield automotive sponsor placement matching nature documentary audience.'
        },
        {
          id: 'preset-c-3',
          channelName: 'CineVault FAST 24/7',
          startTime: '19:55',
          title: 'CineVault Retro Station ID & Upcoming Shows',
          type: 'filler',
          duration: 5,
          status: 'queued',
          demandScore: 78,
          targetAudience: 'General Audience',
          aiRationale: 'EPG top-of-the-hour alignment ident.'
        }
      ],
      assets: [
        {
          id: 'asset-c-1',
          title: 'The Oceanic Horizon (Feature Doc)',
          type: 'program',
          duration: 52,
          category: 'Documentary',
          tags: ['cinema', 'ocean', 'nature', '4k'],
          isQCed: true,
          safetyRating: 'TV-PG',
          loudnessDb: -24.0,
          optimalSlot: 'Evening Primetime (19:00 - 22:00)',
          adMarkers: ['00:15:30', '00:32:45', '00:48:10'],
          description: 'Award-winning documentary tracing deep marine biology ecosystems.'
        },
        {
          id: 'asset-c-2',
          title: 'EcoDrive Electric Vehicles Spot',
          type: 'commercial',
          duration: 3,
          category: 'Commercial',
          tags: ['ad', 'auto', 'eco'],
          isQCed: true,
          safetyRating: 'TV-G',
          loudnessDb: -24.0,
          optimalSlot: 'Primetime Break',
          adMarkers: [],
          description: 'High-CPM digital ad spot compliant with CALM Act loudness limits.'
        }
      ]
    },
    {
      id: 'live-sports',
      name: 'Velocity Sports & Esports Arena',
      category: 'High-Octane Tournament Broadcasts',
      tagline: '4-camera sports coverage, instant slow-mo replays, and live audience polls',
      badge: 'INTERACTIVE',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <Trophy className="h-5 w-5 text-amber-400" />,
      highlights: [
        '4 studio cameras with PTZ stadium presets',
        'Instant replay cued at 0.5x with on-screen bug',
        'Real-time live audience MVP voting poll',
        'High-energy announcer teleprompter scripts'
      ],
      schedules: [
        {
          id: 'preset-s-1',
          channelName: 'Velocity Sports & Esports Arena',
          startTime: '15:00',
          title: 'Apex Championship: Grand Finals Live',
          type: 'program',
          duration: 45,
          status: 'playing',
          demandScore: 98,
          targetAudience: 'Esports & Action Gamers',
          aiRationale: 'Peak live weekend tournament engagement window.'
        },
        {
          id: 'preset-s-2',
          channelName: 'Velocity Sports & Esports Arena',
          startTime: '15:45',
          title: 'HyperSpeed Energy Drink Sponsor Break',
          type: 'commercial',
          duration: 2,
          status: 'queued',
          demandScore: 89,
          targetAudience: 'Young Competitive Viewers',
          aiRationale: 'Targeted demographic beverage placement.'
        },
        {
          id: 'preset-s-3',
          channelName: 'Velocity Sports & Esports Arena',
          startTime: '15:47',
          title: 'Post-Match Analysis & MVP Replay Caster',
          type: 'program',
          duration: 13,
          status: 'queued',
          demandScore: 93,
          targetAudience: 'Tournament Fans',
          aiRationale: 'Fast turnaround recap using instant replay slow-motion clips.'
        }
      ],
      assets: [
        {
          id: 'asset-s-1',
          title: 'Apex Championship Grand Finals',
          type: 'program',
          duration: 45,
          category: 'Sports & Esports',
          tags: ['live', 'esports', 'finals', 'multi-cam'],
          isQCed: true,
          safetyRating: 'TV-14',
          loudnessDb: -24.0,
          optimalSlot: 'Afternoon Live Block',
          adMarkers: ['00:20:00', '00:40:00'],
          description: 'Live tournament coverage with commentary team and player cams.'
        }
      ]
    },
    {
      id: 'community-faith',
      name: 'Inspiration & Community TV',
      category: 'Faith, Education & Town Halls',
      tagline: 'Uplifting community programming, educational series, and zero commercial ads',
      badge: 'NON-COMMERCIAL',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: <HeartHandshake className="h-5 w-5 text-indigo-400" />,
      highlights: [
        '100% Non-Commercial: No disruptive ad breaks',
        'Inspirational community bumpers and scriptures',
        'Multi-lingual captions (English, Spanish, French)',
        'Calm, relaxed pacing with continuous peaceful playout'
      ],
      schedules: [
        {
          id: 'preset-f-1',
          channelName: 'Inspiration & Community TV',
          startTime: '10:00',
          title: 'Morning Reflections & Community Forum',
          type: 'program',
          duration: 40,
          status: 'playing',
          demandScore: 85,
          targetAudience: 'Community & Faith Audiences',
          aiRationale: 'Calm morning discussion on civic wellness and local programs.'
        },
        {
          id: 'preset-f-2',
          channelName: 'Inspiration & Community TV',
          startTime: '10:40',
          title: 'Musical Interlude & Scenic Inspiration',
          type: 'filler',
          duration: 10,
          status: 'queued',
          demandScore: 82,
          targetAudience: 'All Viewers',
          aiRationale: 'Peaceful landscape footage with classical acoustic backdrop.'
        },
        {
          id: 'preset-f-3',
          channelName: 'Inspiration & Community TV',
          startTime: '10:50',
          title: 'Youth Science & Discovery Workshop',
          type: 'program',
          duration: 10,
          status: 'queued',
          demandScore: 88,
          targetAudience: 'Families and Students',
          aiRationale: 'Educational science module for community youth.'
        }
      ],
      assets: [
        {
          id: 'asset-f-1',
          title: 'Morning Reflections & Forum',
          type: 'program',
          duration: 40,
          category: 'Community & Faith',
          tags: ['community', 'faith', 'inspiration'],
          isQCed: true,
          safetyRating: 'TV-G',
          loudnessDb: -24.0,
          optimalSlot: 'Morning Slot',
          adMarkers: [],
          description: 'Community reflections featuring local leaders and civic artists.'
        }
      ]
    }
  ];

  const currentArchetype = archetypes.find(a => a.id === selectedId) || archetypes[0];

  const handleApply = () => {
    onApplyPreset(
      currentArchetype.name,
      currentArchetype.schedules,
      currentArchetype.assets,
      currentArchetype.name
    );
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-bold text-xs sm:text-sm text-white font-display">
                  1-Click Channel Archetype Presets
                </h3>
                <span className="text-[9px] sm:text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  FAST LAUNCH
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Instantly populate your station with a complete, professionally configured 24/7 broadcast channel.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Two column selection & preview */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* Left Column: Archetype List */}
          <div className="md:col-span-5 space-y-2.5">
            <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 px-1">
              Select Broadcast Archetype
            </h4>
            {archetypes.map((arch) => {
              const isSelected = arch.id === selectedId;
              return (
                <button
                  key={arch.id}
                  onClick={() => setSelectedId(arch.id)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500/40 text-white shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                    isSelected 
                      ? 'bg-sky-500/20 border-sky-500/30' 
                      : 'bg-slate-800 border-slate-700'
                  }`}>
                    {arch.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs truncate">
                        {arch.name}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${arch.badgeColor}`}>
                        {arch.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                      {arch.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Archetype Preview */}
          <div className="md:col-span-7 bg-slate-900/80 rounded-xl border border-slate-800 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${currentArchetype.badgeColor}`}>
                    {currentArchetype.category}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1.5 font-display flex items-center gap-2">
                  {currentArchetype.icon}
                  {currentArchetype.name}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-normal">
                  {currentArchetype.description || currentArchetype.tagline}
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase font-bold text-sky-400 block mb-1">
                  Preset Configuration Highlights
                </span>
                {currentArchetype.highlights.map((hl, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>

              {/* Sample Scheduled Shows Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400">
                  <span>Initial Lineup Sequence</span>
                  <span>{currentArchetype.schedules.length} Items</span>
                </div>
                <div className="space-y-1.5">
                  {currentArchetype.schedules.slice(0, 3).map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-2 rounded bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] text-sky-400">{item.startTime}</span>
                        <span className="truncate text-slate-200">{item.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        {item.duration}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-2.5 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
              <span className="text-[10px] sm:text-[11px] text-slate-400 text-center sm:text-left">
                Replaces current active lineup & assets
              </span>
              <button
                onClick={handleApply}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Apply Preset & Launch
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 text-xs text-slate-400 gap-2 sm:gap-0">
          <span className="text-[10px] sm:text-xs text-center sm:text-left text-slate-500 sm:text-slate-400">
            All presets comply with FCC Part 73 and EBU R128 loudness standards.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
