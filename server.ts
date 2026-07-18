import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { ContentAsset, ScheduleItem, ResourceAsset, ConflictAlert, AdPerformance, LiveStreamDestination, PublishedVod } from "./src/types";

dotenv.config();

const app = express();
app.set("trust proxy", true);
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Fallback mock data will be used.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini client successfully initialized.");
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
    }
  }
  return aiClient;
}

// ==========================================
// IN-MEMORY STORAGE (PERSISTENT PER SESSION)
// ==========================================

let mamAssets: ContentAsset[] = [
  {
    id: "asset-1",
    title: "Global Horizon News Hour",
    type: "program" as const,
    duration: 60,
    category: "News & Documentary",
    tags: ["live", "news", "international", "politics"],
    isQCed: true,
    safetyRating: "G",
    loudnessDb: -23.8, // compliant
    optimalSlot: "Early Morning (08:00 AM - 09:00 AM) or Late Evening",
    adMarkers: ["00:15:00", "00:30:00", "00:45:00"],
    description: "Daily broadcast covering world breaking news, financial markets, and global geopolitical reports."
  },
  {
    id: "asset-2",
    title: "Beyond the Peak: Alpine Summit",
    type: "program" as const,
    duration: 30,
    category: "Sports & Travel",
    tags: ["outdoors", "skiing", "extreme", "cinematic"],
    isQCed: true,
    safetyRating: "PG",
    loudnessDb: -24.2, // compliant
    optimalSlot: "Afternoon Block (02:00 PM - 05:00 PM)",
    adMarkers: ["00:10:00", "00:20:00"],
    description: "An immersive exploration of extreme skiing and mountaineering in the high Swiss Alps."
  },
  {
    id: "asset-3",
    title: "EcoQuest: Deep Ocean Depths",
    type: "program" as const,
    duration: 30,
    category: "Science & Nature",
    tags: ["nature", "ocean", "submarine", "educational"],
    isQCed: false, // Needs QC check
    safetyRating: "G",
    loudnessDb: -19.5, // Fails EBU R128 (-24 LUFS threshold)
    optimalSlot: "Prime Early Evening (06:00 PM)",
    adMarkers: ["00:12:00", "00:24:00"],
    description: "Uncovering the unexplored marine life ecosystems and volcanic vents in the Mariana Trench."
  },
  {
    id: "asset-4",
    title: "SodaSpark Refreshment commercial",
    type: "commercial" as const,
    duration: 2,
    category: "Advertising",
    tags: ["commercial", "beverage", "fast-paced"],
    isQCed: true,
    safetyRating: "G",
    loudnessDb: -24.0,
    optimalSlot: "High Audience Ad-Breaks",
    adMarkers: [],
    description: "High-energy commercial featuring bubbly summer soft drink refreshments."
  },
  {
    id: "asset-5",
    title: "Cyberpunk 2088 Promo",
    type: "promo" as const,
    duration: 3,
    category: "Entertainment Promo",
    tags: ["scifi", "gaming", "neon", "teaser"],
    isQCed: true,
    safetyRating: "PG-13",
    loudnessDb: -23.5,
    optimalSlot: "Late Night Primetime Ad-Breaks",
    adMarkers: [],
    description: "Hype trailer promo for the upcoming sci-fi anthology drama series premiering on Saturday."
  }
];

let schedules: ScheduleItem[] = [
  // Channel 1: FAST Entertainment
  {
    id: "sch-1",
    channelName: "FAST Entertainment",
    startTime: "08:00 AM",
    title: "Global Horizon News Hour",
    type: "program" as const,
    duration: 60,
    status: "completed" as const,
    demandScore: 78,
    targetAudience: "Demographic 25-54, high-earners",
    aiRationale: "Placed in early morning slot to capture commuter and early-riser live news traffic."
  },
  {
    id: "sch-2",
    channelName: "FAST Entertainment",
    startTime: "09:00 AM",
    title: "SodaSpark Refreshment commercial",
    type: "commercial" as const,
    duration: 2,
    status: "completed" as const,
    demandScore: 92,
    targetAudience: "General demographic, wide reach",
    aiRationale: "Ad break immediately following highly rated morning news block."
  },
  {
    id: "sch-3",
    channelName: "FAST Entertainment",
    startTime: "09:02 AM",
    title: "Beyond the Peak: Alpine Summit",
    type: "program" as const,
    duration: 30,
    status: "playing" as const, // Currently playing
    demandScore: 84,
    targetAudience: "Sports fans, active lifestyle seekers",
    aiRationale: "Follow-up lifestyle programming to retain morning lead-in viewership."
  },
  {
    id: "sch-4",
    channelName: "FAST Entertainment",
    startTime: "09:32 AM",
    title: "Cyberpunk 2088 Promo",
    type: "promo" as const,
    duration: 3,
    status: "queued" as const,
    demandScore: 89,
    targetAudience: "Young adults 18-34, sci-fi enthusiasts",
    aiRationale: "High impact teaser inserted to retain audiences and cross-promote the prime-time slot."
  },
  {
    id: "sch-5",
    channelName: "FAST Entertainment",
    startTime: "09:35 AM",
    title: "EcoQuest: Deep Ocean Depths",
    type: "program" as const,
    duration: 30,
    status: "queued" as const,
    demandScore: 70,
    targetAudience: "Family-friendly, nature/science buffs",
    aiRationale: "Fills the post-morning lifestyle slot with educational family content."
  },

  // Channel 2: Linear Primetime
  {
    id: "sch-6",
    channelName: "Linear Primetime",
    startTime: "08:00 PM",
    title: "Interstellar Horizon Live",
    type: "program" as const,
    duration: 60,
    status: "queued" as const,
    demandScore: 96,
    targetAudience: "General primetime TV viewers, 18-49",
    aiRationale: "High impact sci-fi drama placed directly at start of primetime hours."
  },
  {
    id: "sch-7",
    channelName: "Linear Primetime",
    startTime: "09:00 PM",
    title: "Elite Talent Chat Show",
    type: "program" as const,
    duration: 60,
    status: "queued" as const,
    demandScore: 91,
    targetAudience: "Pop culture fans, celebrity news enthusiasts",
    aiRationale: "Capitalizes on strong drama lead-in to transition into celebrity and talk show focus."
  }
];

let resources: ResourceAsset[] = [
  {
    id: "res-1",
    name: "Studio Alpha (4K Virtual Set)",
    type: "studio" as const,
    status: "booked" as const,
    allocationDetails: "Live production set for 'Global Horizon News Hour'",
    currentBooking: "Global Horizon News Hour"
  },
  {
    id: "res-2",
    name: "RED V-Raptor 8K Camera Kit A",
    type: "camera" as const,
    status: "booked" as const,
    allocationDetails: "Outdoors extreme shoot for Alpine Summit",
    currentBooking: "Beyond the Peak: Alpine Summit"
  },
  {
    id: "res-3",
    name: "Studio Beta (Foley & Dubbing Stage)",
    type: "studio" as const,
    status: "active" as const,
    allocationDetails: "Available for mixing and audio recording.",
    currentBooking: ""
  },
  {
    id: "res-4",
    name: "ARRI Alexa Mini LF Cinema Package",
    type: "camera" as const,
    status: "maintenance" as const,
    allocationDetails: "Bi-weekly sensor recalibration and firmware update.",
    currentBooking: ""
  },
  {
    id: "res-5",
    name: "Sarah Jenkins (Elite Prime-Time Host)",
    type: "talent" as const,
    status: "booked" as const,
    allocationDetails: "Hosting 'Elite Talent Chat Show' in Studio Alpha",
    currentBooking: "Elite Talent Chat Show"
  },
  {
    id: "res-6",
    name: "David Atten-style Voice Actor",
    type: "talent" as const,
    status: "active" as const,
    allocationDetails: "Available for nature documentary narration.",
    currentBooking: ""
  }
];

