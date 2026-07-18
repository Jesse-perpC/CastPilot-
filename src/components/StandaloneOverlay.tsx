import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Gift, 
  Flame, 
  Heart, 
  MessageSquare, 
  BarChart2, 
  Volume2, 
  Sparkles 
} from 'lucide-react';

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

interface OverlayState {
  settings: {
    theme: 'classic' | 'cyberpunk' | 'warm' | 'minimalist' | 'retro';
    position: 'top' | 'bottom';
    tickerSpeed: 'slow' | 'normal' | 'fast';
    showChatBox: boolean;
    tickerVisible: boolean;
    tickerText: string;
    activeAlert: any | null;
    pinnedMessageId: string | null;
    urgentAnnouncementActive?: boolean;
    urgentAnnouncementText?: string;
    urgentAnnouncementStyle?: string;
  };
  poll: {
    id: string;
    question: string;
    options: { text: string; votes: number }[];
    isActive: boolean;
    totalVotes: number;
  };
  chatLog: ChatMessage[];
}

export default function StandaloneOverlay() {
  const [state, setState] = useState<OverlayState | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);

  // Poll state from server every 1.5 seconds
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/engagement/state');
        if (res.ok) {
          const data = await res.json();
          setState(data);
        }
      } catch (err) {
        console.warn('Unable to reach overlay state endpoint (will retry):', err);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mb-4" />
        <p className="text-xs font-mono text-slate-400">CONNECTING TO OVERLAY ENGINE...</p>
      </div>
    );
  }

  const { settings, poll, chatLog } = state;

  // Theme styling dictionaries
  const themes = {
    classic: {
      bg: 'bg-slate-950/90 backdrop-blur-md',
      border: 'border-slate-800',
      textPrimary: 'text-white',
      textSecondary: 'text-slate-400',
      accent: 'text-sky-400',
      accentBg: 'bg-sky-500',
      barColor: 'bg-sky-500',
      tickerBg: 'bg-sky-600 text-slate-950',
      tickerBorder: 'border-sky-400'
    },
    cyberpunk: {
      bg: 'bg-zinc-950/95 border-2 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.25)]',
      border: 'border-fuchsia-500/50',
      textPrimary: 'text-yellow-400 font-mono',
      textSecondary: 'text-zinc-300 font-mono',
      accent: 'text-fuchsia-400',
      accentBg: 'bg-fuchsia-500',
      barColor: 'bg-fuchsia-500',
      tickerBg: 'bg-yellow-400 text-black font-mono font-black border-y-2 border-black',
      tickerBorder: 'border-yellow-400'
    },
    warm: {
      bg: 'bg-stone-900/90 backdrop-blur-md border border-amber-800/40 rounded-xl',
      border: 'border-amber-900/20',
      textPrimary: 'text-amber-50',
      textSecondary: 'text-amber-200/70',
      accent: 'text-amber-400',
      accentBg: 'bg-amber-500',
      barColor: 'bg-amber-500',
      tickerBg: 'bg-amber-600 text-stone-950',
      tickerBorder: 'border-amber-400'
    },
    minimalist: {
      bg: 'bg-black/95 border border-white',
      border: 'border-white/20',
      textPrimary: 'text-white uppercase tracking-wider font-mono',
      textSecondary: 'text-neutral-400 font-mono',
      accent: 'text-white',
      accentBg: 'bg-white',
      barColor: 'bg-white',
      tickerBg: 'bg-white text-black font-mono uppercase tracking-widest font-bold',
      tickerBorder: 'border-neutral-800'
    },
    retro: {
      bg: 'bg-black/90 border border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.15)] font-mono',
      border: 'border-green-500/30',
      textPrimary: 'text-green-400',
      textSecondary: 'text-green-600',
      accent: 'text-green-300',
      accentBg: 'bg-green-500',
      barColor: 'bg-green-500',
      tickerBg: 'bg-green-950 text-green-400 border-y border-green-500',
      tickerBorder: 'border-green-500'
    }
  };

  const activeTheme = themes[settings.theme] || themes.classic;

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
      case 'subscriber': return <Award className="h-6 w-6 animate-bounce" />;
      case 'donation': return <Gift className="h-6 w-6 animate-bounce" />;
      case 'cheer': return <Flame className="h-6 w-6 animate-bounce" />;
      default: return <Heart className="h-6 w-6 animate-bounce" />;
    }
  };

  const speedClass = {
    slow: 'animate-marquee-slow',
    normal: 'animate-marquee',
    fast: 'animate-marquee-fast'
  }[settings.tickerSpeed || 'normal'];

  // Filter last 5 messages for the floating overlay chat
  const latestChats = chatLog.slice(-5);
  const pinnedMessage = chatLog.find(c => c.id === settings.pinnedMessageId);

  return (
    <div className="min-h-screen bg-transparent w-full h-full relative overflow-hidden p-6 flex flex-col justify-between">
      
      {/* OBS Hot-Overlay Info HUD (Auto hidden after click) */}
      {showTooltip && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 border border-slate-800 text-xs text-slate-300 p-3 rounded-lg shadow-2xl flex items-center gap-3 max-w-md animate-fadeIn">
          <div className="p-1 rounded bg-sky-500/10 text-sky-400 font-bold shrink-0">OBS SOURCE ACTIVE</div>
          <p className="leading-normal text-[11px]">
            This browser source is configured with a <strong>transparent background</strong> for easy chroma-keying or overlay insertion. Press anywhere to dismiss.
          </p>
          <button 
            onClick={() => setShowTooltip(false)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-white rounded shrink-0 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TOP ROW: Floating alert & Pinned Message */}
      <div className="flex flex-col md:flex-row items-start justify-between w-full gap-4 pointer-events-none z-30">
        
        {/* Floating live alerts popup */}
        <div className="w-full md:w-auto">
          {settings.activeAlert && (
            <div className={`p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-bounce max-w-sm ${activeTheme.bg}`}>
              <div className={`p-3.5 rounded-xl ${getAlertBadgeColor(settings.activeAlert.type)}`}>
                {getAlertIcon(settings.activeAlert.type)}
              </div>
              <div>
                <h4 className={`text-[10px] uppercase tracking-wider font-mono font-bold ${activeTheme.accent}`}>
                  {settings.activeAlert.type} alert
                </h4>
                <p className={`text-xs font-bold mt-1 ${activeTheme.textPrimary}`}>
                  <strong className="text-emerald-400">{settings.activeAlert.username}</strong> {settings.activeAlert.detail}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Broadcaster Message Overlay */}
        {pinnedMessage && (
          <div className={`p-3.5 rounded-xl shadow-xl max-w-md animate-pulse border flex items-start gap-2.5 ${activeTheme.bg} ${activeTheme.border}`}>
            <span className="bg-rose-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded uppercase shrink-0 mt-0.5 font-mono">
              PINNED
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs" style={{ color: pinnedMessage.color }}>
                  {pinnedMessage.user}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">Broadcaster Pin</span>
              </div>
              <p className={`text-xs font-medium leading-relaxed ${activeTheme.textPrimary}`}>
                {pinnedMessage.text}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* URGENT ANNOUNCEMENT OVERLAY */}
      {settings.urgentAnnouncementActive && settings.urgentAnnouncementText && (
        <div className="w-full mt-2 mb-4 animate-fadeIn pointer-events-none z-40">
          <div className={`rounded-xl border shadow-2xl overflow-hidden flex items-center p-4 gap-4 backdrop-blur-md ${activeTheme.bg} ${activeTheme.border}`}>
            <div className={`px-4 py-2 rounded-lg text-xs md:text-sm font-black uppercase tracking-wider shrink-0 flex items-center gap-2 font-mono ${
              settings.urgentAnnouncementStyle === 'urgent_alert' ? 'bg-orange-600 text-white' :
              settings.urgentAnnouncementStyle === 'technical_bulletin' ? 'bg-blue-600 text-white' :
              'bg-red-600 text-white animate-pulse'
            }`}>
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              {settings.urgentAnnouncementStyle === 'urgent_alert' ? 'URGENT ALERT' :
               settings.urgentAnnouncementStyle === 'technical_bulletin' ? 'TECHNICAL UPDATE' :
               'BREAKING NEWS'}
            </div>
            <p className={`text-base md:text-lg font-extrabold truncate flex-1 tracking-wide ${activeTheme.textPrimary}`}>
              {settings.urgentAnnouncementText}
            </p>
            
            {/* Audio waveform / pulsing visualizer */}
            <div className="ml-auto flex items-end gap-0.5 h-5 shrink-0 pr-2">
              <span className="w-1 bg-red-500 animate-pulse h-4" style={{ animationDelay: '0.1s' }} />
              <span className="w-1 bg-red-500 animate-pulse h-5" style={{ animationDelay: '0.3s' }} />
              <span className="w-1 bg-red-500 animate-pulse h-3" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 bg-red-500 animate-pulse h-5" style={{ animationDelay: '0.5s' }} />
              <span className="w-1 bg-red-500 animate-pulse h-4" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      )}

      {/* MIDDLE SECTION: Interactive Poll and Chat Box Overlay (Side-by-side or stacked near bottom) */}
      <div className="flex flex-col md:flex-row items-end justify-between w-full gap-6 mt-auto mb-4 pointer-events-none z-20">
        
        {/* Live Poll Overlay Card */}
        {poll.isActive && (
          <div className={`p-4 rounded-xl shadow-2xl w-full md:w-80 flex flex-col gap-3 border ${activeTheme.bg} ${activeTheme.border}`}>
            <h5 className={`font-bold text-xs leading-snug flex items-center gap-1.5 ${activeTheme.textPrimary}`}>
              <BarChart2 className="h-4 w-4 text-emerald-400 shrink-0" />
              {poll.question}
            </h5>
            
            <div className="space-y-2">
              {poll.options.map((opt, i) => {
                const percent = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className={`truncate pr-1 ${activeTheme.textSecondary}`}>{opt.text}</span>
                      <span className={`font-bold ${activeTheme.textPrimary}`}>{percent}% ({opt.votes})</span>
                    </div>
                    <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${activeTheme.barColor}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-[9px] text-slate-500 font-mono text-right">
              {poll.totalVotes} interactive votes
            </div>
          </div>
        )}

        {/* Floating Chat Overlay */}
        {settings.showChatBox && latestChats.length > 0 && (
          <div className={`p-4 rounded-xl shadow-2xl w-full md:w-96 flex flex-col gap-2.5 border ${activeTheme.bg} ${activeTheme.border}`}>
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-900">
              <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTheme.textPrimary}`}>
                Live Stream Chat Overlay
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-hidden">
              {latestChats.map(msg => (
                <div 
                  key={msg.id}
                  className={`p-2 rounded text-xs transition-all duration-300 animate-fadeIn ${
                    msg.isSuperChat 
                      ? 'bg-amber-500/10 border-l-4 border-amber-500' 
                      : 'bg-black/25'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      {msg.badge && (
                        <span className={`text-[8px] font-mono font-bold uppercase px-1 rounded ${
                          msg.badge === 'admin' ? 'bg-red-500 text-white' :
                          msg.badge === 'mod' ? 'bg-emerald-500 text-slate-900' :
                          msg.badge === 'vip' ? 'bg-rose-500 text-white' : 'bg-sky-500 text-slate-900'
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
                    <div className="text-amber-400 text-[10px] font-mono font-bold uppercase mb-1">
                      SUPPORT: {msg.superChatAmount}
                    </div>
                  )}

                  <p className={`${msg.isSuperChat ? 'text-amber-100 font-medium' : 'text-slate-300'}`}>
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM ROW: Dynamic Ticker Tape Crawl */}
      {settings.tickerVisible && settings.tickerText && (
        <div className={`w-full py-2.5 font-bold text-xs uppercase tracking-wide overflow-hidden whitespace-nowrap border-y z-20 shadow-2xl shrink-0 ${activeTheme.tickerBg} ${activeTheme.tickerBorder}`}>
          <div className={`inline-block whitespace-nowrap ${speedClass}`}>
            {settings.tickerText} • {settings.tickerText} • {settings.tickerText}
          </div>
        </div>
      )}

    </div>
  );
}
