import React, { useState, useEffect } from 'react';
import {
  Tv,
  Activity,
  Sliders,
  RefreshCw,
  Mic,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Zap,
  Maximize2,
  Shield,
  RotateCcw,
  Wifi,
  Settings,
  HardDrive,
  Radio,
  Signal,
  BarChart3,
  Gauge,
  Layers,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export interface VideoFeed {
  id: string;
  camNumber: number;
  name: string;
  sourceType: 'NDI-HB' | 'NDI-HX3' | 'WebRTC-Cloud' | 'SRT-Bridge';
  ipAddress: string;
  ndiChannel: string;
  resolution: '4K UHD' | '1080p60' | '1080p30' | '720p60';
  fps: number;
  bitrateMbps: number;
  latencyMs: number;
  jitterMs: number;
  packetLoss: number;
  webrtcStatus: 'connected' | 'connecting' | 'reconnecting' | 'failed';
  iceState: 'completed' | 'checking' | 'connected';
  codec: 'H.264 / Opus' | 'H.265 / AAC' | 'VP9 / Opus' | 'AV1 / Opus';
  lipSyncOffsetMs: number; // e.g. -15ms to +25ms
  isCalibrating: boolean;
  tallyState: 'pgm' | 'pvw' | 'standby';
  isAudioMuted: boolean;
  isVideoFrozen: boolean;
  isoRecording: boolean;

  // Real-time Peak Audio Level Metrics (Stereo L/R & True Peak dBFS)
  audioLevelL: number; // 0 to 100 percentage (RMS level)
  audioLevelR: number; // 0 to 100 percentage (RMS level)
  peakHoldL: number; // 0 to 100 percentage (decaying peak hold marker)
  peakHoldR: number; // 0 to 100 percentage (decaying peak hold marker)
  peakDbfsL: number; // -60.0 to 0.0 dBFS
  peakDbfsR: number; // -60.0 to 0.0 dBFS
  isClippingL: boolean;
  isClippingR: boolean;

  // Signal Strength Visualization Metrics
  signalStrength: number; // 0 to 100 (%)
  signalBars: number; // 1 to 5 bars
  signalRssiDbm: number; // e.g. -42 to -78 dBm
  signalQuality: 'Excellent' | 'Optimal' | 'Stable' | 'Degraded';
  packetIntegrity: number; // e.g. 99.98%

  avatarUrl: string;
  talentName: string;
  location: string;
}

const INITIAL_FEEDS: VideoFeed[] = [
  {
    id: 'feed-1',
    camNumber: 1,
    name: 'CAM 1 • Main Anchor Desk',
    sourceType: 'NDI-HB',
    ipAddress: '192.168.10.41:5961',
    ndiChannel: 'STUDIO-A/DESK-WIDE',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 14.6,
    latencyMs: 24,
    jitterMs: 0.6,
    packetLoss: 0.0,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.264 / Opus',
    lipSyncOffsetMs: 0,
    isCalibrating: false,
    tallyState: 'pgm',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioLevelL: 74,
    audioLevelR: 71,
    peakHoldL: 84,
    peakHoldR: 82,
    peakDbfsL: -4.8,
    peakDbfsR: -5.4,
    isClippingL: false,
    isClippingR: false,
    signalStrength: 98,
    signalBars: 5,
    signalRssiDbm: -41,
    signalQuality: 'Excellent',
    packetIntegrity: 99.99,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80',
    talentName: 'Dr. Sarah Lin (Lead Anchor)',
    location: 'Main Studio Desk A'
  },
  {
    id: 'feed-2',
    camNumber: 2,
    name: 'CAM 2 • Co-Anchor & Panel',
    sourceType: 'NDI-HB',
    ipAddress: '192.168.10.42:5961',
    ndiChannel: 'STUDIO-A/PANEL-CLOSE',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 13.8,
    latencyMs: 28,
    jitterMs: 0.9,
    packetLoss: 0.0,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.264 / Opus',
    lipSyncOffsetMs: 4,
    isCalibrating: false,
    tallyState: 'pvw',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioLevelL: 52,
    audioLevelR: 56,
    peakHoldL: 66,
    peakHoldR: 70,
    peakDbfsL: -11.2,
    peakDbfsR: -9.8,
    isClippingL: false,
    isClippingR: false,
    signalStrength: 95,
    signalBars: 5,
    signalRssiDbm: -45,
    signalQuality: 'Excellent',
    packetIntegrity: 99.98,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    talentName: 'Marcus Vance (Co-Host)',
    location: 'Main Studio Desk B'
  },
  {
    id: 'feed-3',
    camNumber: 3,
    name: 'CAM 3 • London Tech Bureau',
    sourceType: 'WebRTC-Cloud',
    ipAddress: '51.140.82.11:8443',
    ndiChannel: 'CLOUD-GW/LON-DESK',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 10.2,
    latencyMs: 45,
    jitterMs: 1.8,
    packetLoss: 0.01,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'VP9 / Opus',
    lipSyncOffsetMs: -12,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioLevelL: 62,
    audioLevelR: 59,
    peakHoldL: 76,
    peakHoldR: 72,
    peakDbfsL: -8.1,
    peakDbfsR: -9.0,
    isClippingL: false,
    isClippingR: false,
    signalStrength: 88,
    signalBars: 4,
    signalRssiDbm: -54,
    signalQuality: 'Optimal',
    packetIntegrity: 99.89,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    talentName: 'Dianne K. (European Bureau)',
    location: 'London Studio 4'
  },
  {
    id: 'feed-4',
    camNumber: 4,
    name: 'CAM 4 • Wall Street Markets',
    sourceType: 'WebRTC-Cloud',
    ipAddress: '198.51.100.89:8443',
    ndiChannel: 'CLOUD-GW/NYC-NYSE',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 11.5,
    latencyMs: 38,
    jitterMs: 1.2,
    packetLoss: 0.0,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.264 / Opus',
    lipSyncOffsetMs: -5,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioLevelL: 45,
    audioLevelR: 48,
    peakHoldL: 58,
    peakHoldR: 62,
    peakDbfsL: -14.3,
    peakDbfsR: -12.9,
    isClippingL: false,
    isClippingR: false,
    signalStrength: 92,
    signalBars: 5,
    signalRssiDbm: -49,
    signalQuality: 'Excellent',
    packetIntegrity: 99.95,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
    talentName: 'Samira Patel (Financial Markets)',
    location: 'New York Remote Hub'
  },
  {
    id: 'feed-5',
    camNumber: 5,
    name: 'CAM 5 • Tokyo Field Bureau',
    sourceType: 'WebRTC-Cloud',
    ipAddress: '203.0.113.55:8443',
    ndiChannel: 'CLOUD-GW/TYO-LIVE',
    resolution: '4K UHD',
    fps: 30,
    bitrateMbps: 22.4,
    latencyMs: 72,
    jitterMs: 2.9,
    packetLoss: 0.04,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'AV1 / Opus',
    lipSyncOffsetMs: 18,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: false,
    audioLevelL: 38,
    audioLevelR: 42,
    peakHoldL: 52,
    peakHoldR: 58,
    peakDbfsL: -16.5,
    peakDbfsR: -14.2,
    isClippingL: false,
    isClippingR: false,
    signalStrength: 78,
    signalBars: 4,
    signalRssiDbm: -63,
    signalQuality: 'Stable',
    packetIntegrity: 99.62,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
    talentName: 'Kenji Takahashi (APAC Analyst)',
    location: 'Tokyo Bureau Floor'
  },
  {
    id: 'feed-6',
    camNumber: 6,
    name: 'CAM 6 • Paris Cultural Desk',
    sourceType: 'NDI-HX3',
    ipAddress: '192.168.10.46:5961',
    ndiChannel: 'PARIS-HUB/STAGE-01',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 9.8,
    latencyMs: 58,
    jitterMs: 2.1,
    packetLoss: 0.02,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.265 / AAC',
    lipSyncOffsetMs: 8,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioLevelL: 58,
    audioLevelR: 54,
    peakHoldL: 72,
    peakHoldR: 68,
    peakDbfsL: -9.5,
    peakDbfsR: -10.6,
    isClippingL: false,
    isClippingR: false,
    signalStrength: 84,
    signalBars: 4,
    signalRssiDbm: -58,
    signalQuality: 'Optimal',
    packetIntegrity: 99.81,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80',
    talentName: 'Elena Rostova (International Desk)',
    location: 'Paris Satellite Desk'
  },
  {
    id: 'feed-7',
    camNumber: 7,
    name: 'CAM 7 • 4K Skyline Drone Cam',
    sourceType: 'SRT-Bridge',
    ipAddress: '192.168.20.104:9000',
    ndiChannel: 'SRT-BRIDGE/DRONE-4K',
    resolution: '4K UHD',
    fps: 60,
    bitrateMbps: 26.0,
    latencyMs: 84,
    jitterMs: 3.8,
    packetLoss: 0.05,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.264 / Opus',
    lipSyncOffsetMs: -22,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: true,
    isVideoFrozen: false,
    isoRecording: true,
    audioLevelL: 0,
    audioLevelR: 0,
    peakHoldL: 0,
    peakHoldR: 0,
    peakDbfsL: -60.0,
    peakDbfsR: -60.0,
    isClippingL: false,
    isClippingR: false,
    signalStrength: 72,
    signalBars: 3,
    signalRssiDbm: -68,
    signalQuality: 'Stable',
    packetIntegrity: 99.45,
    avatarUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=300&q=80',
    talentName: 'Skyline Drone Alpha (Remote Link)',
    location: 'Metropolitan Aerial Sector'
  },
  {
    id: 'feed-8',
    camNumber: 8,
    name: 'CAM 8 • Virtual Studio & Weather',
    sourceType: 'NDI-HB',
    ipAddress: '192.168.10.48:5961',
    ndiChannel: 'STUDIO-A/GREEN-VIRTUAL',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 15.2,
    latencyMs: 31,
    jitterMs: 0.7,
    packetLoss: 0.0,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.264 / Opus',
    lipSyncOffsetMs: 0,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioLevelL: 68,
    audioLevelR: 72,
    peakHoldL: 80,
    peakHoldR: 85,
    peakDbfsL: -6.4,
    peakDbfsR: -4.5,
    isClippingL: false,
    isClippingR: false,
    signalStrength: 96,
    signalBars: 5,
    signalRssiDbm: -43,
    signalQuality: 'Excellent',
    packetIntegrity: 99.98,
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=80',
    talentName: 'Amara Okafor (Meteorology & Field)',
    location: 'Virtual Chroma Stage B'
  }
];

// Helper: Convert 0-100 linear percentage to accurate True Peak dBFS scale (-60 to 0 dBFS)
function percentToDbfs(pct: number): number {
  if (pct <= 0) return -60.0;
  // Scaled non-linear mapping mimicking broadcast True Peak PPM response
  const db = -60 + (Math.pow(pct / 100, 0.65) * 60);
  return Number(Math.max(-60.0, Math.min(0.0, db)).toFixed(1));
}

interface MultiCamNdiIngestionProps {
  addToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function MultiCamNdiIngestion({ addToast }: MultiCamNdiIngestionProps) {
  const [feeds, setFeeds] = useState<VideoFeed[]>(INITIAL_FEEDS);
  const [activeLayout, setActiveLayout] = useState<'8-grid' | 'quad' | 'solo'>('8-grid');
  const [soloFeedId, setSoloFeedId] = useState<string>('feed-1');
  const [activeCalibratingFeed, setActiveCalibratingFeed] = useState<VideoFeed | null>(null);
  const [activeSignalDetailsFeed, setActiveSignalDetailsFeed] = useState<VideoFeed | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [isAutoCalibratingAll, setIsAutoCalibratingAll] = useState<boolean>(false);
  const [globalPtpSyncStatus, setGlobalPtpSyncStatus] = useState<string>('SMPTE 2059-2 LOCKED');
  const [audioMeterMode, setAudioMeterMode] = useState<'dbfs' | 'vu' | 'compact'>('dbfs');

  // Real-time Peak Audio Level & Signal Strength dynamic simulation loop (250ms interval)
  useEffect(() => {
    const timer = setInterval(() => {
      setFeeds(prev =>
        prev.map(feed => {
          if (feed.isAudioMuted || feed.webrtcStatus !== 'connected') {
            return {
              ...feed,
              audioLevelL: 0,
              audioLevelR: 0,
              peakHoldL: Math.max(0, feed.peakHoldL - 6),
              peakHoldR: Math.max(0, feed.peakHoldR - 6),
              peakDbfsL: -60.0,
              peakDbfsR: -60.0,
              isClippingL: false,
              isClippingR: false
            };
          }

          // Natural voice modulation with stereo balance variations
          const voiceVariance = (Math.random() - 0.48) * 22;
          const stereoPanVariance = (Math.random() - 0.5) * 8;
          
          const rawBase = Math.max(10, Math.min(94, feed.audioLevelL + voiceVariance));
          const newLevelL = Math.max(5, Math.min(98, Math.round(rawBase + stereoPanVariance / 2)));
          const newLevelR = Math.max(5, Math.min(98, Math.round(rawBase - stereoPanVariance / 2)));

          // Peak hold logic with smooth decay
          const newPeakHoldL = Math.max(newLevelL, Math.round(feed.peakHoldL * 0.94));
          const newPeakHoldR = Math.max(newLevelR, Math.round(feed.peakHoldR * 0.94));

          const dbfsL = percentToDbfs(newLevelL);
          const dbfsR = percentToDbfs(newLevelR);

          // Simulated Signal Strength & RSSI fluctuations
          const signalDelta = (Math.random() - 0.5) * 3;
          const newSignalStrength = Math.max(50, Math.min(100, Math.round(feed.signalStrength + signalDelta)));
          const newBars = newSignalStrength >= 90 ? 5 : newSignalStrength >= 75 ? 4 : newSignalStrength >= 60 ? 3 : 2;
          const newRssi = Math.round(-85 + (newSignalStrength / 100) * 45); // e.g. -40dBm to -80dBm
          const newQuality: 'Excellent' | 'Optimal' | 'Stable' | 'Degraded' =
            newSignalStrength >= 90 ? 'Excellent' : newSignalStrength >= 78 ? 'Optimal' : newSignalStrength >= 65 ? 'Stable' : 'Degraded';

          // Latency and jitter minor tick
          const jitterDelta = (Math.random() - 0.5) * 1.5;
          const latencyDelta = (Math.random() - 0.5) * 2.5;
          const newLatency = Math.max(18, Math.min(125, Math.round(feed.latencyMs + latencyDelta)));

          return {
            ...feed,
            audioLevelL: newLevelL,
            audioLevelR: newLevelR,
            peakHoldL: newPeakHoldL,
            peakHoldR: newPeakHoldR,
            peakDbfsL: dbfsL,
            peakDbfsR: dbfsR,
            isClippingL: dbfsL >= -0.5,
            isClippingR: dbfsR >= -0.5,
            signalStrength: newSignalStrength,
            signalBars: newBars,
            signalRssiDbm: newRssi,
            signalQuality: newQuality,
            latencyMs: newLatency,
            jitterMs: Math.max(0.2, Number((feed.jitterMs + jitterDelta * 0.1).toFixed(1)))
          };
        })
      );
    }, 250);

    return () => clearInterval(timer);
  }, []);

  const toast = (msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    if (addToast) addToast(msg, type);
  };

  // Run Lip-Sync Calibration Routine for a single feed
  const handleCalibrateFeed = (feedId: string) => {
    const feed = feeds.find(f => f.id === feedId);
    if (!feed) return;

    setFeeds(prev => prev.map(f => f.id === feedId ? { ...f, isCalibrating: true } : f));
    toast(`Running acoustic & timestamp clapperboard sync for ${feed.name}...`, 'info');

    // Web Audio sync tone pulse
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz beep
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Ignore if autoplay restricted
    }

    setTimeout(() => {
      const optimalOffset = Math.round((Math.random() - 0.5) * 6);
      setFeeds(prev =>
        prev.map(f =>
          f.id === feedId
            ? { ...f, isCalibrating: false, lipSyncOffsetMs: optimalOffset }
            : f
        )
      );
      toast(`Lip-Sync calibration completed for ${feed.name}: Set to ${optimalOffset >= 0 ? `+${optimalOffset}` : optimalOffset} ms`, 'success');
    }, 1400);
  };

  // Batch Auto-Calibrate All Feeds
  const handleAutoCalibrateAll = () => {
    setIsAutoCalibratingAll(true);
    toast('Initiating SMPTE PTP Master Clock Lip-Sync Alignment across all 8 feeds...', 'info');

    setFeeds(prev => prev.map(f => ({ ...f, isCalibrating: true })));

    setTimeout(() => {
      setFeeds(prev =>
        prev.map(f => ({
          ...f,
          isCalibrating: false,
          lipSyncOffsetMs: Math.round((Math.random() - 0.5) * 4)
        }))
      );
      setIsAutoCalibratingAll(false);
      setGlobalPtpSyncStatus('SMPTE 2059-2 PHASE-ALIGNED (<1ms Delta)');
      toast('All 8 Multi-Cam NDI & WebRTC feeds successfully calibrated and phase-aligned!', 'success');
    }, 2200);
  };

  // Re-establish WebRTC ICE Handshake
  const handleReconnectWebRTC = (feedId: string) => {
    const feed = feeds.find(f => f.id === feedId);
    if (!feed) return;

    setFeeds(prev =>
      prev.map(f =>
        f.id === feedId
          ? { ...f, webrtcStatus: 'reconnecting', iceState: 'checking' }
          : f
      )
    );
    toast(`Renegotiating WebRTC SDP & ICE candidates for ${feed.name}...`, 'info');

    setTimeout(() => {
      setFeeds(prev =>
        prev.map(f =>
          f.id === feedId
            ? { ...f, webrtcStatus: 'connected', iceState: 'completed', latencyMs: Math.round(f.latencyMs * 0.9), signalStrength: 96 }
            : f
        )
      );
      toast(`WebRTC P2P connection re-established for ${feed.name}. ICE status: Completed.`, 'success');
    }, 1200);
  };

  // Toggle ISO recording
  const handleToggleIso = (feedId: string) => {
    setFeeds(prev =>
      prev.map(f => {
        if (f.id === feedId) {
          const nextState = !f.isoRecording;
          toast(`${f.name} ISO audio & video recording ${nextState ? 'ARMED' : 'DISARMED'}.`, nextState ? 'success' : 'info');
          return { ...f, isoRecording: nextState };
        }
        return f;
      })
    );
  };

  // Toggle Tally state (PGM / PVW / Standby)
  const handleCycleTally = (feedId: string) => {
    setFeeds(prev =>
      prev.map(f => {
        if (f.id === feedId) {
          const nextTally = f.tallyState === 'standby' ? 'pvw' : f.tallyState === 'pvw' ? 'pgm' : 'standby';
          toast(`${f.name} Tally state changed to ${nextTally.toUpperCase()}.`, 'info');
          return { ...f, tallyState: nextTally };
        }
        return f;
      })
    );
  };

  // Filtered feeds
  const filteredFeeds = feeds.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.talentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.ndiChannel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.ipAddress.includes(searchQuery);
    const matchesSource = filterSource === 'all' || f.sourceType === filterSource;
    return matchesSearch && matchesSource;
  });

  const avgLatency = Math.round(feeds.reduce((acc, curr) => acc + curr.latencyMs, 0) / feeds.length);
  const totalBitrate = (feeds.reduce((acc, curr) => acc + curr.bitrateMbps, 0)).toFixed(1);
  const activeIsoCount = feeds.filter(f => f.isoRecording).length;
  const avgSignalStrength = Math.round(feeds.reduce((acc, curr) => acc + curr.signalStrength, 0) / feeds.length);

  return (
    <div className="space-y-6" id="multicam-ndi-ingestion-hub">
      {/* Top Header & Ingestion Matrix Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 border border-sky-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono text-[10px] font-bold tracking-wider uppercase">
                <Zap className="h-3 w-3 text-amber-300 animate-pulse" />
                MULTI-CAM NDI / WEBRTC INGESTION MATRIX
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                <Shield className="h-3 w-3" />
                {globalPtpSyncStatus}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono text-[10px]">
                <BarChart3 className="h-3 w-3 text-cyan-300" />
                REAL-TIME PEAK AUDIO & RF SIGNAL TELEMETRY ACTIVE
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight flex items-center gap-2.5">
              <Tv className="h-5 w-5 text-sky-400" />
              Multi-Cam NDI & WebRTC Ingestion Station (8 Feeds)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time ultra-low latency multi-camera ingestion grid. Inspect real-time peak audio level meters (Stereo L/R dBFS with True Peak hold & clipping alerts), RF/network signal strength visualizers, SMPTE clock synchronization, and 1-click lip-sync acoustic calibration.
            </p>
          </div>

          {/* Quick Hub Global Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleAutoCalibrateAll}
              disabled={isAutoCalibratingAll}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
                isAutoCalibratingAll
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse cursor-wait'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
              }`}
              id="calibrate-all-feeds-btn"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              {isAutoCalibratingAll ? 'Calibrating All Feeds...' : 'Auto-Calibrate All Feeds'}
            </button>

            <button
              onClick={() => {
                const allArmed = feeds.every(f => f.isoRecording);
                setFeeds(prev => prev.map(f => ({ ...f, isoRecording: !allArmed })));
                toast(allArmed ? 'Disarmed all ISO audio tracks.' : 'Armed all 8 ISO audio tracks for discrete capture.', allArmed ? 'info' : 'success');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-2 transition"
            >
              <HardDrive className="h-4 w-4 text-rose-400" />
              {feeds.every(f => f.isoRecording) ? 'Disarm All ISO' : 'Arm All 8 ISO Tracks'}
            </button>
          </div>
        </div>
      </div>

      {/* Global Ingestion Telemetry & Health Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Active Feeds</span>
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{feeds.filter(f => f.webrtcStatus === 'connected').length} / {feeds.length} Online</span>
          </div>
          <p className="text-[10px] text-emerald-400/80 font-mono">100% ICE Peer Link</p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Signal Strength</span>
            <Signal className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400 flex items-center gap-2">
            <span>{avgSignalStrength}%</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono">5/5 BARS</span>
          </div>
          <p className="text-[10px] text-cyan-400/80 font-mono">Avg RSSI: -48 dBm (Optimal)</p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Average Latency</span>
            <Clock className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-sky-400">
            {avgLatency} ms
          </div>
          <p className="text-[10px] text-slate-400 font-mono">SLA: &lt; 100 ms Glass-to-Glass</p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Ingestion Bitrate</span>
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-indigo-300">
            {totalBitrate} Mbps
          </div>
          <p className="text-[10px] text-slate-400 font-mono">NDI + WebRTC SRTP Streams</p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-1.5 shadow-md col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">ISO Recording</span>
            <Mic className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-400">
            {activeIsoCount} / {feeds.length} Armed
          </div>
          <p className="text-[10px] text-slate-400 font-mono">24-bit 48kHz WAV Multi-Track</p>
        </div>
      </div>

      {/* Filter & View Controls Bar */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            placeholder="Search feed name, IP, or talent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-56"
          />

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Protocols (8 Feeds)</option>
            <option value="NDI-HB">NDI High-Bandwidth</option>
            <option value="NDI-HX3">NDI HX3</option>
            <option value="WebRTC-Cloud">WebRTC Cloud P2P</option>
            <option value="SRT-Bridge">SRT Bridge</option>
          </select>

          {/* Meter Scale Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
            <span className="text-slate-400 px-1">PEAK METER:</span>
            <button
              onClick={() => setAudioMeterMode('dbfs')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                audioMeterMode === 'dbfs' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stereo True Peak (dBFS)
            </button>
            <button
              onClick={() => setAudioMeterMode('vu')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                audioMeterMode === 'vu' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Broadcast PPM
            </button>
          </div>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 self-end md:self-auto">
          <span className="text-[10px] font-mono text-slate-400 px-1.5 hidden sm:inline">VIEW:</span>
          <button
            onClick={() => setActiveLayout('8-grid')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              activeLayout === '8-grid'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            8-Grid Matrix
          </button>
          <button
            onClick={() => setActiveLayout('quad')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              activeLayout === 'quad'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quad (4 Feeds)
          </button>
          <button
            onClick={() => setActiveLayout('solo')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              activeLayout === 'solo'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Solo Focus
          </button>
        </div>
      </div>

      {/* Grid of 8 Video Feed Placeholders */}
      {activeLayout === '8-grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFeeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              audioMeterMode={audioMeterMode}
              onCalibrate={() => handleCalibrateFeed(feed.id)}
              onOpenCalibrationModal={() => setActiveCalibratingFeed(feed)}
              onOpenSignalDetails={() => setActiveSignalDetailsFeed(feed)}
              onReconnect={() => handleReconnectWebRTC(feed.id)}
              onToggleIso={() => handleToggleIso(feed.id)}
              onCycleTally={() => handleCycleTally(feed.id)}
              onSolo={() => {
                setSoloFeedId(feed.id);
                setActiveLayout('solo');
              }}
              onToggleMute={() => {
                setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isAudioMuted: !f.isAudioMuted } : f));
              }}
              onToggleFreeze={() => {
                setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isVideoFrozen: !f.isVideoFrozen } : f));
              }}
            />
          ))}
        </div>
      )}

      {/* Quad View (4 Primary Feeds) */}
      {activeLayout === 'quad' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFeeds.slice(0, 4).map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              isLarge
              audioMeterMode={audioMeterMode}
              onCalibrate={() => handleCalibrateFeed(feed.id)}
              onOpenCalibrationModal={() => setActiveCalibratingFeed(feed)}
              onOpenSignalDetails={() => setActiveSignalDetailsFeed(feed)}
              onReconnect={() => handleReconnectWebRTC(feed.id)}
              onToggleIso={() => handleToggleIso(feed.id)}
              onCycleTally={() => handleCycleTally(feed.id)}
              onSolo={() => {
                setSoloFeedId(feed.id);
                setActiveLayout('solo');
              }}
              onToggleMute={() => {
                setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isAudioMuted: !f.isAudioMuted } : f));
              }}
              onToggleFreeze={() => {
                setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isVideoFrozen: !f.isVideoFrozen } : f));
              }}
            />
          ))}
        </div>
      )}

      {/* Solo View */}
      {activeLayout === 'solo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">INSPECTING FEED:</span>
              <select
                value={soloFeedId}
                onChange={(e) => setSoloFeedId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2.5 py-1 font-semibold"
              >
                {feeds.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.resolution})</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setActiveLayout('8-grid')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              ← Back to 8-Feed Grid
            </button>
          </div>

          {(() => {
            const feed = feeds.find(f => f.id === soloFeedId) || feeds[0];
            return (
              <FeedCard
                feed={feed}
                isLarge
                isSolo
                audioMeterMode={audioMeterMode}
                onCalibrate={() => handleCalibrateFeed(feed.id)}
                onOpenCalibrationModal={() => setActiveCalibratingFeed(feed)}
                onOpenSignalDetails={() => setActiveSignalDetailsFeed(feed)}
                onReconnect={() => handleReconnectWebRTC(feed.id)}
                onToggleIso={() => handleToggleIso(feed.id)}
                onCycleTally={() => handleCycleTally(feed.id)}
                onSolo={() => {}}
                onToggleMute={() => {
                  setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isAudioMuted: !f.isAudioMuted } : f));
                }}
                onToggleFreeze={() => {
                  setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isVideoFrozen: !f.isVideoFrozen } : f));
                }}
              />
            );
          })()}
        </div>
      )}

      {/* Signal Strength & RF Spectrum Inspector Modal */}
      {activeSignalDetailsFeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Signal className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    RF & Network Signal Strength Telemetry
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeSignalDetailsFeed.name} • {activeSignalDetailsFeed.sourceType} ({activeSignalDetailsFeed.ipAddress})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSignalDetailsFeed(null)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Detailed Signal Metrics */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Signal Strength (RSSI)</span>
                  <div className="text-lg font-bold font-mono text-cyan-400 flex items-center gap-2">
                    <span>{activeSignalDetailsFeed.signalStrength}%</span>
                    <span className="text-xs text-slate-300">({activeSignalDetailsFeed.signalRssiDbm} dBm)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      style={{ width: `${activeSignalDetailsFeed.signalStrength}%` }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Packet Integrity</span>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {activeSignalDetailsFeed.packetIntegrity}%
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">Packet Loss: {activeSignalDetailsFeed.packetLoss}%</p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Carrier-to-Noise (CNR)</span>
                  <div className="text-lg font-bold font-mono text-sky-400">
                    +38.4 dB
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">Target: &gt; +28 dB</p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Jitter Buffer Depth</span>
                  <div className="text-lg font-bold font-mono text-amber-400">
                    ±{activeSignalDetailsFeed.jitterMs} ms
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">Adaptive dejitter active</p>
                </div>
              </div>

              {/* Simulated RF Spectrum Constellation */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                    TRANSMISSION CARRIER SPECTRUM & BITSTREAM STABILITY
                  </span>
                  <span className="text-emerald-400 font-bold">STATUS: STABLE</span>
                </div>
                <div className="h-16 rounded-lg bg-slate-950 border border-slate-800 p-2 flex items-end gap-1 overflow-hidden">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const height = Math.sin(i * 0.35 + (activeSignalDetailsFeed.signalStrength / 20)) * 20 + 26;
                    return (
                      <div
                        key={i}
                        style={{ height: `${Math.max(4, height)}px` }}
                        className={`flex-1 rounded-t-xs transition-all duration-200 ${
                          height > 40 ? 'bg-cyan-400' : height > 24 ? 'bg-sky-500/80' : 'bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    handleReconnectWebRTC(activeSignalDetailsFeed.id);
                    setActiveSignalDetailsFeed(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
                >
                  <RefreshCw className="h-4 w-4" />
                  Re-Optimize Transmission Carrier
                </button>
                <button
                  onClick={() => setActiveSignalDetailsFeed(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Lip-Sync Calibration Modal / Inspector */}
      {activeCalibratingFeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    Lip-Sync Calibration & Audio Timing Engine
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeCalibratingFeed.name} • {activeCalibratingFeed.sourceType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCalibratingFeed(null)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Timing Visualizer */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">ACOUSTIC CLAPPERBOARD SYNC OFFSET:</span>
                  <span className={`font-bold text-sm ${
                    activeCalibratingFeed.lipSyncOffsetMs === 0
                      ? 'text-emerald-400'
                      : Math.abs(activeCalibratingFeed.lipSyncOffsetMs) < 10
                      ? 'text-sky-400'
                      : 'text-amber-400'
                  }`}>
                    {activeCalibratingFeed.lipSyncOffsetMs > 0 ? `+${activeCalibratingFeed.lipSyncOffsetMs}` : activeCalibratingFeed.lipSyncOffsetMs} ms
                  </span>
                </div>

                {/* Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={activeCalibratingFeed.lipSyncOffsetMs}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setActiveCalibratingFeed({ ...activeCalibratingFeed, lipSyncOffsetMs: val });
                      setFeeds(prev => prev.map(f => f.id === activeCalibratingFeed.id ? { ...f, lipSyncOffsetMs: val } : f));
                    }}
                    className="w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>-100 ms (Audio Advance)</span>
                    <span>0 ms (Perfect Sync)</span>
                    <span>+100 ms (Audio Delay)</span>
                  </div>
                </div>

                {/* Simulated Audio vs Video Waveform visualizer */}
                <div className="h-16 rounded-lg bg-slate-950 border border-slate-800 p-2 flex flex-col justify-center relative overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mb-1">
                    <span className="text-sky-400">AUDIO TRACK (OPUS 48kHz)</span>
                    <span className="text-amber-400">VIDEO PTS TIME (SMPTE PTP)</span>
                  </div>
                  <div className="flex items-center gap-0.5 h-6">
                    {Array.from({ length: 48 }).map((_, i) => {
                      const height = Math.sin(i * 0.4 + activeCalibratingFeed.lipSyncOffsetMs * 0.05) * 10 + 12;
                      return (
                        <div
                          key={i}
                          style={{ height: `${Math.max(3, height)}px` }}
                          className={`flex-1 rounded-xs transition-all ${
                            i === 24
                              ? 'bg-amber-400'
                              : i % 2 === 0
                              ? 'bg-sky-500/80'
                              : 'bg-sky-400/40'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    handleCalibrateFeed(activeCalibratingFeed.id);
                    setActiveCalibratingFeed({ ...activeCalibratingFeed, lipSyncOffsetMs: 0 });
                  }}
                  className="py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-sky-500/20"
                >
                  <Sparkles className="h-4 w-4" />
                  Run Auto Sync Tone Test
                </button>

                <button
                  onClick={() => {
                    setActiveCalibratingFeed({ ...activeCalibratingFeed, lipSyncOffsetMs: 0 });
                    setFeeds(prev => prev.map(f => f.id === activeCalibratingFeed.id ? { ...f, lipSyncOffsetMs: 0 } : f));
                    toast(`Reset sync delay offset to 0 ms for ${activeCalibratingFeed.name}.`, 'info');
                  }}
                  className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Zero Delay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Single Video Feed Placeholder Card Component
interface FeedCardProps {
  key?: string;
  feed: VideoFeed;
  isLarge?: boolean;
  isSolo?: boolean;
  audioMeterMode?: 'dbfs' | 'vu' | 'compact';
  onCalibrate: () => void;
  onOpenCalibrationModal: () => void;
  onOpenSignalDetails: () => void;
  onReconnect: () => void;
  onToggleIso: () => void;
  onCycleTally: () => void;
  onSolo: () => void;
  onToggleMute: () => void;
  onToggleFreeze: () => void;
}

function FeedCard({
  feed,
  isLarge,
  isSolo,
  audioMeterMode = 'dbfs',
  onCalibrate,
  onOpenCalibrationModal,
  onOpenSignalDetails,
  onReconnect,
  onToggleIso,
  onCycleTally,
  onSolo,
  onToggleMute,
  onToggleFreeze
}: FeedCardProps) {
  // Latency color category
  const latencyBadgeColor =
    feed.latencyMs < 40
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : feed.latencyMs < 75
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-300 border-rose-500/30';

  // Tally border indicator
  const tallyBorder =
    feed.tallyState === 'pgm'
      ? 'border-red-500 shadow-red-500/20'
      : feed.tallyState === 'pvw'
      ? 'border-amber-500 shadow-amber-500/20'
      : 'border-slate-800 hover:border-slate-700';

  return (
    <div
      className={`rounded-2xl bg-slate-950 border ${tallyBorder} p-4 shadow-xl flex flex-col justify-between space-y-3.5 transition-all relative ${
        feed.isCalibrating ? 'ring-2 ring-amber-400/80 animate-pulse' : ''
      }`}
      id={`feed-card-${feed.id}`}
    >
      {/* Header Info Bar */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {/* Tally Pill */}
          <button
            onClick={onCycleTally}
            title="Click to cycle Tally state (PGM / PVW / Standby)"
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition border ${
              feed.tallyState === 'pgm'
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : feed.tallyState === 'pvw'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {feed.tallyState.toUpperCase()}
          </button>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>{feed.name}</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono truncate">{feed.location}</p>
          </div>
        </div>

        {/* Source Protocol & Signal Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenSignalDetails}
            title={`Signal Strength: ${feed.signalStrength}% (${feed.signalRssiDbm} dBm) | Quality: ${feed.signalQuality}. Click for RF details.`}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 font-mono text-[9px] transition"
          >
            <SignalBarsVisualizer bars={feed.signalBars} strength={feed.signalStrength} />
            <span className="font-bold">{feed.signalStrength}%</span>
          </button>

          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/80 font-bold">
            {feed.sourceType}
          </span>
        </div>
      </div>

      {/* Simulated Video Feed Placeholder Box */}
      <div
        className={`relative ${
          isSolo ? 'h-96' : isLarge ? 'h-64' : 'h-44'
        } rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center group`}
      >
        {/* Talent / Scene Placeholder Background */}
        <img
          src={feed.avatarUrl}
          alt={feed.talentName}
          className={`w-full h-full object-cover transition duration-300 ${
            feed.isVideoFrozen ? 'filter grayscale brightness-75' : 'opacity-70 group-hover:opacity-85'
          }`}
        />

        {/* Camera Crosshairs & Safe Area Guides */}
        <div className="absolute inset-0 pointer-events-none border border-white/5 m-3 rounded">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
          </div>
        </div>

        {/* Calibration Flash Overlay */}
        {feed.isCalibrating && (
          <div className="absolute inset-0 bg-amber-400/30 flex flex-col items-center justify-center backdrop-blur-xs animate-pulse z-20">
            <Sparkles className="h-8 w-8 text-amber-300 animate-spin" />
            <span className="text-xs font-mono font-bold text-white mt-2 bg-black/80 px-2 py-1 rounded">
              LIP-SYNC ACOUSTIC CLAPPERBOARD TEST...
            </span>
          </div>
        )}

        {/* TOP-LEFT: Latency Badge (Prominent) */}
        <div
          className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5 border shadow-lg backdrop-blur-md ${latencyBadgeColor}`}
          title={`Network latency: ${feed.latencyMs}ms | Jitter: ±${feed.jitterMs}ms | Loss: ${feed.packetLoss}%`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${feed.latencyMs < 75 ? 'bg-emerald-400' : 'bg-rose-400'} animate-ping`} />
          <span>LATENCY: {feed.latencyMs} ms</span>
        </div>

        {/* TOP-RIGHT: Resolution & Frame Rate */}
        <div className="absolute top-2 right-2 z-10 bg-slate-950/85 border border-slate-800 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-300 backdrop-blur-md">
          {feed.resolution} • {feed.fps}fps • {feed.bitrateMbps}M
        </div>

        {/* BOTTOM-LEFT: Simulated WebRTC Connection Status Pill & Signal Bar Indicator */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 px-2 py-1 rounded-md text-[9px] font-mono text-slate-200 backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${
            feed.webrtcStatus === 'connected'
              ? 'bg-emerald-400'
              : feed.webrtcStatus === 'reconnecting'
              ? 'bg-amber-400 animate-spin'
              : 'bg-rose-500'
          }`} />
          <span className="font-bold uppercase tracking-wider">
            WebRTC: {feed.webrtcStatus}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300 font-bold">{feed.signalRssiDbm} dBm</span>
        </div>

        {/* BOTTOM-RIGHT: Real-time True Peak Audio Meter & Stereo VU Simulation */}
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-2 bg-slate-950/90 border border-slate-800 px-2 py-1.5 rounded-md backdrop-blur-md shadow-lg">
          {feed.isAudioMuted ? (
            <VolumeX className="h-3.5 w-3.5 text-rose-400" />
          ) : (
            <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
          )}

          {/* Dual Channel Peak Audio Level Meter (Left & Right with Peak Hold) */}
          <PeakAudioMeterWidget
            isMuted={feed.isAudioMuted}
            levelL={feed.audioLevelL}
            levelR={feed.audioLevelR}
            peakHoldL={feed.peakHoldL}
            peakHoldR={feed.peakHoldR}
            dbfsL={feed.peakDbfsL}
            dbfsR={feed.peakDbfsR}
            isClippingL={feed.isClippingL}
            isClippingR={feed.isClippingR}
          />
        </div>
      </div>

      {/* Network Stream Details & Real-Time Telemetry Bar */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
        <div className="space-y-0.5 truncate">
          <span className="text-slate-500 block text-[8px] uppercase">NDI Channel</span>
          <span className="text-slate-300 font-semibold truncate block">{feed.ndiChannel}</span>
        </div>
        <div className="space-y-0.5 truncate text-center">
          <span className="text-slate-500 block text-[8px] uppercase">Peak Audio (L/R)</span>
          <span className={`font-semibold truncate block ${feed.isAudioMuted ? 'text-slate-500' : 'text-emerald-400'}`}>
            {feed.isAudioMuted ? 'MUTED' : `${feed.peakDbfsL} / ${feed.peakDbfsR} dBFS`}
          </span>
        </div>
        <div className="space-y-0.5 truncate text-right">
          <span className="text-slate-500 block text-[8px] uppercase">Signal & Jitter</span>
          <span className="text-slate-300 font-semibold truncate block">
            {feed.signalStrength}% (±{feed.jitterMs}ms)
          </span>
        </div>
      </div>

      {/* Lip-Sync Calibration & Control Buttons */}
      <div className="space-y-2 pt-1 border-t border-slate-900">
        <div className="flex items-center justify-between gap-2">
          {/* Main Requested Lip-Sync Calibration Button */}
          <button
            onClick={onCalibrate}
            disabled={feed.isCalibrating}
            className="flex-1 py-2 px-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
            title="Perform 1-Click Acoustic Lip-Sync Clapperboard Calibration"
            id={`calibrate-feed-${feed.id}-btn`}
          >
            <Sliders className="h-3.5 w-3.5 text-sky-400" />
            <span>Lip-sync Calibration</span>
            <span className="text-[9px] font-mono text-sky-400/80">
              ({feed.lipSyncOffsetMs >= 0 ? `+${feed.lipSyncOffsetMs}` : feed.lipSyncOffsetMs}ms)
            </span>
          </button>

          {/* Detailed Fine-tuning / Inspector Modal Button */}
          <button
            onClick={onOpenCalibrationModal}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition"
            title="Fine-tune Offset Slider & Waveform"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quick Micro-Controls: ISO Arm, WebRTC Reconnect, Mute, Solo */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          <button
            onClick={onToggleIso}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[9px] font-mono font-bold flex items-center justify-center gap-1 border transition ${
              feed.isoRecording
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title="Arm ISO discrete audio track recording"
          >
            <Mic className="h-2.5 w-2.5" />
            {feed.isoRecording ? 'ISO REC' : 'ISO OFF'}
          </button>

          <button
            onClick={onReconnect}
            className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[9px] font-mono flex items-center gap-1 transition"
            title="Reconnect WebRTC Peer"
          >
            <RefreshCw className="h-2.5 w-2.5" />
            <span>ICE Re-Sync</span>
          </button>

          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border text-[9px] transition ${
              feed.isAudioMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
            }`}
            title={feed.isAudioMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {feed.isAudioMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          </button>

          <button
            onClick={onSolo}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[9px] transition"
            title="Solo Inspect Feed"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 5-Bar RF Signal Strength Visualizer Component
function SignalBarsVisualizer({ bars, strength }: { bars: number; strength: number }) {
  return (
    <div className="flex items-end gap-0.5 h-2.5 w-3.5" title={`Signal Strength: ${strength}%`}>
      {[1, 2, 3, 4, 5].map(step => {
        const isActive = bars >= step;
        const colorClass =
          strength >= 80 ? 'bg-cyan-400' : strength >= 60 ? 'bg-emerald-400' : strength >= 40 ? 'bg-amber-400' : 'bg-rose-500';
        const heightPct = step * 20;

        return (
          <div
            key={step}
            style={{ height: `${heightPct}%` }}
            className={`w-0.5 rounded-2xs transition-all duration-300 ${
              isActive ? colorClass : 'bg-slate-700/50'
            }`}
          />
        );
      })}
    </div>
  );
}

// Real-Time Peak Audio Level Meter Widget with Stereo L/R Ladder & Peak Hold Pins
interface PeakAudioMeterWidgetProps {
  isMuted: boolean;
  levelL: number;
  levelR: number;
  peakHoldL: number;
  peakHoldR: number;
  dbfsL: number;
  dbfsR: number;
  isClippingL: boolean;
  isClippingR: boolean;
}

function PeakAudioMeterWidget({
  isMuted,
  levelL,
  levelR,
  peakHoldL,
  peakHoldR,
  dbfsL,
  dbfsR,
  isClippingL,
  isClippingR
}: PeakAudioMeterWidgetProps) {
  if (isMuted) {
    return (
      <div className="flex items-center gap-1 font-mono text-[9px] text-rose-400/90 font-bold">
        <span>MUTED</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 min-w-[95px] select-none">
      {/* Channel Left (L) Meter */}
      <div className="flex items-center gap-1">
        <span className="text-[8px] font-mono text-slate-400 w-2">L</span>
        <div className="relative w-16 h-1.5 bg-slate-900 rounded-2xs overflow-hidden flex items-center border border-slate-800">
          {/* Active Level Bar with Multi-Segment Color Gradient */}
          <div
            style={{ width: `${levelL}%` }}
            className={`h-full transition-all duration-100 ${
              levelL > 88
                ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500'
                : levelL > 65
                ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                : 'bg-emerald-400'
            }`}
          />

          {/* Peak Hold Marker Tick */}
          {peakHoldL > 0 && (
            <div
              style={{ left: `${Math.min(97, peakHoldL)}%` }}
              className={`absolute top-0 bottom-0 w-0.5 z-10 ${
                peakHoldL > 88 ? 'bg-rose-400 shadow-sm shadow-rose-400' : 'bg-white'
              }`}
            />
          )}
        </div>
        <span className={`text-[8px] font-mono font-bold w-6 text-right ${
          isClippingL ? 'text-rose-400 animate-pulse' : dbfsL > -6 ? 'text-amber-300' : 'text-slate-300'
        }`}>
          {isClippingL ? 'CLIP' : `${Math.round(dbfsL)}`}
        </span>
      </div>

      {/* Channel Right (R) Meter */}
      <div className="flex items-center gap-1">
        <span className="text-[8px] font-mono text-slate-400 w-2">R</span>
        <div className="relative w-16 h-1.5 bg-slate-900 rounded-2xs overflow-hidden flex items-center border border-slate-800">
          {/* Active Level Bar with Multi-Segment Color Gradient */}
          <div
            style={{ width: `${levelR}%` }}
            className={`h-full transition-all duration-100 ${
              levelR > 88
                ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500'
                : levelR > 65
                ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                : 'bg-emerald-400'
            }`}
          />

          {/* Peak Hold Marker Tick */}
          {peakHoldR > 0 && (
            <div
              style={{ left: `${Math.min(97, peakHoldR)}%` }}
              className={`absolute top-0 bottom-0 w-0.5 z-10 ${
                peakHoldR > 88 ? 'bg-rose-400 shadow-sm shadow-rose-400' : 'bg-white'
              }`}
            />
          )}
        </div>
        <span className={`text-[8px] font-mono font-bold w-6 text-right ${
          isClippingR ? 'text-rose-400 animate-pulse' : dbfsR > -6 ? 'text-amber-300' : 'text-slate-300'
        }`}>
          {isClippingR ? 'CLIP' : `${Math.round(dbfsR)}`}
        </span>
      </div>
    </div>
  );
}