let alerts: ConflictAlert[] = [
  {
    id: "alert-1",
    severity: "high" as const,
    type: "resource" as const,
    title: "Double-Booking Bottleneck",
    description: "Studio Alpha is booked for both 'Global Horizon News Hour' live broadcast and 'Elite Talent Chat Show' rehearsals between 04:00 PM and 06:00 PM.",
    recommendation: "Shift Chat Show rehearsals to Virtual Studio Beta or defer News Hour pre-taped blocks.",
    resolved: false
  },
  {
    id: "alert-2",
    severity: "medium" as const,
    type: "schedule" as const,
    title: "Loudness Violation: EcoQuest",
    description: "Asset 'EcoQuest: Deep Ocean Depths' audio peak checks failed with -19.5 LUFS, violating the -24.0 LUFS EBU R128 broadcasting regulation standard.",
    recommendation: "Apply automated limiter compress-normalize batch script to lower the master output gain.",
    resolved: false
  }
];

let liveStreams: LiveStreamDestination[] = [
  {
    id: "stream-yt",
    platform: "youtube",
    name: "YouTube Live - Main Entertainment Feed",
    rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
    streamKey: "abcd-efgh-ijkl-mnop-1234",
    isLive: true,
    bitrateKbps: 6200,
    fps: 60,
    resolution: "1080p (60fps)",
    health: "excellent"
  },
  {
    id: "stream-twitch",
    platform: "twitch",
    name: "Twitch.tv - CastPilot FAST Lounge",
    rtmpUrl: "rtmp://ord.contribute.live-video.net/app",
    streamKey: "live_776182390_zYxWvUtSrQpOnMlKj",
    isLive: false,
    bitrateKbps: 0,
    fps: 0,
    resolution: "1080p",
    health: "offline"
  },
  {
    id: "stream-fb",
    platform: "facebook",
    name: "Facebook Live - Corporate Broadcasters",
    rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp",
    streamKey: "FB-1234567890-abcdefg",
    isLive: false,
    bitrateKbps: 0,
    fps: 0,
    resolution: "720p",
    health: "offline"
  },
  {
    id: "stream-website",
    platform: "website" as any,
    name: "Direct Website Embed (HLS Feed)",
    rtmpUrl: "https://edge-hls.castpilot.live/live/stream.m3u8",
    streamKey: "CP-WEB-7739-EMBED-TOKEN",
    isLive: true,
    bitrateKbps: 4500,
    fps: 60,
    resolution: "1080p (60fps)",
    health: "excellent"
  },
  {
    id: "stream-ott",
    platform: "website" as any,
    name: "OTT Distribution (Roku, AppleTV, FireTV)",
    rtmpUrl: "rtmp://ott.castpilot.live/feed/ott-syndicate",
    streamKey: "CP-OTT-MASTER-882-CJS",
    isLive: false,
    bitrateKbps: 0,
    fps: 0,
    resolution: "1080p",
    health: "offline"
  },
  {
    id: "stream-multicast",
    platform: "twitch" as any,
    name: "Multi-Cast Multiplexer (30+ Social Channels)",
    rtmpUrl: "rtmp://multi.castpilot.live/multiplex/syndicate-all",
    streamKey: "CP-MULTI-30-X-TIKTOK-TROVO",
    isLive: false,
    bitrateKbps: 0,
    fps: 0,
    resolution: "1080p",
    health: "offline"
  }
];

let publishedVods: PublishedVod[] = [
  {
    id: "vod-1",
    title: "Global Horizon News Hour - Episode 42",
    duration: 60,
    category: "News & Documentary",
    platform: "youtube",
    privacy: "public",
    publishedAt: "2026-07-14T10:30:00.000Z",
    url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    views: 1420,
    status: "published"
  },
  {
    id: "vod-2",
    title: "EcoQuest: Reef Rescue Special",
    duration: 30,
    category: "Science & Nature",
    platform: "vimeo",
    privacy: "unlisted",
    publishedAt: "2026-07-15T08:15:00.000Z",
    url: "https://vimeo.com/81726354",
    views: 89,
    status: "published"
  }
];

// ==========================================
// GOOGLE / YOUTUBE OAUTH PERSISTENCE STATE
// ==========================================

let googleOAuthToken: {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // timestamp in ms
} | null = null;

let youtubeChannelProfile: {
  connected: boolean;
  channelId: string;
  channelTitle: string;
  avatar: string;
  subscribers: number;
} | null = null;

// Allow custom credentials input in case platform secrets are missing or they use custom developer projects
let customGoogleClientId: string | null = null;
let customGoogleClientSecret: string | null = null;

// Helper: refresh access token if needed using refresh_token
async function ensureValidAccessToken(): Promise<string | null> {
  if (!googleOAuthToken) return null;

  // If token is expired or expiring in 60 seconds, refresh it
  if (Date.now() > googleOAuthToken.expiresAt - 60000) {
    if (!googleOAuthToken.refreshToken) {
      console.warn("[OAuth Engine] Access token is expiring/expired, but no refresh token is cached.");
      return googleOAuthToken.accessToken;
    }

    const clientId = customGoogleClientId || process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
    const clientSecret = customGoogleClientSecret || process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("[OAuth Engine] Cannot refresh token: missing client_id or client_secret.");
      return googleOAuthToken.accessToken;
    }

    try {
      console.log("[OAuth Engine] Refreshing expired access token...");
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: googleOAuthToken.refreshToken,
          grant_type: "refresh_token"
        }).toString()
      });

      if (!response.ok) {
        throw new Error(`Token refresh request failed with status ${response.status}`);
      }

      const data = await response.json();
      googleOAuthToken.accessToken = data.access_token;
      googleOAuthToken.expiresAt = Date.now() + (data.expires_in * 1000);
      if (data.refresh_token) {
        googleOAuthToken.refreshToken = data.refresh_token;
      }
      console.log("[OAuth Engine] Access token successfully refreshed.");
    } catch (err) {
      console.error("[OAuth Engine] Error refreshing Google Access Token:", err);
    }
  }

  return googleOAuthToken.accessToken;
}

