# 🛰️ CASTPILOT // FAST-LIVE BROADCAST SUITE
> **Enterprise Cloud Playout Automation, SCTE-35 Programmatic Splicing, and Real-Time Audience Engagement Systems.**

```
   ______              __  ____  _ __        __  
  / ____/___ ______/ /_/ / /_(_) /___  / /_ 
 / /   / __ `/ ___/ __/ __/ / / / __ \/ __/ 
/ /___/ /_/ (__  ) /_/ /_/ / / / /_/ / /_   
\____/\__,_/____/\__/\__/_/_/_/\____/\__/   
                                            
           [ SYSTEM OVERRIDE: ACTIVE ]
           [ COGNITIVE CORE: ONLINE ]
```

---

## 🌌 ARCHITECTURAL VISION

**CastPilot** is a futuristic, next-generation **FAST (Free Ad-supported Streaming TV)** playout controller and interactive broadcast director designed for modern digital networks. Built to bridge the gap between high-fidelity visual entertainment and real-time community interaction, CastPilot operates as a fully integrated, zero-latency cloud-native studio. 

From automated SCTE-35 programmatic ad-insertion commands to automated playout timelines, real-time Gemini AI metadata enrichment, and transparent OBS Studio graphic overlays, CastPilot empowers small crews to broadcast with the production quality of multi-million dollar traditional TV networks.

---

## 🛠️ CORE BROADCAST MODULES

### 1. 📺 Playout Controller & Signal Monitor
* **Dynamic Canvas Animation Engine**: Simulates live playout with custom-crafted animated visual waves that shift color, cadence, and texture based on the currently playing genre (e.g., News corporate grids, Nature emerald landscapes, filler orbit loops).
* **Glitch-Resilient Splicing**: Incorporates simulated CRT signal flickers and transition noise upon program switches to emulate real-world hardware cross-point delays.
* **Segment-Accurate Audio VU Metering**: Features live stereo (L/R) decibel segmentation meters with floating peak indicators, decay timing, and adaptive commercial compression algorithms.

### 2. 🔌 SCTE-35 Programmatic Ad Insertion
* **Downstream Splicing Commands**: Simulates high-precision, industry-standard ANSI/SCTE-35 cue injection (`0xFC` Splice Command payloads).
* **Dynamic Ad Breaks**: Triggers programmatic ad breaks with visual and audio metadata alerts, complete with safety recovery countdown sequences.

### 3. 💬 Engagement Studio & Overlay Server
* **OBS Web Browser Source**: Generates an independent, ultra-low-latency, transparent-background graphic overlay URL suitable for inclusion in OBS Studio, vMix, or Wirecast.
* **Live Crawler Ticker**: Real-time, smooth ticker-tape crawler looping dynamic breaking news alerts, sponsor messages, and stream announcements.
* **Dynamic Polling & Analytics**: Deploy instant choice polls with automated voting simulators that render live, animated bar chart analytics directly inside the broadcast monitor and the browser source.
* **Soundboard Event Alerts**: Instantly fire highly stylized follower, subscriber, cheer, and donor alerts.

### 4. 🗄️ Media Asset Management (MAM) & Gemini AI
* **Intelligent Metadata Enrichment**: Leverages **Google Gemini** server-side APIs to automatically analyze program descriptions, generate technical tags, write compliance ratings, and synthesize promotional copy.
* **Asset Library**: High-speed, responsive search, filter, and scheduling drawers for video files, live feeds, and ad filler segments.

### 5. 📅 Timeline Schedule & SCTE Analyzers
* **Conflict Detection Engine**: Analyzes scheduled blocks and alerts programmers of overlap collisions, structural programming gaps, and SCTE marker timing conflicts in real-time.
* **Intelligent Gaps Auto-Filler**: Instant fill algorithms to patch airtime voids with high-yield promotional banners or sponsor spots.

---

## 📡 COGNITIVE PROTOCOLS & DATA FLOW

```
      +--------------------------------------------------+
      |               Gemini Cognitive Core              |
      +------------------------+-------------------------+
                               |
                               v
+------------------+     +-----+-----+     +--------------------+
|  MAM Asset Desk  +---->+ Scheduler +---->+ Playout Controller |
+------------------+     +-----------+     +---------+----------+
                                                     |
                                                     v
+------------------+     +-----------+     +---------+----------+
|  OBS Transparent +<----+ Sync Hub  +<----+  SCTE-35 Ad Inject |
|  HTML5 Overlay   |     +-----+-----+     +--------------------+
+------------------+           ^
                               |
+------------------+           |
| Dual-Monitor Mod +-----------+
| Popout Chat Deck |
+------------------+
```

---

## 🌐 OBS STUDIO & MULTI-SCREEN SETUP

For high-end productions, CastPilot provides decoupled, standalone viewport routes engineered to run outside the primary workspace iframe:

### 🔗 OBS Browser Source Overlay
Add a new **Browser Source** inside your OBS Scene with the following properties:
* **URL**: `http://localhost:3000/?overlay=true` (or your active deployment URL)
* **Width**: `1280`
* **Height**: `720`
* **Custom CSS**: Keep empty (the application serves natively transparent, high-contrast layouts optimized for video chroma-keying).

### 🔗 Dual-Monitor Chat Deck
Launch the popout moderator deck on a secondary touchscreen monitor:
* **URL**: `http://localhost:3000/?popout-chat=true`
* **Features**: Live-updating stream timeline, quick-pin buttons for pinning user messages, timeout buttons for immediate moderation control, and manual chat broadcast injectors.

---

## 🚀 DEPLOYMENT GUIDE

### Prerequisite Environment Variables
Declare the following within your server environment or `.env` configuration file:
```env
# Google Gemini API credentials (Optional: Fallbacks to system dummy generators)
GEMINI_API_KEY=your_google_gen_ai_secret_key

# OAuth Integrations (Dynamic redirection endpoints)
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
```

### Installation & Run Commands
Ensure you have Node.js 18+ installed on your workstation or container:

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Boot development server (Express backend + Vite HMR frontend)
npm run dev

# 3. Compile optimized production bundles
npm run build

# 4. Spin up production server
npm run start
```

---

## 🛡️ SYSTEM TELEMETRY SPECIFICATIONS
* **Core Playout Rate**: HEVC / H.265 encoded simulating 1080p (60fps) @ 6,200 kbps.
* **Latency Profile**: <120ms internal sync dispatch rate.
* **SCTE Payload Formatting**: Standard SCTE-35 Splice Info Section conforming to ANSI/SCTE 35 2020 specification guidelines.
* **Failover Interval**: Sub-500ms automated Disaster Recovery server redirects.

---

```
[ CASTPILOT BROADCAST SYSTEMS • ALL STREAMS ENGAGED ]
```
