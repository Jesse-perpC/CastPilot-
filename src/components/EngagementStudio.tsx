import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Award, 
  BarChart2, 
  Tv, 
  Sliders, 
  Plus, 
  Play, 
  Trash2, 
  Heart, 
  Gift, 
  Sparkles, 
  Send, 
  Volume2, 
  Layers,
  Flame,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Copy,
  Pin,
  ShieldAlert,
  Monitor,
  Layout,
  Settings,
  Globe
} from 'lucide-react';

interface EngagementStudioProps {
  channelName: string;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  badge?: 'mod' | 'subscriber' | 'vip' | 'admin';
  color: string;
  timestamp: string;
  isSuperChat?: boolean;
  superChatAmount?: string;
}

interface OverlaySettings {
  theme: 'classic' | 'cyberpunk' | 'warm' | 'minimalist' | 'retro';
  position: 'top' | 'bottom';
  tickerSpeed: 'slow' | 'normal' | 'fast';
  showChatBox: boolean;
  tickerVisible: boolean;
  tickerText: string;
  activeAlert: any | null;
  pinnedMessageId: string | null;
}

interface LivePoll {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  isActive: boolean;
  totalVotes: number;
}

interface AlertEvent {
  id: string;
  type: 'subscriber' | 'donation' | 'cheer' | 'follow';
  username: string;
  detail: string;
  durationMs: number;
}

