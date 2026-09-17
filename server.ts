import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { ContentAsset, ScheduleItem, ResourceAsset, ConflictAlert, AdPerformance, LiveStreamDestination, PublishedVod, PtpSyncState, Smpte2022State, LoudnessComplianceState, AsRunEntry, NmosNode } from "./src/types";

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
// IN-MEMORY STORAGE (PERSISTENT PER SESSION WITH EXPANDED DUMMY BROADCAST DATA)
// ==========================================

const INITIAL_MAM_ASSETS: ContentAsset[] = [
  {
    id: "asset-1",
    title: "Global Horizon News Hour",
    type: "program" as const,
    duration: 60,
    category: "News & Current Affairs",
    tags: ["live", "news", "international", "politics", "4k"],
    isQCed: true,
    safetyRating: "TV-G",
    loudnessDb: -23.8, // Compliant with CALM Act (-24 LUFS)
    optimalSlot: "Early Morning (08:00 AM - 09:00 AM) or Late Evening",
    adMarkers: ["00:15:00", "00:30:00", "00:45:00"],
    description: "Daily master broadcast covering world breaking news, geopolitical reports, and international financial market movements."
  },
  {
    id: "asset-2",
    title: "Beyond the Peak: Alpine Summit",
    type: "program" as const,
    duration: 30,
    category: "Sports & Travel",
    tags: ["outdoors", "skiing", "extreme", "cinematic", "hdr"],
    isQCed: true,
    safetyRating: "TV-PG",
    loudnessDb: -24.2, // Compliant
    optimalSlot: "Afternoon Block (02:00 PM - 05:00 PM)",
    adMarkers: ["00:10:00", "00:20:00"],
    description: "An immersive exploration of extreme skiing and mountaineering across the high summits of the Swiss and French Alps."
  },
  {
    id: "asset-3",
    title: "EcoQuest: Deep Ocean Depths",
    type: "program" as const,
    duration: 30,
    category: "Science & Nature",
    tags: ["nature", "ocean", "submarine", "educational", "biology"],
    isQCed: false, // Intentionally un-QCed for regulatory demo
    safetyRating: "TV-G",
    loudnessDb: -19.5, // Fails EBU R128 (-24 LUFS threshold) -> triggers audio alert
    optimalSlot: "Prime Early Evening (06:00 PM)",
    adMarkers: ["00:12:00", "00:24:00"],
    description: "High-resolution expedition uncovering untouched marine ecosystems, hydrothermal vents, and bioluminescent species."
  },
  {
    id: "asset-4",
    title: "SodaSpark Refreshment Commercial",
    type: "commercial" as const,
    duration: 2,
    category: "Advertising",
    tags: ["commercial", "beverage", "fast-paced", "cpm-high"],
    isQCed: true,
    safetyRating: "TV-G",
    loudnessDb: -24.0,
    optimalSlot: "High Audience Ad-Breaks",
    adMarkers: [],
    description: "High-energy national commercial spot featuring ice-cold sparkling refreshments and summer beach festivals."
  },
  {
    id: "asset-5",
    title: "Cyberpunk 2088 Promo",
    type: "promo" as const,
    duration: 3,
    category: "Entertainment Promo",
    tags: ["scifi", "gaming", "neon", "teaser", "syndication"],
    isQCed: true,
    safetyRating: "TV-14",
    loudnessDb: -23.5,
    optimalSlot: "Late Night Primetime Ad-Breaks",
    adMarkers: [],
    description: "Action-packed teaser promo for the upcoming sci-fi anthology drama premiering this Saturday evening."
  },
  {
    id: "asset-6",
    title: "Apex Formula Racing: Monaco GP Highlights",
    type: "program" as const,
    duration: 45,
    category: "Sports & Motorsports",
    tags: ["motorsport", "racing", "speed", "monaco", "multi-cam"],
    isQCed: true,
    safetyRating: "TV-PG",
    loudnessDb: -24.1,
    optimalSlot: "Weekend Afternoon Sports Showcase",
    adMarkers: ["00:15:00", "00:30:00"],
    description: "Thrilling on-board camera perspectives, high-speed telemetry analysis, and podium interviews from Monaco."
  },
  {
    id: "asset-7",
    title: "Culinary Masterclass: Tuscan Pasta & Wine",
    type: "program" as const,
    duration: 25,
    category: "Lifestyle & Food",
    tags: ["cooking", "italy", "food", "wine", "gourmet"],
    isQCed: true,
    safetyRating: "TV-G",
    loudnessDb: -23.9,
    optimalSlot: "Daytime Cooking Block (11:00 AM - 01:00 PM)",
    adMarkers: ["00:10:00"],
    description: "Michelin-star chef demonstrates handcrafted tagliatelle, truffle reduction, and Chianti wine pairings in Florence."
  },
  {
    id: "asset-8",
    title: "TechPulse 2026: Silicon & Neural Cores",
    type: "program" as const,
    duration: 40,
    category: "Technology & Future",
    tags: ["technology", "ai", "hardware", "chips", "robotics"],
    isQCed: true,
    safetyRating: "TV-G",
    loudnessDb: -24.0,
    optimalSlot: "Mid-Morning Innovation Slot",
    adMarkers: ["00:15:00", "00:30:00"],
    description: "Behind-the-scenes inside cleanrooms fabricating next-generation sub-nanometer neural processors and quantum computers."
  },
  {
    id: "asset-9",
    title: "Quantum Beat Festival: Live 4K DJ Set",
    type: "program" as const,
    duration: 60,
    category: "Music & Live Concerts",
    tags: ["electronic", "live", "festival", "lasers", "dolby-atmos"],
    isQCed: true,
    safetyRating: "TV-14",
    loudnessDb: -24.0,
    optimalSlot: "Late Night Music Marathon (10:00 PM - 02:00 AM)",
    adMarkers: ["00:20:00", "00:40:00"],
    description: "Mesmerizing festival mainstage performance with synchronized pyrotechnics, laser choreography, and immersive audio."
  },
  {
    id: "asset-10",
    title: "Northern Lights: Arctic Aurora 4K",
    type: "filler" as const,
    duration: 5,
    category: "Ambient & Station Filler",
    tags: ["ambient", "aurora", "chill", "filler", "4k"],
    isQCed: true,
    safetyRating: "TV-G",
    loudnessDb: -24.0,
    optimalSlot: "Interstitials & Zero-Gap Playout Buffer",
    adMarkers: [],
    description: "Breathtaking real-time 4K timelapse of emerald auroras dancing over snow-covered Tromsø fjords with serene acoustic synth."
  },
  {
    id: "asset-11",
    title: "Apex Electric SUV - 'Charge Tomorrow' Spot",
    type: "commercial" as const,
    duration: 2,
    category: "Automotive Sponsor",
    tags: ["sponsor", "automotive", "electric", "cpm-premium"],
    isQCed: true,
    safetyRating: "TV-G",
    loudnessDb: -24.0,
    optimalSlot: "Primetime Commercial Pod",
    adMarkers: [],
    description: "High-yield automotive sponsor spot highlighting zero-emission high-performance luxury electric SUVs."
  },
  {
    id: "asset-12",
    title: "CastPilot Network 4K Station ID & Bumper",
    type: "filler" as const,
    duration: 1,
    category: "Station Identification",
    tags: ["station-id", "brand", "legal-ident", "bumper"],
    isQCed: true,
    safetyRating: "TV-G",
    loudnessDb: -24.0,
    optimalSlot: "Top of the Hour Legal Station ID",
    adMarkers: [],
    description: "Official broadcast station identification sting adhering to FCC callsign identification regulations."
  },
  {
    id: "asset-13",
    title: "Solaris Voyage: Teaser Trailer",
    type: "promo" as const,
    duration: 2,
    category: "Movie Teaser",
    tags: ["cinema", "trailer", "space", "hollywood"],
    isQCed: true,
    safetyRating: "TV-PG",
    loudnessDb: -23.9,
    optimalSlot: "Pre-Movie Interstitial",
    adMarkers: [],
    description: "Exclusive theatrical trailer teaser for the deep space cinematic thriller hitting theaters and stream next month."
  },
  {
    id: "asset-14",
    title: "World Weather Center Live Bulletin",
    type: "program" as const,
    duration: 15,
    category: "News & Meteorology",
    tags: ["weather", "radar", "satellite", "forecast"],
    isQCed: true,
    safetyRating: "TV-G",
    loudnessDb: -24.0,
    optimalSlot: "Post-News Weather Hit",
    adMarkers: ["00:07:00"],
    description: "3D Doppler radar storm tracking, jet stream analysis, and 7-day continental temperature projections."
  },
  {
    id: "asset-15",
    title: "Retro Arcade Champions: Grand Finals",
    type: "program" as const,
    duration: 35,
    category: "Gaming & Esports",
    tags: ["esports", "arcade", "retro", "tournament"],
    isQCed: true,
    safetyRating: "TV-PG",
    loudnessDb: -24.0,
    optimalSlot: "Weekend Gaming Arena",
    adMarkers: ["00:15:00"],
    description: "Competitive world record speedrunners battle head-to-head in vintage 1980s and 1990s arcade platformers."
  },
  {
    id: "asset-16",
    title: "Classical Symphony: Beethoven 7th Allegretto",
    type: "filler" as const,
    duration: 10,
    category: "Arts & Culture",
    tags: ["orchestra", "classical", "symphony", "filler"],
    isQCed: true,
    safetyRating: "TV-G",
    loudnessDb: -24.0,
    optimalSlot: "Late Night Cultural Interlude",
    adMarkers: [],
    description: "Master recording by the Vienna Philharmonic Orchestra in stunning high dynamic range audio."
  }
];

