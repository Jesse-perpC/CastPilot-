/**
 * CastPilot Applet Type Definitions
 */

export interface ContentAsset {
  id: string;
  title: string;
  type: 'program' | 'commercial' | 'promo' | 'filler';
  duration: number; // in minutes
  category: string;
  tags: string[];
  isQCed: boolean;
  safetyRating: string;
  loudnessDb: number; // e.g. -24 (EBU R128)
  optimalSlot: string; // e.g. "Primetime Slot", "Early Morning"
  adMarkers: string[]; // ad insertion cue points, e.g. ["00:15:00", "00:30:00"]
  description?: string;
  genre?: string;
  mood?: string;
  aiCluster?: string;
}

export interface ScheduleItem {
  id: string;
  channelName: string;
  startTime: string; // ISO string or time string
  title: string;
  type: 'program' | 'commercial' | 'promo' | 'filler';
  duration: number; // in minutes
  status: 'playing' | 'queued' | 'completed' | 'skipped';
  demandScore: number; // 0 - 100
  targetAudience: string;
  aiRationale: string;
}

export interface ResourceAsset {
  id: string;
  name: string;
  type: 'studio' | 'camera' | 'talent';
  status: 'active' | 'maintenance' | 'booked';
  allocationDetails: string;
  currentBooking: string; // Name of program booking it
}

export interface AdPerformance {
  timeSlot: string;
  fillRate: number; // percentage
  cpm: number; // cost per mille in USD
  revenue: number; // USD
  adBreakMinutes: number;
}

export interface ConflictAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: 'resource' | 'schedule' | 'transmission';
  title: string;
  description: string;
  recommendation: string;
  resolved: boolean;
}

export interface LiveStreamDestination {
  id: string;
  platform: 'youtube' | 'twitch' | 'facebook' | 'custom';
  name: string;
  rtmpUrl: string;
  streamKey: string;
  isLive: boolean;
  bitrateKbps: number;
  fps: number;
  resolution: string;
  health: 'excellent' | 'good' | 'unstable' | 'offline';
  watchUrl?: string;
}

export interface PublishedVod {
  id: string;
  scheduleId?: string;
  title: string;
  duration: number; // in minutes
  category: string;
  platform: 'youtube' | 'twitch' | 'vimeo' | 'archive';
  privacy: 'public' | 'unlisted' | 'private';
  publishedAt: string; // ISO or date string
  url: string;
  views: number;
  status: 'processing' | 'published' | 'failed';
}

export interface BroadcastTallyState {
  activePgmCameraId: string;
  activePvwCameraId: string;
  lastSwitchedAt: string;
  transitionType: 'cut' | 'mix' | 'wipe';
  isLiveOnAir: boolean;
}

// ==========================================
// TIER-1 BROADCAST STANDARDS & COMPLIANCE
// ==========================================

export interface PtpSyncState {
  isLocked: boolean;
  grandmasterId: string;
  domain: number;
  phaseOffsetUs: number; // microseconds offset
  jitterNs: number; // nanoseconds jitter
  profile: 'SMPTE ST 2059-2' | 'AES67' | 'IEEE 1588 Default';
  lastSyncTimestamp: string;
  syncQuality: 'Primary Grandmaster Locked' | 'Holding in Sync' | 'Drifting' | 'Unlocked';
  leapSeconds: number;
}

export interface Smpte2022State {
  hitlessActive: boolean;
  pathRed: {
    interface: string;
    ip: string;
    status: 'active' | 'degraded' | 'offline';
    bitrateMbps: number;
    packetLossPct: number;
    jitterMs: number;
  };
  pathBlue: {
    interface: string;
    ip: string;
    status: 'active' | 'degraded' | 'offline';
    bitrateMbps: number;
    packetLossPct: number;
    jitterMs: number;
  };
  reconstructedPacketsTotal: number;
  droppedFramesCount: number; // Should be 0 in hitless operation
  seamlessMergeHealth: 'Optimal (Dual Path Active)' | 'Path Red Degraded (Protected)' | 'Path Blue Degraded (Protected)' | 'Critical';
}

export interface LoudnessComplianceState {
  targetStandard: 'EBU R128 (-23 LUFS)' | 'CALM Act / ATSC A/85 (-24 LKFS)';
  targetLufs: number;
  momentaryLufs: number; // 400ms window
  shortTermLufs: number; // 3s window
  integratedLufs: number; // full programme integrated
  loudnessRangeLra: number; // LU
  maxTruePeakDbTp: number; // dBTP (limit -1.0 dBTP)
  isCompliant: boolean;
  dspLimiterActive: boolean;
  gainCorrectionDb: number;
}

export interface AsRunEntry {
  id: string;
  timestamp: string;
  timecodeIn: string; // HH:MM:SS:FF
  timecodeOut: string; // HH:MM:SS:FF
  durationSeconds: number;
  title: string;
  assetId: string;
  type: 'program' | 'commercial' | 'promo' | 'filler' | 'scte35_splice';
  advertiserId?: string;
  scteCueType?: string;
  status: 'aired_verified' | 'interrupted' | 'dropped';
  integratedLufs: number;
  sha256Hash: string; // Cryptographic verification hash
  reconciliationStatus: 'Matched (100%)' | 'Discrepancy' | 'Unscheduled';
}

export interface NmosNode {
  id: string;
  label: string;
  description: string;
  version: string;
  nodeApiVersion: string;
  hostname: string;
  sendersCount: number;
  receiversCount: number;
  status: 'registered_active' | 'syncing' | 'offline';
  ipAddress: string;
  st2110Essence: 'ST 2110-20 (Video)' | 'ST 2110-30 (Audio)' | 'ST 2110-40 (Ancillary)';
}