// Helper: fetch Google YouTube channel statistics and details
async function refreshYouTubeProfile() {
  if (!googleOAuthToken) return;

  try {
    const response = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true", {
      headers: {
        Authorization: `Bearer ${googleOAuthToken.accessToken}`
      }
    });

    if (!response.ok) {
      const errTxt = await response.text();
      console.error("[YouTube API] Failed to fetch channel profile details:", errTxt);
      return;
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      youtubeChannelProfile = {
        connected: true,
        channelId: item.id,
        channelTitle: item.snippet.title,
        avatar: item.snippet.thumbnails?.default?.url || item.snippet.thumbnails?.medium?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
        subscribers: parseInt(item.statistics?.subscriberCount || "0", 10)
      };

      // Sync master stream configuration name and details to the connected YouTube channel
      const ytIndex = liveStreams.findIndex(s => s.platform === "youtube");
      if (ytIndex !== -1) {
        liveStreams[ytIndex].name = `YouTube Live - ${youtubeChannelProfile.channelTitle}`;
        liveStreams[ytIndex].rtmpUrl = "rtmp://a.rtmp.youtube.com/live2";
        liveStreams[ytIndex].health = "good";
      }
      console.log(`[YouTube API] Sync completed for channel "${youtubeChannelProfile.channelTitle}" (${youtubeChannelProfile.channelId})`);
    } else {
      console.warn("[YouTube API] No YouTube channel profile was found for authorized Google account.");
    }
  } catch (err) {
    console.error("[YouTube API] Error fetching YouTube channel info:", err);
  }
}

// Helper: Dynamically create a real YouTube live stream and live broadcast
async function createYouTubeLiveBroadcast() {
  const token = await ensureValidAccessToken();
  if (!token) {
    throw new Error("Google / YouTube authorization credentials missing. Please log in first.");
  }

  console.log("[YouTube API] Creating brand new Live Broadcast...");
  
  // 1. Create a Live Broadcast resource
  const broadcastResponse = await fetch("https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      snippet: {
        title: `CastPilot Playout Broadcast - ${new Date().toLocaleDateString()}`,
        description: "Automated real-time broadcast syndicated via CastPilot.",
        scheduledStartTime: new Date(Date.now() + 5000).toISOString() // schedule starting in 5 seconds
      },
      status: {
        privacyStatus: "unlisted", // unlisted for safety & playout preview
        selfDeclaredCreativeCommons: false
      },
      contentDetails: {
        enableAutoStart: true,
        enableAutoEnd: true
      }
    })
  });

  if (!broadcastResponse.ok) {
    const errorText = await broadcastResponse.text();
    throw new Error(`YouTube Live Broadcast creation failed: ${errorText}`);
  }

  const broadcastData = await broadcastResponse.json();
  const broadcastId = broadcastData.id;
  console.log(`[YouTube API] Live Broadcast created with ID: ${broadcastId}`);

  // 2. Create an ingestion Live Stream resource (RTMP endpoints)
  const streamResponse = await fetch("https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      snippet: {
        title: `CastPilot Playout Stream - Ingestion ${Date.now()}`
      },
      cdn: {
        frameRate: "60fps",
        ingestionType: "rtmp",
        resolution: "1080p"
      }
    })
  });

  if (!streamResponse.ok) {
    const errorText = await streamResponse.text();
    throw new Error(`YouTube Live Stream creation failed: ${errorText}`);
  }

  const streamData = await streamResponse.json();
  const streamId = streamData.id;
  const rtmpUrl = streamData.cdn.ingestionInfo.rtmpServerUrl;
  const streamKey = streamData.cdn.ingestionInfo.streamName;
  console.log(`[YouTube API] Live Stream ingestion pipeline established with ID: ${streamId}`);

  // 3. Bind Live Broadcast to Live Stream ingestion endpoint
  const bindResponse = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${broadcastId}&part=id,contentDetails&streamId=${streamId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!bindResponse.ok) {
    const errorText = await bindResponse.text();
    throw new Error(`YouTube Live Broadcast bind failed: ${errorText}`);
  }

  console.log(`[YouTube API] Successfully bound broadcast to RTMP stream key. Stream is ARMED.`);
  
  return {
    broadcastId,
    streamId,
    rtmpUrl,
    streamKey,
    watchUrl: `https://www.youtube.com/watch?v=${broadcastId}`
  };
}

// ==========================================
// API ENDPOINTS
// ==========================================

// --- Google & YouTube OAuth API ---

// Fetch current logged-in Google / YouTube channel profile status
app.get("/api/auth/status", (req, res) => {
  const isConfigured = !!(customGoogleClientId || process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID);
  const host = req.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? req.protocol : "https";
  const redirectUri = process.env.APP_URL 
    ? `${process.env.APP_URL.replace(/\/$/, "")}/auth/callback` 
    : `${protocol}://${host}/auth/callback`;

  res.json({
    connected: youtubeChannelProfile ? youtubeChannelProfile.connected : false,
    profile: youtubeChannelProfile,
    isConfigured,
    hasCredentials: !!(customGoogleClientId || process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID),
    redirectUri
  });
});

// Generate dynamic Google Sign-In URL
app.get("/api/auth/url", (req, res) => {
  const host = req.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? req.protocol : "https";
  const redirectUri = process.env.APP_URL 
    ? `${process.env.APP_URL.replace(/\/$/, "")}/auth/callback` 
    : `${protocol}://${host}/auth/callback`;

  const clientId = customGoogleClientId || process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;

  if (!clientId) {
    return res.status(400).json({ 
      error: "Google OAuth Client ID is not configured on the server. Please define CLIENT_ID in the secrets panel or enter custom credentials below." 
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.force-ssl",
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ].join(" "),
    access_type: "offline",
    prompt: "consent"
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl });
});

// Logout Google / YouTube account sync
app.post("/api/auth/logout", (req, res) => {
  googleOAuthToken = null;
  youtubeChannelProfile = null;

  // Restore mock default for stream
  const ytIndex = liveStreams.findIndex(s => s.platform === "youtube");
  if (ytIndex !== -1) {
    liveStreams[ytIndex].name = "YouTube Live - Main Entertainment Feed";
    liveStreams[ytIndex].rtmpUrl = "rtmp://a.rtmp.youtube.com/live2";
    liveStreams[ytIndex].streamKey = "abcd-efgh-ijkl-mnop-1234";
    liveStreams[ytIndex].health = "offline";
  }

  res.json({ success: true, message: "Successfully logged out from YouTube sync console." });
});

// Save Custom Google Credentials manually from front-end
app.post("/api/auth/save-credentials", (req, res) => {
  const { clientId, clientSecret } = req.body;
  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: "Missing Client ID or Client Secret" });
  }

  customGoogleClientId = clientId;
  customGoogleClientSecret = clientSecret;
  res.json({ success: true, message: "Custom developer OAuth credentials saved securely in server-side memory!" });
});