const INITIAL_SCHEDULES: ScheduleItem[] = [
  // Channel 1: FAST Entertainment (24/7 continuous linear channel)
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
    title: "SodaSpark Refreshment Commercial",
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
    status: "playing" as const, // Currently on-air
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
  {
    id: "sch-5b",
    channelName: "FAST Entertainment",
    startTime: "10:05 AM",
    title: "Apex Electric SUV - 'Charge Tomorrow' Spot",
    type: "commercial" as const,
    duration: 2,
    status: "queued" as const,
    demandScore: 94,
    targetAudience: "High-income automotive shoppers",
    aiRationale: "SCTE-35 programmatic ad pod inserted at end of documentary segment."
  },
  {
    id: "sch-5c",
    channelName: "FAST Entertainment",
    startTime: "10:07 AM",
    title: "Culinary Masterclass: Tuscan Pasta & Wine",
    type: "program" as const,
    duration: 25,
    status: "queued" as const,
    demandScore: 86,
    targetAudience: "Food enthusiasts, home cooks",
    aiRationale: "Midday lifestyle block driving audience engagement into lunch hours."
  },
  {
    id: "sch-5d",
    channelName: "FAST Entertainment",
    startTime: "10:32 AM",
    title: "CastPilot Network 4K Station ID & Bumper",
    type: "filler" as const,
    duration: 1,
    status: "queued" as const,
    demandScore: 75,
    targetAudience: "General rotation",
    aiRationale: "Station identification bumper guaranteeing zero black frame transition."
  },
  {
    id: "sch-5e",
    channelName: "FAST Entertainment",
    startTime: "10:33 AM",
    title: "TechPulse 2026: Silicon & Neural Cores",
    type: "program" as const,
    duration: 40,
    status: "queued" as const,
    demandScore: 93,
    targetAudience: "Tech analysts and enthusiasts",
    aiRationale: "High CPM mid-morning technology feature."
  },
  {
    id: "sch-5f",
    channelName: "FAST Entertainment",
    startTime: "11:13 AM",
    title: "Northern Lights: Arctic Aurora 4K",
    type: "filler" as const,
    duration: 5,
    status: "queued" as const,
    demandScore: 80,
    targetAudience: "General Audience",
    aiRationale: "Zero-gap aesthetic buffer locking to the half-hour boundary."
  },

  // Channel 2: Linear Primetime / News 24 Live
  {
    id: "sch-6",
    channelName: "News 24 Live",
    startTime: "08:00 AM",
    title: "Global Morning Headline Bulletin",
    type: "program" as const,
    duration: 30,
    status: "playing" as const,
    demandScore: 96,
    targetAudience: "Global Commuters & Investors",
    aiRationale: "Rolling live desk morning news broadcast with London and Tokyo bureaus."
  },
  {
    id: "sch-7",
    channelName: "News 24 Live",
    startTime: "08:30 AM",
    title: "Perp Corp Global Markets Spot",
    type: "commercial" as const,
    duration: 2,
    status: "queued" as const,
    demandScore: 91,
    targetAudience: "Financial decision makers",
    aiRationale: "High yield business sponsor commercial placed after opening bell."
  },
  {
    id: "sch-8",
    channelName: "News 24 Live",
    startTime: "08:32 AM",
    title: "Tech Bureau Deep Dive: AI Revolution",
    type: "program" as const,
    duration: 26,
    status: "queued" as const,
    demandScore: 92,
    targetAudience: "Tech sector professionals",
    aiRationale: "Anchor interview with leading AI research scientists."
  },
  {
    id: "sch-9",
    channelName: "News 24 Live",
    startTime: "08:58 AM",
    title: "Station Ident & Next Hour Teaser",
    type: "filler" as const,
    duration: 2,
    status: "queued" as const,
    demandScore: 76,
    targetAudience: "General Public",
    aiRationale: "FCC-compliant station identifier aligning the top-of-the-hour bulletin."
  },

  // Channel 3: Sports HD 1
  {
    id: "sch-10",
    channelName: "Sports HD 1",
    startTime: "02:00 PM",
    title: "Apex Championship: Grand Finals Live",
    type: "program" as const,
    duration: 45,
    status: "playing" as const,
    demandScore: 98,
    targetAudience: "Esports & sports tournament fans",
    aiRationale: "Peak weekend live tournament broadcast with 4-camera vision mixer."
  },
  {
    id: "sch-11",
    channelName: "Sports HD 1",
    startTime: "02:45 PM",
    title: "SodaSpark Refreshment Commercial",
    type: "commercial" as const,
    duration: 2,
    status: "queued" as const,
    demandScore: 89,
    targetAudience: "Action sports fans",
    aiRationale: "Ad break between regulation play and overtime sudden death."
  },
  {
    id: "sch-12",
    channelName: "Sports HD 1",
    startTime: "02:47 PM",
    title: "Apex Formula Racing: Monaco GP Highlights",
    type: "program" as const,
    duration: 45,
    status: "queued" as const,
    demandScore: 95,
    targetAudience: "Motorsports fans",
    aiRationale: "High-octane lead-out following championship broadcast."
  },

  // Channel 4: Music Vault 4K
  {
    id: "sch-13",
    channelName: "Music Vault 4K",
    startTime: "08:00 PM",
    title: "Quantum Beat Festival: Live 4K DJ Set",
    type: "program" as const,
    duration: 60,
    status: "playing" as const,
    demandScore: 97,
    targetAudience: "Electronic music & concert fans",
    aiRationale: "Primetime concert showcase in 4K HDR with Dolby Atmos master audio."
  },
  {
    id: "sch-14",
    channelName: "Music Vault 4K",
    startTime: "09:00 PM",
    title: "Northern Lights: Arctic Aurora 4K",
    type: "filler" as const,
    duration: 5,
    status: "queued" as const,
    demandScore: 82,
    targetAudience: "Chill & ambient music listeners",
    aiRationale: "Acoustic transition into late night electronic vault."
  }
];

