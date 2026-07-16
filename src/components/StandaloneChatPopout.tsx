import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  ShieldAlert, 
  Volume2, 
  Pin, 
  Send, 
  Trash2, 
  Flame, 
  Check, 
  Users, 
  Zap, 
  BarChart2, 
  Clock, 
  Grid,
  Sparkles,
  Award
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
  flagged?: boolean;
}

export default function StandaloneChatPopout() {
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [theme, setTheme] = useState<'slate' | 'hacker' | 'twitch' | 'terminal'>('slate');
  
  // Custom chat speed analytics states
  const [chatsPerMinute, setChatsPerMinute] = useState(24);
  const [uniqueChatters, setUniqueChatters] = useState(12);
  const [totalRevenue, setTotalRevenue] = useState(135);
  const [moderatedCount, setModeratedCount] = useState(0);

  const [botCommandActive, setBotCommandActive] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync state from server periodically
  const fetchState = async () => {
    try {
      const res = await fetch('/api/engagement/state');
      if (res.ok) {
        const data = await res.json();
        setChatLog(data.chatLog || []);
        setPinnedId(data.settings?.pinnedMessageId || null);
      }
    } catch (err) {
      console.warn('Unable to reach chat popout state endpoint (will retry):', err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Command handlers
  const handleSendMessage = async (textToSend: string, customUser = 'Jesse Lepota (Executive Producer)', customBadge = 'admin') => {
    if (!textToSend.trim()) return;

    try {
      const res = await fetch('/api/engagement/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: customUser,
          text: textToSend,
          badge: customBadge,
          color: customBadge === 'admin' ? '#0ea5e9' : '#10b981',
          isSuperChat: false
        })
      });

      if (res.ok) {
        setNewMessage('');
        fetchState();
      }
    } catch (err) {
      console.error('Error posting message:', err);
    }
  };

  const handlePinMessage = async (id: string | null) => {
    try {
      const res = await fetch('/api/engagement/chat/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: id })
      });
      if (res.ok) {
        setPinnedId(id);
      }
    } catch (err) {
      console.error('Error pinning message:', err);
    }
  };

  const handleClearChat = async () => {
    try {
      const res = await fetch('/api/engagement/chat/clear', { method: 'POST' });
      if (res.ok) {
        setChatLog([]);
        setPinnedId(null);
      }
    } catch (err) {
      console.error('Error clearing chat:', err);
    }
  };

  const handleTimeoutUser = (username: string) => {
    setModeratedCount(prev => prev + 1);
    handleSendMessage(`🚨 BROADCASTER BOT: User @${username} has been timed out for 10 minutes (Reason: Spam).`, 'BroadcasterBot', 'mod');
  };

  const handleTriggerBotMacro = (command: string, detail: string) => {
    setBotCommandActive(command);
    handleSendMessage(`🤖 BOT COMMAND: ${detail}`, 'CastPilotBot', 'vip');
    setTimeout(() => setBotCommandActive(null), 3000);
  };

  const handleInjectSimulatedSuperChat = async () => {
    const supporterNames = ['ApexPro', 'GlitchArt', 'VoxelCore', 'PixelLord', 'SynthWaveGirl'];
    const supportTexts = [
      'Awesome playout stream quality tonight!',
      'Loving the SCTE-35 ad sequence triggers.',
      'Super setup! What server engine is this?',
      'CastPilot has changed my stream management completely!',
      'Keep up the amazing linear FAST network!'
    ];
    const amounts = ['$5.00', '$10.00', '$25.00', '$50.00', '$100.00'];

    const name = supporterNames[Math.floor(Math.random() * supporterNames.length)];
    const text = supportTexts[Math.floor(Math.random() * supportTexts.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];

    try {
      const res = await fetch('/api/engagement/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: name,
          text: `[SuperChat Support] ${text}`,
          badge: 'subscriber',
          color: '#f59e0b',
          isSuperChat: true,
          superChatAmount: amount
        })
      });

      if (res.ok) {
        setTotalRevenue(prev => prev + parseInt(amount.replace('$', '')));
        fetchState();
      }
    } catch (err) {
      console.error('Error injecting superchat:', err);
    }
  };

  // Themes
  const popoutThemes = {
    slate: {
      bg: 'bg-slate-950 text-slate-100',
      panelBg: 'bg-slate-900',
      border: 'border-slate-800',
      inputBg: 'bg-slate-950 border-slate-800',
      accent: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
      badgeClass: 'bg-sky-500/10 text-sky-400'
    },
    hacker: {
      bg: 'bg-zinc-950 text-emerald-400 font-mono',
      panelBg: 'bg-zinc-900 border border-emerald-500/20',
      border: 'border-emerald-500/30',
      inputBg: 'bg-black border-emerald-500/50 text-emerald-400',
      accent: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      badgeClass: 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
    },
    twitch: {
      bg: 'bg-zinc-950 text-slate-100',
      panelBg: 'bg-[#18181b] border border-[#a855f7]/20',
      border: 'border-[#1f1f23]',
      inputBg: 'bg-[#1f1f23] border-[#a855f7]/30 text-white',
      accent: 'text-[#a855f7] border-[#a855f7]/20 bg-[#a855f7]/5',
      badgeClass: 'bg-[#a855f7]/15 text-[#a855f7] font-semibold'
    },
    terminal: {
      bg: 'bg-black text-amber-500 font-mono',
      panelBg: 'bg-stone-900 border border-amber-500/10',
      border: 'border-amber-500/20',
      inputBg: 'bg-black border-amber-500/40 text-amber-500',
      accent: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
      badgeClass: 'bg-amber-950/50 text-amber-500 border border-amber-500/20'
    }
  };

  const activeTheme = popoutThemes[theme];

  return (
    <div className={`min-h-screen ${activeTheme.bg} flex flex-col p-4 md:p-6 transition-all duration-300`}>
      
      {/* Top Console Bar */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b ${activeTheme.border} mb-4 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <MessageSquare className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase flex items-center gap-2">
              CastPilot Chat Control Deck
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded animate-pulse font-bold">
                MOD POWERED
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">High-density live-stream moderation & simulation terminal.</p>
          </div>
        </div>

        {/* Theme select & layout quick toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.keys(popoutThemes).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t as any)}
              className={`text-[10px] font-mono px-2.5 py-1 rounded border uppercase font-bold transition-all ${
                theme === t 
                  ? 'bg-sky-600 border-sky-500 text-white' 
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
          <button 
            onClick={handleClearChat}
            className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded text-[10px] font-bold flex items-center gap-1 transition"
          >
            <Trash2 className="h-3 w-3" />
            Clear Feed
          </button>
        </div>
      </div>

      {/* Grid Layout: Controls, Analytics, Chat Chamber */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        
        {/* Left Column: Metrics & Bots (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto no-scrollbar">
          
          {/* Chat Stream Diagnostics/Metrics */}
          <div className={`p-4 rounded-xl ${activeTheme.panelBg} border ${activeTheme.border} space-y-4`}>
            <h3 className="text-xs font-bold uppercase flex items-center gap-1.5 text-white">
              <BarChart2 className="h-4 w-4 text-sky-400" />
              Live chat metrics
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Chat Speed</span>
                  <strong className="text-sm font-black text-white">{chatsPerMinute} CPM</strong>
                </div>
                <Zap className="h-4 w-4 text-sky-400" />
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Active chatters</span>
                  <strong className="text-sm font-black text-white">{uniqueChatters} users</strong>
                </div>
                <Users className="h-4 w-4 text-purple-400" />
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Simulated Support</span>
                  <strong className="text-sm font-black text-amber-400">${totalRevenue}.00</strong>
                </div>
                <Flame className="h-4 w-4 text-amber-500" />
              </div>

              <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Timeout Actions</span>
                  <strong className="text-sm font-black text-rose-400">{moderatedCount} timed-out</strong>
                </div>
                <ShieldAlert className="h-4 w-4 text-rose-500" />
              </div>
            </div>
          </div>

          {/* Bot Command Macro Soundboard */}
          <div className={`p-4 rounded-xl ${activeTheme.panelBg} border ${activeTheme.border} space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase flex items-center gap-1.5 text-white">
                <Grid className="h-4 w-4 text-purple-400" />
                Moderator Bot Macros
              </h3>
              <span className="text-[9px] font-mono text-slate-500">Auto-injects macros</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { cmd: '!rules', desc: 'Post broadcast behavior guidelines', text: 'Please respect all participants. Zero tolerance for spam or links.' },
                { cmd: '!discord', desc: 'Promote active fan community', text: 'Join our CastPilot FAST Broadcasters Discord: https://discord.gg/castpilot' },
                { cmd: '!specs', desc: 'Detail system playout parameters', text: 'Broadcast server running fully-synchronized on port 3000 container with Google Gemini integration.' },
                { cmd: '!schedule', desc: 'Promote current channel guide', text: 'Check the AI Playout scheduler tab. Next premiere: EcoQuest season block starts soon.' }
              ].map(item => (
                <button
                  key={item.cmd}
                  onClick={() => handleTriggerBotMacro(item.cmd, item.text)}
                  disabled={botCommandActive !== null}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    botCommandActive === item.cmd 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                      : 'bg-slate-950/70 border-slate-900 hover:border-slate-800 text-slate-300'
                  }`}
                >
                  <strong className="text-sky-400 font-mono text-[11px] block">{item.cmd}</strong>
                  <span className="text-[9px] text-slate-500 mt-0.5 leading-normal">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Influx Simulation Panel */}
          <div className={`p-4 rounded-xl ${activeTheme.panelBg} border ${activeTheme.border} space-y-3`}>
            <h3 className="text-xs font-bold uppercase flex items-center gap-1.5 text-white">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Stream Simulation tools
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              For testing overlays and screen layouts, trigger active fan behavior manually.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleInjectSimulatedSuperChat}
                className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Flame className="h-4 w-4 shrink-0" />
                Trigger SuperChat
              </button>

              <button
                onClick={() => {
                  const fanChatters = ['EchoRunner', 'StreamerPro', 'AuraGlow', 'CyberPunkX', 'FASTMaster'];
                  const messages = [
                    'The ad timing was spot on!',
                    'Let us vote on extending this segment.',
                    'The visual overlay theme looks slick!',
                    'Buffering is down to zero. Great job.',
                    'Can we request retro playlists next week?'
                  ];
                  handleSendMessage(
                    messages[Math.floor(Math.random() * messages.length)],
                    fanChatters[Math.floor(Math.random() * fanChatters.length)],
                    'subscriber'
                  );
                }}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-750 text-slate-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-sky-400" />
                Inject Fan Comment
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Active Live Chat Panel (7 cols) */}
        <div className={`lg:col-span-7 flex flex-col border ${activeTheme.border} rounded-xl overflow-hidden min-h-[500px]`}>
          
          {/* Active Pinned Indicator */}
          {pinnedId && (
            <div className="bg-rose-500/10 border-b border-rose-500/25 px-4 py-2.5 flex items-center justify-between text-xs animate-fadeIn shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                  ACTIVE ON SCREEN PIN
                </span>
                <span className="text-slate-300 truncate font-medium max-w-xs">
                  "{chatLog.find(c => c.id === pinnedId)?.text}"
                </span>
              </div>
              <button 
                onClick={() => handlePinMessage(null)}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold underline transition"
              >
                Unpin
              </button>
            </div>
          )}

          {/* Active Chat feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar bg-slate-950/20">
            {chatLog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 gap-2 py-24">
                <MessageSquare className="h-8 w-8 text-slate-700 animate-bounce" />
                <p className="text-xs">No active comments in chat feed.</p>
                <p className="text-[10px] text-slate-650 max-w-xs">Use the simulation triggers on the left to inject fans or send mod remark.</p>
              </div>
            ) : (
              chatLog.map(msg => {
                const isPinned = msg.id === pinnedId;
                return (
                  <div 
                    key={msg.id}
                    className={`p-3 rounded-lg text-xs leading-normal relative group transition-all ${
                      msg.isSuperChat 
                        ? 'bg-amber-500/10 border-l-4 border-amber-500 shadow-md' 
                        : isPinned
                        ? 'bg-rose-500/10 border-l-4 border-rose-500'
                        : 'bg-slate-900/40 border border-transparent hover:border-slate-900'
                    }`}
                  >
                    
                    {/* Hover controls for moderators */}
                    <div className="absolute right-2.5 top-2.5 hidden group-hover:flex items-center gap-1.5 bg-slate-900/95 border border-slate-800 p-1 rounded shadow-lg z-15">
                      <button
                        onClick={() => handlePinMessage(isPinned ? null : msg.id)}
                        className={`p-1 rounded transition text-[10px] font-bold flex items-center gap-1 ${
                          isPinned ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-white'
                        }`}
                        title={isPinned ? 'Unpin message' : 'Pin to broadcast overlay'}
                      >
                        <Pin className="h-3 w-3" />
                        {isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => handleTimeoutUser(msg.user)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded transition text-[10px] font-bold flex items-center gap-1"
                        title="Timeout user for spam"
                      >
                        <ShieldAlert className="h-3 w-3" />
                        Timeout
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
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
                        <strong className="font-mono font-bold text-slate-200" style={{ color: msg.color }}>
                          {msg.user}
                        </strong>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                    </div>

                    {msg.isSuperChat && (
                      <div className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded font-mono inline-block mb-1.5 uppercase tracking-wide">
                        Supported: {msg.superChatAmount}
                      </div>
                    )}

                    <p className={`${msg.isSuperChat ? 'text-amber-100 font-semibold' : 'text-slate-300'}`}>
                      {msg.text}
                    </p>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Send Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(newMessage);
            }} 
            className="p-3 bg-slate-950 border-t border-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type broadcaster comment or mod announcement..."
              className="flex-1 bg-slate-900 border border-slate-850 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