// Diagnostic & Simulated OAuth Handshake Connection test
app.get("/api/auth/test-connection", async (req, res) => {
  const host = req.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? req.protocol : "https";
  const redirectUri = process.env.APP_URL 
    ? `${process.env.APP_URL.replace(/\/$/, "")}/auth/callback` 
    : `${protocol}://${host}/auth/callback`;

  const clientId = customGoogleClientId || process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = customGoogleClientSecret || process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;

  const logs: string[] = [];
  logs.push(`[${new Date().toLocaleTimeString()}] [DIAGNOSTIC] Starting OAuth Handshake Validation...`);
  
  // Step 1: Check Client ID existence
  if (!clientId) {
    logs.push(`[${new Date().toLocaleTimeString()}] [ERROR] Google Client ID is MISSING on the server! Please configure it in the Custom credentials box or as an env variable.`);
    return res.json({ success: false, logs, error: "Missing Client ID" });
  } else {
    logs.push(`[${new Date().toLocaleTimeString()}] [SUCCESS] Google Client ID loaded: "${clientId.substring(0, 15)}...${clientId.substring(clientId.length - 8)}"`);
  }

  // Step 2: Validate Client ID Format
  const isFormatValid = clientId.endsWith(".apps.googleusercontent.com");
  if (!isFormatValid) {
    logs.push(`[${new Date().toLocaleTimeString()}] [WARNING] Your Google Client ID does not end with ".apps.googleusercontent.com". Standard Google Client IDs must have this suffix. Please double-check for typos or copy-paste truncation.`);
  } else {
    logs.push(`[${new Date().toLocaleTimeString()}] [SUCCESS] Client ID format structure is valid (.apps.googleusercontent.com)`);
  }

  // Step 3: Check Client Secret
  if (!clientSecret) {
    logs.push(`[${new Date().toLocaleTimeString()}] [WARNING] Google Client Secret is MISSING! Although the login screen may render, exchanging the authorization code for access tokens will fail with a 401.`);
  } else {
    const hiddenSecret = clientSecret.substring(0, 4) + "••••••••" + clientSecret.substring(clientSecret.length - 4);
    logs.push(`[${new Date().toLocaleTimeString()}] [SUCCESS] Google Client Secret loaded: "${hiddenSecret}"`);
  }

  // Step 4: Validate Redirect URI
  logs.push(`[${new Date().toLocaleTimeString()}] [INFO] Active Applet Hostname: "${host}"`);
  logs.push(`[${new Date().toLocaleTimeString()}] [INFO] Protocol: "${protocol}"`);
  logs.push(`[${new Date().toLocaleTimeString()}] [SUCCESS] Calculated Redirect URI: "${redirectUri}"`);
  logs.push(`[${new Date().toLocaleTimeString()}] [ACTION REQUIRED] Please verify that this EXACT URL is added under 'Authorized redirect URIs' in your Google Cloud Console Credentials page:`);
  logs.push(`             👉   ${redirectUri}`);

  // Step 5: Test Outbound Connectivity to Google Identity Servers
  try {
    logs.push(`[${new Date().toLocaleTimeString()}] [INFO] Probing connectivity to accounts.google.com...`);
    const discoveryResponse = await fetch("https://accounts.google.com/.well-known/openid-configuration");
    if (discoveryResponse.ok) {
      logs.push(`[${new Date().toLocaleTimeString()}] [SUCCESS] Successfully communicated with Google Identity Discovery API. Network route is open and healthy!`);
    } else {
      logs.push(`[${new Date().toLocaleTimeString()}] [WARNING] Google Discovery Endpoint returned HTTP status ${discoveryResponse.status}. Outbound connectivity may be throttled.`);
    }
  } catch (err: any) {
    logs.push(`[${new Date().toLocaleTimeString()}] [ERROR] Outbound connection to Google Identity APIs failed: ${err.message || err}`);
  }

  // Step 6: Simulate standard response params for Google Auth initialization
  logs.push(`[${new Date().toLocaleTimeString()}] [INFO] Generating Mock Sign-in Handshake Request Payload...`);
  logs.push(`             👉 Scope: youtube, youtube.force-ssl, youtube.readonly, userinfo.profile, userinfo.email`);
  logs.push(`             👉 Response Type: code`);
  logs.push(`             👉 Access Type: offline (for refresh tokens)`);
  logs.push(`             👉 Prompt: consent`);

  logs.push(`[${new Date().toLocaleTimeString()}] [SUCCESS] Diagnostic test complete! No immediate server-side obstacles found. If you see redirect_uri_mismatch on sign-in, double-check your Google Cloud Console Redirect URI matches the Calculated Redirect URI exactly.`);

  res.json({
    success: true,
    clientId,
    redirectUri,
    isFormatValid,
    hasClientSecret: !!clientSecret,
    logs
  });
});