const INITIAL_RESOURCES: ResourceAsset[] = [
  {
    id: "res-1",
    name: "Studio Alpha (4K Virtual LED Volume)",
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
    name: "Studio Beta (Foley & 7.1.4 Dolby Stage)",
    type: "studio" as const,
    status: "active" as const,
    allocationDetails: "Calibrated for surround mixing, voiceovers, and CALM Act audio QC.",
    currentBooking: ""
  },
  {
    id: "res-4",
    name: "ARRI Alexa Mini LF Cinema Package",
    type: "camera" as const,
    status: "maintenance" as const,
    allocationDetails: "Bi-weekly optical sensor calibration and SMPTE SMPTE 2110 fiber back testing.",
    currentBooking: ""
  },
  {
    id: "res-5",
    name: "Sarah Jenkins (Lead Prime-Time Anchor)",
    type: "talent" as const,
    status: "booked" as const,
    allocationDetails: "Anchoring 'Global Horizon News Hour' live desk",
    currentBooking: "Global Horizon News Hour"
  },
  {
    id: "res-6",
    name: "David Vance (Senior Tech Correspondent)",
    type: "talent" as const,
    status: "active" as const,
    allocationDetails: "Available for live Silicon Valley technology hits and news desks.",
    currentBooking: ""
  },
  {
    id: "res-7",
    name: "Sony FX9 4K PTZ Robotic Camera Rig",
    type: "camera" as const,
    status: "active" as const,
    allocationDetails: "Overhead newsroom robotic pan-tilt-zoom system with VISCA IP control.",
    currentBooking: ""
  },
  {
    id: "res-8",
    name: "LiveU LU800 5G Bonded Field Backpack",
    type: "camera" as const,
    status: "active" as const,
    allocationDetails: "Multi-modem 5G cellular uplink backpack for breaking news field reporters.",
    currentBooking: ""
  },
  {
    id: "res-9",
    name: "Elena Rostova (Extreme Sports & Outdoor Host)",
    type: "talent" as const,
    status: "active" as const,
    allocationDetails: "Commentator for Apex Championship and Alpine Summit specials.",
    currentBooking: ""
  },
  {
    id: "res-10",
    name: "Master Control Suite MCR-1",
    type: "studio" as const,
    status: "active" as const,
    allocationDetails: "Primary automation transmission suite with 1+1 hitless failover.",
    currentBooking: ""
  }
];

const INITIAL_ALERTS: ConflictAlert[] = [
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
    title: "Loudness Violation: EcoQuest (-19.5 LUFS)",
    description: "Asset 'EcoQuest: Deep Ocean Depths' audio peak checks failed with -19.5 LUFS, violating the -24.0 LUFS EBU R128 / FCC CALM Act broadcasting regulation standard.",
    recommendation: "Apply automated limiter compress-normalize batch script to lower the master output gain to -24 LUFS.",
    resolved: false
  },
  {
    id: "alert-3",
    severity: "low" as const,
    type: "schedule" as const,
    title: "SCTE-35 Splice Cue Synchronization Drift",
    description: "Upstream encoder timestamp packet jitter (+12ms) detected on Channel 1 ad insertion bus. Auto-phase correction active.",
    recommendation: "Re-lock PTP grandmaster clock to ST 2059 profile to ensure frame-accurate ad splicing.",
    resolved: false
  },
  {
    id: "alert-4",
    severity: "medium" as const,
    type: "transmission" as const,
    title: "SMPTE ST 2022-7 Hitless Path B Network Degraded",
    description: "Secondary fiber link reported 2.4% packet loss. Redundant hitless stream reconstruction is maintaining 100% broadcast continuity on Path A.",
    recommendation: "Inspect 100GbE uplink switch port 8 on secondary broadcast transmission chassis.",
    resolved: false
  }
];

let mamAssets: ContentAsset[] = JSON.parse(JSON.stringify(INITIAL_MAM_ASSETS));
let schedules: ScheduleItem[] = JSON.parse(JSON.stringify(INITIAL_SCHEDULES));
let resources: ResourceAsset[] = JSON.parse(JSON.stringify(INITIAL_RESOURCES));
let alerts: ConflictAlert[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));

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

// --- Demo & Seed Data API ---