export default function EngagementStudio({ channelName, addToast }: EngagementStudioProps) {
  // Sync state from server
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [poll, setPoll] = useState<LivePoll>({
    id: 'p-1',
    question: "Which linear block should we extend during prime hour tonight?",
    options: [
      { text: "EcoQuest Amazon Expedition", votes: 142 },
      { text: "Late Night Neon Retro Hour", votes: 118 },
      { text: "Local Independent Creator Features", votes: 65 }
    ],
    isActive: true,
    totalVotes: 325
  });

  const [settings, setSettings] = useState<OverlaySettings>({
    theme: 'classic',
    position: 'bottom',
    tickerSpeed: 'normal',
    showChatBox: true,
    tickerVisible: true,
    tickerText: "🚨 BREAKING: Dynamic Linear Channel Launch powered by CastPilot Scheduling Engines • Stay Tuned for EcoQuest premiere 🚨",
    activeAlert: null,
    pinnedMessageId: null
  });

  const [newMessage, setNewMessage] = useState('');
  const [activeOverlayTab, setActiveOverlayTab] = useState<'ticker' | 'poll' | 'alerts' | 'themes'>('themes');

  const [pollQuestionInput, setPollQuestionInput] = useState('');
  const [pollOption1Input, setPollOption1Input] = useState('');
  const [pollOption2Input, setPollOption2Input] = useState('');

  // Local controls auto chat simulator
  const [isAutoChatActive, setIsAutoChatActive] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch full state from server on load and periodically
  const fetchServerState = async () => {
    try {
      const res = await fetch('/api/engagement/state');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.poll) setPoll(data.poll);
        if (data.chatLog) setChatLog(data.chatLog);
      }
    } catch (err) {
      console.warn('Unable to reach engagement state endpoint (will retry):', err);
    }
  };

  useEffect(() => {
    fetchServerState();
    const interval = setInterval(fetchServerState, 1500);
    return () => clearInterval(interval);
  }, []);

  // Update Settings helper
  const updateSettings = async (newSettings: Partial<OverlaySettings>) => {
    // Optimistic state
    setSettings(prev => ({ ...prev, ...newSettings }));
    try {
      const res = await fetch('/api/engagement/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatLog]);

  // Simulate active chat influx
  useEffect(() => {
    if (!isAutoChatActive) return;

    const fanUsers = ['StreamKing', 'NeonHorizon', 'DellaFox', 'ByteCoder', 'PixelPioneer', 'EchoExplorer', 'CastPilotFan', 'AuraGlow'];
    const fanComments = [
      'Are there SCTE ad markers synced?',
      'Just subscribed! Love your content direction',
      'The transition from program to sponsor commercial was incredibly smooth.',
      'What program is coming up at 4:30 PM?',
      'I need to schedule my stream like this, super sleek setup.',
      'EcoQuest series is so gorgeous!',
      'Where is this broadcast operating from?',
      'Let us vote on the playlist lineup!',
    ];
    const fanBadges: ('subscriber' | 'vip' | 'mod' | 'admin' | undefined)[] = ['subscriber', 'vip', undefined, undefined, 'subscriber', undefined];
    const fanColors = ['#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b', '#10b981', '#f43f5e'];

    const chatInterval = setInterval(() => {
      const randomUser = fanUsers[Math.floor(Math.random() * fanUsers.length)];
      const randomComment = fanComments[Math.floor(Math.random() * fanComments.length)];
      const randomColor = fanColors[Math.floor(Math.random() * fanColors.length)];
      const randomBadge = fanBadges[Math.floor(Math.random() * fanBadges.length)];
      
      const isSuper = Math.random() > 0.85;
      const superAmount = isSuper ? `$${[5, 10, 20, 50][Math.floor(Math.random() * 4)]}.00` : undefined;

      // POST message to server so all screens sync
      fetch('/api/engagement/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: randomUser,
          text: isSuper ? `Supporting the show! ${randomComment}` : randomComment,
          color: randomColor,
          badge: randomBadge,
          isSuperChat: isSuper,
          superChatAmount: superAmount
        })
      }).catch(err => console.error('Auto chat inject failed:', err));

      // Increment poll votes occasionally if poll is active
      if (poll.isActive && Math.random() > 0.4) {
        const choice = Math.floor(Math.random() * poll.options.length);
        fetch('/api/engagement/poll/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optionIndex: choice })
        }).catch(err => console.error('Auto poll vote failed:', err));
      }

      // Simulate occasional follow or sub alerts on the screen overlay
      if (Math.random() > 0.9) {
        const triggers: ('cheer' | 'subscriber' | 'follow' | 'donation')[] = ['subscriber', 'follow', 'cheer', 'donation'];
        const trigger = triggers[Math.floor(Math.random() * triggers.length)];
        const alertsDetails = {
          subscriber: 'just subscribed for Tier 1!',
          follow: 'is now following the broadcast network!',
          cheer: 'cheered 1,000 bits on-air!',
          donation: 'donated $25.00 via CastPilot Connect!'
        };
        
        const testAlert: AlertEvent = {
          id: `alert-dyn-${Date.now()}`,
          type: trigger,
          username: randomUser,
          detail: alertsDetails[trigger],
          durationMs: 4000
        };

        triggerAlert(testAlert);
      }

    }, 4500);

    return () => clearInterval(chatInterval);
  }, [isAutoChatActive, poll.isActive, poll.options?.length]);

  const triggerAlert = async (alert: AlertEvent) => {
    // Show locally
    try {
      await fetch('/api/engagement/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert })
      });
      
      // Auto clear alert after duration
      setTimeout(async () => {
        await fetch('/api/engagement/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alert: null })
        });
      }, alert.durationMs);
    } catch (err) {
      console.error('Failed to trigger alert:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage) return;

    try {
      const res = await fetch('/api/engagement/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: 'Jesse Lepota (Executive Producer)',
          text: newMessage,
          color: '#0ea5e9',
          badge: 'admin'
        })
      });

      if (res.ok) {
        setNewMessage('');
        addToast("Broadcast moderator remark published to feed.", "success");
        fetchServerState();
      }
    } catch (err) {
      console.error('Error posting manual comment:', err);
    }
  };

  const handleLaunchNewPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestionInput || !pollOption1Input || !pollOption2Input) {
      addToast("Please fill in the poll question and options.", "error");
      return;
    }

    try {
      const res = await fetch('/api/engagement/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: pollQuestionInput,
          options: [pollOption1Input, pollOption2Input]
        })
      });

      if (res.ok) {
        setPollQuestionInput('');
        setPollOption1Input('');
        setPollOption2Input('');
        addToast("Live broadcast engagement poll deployed successfully!", "success");
        fetchServerState();
      }
    } catch (err) {
      console.error('Error launching poll:', err);
    }
  };

  const handleTogglePollActive = async () => {
    try {
      const res = await fetch('/api/engagement/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !poll.isActive })
      });
      if (res.ok) {
        addToast(poll.isActive ? "Engagement poll closed." : "Engagement poll activated.", "info");
        fetchServerState();
      }
    } catch (err) {
      console.error('Error toggling poll:', err);
    }
  };

  const handlePinMessage = async (messageId: string | null) => {
    try {
      const res = await fetch('/api/engagement/chat/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      });
      if (res.ok) {
        addToast(messageId ? "Message pinned to on-screen overlay." : "Message unpinned.", "success");
        fetchServerState();
      }
    } catch (err) {
      console.error('Error pinning message:', err);
    }
  };

  const handleClearChatLogs = async () => {
    try {
      const res = await fetch('/api/engagement/chat/clear', { method: 'POST' });
      if (res.ok) {
        addToast("Simulated live chat history cleared.", "info");
        fetchServerState();
      }
    } catch (err) {
      console.error('Error clearing chat:', err);
    }
  };

  // Soundboard icons / helper
  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'subscriber': return 'bg-purple-500 text-white';
      case 'donation': return 'bg-emerald-500 text-white';
      case 'cheer': return 'bg-amber-500 text-slate-950';
      default: return 'bg-sky-500 text-white';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'subscriber': return <Award className="h-5 w-5 animate-bounce" />;
      case 'donation': return <Gift className="h-5 w-5 animate-bounce" />;
      case 'cheer': return <Flame className="h-5 w-5 animate-bounce" />;
      default: return <Heart className="h-5 w-5 animate-bounce" />;
    }
  };

  // Preview styling based on selected theme
  const getThemePreviewStyles = () => {
    switch (settings.theme) {
      case 'cyberpunk':
        return {
          bg: 'bg-black border-2 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.25)]',
          text: 'text-yellow-400 font-mono',
          accentText: 'text-fuchsia-400',
          accentBg: 'bg-fuchsia-500',
          tickerClass: 'bg-yellow-400 text-black border-y-2 border-black font-mono font-bold',
          barColor: 'bg-fuchsia-500'
        };
      case 'warm':
        return {
          bg: 'bg-stone-900 border border-amber-800/40 rounded-xl',
          text: 'text-amber-50',
          accentText: 'text-amber-400',
          accentBg: 'bg-amber-500',
          tickerClass: 'bg-amber-600 text-stone-950 rounded-b-xl',
          barColor: 'bg-amber-500'
        };
      case 'minimalist':
        return {
          bg: 'bg-black border border-white',
          text: 'text-white font-mono uppercase tracking-wider',
          accentText: 'text-white underline',
          accentBg: 'bg-white',
          tickerClass: 'bg-white text-black font-mono uppercase tracking-widest font-bold',
          barColor: 'bg-white'
        };
      case 'retro':
        return {
          bg: 'bg-black border border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.15)] font-mono',
          text: 'text-green-400',
          accentText: 'text-green-300',
          accentBg: 'bg-green-500',
          tickerClass: 'bg-green-950 text-green-400 border-y border-green-500',
          barColor: 'bg-green-500'
        };
      default: // classic
        return {
          bg: 'bg-slate-950/95 border border-slate-850',
          text: 'text-white',
          accentText: 'text-sky-400',
          accentBg: 'bg-sky-500',
          tickerClass: 'bg-sky-600 text-slate-950',
          barColor: 'bg-sky-500'
        };
    }
  };

  const previewStyle = getThemePreviewStyles();

  // Helper URLs for Standalone Integration
  const host = typeof window !== 'undefined' ? window.location.host : "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const standaloneOverlayUrl = `${protocol}://${host}/?overlay=true`;
  const standaloneChatUrl = `${protocol}://${host}/?popout-chat=true`;

  return (
    <div className="space-y-6" id="engagement-studios-panel">
      
      {/* Intro Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-sky-400 font-semibold uppercase">Viewer Overlays</span>
          </div>
          <h2 className="text-lg font-bold font-display text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-400" />
            Audience Alert & Overlay Studio
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Simulate and design real-time graphic overlays, crawlers, and polling containers for linear programming. Engage viewers with live broadcast interactions.
          </p>
        </div>

        <button
          onClick={() => setIsAutoChatActive(!isAutoChatActive)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
            isAutoChatActive 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          {isAutoChatActive ? '● Chat Influx: Simulated Active' : '○ Chat Influx: Paused'}
        </button>
      </div>

      {/* Standalone Broadcast & OBS Integration Hub */}
      <div className="rounded-xl border border-sky-900/30 bg-sky-950/15 p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-sky-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-tight">OBS Studio & Multi-Screen Broadcast Hub</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Integrate dynamic CastPilot live widgets directly inside OBS Studio, vMix, or Streamlabs. Copy the transparent-ready overlay browser link, or pop out the high-density moderation dashboard onto a secondary monitor.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Box 1: Standalone OBS Overlay Browser Source */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Layout className="h-4 w-4 text-sky-400" />
                  OBS Browser Source Overlay Link
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30 font-bold uppercase">
                  Transparent BG
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Add this exact URL as a <strong>Browser Source</strong> in OBS to overlay tickers, active polls, and real-time chat directly onto your feed video:
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-[11px] select-all">
              <span className="text-sky-400 truncate flex-1" title={standaloneOverlayUrl}>
                {standaloneOverlayUrl}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(standaloneOverlayUrl);
                  addToast("Overlay Browser Source URL copied!", "success");
                }}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-[10px] font-bold text-slate-300 hover:text-white transition flex items-center gap-1 shrink-0"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
              <a
                href={standaloneOverlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-slate-300 hover:text-white transition shrink-0"
                title="Launch Overlays standalone page"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Box 2: Standalone Moderation & Streamer Pop-out Chat */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  Mod & Streamer Chat Deck (Popout)
                </span>
                <span className="text-[9px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/30 font-bold uppercase">
                  Dual Monitor
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Pop out a high-density, screen-optimized moderation panel to keep on a secondary monitor for pinning chats, timeout logs, and simulated fan triggers.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-[11px]">
              <span className="text-purple-400 truncate flex-1" title={standaloneChatUrl}>
                {standaloneChatUrl}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(standaloneChatUrl);
                  addToast("Moderator Chat URL copied!", "success");
                }}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-[10px] font-bold text-slate-300 hover:text-white transition flex items-center gap-1 shrink-0"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
              <a
                href={standaloneChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-slate-300 hover:text-white transition shrink-0"
                title="Pop out Mod Chat Deck"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left hand: Playout overlay monitor preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Overlay Monitor Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl relative">
            
            {/* Top Bar Video Indicator */}
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Tv className="h-3.5 w-3.5 text-sky-400" />
                Live Playout Screen Overlay Active Theme Preview: <strong className="text-sky-400 uppercase font-bold">{settings.theme}</strong>
              </span>
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </div>

            {/* Video Background Mock Canvas */}
            <div className="h-[365px] bg-slate-900 relative overflow-hidden flex flex-col justify-between">
              
              {/* Overlay Top Bar: Brand Watermark */}
              <div className="p-4 flex justify-between items-start z-20 pointer-events-none">
                <div className="bg-slate-950/85 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono font-bold text-white tracking-widest uppercase flex items-center gap-1">
                  <span>CASTPILOT</span>
                  <span className="text-red-500 font-extrabold">FAST-LIVE</span>
                </div>

                <div className="bg-slate-950/85 border border-slate-800 rounded px-2 py-1 text-[10px] font-mono font-bold text-slate-400">
                  UTC: {new Date().toISOString().slice(11, 19)}
                </div>
              </div>

              {/* Middle Layer: Live Floating Alert Box */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                {settings.activeAlert && (
                  <div className={`p-4 rounded-xl shadow-2xl flex items-center gap-3.5 animate-bounce max-w-sm ${previewStyle.bg}`}>
                    <div className={`p-3 rounded-xl ${getAlertBadgeColor(settings.activeAlert.type)}`}>
                      {getAlertIcon(settings.activeAlert.type)}
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider font-mono font-bold text-sky-400">{settings.activeAlert.type} alert</h4>
                      <p className={`text-xs font-bold mt-1 ${previewStyle.text}`}>
                        <strong className="text-emerald-400">{settings.activeAlert.username}</strong> {settings.activeAlert.detail}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lower Layer: Active overlay components */}
              <div className="p-4 space-y-3 z-20 pointer-events-none">
                
                {/* Active Poll Widget */}
                {poll.isActive && (
                  <div className={`p-3.5 rounded-xl max-w-sm space-y-2 text-xs shadow-xl animate-fadeIn ${previewStyle.bg}`}>
                    <h5 className={`font-bold leading-tight flex items-center gap-1.5 ${previewStyle.text}`}>
                      <BarChart2 className={`h-4 w-4 shrink-0 ${previewStyle.accentText}`} />
                      {poll.question}
                    </h5>
                    
                    <div className="space-y-1.5">
                      {poll.options.map((opt, i) => {
                        const percent = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400">
                              <span className="truncate pr-1">{opt.text}</span>
                              <span className={`font-bold ${previewStyle.text}`}>{percent}% ({opt.votes})</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-500 ${previewStyle.barColor}`} style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <p className="text-[9px] text-slate-500 font-mono text-right">{poll.totalVotes.toLocaleString()} simulated live votes</p>
                  </div>
                )}

              </div>

              {/* Bottom Layer: Scrolling Ticker Tape Overlay */}
              {settings.tickerVisible && (
                <div className={`text-xs font-bold py-2 border-t overflow-hidden whitespace-nowrap z-25 ${previewStyle.tickerClass}`}>
                  <div className="inline-block animate-marquee tracking-wide uppercase font-mono">
                    {settings.tickerText} • {settings.tickerText}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Config Controls for tickers, polls, crawlers */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg">
            
            {/* Customizer Tabs */}
            <div className="flex border-b border-slate-900 pb-3 gap-4 mb-4">
              {[
                { id: 'themes', label: 'Graphic Themes & Style' },
                { id: 'ticker', label: 'News Ticker Tape' },
                { id: 'poll', label: 'Live Engagement Poll' },
                { id: 'alerts', label: 'Simulator Alerts Triggers' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveOverlayTab(t.id as any)}
                  className={`text-xs font-semibold tracking-wide border-b-2 pb-1.5 transition ${
                    activeOverlayTab === t.id
                      ? 'border-sky-500 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Graphic Themes */}
            {activeOverlayTab === 'themes' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-sky-400" />
                    Overlay Theme Customization
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Syncs automatically</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'classic', name: 'Classic Slate', color: 'bg-slate-900 border-sky-500 text-sky-400' },
                    { id: 'cyberpunk', name: 'Neon Cyber', color: 'bg-black border-fuchsia-500 text-fuchsia-400' },
                    { id: 'warm', name: 'Cozy Warm', color: 'bg-stone-900 border-amber-600 text-amber-500' },
                    { id: 'minimalist', name: 'Minimal Stark', color: 'bg-black border-white text-white' },
                    { id: 'retro', name: 'CRT Green', color: 'bg-black border-green-500 text-green-400' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        updateSettings({ theme: t.id as any });
                        addToast(`Visual theme updated to ${t.name}`, "success");
                      }}
                      className={`p-3.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                        settings.theme === t.id 
                          ? `${t.color} border-2` 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[11px] font-bold block">{t.name}</span>
                      <span className="text-[8px] opacity-75 font-mono uppercase mt-1">Select</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-900 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold block">Ticker Tape speed</label>
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 rounded-lg p-1">
                      {['slow', 'normal', 'fast'].map(s => (
                        <button
                          key={s}
                          onClick={() => updateSettings({ tickerSpeed: s as any })}
                          className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition ${
                            settings.tickerSpeed === s ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold block">Floating Overlay ChatBox</label>
                    <button
                      onClick={() => updateSettings({ showChatBox: !settings.showChatBox })}
                      className={`w-full py-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        settings.showChatBox 
                          ? 'bg-sky-600/10 border-sky-500/30 text-sky-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      {settings.showChatBox ? 'Overlay ChatBox: ENABLED' : 'Overlay ChatBox: HIDDEN'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Ticker customizer */}
            {activeOverlayTab === 'ticker' && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400">On-Screen Ticker Text</label>
                  <button
                    onClick={() => updateSettings({ tickerVisible: !settings.tickerVisible })}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border transition ${
                      settings.tickerVisible ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {settings.tickerVisible ? 'Graphic Enabled' : 'Graphic Hidden'}
                  </button>
                </div>
                <input
                  type="text"
                  value={settings.tickerText}
                  onChange={(e) => updateSettings({ tickerText: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  placeholder="Insert ticker tape copy..."
                />
                <p className="text-[10px] text-slate-500 font-mono">
                  Ticker text continuously pans across the bottom layout in real-time. Broadcasters use this for tickers, announcements, and sponsor calls.
                </p>
              </div>
            )}

            {/* Tab: Poll Creator */}
            {activeOverlayTab === 'poll' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300">Deploy New Live Poll</h4>
                  <button
                    onClick={handleTogglePollActive}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border transition ${
                      poll.isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {poll.isActive ? 'Poll Active' : 'Poll Closed'}
                  </button>
                </div>

                <form onSubmit={handleLaunchNewPoll} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold mb-1">Poll Question</label>
                    <input
                      type="text"
                      placeholder="e.g. Which segment should we air next?"
                      value={pollQuestionInput}
                      onChange={(e) => setPollQuestionInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">Option 1</label>
                      <input
                        type="text"
                        placeholder="Option A"
                        value={pollOption1Input}
                        onChange={(e) => setPollOption1Input(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                        required
                    />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">Option 2</label>
                      <input
                        type="text"
                        placeholder="Option B"
                        value={pollOption2Input}
                        onChange={(e) => setPollOption2Input(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    Launch Interactive Poll
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Alerts soundboard */}
            {activeOverlayTab === 'alerts' && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="text-xs font-bold text-slate-300">Simulate Screen alert pops</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  Trigger custom animated widgets to simulate events inside the real OBS Browser Overlay.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => triggerAlert({ id: 'f-1', type: 'follow', username: 'MaxRetro', detail: 'is now following your channel!', durationMs: 4000 })}
                    className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold transition flex flex-col items-center gap-1.5"
                  >
                    <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
                    New Follower
                  </button>
                  <button
                    onClick={() => triggerAlert({ id: 's-1', type: 'subscriber', username: 'SkyLineTV', detail: 'just subscribed for Tier 1!', durationMs: 4000 })}
                    className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold transition flex flex-col items-center gap-1.5"
                  >
                    <Award className="h-4 w-4 text-purple-400 animate-pulse" />
                    New Subscriber
                  </button>
                  <button
                    onClick={() => triggerAlert({ id: 'c-1', type: 'cheer', username: 'BitsMaster', detail: 'cheered 500 bits live!', durationMs: 4000 })}
                    className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold transition flex flex-col items-center gap-1.5"
                  >
                    <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
                    Cheer Bits
                  </button>
                  <button
                    onClick={() => triggerAlert({ id: 'd-1', type: 'donation', username: 'AdCorp Inc', detail: 'donated $100.00 to show fund!', durationMs: 4000 })}
                    className="p-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold transition flex flex-col items-center gap-1.5"
                  >
                    <Gift className="h-4 w-4 text-emerald-400 animate-pulse" />
                    Sponsor Donation
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right hand: Chat console simulator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-950 rounded-xl border border-slate-800 h-[645px] shadow-xl overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-900 bg-slate-950 flex items-center justify-between shrink-0">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-sky-400" />
              Live Interactive Chat Feed
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClearChatLogs}
                className="text-[9px] text-rose-400 hover:text-rose-300 font-bold uppercase transition"
                title="Clear logs"
              >
                Clear
              </button>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 font-bold uppercase">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>

          {/* Active pinned indicator on dashboard */}
          {settings.pinnedMessageId && (
            <div className="bg-rose-500/10 border-b border-rose-500/20 px-3 py-1.5 flex items-center justify-between text-[11px] shrink-0 animate-fadeIn">
              <div className="flex items-center gap-1.5 truncate">
                <span className="bg-rose-600 text-white font-bold text-[8px] px-1 rounded">PINNED</span>
                <span className="text-slate-300 truncate font-mono">
                  "{chatLog.find(c => c.id === settings.pinnedMessageId)?.text || "Active broadcast notice"}"
                </span>
              </div>
              <button onClick={() => handlePinMessage(null)} className="text-[10px] text-rose-400 underline font-bold hover:text-rose-300">
                Dismiss
              </button>
            </div>
          )}

          {/* Messages scroll chamber */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar scroll-smooth"
          >
            {chatLog.map(msg => {
              const isPinned = msg.id === settings.pinnedMessageId;
              return (
                <div 
                  key={msg.id} 
                  className={`p-2.5 rounded-lg text-xs leading-normal relative group ${
                    msg.isSuperChat 
                      ? 'bg-amber-500/10 border-l-4 border-amber-500 shadow-md' 
                      : isPinned
                      ? 'bg-rose-500/15 border-l-4 border-rose-500'
                      : 'bg-slate-900/30 border border-transparent hover:border-slate-850'
                  }`}
                >
                  
                  {/* Moderator fast actions overlay on group hover */}
                  <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded shadow-md z-10">
                    <button
                      onClick={() => handlePinMessage(isPinned ? null : msg.id)}
                      className={`p-1 rounded text-[9px] font-bold flex items-center gap-0.5 ${isPinned ? 'text-rose-400 bg-rose-500/15' : 'text-slate-400 hover:text-white'}`}
                      title="Pin to screen overlay"
                    >
                      <Pin className="h-3 w-3" />
                      {isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button
                      onClick={() => {
                        fetch('/api/engagement/chat', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            user: 'BroadcasterBot',
                            text: `🚨 MOD NOTICE: Simulated timeout applied to @${msg.user}.`,
                            color: '#10b981',
                            badge: 'mod'
                          })
                        }).then(() => fetchServerState());
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded text-[9px] font-bold flex items-center gap-0.5"
                      title="Mute user"
                    >
                      <ShieldAlert className="h-3 w-3" />
                      Timeout
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <div className="flex items-center gap-1.5">
                      {msg.badge && (
                        <span className={`text-[8px] font-mono font-bold uppercase px-1 rounded ${
                          msg.badge === 'admin' 
                            ? 'bg-red-500 text-white' 
                            : msg.badge === 'mod' 
                            ? 'bg-emerald-500 text-slate-950' 
                            : msg.badge === 'vip' 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-sky-500 text-slate-950'
                        }`}>
                          {msg.badge}
                        </span>
                      )}
                      <span className="font-bold font-mono" style={{ color: msg.color }}>
                        {msg.user}
                      </span>
                    </div>
                    
                    <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>

                  {msg.isSuperChat && (
                    <div className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded font-mono inline-block mb-1.5 uppercase">
                      Supported: {msg.superChatAmount}
                    </div>
                  )}

                  <p className={`${msg.isSuperChat ? 'text-amber-200 font-semibold' : 'text-slate-300'}`}>
                    {msg.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Form write panel */}
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-900 bg-slate-950 shrink-0 flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Post a moderator notice or response as Broadcaster..."
              className="flex-1 bg-slate-900 border border-slate-850 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 placeholder-slate-650"
            />
            <button
              type="submit"
              className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition"
              title="Publish comment"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