// Google OAuth redirect callback endpoint (handles code exchange & popups)
app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.send(`
      <html>
        <body style="background:#0b0f19;color:#f1f5f9;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;max-width:400px;padding:24px;background:#1e1b4b;border:1px solid #ef4444;border-radius:12px;">
            <h2 style="color:#ef4444;margin-top:0;">Access Denied</h2>
            <p style="font-size:14px;color:#cbd5e1;">Google returned authentication error: ${error}</p>
            <button onclick="window.close()" style="margin-top:16px;background:#ef4444;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:bold;">Close Window</button>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', error: "${error}" }, '*');
            }
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send("Authorization code is missing.");
  }

  const host = req.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? req.protocol : "https";
  const redirectUri = process.env.APP_URL 
    ? `${process.env.APP_URL.replace(/\/$/, "")}/auth/callback` 
    : `${protocol}://${host}/auth/callback`;

  const clientId = customGoogleClientId || process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
  const clientSecret = customGoogleClientSecret || process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("[OAuth Engine] Token exchange request failed:", errText);
      throw new Error(`Token exchange failed: ${errText}`);
    }

    const tokens = await tokenResponse.json();
    googleOAuthToken = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000)
    };

    // Pull channel profile info
    await refreshYouTubeProfile();

    res.send(`
      <html>
        <body style="background:#0b0f19;color:#f1f5f9;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;max-width:400px;padding:24px;background:#0f172a;border:1px solid #0ea5e9;border-radius:12px;box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
            <h2 style="color:#0ea5e9;margin-top:0;">Linked Successfully!</h2>
            <p style="font-size:14px;color:#cbd5e1;">YouTube Creator Account linked to CastPilot playout console.</p>
            <p style="font-size:11px;color:#64748b;">Closing window and updating dashboard panels...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              setTimeout(() => { window.close(); }, 1200);
            } else {
              window.location.href = '/?auth=success';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("[OAuth Engine] Auth callback exception:", err);
    res.status(500).send(`
      <html>
        <body style="background:#0b0f19;color:#ef4444;font-family:sans-serif;padding:30px;">
          <h2>Authentication Error</h2>
          <p style="color:#cbd5e1;">${err.message}</p>
          <button onclick="window.close()" style="background:#475569;color:white;border:none;padding:10px 18px;border-radius:6px;cursor:pointer;">Close Window</button>
        </body>
      </html>
    `);
  }
});

// --- Schedules API ---

// Get current schedules
app.get("/api/schedule", (req, res) => {
  res.json({ schedules });
});

// Update / Sync schedules
app.post("/api/schedule/update", (req, res) => {
  const { schedules: newSchedules } = req.body;
  if (Array.isArray(newSchedules)) {
    schedules = newSchedules;
    return res.json({ success: true, schedules });
  }
  res.status(400).json({ error: "Schedules must be an array" });
});

// Generate AI Schedule using Gemini
app.post("/api/schedule/generate", async (req, res) => {
  const { channelName, targetDate, customInstruction, durationBlocks } = req.body;
  const blocks = durationBlocks || 6; // default to 6 half-hour blocks (3 hours)
  
  const instruction = customInstruction || "Create a balanced broadcast schedule with exciting programs, commercial spots, and promotions.";
  
  const client = getGeminiClient();
  
  if (!client) {
    // Return high-fidelity simulated response if no API key is provided
    console.log("No Gemini API key. Generating high-quality mock schedule.");
    const mockCreated = [];
    const baseHour = 10; // Start at 10:00 AM
    for (let i = 0; i < blocks; i++) {
      const isAd = i % 3 === 1;
      const isPromo = i % 3 === 2;
      let title = "";
      let type: "program" | "commercial" | "promo" | "filler" = "program";
      let duration = 30;
      let score = 80 + Math.floor(Math.random() * 20);
      let audience = "General Adult 18-49";
      let rationale = "";

      if (isAd) {
        title = mamAssets.find(a => a.type === "commercial")?.title || "Premium Commercial Break";
        type = "commercial";
        duration = 2;
        rationale = "Strategic high-FILL ad-break placement.";
      } else if (isPromo) {
        title = mamAssets.find(a => a.type === "promo")?.title || "Upcoming Show Teaser";
        type = "promo";
        duration = 3;
        rationale = "Cross-promotion highlight segment.";
      } else {
        const progAssets = mamAssets.filter(a => a.type === "program");
        const idx = Math.floor(Math.random() * progAssets.length);
        title = progAssets[idx].title;
        type = "program";
        duration = progAssets[idx].duration;
        rationale = `Optimized slot placement for ${progAssets[idx].category} to maximize target demographic engagement.`;
        audience = progAssets[idx].optimalSlot;
      }

      const minute = (i * 30) % 60;
      const hour = baseHour + Math.floor((i * 30) / 60);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      const timeStr = `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;

      mockCreated.push({
        id: `sch-gen-${Date.now()}-${i}`,
        channelName,
        startTime: timeStr,
        title,
        type,
        duration,
        status: "queued" as const,
        demandScore: score,
        targetAudience: audience,
        aiRationale: rationale + " (Simulated Engine)"
      });
    }

    // Append generated items to our in-memory storage
    schedules = [...schedules.filter(s => s.channelName !== channelName), ...mockCreated];
    return res.json({ success: true, schedules: mockCreated, source: "mock-engine" });
  }

  try {
    const prompt = `
      You are CastPilot AI, an elite automated broadcast scheduling intelligence system.
      Generate a professional, detailed broadcast schedule for the channel "${channelName}" for date/time context: "${targetDate || "Today"}".
      Instruction to satisfy: "${instruction}".
      Generate exactly ${blocks} schedule sequence blocks.
      Ensure you include:
      - 3-4 principal programs (duration: 30 or 60 minutes)
      - 1-2 ad-break commercial inserts (duration: 2 minutes)
      - 1 promo teaser insert (duration: 3 minutes)

      The output MUST be a valid JSON array matching the following schema EXACTLY. Do not output anything other than a valid raw JSON array (no markdown code fences, no extra text):
      [
        {
          "startTime": "HH:MM AM/PM",
          "title": "Title of the show/commercial/promo",
          "type": "program" or "commercial" or "promo" or "filler",
          "duration": number (duration in minutes),
          "demandScore": number (0-100 rating indicating calculated viewer demand),
          "targetAudience": "specific audience demographics",
          "aiRationale": "1-sentence tactical explanation of why this block was scheduled here"
        }
      ]

      Use these asset titles when possible or invent highly matching creative ones:
      - "Global Horizon News Hour" (program)
      - "Beyond the Peak: Alpine Summit" (program)
      - "EcoQuest: Deep Ocean Depths" (program)
      - "SodaSpark Refreshment commercial" (commercial)
      - "Cyberpunk 2088 Promo" (promo)
      - "Midnight Noir Anthology" (program)
      - "Neon Rhythm: Cyber Beats Live" (program)
    `;

    console.log("Calling Gemini API for schedule generation...");
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const responseText = response.text || "[]";
    const parsed = JSON.parse(responseText.trim());

    // Convert items into official schedule format
    const generatedItems = parsed.map((item: any, idx: number) => ({
      id: `sch-gen-${Date.now()}-${idx}`,
      channelName,
      startTime: item.startTime,
      title: item.title,
      type: item.type as 'program' | 'commercial' | 'promo' | 'filler',
      duration: item.duration,
      status: "queued" as const,
      demandScore: item.demandScore || 85,
      targetAudience: item.targetAudience || "Adults 18-49",
      aiRationale: item.aiRationale || "AI optimized slot allocation."
    }));

    // Update in-memory storage: clear existing items for this channel, insert new ones
    schedules = [...schedules.filter(s => s.channelName !== channelName), ...generatedItems];

    res.json({ success: true, schedules: generatedItems, source: "gemini-api" });
  } catch (error: any) {
    console.error("Gemini schedule generation error:", error);
    res.status(500).json({ error: "Failed to generate schedule with AI", message: error.message });
  }
});


// --- MAM (Media Asset Management) API ---

// Get all assets
app.get("/api/mam/assets", (req, res) => {
  res.json({ assets: mamAssets });
});

// Create/Upload a new asset
app.post("/api/mam/assets", (req, res) => {
  const { title, type, duration, category, description } = req.body;
  if (!title || !type || !duration) {
    return res.status(400).json({ error: "Missing required fields: title, type, duration" });
  }

  const newAsset = {
    id: `asset-${Date.now()}`,
    title,
    type: type as 'program' | 'commercial' | 'promo' | 'filler',
    duration: Number(duration),
    category: category || "Uncategorized",
    tags: ["pending-enrichment"],
    isQCed: false,
    safetyRating: "TBD",
    loudnessDb: -24.0, // default compliant
    optimalSlot: "TBD - run enrichment",
    adMarkers: [],
    description: description || ""
  };

  mamAssets.unshift(newAsset);
  res.status(201).json({ success: true, asset: newAsset });
});

// Update/Edit an existing asset's metadata
app.put("/api/mam/assets/:id", (req, res) => {
  const { id } = req.params;
  const { title, type, duration, category, description, isQCed, safetyRating, loudnessDb, optimalSlot, tags, adMarkers } = req.body;
  
  const assetIndex = mamAssets.findIndex(a => a.id === id);
  if (assetIndex === -1) {
    return res.status(404).json({ error: "Asset not found" });
  }

  const existingAsset = mamAssets[assetIndex];
  const updatedAsset = {
    ...existingAsset,
    title: title !== undefined ? title : existingAsset.title,
    type: type !== undefined ? (type as any) : existingAsset.type,
    duration: duration !== undefined ? Number(duration) : existingAsset.duration,
    category: category !== undefined ? category : existingAsset.category,
    description: description !== undefined ? description : existingAsset.description,
    isQCed: isQCed !== undefined ? Boolean(isQCed) : existingAsset.isQCed,
    safetyRating: safetyRating !== undefined ? safetyRating : existingAsset.safetyRating,
    loudnessDb: loudnessDb !== undefined ? Number(loudnessDb) : existingAsset.loudnessDb,
    optimalSlot: optimalSlot !== undefined ? optimalSlot : existingAsset.optimalSlot,
    tags: tags !== undefined ? tags : existingAsset.tags,
    adMarkers: adMarkers !== undefined ? adMarkers : existingAsset.adMarkers,
  };

  mamAssets[assetIndex] = updatedAsset;
  res.json({ success: true, asset: updatedAsset });
});