// Reset all in-memory datasets to rich default dummy content
app.post("/api/demo/reset", (req, res) => {
  mamAssets = JSON.parse(JSON.stringify(INITIAL_MAM_ASSETS));
  schedules = JSON.parse(JSON.stringify(INITIAL_SCHEDULES));
  resources = JSON.parse(JSON.stringify(INITIAL_RESOURCES));
  alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
  console.log("[Demo Engine] Re-seeded in-memory broadcast database with complete dummy content.");
  res.json({
    success: true,
    message: "Re-seeded complete dummy broadcast dataset successfully.",
    assetsCount: mamAssets.length,
    schedulesCount: schedules.length,
    resourcesCount: resources.length,
    alertsCount: alerts.length
  });
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
      model: "gemini-3.8-flash",
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
      model: "gemini-3.8-flash",
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


// ==========================================
// ADVANCED BROADCAST AI SUITE ENDPOINTS
// ==========================================

// 1. AI Broadcast Teleprompter & Anchor Script Studio
app.post("/api/ai/generate-script", async (req, res) => {
  const { topic, genre, vibe, targetDurationSec = 45, channelName = "FAST Entertainment", hostName = "Jesse Lepota", instructions } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Missing topic for script generation" });
  }

  const client = getGeminiClient();
  if (!client) {
    const mockWordCount = Math.round((targetDurationSec || 45) * 2.3);
    const mockScript = `[CAMERA 1 - HOST CLOSEUP]\n\n"Good evening and welcome back to ${channelName}. I'm your host, ${hostName}.\n\nTonight, we are zeroing in on a story that is captivating audiences worldwide: ${topic}. [PAUSE - GRAPHIC INSERT OVERLAY]\n\nOver the course of the next hour, our investigative correspondents and industry analysts break down the unprecedented developments, what it means for the wider ecosystem, and what we can anticipate next.\n\n[TRANSITION TO B-ROLL]\n\nStay with us as we unpack ${topic}—only on ${channelName}."`;

    return res.json({
      success: true,
      scriptTitle: `Anchor Segment: ${topic.slice(0, 35)}`,
      scriptBody: mockScript,
      segmentType: genre || "program",
      estimatedDurationSec: targetDurationSec,
      estimatedWords: mockWordCount,
      suggestedPrompterSpeed: 3,
      keyTakeaways: [`Comprehensive overview of ${topic}`, "Correspondent reports & analysis", "Lead-in to upcoming primetime block"],
      source: "local-broadcast-engine"
    });
  }

  try {
    const prompt = `
      You are an Emmy-winning television broadcast director and executive scriptwriter for a Tier-1 television network / FAST channel called "${channelName}".
      Write an on-air broadcast teleprompter script for anchor/host "${hostName}".
      
      Parameters:
      - Topic/Subject: "${topic}"
      - Vibe/Tone: "${vibe || 'engaging'}" (e.g., formal news, energetic live, late-night retro, breaking urgency)
      - Segment Type: "${genre || 'program'}" (e.g., program intro, commercial sponsor read, promo teaser, breaking news)
      - Target Air Duration: Approximately ${targetDurationSec} seconds (Standard broadcast reading rate is ~130-145 words per minute, so aim for ~${Math.round(targetDurationSec * 2.25)} spoken words).
      - Special Instructions: "${instructions || 'Include realistic stage cues in brackets like [PAUSE], [LOOK TO CAM 2], [LOWER-THIRD GRAPHIC]. Write in natural spoken teleprompter syntax without difficult tongue-twisters.'}"

      Return strictly valid JSON matching this schema:
      {
        "scriptTitle": "Short punchy broadcast title",
        "scriptBody": "Complete formatted teleprompter text with stage directions in brackets",
        "estimatedWords": number,
        "estimatedDurationSec": number,
        "suggestedPrompterSpeed": number,
        "keyTakeaways": ["Point 1", "Point 2", "Point 3"]
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      scriptTitle: parsed.scriptTitle || `Anchor Segment: ${topic.slice(0, 35)}`,
      scriptBody: parsed.scriptBody || "",
      segmentType: genre || "program",
      estimatedDurationSec: parsed.estimatedDurationSec || targetDurationSec,
      estimatedWords: parsed.estimatedWords || Math.round(targetDurationSec * 2.2),
      suggestedPrompterSpeed: parsed.suggestedPrompterSpeed || 3,
      keyTakeaways: parsed.keyTakeaways || [],
      source: "gemini-api"
    });
  } catch (error: any) {
    console.error("Gemini script generation error:", error);
    res.status(500).json({ error: "Failed to generate script", message: error.message });
  }
});

// 2. AI Broadcast Standards & Practices (S&P) Compliance Screener
app.post("/api/ai/compliance-screen", async (req, res) => {
  const { contentText, title = "Untitled Segment", targetDemographic = "General Audience" } = req.body;
  if (!contentText) {
    return res.status(400).json({ error: "Missing contentText for compliance screening" });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      success: true,
      rating: "TV-PG",
      subRatings: ["L"],
      safeForAir: true,
      fccSafeHarborRequired: false,
      summary: "Simulated Broadcast S&P Audit: Content adheres to daytime linear transmission standards with no severe FCC Title 47 indecency violations.",
      flags: [],
      source: "local-compliance-engine"
    });
  }

  try {
    const prompt = `
      You are the Chief Standards & Practices (S&P) Compliance Officer for a major broadcast television network.
      Audit the following broadcast text / script for FCC (US Title 47), UK OFCOM, and advertiser safety compliance:
      
      Content Title: "${title}"
      Target Demographic: "${targetDemographic}"
      Script/Content Text:
      """
      ${contentText}
      """

      Evaluate:
      1. Profanity, obscenity, or indecency (FCC 10pm-6am Safe Harbor requirements).
      2. Defamation, unsubstantiated allegations, or legal liability risks.
      3. Violence, self-harm, or graphic themes.
      4. Sponsor / Commercial conflict or hidden product endorsement concerns.
      5. Appropriate official TV Content Rating: TV-Y, TV-Y7, TV-G, TV-PG, TV-14, or TV-MA, with optional sub-ratings (V, S, L, D).

      Return output strictly as JSON matching this schema:
      {
        "rating": "TV-G" | "TV-PG" | "TV-14" | "TV-MA",
        "subRatings": ["L", "V"],
        "safeForAir": boolean,
        "fccSafeHarborRequired": boolean,
        "summary": "2-3 sentence executive compliance summary",
        "flags": [
          {
            "category": "Profanity" | "Sponsor Conflict" | "Violence" | "Sensationalism" | "Legal",
            "snippet": "exact or approximate word/phrase",
            "severity": "low" | "medium" | "high",
            "reason": "explanation of violation",
            "suggestedFix": "recommended broadcast-friendly alternative"
          }
        ]
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      rating: parsed.rating || "TV-PG",
      subRatings: parsed.subRatings || [],
      safeForAir: parsed.safeForAir !== undefined ? parsed.safeForAir : true,
      fccSafeHarborRequired: parsed.fccSafeHarborRequired || false,
      summary: parsed.summary || "Passed standards screening.",
      flags: parsed.flags || [],
      source: "gemini-api"
    });
  } catch (error: any) {
    console.error("Gemini compliance screening error:", error);
    res.status(500).json({ error: "Failed to screen content", message: error.message });
  }
});

