import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Radio, Tv, Database, Volume2, ShieldAlert, BadgeInfo } from 'lucide-react';
import { ScheduleItem } from '../types';

interface PlayoutControllerProps {
  schedules: ScheduleItem[];
  primaryActive: boolean;
  onSkip: () => void;
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

export default function PlayoutController({ schedules, primaryActive, onSkip }: PlayoutControllerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(38); // percentage elapsed
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(684); // 11m 24s
  const [adTriggered, setAdTriggered] = useState<boolean>(false);
  const [scteStatus, setScteStatus] = useState<string>('Idle / Monitoring');
  const [engagementState, setEngagementState] = useState<OverlayState | null>(null);
  const [flickerTime, setFlickerTime] = useState<number>(0);

  const currentlyPlaying = schedules.find((s) => s.status === 'playing') || {
    title: "Off-Air / Interstitial Slide",
    type: "filler" as const,
    duration: 10,
    targetAudience: "General Rotation",
    aiRationale: "Static placeholder during off-peak downtime."
  };

  const nextQueued = schedules.filter((s) => s.status === 'queued')[0] || {
    title: "Standard Broadcast Promo Fill",
    type: "promo" as const,
    duration: 3
  };

  // Keep references to state so the animation loop always reads current values without rebuilding
  const isPlayingRef = useRef(isPlaying);
  const currentlyPlayingRef = useRef(currentlyPlaying);
  const primaryActiveRef = useRef(primaryActive);
  const adTriggeredRef = useRef(adTriggered);
  const engagementStateRef = useRef(engagementState);
  const progressRef = useRef(progress);
  const flickerTimeRef = useRef(flickerTime);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentlyPlayingRef.current = currentlyPlaying; }, [currentlyPlaying]);
  useEffect(() => { primaryActiveRef.current = primaryActive; }, [primaryActive]);
  useEffect(() => { adTriggeredRef.current = adTriggered; }, [adTriggered]);
  useEffect(() => { engagementStateRef.current = engagementState; }, [engagementState]);
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { flickerTimeRef.current = flickerTime; }, [flickerTime]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Poll engagement overlays from server so the monitor remains perfectly in-sync with active graphics
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/engagement/state');
        if (res.ok) {
          const data = await res.json();
          setEngagementState(data);
        }
      } catch (err) {
        console.warn('Unable to reach overlay state endpoint for playout monitor (will retry):', err);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, []);

  // Trigger brief CRT static on program or fallback switch
  const prevTitleRef = useRef(currentlyPlaying.title);
  const prevPrimaryRef = useRef(primaryActive);
  useEffect(() => {
    if (currentlyPlaying.title !== prevTitleRef.current || primaryActive !== prevPrimaryRef.current) {
      setFlickerTime(15); // 15 frames of static glitch
      prevTitleRef.current = currentlyPlaying.title;
      prevPrimaryRef.current = primaryActive;
    }
  }, [currentlyPlaying.title, primaryActive]);

  // Playout ticker simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 0.5;
      });
      setElapsedSeconds((prev) => prev + 5);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Auto skip on completion
  useEffect(() => {
    if (progress >= 100) {
      onSkip();
      setProgress(0);
      setElapsedSeconds(0);
    }
  }, [progress, onSkip]);

  // Master Canvas Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let tickerOffset = 1280;
    
    // VU meter level states
    let leftVu = -40;
    let rightVu = -40;
    let leftPeak = -40;
    let rightPeak = -40;
    let peakHoldCounter = 0;

    // Drawing helpers / animations
    let angle = 0;
    let terrainOffset = 0;
    let gridOffset = 0;

    const W = 1280;
    const H = 720;

    // Set internal canvas scale once (renders in crisp HD, scaled by CSS responsive aspect-ratio)
    canvas.width = W;
    canvas.height = H;

    const drawFrame = () => {
      angle += 0.01;
      gridOffset = (gridOffset + 1.5) % 40;
      
      // Clear
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, W, H);

      const currentlyPlayingLocal = currentlyPlayingRef.current;
      const isPlayingLocal = isPlayingRef.current;
      const primaryActiveLocal = primaryActiveRef.current;
      const adTriggeredLocal = adTriggeredRef.current;
      const engagementStateLocal = engagementStateRef.current;
      const currentProgress = progressRef.current;
      const currentFlicker = flickerTimeRef.current;

      // Handle Decrement flicker ref/state
      if (currentFlicker > 0) {
        setFlickerTime((f) => Math.max(0, f - 1));
      }

      if (!primaryActiveLocal) {
        // DISASTER RECOVERY MODE: SMPTE Color Bars + Glitch
        const bars = ['#e2e8f0', '#f59e0b', '#06b6d4', '#10b981', '#ec4899', '#ef4444', '#3b82f6'];
        const barW = W / 7;
        
        // 1. Vertical main colors
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = bars[i];
          ctx.fillRect(i * barW, 0, barW, 480);
        }

        // 2. Middle blocks (short row)
        const midBars = ['#3b82f6', '#090d16', '#ec4899', '#090d16', '#06b6d4', '#090d16', '#e2e8f0'];
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = midBars[i];
          ctx.fillRect(i * barW, 480, barW, 60);
        }

        // 3. Bottom blocks
        ctx.fillStyle = '#040815'; // black
        ctx.fillRect(0, 540, barW * 1.5, 180);
        ctx.fillStyle = '#ffffff'; // white
        ctx.fillRect(barW * 1.5, 540, barW * 1.5, 180);
        ctx.fillStyle = '#1e1b4b'; // dark indigo
        ctx.fillRect(barW * 3.0, 540, barW * 1.5, 180);
        ctx.fillStyle = '#020617'; // pure black
        ctx.fillRect(barW * 4.5, 540, W - barW * 4.5, 180);

        // Overlay dynamic horizontal snow/interference lines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let i = 0; i < 15; i++) {
          ctx.fillRect(0, Math.random() * H, W, Math.random() * 8 + 1);
        }

        // Red Hazard warning placard
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(W / 2 - 320, H / 2 - 80, 640, 160, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DISASTER RECOVERY OVERRIDE', W / 2, H / 2 - 15);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#fee2e2';
        ctx.fillText('PRIMARY SYNC LOST • ROTATING AUXILIARY NODE LIVE', W / 2, H / 2 + 25);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`CUE POINT SPLICING IDLE • RE-SYNC MANDATED`, W / 2, H / 2 + 55);

      } else if (currentFlicker > 0) {
        // TV SIGNAL FLICKER / SWEEP noise
        for (let y = 0; y < H; y += 8) {
          const shift = Math.sin(angle * 5 + y) * 20;
          ctx.fillStyle = Math.random() > 0.5 ? '#111827' : '#1f2937';
          ctx.fillRect(0, y, W, 8);
          
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.25})`;
          ctx.fillRect(Math.random() * W, y, Math.random() * 150 + 50, 8);
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, Math.random() * H, W, Math.random() * 40 + 10);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LIVE SOURCE SPLICING...', W / 2, H / 2);

      } else {
        // NORMAL PLAYOUT ENVIRONMENT
        
        // Render dynamic animated background depending on content type
        if (currentlyPlayingLocal.type === 'commercial' || adTriggeredLocal) {
          // Energetic Commercial background: rotating radial lines & pulsating color glow
          ctx.fillStyle = '#1e1111'; // Warm maroon
          ctx.fillRect(0, 0, W, H);

          ctx.strokeStyle = 'rgba(239, 68, 68, 0.08)';
          ctx.lineWidth = 25;
          const rays = 18;
          for (let i = 0; i < rays; i++) {
            const rAngle = angle * 0.4 + (i * Math.PI * 2) / rays;
            ctx.beginPath();
            ctx.moveTo(W / 2, H / 2);
            ctx.lineTo(W / 2 + Math.cos(rAngle) * 900, H / 2 + Math.sin(rAngle) * 900);
            ctx.stroke();
          }

          // Pulsating golden orb
          const orbSize = 250 + Math.sin(angle * 3) * 30;
          const g = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, orbSize);
          g.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
          g.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(W / 2, H / 2, orbSize, 0, Math.PI * 2);
          ctx.fill();

          // Sponsor logo graphics in center
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(W / 2 - 240, H / 2 - 90, 480, 180, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('PROGRAMMATIC AD BREAK', W / 2, H / 2 - 15);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '14px monospace';
          ctx.fillText('DOWNSTREAM LIVE INSERTION ACTIVE', W / 2, H / 2 + 25);
          
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`CUE SEGMENT IN PROGRESS: ${Math.round(currentProgress)}%`, W / 2, H / 2 + 55);

        } else if (currentlyPlayingLocal.type === 'promo') {
          // Neon flashing futuristic layout for promos
          ctx.fillStyle = '#110c22'; // deep fuchsia black
          ctx.fillRect(0, 0, W, H);

          ctx.strokeStyle = 'rgba(217, 70, 239, 0.1)';
          ctx.lineWidth = 4;
          for (let i = -10; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(W/2 + i * 80 + Math.sin(angle) * 30, 0);
            ctx.lineTo(W/2 + i * 180 + Math.sin(angle) * 30, H);
            ctx.stroke();
          }

          // Flying neon triangles
          ctx.fillStyle = 'rgba(217, 70, 239, 0.15)';
          ctx.strokeStyle = '#d946ef';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(W / 2 + Math.cos(angle) * 100 - 40, H / 2 + Math.sin(angle) * 80 - 40);
          ctx.lineTo(W / 2 + Math.cos(angle) * 100 + 40, H / 2 + Math.sin(angle) * 80 - 20);
          ctx.lineTo(W / 2 + Math.cos(angle) * 100, H / 2 + Math.sin(angle) * 80 + 40);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.strokeStyle = '#d946ef';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(W / 2 - 200, H / 2 - 80, 400, 160, 12);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#d946ef';
          ctx.font = 'bold 30px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('NETWORK PROMO', W / 2, H / 2 - 10);
          ctx.fillStyle = '#fdf4ff';
          ctx.font = '14px sans-serif';
          ctx.fillText('STAY TUNED FOR REVOLUTIONARY CONTENT', W / 2, H / 2 + 25);
          ctx.fillStyle = '#a21caf';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('COMING UP NEXT IN 3 MINUTES', W / 2, H / 2 + 50);

        } else {
          // PROGRAMS: News, nature, sports
          const isNews = currentlyPlayingLocal.category?.toLowerCase().includes('news');
          const isNature = currentlyPlayingLocal.category?.toLowerCase().includes('nature') || currentlyPlayingLocal.category?.toLowerCase().includes('science') || currentlyPlayingLocal.category?.toLowerCase().includes('sports');

          if (isNews) {
            // Elegant newsroom vector globe + perspective vector grid floor
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, '#060a12'); // super dark blue
            grad.addColorStop(1, '#0c1624'); // deep corporate newsroom
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // Floor Grid lines
            ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
            ctx.lineWidth = 1.5;
            for (let i = -12; i <= 12; i++) {
              ctx.beginPath();
              ctx.moveTo(W/2 + i * 35, H/2 + 20);
              ctx.lineTo(W/2 + i * 140, H);
              ctx.stroke();
            }
            for (let i = 0; i < 8; i++) {
              ctx.beginPath();
              const horizonY = H/2 + 20 + i * i * 3.5;
              ctx.moveTo(0, horizonY);
              ctx.lineTo(W, horizonY);
              ctx.stroke();
            }

            // Spinning sphere circles
            const cx = W / 2;
            const cy = H / 2 - 60;
            const r = 160;
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            
            for (let i = 1; i <= 3; i++) {
              const rot = angle * 0.35 + (i * Math.PI) / 3;
              ctx.beginPath();
              ctx.ellipse(cx, cy, r * Math.abs(Math.sin(rot)), r, 0, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Floating technical coordinate lines
            ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('GRID REFRESH: OK', 50, H / 2 - 120);
            ctx.fillText('DOWNLINK SYNCHRONIZATION: EXCELLENT', 50, H / 2 - 100);
            ctx.fillText('LATITUDE COORDINATES: 37.7749° N', 50, H / 2 - 80);

          } else if (isNature) {
            // Emerald green organic mountain / ocean landscapes
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, '#021e17'); 
            grad.addColorStop(1, '#042f24'); 
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // Hills layers
            terrainOffset += 0.01;
            ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
            ctx.beginPath();
            ctx.moveTo(0, H);
            for (let x = 0; x <= W; x += 30) {
              const y = H - 240 + Math.sin(x * 0.003 + terrainOffset) * 80 + Math.cos(x * 0.001 - terrainOffset * 0.5) * 40;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(W, H);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'rgba(4, 120, 87, 0.08)';
            ctx.beginPath();
            ctx.moveTo(0, H);
            for (let x = 0; x <= W; x += 30) {
              const y = H - 180 + Math.sin(x * 0.006 - terrainOffset * 1.5) * 50;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(W, H);
            ctx.closePath();
            ctx.fill();

            // Flying abstract particles (pollens or light dots)
            ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
            for (let i = 0; i < 8; i++) {
              const px = (Date.now() * 0.05 + i * 200) % (W + 100) - 50;
              const py = H / 2 - 100 + Math.sin(angle + i) * 60;
              ctx.beginPath();
              ctx.arc(px, py, 4, 0, Math.PI * 2);
              ctx.fill();
            }

          } else {
            // General entertainment: abstract cosmic shapes
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, '#0b071a');
            grad.addColorStop(1, '#180f33');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = 'rgba(139, 92, 246, 0.05)';
            for (let i = 0; i < 3; i++) {
              const sX = W / 2 + Math.sin(angle * 0.2 + i) * 300;
              const sY = H / 2 + Math.cos(angle * 0.3 + i * 2) * 150 - 50;
              ctx.beginPath();
              ctx.arc(sX, sY, 200 + i * 50, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Minimal cinematic crosshairs in center (studio camera look)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(W / 2 - 40, H / 2);
          ctx.lineTo(W / 2 + 40, H / 2);
          ctx.moveTo(W / 2, H / 2 - 40);
          ctx.lineTo(W / 2, H / 2 + 40);
          ctx.stroke();

          ctx.strokeRect(40, 40, W - 80, H - 80); // TV safe area borders
        }

        // ---------------- VU METERS (STEREO CHANNELS) ----------------
        const vuXLeft = 1170;
        const vuXRight = 1192;
        const vuY = 160;
        const vuH = 340; // total meter span

        let targetLeft = -40;
        let targetRight = -40;

        if (isPlayingLocal) {
          // Bouncy audio values matching speech/music cadence
          targetLeft = -14 + Math.sin(Date.now() * 0.016) * 6 + Math.random() * 9;
          targetRight = -14 + Math.cos(Date.now() * 0.019) * 6 + Math.random() * 9;

          // Commercial breaks are always compressed and louder
          if (currentlyPlayingLocal.type === 'commercial' || adTriggeredLocal) {
            targetLeft += 5;
            targetRight += 5;
          }

          targetLeft = Math.min(0, Math.max(-40, targetLeft));
          targetRight = Math.min(0, Math.max(-40, targetRight));
        }

        // Interpolation
        leftVu += (targetLeft - leftVu) * 0.35;
        rightVu += (targetRight - rightVu) * 0.35;

        // Decay peak indicators
        peakHoldCounter++;
        if (peakHoldCounter > 4) {
          leftPeak = Math.max(-40, leftPeak - 0.4);
          rightPeak = Math.max(-40, rightPeak - 0.4);
        }
        if (leftVu > leftPeak) { leftPeak = leftVu; peakHoldCounter = 0; }
        if (rightVu > rightPeak) { rightPeak = rightVu; peakHoldCounter = 0; }

        // Draw meter scale text
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('0dB', vuXLeft - 8, vuY + 8);
        ctx.fillText('-10', vuXLeft - 8, vuY + (vuH * 0.25) + 4);
        ctx.fillText('-20', vuXLeft - 8, vuY + (vuH * 0.5) + 4);
        ctx.fillText('-30', vuXLeft - 8, vuY + (vuH * 0.75) + 4);
        ctx.fillText('-40', vuXLeft - 8, vuY + vuH + 4);

        // Draw meter background tracks
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fillRect(vuXLeft, vuY, 15, vuH);
        ctx.fillRect(vuXRight, vuY, 15, vuH);

        // Draw segmented LED light blocks
        const segmentCount = 18;
        const segH = (vuH / segmentCount) - 3;
        for (let i = 0; i < segmentCount; i++) {
          const ratio = i / segmentCount;
          const segY = vuY + vuH - (i * (vuH / segmentCount)) - segH;
          const segDb = -40 + ratio * 40;

          // Color bracket: green (lower), orange (mid), red (peaking)
          let color = '#22c55e'; // Green
          if (i >= 13 && i < 16) color = '#f59e0b'; // Amber
          else if (i >= 16) color = '#ef4444'; // Red

          // Left Active state check
          if (leftVu >= segDb) {
            ctx.fillStyle = color;
            ctx.fillRect(vuXLeft + 1, segY, 13, segH);
          } else {
            ctx.fillStyle = 'rgba(47, 55, 71, 0.25)';
            ctx.fillRect(vuXLeft + 1, segY, 13, segH);
          }

          // Right Active state check
          if (rightVu >= segDb) {
            ctx.fillStyle = color;
            ctx.fillRect(vuXRight + 1, segY, 13, segH);
          } else {
            ctx.fillStyle = 'rgba(47, 55, 71, 0.25)';
            ctx.fillRect(vuXRight + 1, segY, 13, segH);
          }
        }

        // Render floating Peak Indicator notches
        const leftPeakY = vuY + vuH - ((leftPeak + 40) / 40) * vuH;
        const rightPeakY = vuY + vuH - ((rightPeak + 40) / 40) * vuH;
        
        ctx.fillStyle = '#ffffff';
        if (leftPeak > -39) ctx.fillRect(vuXLeft, Math.min(vuY + vuH - 2, Math.max(vuY, leftPeakY)), 15, 2);
        if (rightPeak > -39) ctx.fillRect(vuXRight, Math.min(vuY + vuH - 2, Math.max(vuY, rightPeakY)), 15, 2);

        // Stereo labels
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('L', vuXLeft + 7, vuY + vuH + 16);
        ctx.fillText('R', vuXRight + 7, vuY + vuH + 16);
        ctx.fillStyle = isPlayingLocal ? '#475569' : '#94a3b8';
        ctx.fillText('CH-VU', (vuXLeft + vuXRight) / 2 + 3, vuY - 10);

        // ---------------- SYNCED ENGAGEMENT OVERLAYS ----------------
        if (engagementStateLocal) {
          const { settings, poll } = engagementStateLocal;

          // Theme Color Dictionary for drawing consistent style
          const themeStyles = {
            classic: { text: '#ffffff', accent: '#38bdf8', accentBg: 'rgba(14, 165, 233, 0.15)', border: '#0ea5e9' },
            cyberpunk: { text: '#facc15', accent: '#f43f5e', accentBg: 'rgba(236, 72, 153, 0.2)', border: '#d946ef' },
            warm: { text: '#fef3c7', accent: '#f59e0b', accentBg: 'rgba(217, 119, 6, 0.15)', border: '#f59e0b' },
            minimalist: { text: '#ffffff', accent: '#ffffff', accentBg: 'rgba(255, 255, 255, 0.1)', border: '#ffffff' },
            retro: { text: '#4ade80', accent: '#86efac', accentBg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e' }
          }[settings.theme || 'classic'];

          // 1. Live Poll Overlay widget drawn directly inside the screen matrix
          if (poll && poll.isActive) {
            const cardX = 60;
            const cardY = 140;
            const cardW = 340;
            const cardH = 220;

            // Translucent glass card background
            ctx.fillStyle = 'rgba(9, 13, 24, 0.9)';
            ctx.strokeStyle = themeStyles.border;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, 14);
            ctx.fill();
            ctx.stroke();

            // Card Header
            ctx.fillStyle = themeStyles.text;
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'left';
            
            // Draw green dot indicator
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(cardX + 24, cardY + 28, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = themeStyles.text;
            ctx.fillText('LIVE VIEWERS CHOICE POLL', cardX + 38, cardY + 32);

            // Question
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = '#f8fafc';
            
            // wrap question text if long
            const words = poll.question.split(' ');
            let line = '';
            let lineCount = 0;
            for (let n = 0; n < words.length; n++) {
              const testLine = line + words[n] + ' ';
              const metrics = ctx.measureText(testLine);
              if (metrics.width > cardW - 40 && n > 0) {
                ctx.fillText(line, cardX + 20, cardY + 62 + lineCount * 18);
                line = words[n] + ' ';
                lineCount++;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, cardX + 20, cardY + 62 + lineCount * 18);

            // Options & Votes
            const listStartY = cardY + 95 + lineCount * 18;
            poll.options.forEach((opt, oIdx) => {
              const itemY = listStartY + oIdx * 40;
              if (itemY < cardY + cardH - 20) {
                const percent = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                
                // Track bar background
                ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
                ctx.beginPath();
                ctx.roundRect(cardX + 20, itemY, cardW - 40, 14, 4);
                ctx.fill();

                // Filled fill bar
                ctx.fillStyle = themeStyles.border;
                ctx.beginPath();
                ctx.roundRect(cardX + 20, itemY, (cardW - 40) * (percent / 100), 14, 4);
                ctx.fill();

                // Text labels
                ctx.fillStyle = '#e2e8f0';
                ctx.font = '10px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(opt.text, cardX + 24, itemY + 11);

                ctx.textAlign = 'right';
                ctx.fillStyle = themeStyles.text;
                ctx.font = 'bold 10px monospace';
                ctx.fillText(`${percent}%`, cardX + cardW - 24, itemY + 11);
              }
            });
          }

          // 2. Active Screen Event Alert bubble
          if (settings.activeAlert) {
            const alertX = W / 2 - 200;
            const alertY = 55;
            const alertW = 400;
            const alertH = 68;

            ctx.fillStyle = 'rgba(9, 13, 24, 0.95)';
            ctx.strokeStyle = '#a855f7'; // Purple alert focus
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(alertX, alertY, alertW, alertH, 12);
            ctx.fill();
            ctx.stroke();

            // Heart Icon indicator
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.arc(alertX + 32, alertY + 34, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❤', alertX + 32, alertY + 39);

            // Alert context text
            ctx.textAlign = 'left';
            ctx.font = 'bold 11px monospace';
            ctx.fillStyle = '#c084fc';
            ctx.fillText(`${settings.activeAlert.type.toUpperCase()} ENGAGEMENT`, alertX + 60, alertY + 28);
            
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(settings.activeAlert.username, alertX + 60, alertY + 46);
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '11px sans-serif';
            const userW = ctx.measureText(settings.activeAlert.username).width;
            ctx.fillText(settings.activeAlert.detail, alertX + 65 + userW, alertY + 46);
          }

          // 3. Dynamic scrolling lower ticker tape
          if (settings.tickerVisible && settings.tickerText) {
            const tSpeed = { slow: 1.5, normal: 3, fast: 5 }[settings.tickerSpeed || 'normal'];
            tickerOffset -= tSpeed;

            ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
            ctx.strokeStyle = themeStyles.border;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.fillRect(0, H - 75, W, 75);
            ctx.moveTo(0, H - 75); ctx.lineTo(W, H - 75);
            ctx.moveTo(0, H); ctx.lineTo(W, H);
            ctx.stroke();

            // Crawling copy layout
            ctx.fillStyle = themeStyles.text;
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'left';
            
            const displayTickerText = `${settings.tickerText} • [CASTPILOT AUTO-SCROLL] • `.toUpperCase();
            const textW = ctx.measureText(displayTickerText).width;
            
            // Wrap text loops
            if (tickerOffset < -textW) {
              tickerOffset = 0;
            }

            ctx.fillText(displayTickerText, tickerOffset, H - 32);
            ctx.fillText(displayTickerText, tickerOffset + textW, H - 32);
            ctx.fillText(displayTickerText, tickerOffset + textW * 2, H - 32);
          }
        }

        // NOW PLAYING Lower Third Metadata HUD
        const progressX = 60;
        const progressY = H - 110;
        const progressW = 320;
        
        ctx.fillStyle = 'rgba(9, 13, 24, 0.8)';
        ctx.beginPath();
        ctx.roundRect(progressX - 10, progressY - 32, progressW + 20, 50, 6);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`NOW AIRING: ${currentlyPlayingLocal.title.toUpperCase()}`, progressX, progressY - 14);

        ctx.fillStyle = 'rgba(51, 65, 85, 0.6)';
        ctx.fillRect(progressX, progressY, progressW, 5);

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(progressX, progressY, progressW * (currentProgress / 100), 5);

        const currentElapsedDisplay = Math.min(elapsedSeconds, currentlyPlayingLocal.duration * 60);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'right';
        ctx.fillText(`${formatDuration(currentElapsedDisplay)} / ${currentlyPlayingLocal.duration}:00`, progressX + progressW, progressY - 14);
      }

      // ---------------- CORNER GENERAL HUD HUD ----------------
      // Watermark indicator top-left
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(50, 45, 230, 45, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('CASTPILOT BROADCAST ENGINE', 62, 63);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('● PRIMARY ON-AIR STREAM', 62, 78);

      // Real-time blinking UTC clock top-right
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.beginPath();
      ctx.roundRect(W - 270, 45, 220, 45, 6);
      ctx.fill();
      ctx.stroke();

      const curDate = new Date();
      const formatTime = curDate.toISOString().slice(11, 23);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`STUDIO DATE: ${curDate.toLocaleDateString()}`, W - 62, 62);
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`UTC TIME: ${formatTime}`, W - 62, 78);

      // Horizontal subtle static TV scanline effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      for (let y = 0; y < H; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // request next anim frame
      animationId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const triggerScteAdBreak = () => {
    setAdTriggered(true);
    setScteStatus('SCTE-35 Splice Command Sent [0xFC]');
    setTimeout(() => {
      setScteStatus('Ad Insert Active - Splice Segment Running');
    }, 1500);

    setTimeout(() => {
      setAdTriggered(false);
      setScteStatus('Idle / Monitoring');
    }, 10000); // 10s simulation
  };

  const formatDuration = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSeconds = currentlyPlaying.duration * 60;
  const currentElapsedDisplay = Math.min(elapsedSeconds, totalSeconds);

  return (
    <div className="grid gap-6 lg:grid-cols-12" id="playout-controller-dashboard">
      {/* Visual Live Stream Monitor Screen (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-sky-400" />
            <span className="font-semibold text-xs text-white tracking-wider uppercase">Playout monitor (live)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[10px] text-emerald-400 tracking-wider">1080P HEVC @ 6.2 MBPS</span>
          </div>
        </div>

        {/* Live Stream Canvas Video Player (Simulated via high-contrast animated CSS graphics) */}
        <div className="relative aspect-video flex-1 bg-slate-900 overflow-hidden flex items-center justify-center">
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full object-contain bg-slate-950"
            id="playout-monitor-canvas"
          />
        </div>

        {/* Playback Controls & Command Bar */}
        <div className="bg-slate-900 px-6 py-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all ${
                isPlaying
                  ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
              }`}
              id="playout-play-pause-btn"
              title={isPlaying ? "Pause Stream Simulation" : "Start Stream Simulation"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>

            <button
              onClick={onSkip}
              className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              id="playout-skip-btn"
              title="Skip to next scheduled item"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <div className="flex-1 md:w-48">
              <div className="flex justify-between font-mono text-[9px] text-slate-400 mb-1">
                <span>SEGMENT ELAPSED</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="font-mono text-slate-500">NEXT:</span>
            <span className="text-slate-200 font-medium truncate max-w-xs">{nextQueued.title}</span>
          </div>
        </div>
      </div>

      {/* Side Automation Panel (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* SCTE-35 Automation ad injection control */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg flex flex-col justify-between h-[270px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-rose-400" />
                <h3 className="text-sm font-semibold text-white font-display">Ad Placement Splice Control</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                adTriggered 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}>
                {adTriggered ? 'AD-BURST RUNNING' : 'STANDBY'}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Inject ad triggers into playout server output streams using ANSI/SCTE-35 standard cues. Enables programmatic ad-insertion Downstream.
            </p>

            <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 mb-4">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Automation Cue Core State</div>
              <div className="font-mono text-xs text-slate-200 mt-1">{scteStatus}</div>
            </div>
          </div>

          <button
            onClick={triggerScteAdBreak}
            disabled={adTriggered || !primaryActive}
            className={`w-full py-2.5 rounded-lg font-semibold text-xs transition-all uppercase tracking-wider ${
              adTriggered
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg hover:shadow-rose-600/10 border border-rose-500'
            }`}
            id="scte-trigger-btn"
          >
            {adTriggered ? 'Ad Block Engaged' : 'Trigger SCTE-35 Splice Ad Break'}
          </button>
        </div>

        {/* Playout Failover Control Card */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg flex flex-col justify-between h-[270px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-sky-400" />
                <h3 className="text-sm font-semibold text-white font-display">DR Sync & Fallover Controller</h3>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Maintains redundant sub-second synchronized backups. In case of primary playout failure, the system redirects viewer requests to Disaster Recovery servers.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-500">PRIMARY NODE</div>
                <div className={`text-xs font-bold mt-1 ${primaryActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {primaryActive ? 'ACTIVE' : 'DE-ROUTE'}
                </div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-500">BACKUP DR NODE</div>
                <div className={`text-xs font-bold mt-1 ${!primaryActive ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                  {!primaryActive ? 'ON-AIR FALLBACK' : 'SYNCHRONIZED'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onSkip()}
              className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
            >
              Force Program Skip
            </button>
            <button
              onClick={() => setScteStatus('Simulated Re-sync Successful')}
              className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold text-xs border border-slate-800 transition"
            >
              Re-sync Streams
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