// Delete an asset from MAM Vault
app.delete("/api/mam/assets/:id", (req, res) => {
  const { id } = req.params;
  const assetIndex = mamAssets.findIndex(a => a.id === id);
  if (assetIndex === -1) {
    return res.status(404).json({ error: "Asset not found" });
  }

  const deletedAsset = mamAssets[assetIndex];
  mamAssets.splice(assetIndex, 1);
  res.json({ success: true, message: `Asset "${deletedAsset.title}" deleted successfully`, id });
});

// Enrich asset with Gemini AI
app.post("/api/mam/enrich", async (req, res) => {
  const { assetId } = req.body;
  const assetIndex = mamAssets.findIndex(a => a.id === assetId);
  if (assetIndex === -1) {
    return res.status(404).json({ error: "Asset not found" });
  }

  const asset = mamAssets[assetIndex];
  const client = getGeminiClient();

  if (!client) {
    // Simulated enrichment
    console.log("No Gemini API key. Running simulated AI enrichment.");
    const simulatedEnriched = {
      ...asset,
      tags: ["ai-enriched", "cinematic", "curated", asset.category.toLowerCase().replace(/[^a-z]/g, "")],
      isQCed: true,
      safetyRating: asset.type === "program" ? "PG" : "G",
      loudnessDb: parseFloat((-24.0 + (Math.random() - 0.5) * 0.8).toFixed(1)),
      optimalSlot: "Late Afternoon Block (04:30 PM - 06:00 PM)",
      adMarkers: asset.duration >= 30 ? ["00:10:00", "00:20:00"] : [],
      description: asset.description || "Beautifully composed studio grade asset with high dynamic colors and spatial audio mastered."
    };
    mamAssets[assetIndex] = simulatedEnriched;
    return res.json({ success: true, asset: simulatedEnriched, source: "mock-engine" });
  }

  try {
    const prompt = `
      You are CastPilot AI, a sophisticated Media Asset Management (MAM) analyzer.
      Enrich and analyze the metadata for this broadcast asset:
      - Title: "${asset.title}"
      - Type: "${asset.type}"
      - Duration: ${asset.duration} minutes
      - Category: "${asset.category}"
      - Input Description: "${asset.description || "No description provided."}"

      Analyze this asset's properties and generate:
      1. A professional enriched description (2-3 sentences).
      2. 4 relevant keyword tags.
      3. An appropriate TV/ad safety rating (G, PG, PG-13, R).
      4. A simulated average audio loudness level in dB (should ideally be around -24.0 dB according to EBU R128, but occasionally fluctuate).
      5. The optimal broadcast time slot or program block.
      6. Suggested ad insertion cue points (as an array of string timestamps, e.g. ["00:15:00"] if duration is 30m, none if under 10m).

      Return output strictly as a JSON object matching this schema. Do not output anything else:
      {
        "description": "...",
        "tags": ["tag1", "tag2", "tag3", "tag4"],
        "safetyRating": "...",
        "loudnessDb": -24.0,
        "optimalSlot": "...",
        "adMarkers": ["00:10:00"]
      }
    `;

    console.log(`Enriching asset ${asset.title} with Gemini...`);
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      }
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText.trim());

    const enriched = {
      ...asset,
      description: data.description || asset.description,
      tags: data.tags || ["enriched"],
      safetyRating: data.safetyRating || "G",
      loudnessDb: typeof data.loudnessDb === "number" ? data.loudnessDb : -24.0,
      optimalSlot: data.optimalSlot || "General rotation",
      adMarkers: data.adMarkers || [],
      isQCed: true
    };

    // If loudness Db is louder than -20, auto-flag an alert!
    if (enriched.loudnessDb > -21.0) {
      alerts.push({
        id: `alert-${Date.now()}`,
        severity: "medium",
        type: "schedule",
        title: `Loudness Warning: ${enriched.title}`,
        description: `Enriched asset audio level is ${enriched.loudnessDb} dB, exceeding the safe EBU R128 limit of -24 LUFS.`,
        recommendation: "Normalize master audio gain on the scheduling block.",
        resolved: false
      });
    }

    mamAssets[assetIndex] = enriched;
    res.json({ success: true, asset: enriched, source: "gemini-api" });
  } catch (error: any) {
    console.error("Gemini asset enrichment error:", error);
    res.status(500).json({ error: "Failed to enrich asset with AI", message: error.message });
  }
});


// --- Resource and Booking API ---

// Get all resources
app.get("/api/resources", (req, res) => {
  res.json({ resources });
});

// Book a resource
app.post("/api/resources/book", (req, res) => {
  const { resourceId, bookingTitle, details } = req.body;
  const resourceIndex = resources.findIndex(r => r.id === resourceId);
  if (resourceIndex === -1) {
    return res.status(404).json({ error: "Resource not found" });
  }

  const resource = resources[resourceIndex];
  
  // Check if already booked
  if (resource.status === "booked") {
    // Generate an overbooking alert!
    const alertId = `alert-${Date.now()}`;
    alerts.push({
      id: alertId,
      severity: "high",
      type: "resource",
      title: "Automated Resource Conflict",
      description: `Double-booking detected on ${resource.name}. Booked for both '${resource.currentBooking}' and '${bookingTitle}'.`,
      recommendation: "Re-route secondary allocation to available alternatives or reschedule.",
      resolved: false
    });

    return res.json({ 
      success: false, 
      message: `Conflict triggered! ${resource.name} is already booked.`,
      conflictAlertId: alertId 
    });
  }

  resources[resourceIndex] = {
    ...resource,
    status: "booked" as const,
    currentBooking: bookingTitle,
    allocationDetails: details || `Allocated for ${bookingTitle}`
  };

  res.json({ success: true, resource: resources[resourceIndex] });
});

// Release / Free a resource
app.post("/api/resources/release", (req, res) => {
  const { resourceId } = req.body;
  const resourceIndex = resources.findIndex(r => r.id === resourceId);
  if (resourceIndex === -1) {
    return res.status(404).json({ error: "Resource not found" });
  }

  resources[resourceIndex] = {
    ...resources[resourceIndex],
    status: "active" as const,
    currentBooking: "",
    allocationDetails: "Available for allocation."
  };

  res.json({ success: true, resource: resources[resourceIndex] });
});


// --- Conflicts & Alerts API ---

// Get alerts
app.get("/api/conflicts", (req, res) => {
  res.json({ alerts });
});

// Resolve alert
app.post("/api/conflicts/resolve", (req, res) => {
  const { alertId } = req.body;
  const alertIndex = alerts.findIndex(a => a.id === alertId);
  if (alertIndex === -1) {
    return res.status(404).json({ error: "Alert not found" });
  }

  alerts[alertIndex].resolved = true;
  // Remove or mark resolved
  res.json({ success: true, alert: alerts[alertIndex] });
});

// Clear resolved alerts
app.post("/api/conflicts/clear-resolved", (req, res) => {
  alerts = alerts.filter(a => !a.resolved);
  res.json({ success: true, alerts });
});


// ==========================================
// --- SCTE-35 Splicer & Ad Injection API ---
// ==========================================

let scteAdState = {
  adTriggered: false,
  scteStatus: "Idle / Monitoring",
  preRollEnabled: true,
  midRollEnabled: true,
  postRollEnabled: false,
  preRollDuration: 30, // seconds
  midRollDuration: 60, // seconds
  postRollDuration: 30, // seconds
  autoTrigger: true,
  targetingProfile: "programmatic", // "programmatic" | "direct-sold" | "hybrid"
  provider: "Google Ad Manager"
};

