import { VideoFeed } from '../MultiCamNdiIngestion';

// --- PTZ Camera Types ---
export interface PtzPreset {
  id: string;
  slotNumber: number;
  name: string;
  pan: number; // -180 to 180 deg
  tilt: number; // -90 to 90 deg
  zoom: number; // 1x to 30x
  focus: number; // 0 to 100%
  iris: number; // f/1.8 to f/22
  thumbnailUrl?: string;
}

export interface CameraPtzState {
  camId: string;
  pan: number;
  tilt: number;
  zoom: number;
  focus: number;
  iris: number;
  autoFocus: boolean;
  autoExposure: boolean;
  panSpeed: number; // 1 to 10
  tallyLockEnabled: boolean;
  presets: PtzPreset[];
}

// --- Routing Matrix Types ---
export interface MatrixInput {
  id: string;
  name: string;
  label: string;
  type: 'NDI' | 'WebRTC' | 'SRT' | 'INTERNAL';
  resolution: string;
  fps: number;
  color: string;
}

export interface MatrixOutput {
  id: string;
  name: string;
  destLabel: string;
  category: 'PGM' | 'PVW' | 'AUX' | 'PROMPTER' | 'IFB' | 'SRT_STREAM';
  currentInputId: string;
  isLocked: boolean;
}

export interface SalvoPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  routes: Record<string, string>; // outputId -> inputId
  isFactory?: boolean;
}

// --- AI Auto Framing & Keyer Types ---
export interface AiTrackingConfig {
  activeSpeakerTracking: boolean;
  speakerThresholdDbfs: number; // -45 to -10 dBFS
  switchHoldoffSec: number; // 1.0 to 5.0s
  autoFramingMode: 'headroom' | 'rule-of-thirds' | 'wide-group' | 'tight-bust';
  trackingSpeed: number; // 1 to 5
  smoothDamping: boolean;
  chromaKeyEnabled: boolean;
  chromaColor: 'green' | 'blue' | 'custom';
  customHexColor: string;
  similarity: number; // 0 to 100
  smoothness: number; // 0 to 100
  spillSuppression: number; // 0 to 100
  backgroundPlate: 'virtual-newsroom' | 'cyber-studio' | 'skyline-penthouse' | 'transparent' | 'gradient';
}

// --- Instant Replay Types ---
export interface ReplayClip {
  id: string;
  title: string;
  camId: string;
  camName: string;
  inTimestamp: number; // seconds from start of buffer
  outTimestamp: number; // seconds from start of buffer
  durationSec: number;
  speed: number; // 0.25, 0.5, 0.75, 1.0, -0.5
  tag: 'HIGHLIGHT' | 'CONTROVERSY' | 'REACTION' | 'GOAL' | 'BREAKAWAY';
  createdAt: string;
  thumbnailUrl: string;
}

// --- Intercom & Talkback Types ---
export interface IntercomChannel {
  id: string;
  name: string;
  role: string;
  destination: string;
  isActive: boolean; // currently talking
  isLatched: boolean; // latch lock
  volume: number; // 0 to 100
  isMuted: boolean;
  isIfb: boolean;
  duckingLevelDb: number; // -6, -12, -18, -96 (Mute)
  isTalentOnline: boolean;
}
