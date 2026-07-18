# CastPilot - Executive Producer's Broadcast Academy & Manual

CastPilot is a state-of-the-art, 24/7 Free Ad-Supported Streaming TV (FAST) playout, linear scheduling, live scriptwriting, and audience engagement platform. This manual details everything you need to successfully launch, operate, schedule, and monetize professional-grade live linear feeds or customized FAST TV channels.

---

## 1. Core Architecture: How CastPilot Works

Traditional Streaming (VOD) relies on users clicking to play a specific video. In contrast, **CastPilot is a linear broadcast system**. It schedules programs, commercials, and visual overlays sequentially on a continuous 24/7 clock, simulating a traditional television cable channel.

### The Three Pillars of CastPilot Playout:
1. **Asset Management (MAM)**: Registering and enriching programs, identifiers (idents), sponsor spots, and advertisements with precise duration boundaries.
2. **AI Sequence Builder**: Aligning sequences to remove black-screen timeline gaps and automatically insert commercial placements conforming to traditional TV block ratios.
3. **Syndication and Engagement**: Outputting HLS and RTMP streams while managing real-time audience engagement mechanics (dynamic scrolling tickers, voting overlays, follow alerts).

---

## 2. Dynamic Feature & Tab Masterclass

### 📊 Dashboard
The centralized cockpit for monitoring your broadcast health.
* **On-Air Stream Monitor**: Tracks active linear playback, highlighting the current program name, playtime percentage, stream stability, and frame pacing.
* **Stream Failover Skippers**: Skip program segments or commercial spots instantly to adapt to real-time events.
* **Diagnostic Alarms**: Monitors broadcast constraints and alarms for timeline blocks, licensing breaches, and network overruns.
* **Ad Yield Diagnostics**: Track dynamic CPM (Cost Per Mille) payouts, filled ad spots, and total ad-revenue metrics.

### 🗓️ AI Scheduling Tab
Generate error-free, continuous broadcast schedules in seconds using Gemini AI.
* **Natural Language Structuring**: Enter creative prompts such as *"Program a 3-hour evening line-up focusing on tech history with educational commercial bumpers"* to layout perfect grids.
* **Gap Filling Algorithm**: If durations don't align perfectly with the hour, click **"Fill Playlist Gaps"**. The system selects correct-duration branding idents or commercial bumpers from the MAM catalog to fill gaps, keeping the video players stable.

### 🎥 Show Scripts & Teleprompter Studio
Equip physical hosts, news anchors, and presenters with highly visible teleprompting and scripting software.
* **Gemini Showremark Copilot**: Generate speech-optimized scripting remarks in seconds. Select presenting vibes from Casual to Authoritative or Vintage/Retro.
* **Mirror Glass Horizontals**: Turn on horizonal mirror-reversal to place the app directly on physical teleprompter ring-mounts and beam-splitter hardware glass.
* **Yellow-Coat Mode**: Active yellow-on-black display mode to eliminate host eye-strain during prolonged recording sessions.

### 💬 Audience Overlays & Chat
Increase viewer engagement and retention metrics by introducing visual graphics over standard video frames.
* **News Ticker Crawlers**: Customize breaking news tickers scrolling at the bottom margins of your streams.
* **Interactive Live Polls**: Configure instant questions and multiple choices, with interactive feedback panels for voters.
* **Engagement Soundboards**: Simulate subscribing alerts and follow animations to increase user-channel bonds.
* **Urgent On-Air Bulletins**: Broadcast critical service messages (e.g., programming interruptions, schedule shifts, technical faults) instantly. From the **Urgent Bulletins** sub-tab in the Overlay Graphic Studio, compose your alert text, select a style (*Breaking News*, *Urgent Alert*, or *Technical Bulletin*), and click **○ PUSH TO ON-AIR** to overlay it. Supports integrated browser Text-to-Speech (TTS) for voice warning synthesis.

### ⚡ Resource Allocator
Ensure server nodes are balanced during peak stream traffic.
* **CPU/GPU Allocation**: Safely scale encoder capacity on primary nodes to prevent frames dropping.
* **Bitrate Throttling**: Hot-swap broadcast quality dynamically during diagnostic alerts.

### 📡 Streaming & VOD (Syndication)
Syndicate your live outputs to massive multi-stream destinations simultaneously.
* **Multi-Destination Targets**: Sync Twitch, YouTube Live, and custom RTMP nodes.
* **HLS Manifest Export**: Fetch live .m3u8 streaming links to embed inside external web players.

---

## 3. Success Blueprints & Strategic playbooks

### 📱 Blueprint A: The Independent Presenter Rig
* **Goal**: Maximize focus during solo podcasting or live news broadcasting.
* **Workflow**:
  1. Set up your main PC to manage live playouts under the **Dashboard** and **Streaming & VOD** tabs.
  2. Load up the **Show Scripts & Teleprompter** console on a physical tablet or secondary monitor mounted behind your camera.
  3. Keep a mobile phone open to the **Audience Alerts** tab next to you. Click alerts and trigger live poll questions with simple taps while looking directly into the camera lens.

### 📺 Blueprint B: The High-Yield FAST TV Channel
* **Goal**: Optimize programmatic revenue on linear platforms like Pluto TV, Roku, or Samsung TV Plus.
* **Workflow**:
  1. Maintain an ad-to-program ratio of exactly **15%**. Structure programs around 45-minute blocks.
  2. Schedule 2-minute sponsor bumpers using the **AI Sequence Builder**.
  3. Monitor your active yields on the **Dashboard** to prioritize high-CPM categories (e.g., tech and finance sponsors) under the Asset Catalog.

### 🏢 Blueprint C: Multi-Destination Corporate Networks
* **Goal**: Distribute training materials or corporate keynotes smoothly.
* **Workflow**:
  1. Load VOD corporate assets into the Media Library (MAM) with precise category taggings.
  2. Use **AI Scheduling** to generate full weekly schedules.
  3. Syndicate the playout stream to your internal RTMP and public-facing YouTube channels concurrently.
  4. Fill intermission segments with company logos and mission statements using **Playlist Fillers** to eliminate black-screen gaps.

---

## 4. Troubleshooting and Diagnostics

### Issue 1: Overlapping timeline conflicts
* **Symptom**: Red alarm alerts show up on the Dashboard under diagnostic logs.
* **Solution**: Head over to the **AI Scheduling** tab. Look for duration mismatches on the grid, and click **"Fill Playlist Gaps"** or delete the conflicting element manually by clicking the trash icon.

### Issue 2: Stream buffering or dropped frames
* **Symptom**: Video player is laggy, or Resource Allocator alerts high CPU utilization.
* **Solution**: Check the **Resource Allocator**. Scale up the allocated server nodes, or reduce the broadcast stream bitrate under **Setup & Logins** from 1080p60 down to 720p30.
