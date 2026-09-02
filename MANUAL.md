# CastPilot Enterprise Playout & Broadcast Suite — User Manual & Field Guide

> **Written for Everyone**: Whether you are an experienced television engineer, an executive producer, a live streamer, a church broadcaster, or an absolute beginner launching your very first internet TV channel, this manual explains every part of CastPilot in simple, clear, everyday language.

---

## 🌟 Table of Contents
1. [Welcome: What is CastPilot? (The Plain-English Explanation)](#1-welcome-what-is-castpilot)
2. [5-Minute Quick Start: Launch Your First Broadcast in 5 Steps](#2-5-minute-quick-start)
3. [Understanding the Top Navigation & Studio Header](#3-understanding-the-top-navigation--studio-header)
4. [Complete Walkthrough of Every Studio Screen](#4-complete-walkthrough-of-every-studio-screen)
   - [4.1 Playout Control Room (The Main Video Switcher)](#41-playout-control-room)
   - [4.2 TV Schedule & Lineup Manager](#42-tv-schedule--lineup-manager)
   - [4.3 Multi-Camera Studio (NDI, PTZ & Replays)](#43-multi-camera-studio)
   - [4.4 Scriptwriting & Hardware Teleprompter](#44-scriptwriting--hardware-teleprompter)
   - [4.5 Audience Graphics, Tickers & Live Polls](#45-audience-graphics-tickers--live-polls)
   - [4.6 Media Asset Manager (MAM & Video Library)](#46-media-asset-manager)
   - [4.7 Broadcast Standards & Sound Level Normalizer](#47-broadcast-standards--sound-level-normalizer)
   - [4.8 Streaming, FAST Syndication & Advertising](#48-streaming-fast-syndication--advertising)
   - [4.9 Cloud Setup, Backups & Channel Profiles](#49-cloud-setup-backups--channel-profiles)
5. [The Gemini 3.8 Flash AI Suite (Your Digital Co-Producer)](#5-the-gemini-38-flash-ai-suite)
6. [Emergency Procedures: What To Do If Something Goes Wrong](#6-emergency-procedures)
7. [Connecting to OBS Studio, YouTube, Twitch & Live Displays](#7-connecting-to-obs-studio-youtube-twitch--live-displays)
8. [Broadcast Terms Demystified (Plain-English Glossary)](#8-broadcast-terms-demystified-plain-english-glossary)
9. [Frequently Asked Questions (FAQ)](#9-frequently-asked-questions-faq)

---

## 1. Welcome: What is CastPilot?

Think of **CastPilot** as having an entire television broadcast studio, satellite transmission truck, and automated programming department packed into a single, easy-to-use web application.

### The Difference Between YouTube/Netflix and CastPilot
* **On-Demand Video (YouTube/Netflix/VOD)**: Viewers browse a catalog, click a video, and hit play. When the video ends, playback stops.
* **Linear TV (CastPilot/Cable/FAST)**: Content runs on a continuous, 24-hours-a-day, 7-days-a-week schedule. When a viewer tunes in, a show is already playing, followed automatically by the next show, commercials, news bulletins, and station announcements without anyone having to click "play next".

CastPilot allows you to:
1. **Schedule a 24/7 TV channel** with zero awkward black screens or gaps between shows.
2. **Switch between multiple live studio cameras**, pan-tilt-zoom PTZ cameras, and trigger instant sports-style replays.
3. **Use a real-time teleprompter** on your phone, tablet, or monitor with speech-optimized AI scripts.
4. **Overlay live graphics**, like breaking news tickers at the bottom of the screen, live audience voting polls, and emergency alerts.
5. **Make money with automatic commercial breaks** (SCTE-35 digital ad insertion) compatible with platforms like Pluto TV, Samsung TV Plus, Roku, and YouTube.
6. **Ensure your audio and video are 100% legal** and compliant with broadcast regulations (FCC Title 47, CALM Act commercial loudness, and OFCOM standards).

---

## 2. 5-Minute Quick Start: Launch Your First Broadcast in 5 Steps

If you've never used a broadcast system before, follow these five easy steps:

```
[Step 1: Check Assets] ──> [Step 2: Generate Lineup] ──> [Step 3: Harmonize Rundown] ──> [Step 4: Preview Stream] ──> [Step 5: Go On-Air]
```

### Step 1: Check Your Media Library
1. Click the **Media (MAM)** tab in the top navigation.
2. You will see sample TV shows, sponsor commercials, and short station bumpers.
3. You can click any video's **PFL (Pre-Fade Listen)** button to preview the video and listen to its audio privately without interrupting the live broadcast.

### Step 2: Create a Lineup with AI
1. Click the **TV Schedule** tab in the top navigation.
2. Type a topic in the AI Prompt box (for example: *"Create an exciting evening lineup featuring nature documentaries and tech news"*).
3. Select your pacing (e.g., 30-minute blocks) and click **"Generate Linear Schedule"**.
4. Within seconds, you have a complete chronological lineup of shows and commercial breaks!

### Step 3: Run the AI Rundown Doctor
1. Click the **"🩺 AI Rundown Doctor"** button above your schedule.
2. The AI will inspect every minute of your lineup. If there is a 15-second gap between two shows, it will detect it and automatically insert a station bumper or commercial to ensure uninterrupted continuous playback.
3. Click **"Apply Harmonized Rundown"**.

### Step 4: Preview Your Channel
1. Click the **Playout MCR** tab in the top navigation.
2. In the center is your live TV monitor. You will see your active show playing, complete with the countdown clock, audio VU meters, and on-air graphic overlays.

### Step 5: Go On-Air to the World
1. Click the **Syndication** tab in the top navigation.
2. Toggle on any destination (like **Pluto TV**, **Samsung TV Plus**, or your **Custom RTMP/HLS feed**).
3. Your channel is now live 24/7!

---

## 3. Understanding the Top Navigation & Studio Header

The header bar stays at the top of your screen at all times. Here is what every button and indicator does:

| Control | What It Does |
|---|---|
| **CastPilot Logo** | Displays the current software edition and station identifier. |
| **Search Bar (Omnibox)** | Search across all videos, scheduled programs, server resources, and diagnostic alerts instantly. Press `Enter` on any result to jump right to it. |
| **Language Selector (🌐)** | Switch the entire interface between **English (EN)**, **Spanish (ES - Español)**, and **French (FR - Français)**. |
| **Theme Toggle (☀️ / 🌙)** | Switch between **Day Studio Mode** (crisp high-contrast light layout for brightly lit offices) and **Night Master Control Mode** (deep dark navy palette to reduce eye fatigue in dark control rooms). |
| **System Safe / Alarms (🛡️)** | Shows a green badge when all systems are operating normally, or a pulsing red alert if there is a scheduling conflict or dropped frame. |
| **UTC Master Clock** | A millisecond-accurate synchronized broadcast clock. In television, everything runs on Universal Coordinated Time (UTC) so all time zones stay in sync. |
| **Failover Server (Primary / Backup)** | Allows you to switch to your backup redundant server with a single click if the primary network has an outage. |
| **SCTE-35 Status** | Confirms whether digital commercial cue markers are armed and ready to trigger ad replacements. |
| **ST 2059 PTP: LOCKED** | Confirms that your studio video feeds are locked to the microsecond GPS clock, preventing screen tearing during camera cuts. |
| **Quick Nav Tabs** | Click any tab to jump directly between Playout, Scheduler, Multi-Cam, Teleprompter, Overlays, Media, Standards, and Syndication. |

---

## 4. Complete Walkthrough of Every Studio Screen

---

### 4.1 Playout Control Room (The Main Video Switcher)

**What this is**: This is the heart of your broadcast. It looks like the main control desk of a major television network.

#### Key Features Explained Simply:
1. **PGM (Program) vs. PVW (Preview)**:
   - **PGM (Program - Red Outline)**: This is what your viewers are seeing right now on their television screens or streaming apps. Never touch PGM unless you are ready for viewers to see it immediately!
   - **PVW (Preview - Green Outline)**: This is your private rehearsal screen. You can queue up the next video or camera angle here to make sure it looks good before sending it out to the audience.
2. **TAKE Button**:
   - Swaps Preview into Program with a smooth broadcast transition.
3. **Multi-Viewer Matrix (1x1, 2x2, 3x3)**:
   - Switch between viewing a single large monitor, a 4-window split screen, or a 9-camera wall showing all your cameras, graphics, and video playback at once.
4. **🚨 EMERGENCY SLATE (Kill Switch)**:
   - If a live guest swears, a camera cable gets kicked, or an unexpected technical failure occurs, click the bright red **"EMERGENCY SLATE"** button.
   - The stream immediately cuts away from the live feed to an official *"Technical Difficulties — We Will Be Right Back"* station graphic with soothing background music until your operator clicks *"Restore Live Feed"*.
5. **🚨 EAS (Emergency Alert System)**:
   - Emulates the government Emergency Alert System required for public broadcast stations. Clicking **"Trigger EAS Alert"** sounds the authentic dual-frequency alert siren (853 Hz & 960 Hz) and displays a full-screen red warning banner with emergency voice narration.
6. **Insert Commercial (SCTE-35 Splice)**:
   - Click this to manually inject a 30-second, 60-second, or 120-second commercial break into the stream. Downstream platforms (like Roku or Pluto TV) will immediately replace your screen with personalized localized ads for each viewer.

---

### 4.2 TV Schedule & Lineup Manager

**What this is**: The digital calendar that organizes what plays on your channel every minute of the day.

#### Key Features Explained Simply:
1. **AI Lineup Generator**:
   - Tell the AI what kind of channel you want to create, pick your target audience, and it writes out a full 24-hour schedule for you.
2. **AI Rundown Doctor**:
   - The smartest tool in the scheduler. If you manually move a 45-minute show into an hour slot, there would normally be a 15-minute black screen. The AI Rundown Doctor analyzes the timing and automatically schedules short station logos, weather updates, or sponsor bumpers to make the hour end exactly on time.
3. **Drag-and-Drop Reordering**:
   - Simply click and drag any show up or down to change the order of your programming.
4. **Export EPG (Electronic Program Guide - XMLTV)**:
   - Generates the standard TV Guide file (`.xml`) that cable boxes, Smart TVs, and streaming apps read to display show titles, descriptions, and start times on the viewer's on-screen guide.

---

### 4.3 Multi-Camera Studio (NDI, PTZ & Replays)

**What this is**: A complete live multi-camera production switcher for live shows, talk shows, newsrooms, sports events, and concerts.

#### Key Features Explained Simply:
1. **4 Live Camera Feeds**:
   - View Cam 1 (Wide Studio Shot), Cam 2 (Host Close-up), Cam 3 (Guest Camera), and Cam 4 (Overhead / Mobile Camera) simultaneously with real-time video simulation.
2. **Tally Lights (Red & Green)**:
   - In professional TV, tally lights tell presenters which camera to look at.
   - **RED Tally**: That camera is LIVE on air (PGM). Look at this camera!
   - **GREEN Tally**: That camera is NEXT in line on Preview (PVW). Get ready!
3. **PTZ Joystick (Pan, Tilt, Zoom)**:
   - Use the virtual joystick to smoothly turn cameras left/right, tilt up/down, and zoom in/out remotely without having a camera operator standing in the room. Includes 4 quick preset buttons (Wide, Host Close-Up, Guest, Overhead).
4. **AI Auto-Framing Keyer**:
   - Turn this on to let the AI act as an automated camera operator. When the host speaks, the camera smoothly zooms in on the host. When the guest responds, the camera shifts focus to the guest.
5. **Instant Replay Caster**:
   - Perfect for sports or dramatic moments! Click **"REPLAY"** to immediately cue up the last 15 seconds at 0.5x slow-motion with a professional on-screen "INSTANT REPLAY" graphic bug.
6. **Intercom / IFB Talkback Matrix**:
   - Lets the director in the control room whisper instructions into the presenter's earpiece (IFB) without the viewers hearing anything on the main broadcast.

---

### 4.4 Scriptwriting & Hardware Teleprompter

**What this is**: A tool for news anchors, podcast hosts, and presenters to read their scripts smoothly while looking directly into the camera lens.

#### Key Features Explained Simply:
1. **Gemini AI Scriptwriter**:
   - Type a topic (like *"Introduce our special guest chef and promote our sponsor coffee"*). Choose your desired tone (**Authoritative News**, **Casual Friendly**, **Energetic Hype**, or **Retro Vintage**). The AI writes a teleprompter script formatted with cues like `[PAUSE]`, `[SMILE]`, and `[LOOK TO CAM 2]`.
2. **AI Compliance Screening (FCC / OFCOM)**:
   - Click the **"🛡️ Compliance Audit"** button. The AI reads your script and flags any potential profanity, defamation, unverified medical claims, or missing sponsorship disclosures, giving you an official Pass/Warning report before you go live.
3. **Mirror Glass Mode**:
   - If you place your iPad, phone, or monitor underneath real optical teleprompter glass (a beam-splitter mirror), the text will appear backwards to the eye. Clicking **"MIRROR GLASS"** flips the text horizontally so it looks completely normal when reflected on the mirror.
4. **Yellow-Coat Mode**:
   - Shifts the prompter text from white to high-visibility studio yellow on a pure black background. In television studios with bright studio lights, yellow text is much easier on the anchor's eyes and eliminates reading fatigue.
5. **Adjustable Scroll Speed**:
   - Use the slider or keyboard up/down arrows to control how fast the text scrolls down the screen.

---

### 4.5 Audience Graphics, Tickers & Live Polls

**What this is**: Adds interactive on-screen graphics over your video feed to keep viewers engaged and increase retention.

#### Key Features Explained Simply:
1. **Live News Ticker Tape**:
   - A smooth scrolling headline bar at the bottom of the screen, just like CNN or BBC News. You can type breaking news headlines, stock updates, or sponsor promotions.
2. **AI Engagement Synthesizer**:
   - Stuck on what to write? Click **"AI Synthesize"**, type a general topic, and the AI automatically writes 5 engaging ticker headlines, a fun viewer voting poll, and a broadcast trivia question!
3. **Interactive Live Polls**:
   - Launch a question with 2 to 4 choices on screen (e.g., *"Who will win tonight's game?"*). As viewers vote, the percentage bars animate live on the screen.
4. **Urgent On-Air Bulletins**:
   - For special announcements (e.g., *"Weather Alert"*, *"Programming Delayed"*), toggle an urgent bulletin that overlays a bold banner at the top of the screen with optional computer voice narration (Text-to-Speech).
5. **Soundboard & Follow Alerts**:
   - Trigger playful animations and sounds (cheering, applause, breaking news chimes) when someone follows or subscribes to your channel.

---

### 4.6 Media Asset Manager (MAM & Video Library)

**What this is**: Where all your video files, commercials, station idents, and music tracks are stored and organized.

#### Key Features Explained Simply:
1. **Catalog Classification**:
   - Categorize files as **Programs** (main shows), **Commercials** (paid ads), **Idents** (station logos), or **Fillers** (short clips used to fill timing gaps).
2. **Pre-Fade Listen (PFL)**:
   - In television studios, sound engineers need to listen to a video before putting it on the air. Clicking **PFL** opens an audition player where you can check the video, view its technical details, and listen to the audio through your headphones without playing it to the live audience.
3. **AI SCTE-35 Ad Break Finder**:
   - Instead of randomly cutting a movie in half right in the middle of a sentence, click **"AI Optimize Ad Breaks"**. The AI analyzes the narrative and places commercial markers at natural scene transitions, fade-to-blacks, or quiet pauses.
4. **AI Multilingual Subtitle Generator (CEA-708)**:
   - Select any video and click **"Generate AI Subtitles"**. The AI creates broadcast-compliant closed captions in **English**, **Spanish**, and **French**. You can preview the synchronized text and download the ready-to-use `.vtt` caption file.
5. **AI Metadata & FCC Rating**:
   - Automatically writes a professional TV guide synopsis, generates search tags, and suggests an official TV parental rating (e.g., TV-G, TV-PG, TV-14, TV-MA).

---

### 4.7 Broadcast Standards & Sound Level Normalizer

**What this is**: The engineering suite that guarantees your channel complies with government broadcast laws and sounds balanced.

#### Key Features Explained Simply:
1. **The CALM Act & Loudness Normalization (ITU-R BS.1770 / EBU R128)**:
   - *Ever notice how on bad TV channels, the commercials are 10 times louder than the movie, blasting your ears?* In the United States and Europe, that is illegal under the **CALM Act** and **EBU R128**.
   - CastPilot's sound engine continuously monitors the audio loudness in **LUFS** (Loudness Units Full Scale) and automatically normalizes all audio to **-24 LKFS / -23 LUFS**. Whether you play a quiet documentary or an energetic car commercial, the volume stays smooth and consistent.
2. **PTP Clock Genlock (SMPTE ST 2059-2 / IEEE 1588)**:
   - When switching between digital video feeds, if the camera clocks are off by even a fraction of a millisecond, the screen will flicker or tear. CastPilot locks all streams to an ultra-precise microsecond timekeeper (PTP), guaranteeing zero-frame clean cuts.
3. **Hitless Network Redundancy (SMPTE ST 2022-7)**:
   - Sends your live stream simultaneously down two separate internet lines (Path Red and Path Blue). If a backhoe digs up the cable on Path Red, the system instantly grabs the packets from Path Blue with zero dropped frames. Viewers at home won't even notice a hiccup.
4. **As-Run Broadcast Audit Log**:
   - Generates a legally binding timestamped record showing every single commercial, show, and sponsor message that aired, down to the exact second. This is what you hand to advertisers to prove their commercial actually played so you get paid!

---

### 4.8 Streaming, FAST Syndication & Advertising

**What this is**: Where you connect your channel to the outside world to reach millions of viewers and monetize your programming.

#### Key Features Explained Simply:
1. **FAST Channel Connectors**:
   - One-click toggles to stream your channel to major Free Ad-Supported Streaming TV networks:
     - **Pluto TV**
     - **Samsung TV Plus**
     - **The Roku Channel**
     - **Amazon Freevee**
2. **Live Multi-Streaming (YouTube, Twitch, Custom RTMP)**:
   - Stream simultaneously to public platforms. Simply paste your Stream Key and RTMP URL, toggle the switch to ON, and your stream will be broadcast to all platforms at once.
3. **HLS Web Player Embed Link**:
   - Copies a direct `.m3u8` link that you can put into your own website, WordPress blog, or mobile app so visitors can watch your TV channel directly in their browser.
4. **Programmatic Ad Yield Dashboard**:
   - Tracks your revenue performance: impressions served, average CPM (how much advertisers pay per 1,000 views), fill rates, and total estimated earnings.

---

### 4.9 Cloud Setup, Backups & Channel Profiles

**What this is**: Manage your channel settings, multi-channel profiles, and backup configurations.

#### Key Features Explained Simply:
1. **Multi-Channel Network (MCN)**:
   - Easily switch between managing different channels (e.g., *FAST Entertainment*, *News 24 Live*, *Sports HD 1*, and *Music Vault 4K*).
2. **User Roles & Access Control (RBAC)**:
   - Assign permission roles to team members:
     - **Technical Director (TD)**: Full control over cameras, switching, and emergency slates.
     - **Traffic Manager**: Controls schedules, commercials, and sponsor lineup.
     - **Audio Engineer**: Manages microphones, loudness levels, and soundboard effects.
     - **MCR Lead Operator**: Master control room administrator with complete studio access.
3. **Stream Resolution & Encoders**:
   - Choose your broadcast output: 1080p60 Full HD, 720p30, or 4K UHD (2160p).

---

## 5. The Gemini 3.8 Flash AI Suite

CastPilot includes a built-in digital co-producer powered by Google Gemini 3.8 Flash. Here is a quick cheat-sheet of every AI feature:

| AI Feature | Where to Find It | What It Does For You |
|---|---|---|
| **AI Rundown Doctor** | TV Schedule Tab | Analyzes your entire schedule, detects gaps or timing mismatches, and harmonizes the lineup with zero black-screen frames. |
| **AI Scriptwriter Copilot** | Teleprompter Tab | Writes teleprompter anchor dialogue tailored to your chosen tone (News, Casual, Energetic, Retro). |
| **AI Compliance Auditor** | Teleprompter Tab | Scans scripts against FCC Title 47 Part 73, OFCOM, and defamation laws to catch legal risks before you go live. |
| **AI Ad Break Optimizer** | Media (MAM) Tab | Detects natural scene changes in movies to place SCTE-35 ad break cues without cutting actors off mid-sentence. |
| **AI Subtitle Generator** | Media (MAM) Tab | Transcribes and generates FCC 79.1 compliant closed captions in English, Spanish, and French with WebVTT export. |
| **AI Engagement Synthesizer** | Overlays Tab | Generates news crawl ticker headlines, viewer decision polls, and broadcast trivia quizzes based on your topic. |
| **AI MAM Auto-Enricher** | Media (MAM) Tab | Summarizes videos into TV Guide synopses, extracts search tags, and calculates TV parental ratings automatically. |

---

## 6. Emergency Procedures: What To Do If Something Goes Wrong

In live broadcasting, unexpected things happen. Here is your quick emergency response guide:

### Scenario 1: A live presenter swears, a guest falls, or an offensive video plays
1. **Action**: Immediately click the bright red **"🚨 EMERGENCY SLATE"** button on the Playout screen.
2. **What happens**: The broadcast instantly cuts to an attractive *"Technical Difficulties"* card with music. Viewers will not see or hear the live incident.
3. **Recovery**: Once the issue is resolved on set, click **"Restore Live Feed"** to smoothly return to your show.

### Scenario 2: Severe weather, breaking crisis, or government emergency
1. **Action**: Go to the **Audience Alerts** tab and open **Urgent Bulletins**, or on the **Playout** tab click **"Trigger EAS Alert"**.
2. **What happens**: The screen sounds the standard two-tone emergency buzzer and displays the red warning scroll with automated speech.
3. **Recovery**: Click **"Clear EAS Alert"** when the advisory has passed.

### Scenario 3: The schedule shows a red alarm for "Timeline Gap"
1. **Action**: Go to the **TV Schedule** tab and click **"🩺 AI Rundown Doctor"**.
2. **What happens**: The AI finds the empty space between shows and inserts a matching station ident or commercial bumper.
3. **Recovery**: Click **"Apply Harmonized Rundown"**. The red alarm will turn into a green "BROADCAST SAFE" badge.

### Scenario 4: A live camera feed freezes or drops out
1. **Action**: On the **Multi-Cam** or **Playout** switcher, click Cam 1 or Cam 2 to cut away from the broken camera feed.
2. **Action**: Use the **Intercom IFB Talkback** to inform your camera crew to check their NDI/SDI network cable.

---

## 7. Connecting to OBS Studio, YouTube, Twitch & Live Displays

### Using CastPilot with OBS Studio
CastPilot offers dedicated **Standalone Popout Viewports** engineered specifically for OBS Studio browser sources:

1. **Transparent Graphic Overlay for OBS**:
   - In your browser, open: `https://your-app-url/?overlay=true`
   - In OBS Studio, add a new **Browser Source**.
   - Paste the URL and check **"Shutdown source when not visible"**.
   - Your scrolling news ticker, live polls, and on-air bugs will appear smoothly over your OBS video with an ultra-clean transparent background!
2. **Standalone Live Chat Popout**:
   - Open: `https://your-app-url/?popout-chat=true`
   - Place this window on a secondary monitor or mobile tablet for your chat moderator to approve viewer questions.

### Connecting to YouTube Live & Twitch
1. In YouTube Studio or Twitch Creator Dashboard, copy your **Server URL (RTMP)** and **Stream Key**.
2. In CastPilot, go to the **Syndication** tab.
3. Paste the URL and Stream Key into the matching platform card.
4. Switch the toggle from **OFF** to **ON**. Your stream is now live on the platform!

---

## 8. Broadcast Terms Demystified (Plain-English Glossary)

| Technical Term | What It Actually Means in Plain English |
|---|---|
| **PGM (Program)** | The output that is currently broadcasting live to your audience. |
| **PVW (Preview)** | The private rehearsal monitor only seen by the director in the control room. |
| **FAST** | *Free Ad-Supported Streaming TV*. 24/7 linear streaming channels with commercials, like Pluto TV, Samsung TV Plus, or Roku Channel. |
| **SCTE-35** | Digital cue markers buried inside video streams that tell streaming platforms: *"Start playing a localized commercial right now for 30 seconds"*. |
| **SCTE-104** | The studio-level hardware command that injects SCTE-35 cues into baseband SDI or uncompressed IP video. |
| **NDI** | *Network Device Interface*. High-definition video transmitted over standard office Ethernet cables instead of bulky SDI cables. |
| **PTZ** | *Pan, Tilt, Zoom*. A motorized robotic camera that can be aimed and zoomed remotely using a joystick. |
| **PTP (IEEE 1588 / ST 2059)** | *Precision Time Protocol*. A microsecond-accurate digital clock that keeps all studio cameras perfectly in sync so cuts don't stutter. |
| **CALM Act / EBU R128** | Laws requiring television commercials to be the exact same volume as the movies so viewers' ears aren't blasted. |
| **LUFS / LKFS** | The scientific unit used to measure human loudness perception. CastPilot keeps this locked at -24 LKFS / -23 LUFS. |
| **Ident (Station ID)** | A 5-to-15 second video showing your TV station logo and channel name. |
| **Bumper** | A short 5-to-10 second video announcing *"We'll be right back after these messages"*. |
| **EPG / XMLTV** | The electronic TV Guide file that shows what programs are playing at what time on Smart TV screens. |
| **As-Run Log** | The official legal proof-of-performance log documenting every program and commercial that actually played on air. |
| **IFB (Interrupted Foldback)** | The little earpiece worn by TV anchors so the control room director can talk directly into their ear. |
| **Tally** | The small red light on top of a camera that turns on when that camera is live on air. |

---

## 9. Frequently Asked Questions (FAQ)

#### Q: Do I need expensive broadcast hardware to use CastPilot?
**A**: No! CastPilot runs entirely in modern web browsers (Chrome, Edge, Safari, Firefox). You can schedule channels, run teleprompters, generate AI scripts, and syndicate streams from any laptop, desktop PC, or tablet.

#### Q: Can I run this on physical teleprompter glass?
**A**: Yes! In the **Teleprompter** tab, click **"MIRROR GLASS"**. It instantly reverses the script horizontally so that when it reflects off the beam-splitter mirror mounted in front of your camera, the host can read it naturally.

#### Q: Can I use this for non-commercial or church broadcasts?
**A**: Absolutely. You can turn off the SCTE-35 ad break insertions completely in the **Syndication** settings. The AI Scheduler and gap filler will use your custom church announcements, scripture readings, or station logos instead of commercial ads.

#### Q: Why is the screen showing a green "BROADCAST SAFE" badge?
**A**: This means CastPilot has verified that your schedule has no overlapping shows, no black-screen gaps, your audio volume is compliant with the CALM Act, and your stream connection is stable. You are ready to broadcast!

---

*CastPilot Broadcast Operating System — Engineered by Jesse Lepota at Perp Corp Media.*