app.get("/api/scte/state", (req, res) => {
  res.json(scteAdState);
});

app.post("/api/scte/update-config", (req, res) => {
  scteAdState = { ...scteAdState, ...req.body };
  res.json({ success: true, state: scteAdState });
});

app.post("/api/scte/trigger-splice", (req, res) => {
  const { slotType } = req.body; // "pre-roll" | "mid-roll" | "post-roll" | "manual"
  const label = slotType ? slotType.toUpperCase() : "MANUAL";
  
  if (scteAdState.adTriggered) {
    return res.json({ success: false, message: "An ad break is already in progress.", state: scteAdState });
  }

  scteAdState.adTriggered = true;
  scteAdState.scteStatus = `SCTE-35 Splice Command Injected (${label})`;

  let duration = 30;
  if (slotType === "pre-roll") duration = scteAdState.preRollDuration;
  else if (slotType === "mid-roll") duration = scteAdState.midRollDuration;
  else if (slotType === "post-roll") duration = scteAdState.postRollDuration;

  alerts.unshift({
    id: `alert-scte-${Date.now()}`,
    severity: "medium",
    type: "schedule",
    title: `SCTE-35 Ad Cue Injected (${label})`,
    description: `A programmatic ad break of ${duration} seconds has been successfully injected into the stream payload. Splicer is executing ANSI/SCTE-35 standard command.`,
    recommendation: "Monitor downstream ad server response and programmatic RTB CPM values.",
    resolved: false
  });

  setTimeout(() => {
    scteAdState.scteStatus = `Ad Insert Active - Splice Segment Running (${duration}s)`;
  }, 1500);

  setTimeout(() => {
    scteAdState.adTriggered = false;
    scteAdState.scteStatus = "Idle / Monitoring";
  }, duration * 1000);

  res.json({ success: true, state: scteAdState });
});


// --- Monetization API ---

app.get("/api/monetization", (req, res) => {
  const data: AdPerformance[] = [
    { timeSlot: "08:00 AM - 10:00 AM", fillRate: 94.2, cpm: 18.50, revenue: 1250, adBreakMinutes: 8 },
    { timeSlot: "10:00 AM - 12:00 PM", fillRate: 88.5, cpm: 15.00, revenue: 840, adBreakMinutes: 6 },
    { timeSlot: "12:00 PM - 02:00 PM", fillRate: 91.0, cpm: 16.20, revenue: 1020, adBreakMinutes: 7 },
    { timeSlot: "02:00 PM - 04:00 PM", fillRate: 85.0, cpm: 14.50, revenue: 780, adBreakMinutes: 6 },
    { timeSlot: "04:00 PM - 06:00 PM", fillRate: 96.8, cpm: 22.00, revenue: 2150, adBreakMinutes: 10 },
    { timeSlot: "06:00 PM - 08:00 PM", fillRate: 99.1, cpm: 28.50, revenue: 3820, adBreakMinutes: 12 },
    { timeSlot: "08:00 PM - 10:00 PM", fillRate: 99.7, cpm: 32.00, revenue: 5120, adBreakMinutes: 12 },
    { timeSlot: "10:00 PM - 12:00 AM", fillRate: 95.4, cpm: 24.00, revenue: 2480, adBreakMinutes: 10 }
  ];
  res.json({ data });
});


// --- Syndication (Streaming & VOD) API ---

// Get all configured stream channels
app.get("/api/syndication/streams", (req, res) => {
  res.json({ streams: liveStreams });
});

// Toggle live streaming to a platform
app.post("/api/syndication/streams/toggle", async (req, res) => {
  const { id } = req.body;
  const streamIndex = liveStreams.findIndex(s => s.id === id);
  if (streamIndex === -1) {
    return res.status(404).json({ error: "Stream destination not found" });
  }

  const stream = liveStreams[streamIndex];
  const nextIsLive = !stream.isLive;

  // Real YouTube Live broadcast integration if connected
  if (stream.platform === "youtube" && nextIsLive) {
    const validToken = await ensureValidAccessToken();
    if (validToken) {
      try {
        console.log("[YouTube Live Engine] Initiating automated YouTube live broadcast resource...");
        const ytBroadcast = await createYouTubeLiveBroadcast();
        
        liveStreams[streamIndex] = {
          ...stream,
          isLive: true,
          name: youtubeChannelProfile ? `YouTube Live - ${youtubeChannelProfile.channelTitle}` : stream.name,
          rtmpUrl: ytBroadcast.rtmpUrl,
          streamKey: ytBroadcast.streamKey,
          watchUrl: ytBroadcast.watchUrl,
          bitrateKbps: 6000 + Math.floor(Math.random() * 800),
          fps: 60,
          health: "excellent"
        };

        return res.json({ 
          success: true, 
          stream: liveStreams[streamIndex],
          message: `🔴 Live Broadcast successfully initialized on your YouTube channel! Stream is now transmitting.`,
          watchUrl: ytBroadcast.watchUrl
        });
      } catch (err: any) {
        console.error("[YouTube Live Engine] Dynamic broadcast creation failed:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to initialize YouTube broadcast",
          message: err.message || "Please make sure your YouTube channel has live-streaming capability activated."
        });
      }
    } else {
      console.log("[YouTube Live Engine] No active Google account linked. Proceeding with simulated sandbox live feed.");
    }
  }

  liveStreams[streamIndex] = {
    ...stream,
    isLive: nextIsLive,
    bitrateKbps: nextIsLive ? 5500 + Math.floor(Math.random() * 1200) : 0,
    fps: nextIsLive ? 60 : 0,
    health: nextIsLive ? "excellent" : "offline"
  };

  res.json({ success: true, stream: liveStreams[streamIndex] });
});

// Update stream channel settings
app.post("/api/syndication/streams/update", (req, res) => {
  const { id, name, rtmpUrl, streamKey } = req.body;
  const streamIndex = liveStreams.findIndex(s => s.id === id);
  if (streamIndex === -1) {
    return res.status(404).json({ error: "Stream destination not found" });
  }

  liveStreams[streamIndex] = {
    ...liveStreams[streamIndex],
    name: name || liveStreams[streamIndex].name,
    rtmpUrl: rtmpUrl || liveStreams[streamIndex].rtmpUrl,
    streamKey: streamKey || liveStreams[streamIndex].streamKey
  };

  res.json({ success: true, stream: liveStreams[streamIndex] });
});

// Get all published VOD assets
app.get("/api/syndication/vods", (req, res) => {
  res.json({ vods: publishedVods });
});

