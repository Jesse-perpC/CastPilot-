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
  severity: 'high' | 'medium';
  type: 'resource' | 'schedule';
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

