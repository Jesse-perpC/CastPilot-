import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Camera,
  FlipHorizontal,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sliders,
  Tv,
  Users,
  Video,
  VideoOff,
  Sparkles,
  Maximize2,
  Minimize2,
  Settings,
  Layers,
  LayoutGrid,
  Split,
  QrCode,
  Share2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Activity,
  Wifi,
  Radio,
  Shuffle,
  ShieldCheck,
  Disc,
  Copy,
  ExternalLink,
  ChevronDown,
  Eye,
  SlidersHorizontal,
  Volume1
} from 'lucide-react';
import { VideoFeed } from '../MultiCamNdiIngestion';

interface MobileDualCamStudioProps {
  feeds?: VideoFeed[];
  onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  onRouteToPgm?: (layoutName: string) => void;
  onRouteToPvw?: (layoutName: string) => void;
  activePgmCameraId?: string;
}

export type InterviewLayout = 'split_50_50' | 'pip' | 'studio_frame' | 'vertical_stack' | 'solo_front' | 'solo_back';
export type PipPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export default function MobileDualCamStudio({
  feeds = [],
  onToast = (msg, type) => console.log(type, msg),
  onRouteToPgm,
  onRouteToPvw,
  activePgmCameraId
}: MobileDualCamStudioProps) {
  // Device enumeration
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedFrontCamId, setSelectedFrontCamId] = useState<string>('front-default');
  const [selectedBackCamId, setSelectedBackCamId] = useState<string>('back-default');
  const [selectedMicId, setSelectedMicId] = useState<string>('mic-default');

  // Stream States
  const [frontStream, setFrontStream] = useState<MediaStream | null>(null);
  const [backStream, setBackStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Dual Hardware Capabilities Detection
  const [dualHardwareSupported, setDualHardwareSupported] = useState<boolean | null>(null);
  const [hardwareWarning, setHardwareWarning] = useState<string | null>(null);
  const [simulatedBackAngle, setSimulatedBackAngle] = useState<boolean>(false);
  const [activeSingleSensor, setActiveSingleSensor] = useState<'front' | 'back'>('front');

  // Composition / Switcher States
  const [activeLayout, setActiveLayout] = useState<InterviewLayout>('split_50_50');
  const [pipPosition, setPipPosition] = useState<PipPosition>('bottom-right');
  const [pipSize, setPipSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [studioBackdrop, setStudioBackdrop] = useState<'slate' | 'cyber' | 'horizon' | 'warm'>('slate');

  // Mirror & Framing
  const [mirrorFront, setMirrorFront] = useState<boolean>(true);
  const [mirrorBack, setMirrorBack] = useState<boolean>(false);
  const [showFramingGrid, setShowFramingGrid] = useState<boolean>(false);

  // Audio Processing & VU Meter
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(100);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [peakDbfs, setPeakDbfs] = useState<number>(-60);
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true);
  const [echoCancellation, setEchoCancellation] = useState<boolean>(true);

  // Lower Third Chyrons & Metadata
  const [hostName, setHostName] = useState<string>('Jesse Lepota');
  const [hostRole, setHostRole] = useState<string>('CastPilot Anchor (Front Cam)');
  const [guestName, setGuestName] = useState<string>('Special Guest');
  const [guestRole, setGuestRole] = useState<string>('Field Interviewee (Back Cam)');
  const [headlineTopic, setHeadlineTopic] = useState<string>('LIVE ON-SCENE: Mobile Multi-Camera Interview');
  const [showLowerThirds, setShowLowerThirds] = useState<boolean>(true);
  const [showTopicTicker, setShowTopicTicker] = useState<boolean>(true);

  // Remote Wireless Companion Link Modal
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [remoteRoomId] = useState<string>(() => 'cp-cam-' + Math.random().toString(36).substring(2, 8));

  // Program & Preview Routing
  const [isRoutedToPgm, setIsRoutedToPgm] = useState<boolean>(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false);

  // HTML Video & Canvas References
  const frontVideoRef = useRef<HTMLVideoElement | null>(null);
  const backVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Enumerate media devices on mount
  const refreshDevices = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vDevices = devices.filter(d => d.kind === 'videoinput');
      const aDevices = devices.filter(d => d.kind === 'audioinput');
      setVideoDevices(vDevices);
      setAudioDevices(aDevices);
    } catch (err) {
      console.warn('Failed to enumerate media devices:', err);
    }
  };

  useEffect(() => {
    refreshDevices();
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', refreshDevices);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', refreshDevices);
      };
    }
  }, []);

  // Initialize Microphone & Audio Analysis
  const initAudio = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          noiseSuppression,
          echoCancellation,
          autoGainControl: true,
          deviceId: selectedMicId !== 'mic-default' ? { exact: selectedMicId } : undefined
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setAudioStream(stream);

      // Web Audio API for real-time VU meter
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const levelPercent = Math.min(100, Math.round((avg / 128) * 100));
          setAudioLevel(levelPercent);

          // Calculate approximate dBFS (-60 to 0)
          const db = levelPercent > 0 ? Math.round(20 * Math.log10(levelPercent / 100)) : -60;
          setPeakDbfs(Math.max(-60, Math.min(0, db)));

          animFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      }
      return stream;
    } catch (err: any) {
      console.error('Audio initialization error:', err);
      onToast(`Microphone access error: ${err.message || 'Permission denied'}`, 'error');
      return null;
    }
  };

  // Start Dual-Camera Mobile Ingestion
  const startDualCameraIngestion = async () => {
    setIsCapturing(true);
    setHardwareWarning(null);

    try {
      // 1. Start Shared Microphone
      const aStream = await initAudio();

      // 2. Request Front Camera (User Facing)
      let fStream: MediaStream | null = null;
      try {
        const frontConstraints: MediaStreamConstraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        if (selectedFrontCamId !== 'front-default') {
          (frontConstraints.video as any) = { deviceId: { exact: selectedFrontCamId } };
        }
        fStream = await navigator.mediaDevices.getUserMedia(frontConstraints);
        setFrontStream(fStream);
        if (frontVideoRef.current) {
          frontVideoRef.current.srcObject = fStream;
        }
        setHasCameraPermission(true);
      } catch (fErr: any) {
        console.warn('Front camera request warning:', fErr);
        // Fallback to any default video device
        fStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setFrontStream(fStream);
        if (frontVideoRef.current) {
          frontVideoRef.current.srcObject = fStream;
        }
        setHasCameraPermission(true);
      }

      // 3. Attempt Simultaneous Back Camera (Environment Facing)
      let bStream: MediaStream | null = null;
      try {
        const backConstraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        if (selectedBackCamId !== 'back-default') {
          (backConstraints.video as any) = { deviceId: { exact: selectedBackCamId } };
        }

        bStream = await navigator.mediaDevices.getUserMedia(backConstraints);

        // Verify if both tracks are live and not stopped by OS
        const frontTrack = fStream?.getVideoTracks()[0];
        const backTrack = bStream?.getVideoTracks()[0];

        if (frontTrack?.readyState === 'live' && backTrack?.readyState === 'live' && frontTrack.id !== backTrack.id) {
          setBackStream(bStream);
          if (backVideoRef.current) {
            backVideoRef.current.srcObject = bStream;
          }
          setDualHardwareSupported(true);
          setSimulatedBackAngle(false);
          onToast('Dual-camera hardware active! Front & back cameras streaming with shared mic.', 'success');
        } else {
          throw new Error('Hardware camera exclusivity conflict detected.');
        }
      } catch (bErr: any) {
        console.info('Dual camera concurrent ISP restriction:', bErr);
        setDualHardwareSupported(false);
        setHardwareWarning(
          'Mobile OS single-camera sensor limit: The browser only permits one physical camera active at a time on this device. CastPilot has enabled Instant 1-Tap Camera Flip and Companion Remote Caster.'
        );
        // Activate simulated angle so user can test split screen interview right away
        setSimulatedBackAngle(true);
        onToast('Mobile single-sensor detected. Enabled 1-Tap Camera Flip & Remote Companion mode.', 'info');
      }

      await refreshDevices();
    } catch (err: any) {
      console.error('Mobile camera capture error:', err);
      setHasCameraPermission(false);
      onToast(`Camera capture failed: ${err.message || 'Check browser permissions'}`, 'error');
      setIsCapturing(false);
    }
  };

  // Stop Ingestion
  const stopDualCameraIngestion = () => {
    if (frontStream) {
      frontStream.getTracks().forEach(t => t.stop());
      setFrontStream(null);
    }
    if (backStream) {
      backStream.getTracks().forEach(t => t.stop());
      setBackStream(null);
    }
    if (audioStream) {
      audioStream.getTracks().forEach(t => t.stop());
      setAudioStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsCapturing(false);
    setIsRoutedToPgm(false);
    onToast('Mobile dual-camera session halted.', 'info');
  };

  // 1-Tap Camera Flip for Single-Sensor Mobile Devices
  const handleTogglePhysicalCamera = async () => {
    if (!isCapturing) return;
    const targetFacing = activeSingleSensor === 'front' ? 'environment' : 'user';
    try {
      // Stop existing video track without killing audio
      if (frontStream) {
        frontStream.getVideoTracks().forEach(t => t.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setFrontStream(newStream);
      if (frontVideoRef.current) {
        frontVideoRef.current.srcObject = newStream;
      }
      const nextSensor = activeSingleSensor === 'front' ? 'back' : 'front';
      setActiveSingleSensor(nextSensor);
      onToast(`Switched active camera sensor to ${nextSensor === 'front' ? 'FRONT (Anchor)' : 'BACK (Interviewee)'}`, 'success');
    } catch (err: any) {
      onToast(`Failed to flip camera: ${err.message}`, 'error');
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (!audioStream) return;
    const audioTrack = audioStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicMuted(!audioTrack.enabled);
      onToast(`Microphone ${!audioTrack.enabled ? 'MUTED' : 'UNMUTED'}`, 'info');
    }
  };

  // Send to Program (PGM)
  const handlePunchToPgm = () => {
    setIsRoutedToPgm(true);
    if (onRouteToPgm) {
      onRouteToPgm(`Mobile Dual-Cam (${activeLayout.replace('_', ' ').toUpperCase()})`);
    }
    onToast(`🚀 Mobile Dual-Cam Interview routed LIVE to Program (PGM)!`, 'success');
  };

  // Send to Preview (PVW)
  const handlePunchToPvw = () => {
    if (onRouteToPvw) {
      onRouteToPvw(`Mobile Dual-Cam (${activeLayout.replace('_', ' ').toUpperCase()})`);
    }
    onToast(`👁️ Mobile Dual-Cam sent to Preview (PVW).`, 'info');
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (frontStream) frontStream.getTracks().forEach(t => t.stop());
      if (backStream) backStream.getTracks().forEach(t => t.stop());
      if (audioStream) audioStream.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [frontStream, backStream, audioStream]);

  // Keep video refs attached when streams update
  useEffect(() => {
    if (frontVideoRef.current && frontStream) {
      frontVideoRef.current.srcObject = frontStream;
    }
  }, [frontStream]);

  useEffect(() => {
    if (backVideoRef.current && backStream) {
      backVideoRef.current.srcObject = backStream;
    }
  }, [backStream]);

  return (
    <div className="space-y-6 max-w-full">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/30 p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <Smartphone className="h-5 w-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-display font-bold text-white tracking-wide flex items-center gap-2">
                <span>Mobile Dual-Cam Field Caster & Interview Studio</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v2.5 LIVE
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Route the <strong>Front Camera (Host/Interviewer)</strong> and <strong>Back Camera (Guest/Field Scene)</strong> simultaneously into CastPilot with the single mobile device microphone, compositing multi-camera interviews on the main display in real time.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!isCapturing ? (
              <button
                onClick={startDualCameraIngestion}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-95"
                id="start-dual-cam-btn"
              >
                <Camera className="h-4 w-4" />
                <span>Start Mobile Dual-Cam Studio</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePunchToPgm}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                    isRoutedToPgm
                      ? 'bg-rose-600 text-white animate-pulse border border-rose-400'
                      : 'bg-rose-500 hover:bg-rose-400 text-white'
                  }`}
                  id="punch-to-pgm-btn"
                  title="Route this multi-camera interview layout live to Main Program (PGM)"
                >
                  <Radio className="h-3.5 w-3.5" />
                  <span>{isRoutedToPgm ? '● LIVE ON PGM' : 'ROUTE TO PGM (ON AIR)'}</span>
                </button>

                <button
                  onClick={handlePunchToPvw}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  id="punch-to-pvw-btn"
                  title="Route to Preview (PVW)"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>TAKE TO PVW</span>
                </button>

                <button
                  onClick={stopDualCameraIngestion}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition border border-slate-700"
                  id="stop-dual-cam-btn"
                >
                  <VideoOff className="h-3.5 w-3.5 text-rose-400" />
                  <span>Halt Session</span>
                </button>
              </>
            )}

            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/30 font-semibold text-xs flex items-center gap-1.5 transition"
              title="Connect a second smartphone wirelessly as Camera 2 (Companion Caster)"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Wireless Companion QR</span>
            </button>
          </div>
        </div>

        {/* Hardware Status Strip */}
        {isCapturing && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>MICROPHONE: SHARED MOBILE MIC (ACTIVE)</span>
              </span>

              {dualHardwareSupported ? (
                <span className="flex items-center gap-1.5 text-sky-300 bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-800/60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                  <span>DUAL SENSOR HARDWARE ISP: SIMULTANEOUS LIVE</span>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/60">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                    <span>SINGLE-ISP SENSOR: ACTIVE ON {activeSingleSensor === 'front' ? 'FRONT CAM' : 'BACK CAM'}</span>
                  </span>
                  <button
                    onClick={handleTogglePhysicalCamera}
                    className="px-2 py-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-600 text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
                    title="1-Tap Physical Sensor Flip between Front and Back"
                  >
                    <FlipHorizontal className="h-3 w-3" />
                    <span>FLIP SENSOR</span>
                  </button>
                </div>
              )}
            </div>

            {/* Audio VU Indicator */}
            <div className="flex items-center gap-2 text-slate-300 bg-slate-950 px-3 py-1 rounded-md border border-slate-800">
              <Mic className={`h-3.5 w-3.5 ${isMicMuted ? 'text-rose-400' : audioLevel > 5 ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-[10px]">MIC LEVEL:</span>
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-75 ${
                    audioLevel > 80 ? 'bg-rose-500' : audioLevel > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${isMicMuted ? 0 : audioLevel}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono w-12 text-right">
                {isMicMuted ? 'MUTE' : `${peakDbfs} dB`}
              </span>
            </div>
          </div>
        )}

        {/* Hardware Limitation Notice / Tip */}
        {hardwareWarning && (
          <div className="mt-3 rounded-lg bg-amber-950/40 border border-amber-500/40 p-2.5 text-xs text-amber-200/90 flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {hardwareWarning} You can interview someone on the back camera by using the <strong>1-Tap Flip Sensor</strong> button, or pair a second phone instantly via <strong>Wireless Companion QR</strong>!
            </p>
          </div>
        )}
      </div>

      {/* Main Switcher & Multi-Camera Display Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Production Multi-Camera Screen (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-w-0">
          {/* Main Stage Display Container */}
          <div
            ref={previewContainerRef}
            className={`relative rounded-2xl border overflow-hidden shadow-2xl transition-all ${
              isRoutedToPgm ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-800'
            } ${
              studioBackdrop === 'cyber'
                ? 'bg-gradient-to-br from-purple-950 via-slate-950 to-pink-950'
                : studioBackdrop === 'horizon'
                ? 'bg-gradient-to-br from-sky-950 via-slate-950 to-indigo-950'
                : studioBackdrop === 'warm'
                ? 'bg-gradient-to-br from-amber-950/40 via-slate-950 to-stone-950'
                : 'bg-slate-950'
            }`}
            style={{ minHeight: '440px', aspectRatio: activeLayout === 'vertical_stack' ? '9/16' : '16/9' }}
          >
            {/* Top Broadcast Tally Header Bar */}
            <div className="absolute top-0 inset-x-0 z-30 p-3 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between text-xs font-mono pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider flex items-center gap-1.5 shadow ${
                  isRoutedToPgm ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800/90 text-slate-300 border border-slate-700'
                }`}>
                  <Radio className="h-3 w-3" />
                  <span>{isRoutedToPgm ? 'PGM LIVE' : 'PREVIEW COMPOSITOR'}</span>
                </span>

                <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-slate-300 border border-slate-700/60 text-[10px]">
                  LAYOUT: {activeLayout.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                {/* Rule of Thirds toggle */}
                <button
                  onClick={() => setShowFramingGrid(!showFramingGrid)}
                  className={`p-1.5 rounded text-[10px] transition ${
                    showFramingGrid ? 'bg-sky-500 text-slate-950' : 'bg-black/60 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Rule-of-Thirds Grid Guides"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>

                {/* Flip active camera sensor (if single sensor) */}
                {isCapturing && !dualHardwareSupported && (
                  <button
                    onClick={handleTogglePhysicalCamera}
                    className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition"
                    title="Instant switch active phone camera between Front and Back"
                  >
                    <FlipHorizontal className="h-3 w-3" />
                    <span>Flip ({activeSingleSensor === 'front' ? 'To Back' : 'To Front'})</span>
                  </button>
                )}

                {/* Fullscreen toggle */}
                <button
                  onClick={() => {
                    if (!previewContainerRef.current) return;
                    if (!document.fullscreenElement) {
                      previewContainerRef.current.requestFullscreen?.();
                      setIsFullscreenPreview(true);
                    } else {
                      document.exitFullscreen?.();
                      setIsFullscreenPreview(false);
                    }
                  }}
                  className="p-1.5 rounded bg-black/60 text-slate-400 hover:text-white transition"
                  title="Toggle Fullscreen Program Output"
                >
                  {isFullscreenPreview ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Optional Rule-of-Thirds Grid Overlay */}
            {showFramingGrid && (
              <div className="absolute inset-0 z-20 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
                <div className="border-r border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-r border-b border-white/60" />
                <div className="border-b border-white/60" />
                <div className="border-r border-white/60" />
                <div className="border-r border-white/60" />
                <div />
              </div>
            )}

            {/* Video Streams Render Surface */}
            {!isCapturing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shadow-xl">
                  <Smartphone className="h-8 w-8" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-base font-bold text-white">Mobile Dual-Camera Ingestion Offline</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click <strong>Start Mobile Dual-Cam Studio</strong> above to initialize your device's camera hardware and microphone. The interviewer (front camera) and interviewee (back camera) will both render on this screen simultaneously.
                  </p>
                </div>
                <button
                  onClick={startDualCameraIngestion}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
                >
                  <Camera className="h-4 w-4" />
                  <span>Initialize Device Cameras & Mic</span>
                </button>
              </div>
            ) : (
              <div className="relative w-full h-full min-h-[440px]">
                {/* 1. SPLIT-SCREEN 50/50 LAYOUT */}
                {activeLayout === 'split_50_50' && (
                  <div className="w-full h-full flex flex-col sm:flex-row">
                    {/* Left: Front Camera (Host) */}
                    <div className="relative flex-1 h-1/2 sm:h-full border-b sm:border-b-0 sm:border-r border-slate-800 overflow-hidden bg-black">
                      <video
                        ref={frontVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${mirrorFront ? '-scale-x-100' : ''}`}
                      />
                      <div className="absolute top-12 left-3 z-10">
                        <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-sky-500/40 text-[10px] font-mono font-bold text-sky-400 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                          <span>CAM 1 • FRONT (HOST)</span>
                        </span>
                      </div>

                      {/* Lower Third for Host */}
                      {showLowerThirds && (
                        <div className="absolute bottom-6 left-3 right-3 z-10 pointer-events-none">
                          <div className="inline-block bg-slate-950/90 backdrop-blur-md border-l-4 border-sky-500 px-3 py-1.5 rounded-r-lg shadow-xl max-w-full">
                            <p className="text-xs font-bold text-white tracking-wide truncate">{hostName}</p>
                            <p className="text-[10px] text-sky-300 font-mono truncate">{hostRole}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Back Camera (Guest / Subject) */}
                    <div className="relative flex-1 h-1/2 sm:h-full overflow-hidden bg-black">
                      {backStream ? (
                        <video
                          ref={backVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-cover ${mirrorBack ? '-scale-x-100' : ''}`}
                        />
                      ) : simulatedBackAngle ? (
                        /* Simulated / Companion Feed */
                        <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-slate-900">
                          <img
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
                            alt="Interview Subject"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/20 backdrop-brightness-95" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-500">
                          <Camera className="h-8 w-8 mb-2" />
                          <p className="text-xs">Back camera idle</p>
                        </div>
                      )}

                      <div className="absolute top-12 left-3 z-10">
                        <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>CAM 2 • BACK (INTERVIEWEE)</span>
                        </span>
                      </div>

                      {/* Lower Third for Guest */}
                      {showLowerThirds && (
                        <div className="absolute bottom-6 left-3 right-3 z-10 pointer-events-none">
                          <div className="inline-block bg-slate-950/90 backdrop-blur-md border-l-4 border-emerald-500 px-3 py-1.5 rounded-r-lg shadow-xl max-w-full">
                            <p className="text-xs font-bold text-white tracking-wide truncate">{guestName}</p>
                            <p className="text-[10px] text-emerald-300 font-mono truncate">{guestRole}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. PICTURE-IN-PICTURE (PiP) LAYOUT */}
                {activeLayout === 'pip' && (
                  <div className="relative w-full h-full overflow-hidden bg-black">
                    {/* Full Screen Background: Back Camera (Subject) */}
                    {backStream ? (
                      <video
                        ref={backVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${mirrorBack ? '-scale-x-100' : ''}`}
                      />
                    ) : simulatedBackAngle ? (
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80"
                        alt="Subject"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        ref={frontVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${mirrorFront ? '-scale-x-100' : ''}`}
                      />
                    )}

                    {/* Floating Corner Inset: Front Camera (Host Reaction) */}
                    <div
                      className={`absolute z-20 rounded-xl overflow-hidden shadow-2xl border-2 border-sky-400/80 bg-black transition-all ${
                        pipPosition === 'bottom-right'
                          ? 'bottom-6 right-6'
                          : pipPosition === 'bottom-left'
                          ? 'bottom-6 left-6'
                          : pipPosition === 'top-right'
                          ? 'top-14 right-6'
                          : 'top-14 left-6'
                      } ${
                        pipSize === 'sm' ? 'w-36 h-24' : pipSize === 'lg' ? 'w-64 h-44' : 'w-52 h-36'
                      }`}
                    >
                      <video
                        ref={frontVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${mirrorFront ? '-scale-x-100' : ''}`}
                      />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono font-bold text-sky-300">
                        HOST (FRONT)
                      </div>
                    </div>

                    {/* Main Lower Third */}
                    {showLowerThirds && (
                      <div className="absolute bottom-6 left-6 z-10 pointer-events-none max-w-sm">
                        <div className="bg-slate-950/90 backdrop-blur-md border-l-4 border-emerald-500 px-3.5 py-2 rounded-r-lg shadow-2xl">
                          <p className="text-sm font-bold text-white tracking-wide">{guestName}</p>
                          <p className="text-xs text-emerald-400 font-mono">{guestRole}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. STUDIO BROADCAST FRAME (Side-by-Side Inset Boxes) */}
                {activeLayout === 'studio_frame' && (
                  <div className="w-full h-full p-4 sm:p-8 flex flex-col justify-center items-center">
                    <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Host Frame */}
                      <div className="rounded-xl overflow-hidden border-2 border-sky-500/60 shadow-2xl bg-black aspect-video relative">
                        <video
                          ref={frontVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-cover ${mirrorFront ? '-scale-x-100' : ''}`}
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-sky-500/40 text-[9px] font-mono font-bold text-sky-400">
                          CAM 1 • {hostName}
                        </div>
                      </div>

                      {/* Guest Frame */}
                      <div className="rounded-xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl bg-black aspect-video relative">
                        {backStream ? (
                          <video
                            ref={backVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${mirrorBack ? '-scale-x-100' : ''}`}
                          />
                        ) : simulatedBackAngle ? (
                          <img
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
                            alt="Guest"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                            No back camera feed
                          </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-400">
                          CAM 2 • {guestName}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. VERTICAL STACK (Mobile 9:16 Social/Live) */}
                {activeLayout === 'vertical_stack' && (
                  <div className="w-full h-full flex flex-col">
                    {/* Top: Interviewee (Back Cam) */}
                    <div className="flex-1 border-b-2 border-slate-800 relative overflow-hidden bg-black">
                      {backStream ? (
                        <video
                          ref={backVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-cover ${mirrorBack ? '-scale-x-100' : ''}`}
                        />
                      ) : simulatedBackAngle ? (
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
                          alt="Subject"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Back Cam</div>
                      )}
                      <div className="absolute top-12 left-3 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono font-bold text-emerald-400">
                        TOP: {guestName}
                      </div>
                    </div>

                    {/* Bottom: Host (Front Cam) */}
                    <div className="flex-1 relative overflow-hidden bg-black">
                      <video
                        ref={frontVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${mirrorFront ? '-scale-x-100' : ''}`}
                      />
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono font-bold text-sky-400">
                        BOTTOM: {hostName}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. SOLO FRONT CAM */}
                {activeLayout === 'solo_front' && (
                  <div className="w-full h-full relative overflow-hidden bg-black">
                    <video
                      ref={frontVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${mirrorFront ? '-scale-x-100' : ''}`}
                    />
                    <div className="absolute top-12 left-3 px-2.5 py-1 rounded bg-black/80 border border-sky-500/40 text-[10px] font-mono font-bold text-sky-400">
                      SOLO: FRONT CAMERA (HOST)
                    </div>
                  </div>
                )}

                {/* 6. SOLO BACK CAM */}
                {activeLayout === 'solo_back' && (
                  <div className="w-full h-full relative overflow-hidden bg-black">
                    {backStream ? (
                      <video
                        ref={backVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${mirrorBack ? '-scale-x-100' : ''}`}
                      />
                    ) : simulatedBackAngle ? (
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80"
                        alt="Interview Subject"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                        Back camera offline
                      </div>
                    )}
                    <div className="absolute top-12 left-3 px-2.5 py-1 rounded bg-black/80 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400">
                      SOLO: BACK CAMERA (SUBJECT)
                    </div>
                  </div>
                )}

                {/* Bottom Headline / Breaking News Ticker Bar */}
                {showTopicTicker && (
                  <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-r from-red-600 via-rose-700 to-red-600 text-white px-3 py-1 flex items-center gap-2 shadow-2xl overflow-hidden">
                    <span className="px-1.5 py-0.2 rounded bg-black/30 font-mono text-[9px] font-bold tracking-widest uppercase">
                      ON-AIR
                    </span>
                    <p className="text-[11px] font-bold tracking-wide truncate flex-1">{headlineTopic}</p>
                    <span className="text-[9px] font-mono text-white/80 hidden sm:inline">
                      CASTPILOT MOBILE FIELD LINK
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Production Switcher Bar (Instant Layout Hot-Swap) */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 mr-1.5 font-bold">Layouts:</span>
              <button
                onClick={() => setActiveLayout('split_50_50')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeLayout === 'split_50_50' ? 'bg-sky-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <Split className="h-3.5 w-3.5" />
                <span>Split 50/50</span>
              </button>

              <button
                onClick={() => setActiveLayout('pip')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeLayout === 'pip' ? 'bg-sky-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Picture-in-Pic (PiP)</span>
              </button>

              <button
                onClick={() => setActiveLayout('studio_frame')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeLayout === 'studio_frame' ? 'bg-sky-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Studio Dual-Frame</span>
              </button>

              <button
                onClick={() => setActiveLayout('vertical_stack')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeLayout === 'vertical_stack' ? 'bg-sky-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Vertical 9:16</span>
              </button>
            </div>

            {/* Quick Solo Punch Controls */}
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Solo Cut:</span>
              <button
                onClick={() => setActiveLayout('solo_front')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                  activeLayout === 'solo_front' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-sky-400 hover:bg-slate-800'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setActiveLayout('solo_back')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                  activeLayout === 'solo_back' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
                }`}
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Right Controls & Audio Matrix Sidebar (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5 min-w-0">
          {/* Shared Microphone & Audio Master Console */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className={`h-4 w-4 ${isMicMuted ? 'text-rose-400' : 'text-emerald-400'}`} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Device Shared Microphone</h3>
              </div>
              <button
                onClick={handleToggleMute}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition ${
                  isMicMuted ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                {isMicMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                <span>{isMicMuted ? 'MUTED' : 'ACTIVE'}</span>
              </button>
            </div>

            {/* Live VU Meter Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>MIC LEVEL (RMS)</span>
                <span className={audioLevel > 85 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                  {peakDbfs} dBFS {audioLevel > 85 ? '(PEAK CLIPPING)' : ''}
                </span>
              </div>
              <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 flex">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    audioLevel > 85 ? 'bg-rose-500' : audioLevel > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${isMicMuted ? 0 : audioLevel}%` }}
                />
              </div>
            </div>

            {/* Audio Filters (DSP) */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer text-slate-300 hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={noiseSuppression}
                  onChange={(e) => setNoiseSuppression(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-0"
                />
                <span>Noise Suppression</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer text-slate-300 hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={echoCancellation}
                  onChange={(e) => setEchoCancellation(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-0"
                />
                <span>Echo Cancel</span>
              </label>
            </div>

            {/* Select Microphone Device */}
            {audioDevices.length > 0 && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Input Device:</label>
                <select
                  value={selectedMicId}
                  onChange={(e) => setSelectedMicId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="mic-default">Default System Microphone</option>
                  {audioDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Microphone ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Camera Controls & Mirror Settings */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-sky-400" />
                <span>Camera Sensor Setup</span>
              </h3>
              <button
                onClick={refreshDevices}
                className="p-1 text-slate-500 hover:text-slate-300 rounded transition"
                title="Scan for connected cameras"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mirror Toggles */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setMirrorFront(!mirrorFront)}
                className={`p-2 rounded-lg border text-left transition ${
                  mirrorFront ? 'bg-sky-950/60 border-sky-500/50 text-sky-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <p className="font-bold text-[11px]">Mirror Front Cam</p>
                <p className="text-[9px] text-slate-500">{mirrorFront ? 'Natural Selfie' : 'Direct Feed'}</p>
              </button>

              <button
                onClick={() => setMirrorBack(!mirrorBack)}
                className={`p-2 rounded-lg border text-left transition ${
                  mirrorBack ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <p className="font-bold text-[11px]">Mirror Back Cam</p>
                <p className="text-[9px] text-slate-500">{mirrorBack ? 'Inverted' : 'Standard POV'}</p>
              </button>
            </div>

            {/* PiP Specific Controls */}
            {activeLayout === 'pip' && (
              <div className="space-y-2 pt-2 border-t border-slate-900">
                <label className="text-[10px] font-mono text-slate-400 uppercase">PiP Floating Corner:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['bottom-right', 'bottom-left', 'top-right', 'top-left'] as PipPosition[]).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPipPosition(pos)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-semibold capitalize transition ${
                        pipPosition === pos ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lower Thirds & Graphics Config */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Tv className="h-4 w-4 text-indigo-400" />
                <span>On-Air Lower Thirds</span>
              </h3>
              <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLowerThirds}
                  onChange={(e) => setShowLowerThirds(e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-0"
                />
                <span>Show Names</span>
              </label>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-sky-400 mb-0.5">Host Name (Front Cam):</label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-emerald-400 mb-0.5">Interviewee Name (Back Cam):</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-0.5">Topic / Headline Ticker:</label>
                <input
                  type="text"
                  value={headlineTopic}
                  onChange={(e) => setHeadlineTopic(e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wireless Remote Companion Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-sky-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400">
                <QrCode className="h-5 w-5" />
                <h3 className="text-base font-bold text-white">Pair Wireless Mobile Camera</h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If your phone or mobile browser restricts dual physical camera capture at the OS level, point a second smartphone camera at this code to join instantly as <strong>CAM 2 (Interviewee Angle)</strong> with zero lag!
            </p>

            <div className="bg-white p-4 rounded-xl flex items-center justify-center">
              {/* Responsive SVG QR Code visual */}
              <div className="text-center">
                <div className="w-44 h-44 border-4 border-slate-900 rounded-lg p-2 flex flex-col items-center justify-center bg-slate-100 text-slate-900">
                  <QrCode className="h-28 w-28 text-slate-950" />
                  <span className="text-[10px] font-mono font-bold mt-1 text-slate-800">ROOM: {remoteRoomId}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 truncate">castpilot.live/cam/{remoteRoomId}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`https://castpilot.live/cam/${remoteRoomId}`);
                  onToast('Copied wireless camera link to clipboard!', 'success');
                }}
                className="px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition"
              >
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </button>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Close Caster Pairing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