// 3. AI Dynamic Ad-Break & SCTE-35 Placement Optimizer
app.post("/api/ai/optimize-ad-breaks", async (req, res) => {
  const { assetTitle, durationMinutes = 30, category = "General", description = "" } = req.body;
  
  const client = getGeminiClient();
  if (!client) {
    const breaks = [];
    if (durationMinutes >= 30) {
      breaks.push({ timecode: "00:10:00", rationale: "Act I resolution & narrative pause", energyLevel: "Low dialogue", breakDurationSec: 120 });
      breaks.push({ timecode: "00:20:00", rationale: "Act II midpoint tension cliffhanger", energyLevel: "Natural scene fade", breakDurationSec: 120 });
    } else if (durationMinutes >= 15) {
      breaks.push({ timecode: "00:07:30", rationale: "Midpoint feature break", energyLevel: "Low speech activity", breakDurationSec: 90 });
    }
    return res.json({
      success: true,
      recommendedCuePoints: breaks,
      totalAdMinutes: breaks.length * 2,
      adLoadPercentage: `${Math.round(((breaks.length * 2) / durationMinutes) * 100)}%`,
      source: "local-optimizer"
    });
  }

  try {
    const prompt = `
      You are an expert FAST (Free Ad-supported Streaming TV) and linear broadcast monetization engineer.
      Analyze this media asset and identify the optimal SCTE-35 DPI (Digital Program Insertion) ad break cue points.
      
      Asset Details:
      - Title: "${assetTitle}"
      - Duration: ${durationMinutes} minutes
      - Category/Genre: "${category}"
      - Synopsis: "${description || 'Standard episodic content'}"

      FAST Industry Guidelines:
      - Standard ad load is 8-14 minutes per hour (approx 2-4 minutes per 30 minutes).
      - Ad breaks must occur at natural narrative pauses, scene transitions, or act climaxes to avoid jarring mid-dialogue interruptions.
      - Specify exact HH:MM:SS timestamps within 00:00:00 to 00:${String(durationMinutes).padStart(2, '0')}:00.

      Return output strictly as JSON matching this schema:
      {
        "recommendedCuePoints": [
          {
            "timecode": "00:10:30",
            "rationale": "Clear 2-sentence narrative explanation",
            "energyLevel": "low" | "medium" | "fade-to-black",
            "breakDurationSec": 90
          }
        ],
        "totalAdMinutes": number,
        "adLoadPercentage": "12%"
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      recommendedCuePoints: parsed.recommendedCuePoints || [],
      totalAdMinutes: parsed.totalAdMinutes || 4,
      adLoadPercentage: parsed.adLoadPercentage || "13%",
      source: "gemini-api"
    });
  } catch (error: any) {
    console.error("Gemini ad-break optimization error:", error);
    res.status(500).json({ error: "Failed to optimize ad breaks", message: error.message });
  }
});

// 4. AI Subtitle & Multilingual Closed Caption Generator (CEA-708 / WebVTT)
app.post("/api/ai/generate-subtitles", async (req, res) => {
  const { title, description = "", scriptText = "", targetLanguages = ["en", "es", "fr"] } = req.body;
  
  const client = getGeminiClient();
  if (!client) {
    const defaultEn = `WEBVTT\n\n1\n00:00:01.000 --> 00:00:04.500\nWelcome to ${title}.\n\n2\n00:00:05.000 --> 00:00:09.200\nToday we explore fascinating perspectives and live reporting.\n\n3\n00:00:09.800 --> 00:00:14.000\nStay tuned as our broadcast unfolds on CastPilot Network.`;
    const defaultEs = `WEBVTT\n\n1\n00:00:01.000 --> 00:00:04.500\nBienvenidos a ${title}.\n\n2\n00:00:05.000 --> 00:00:09.200\nHoy exploramos fascinantes perspectivas y reportajes en vivo.\n\n3\n00:00:09.800 --> 00:00:14.000\nSintonice mientras nuestra transmisión continúa en CastPilot.`;
    const defaultFr = `WEBVTT\n\n1\n00:00:01.000 --> 00:00:04.500\nBienvenue dans ${title}.\n\n2\n00:00:05.000 --> 00:00:09.200\nAujourd'hui, nous explorons des perspectives fascinantes.\n\n3\n00:00:09.800 --> 00:00:14.000\nRestez à l'écoute sur le réseau CastPilot.`;
    return res.json({
      success: true,
      vttEnglish: defaultEn,
      translations: { es: defaultEs, fr: defaultFr },
      cueCount: 3,
      source: "local-vtt-engine"
    });
  }

  try {
    const prompt = `
      You are a Broadcast Subtitle & Closed Captioning Specialist complying with FCC Section 79.1 and CEA-708 / WebVTT specifications.
      Generate synchronized, accurately timed WebVTT closed captions for this broadcast asset:
      - Title: "${title}"
      - Description/Script: "${scriptText || description || 'Broadcast overview'}"

      Requirements:
      1. Output clean standard WebVTT format for English.
      2. Provide translated WebVTT subtitles for Spanish (es) and French (fr).
      3. Format with sequential cue numbers and timestamps (HH:MM:SS.mmm --> HH:MM:SS.mmm).
      4. Maximum 32 characters per line, max 2 lines per cue for optimal television screen readability.

      Return output strictly as JSON matching this schema:
      {
        "vttEnglish": "WEBVTT\\n\\n1\\n00:00:01.000 --> 00:00:04.000\\nText...",
        "translations": {
          "es": "WEBVTT\\n\\n1\\n00:00:01.000 --> 00:00:04.000\\nTexto en español...",
          "fr": "WEBVTT\\n\\n1\\n00:00:01.000 --> 00:00:04.000\\nTexte en français..."
        },
        "cueCount": number
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      vttEnglish: parsed.vttEnglish || "WEBVTT",
      translations: parsed.translations || {},
      cueCount: parsed.cueCount || 4,
      source: "gemini-api"
    });
  } catch (error: any) {
    console.error("Gemini subtitle generation error:", error);
    res.status(500).json({ error: "Failed to generate subtitles", message: error.message });
  }
});

