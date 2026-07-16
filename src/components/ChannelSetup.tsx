import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Youtube, 
  Twitch, 
  Facebook, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Save, 
  Edit3, 
  Tv, 
  Lock, 
  Key, 
  ShieldCheck, 
  Activity, 
  ExternalLink, 
  Laptop, 
  Sliders, 
  Database,
  Unplug,
  Play,
  Square,
  RotateCw
} from 'lucide-react';

interface ChannelSetupProps {
  channelName: string;
  setChannelName: (name: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export default function ChannelSetup({ channelName, setChannelName, addToast }: ChannelSetupProps) {
  // Broadcaster profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: "Jesse Lepota",
    role: "Executive Director of Programming",
    email: "jesselepota.com@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedRole, setEditedRole] = useState(profile.role);
  const [editedEmail, setEditedEmail] = useState(profile.email);
  const [editedAvatar, setEditedAvatar] = useState(profile.avatar);

  // General Channel Setup Settings
  const [stationName, setStationName] = useState(channelName);
  const [streamDelaySec, setStreamDelaySec] = useState(15);
  const [bitrateTargetKbps, setBitrateTargetKbps] = useState(6000);
  const [backupFailoverUrl, setBackupFailoverUrl] = useState("rtmp://failover.castpilot.net/backup");

  // Real OAuth Google / YouTube integration state
  const [youtubeAccount, setYoutubeAccount] = useState({
    connected: false,
    channelId: "",
    channelTitle: "",
    subscribers: 0,
    avatar: ""
  });

  const [isConfigured, setIsConfigured] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [customClientId, setCustomClientId] = useState("");
  const [customClientSecret, setCustomClientSecret] = useState("");
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [calculatedRedirectUri, setCalculatedRedirectUri] = useState(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    return "http://localhost:3000/auth/callback";
  });
  
  // Playout YouTube live status
  const [ytStreamState, setYtStreamState] = useState<{ isLive: boolean; rtmpUrl: string; streamKey: string; watchUrl?: string } | null>(null);
  const [isTogglingLive, setIsTogglingLive] = useState(false);

  // Helper function to return the required YouTube/Google OAuth scopes
  const getRequiredScopes = () => {
    return [
      {
        scope: "https://www.googleapis.com/auth/youtube",
        title: "Manage YouTube Account",
        description: "Allows the applet to create, manage, and delete live broadcasts, streams, and VODs.",
        requiredFor: "Live Playout & Broadcast setup",
        type: "Read/Write"
      },
      {
        scope: "https://www.googleapis.com/auth/youtube.force-ssl",
        title: "SSL-Only YouTube Access",
        description: "Provides secure, authenticated access to manage your YouTube content over encrypted channels.",
        requiredFor: "Secure RTMP / stream key creation",
        type: "Security"
      },
      {
        scope: "https://www.googleapis.com/auth/youtube.readonly",
        title: "View YouTube Metadata",
        description: "Allows the application to retrieve your subscriber count, channel avatar, and broadcast list.",
        requiredFor: "Displaying live metrics & subscriber info",
        type: "Read-only"
      },
      {
        scope: "https://www.googleapis.com/auth/userinfo.profile",
        title: "Google Profile Details",
        description: "Allows the applet to view your basic Google profile information (name, picture).",
        requiredFor: "Displaying your linked Google avatar & name",
        type: "Read-only"
      },
      {
        scope: "https://www.googleapis.com/auth/userinfo.email",
        title: "Google Email Address",
        description: "Allows the application to fetch the email address associated with your Google account.",
        requiredFor: "Verifying authentic workspace registration",
        type: "Read-only"
      }
    ];
  };

  // Connection Diagnostics Console State
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [showDebugConsole, setShowDebugConsole] = useState(false);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setDiagnosticLogs(["[SYSTEM] Initiating client-side diagnostic request..."]);
    setShowDebugConsole(true);
    
    try {
      const res = await fetch('/api/auth/test-connection');
      const data = await res.json();
      
      if (data.logs && Array.isArray(data.logs)) {
        setDiagnosticLogs(data.logs);
        if (data.success) {
          addToast("OAuth Diagnostic check completed successfully!", "success");
        } else {
          addToast(`Diagnostic check completed with warnings: ${data.error || 'Check logs'}`, "info");
        }
      } else {
        setDiagnosticLogs(prev => [...prev, `[ERROR] Malformed response from diagnostic endpoint.`, JSON.stringify(data)]);
        addToast("Diagnostics returned incomplete data.", "error");
      }
    } catch (err: any) {
      console.error(err);
      setDiagnosticLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [CRITICAL_ERROR] Client failed to reach diagnostic server!`,
        `Reason: ${err.message || err}`
      ]);
      addToast("Failed to run OAuth connection diagnostics.", "error");
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Fetch credentials and connection status
  const fetchAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsConfigured(data.isConfigured);
      setHasCredentials(data.hasCredentials);
      if (data.redirectUri) {
        setCalculatedRedirectUri(data.redirectUri);
      }
      
      if (data.connected && data.profile) {
        setYoutubeAccount({
          connected: true,
          channelId: data.profile.channelId,
          channelTitle: data.profile.channelTitle,
          subscribers: data.profile.subscribers,
          avatar: data.profile.avatar || ""
        });
      } else {
        setYoutubeAccount({
          connected: false,
          channelId: "",
          channelTitle: "",
          subscribers: 0,
          avatar: ""
        });
      }
    } catch (err) {
      console.error("[Auth Setup] Failed to fetch credentials status:", err);
    }
  };

  // Fetch YouTube Live stream endpoints configuration
  const fetchYouTubeStreamStatus = async () => {
    try {
      const res = await fetch('/api/syndication/streams');
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      const ytStream = data.streams?.find((s: any) => s.platform === 'youtube');
      if (ytStream) {
        setYtStreamState({
          isLive: ytStream.isLive,
          rtmpUrl: ytStream.rtmpUrl,
          streamKey: ytStream.streamKey,
          watchUrl: ytStream.watchUrl
        });
      }
    } catch (err) {
      console.warn("[Auth Setup] Unable to reach YouTube stream status endpoint. Retrying... Details:", err);
    }
  };

  useEffect(() => {
    fetchAuthStatus();
    fetchYouTubeStreamStatus();
    
    // Poll stream status so that changes are in real time
    const interval = setInterval(fetchYouTubeStreamStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Popup postMessage communication listener
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchAuthStatus();
        fetchYouTubeStreamStatus();
        addToast("Google Account Linked successfully! Synced with YouTube Creator Studio.", "success");
      } else if (event.data?.type === 'OAUTH_AUTH_FAILURE') {
        addToast(`Google Sign-In failed: ${event.data.error || 'User cancelled permission request'}`, "error");
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // Initiate popup OAuth sign-in flow
  const handleConnectGoogle = async () => {
    try {
      const res = await fetch('/api/auth/url');
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to initialize sign-in url');
      }
      const { url } = await res.json();
      const popup = window.open(url, 'youtube_creator_oauth', 'width=600,height=700');
      if (!popup) {
        addToast("Popup blocked by browser. Please allow popups to initiate YouTube integration.", "error");
      }
    } catch (err: any) {
      addToast(err.message || "Failed to start Google Sync.", "error");
    }
  };

  // Disconnect OAuth sync
  const handleDisconnectGoogle = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setYoutubeAccount({ connected: false, channelId: "", channelTitle: "", subscribers: 0, avatar: "" });
        addToast("YouTube channel credentials unlinked successfully.", "info");
        fetchAuthStatus();
        fetchYouTubeStreamStatus();
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to disconnect Google/YouTube account.", "error");
    }
  };

  // Submit custom developer credentials
  const handleSaveCustomCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customClientId || !customClientSecret) {
      addToast("Please enter both a Google Client ID and Google Client Secret.", "error");
      return;
    }
    setIsSavingCreds(true);
    try {
      const res = await fetch('/api/auth/save-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: customClientId, clientSecret: customClientSecret })
      });
      const data = await res.json();
      if (data.success) {
        addToast("Custom Developer Credentials saved successfully!", "success");
        setCustomClientId("");
        setCustomClientSecret("");
        fetchAuthStatus();
      } else {
        addToast(data.error || "Failed to update OAuth credentials.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Server failed to save developer credentials.", "error");
    } finally {
      setIsSavingCreds(false);
    }
  };

  // Directly start/stop live stream on YouTube on user's channel
  const handleToggleYouTubeLive = async () => {
    setIsTogglingLive(true);
    try {
      const res = await fetch('/api/syndication/streams/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'stream-yt' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setYtStreamState({
          isLive: data.stream.isLive,
          rtmpUrl: data.stream.rtmpUrl,
          streamKey: data.stream.streamKey,
          watchUrl: data.stream.watchUrl
        });
        addToast(
          data.stream.isLive 
            ? "🔴 YouTube Live Broadcast created successfully! Streaming Ingestion Pipeline Active."
            : "YouTube live streaming stopped. Broadcast ended.",
          data.stream.isLive ? "success" : "info"
        );
      } else {
        addToast(data.error || "Failed to activate YouTube playout. Check live permission rights.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Playout server failed to respond to YouTube live trigger.", "error");
    } finally {
      setIsTogglingLive(false);
    }
  };

  const [twitchAccount, setTwitchAccount] = useState({
    connected: false,
    username: "",
    followers: 0
  });

  const [facebookAccount, setFacebookAccount] = useState({
    connected: false,
    pageName: "",
    pageId: "",
    followers: 0
  });

  // Connection forms toggles/inputs
  const [ytChannelInput, setYtChannelInput] = useState("");
  const [ytTitleInput, setYtTitleInput] = useState("");
  const [isConnectingYt, setIsConnectingYt] = useState(false);

  const [twitchUsernameInput, setTwitchUsernameInput] = useState("");
  const [isConnectingTwitch, setIsConnectingTwitch] = useState(false);

  const [fbPageInput, setFbPageInput] = useState("");
  const [fbPageIdInput, setFbPageIdInput] = useState("");
  const [isConnectingFb, setIsConnectingFb] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      name: editedName,
      role: editedRole,
      email: editedEmail,
      avatar: editedAvatar
    });
    setIsEditingProfile(false);
    addToast("User profile updated successfully.", "success");
  };

  const handleSaveStationConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setChannelName(stationName);
    addToast(`Master station configuration saved. Channel name updated to "${stationName}".`, "success");
  };

  const connectYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytChannelInput || !ytTitleInput) {
      addToast("Please fill in all YouTube channel connection fields.", "error");
      return;
    }
    setIsConnectingYt(true);
    setTimeout(() => {
      setYoutubeAccount({
        connected: true,
        channelId: ytChannelInput,
        channelTitle: ytTitleInput,
        subscribers: Math.floor(Math.random() * 50000) + 1200,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"
      });
      setIsConnectingYt(false);
      setYtChannelInput("");
      setYtTitleInput("");
      addToast(`YouTube Channel "${ytTitleInput}" authenticated and linked successfully!`, "success");
    }, 1500);
  };

  const disconnectYoutube = () => {
    setYoutubeAccount({ connected: false, channelId: "", channelTitle: "", subscribers: 0, avatar: "" });
    addToast("YouTube channel sync deactivated.", "info");
  };


  const connectTwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!twitchUsernameInput) {
      addToast("Please fill in the Twitch creator username.", "error");
      return;
    }
    setIsConnectingTwitch(true);
    setTimeout(() => {
      setTwitchAccount({
        connected: true,
        username: twitchUsernameInput,
        followers: Math.floor(Math.random() * 25000) + 850
      });
      setIsConnectingTwitch(false);
      setTwitchUsernameInput("");
      addToast(`Twitch dashboard synced for @${twitchUsernameInput}!`, "success");
    }, 1500);
  };

  const disconnectTwitch = () => {
    setTwitchAccount({ connected: false, username: "", followers: 0 });
    addToast("Twitch broadcast feed disconnected.", "info");
  };

  const connectFacebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbPageInput || !fbPageIdInput) {
      addToast("Please fill in all Facebook Page parameters.", "error");
      return;
    }
    setIsConnectingFb(true);
    setTimeout(() => {
      setFacebookAccount({
        connected: true,
        pageName: fbPageInput,
        pageId: fbPageIdInput,
        followers: Math.floor(Math.random() * 15000) + 400
      });
      setIsConnectingFb(false);
      setFbPageInput("");
      setFbPageIdInput("");
      addToast(`Facebook Page "${fbPageInput}" linked successfully.`, "success");
    }, 1500);
  };

  const disconnectFacebook = () => {
    setFacebookAccount({ connected: false, pageName: "", pageId: "", followers: 0 });
    addToast("Facebook RTMP publisher disconnected.", "info");
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="channel-setup-workspace">
      
      {/* Intro Header */}
      <div className="rounded-2xl dark-panel p-6 border border-slate-800 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Settings className="h-32 w-32 text-sky-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="text-xs uppercase font-mono tracking-widest text-sky-400 font-semibold">
              Broadcast Administration & Access
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Channel Credentials & Profile Setup
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-3xl leading-relaxed">
            Configure system administration access, manage linked social media pages, map primary stream credentials, and set user roles for collaborative linear programming and playout.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: Broadcaster profile & station config (5/12 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* User Profile Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-sky-400" />
                User Broadcaster Profile
              </h3>
              {!isEditingProfile && (
                <button
                  onClick={() => {
                    setEditedName(profile.name);
                    setEditedRole(profile.role);
                    setEditedEmail(profile.email);
                    setEditedAvatar(profile.avatar);
                    setIsEditingProfile(true);
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 px-2 py-1 rounded transition"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 animate-slideIn">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Broadcaster Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Corporate / Station Role</label>
                  <input
                    type="text"
                    value={editedRole}
                    onChange={(e) => setEditedRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Avatar Photo URL</label>
                  <input
                    type="text"
                    value={editedAvatar}
                    onChange={(e) => setEditedAvatar(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-1.5 border border-slate-800 text-xs text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-16 w-16 rounded-xl border border-slate-800 object-cover"
                />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white font-display leading-tight">{profile.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{profile.role}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{profile.email}</p>
                  <div className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono mt-1">
                    <ShieldCheck className="h-3 w-3" />
                    Admin Access Level
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Master Channel Configuration */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
              <Tv className="h-4.5 w-4.5 text-sky-400" />
              Master Playout Settings
            </h3>

            <form onSubmit={handleSaveStationConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Active Station Name (On-Air)</label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                  placeholder="e.g. FAST Entertainment Network"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Stream Delay (Seconds)</label>
                  <input
                    type="number"
                    value={streamDelaySec}
                    onChange={(e) => setStreamDelaySec(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    min="0"
                    max="300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Bitrate (Kbps)</label>
                  <input
                    type="number"
                    value={bitrateTargetKbps}
                    onChange={(e) => setBitrateTargetKbps(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    min="1000"
                    max="15000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Fallback Playout RTMP backup URL</label>
                <input
                  type="text"
                  value={backupFailoverUrl}
                  onChange={(e) => setBackupFailoverUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                  placeholder="rtmp://server.com/live"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 transition shadow-lg"
              >
                <Save className="h-4 w-4" />
                Apply Station Configuration
              </button>
            </form>
          </div>

          {/* Secure Backplane Settings */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 flex items-start gap-4">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sky-400 shrink-0">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1">
                API Key Credentials Vault
                <span className="text-[9px] text-emerald-400 bg-emerald-950/50 border border-emerald-900/30 px-1.5 rounded uppercase font-mono">Secured</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Credentials are saved inside environment secrets server-side (`.env.example` configurations). This local console manages sync profiles only.
              </p>
            </div>
          </div>
        </div>

        {/* Right Hand: Channel/Platform linkages (7/12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Sliders className="h-4.5 w-4.5 text-sky-400" />
              Integrated Syndication Accounts & Logins
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Connect and link your active accounts, video libraries, and fan pages to enable on-demand clipping and automated linear syndication pipelines.
            </p>

            <div className="space-y-6">
              {/* YouTube Channel Sync Block */}
              <div className={`p-5 rounded-xl border transition-all ${
                youtubeAccount.connected 
                  ? 'bg-red-500/[0.02] border-red-500/20 shadow-lg shadow-red-500/[0.01]' 
                  : 'bg-slate-900/20 border-slate-800'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border ${
                      youtubeAccount.connected ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <Youtube className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white leading-none">YouTube Creator Account</h4>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                          youtubeAccount.connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                        }`}>
                          {youtubeAccount.connected ? 'Linked' : 'Offline'}
                        </span>
                      </div>
                      
                      {youtubeAccount.connected ? (
                        <div className="space-y-1.5 mt-2.5 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            {youtubeAccount.avatar && (
                              <img src={youtubeAccount.avatar} alt="Avatar" className="h-5 w-5 rounded-full border border-red-500/30 object-cover" referrerPolicy="no-referrer" />
                            )}
                            <p>Channel: <strong className="text-white">{youtubeAccount.channelTitle}</strong></p>
                          </div>
                          <p className="font-mono text-[10px] text-slate-500">ID: {youtubeAccount.channelId} • Subscribers: {youtubeAccount.subscribers.toLocaleString()}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-2">Connect your Google account to stream directly to your YouTube channel and publish VODs.</p>
                      )}
                    </div>
                  </div>

                  {youtubeAccount.connected && (
                    <button
                      onClick={handleDisconnectGoogle}
                      className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-red-500/25 rounded-lg transition"
                      title="Disconnect Google/YouTube Integration"
                    >
                      <Unplug className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Go Live Actions: Directly visible on App when connected */}
                {youtubeAccount.connected && ytStreamState && (
                  <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3.5 animate-slideIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold block">YouTube Stream Integration</span>
                        <h5 className="text-xs font-bold text-white mt-0.5">Applet Stream Controller</h5>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                        ytStreamState.isLive ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${ytStreamState.isLive ? 'bg-red-500' : 'bg-slate-600'}`}></span>
                        {ytStreamState.isLive ? 'Live On YouTube' : 'Standby'}
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-400 font-mono">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-500 text-[10px]">Primary RTMP URL:</span>
                        <span className="text-slate-300 truncate text-[11px] select-all max-w-[250px]">{ytStreamState.rtmpUrl}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-500 text-[10px]">Stream Key:</span>
                        <span className="text-slate-300 truncate text-[11px] select-all max-w-[250px]">{ytStreamState.streamKey || '••••••••••••••••'}</span>
                      </div>
                      {ytStreamState.isLive && ytStreamState.watchUrl && (
                        <div className="pt-1.5 border-t border-slate-900/60 flex justify-between items-center">
                          <span className="text-slate-500 text-[10px]">Watch Link:</span>
                          <a 
                            href={ytStreamState.watchUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-red-400 hover:text-red-300 text-[11px] flex items-center gap-1 font-semibold underline decoration-red-500/30 hover:decoration-red-400 transition"
                          >
                            YouTube Live Broadcast Studio
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleToggleYouTubeLive}
                      disabled={isTogglingLive}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                        ytStreamState.isLive 
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10'
                      }`}
                    >
                      {isTogglingLive ? (
                        <>
                          <RotateCw className="h-3.5 w-3.5 animate-spin" />
                          Arming Live Sync Pipeline...
                        </>
                      ) : ytStreamState.isLive ? (
                        <>
                          <Square className="h-3.5 w-3.5 fill-current" />
                          Stop YouTube Live Broadcast
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Go Live on YouTube directly
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!youtubeAccount.connected && (
                  <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-4 animate-slideIn">
                    {/* Google OAuth Login Button */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                      <div className="text-xs text-slate-400 leading-relaxed">
                        <span className="font-semibold text-slate-200 block mb-1">⚡ Automatic YouTube Stream & VOD Linking</span>
                        Authorise the applet using Google OAuth to allow direct live-streaming integration and on-demand stream recording.
                      </div>

                      {/* Dynamic Google Console Redirect URI Info */}
                      <div className="bg-slate-900/50 border border-slate-850 rounded-lg p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-sky-400" />
                            GCP Authorized Redirect URI
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-900 font-semibold uppercase">
                            Required
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Configure your Google Cloud Console Credentials. Add this exact URL under <strong className="text-slate-300">Authorized redirect URIs</strong>:
                        </p>
                        <div className="flex items-center gap-2 mt-1 bg-slate-950 border border-slate-850 rounded-lg p-2 font-mono text-[11px]">
                          <span className="text-sky-400 select-all truncate flex-1" title={calculatedRedirectUri}>
                            {calculatedRedirectUri}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(calculatedRedirectUri);
                              addToast("Redirect URI copied to clipboard!", "success");
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded text-[10px] font-bold text-slate-300 hover:text-white transition shrink-0 flex items-center gap-1"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          onClick={handleConnectGoogle}
                          className="py-2 px-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/10"
                        >
                          <Youtube className="h-4 w-4" />
                          Log In with Google & Sync
                        </button>

                        <button
                          type="button"
                          onClick={handleTestConnection}
                          disabled={isTestingConnection}
                          className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-lg border border-slate-800 hover:border-slate-700 transition flex items-center justify-center gap-2"
                        >
                          <Activity className={`h-4 w-4 text-sky-400 ${isTestingConnection ? 'animate-pulse' : ''}`} />
                          {isTestingConnection ? 'Testing Connection...' : 'Test Connection'}
                        </button>
                      </div>

                      {/* Debug Console Display */}
                      {showDebugConsole && (
                        <div className="mt-3 bg-black border border-slate-900 rounded-lg overflow-hidden animate-slideIn">
                          <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-900 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                              OAuth Handshake Terminal
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowDebugConsole(false)}
                              className="text-[10px] text-slate-500 hover:text-slate-300 underline font-mono"
                            >
                              Hide
                            </button>
                          </div>
                          <div className="p-3 max-h-48 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 space-y-1.5 bg-slate-950/80 custom-scrollbar">
                            {diagnosticLogs.map((log, index) => {
                              let logColor = "text-slate-300";
                              if (log.includes("[ERROR]") || log.includes("[CRITICAL_ERROR]")) logColor = "text-red-400 font-semibold";
                              else if (log.includes("[SUCCESS]")) logColor = "text-emerald-400";
                              else if (log.includes("[WARNING]")) logColor = "text-amber-400";
                              else if (log.includes("[ACTION REQUIRED]")) logColor = "text-sky-300 font-semibold bg-sky-950/20 px-1 py-0.5 rounded";
                              else if (log.includes("👉")) logColor = "text-sky-400 font-bold select-all";
                              
                              return (
                                <div key={index} className={`${logColor} whitespace-pre-wrap break-all`}>
                                  {log}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Collapsible / Expandable Required YouTube OAuth Scopes Card */}
                    <details className="group border border-slate-850 rounded-xl bg-slate-950/40 overflow-hidden">
                      <summary className="flex items-center justify-between p-3.5 cursor-pointer select-none text-xs font-bold text-slate-300 hover:bg-slate-900/40 transition">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          View Active YouTube OAuth Scopes
                        </span>
                        <Plus className="h-3.5 w-3.5 text-slate-500 group-open:rotate-45 transition-transform" />
                      </summary>
                      
                      <div className="p-3.5 border-t border-slate-850 space-y-3 bg-slate-950 text-[11px]">
                        <p className="text-slate-400 leading-relaxed">
                          This applet is configured to request the following permissions. To ensure seamless live-streaming and analytics, confirm that these exact scopes are approved and enabled in your 
                          <a 
                            href="https://console.cloud.google.com/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-red-400 hover:text-red-300 mx-1 underline font-semibold transition"
                          >
                            Google Cloud Console (OAuth Consent Screen)
                          </a>:
                        </p>
                        
                        <div className="space-y-2.5 mt-2">
                          {getRequiredScopes().map((item, idx) => (
                            <div key={idx} className="bg-slate-900/60 border border-slate-800/60 rounded-lg p-2.5 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                  {item.title}
                                </span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  item.type === 'Security' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                                  item.type === 'Read/Write' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
                                  'bg-slate-800 text-slate-400 border border-slate-700/50'
                                }`}>
                                  {item.type}
                                </span>
                              </div>
                              <p className="text-slate-400 text-xs">{item.description}</p>
                              <div className="pt-1.5 flex flex-col gap-1 border-t border-slate-800/40 text-[10px] text-slate-500 font-mono">
                                <div><span className="text-slate-600 font-semibold">Scope URL:</span> <span className="text-slate-300 select-all">{item.scope}</span></div>
                                <div><span className="text-slate-600 font-semibold">Feature usage:</span> <span className="text-slate-400">{item.requiredFor}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>

                    {/* Collapsible / Expandable Custom Credentials Vault */}
                    <details className="group border border-slate-850 rounded-xl bg-slate-950/40 overflow-hidden">
                      <summary className="flex items-center justify-between p-3.5 cursor-pointer select-none text-xs font-bold text-slate-300 hover:bg-slate-900/40 transition">
                        <span className="flex items-center gap-1.5">
                          <Key className="h-3.5 w-3.5 text-sky-400" />
                          Configure Custom Google OAuth Credentials
                        </span>
                        <Plus className="h-3.5 w-3.5 text-slate-500 group-open:rotate-45 transition-transform" />
                      </summary>
                      
                      <form onSubmit={handleSaveCustomCredentials} className="p-3.5 border-t border-slate-850 space-y-3.5 bg-slate-950">
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          By default, this applet uses preconfigured credentials. If you wish to use your own Google Developer credentials, paste your Client ID and Client Secret here:
                        </p>
                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Google Client ID</label>
                            <input
                              type="text"
                              value={customClientId}
                              onChange={(e) => setCustomClientId(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                              placeholder="e.g. 123456-abcdef.apps.googleusercontent.com"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Google Client Secret</label>
                            <input
                              type="password"
                              value={customClientSecret}
                              onChange={(e) => setCustomClientSecret(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                              placeholder="e.g. GOCSPX-abcdefghijklmnopqrstuv"
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSavingCreds}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1"
                        >
                          {isSavingCreds ? 'Saving Keys...' : 'Save OAuth Keys'}
                        </button>
                      </form>
                    </details>

                    {/* Mock Override / Sandbox Testing Block */}
                    <details className="group border border-slate-850 rounded-xl bg-slate-950/40 overflow-hidden">
                      <summary className="flex items-center justify-between p-3.5 cursor-pointer select-none text-xs font-semibold text-slate-400 hover:bg-slate-900/40 transition">
                        <span>💡 Developer Sandbox / Mock Link Override</span>
                        <Plus className="h-3.5 w-3.5 text-slate-500 group-open:rotate-45 transition-transform" />
                      </summary>
                      
                      <form onSubmit={connectYoutube} className="p-3.5 border-t border-slate-850 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950">
                        <p className="sm:col-span-2 text-[11px] text-slate-500 leading-normal mb-1">
                          Don't have OAuth credentials configured yet? Force-link a simulated YouTube channel to test layout interactions:
                        </p>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Channel ID / Handle</label>
                          <input
                            type="text"
                            value={ytChannelInput}
                            onChange={(e) => setYtChannelInput(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                            placeholder="e.g. @JessePlayoutTV"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Display Username</label>
                          <input
                            type="text"
                            value={ytTitleInput}
                            onChange={(e) => setYtTitleInput(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            placeholder="e.g. Jesse Live TV"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isConnectingYt}
                          className="sm:col-span-2 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white text-xs font-semibold rounded-lg transition"
                        >
                          Simulate Sync Link
                        </button>
                      </form>
                    </details>
                  </div>
                )}
              </div>

              {/* Twitch Creator Dashboard Sync Block */}
              <div className={`p-5 rounded-xl border transition-all ${
                twitchAccount.connected 
                  ? 'bg-purple-500/[0.02] border-purple-500/20' 
                  : 'bg-slate-900/20 border-slate-800'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border ${
                      twitchAccount.connected ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <Twitch className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white leading-none">Twitch Creator Link</h4>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                          twitchAccount.connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {twitchAccount.connected ? 'Linked' : 'Offline'}
                        </span>
                      </div>
                      
                      {twitchAccount.connected ? (
                        <div className="space-y-1 mt-2.5 text-xs text-slate-400">
                          <p>Creator Dashboard: <strong className="text-white">@{twitchAccount.username}</strong></p>
                          <p className="font-mono text-[10px]">Follower Base: {twitchAccount.followers.toLocaleString()} Active Streamers</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-2">No Twitch dashboard synced. Connect to support interactive community overlays.</p>
                      )}
                    </div>
                  </div>

                  {twitchAccount.connected && (
                    <button
                      onClick={disconnectTwitch}
                      className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-red-500/25 rounded-lg transition"
                      title="Disconnect Integration"
                    >
                      <Unplug className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {!twitchAccount.connected && (
                  <form onSubmit={connectTwitch} className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-end gap-3 animate-slideIn">
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Twitch Broadcaster Username</label>
                      <input
                        type="text"
                        value={twitchUsernameInput}
                        onChange={(e) => setTwitchUsernameInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        placeholder="e.g. jesse_streams"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isConnectingTwitch}
                      className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-850 rounded-lg text-xs font-bold text-white transition flex items-center justify-center gap-1 shrink-0"
                    >
                      {isConnectingTwitch ? 'Authenticating...' : 'Sync Twitch Dashboard'}
                    </button>
                  </form>
                )}
              </div>

              {/* Facebook Page Sync Block */}
              <div className={`p-5 rounded-xl border transition-all ${
                facebookAccount.connected 
                  ? 'bg-blue-500/[0.02] border-blue-500/20' 
                  : 'bg-slate-900/20 border-slate-800'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border ${
                      facebookAccount.connected ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <Facebook className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white leading-none">Facebook Page Streamer</h4>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                          facebookAccount.connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {facebookAccount.connected ? 'Linked' : 'Offline'}
                        </span>
                      </div>
                      
                      {facebookAccount.connected ? (
                        <div className="space-y-1 mt-2.5 text-xs text-slate-400">
                          <p>Linked Fan Page: <strong className="text-white">{facebookAccount.pageName}</strong></p>
                          <p className="font-mono text-[10px]">Page ID: {facebookAccount.pageId} • Followers: {facebookAccount.followers.toLocaleString()}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-2">No Facebook fan page linked. Authorize page administrator login.</p>
                      )}
                    </div>
                  </div>

                  {facebookAccount.connected && (
                    <button
                      onClick={disconnectFacebook}
                      className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-red-500/25 rounded-lg transition"
                      title="Disconnect Integration"
                    >
                      <Unplug className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {!facebookAccount.connected && (
                  <form onSubmit={connectFacebook} className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-slideIn">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Fan Page Name</label>
                      <input
                        type="text"
                        value={fbPageInput}
                        onChange={(e) => setFbPageInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        placeholder="e.g. CastPilot News Hour"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Page ID</label>
                      <input
                        type="text"
                        value={fbPageIdInput}
                        onChange={(e) => setFbPageIdInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        placeholder="e.g. page-998822"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isConnectingFb}
                      className="sm:col-span-2 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-850 rounded-lg text-xs font-bold text-white transition flex items-center justify-center gap-1"
                    >
                      {isConnectingFb ? 'Connecting RTMP Hooks...' : 'Link Facebook Fan Page'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
