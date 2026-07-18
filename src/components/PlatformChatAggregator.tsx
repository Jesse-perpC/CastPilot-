import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Pin, 
  ShieldAlert, 
  Globe, 
  Filter, 
  Sparkles, 
  Plus,
  Tv,
  CheckCircle2
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
  platform?: 'youtube' | 'twitch' | 'facebook_profile' | 'facebook_group' | 'website';
}

interface PlatformChatAggregatorProps {
  chatLog: ChatMessage[];
  pinnedMessageId: string | null;
  onPinMessage: (id: string | null) => void;
  onClearChat: () => void;
  onSendMessage: (text: string, platform?: string) => void;
  isAutoChatActive: boolean;
  onToggleAutoChat: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function PlatformChatAggregator({
  chatLog,
  pinnedMessageId,
  onPinMessage,
  onClearChat,
  onSendMessage,
  isAutoChatActive,
  onToggleAutoChat,
  addToast
}: PlatformChatAggregatorProps) {
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [inputText, setInputText] = useState('');
  const [inputPlatform, setInputPlatform] = useState<'youtube' | 'twitch' | 'facebook_profile' | 'facebook_group' | 'website'>('youtube');
  const [inputUser, setInputUser] = useState('Executive Producer');
  const [isInjectModalOpen, setIsInjectModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chatLog]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText, inputPlatform);
    setInputText('');
  };

  const handleInjectMock = (platform: 'youtube' | 'twitch' | 'facebook_profile' | 'facebook_group' | 'website', user: string, text: string) => {
    // Post to backend with platform metadata
    fetch('/api/engagement/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user,
        text,
        platform,
        color: platform === 'youtube' ? '#ef4444' : platform === 'twitch' ? '#a855f7' : platform.startsWith('facebook') ? '#3b82f6' : '#14b8a6',
        badge: Math.random() > 0.6 ? 'subscriber' : undefined
      })
    })
    .then(() => {
      addToast(`Simulated viewer comment injected from ${platform.replace('_', ' ').toUpperCase()}!`, 'success');
    })
    .catch(() => {
      addToast('Failed to inject comment', 'error');
    });
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'youtube':
        return <span className="h-4.5 w-4.5 rounded bg-red-600/10 text-red-500 border border-red-500/20 flex items-center justify-center font-mono text-[10px] font-bold shrink-0" title="YouTube Live">YT</span>;
      case 'twitch':
        return <span className="h-4.5 w-4.5 rounded bg-purple-600/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-mono text-[10px] font-bold shrink-0" title="Twitch.tv">TW</span>;
      case 'facebook_profile':
        return <span className="h-4.5 w-4.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-mono text-[9px] font-bold shrink-0" title="Facebook Profile">Fp</span>;
      case 'facebook_group':
        return <span className="h-4.5 w-4.5 rounded bg-sky-600/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-mono text-[9px] font-bold shrink-0" title="Facebook Group / Page">Fg</span>;
      default:
        return <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" title="Website Player Comments" />;
    }
  };

  const getPlatformLabel = (platform?: string) => {
    switch (platform) {
      case 'youtube': return 'YouTube Live';
      case 'twitch': return 'Twitch.tv';
      case 'facebook_profile': return 'FB Profile';
      case 'facebook_group': return 'FB Group/Page';
      case 'website': return 'Website Player';
      default: return 'CastPilot Embed';
    }
  };

  // Filter messages
  const filteredChat = chatLog.filter(msg => {
    if (filterPlatform === 'all') return true;
    return msg.platform === filterPlatform;
  });

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden h-full flex flex-col shadow-2xl">
      {/* Aggregator Header */}
      <div className="p-4 border-b border-slate-900 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-sky-400" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multiplatform Chat Hub</h3>
            <p className="text-[10px] text-slate-500 font-mono">Aggregating comments from 5 active syndications</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsInjectModalOpen(!isInjectModalOpen)}
            className="text-[10px] bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/20 px-2.5 py-1 rounded-lg transition font-semibold flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" />
            Inject Sandbox Message
          </button>
          
          <button 
            onClick={onClearChat}
            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase px-2 py-1 rounded hover:bg-rose-500/10 transition"
          >
            Clear
          </button>

          <button
            onClick={onToggleAutoChat}
            className={`px-2.5 py-1 text-[10px] font-semibold rounded-md border transition ${
              isAutoChatActive 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {isAutoChatActive ? '● Streaming chat active' : '○ Chat paused'}
          </button>
        </div>
      </div>

      {/* Filter and Status Subbar */}
      <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-900 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Filter className="h-3 w-3 text-slate-500" />
          <span>Filter:</span>
          <div className="flex gap-1">
            {['all', 'youtube', 'twitch', 'facebook_profile', 'facebook_group', 'website'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPlatform(p)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono capitalize transition ${
                  filterPlatform === p 
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                    : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-slate-200'
                }`}
              >
                {p === 'all' ? 'All Channels' : p === 'facebook_profile' ? 'FB Profile' : p === 'facebook_group' ? 'FB Group/Page' : p}
              </button>
            ))}
          </div>
        </div>

        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30 font-bold uppercase">
          Live feed active
        </span>
      </div>

      {/* Inject sandbox popup form */}
      {isInjectModalOpen && (
        <div className="bg-slate-900/90 border-b border-slate-800 p-3.5 space-y-3.5 shrink-0 animate-fadeIn text-xs">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-sky-400" />
              Sandbox Viewer comment injector
            </span>
            <button onClick={() => setIsInjectModalOpen(false)} className="text-slate-500 hover:text-slate-300">×</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Mock Platform</label>
              <select
                value={inputPlatform}
                onChange={(e: any) => setInputPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
              >
                <option value="youtube">YouTube Live Stream</option>
                <option value="twitch">Twitch.tv FAST Lounge</option>
                <option value="facebook_profile">Facebook Personal Profile</option>
                <option value="facebook_group">Facebook Page/Group</option>
                <option value="website">Direct Website Webplayer</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-semibold mb-1">Mock Viewer Name</label>
              <input
                type="text"
                value={inputUser}
                onChange={(e) => setInputUser(e.target.value)}
                placeholder="e.g. BroadcastFanatic"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div className="sm:col-span-1 flex items-end">
              <button
                onClick={() => {
                  const testPhrases = [
                    "This multi-stream latency is insane! Zero lag.",
                    "Monetization banners look neat on the stream layout.",
                    "Invited guest audio is crystal clear. Nice mix!",
                    "Streaming to YouTube & Facebook simultaneously is a game changer.",
                    "Can we record this session for playout loop tomorrow?"
                  ];
                  const randomText = testPhrases[Math.floor(Math.random() * testPhrases.length)];
                  handleInjectMock(inputPlatform, inputUser, randomText);
                }}
                className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-2 rounded-lg font-semibold transition"
              >
                Inject Simulated Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pin Message Alert */}
      {pinnedMessageId && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-3 py-1.5 flex items-center justify-between text-[11px] shrink-0 animate-fadeIn">
          <div className="flex items-center gap-1.5 truncate">
            <span className="bg-rose-600 text-white font-bold text-[8px] px-1 rounded">ON STREAM PREVIEW</span>
            <span className="text-slate-300 truncate font-mono">
              "{chatLog.find(c => c.id === pinnedMessageId)?.text || "Active broadcast notice"}"
            </span>
          </div>
          <button onClick={() => onPinMessage(null)} className="text-[10px] text-rose-400 underline font-bold hover:text-rose-300">
            Unpin Overlay
          </button>
        </div>
      )}

      {/* Messages scrolling container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar scroll-smooth bg-slate-950/40"
      >
        {filteredChat.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs flex flex-col items-center gap-2.5">
            <MessageSquare className="h-8 w-8 text-slate-700 animate-pulse" />
            <div>
              <p>No comments logged for this filter category.</p>
              <p className="text-[10px] text-slate-600 font-mono mt-1">Simulated chat and viewer engagement runs automatically</p>
            </div>
          </div>
        ) : (
          filteredChat.map(msg => {
            const isPinned = msg.id === pinnedMessageId;
            return (
              <div 
                key={msg.id} 
                className={`p-3 rounded-xl text-xs leading-normal relative group transition-all duration-200 ${
                  msg.isSuperChat 
                    ? 'bg-amber-500/10 border-l-4 border-amber-500 shadow-md' 
                    : isPinned
                    ? 'bg-rose-500/15 border-l-4 border-rose-500'
                    : 'bg-slate-900/30 border border-slate-900/50 hover:border-slate-800 hover:bg-slate-900/60'
                }`}
              >
                {/* Moderate fast action toolbar */}
                <div className="absolute right-3 top-2.5 hidden group-hover:flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg shadow-md z-15">
                  <button
                    onClick={() => onPinMessage(isPinned ? null : msg.id)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 transition ${isPinned ? 'text-rose-400 bg-rose-500/15' : 'text-slate-400 hover:text-white'}`}
                    title="Toggle highlight on OBS Stream Frame"
                  >
                    <Pin className="h-3 w-3" />
                    {isPinned ? 'Unshow' : 'Show On Stream'}
                  </button>
                  
                  <button
                    onClick={() => {
                      onSendMessage(`🚨 BROADCASTER TIMEOUT: Simulated moderation action applied to @${msg.user}.`, 'website');
                      addToast(`Viewer @${msg.user} placed in temporary timeout.`, 'info');
                    }}
                    className="px-2 py-0.5 text-slate-400 hover:text-rose-400 rounded text-[9px] font-bold flex items-center gap-0.5 transition"
                  >
                    <ShieldAlert className="h-3 w-3" />
                    Mute User
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Platform Badge Icon */}
                    {getPlatformIcon(msg.platform)}
                    
                    <span className="text-[10px] text-slate-500 font-semibold uppercase font-mono">
                      {getPlatformLabel(msg.platform)}
                    </span>

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

                    <span className="font-bold font-mono tracking-wide" style={{ color: msg.color }}>
                      {msg.user}
                    </span>
                  </div>
                  
                  <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                </div>

                {msg.isSuperChat && (
                  <div className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded font-mono inline-block mb-1.5 uppercase">
                    Paid Contribution: {msg.superChatAmount}
                  </div>
                )}

                <p className={`${msg.isSuperChat ? 'text-amber-200 font-semibold text-xs' : 'text-slate-300'}`}>
                  {msg.text}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Aggregated comment send panel */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-900 bg-slate-950 shrink-0 flex items-center gap-2.5">
        <select
          value={inputPlatform}
          onChange={(e: any) => setInputPlatform(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 text-[11px] rounded-lg px-2 py-2 focus:outline-none shrink-0"
          title="Select active identity channel"
        >
          <option value="youtube">📺 YouTube</option>
          <option value="twitch">🎮 Twitch</option>
          <option value="facebook_profile">👤 FB Profile</option>
          <option value="facebook_group">👥 FB Group</option>
          <option value="website">🌐 WebPlayer</option>
        </select>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a verified moderator response... (Simulates direct publishing to this platform)"
          className="flex-1 bg-slate-900 border border-slate-850 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 placeholder-slate-650"
        />
        
        <button
          type="submit"
          className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition shrink-0"
          title="Publish comment"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