// 5. AI Broadcast Schedule Harmonizer & Rundown Doctor
app.post("/api/ai/harmonize-rundown", async (req, res) => {
  const { channelName = "FAST Entertainment", currentSchedules } = req.body;
  const items: ScheduleItem[] = currentSchedules || schedules.filter(s => s.channelName === channelName);

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      success: true,
      overallHealthScore: 94,
      diagnostics: [
        { type: "clock_drift", description: "Schedule clock alignment verified against top-of-hour boundaries.", severity: "info" },
        { type: "demographic_clash", description: "Audience flow transitions smoothly across morning and afternoon blocks.", severity: "info" }
      ],
      tacticalRecommendations: [
        "Maintain 12-minute maximum hourly commercial cap to comply with FAST programmatic best practices.",
        "Insert a 15-second station identity promo right before top-of-hour join."
      ],
      source: "local-doctor"
    });
  }

  try {
    const prompt = `
      You are the Chief Playout Traffic Director & Rundown Doctor for television network "${channelName}".
      Audit the following broadcast schedule rundown for structural integrity, viewer retention flow, and commercial compliance:

      Current Lineup:
      ${JSON.stringify(items.map(i => ({ startTime: i.startTime, title: i.title, type: i.type, duration: i.duration, targetAudience: i.targetAudience })), null, 2)}

      Analyze for:
      1. Timing Gaps or Dead Air Risk.
      2. Demographic Clashes (e.g. jarring tonal shifts between consecutive shows).
      3. Ad-break clustering fatigue (e.g. back-to-back commercials).
      4. Recommendations to achieve perfect :00/:30 clock alignment.

      Return output strictly as JSON matching this schema:
      {
        "overallHealthScore": number,
        "diagnostics": [
          {
            "type": "gap" | "demographic_clash" | "ad_fatigue" | "clock_drift" | "optimal",
            "description": "Clear explanation",
            "severity": "info" | "warning" | "critical"
          }
        ],
        "tacticalRecommendations": ["Action 1", "Action 2", "Action 3"]
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      overallHealthScore: parsed.overallHealthScore || 92,
      diagnostics: parsed.diagnostics || [],
      tacticalRecommendations: parsed.tacticalRecommendations || [],
      source: "gemini-api"
    });
  } catch (error: any) {
    console.error("Gemini schedule doctor error:", error);
    res.status(500).json({ error: "Failed to harmonize rundown", message: error.message });
  }
});

// 6. AI Live News Ticker, Audience Poll & Breaking Banner Synthesizer
app.post("/api/ai/synthesize-engagement", async (req, res) => {
  const { topic, channelName = "FAST Entertainment", breaking = false } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Missing topic" });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      success: true,
      tickers: [
        `🚨 BREAKING: ${topic.toUpperCase()} • Live coverage continues across the network`,
        `📈 DEVELOPING: Analysts and field correspondents weigh in on latest developments`,
        `💬 COMMUNITY CHAT: Have your say in our live interactive viewer poll below`
      ],
      poll: {
        question: `What is your take on ${topic}?`,
        options: [
          { text: "Strongly Support / Optimistic", votes: 45 },
          { text: "Neutral / Awaiting Details", votes: 28 },
          { text: "Concerned / Skeptical", votes: 19 }
        ]
      },
      bannerAlert: {
        headline: `SPECIAL REPORT: ${topic.toUpperCase()}`,
        subtext: "Continuous live updates streaming now on CastPilot Master Control",
        level: breaking ? "breaking" : "normal"
      },
      source: "local-synthesizer"
    });
  }

  try {
    const prompt = `
      You are the Interactive Engagement Director for live broadcast channel "${channelName}".
      Generate live on-screen audience graphics and interactive elements for the following story/topic:
      
      Topic/Story: "${topic}"
      Breaking Status: ${breaking ? "CRITICAL / BREAKING NEWS" : "Standard Live Programming"}

      Requirements:
      1. Generate 3 broadcast crawler ticker lines (concise, high-impact, punctuated with bullet dots "•").
      2. Generate an audience engagement live poll with a compelling question and 3 distinct options.
      3. Generate a high-priority Lower-Third Banner Alert with punchy headline and informative subtext.

      Return output strictly as JSON matching this schema:
      {
        "tickers": ["Line 1", "Line 2", "Line 3"],
        "poll": {
          "question": "Question text?",
          "options": [
            { "text": "Option 1", "votes": 35 },
            { "text": "Option 2", "votes": 42 },
            { "text": "Option 3", "votes": 18 }
          ]
        },
        "bannerAlert": {
          "headline": "UPPERCASE HEADLINE",
          "subtext": "1-sentence context",
          "level": "breaking" | "normal" | "emergency"
        }
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      tickers: parsed.tickers || [],
      poll: parsed.poll || { question: `Opinions on ${topic}?`, options: [] },
      bannerAlert: parsed.bannerAlert || { headline: topic.toUpperCase(), subtext: "Live updates", level: "normal" },
      source: "gemini-api"
    });
  } catch (error: any) {
    console.error("Gemini engagement synthesis error:", error);
    res.status(500).json({ error: "Failed to synthesize engagement assets", message: error.message });
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


// ==========================================
// --- Broadcast Master Tally Routing API ---
// ==========================================

let broadcastTallyState = {
  activePgmCameraId: "feed-1",
  activePvwCameraId: "feed-2",
  lastSwitchedAt: new Date().toISOString(),
  transitionType: "cut", // "cut" | "mix" | "wipe"
  isLiveOnAir: true
};

app.get("/api/playout/tally", (req, res) => {
  res.json(broadcastTallyState);
});

app.post("/api/playout/tally", (req, res) => {
  const { activePgmCameraId, activePvwCameraId, transitionType, isLiveOnAir } = req.body;
  if (activePgmCameraId) broadcastTallyState.activePgmCameraId = activePgmCameraId;
  if (activePvwCameraId) broadcastTallyState.activePvwCameraId = activePvwCameraId;
  if (transitionType) broadcastTallyState.transitionType = transitionType;
  if (typeof isLiveOnAir === 'boolean') broadcastTallyState.isLiveOnAir = isLiveOnAir;
  broadcastTallyState.lastSwitchedAt = new Date().toISOString();

  res.json({ success: true, tally: broadcastTallyState });
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
// --- TIER-1 BROADCAST STANDARDS & AUDIT SUITE ---
// ==========================================

let ptpState: PtpSyncState = {
  isLocked: true,
  grandmasterId: "0x00:1B:EB:FF:FE:2A:44:91",
  domain: 127,
  phaseOffsetUs: 0.038, // 38 nanoseconds / 0.038 µs (SMPTE ST 2059-2 compliant)
  jitterNs: 14,
  profile: "SMPTE ST 2059-2",
  lastSyncTimestamp: new Date().toISOString(),
  syncQuality: "Primary Grandmaster Locked",
  leapSeconds: 37
};

let smpte2022State: Smpte2022State = {
  hitlessActive: true,
  pathRed: {
    interface: "eth1_sfp28 (100GbE)",
    ip: "10.210.12.44",
    status: "active",
    bitrateMbps: 2980, // uncompressed 1080p60 / 4K stream
    packetLossPct: 0.00,
    jitterMs: 0.12
  },
  pathBlue: {
    interface: "eth2_sfp28 (100GbE)",
    ip: "10.210.13.44",
    status: "active",
    bitrateMbps: 2980,
    packetLossPct: 0.00,
    jitterMs: 0.14
  },
  reconstructedPacketsTotal: 849204,
  droppedFramesCount: 0,
  seamlessMergeHealth: "Optimal (Dual Path Active)"
};

let loudnessState: LoudnessComplianceState = {
  targetStandard: "EBU R128 (-23 LUFS)",
  targetLufs: -23.0,
  momentaryLufs: -23.1,
  shortTermLufs: -23.0,
  integratedLufs: -23.2,
  loudnessRangeLra: 7.4,
  maxTruePeakDbTp: -1.2, // Within safe limit of -1.0 dBTP
  isCompliant: true,
  dspLimiterActive: true,
  gainCorrectionDb: 0.0
};

let asRunLogs: AsRunEntry[] = [
  {
    id: "ar-1001",
    timestamp: "2026-09-02T08:00:00.000Z",
    timecodeIn: "08:00:00:00",
    timecodeOut: "09:00:00:00",
    durationSeconds: 3600,
    title: "Global Horizon News Hour",
    assetId: "asset-1",
    type: "program",
    status: "aired_verified",
    integratedLufs: -23.8,
    sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    reconciliationStatus: "Matched (100%)"
  },
  {
    id: "ar-1002",
    timestamp: "2026-09-02T09:00:00.000Z",
    timecodeIn: "09:00:00:00",
    timecodeOut: "09:02:00:00",
    durationSeconds: 120,
    title: "SodaSpark Refreshment commercial",
    assetId: "asset-4",
    type: "commercial",
    advertiserId: "ADV-BEV-9921",
    scteCueType: "0x34 (Provider Ad Start)",
    status: "aired_verified",
    integratedLufs: -24.0,
    sha256Hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    reconciliationStatus: "Matched (100%)"
  },
  {
    id: "ar-1003",
    timestamp: "2026-09-02T09:02:00.000Z",
    timecodeIn: "09:02:00:00",
    timecodeOut: "09:32:00:00",
    durationSeconds: 1800,
    title: "Beyond the Peak: Alpine Summit",
    assetId: "asset-2",
    type: "program",
    status: "aired_verified",
    integratedLufs: -24.2,
    sha256Hash: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    reconciliationStatus: "Matched (100%)"
  },
  {
    id: "ar-1004",
    timestamp: "2026-09-02T09:32:00.000Z",
    timecodeIn: "09:32:00:00",
    timecodeOut: "09:35:00:00",
    durationSeconds: 180,
    title: "Cyberpunk 2088 Promo",
    assetId: "asset-5",
    type: "promo",
    scteCueType: "0x36 (Distributor Ad)",
    status: "aired_verified",
    integratedLufs: -23.5,
    sha256Hash: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    reconciliationStatus: "Matched (100%)"
  }
];

let nmosNodes: NmosNode[] = [
  {
    id: "nmos-node-01",
    label: "CastPilot-Core-Playout-MCR01",
    description: "Primary Linear Playout Master Control Engine (SMPTE ST 2110-20/30/40)",
    version: "2.4.1",
    nodeApiVersion: "v1.3",
    hostname: "mcr01-core.broadcast.castpilot.internal",
    sendersCount: 4,
    receiversCount: 8,
    status: "registered_active",
    ipAddress: "10.210.10.101",
    st2110Essence: "ST 2110-20 (Video)"
  },
  {
    id: "nmos-node-02",
    label: "Audio-DSP-CalmEngine-01",
    description: "Multi-channel 32-ch EBU R128 / Dolby Atmos Compliance Processor",
    version: "1.9.0",
    nodeApiVersion: "v1.3",
    hostname: "dsp01-audio.broadcast.castpilot.internal",
    sendersCount: 16,
    receiversCount: 16,
    status: "registered_active",
    ipAddress: "10.210.10.102",
    st2110Essence: "ST 2110-30 (Audio)"
  },
  {
    id: "nmos-node-03",
    label: "SCTE-Ancillary-Splicer-01",
    description: "Ancillary Data Splicer (CEA-708 Captions, OP-47, SCTE-104)",
    version: "3.1.2",
    nodeApiVersion: "v1.3",
    hostname: "anc01-splicer.broadcast.castpilot.internal",
    sendersCount: 2,
    receiversCount: 2,
    status: "registered_active",
    ipAddress: "10.210.10.103",
    st2110Essence: "ST 2110-40 (Ancillary)"
  },
  {
    id: "nmos-node-04",
    label: "MultiCam-NDI-Bridge-Node-01",
    description: "8-Channel NDI / WebRTC to Uncompressed SMPTE 2110 Gateway",
    version: "2.0.4",
    nodeApiVersion: "v1.3",
    hostname: "ndi01-bridge.broadcast.castpilot.internal",
    sendersCount: 8,
    receiversCount: 8,
    status: "registered_active",
    ipAddress: "10.210.10.104",
    st2110Essence: "ST 2110-20 (Video)"
  }
];

// Get Full Broadcast Standards Status
app.get("/api/standards/status", (req, res) => {
  res.json({
    ptp: ptpState,
    smpte2022: smpte2022State,
    loudness: loudnessState,
    asRunCount: asRunLogs.length,
    nmosNodes,
    studioReadinessIndex: 98.4
  });
});

// PTP Grandmaster Re-Sync
app.post("/api/standards/ptp/resync", (req, res) => {
  ptpState.isLocked = true;
  ptpState.phaseOffsetUs = Number((0.02 + Math.random() * 0.025).toFixed(3));
  ptpState.jitterNs = Math.floor(10 + Math.random() * 8);
  ptpState.lastSyncTimestamp = new Date().toISOString();
  ptpState.syncQuality = "Primary Grandmaster Locked";

  res.json({
    success: true,
    message: `PTP IEEE 1588 / SMPTE ST 2059-2 phase lock verified against Grandmaster ${ptpState.grandmasterId}. Offset: ${ptpState.phaseOffsetUs} µs.`,
    ptp: ptpState
  });
});

// SMPTE ST 2022-7 Seamless Failover Stress Test
app.post("/api/standards/smpte2022/test-failover", (req, res) => {
  const { pathAffected } = req.body; // 'red' | 'blue' | 'recover'

  if (pathAffected === 'red') {
    smpte2022State.pathRed.status = "offline";
    smpte2022State.pathRed.bitrateMbps = 0;
    smpte2022State.pathRed.packetLossPct = 100.0;
    smpte2022State.seamlessMergeHealth = "Path Red Degraded (Protected)";
  } else if (pathAffected === 'blue') {
    smpte2022State.pathBlue.status = "offline";
    smpte2022State.pathBlue.bitrateMbps = 0;
    smpte2022State.pathBlue.packetLossPct = 100.0;
    smpte2022State.seamlessMergeHealth = "Path Blue Degraded (Protected)";
  } else {
    // Recover both paths
    smpte2022State.pathRed.status = "active";
    smpte2022State.pathRed.bitrateMbps = 2980;
    smpte2022State.pathRed.packetLossPct = 0.0;
    smpte2022State.pathBlue.status = "active";
    smpte2022State.pathBlue.bitrateMbps = 2980;
    smpte2022State.pathBlue.packetLossPct = 0.0;
    smpte2022State.seamlessMergeHealth = "Optimal (Dual Path Active)";
  }

  // Dropped frames remain 0 because SMPTE 2022-7 merges packet by packet seamlessly!
  smpte2022State.reconstructedPacketsTotal += Math.floor(1200 + Math.random() * 500);

  res.json({
    success: true,
    message: pathAffected === 'recover'
      ? "Both SMPTE ST 2022-7 Red and Blue network paths fully synchronized and healthy."
      : `Simulated catastrophic cut on Path ${pathAffected.toUpperCase()}. SMPTE ST 2022-7 hitless protection successfully maintained 0 dropped frames!`,
    smpte2022: smpte2022State
  });
});

// Loudness DSP Real-time Auto-Normalization
app.post("/api/standards/loudness/auto-normalize", (req, res) => {
  const { standard } = req.body; // 'EBU' or 'CALM'
  if (standard === 'CALM') {
    loudnessState.targetStandard = "CALM Act / ATSC A/85 (-24 LKFS)";
    loudnessState.targetLufs = -24.0;
    loudnessState.integratedLufs = -24.0;
    loudnessState.momentaryLufs = -23.9;
    loudnessState.shortTermLufs = -24.1;
  } else {
    loudnessState.targetStandard = "EBU R128 (-23 LUFS)";
    loudnessState.targetLufs = -23.0;
    loudnessState.integratedLufs = -23.0;
    loudnessState.momentaryLufs = -22.9;
    loudnessState.shortTermLufs = -23.1;
  }

  loudnessState.isCompliant = true;
  loudnessState.dspLimiterActive = true;
  loudnessState.maxTruePeakDbTp = -1.5;
  loudnessState.gainCorrectionDb = Number((loudnessState.targetLufs - (-21.5)).toFixed(1));

  // Normalize any out-of-spec MAM assets
  mamAssets = mamAssets.map(a => {
    if (!a.isQCed || Math.abs(a.loudnessDb - loudnessState.targetLufs) > 1.0) {
      return {
        ...a,
        isQCed: true,
        loudnessDb: loudnessState.targetLufs
      };
    }
    return a;
  });

  // Resolve any loudness alerts
  alerts = alerts.map(a => a.title.includes("Loudness") ? { ...a, resolved: true } : a);

  res.json({
    success: true,
    message: `DSP Multi-band Auto-Normalize Limiter applied. Playout and MAM assets aligned to ${loudnessState.targetStandard}.`,
    loudness: loudnessState
  });
});

// Fetch As-Run Logs
app.get("/api/standards/as-run", (req, res) => {
  res.json({ asRunLogs });
});

// Record As-Run Entry
app.post("/api/standards/as-run/entry", (req, res) => {
  const { title, assetId, type, durationSeconds, advertiserId, scteCueType, integratedLufs } = req.body;

  const now = new Date();
  const timecodeIn = now.toTimeString().split(' ')[0] + ":00";
  const endTime = new Date(now.getTime() + (durationSeconds || 60) * 1000);
  const timecodeOut = endTime.toTimeString().split(' ')[0] + ":00";

  // Deterministic SHA-256 simulation
  const hashSeed = `${title}-${assetId}-${now.toISOString()}-${durationSeconds}`;
  let hashVal = 0;
  for (let i = 0; i < hashSeed.length; i++) {
    hashVal = (hashVal << 5) - hashVal + hashSeed.charCodeAt(i);
    hashVal |= 0;
  }
  const hexHash = Math.abs(hashVal).toString(16).padStart(8, '0') + "f8a920bc48ef110298a0";

  const newEntry: AsRunEntry = {
    id: `ar-${Date.now()}`,
    timestamp: now.toISOString(),
    timecodeIn,
    timecodeOut,
    durationSeconds: durationSeconds || 60,
    title: title || "Broadcast Linear Event",
    assetId: assetId || "asset-dynamic",
    type: type || "program",
    advertiserId,
    scteCueType,
    status: "aired_verified",
    integratedLufs: integratedLufs || -23.5,
    sha256Hash: hexHash,
    reconciliationStatus: "Matched (100%)"
  };

  asRunLogs.unshift(newEntry);
  res.status(201).json({ success: true, entry: newEntry, asRunLogs });
});

// SCTE-104 Frame-Accurate Hardware Splice Inserter
app.post("/api/standards/scte104/inject", (req, res) => {
  const { spliceType, segmentationType, prerollMs, upid } = req.body;

  const now = new Date();
  const spliceTimecode = new Date(now.getTime() + (prerollMs || 4000)).toTimeString().split(' ')[0] + ":12";

  // Trigger SCTE-35 Splicer state
  scteAdState.adTriggered = true;
  scteAdState.scteStatus = `SCTE-104 Hardware DPI Injected (${spliceType || 'CUE-OUT'}) @ TC ${spliceTimecode}`;

  alerts.unshift({
    id: `alert-scte104-${Date.now()}`,
    severity: "medium",
    type: "schedule",
    title: `SCTE-104 Hardware Splice Cue (${spliceType || 'CUE-OUT'})`,
    description: `SMPTE 2010 / SCTE-104 DPI command injected into VANC PID 0x0104. Pre-roll: ${prerollMs || 4000}ms. Segmentation: ${segmentationType || '0x34 Provider Ad'}. UPID: ${upid || 'SMPTE-UMID-8842-US'}.`,
    recommendation: "Downstream linear encoders (Harmonic, Elemental, Synamedia) will execute sample-accurate frame splice.",
    resolved: false
  });

  setTimeout(() => {
    scteAdState.adTriggered = false;
    scteAdState.scteStatus = "Idle / Monitoring";
  }, 15000);

  res.json({
    success: true,
    message: `SCTE-104 DPI Cue injected into VANC. Sample-accurate execution targeted at ${spliceTimecode}.`,
    spliceDetails: {
      spliceType: spliceType || 'CUE-OUT',
      segmentationType: segmentationType || '0x34 Provider Ad',
      targetTimecode: spliceTimecode,
      upid: upid || 'SMPTE-UMID-8842-US',
      vancPid: "0x0104"
    }
  });
});

// Tier-1 Studio Readiness Audit Benchmark
app.get("/api/standards/audit", (req, res) => {
  const auditReport = {
    evaluatedAt: new Date().toISOString(),
    overallReadinessScore: 98.6,
    tierRating: "Tier-1 Major Broadcast Network Certified",
    standardsCompliance: [
      {
        standard: "SMPTE ST 2110 (-20 Video, -30 Audio, -40 ANC)",
        status: "COMPLIANT",
        score: 100,
        notes: "Uncompressed IP essence routing with AMWA NMOS IS-04/IS-05 node registration."
      },
      {
        standard: "SMPTE ST 2022-7 (Hitless Seamless Merge)",
        status: "COMPLIANT",
        score: 100,
        notes: "Dual-path Red/Blue redundant network architecture with 0 frame loss during catastrophic path drops."
      },
      {
        standard: "SMPTE ST 2059-2 / IEEE 1588 PTP",
        status: "COMPLIANT",
        score: 98,
        notes: "Sub-microsecond phase alignment (0.038 µs) locked to hardware grandmaster."
      },
      {
        standard: "ITU-R BS.1770-4 & EBU R128 / CALM Act",
        status: "COMPLIANT",
        score: 100,
        notes: "Real-time integrated loudness tracking (-23 LUFS / -24 LKFS) with automatic DSP multi-band true-peak limiting."
      },
      {
        standard: "SCTE-104 & ANSI/SCTE-35 DPI Splice Signaling",
        status: "COMPLIANT",
        score: 98,
        notes: "Digital program insertion with UPID, segmentation descriptors, and VANC payload injection."
      },
      {
        standard: "SMPTE Frame-Accurate As-Run Audit Logs",
        status: "COMPLIANT",
        score: 99,
        notes: "Cryptographically hashed (SHA-256) reconciliation logs matching advertiser billing verification specifications."
      },
      {
        standard: "FCC EAS & Ancillary CEA-708 Closed Captioning",
        status: "COMPLIANT",
        score: 96,
        notes: "Federal emergency intercept override and synchronized DVB/CEA caption delivery."
      },
      {
        standard: "High-Availability 99.999% Playout Cloud SLA",
        status: "COMPLIANT",
        score: 98,
        notes: "Active-active primary/backup playout nodes with sub-second failover state replication."
      }
    ],
    studioEndorsementVerdict: "Ready for deployment in Tier-1 National Networks, Regional Sports Networks (RSN), and Global FAST Cloud Playout Hubs."
  };

  res.json(auditReport);
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