// Upload post-scheduled show to a VOD platform
app.post("/api/syndication/vods/upload", (req, res) => {
  const { scheduleId, title, platform, privacy, category, duration } = req.body;
  
  if (!title || !platform) {
    return res.status(400).json({ error: "Missing title or platform for VOD syndication" });
  }

  // Create a new post-scheduled VOD entry
  const newVod: PublishedVod = {
    id: `vod-${Date.now()}`,
    scheduleId: scheduleId || undefined,
    title,
    duration: Number(duration) || 30,
    category: category || "General Entertainment",
    platform,
    privacy: privacy || "public",
    publishedAt: new Date().toISOString(),
    url: platform === "youtube" ? "https://youtube.com/watch?v=dQw4w9WgXcQ" :
         platform === "twitch" ? "https://twitch.tv/videos/129847123" :
         platform === "vimeo" ? "https://vimeo.com/98172344" :
         "https://archive.org/details/castpilot-broadcast",
    views: 0,
    status: "processing" // Let's set it as processing so the UI can show a cool progress animation!
  };

  publishedVods.unshift(newVod);

  // Simulate complete/published in 5 seconds
  setTimeout(() => {
    const vIndex = publishedVods.findIndex(v => v.id === newVod.id);
    if (vIndex !== -1) {
      publishedVods[vIndex].status = "published";
      publishedVods[vIndex].views = Math.floor(Math.random() * 15) + 1; // starts with a few views!
    }
  }, 5000);

  res.status(201).json({ success: true, vod: newVod });
});


// ==========================================
// --- Audience Overlays & Chat State ---
// ==========================================

let overlaySettings = {
  theme: "classic", // "classic" | "cyberpunk" | "warm" | "minimalist" | "retro"
  position: "bottom", // "top" | "bottom"
  tickerSpeed: "normal", // "slow" | "normal" | "fast"
  showChatBox: true,
  tickerVisible: true,
  tickerText: "🚨 BREAKING: Dynamic Linear Channel Launch powered by CastPilot Scheduling Engines • Stay Tuned for EcoQuest season premiere 🚨",
  activeAlert: null as any,
  pinnedMessageId: null as string | null,
  urgentAnnouncementActive: false,
  urgentAnnouncementText: "⚠️ ATTENTION VIEWERS: High-priority broadcast warning. Incoming playout segment changes scheduled shortly.",
  urgentAnnouncementStyle: "breaking_news" // "breaking_news" | "urgent_alert" | "technical_bulletin"
};

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

let chatLog: ChatMessage[] = [
  { id: 'c1', user: 'VibeRider', text: 'CastPilot is buffering beautifully! Excellent stream quality.', color: '#0ea5e9', badge: 'subscriber', timestamp: '12:00' },
  { id: 'c2', user: 'Emma_K', text: 'EcoQuest is literally the best nature series ever made. Look at those colors!', color: '#e11d48', badge: 'vip', timestamp: '12:01' },
  { id: 'c3', user: 'BroadcasterBot', text: 'Welcome to our Linear FAST Playout. Ask questions about scheduled segments below!', color: '#10b981', badge: 'mod', timestamp: '12:01' },
  { id: 'c4', user: 'SamS', text: 'Sent superchat! Loving the Retro block tonight', color: '#f59e0b', badge: 'subscriber', timestamp: '12:02', isSuperChat: true, superChatAmount: '$15.00' }
];

let livePoll = {
  id: 'p-1',
  question: "Which linear block should we extend during prime hour tonight?",
  options: [
    { text: "EcoQuest Amazon Expedition", votes: 142 },
    { text: "Late Night Neon Retro Hour", votes: 118 },
    { text: "Local Independent Creator Features", votes: 65 }
  ],
  isActive: true,
  totalVotes: 325
};

// Endpoints
app.get("/api/engagement/state", (req, res) => {
  res.json({
    settings: overlaySettings,
    poll: livePoll,
    chatLog
  });
});

app.post("/api/engagement/settings", (req, res) => {
  overlaySettings = { ...overlaySettings, ...req.body };
  res.json({ success: true, settings: overlaySettings });
});

app.post("/api/engagement/poll", (req, res) => {
  const { question, options, isActive } = req.body;
  if (question && options) {
    livePoll = {
      id: `p-${Date.now()}`,
      question,
      options: options.map((opt: string) => ({ text: opt, votes: 0 })),
      isActive: true,
      totalVotes: 0
    };
  } else if (typeof isActive !== 'undefined') {
    livePoll.isActive = isActive;
  }
  res.json({ success: true, poll: livePoll });
});

app.post("/api/engagement/poll/vote", (req, res) => {
  const { optionIndex } = req.body;
  if (livePoll.isActive && typeof optionIndex === 'number' && optionIndex >= 0 && optionIndex < livePoll.options.length) {
    livePoll.options[optionIndex].votes += 1;
    livePoll.totalVotes += 1;
  }
  res.json({ success: true, poll: livePoll });
});

app.post("/api/engagement/chat", (req, res) => {
  const { user, text, badge, color, isSuperChat, superChatAmount } = req.body;
  if (!user || !text) {
    return res.status(400).json({ error: "Missing user or text" });
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const newMessage: ChatMessage = {
    id: `c-${Date.now()}`,
    user,
    text,
    badge,
    color: color || "#38bdf8",
    timestamp: timeStr,
    isSuperChat: !!isSuperChat,
    superChatAmount
  };

  chatLog.push(newMessage);
  if (chatLog.length > 50) {
    chatLog.shift(); // Keep last 50
  }

  res.status(201).json({ success: true, message: newMessage, chatLog });
});

app.post("/api/engagement/chat/pin", (req, res) => {
  const { messageId } = req.body;
  overlaySettings.pinnedMessageId = messageId || null;
  res.json({ success: true, pinnedMessageId: overlaySettings.pinnedMessageId });
});

app.post("/api/engagement/chat/clear", (req, res) => {
  chatLog = [];
  overlaySettings.pinnedMessageId = null;
  res.json({ success: true, chatLog });
});

app.post("/api/engagement/alert", (req, res) => {
  const { alert } = req.body;
  overlaySettings.activeAlert = alert || null;
  res.json({ success: true, activeAlert: overlaySettings.activeAlert });
});

// ==========================================
// --- FCC Emergency Alert System (EAS) API ---
// ==========================================

let isEasActive = false;
let easAlertText = "🚨 FCC REGULATORY WARNING: SEVERE GEOMAGNETIC SOLAR FLUSH WATCH IN EFFECT FOR METROPOLITAN SECTORS. SENSITIVE ELECTRONICS STANDBY. SEEK PREPAREDNESS. 🚨";

app.get("/api/eas", (req, res) => {
  res.json({ active: isEasActive, text: easAlertText });
});

app.post("/api/eas/toggle", (req, res) => {
  const { active, text } = req.body;
  if (typeof active !== "undefined") {
    isEasActive = active;
  }
  if (text) {
    easAlertText = text;
  }

  // Inject or resolve FCC EAS Alarm
  if (isEasActive) {
    // Check if alarm already exists
    const exists = alerts.some(a => a.id === "alert-eas-fcc");
    if (!exists) {
      alerts.unshift({
        id: "alert-eas-fcc",
        severity: "high",
        type: "resource",
        title: "🚨 FCC Regulatory EAS Intercept 🚨",
        description: "Emergency Alert System has been triggered! Playout is forced-spliced to regulatory disaster warning feeds.",
        recommendation: "Standby for federal release authorization or manually disable the federal override signal in Dashboard Diagnostics.",
        resolved: false
      });
    }
  } else {
    // Resolve EAS alarms
    alerts = alerts.map(a => a.id === "alert-eas-fcc" ? { ...a, resolved: true } : a);
  }

  res.json({ success: true, active: isEasActive, text: easAlertText });
});


// ==========================================
// VITE SETUP & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static build serving from /dist folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CastPilot Engine] Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server startup failure:", err);
});
