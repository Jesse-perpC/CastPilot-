import React, { useState, useEffect } from 'react';
import {
  Radio,
  Server,
  Sparkles,
  AlertTriangle,
  Layers,
  FileText,
  DollarSign,
  Play,
  RotateCw,
  HardHat,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import Header from './components/Header';
import PlayoutController from './components/PlayoutController';
import ScheduleManager from './components/ScheduleManager';
import ResourceManager from './components/ResourceManager';
import AssetManager from './components/AssetManager';
import MonetizationDashboard from './components/MonetizationDashboard';
import SyndicationManager from './components/SyndicationManager';
import ChannelSetup from './components/ChannelSetup';
import LivePlaylistLoader from './components/LivePlaylistLoader';
import ScriptPrompter from './components/ScriptPrompter';
import EngagementStudio from './components/EngagementStudio';
import MultiCamNdiIngestion from './components/MultiCamNdiIngestion';
import ExportHub from './components/ExportHub';
import UserManual from './components/UserManual';
import StandaloneOverlay from './components/StandaloneOverlay';
import StandaloneChatPopout from './components/StandaloneChatPopout';
import PflCueDeck from './components/PflCueDeck';
import BroadcastStandardsSuite from './components/BroadcastStandardsSuite';
import StudioHotkeysModal from './components/StudioHotkeysModal';
import ChannelPresetsModal from './components/ChannelPresetsModal';
import InteractiveBroadcastTour from './components/InteractiveBroadcastTour';
import { ScheduleItem, ContentAsset, ResourceAsset, ConflictAlert, AdPerformance } from './types';
import { useLanguage } from './i18n';
import { useTheme } from './ThemeContext';

export default function App() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [standaloneView, setStandaloneView] = useState<'none' | 'overlay' | 'chat'>('none');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('overlay') === 'true') {
      setStandaloneView('overlay');
    } else if (params.get('popout-chat') === 'true') {
      setStandaloneView('chat');
    }
  }, []);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [channelName, setChannelName] = useState<string>('FAST Entertainment');
  const [primaryActive, setPrimaryActive] = useState<boolean>(true);
  const [schedulingMode, setSchedulingMode] = useState<'auto' | 'manual'>('auto');

  // Core Data States
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [resources, setResources] = useState<ResourceAsset[]>([]);
  const [alerts, setAlerts] = useState<ConflictAlert[]>([]);
  const [adData, setAdData] = useState<AdPerformance[]>([]);

  // Loading indicator states
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [enrichingAssetId, setEnrichingAssetId] = useState<string | null>(null);
  const [loadingBook, setLoadingBook] = useState<boolean>(false);
  const [loadingFetch, setLoadingFetch] = useState<boolean>(true);

  // Toast State for User Feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Studio Pre-Fade Listen (PFL) Cue Channel State
  const [cuedMedia, setCuedMedia] = useState<any | null>(null);

  // Master Broadcast PGM/PVW Tally Routing State (Synced between Playout and MultiCam)
  const [activePgmCameraId, setActivePgmCameraId] = useState<string>('feed-1');
  const [activePvwCameraId, setActivePvwCameraId] = useState<string>('feed-2');

  // Interactive Broadcast Modals (Hotkeys HUD, 1-Click Archetype Presets & Academy Tour)
  const [isHotkeysOpen, setIsHotkeysOpen] = useState<boolean>(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('castpilot_tour_dismissed') !== 'true';
    } catch {
      return false;
    }
  });

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Re-seed server with complete dummy broadcast content
  const handleResetDemoData = async () => {
    try {
      triggerToast("Reloading out-of-the-box broadcast demo data...", "info");
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
        triggerToast("Broadcast suite initialized with full demo programs, schedules, and alerts!", "success");
      } else {
        triggerToast("Failed to reset server data.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Network error while reloading demo data.", "error");
    }
  };

  // Live stream test trigger from tour or quick action
  const handleTriggerTestLive = () => {
    setActiveTab('syndication');
    triggerToast("Syndication Hub engaged: 4K multi-platform live test armed!", "success");
  };

  // 1-Click Channel Preset Loader
  const handleApplyPreset = async (
    presetChannelName: string,
    presetSchedules: ScheduleItem[],
    presetAssets: ContentAsset[],
    presetTitle: string
  ) => {
    setChannelName(presetChannelName);
    setSchedules(presetSchedules);
    setAssets(prev => {
      const incomingIds = new Set(presetAssets.map(a => a.id));
      return [...presetAssets, ...prev.filter(p => !incomingIds.has(p.id))];
    });
    await saveSchedulesToServer(presetSchedules);
    triggerToast(`Activated "${presetTitle}" Channel Preset!`, "success");
  };

  // Global Master Control Switcher Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        (target.getAttribute && target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      // '?' -> Toggle hotkeys HUD
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsHotkeysOpen(prev => !prev);
        return;
      }

      // 'Escape' -> Close any open modals
      if (e.key === 'Escape') {
        setIsHotkeysOpen(false);
        setIsPresetsOpen(false);
        setIsTourOpen(false);
        setCuedMedia(null);
        return;
      }

      // 'Space' -> CUT / TAKE
      if (e.code === 'Space') {
        e.preventDefault();
        const currentPgm = activePgmCameraId;
        const currentPvw = activePvwCameraId;
        setActivePgmCameraId(currentPvw);
        setActivePvwCameraId(currentPgm);
        handleSelectPgmCamera(currentPvw);
        handleSelectPvwCamera(currentPgm);
        triggerToast(`CUT / TAKE: PGM switched to ${currentPvw.replace('feed-', 'CAM ')}`, "info");
        return;
      }

      // '1' - '4' -> Direct Cut to Camera
      if (['1', '2', '3', '4'].includes(e.key)) {
        const feedId = `feed-${e.key}`;
        handleSelectPgmCamera(feedId);
        triggerToast(`Direct Cut to Camera ${e.key}`, "info");
        return;
      }

      // 'E' or 'e' -> Emergency Slate Override
      if (e.key.toLowerCase() === 'e') {
        window.dispatchEvent(new CustomEvent('studio-hotkey-emergency'));
        triggerToast("Toggled FCC Emergency Override Slate (EAS)", "info");
        return;
      }

      // 'C' or 'c' -> SCTE-35 Commercial Ad Insertion
      if (e.key.toLowerCase() === 'c') {
        window.dispatchEvent(new CustomEvent('studio-hotkey-scte35'));
        triggerToast("Triggered SCTE-35 30s Commercial Break", "info");
        return;
      }

      // 'M' or 'm' -> Master Audio Mute
      if (e.key.toLowerCase() === 'm') {
        window.dispatchEvent(new CustomEvent('studio-hotkey-mute'));
        triggerToast("Toggled Master Output Audio Mute", "info");
        return;
      }

      // 'R' or 'r' -> Instant Replay
      if (e.key.toLowerCase() === 'r') {
        window.dispatchEvent(new CustomEvent('studio-hotkey-replay'));
        triggerToast("Triggered Instant Replay (15s @ 0.5x)", "info");
        return;
      }

      // 'S' or 's' -> Skip to Next Queued Item
      if (e.key.toLowerCase() === 's') {
        if (schedules.length > 1) {
          const updated = [...schedules.slice(1), schedules[0]];
          setSchedules(updated);
          saveSchedulesToServer(updated);
          triggerToast("Skipped to next queued lineup item", "info");
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePgmCameraId, activePvwCameraId, schedules]);

  const handleSelectPgmCamera = async (feedId: string) => {
    setActivePgmCameraId(feedId);
    try {
      await fetch('/api/playout/tally', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activePgmCameraId: feedId })
      });
    } catch {
      // Local state fallback
    }
  };

  const handleSelectPvwCamera = async (feedId: string) => {
    setActivePvwCameraId(feedId);
    try {
      await fetch('/api/playout/tally', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activePvwCameraId: feedId })
      });
    } catch {
      // Local state fallback
    }
  };

  // Fetch initial data from full-stack Express server
  const fetchAllData = async () => {
    try {
      const [resSched, resAssets, resRes, resAlerts, resMonetization, resTally] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/mam/assets'),
        fetch('/api/resources'),
        fetch('/api/conflicts'),
        fetch('/api/monetization'),
        fetch('/api/playout/tally').catch(() => null)
      ]);

      const dataSched = await resSched.json();
      const dataAssets = await resAssets.json();
      const dataRes = await resRes.json();
      const dataAlerts = await resAlerts.json();
      const dataMonetization = await resMonetization.json();

      if (resTally && resTally.ok) {
        const dataTally = await resTally.json();
        if (dataTally.activePgmCameraId) setActivePgmCameraId(dataTally.activePgmCameraId);
        if (dataTally.activePvwCameraId) setActivePvwCameraId(dataTally.activePvwCameraId);
      }

      setSchedules(dataSched.schedules);
      setAssets(dataAssets.assets);
      setResources(dataRes.resources);
      setAlerts(dataAlerts.alerts);
      setAdData(dataMonetization.data);
    } catch (err) {
      console.error("Failed to connect to full-stack Express server. Utilizing client local fallbacks:", err);
      triggerToast("Failed to fetch server data. Reverting to local state.", "error");
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- API Handlers ---

  // Generate AI Schedule (calls Express server with Gemini integration)
  const handleGenerateAI = async (customPrompt: string, blocksCount: number) => {
    setLoadingAI(true);
    triggerToast(`Calling Gemini API to synthesize optimized scheduling sequence...`, "info");
    try {
      const res = await fetch('/api/schedule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName,
          customInstruction: customPrompt,
          durationBlocks: blocksCount
        })
      });

      const data = await res.json();
      if (data.success) {
        // Refresh schedule
        const schedRes = await fetch('/api/schedule');
        const schedData = await schedRes.json();
        setSchedules(schedData.schedules);
        
        // Refresh alerts in case there were any regulatory warnings created by AI loudness simulation
        const alertRes = await fetch('/api/conflicts');
        const alertData = await alertRes.json();
        setAlerts(alertData.alerts);

        triggerToast(`Successfully generated ${blocksCount} schedule blocks via ${data.source === 'gemini-api' ? 'Gemini 3.5 Flash' : 'Simulated Logic'}.`, "success");
      } else {
        triggerToast("AI schedule synthesis failed.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Network error generating schedule.", "error");
    } finally {
      setLoadingAI(false);
    }
  };

  const saveSchedulesToServer = async (updatedSchedules: ScheduleItem[]) => {
    try {
      await fetch('/api/schedule/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: updatedSchedules })
      });
    } catch (err) {
      console.error("Failed to sync schedules to backend:", err);
    }
  };

  // Add Manual Schedule Entry
  const handleManualAddSchedule = async (newItem: Omit<ScheduleItem, 'id' | 'status'>) => {
    // Local simulation append
    const id = `sch-man-${Date.now()}`;
    const item: ScheduleItem = {
      ...newItem,
      id,
      status: 'queued'
    };
    const updated = [...schedules, item];
    setSchedules(updated);
    await saveSchedulesToServer(updated);
    triggerToast(`Added manual block for "${newItem.title}" at ${newItem.startTime}`, "success");
  };

  // Delete Schedule block
  const handleDeleteScheduleItem = async (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    await saveSchedulesToServer(updated);
    triggerToast("Playout block deleted.", "info");
  };

  // Fill schedule gaps automatically
  const handleFillGaps = async () => {
    // Find gaps or just inject filler promos at 10m intervals
    const fillerItem: ScheduleItem = {
      id: `sch-filler-${Date.now()}`,
      channelName,
      startTime: "11:30 AM",
      title: "Cyberpunk 2088 Promo",
      type: "promo",
      duration: 3,
      status: "queued",
      demandScore: 88,
      targetAudience: "Demographic 18-35",
      aiRationale: "Gap filler injected automatically to avoid dead air on FAST feed."
    };
    const updated = [...schedules, fillerItem];
    setSchedules(updated);
    await saveSchedulesToServer(updated);
    triggerToast("Dynamic ad filler promo injected into lineup sequence.", "success");
  };

  // Register New Raw Asset in MAM Vault
  const handleAddAsset = async (newAsset: { title: string; type: string; duration: number; category: string; description: string }) => {
    try {
      const res = await fetch('/api/mam/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      });
      const data = await res.json();
      if (data.success) {
        setAssets(prev => [data.asset, ...prev]);
        triggerToast(`Ingested raw catalog log for "${newAsset.title}" successfully.`, "success");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error registering MAM asset.", "error");
    }
  };

  // Delete MAM Asset
  const handleDeleteAsset = async (assetId: string) => {
    try {
      const res = await fetch(`/api/mam/assets/${assetId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setAssets(prev => prev.filter(a => a.id !== assetId));
        triggerToast("Asset deleted from MAM Vault.", "success");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to delete asset.", "error");
    }
  };

  // Update MAM Asset Metadata
  const handleUpdateAsset = async (assetId: string, updatedFields: Partial<ContentAsset>) => {
    try {
      const res = await fetch(`/api/mam/assets/${assetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        setAssets(prev => prev.map(a => a.id === assetId ? data.asset : a));
        triggerToast("Asset updated successfully.", "success");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to update asset metadata.", "error");
    }
  };

  // AI Smart Enrichment (calls Gemini to auto-enrich tags, ratings, safety, and loudness)
  const handleEnrichAsset = async (assetId: string) => {
    setEnrichingAssetId(assetId);
    triggerToast("Calling Gemini API for computer vision & audio tag enrichment...", "info");
    try {
      const res = await fetch('/api/mam/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh assets
        const assetsRes = await fetch('/api/mam/assets');
        const assetsData = await assetsRes.json();
        setAssets(assetsData.assets);

        // Refresh alerts in case loudness check failed
        const alertsRes = await fetch('/api/conflicts');
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts);

        triggerToast(`Enriched "${data.asset.title}" metadata via ${data.source === 'gemini-api' ? 'Gemini AI' : 'Simulated QC Model'}.`, "success");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Enrichment failed.", "error");
    } finally {
      setEnrichingAssetId(null);
    }
  };

  // Book a physical studio resource
  const handleBookResource = async (resourceId: string, bookingTitle: string, details: string) => {
    setLoadingBook(true);
    try {
      const res = await fetch('/api/resources/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, bookingTitle, details })
      });
      const data = await res.json();
      
      // Refresh resources & alerts
      const [resRes, resAlerts] = await Promise.all([
        fetch('/api/resources'),
        fetch('/api/conflicts')
      ]);
      const dataRes = await resRes.json();
      const dataAlerts = await resAlerts.json();

      setResources(dataRes.resources);
      setAlerts(dataAlerts.alerts);

      if (data.success) {
        triggerToast("Successfully reserved shared studio resource.", "success");
      } else {
        triggerToast("Overbooking conflict detected! Check alarm logs.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Booking failed.", "error");
    } finally {
      setLoadingBook(false);
    }
  };

  // Release a booked resource
  const handleReleaseResource = async (resourceId: string) => {
    try {
      const res = await fetch('/api/resources/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh resources
        const resRes = await fetch('/api/resources');
        const dataRes = await resRes.json();
        setResources(dataRes.resources);
        triggerToast("Released resource allocation.", "info");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve a scheduling/resource conflict alert
  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/conflicts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
        triggerToast("Conflict marked as resolved.", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clear resolved alarms
  const handleClearResolvedAlarms = async () => {
    try {
      await fetch('/api/conflicts/clear-resolved', { method: 'POST' });
      setAlerts(prev => prev.filter(a => !a.resolved));
      triggerToast("Cleared resolved warnings.", "info");
    } catch (err) {
      console.error(err);
    }
  };

  // Playback Simulation: Skip forward handler
  const handlePlayoutSkip = () => {
    setSchedules((prev) => {
      // Find currently playing
      const playingIdx = prev.findIndex((s) => s.status === 'playing' && s.channelName === channelName);
      if (playingIdx === -1) {
        // If nothing is playing, make first queued playing
        const queuedIdx = prev.findIndex((s) => s.status === 'queued' && s.channelName === channelName);
        if (queuedIdx !== -1) {
          const next = [...prev];
          next[queuedIdx].status = 'playing';
          return next;
        }
        return prev;
      }

      // Progress playing to completed, set next queued to playing
      const next = [...prev];
      next[playingIdx].status = 'completed';
      
      const queuedIdx = next.findIndex((s) => s.status === 'queued' && s.channelName === channelName);
      if (queuedIdx !== -1) {
        next[queuedIdx].status = 'playing';
      } else {
        triggerToast("End of scheduled queue sequence reached. Loop active.", "info");
      }
      return next;
    });

    triggerToast("Playout sequence advanced to next block.", "info");
  };

  const unresolvedAlertsCount = alerts.filter(a => !a.resolved).length;

  if (standaloneView === 'overlay') {
    return <StandaloneOverlay />;
  }
  if (standaloneView === 'chat') {
    return <StandaloneChatPopout />;
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-100 text-slate-800' : 'bg-[#0f172a] text-slate-300'} font-sans antialiased pb-12 transition-colors duration-200`}>
      {/* Toast Notification Container */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-3 animate-slideIn ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/30'
            : toast.type === 'error'
            ? 'bg-rose-950/90 text-rose-400 border-rose-500/30'
            : 'bg-slate-950/95 text-sky-400 border-sky-500/30'
        }`}>
          <span className="h-2 w-2 rounded-full bg-current animate-ping"></span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header component with Global Search */}
      <Header
        alerts={alerts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        primaryActive={primaryActive}
        setPrimaryActive={setPrimaryActive}
        assets={assets}
        schedules={schedules}
        resources={resources}
        onSelectAsset={(asset) => {
          triggerToast(`Navigated to asset: ${asset.title}`, "info");
        }}
        onSelectSchedule={(sched) => {
          triggerToast(`Navigated to schedule block: ${sched.title}`, "info");
        }}
        onSelectResource={(res) => {
          triggerToast(`Navigated to resource: ${res.name}`, "info");
        }}
        onOpenHotkeys={() => setIsHotkeysOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onResetDemoData={handleResetDemoData}
      />

      {/* Core Body Container */}
      <main className="app-main-container mx-auto w-full max-w-7xl px-3.5 sm:px-6 md:px-8 py-5 sm:py-8 overflow-x-clip">
        {loadingFetch ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <RotateCw className="h-8 w-8 text-sky-400 animate-spin" />
            <h3 className="font-display font-semibold text-white">Booting CastPilot Automation Core...</h3>
            <p className="text-xs text-slate-500">Connecting to server-side broadcast orchestrators</p>
          </div>
        ) : (
          <>
            {/* Dashboard Overview tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden">
                {/* Version 2.0 Feature Spotlight Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/30 p-4 sm:p-6 shadow-2xl w-full max-w-full">
                  <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 relative z-10">
                    <div className="space-y-2 max-w-3xl min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono text-[10px] font-bold tracking-wider uppercase shrink-0">
                          <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
                          VERSION 2.0 PRO SUITE
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline truncate">
                          Engineered for High-Availability Linear Playout
                        </span>
                      </div>
                      <h2 className="text-base sm:text-xl font-bold font-display text-white tracking-tight">
                        Welcome to CastPilot Enterprise Operating System v2.0
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Version 2.0 unlocks Gemini AI Auto-Sort clustering in MAM, Live PFL Audio Auditioning, Multi-Language Internationalization (EN, ES, FR), SCTE-35 Ad Splice Monitoring, Standalone Overlay Popouts, and Automated Playlist Generation.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                      <button
                        onClick={() => setIsPresetsOpen(true)}
                        className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer"
                        title="Load 1-click broadcast channel archetypes"
                        id="dashboard-channel-presets-btn"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-slate-950 shrink-0" />
                        Channel Presets
                      </button>
                      <button
                        onClick={() => setActiveTab('standards')}
                        className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/25 border border-indigo-400/40 cursor-pointer"
                        id="dashboard-standards-btn"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                        SMPTE/EBU Standards
                      </button>
                      <button
                        onClick={() => setActiveTab('mam')}
                        className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-sky-500/20 cursor-pointer"
                        id="dashboard-mam-btn"
                      >
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        Explore AI MAM Vault
                      </button>
                      <button
                        onClick={() => setActiveTab('playout')}
                        className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/30 font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
                        id="dashboard-playout-btn"
                      >
                        <Radio className="h-3.5 w-3.5 shrink-0" />
                        Playout Monitor
                      </button>
                      <button
                        onClick={() => setActiveTab('manual')}
                        className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 font-medium text-xs transition cursor-pointer"
                        id="dashboard-manual-btn"
                      >
                        v2.0 Manual
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status KPI Widget row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-full">
                  {/* Playout Active channel */}
                  <div className="rounded-xl bg-slate-950 border border-slate-850 p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-lg min-w-0 overflow-hidden">
                    <span className="text-xl sm:text-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 p-2 sm:p-2.5 rounded-lg shrink-0">
                      📺
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono uppercase text-slate-400 truncate">On-Air Active Feed</div>
                      <div className="text-sm font-bold text-white truncate">{channelName}</div>
                    </div>
                  </div>

                  {/* Redundant Core failover */}
                  <div className="rounded-xl bg-slate-950 border border-slate-850 p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-lg min-w-0 overflow-hidden">
                    <span className="text-xl sm:text-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-2 sm:p-2.5 rounded-lg shrink-0">
                      🛡️
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono uppercase text-slate-400 break-words">Redundant Core State</div>
                      <div className="text-sm font-bold text-white uppercase break-words">
                        {primaryActive ? 'Primary Playout' : 'Secondary Fallback'}
                      </div>
                    </div>
                  </div>

                  {/* SCTE-35 Splicer state */}
                  <div className="rounded-xl bg-slate-950 border border-slate-850 p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-lg min-w-0">
                    <span className="text-xl sm:text-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 p-2 sm:p-2.5 rounded-lg shrink-0">
                      📡
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono uppercase text-slate-400 break-words">SCTE-35 Splicer</div>
                      <div className="text-sm font-bold text-white uppercase break-words">Online & Armed</div>
                    </div>
                  </div>

                  {/* System warnings counter */}
                  <div 
                    onClick={() => setActiveTab('scheduler')}
                    className="rounded-xl bg-slate-950 border border-slate-850 p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-lg min-w-0 cursor-pointer hover:border-slate-700 transition"
                    title="Click to view schedule diagnostics"
                  >
                    <span className={`text-xl sm:text-2xl p-2 sm:p-2.5 rounded-lg shrink-0 ${
                      unresolvedAlertsCount > 0 
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      ⚠️
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono uppercase text-slate-400 break-words">System Warnings</div>
                      <div className={`text-sm font-bold break-words ${unresolvedAlertsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {unresolvedAlertsCount} active alerts
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Brief Playout & Charts */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Compact Playout Monitor */}
                    <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Radio className="h-4 w-4 text-sky-400 animate-pulse" />
                          <h3 className="text-sm font-semibold text-white font-display">Active Playout Output Stream</h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('playout')}
                          className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
                        >
                          Open Stream Monitor
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>

                      <PlayoutController
                        schedules={schedules}
                        primaryActive={primaryActive}
                        onSkip={handlePlayoutSkip}
                        activePgmCameraId={activePgmCameraId}
                        activePvwCameraId={activePvwCameraId}
                        onSelectPgmCamera={handleSelectPgmCamera}
                        onSelectPvwCamera={handleSelectPvwCamera}
                      />
                    </div>

                    {/* Live Playlist Compiler & Media Loader */}
                    <LivePlaylistLoader
                      schedules={schedules}
                      setSchedules={setSchedules}
                      assets={assets}
                      channelName={channelName}
                      addToast={(message, type) => triggerToast(message, type)}
                      onCueMedia={(item) => setCuedMedia(item)}
                    />

                    {/* Integrated Analytics Chart */}
                    <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white font-display">Programmatic Ad Yield Dashboard</h3>
                        <button
                          onClick={() => setActiveTab('mam')}
                          className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
                        >
                          Manage Asset Inventory
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                      <MonetizationDashboard adData={adData} />
                    </div>
                  </div>

                  {/* Right Column: Conflicts Log and System Diagnostics */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Real-time System Alarms & Warnings */}
                    <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                          <h3 className="text-sm font-semibold text-white font-display flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                            Diagnostic Alarms & Blockages
                          </h3>
                          {alerts.length > 0 && (
                            <button
                              onClick={handleClearResolvedAlarms}
                              className="text-[10px] text-slate-400 hover:text-white hover:bg-slate-900 px-2 py-1 rounded border border-slate-800"
                            >
                              Clear Resolved
                            </button>
                          )}
                        </div>

                        <div className="space-y-3.5 max-h-96 overflow-y-auto no-scrollbar">
                          {alerts.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 text-xs">
                              All broadcast metrics safe. No warnings logged.
                            </div>
                          ) : (
                            alerts.map((alert) => (
                              <div
                                key={alert.id}
                                className={`p-4 rounded-xl border flex flex-col gap-2 transition ${
                                  alert.resolved
                                    ? 'bg-slate-900/30 border-slate-900 text-slate-500'
                                    : 'bg-slate-950 border-rose-500/20'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full shrink-0 ${alert.resolved ? 'bg-slate-600' : 'bg-rose-500 animate-ping'}`}></span>
                                    <span className={`font-semibold text-xs tracking-wide ${alert.resolved ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                      {alert.title}
                                    </span>
                                  </div>
                                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                    alert.severity === 'high' 
                                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' 
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                  }`}>
                                    {alert.severity}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-normal">{alert.description}</p>
                                
                                {!alert.resolved && (
                                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900 text-[10px]">
                                    <strong className="text-sky-400">Resolution Suggestion:</strong> {alert.recommendation}
                                  </div>
                                )}

                                {!alert.resolved && (
                                  <button
                                    onClick={() => handleResolveAlert(alert.id)}
                                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-semibold text-slate-300 hover:text-white border border-slate-800 self-end transition"
                                  >
                                    Apply Correction
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick System Action Card */}
                    <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-sky-400">
                        <Sparkles className="h-4 w-4" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider">Automated Playout Blueprint</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">
                        CastPilot automatically orchestrates high-concurrency shared resources and live scheduling playouts. Click below to fast-track active linear sequences.
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab('scheduler');
                          triggerToast("Opening AI Schedule Generator", "info");
                        }}
                        className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs rounded-lg shadow-md shadow-sky-500/10 border border-sky-400/10 flex items-center justify-center gap-1.5 transition"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        AI Sequence Builder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Scheduling Tab */}
            {activeTab === 'scheduler' && (
              <ScheduleManager
                schedules={schedules}
                assets={assets}
                channelName={channelName}
                setChannelName={setChannelName}
                onGenerateAI={handleGenerateAI}
                loadingAI={loadingAI}
                onManualAdd={handleManualAddSchedule}
                onDeleteScheduleItem={handleDeleteScheduleItem}
                onFillGaps={handleFillGaps}
                onUpdateSchedules={async (updated) => {
                  setSchedules(updated);
                  await saveSchedulesToServer(updated);
                }}
                schedulingMode={schedulingMode}
                setSchedulingMode={setSchedulingMode}
                addToast={triggerToast}
              />
            )}

            {/* Playout stream Monitor Tab */}
            {activeTab === 'playout' && (
              <div className="space-y-6">
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 shadow-lg">
                  <h2 className="font-display text-base font-bold text-white mb-2">Automated Linear & OTT Playout Deck</h2>
                  <p className="text-xs text-slate-400 max-w-2xl leading-normal mb-6">
                    Simulate active transmission and control downstream linear TV ads and backup failover nodes. This visual deck mocks precise player rendering states, ad insertion metrics, and feed synchronization.
                  </p>
                  <PlayoutController
                    schedules={schedules}
                    primaryActive={primaryActive}
                    onSkip={handlePlayoutSkip}
                    activePgmCameraId={activePgmCameraId}
                    activePvwCameraId={activePvwCameraId}
                    onSelectPgmCamera={handleSelectPgmCamera}
                    onSelectPvwCamera={handleSelectPvwCamera}
                  />
                </div>
              </div>
            )}

            {/* Broadcast Standards & Compliance (SMPTE / EBU / ITU-R) Tab */}
            {activeTab === 'standards' && (
              <BroadcastStandardsSuite addToast={triggerToast} />
            )}

            {/* Media Library (MAM) Tab */}
            {activeTab === 'mam' && (
              <AssetManager
                assets={assets}
                onAddAsset={handleAddAsset}
                onEnrichAsset={handleEnrichAsset}
                onUpdateAsset={handleUpdateAsset}
                onDeleteAsset={handleDeleteAsset}
                enrichingAssetId={enrichingAssetId}
                schedulingMode={schedulingMode}
                setSchedulingMode={setSchedulingMode}
                addToast={triggerToast}
                onCueMedia={(asset) => setCuedMedia(asset)}
              />
            )}

            {/* Script Prompter Tab */}
            {activeTab === 'prompter' && (
              <ScriptPrompter
                schedules={schedules}
                channelName={channelName}
                addToast={(message, type) => triggerToast(message, type)}
              />
            )}

            {/* Engagement Studio Tab */}
            {activeTab === 'engagement' && (
              <EngagementStudio
                channelName={channelName}
                addToast={(message, type) => triggerToast(message, type)}
              />
            )}

            {/* Multi-Cam NDI & WebRTC Ingestion Tab */}
            {activeTab === 'multicam' && (
              <MultiCamNdiIngestion
                addToast={(message, type) => triggerToast(message, type)}
                activePgmCameraId={activePgmCameraId}
                activePvwCameraId={activePvwCameraId}
                onSelectPgmCamera={handleSelectPgmCamera}
                onSelectPvwCamera={handleSelectPvwCamera}
              />
            )}

            {/* Resource Allocator Tab */}
            {activeTab === 'resources' && (
              <ResourceManager
                resources={resources}
                alerts={alerts}
                onBookResource={handleBookResource}
                onReleaseResource={handleReleaseResource}
                loadingBook={loadingBook}
              />
            )}

            {/* Streaming & VOD Syndication Tab */}
            {activeTab === 'syndication' && (
              <SyndicationManager
                schedules={schedules}
                addToast={(message, type) => triggerToast(message, type)}
              />
            )}

            {/* Channel Setup & Profile Access Tab */}
            {activeTab === 'setup' && (
              <ChannelSetup
                channelName={channelName}
                setChannelName={setChannelName}
                addToast={(message, type) => triggerToast(message, type)}
              />
            )}

            {/* Native Apps & Desktop Packaging Tab */}
            {activeTab === 'export' && (
              <ExportHub
                channelName={channelName}
                addToast={(message, type) => triggerToast(message, type)}
              />
            )}

            {/* User Manual & Academy Tab */}
            {activeTab === 'manual' && (
              <UserManual
                setActiveTab={setActiveTab}
                addToast={(message, type) => triggerToast(message, type)}
                onOpenHotkeys={() => setIsHotkeysOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Global Broadcast Master Control Footer */}
      <footer className={`mt-12 border-t ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-900 bg-slate-950/90'} py-6 px-4 sm:px-6 transition-colors`}>
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-4 text-center md:text-left">
            <div className={`flex items-center gap-2 font-display font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('footerSystem')}</span>
              <span className="text-slate-400">|</span>
              <span className="text-sky-500 font-semibold">{t('footerCompany')}</span>
            </div>
            <p className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              {t('footerArchitect')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono">
            <button
              onClick={() => setIsTourOpen(true)}
              className="px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer font-sans"
              title="Interactive Broadcast Tour & Industry Standards Academy"
            >
              🎓 Academy Tour
            </button>
            <button
              onClick={handleResetDemoData}
              className="px-2.5 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition flex items-center gap-1.5 cursor-pointer font-sans"
              title="Reload Full Out-of-the-Box Dummy Content"
            >
              ⚡ Reset Demo Data
            </button>
            <button
              onClick={() => setIsPresetsOpen(true)}
              className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              Presets
            </button>
            <button
              onClick={() => setIsHotkeysOpen(true)}
              className="px-2.5 py-1 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              Hotkeys [ ? ]
            </button>
            <span className={`${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'} border px-2.5 py-1 rounded-md`}>
              SCTE-35 ANSI/SCTE 2019 Ready
            </span>
            <span className={`${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'} border px-2.5 py-1 rounded-md`}>
              SMPTE 2059-2 PTP Sync
            </span>
            <span className={`${theme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-900 border-slate-800 text-emerald-400'} border px-2.5 py-1 rounded-md font-semibold`}>
              Uptime 99.999% SLA
            </span>
          </div>
        </div>
        <div className={`mx-auto max-w-7xl mt-4 pt-3 border-t ${theme === 'light' ? 'border-slate-100 text-slate-500' : 'border-slate-900/60 text-slate-600'} flex flex-col sm:flex-row justify-center items-center text-center text-[10px] sm:text-[11px] gap-1.5 sm:gap-3 w-full`}>
          <span className="text-center">© {new Date().getFullYear()} {t('footerRights')}</span>
          <span className="hidden sm:inline text-slate-400/40 select-none">•</span>
          <span className="text-center">{t('footerEdition')}</span>
        </div>
      </footer>

      {/* Studio Pre-Fade Listen Cue Deck */}
      <PflCueDeck cuedItem={cuedMedia} onClose={() => setCuedMedia(null)} />

      {/* Master Control Hotkeys HUD Modal */}
      <StudioHotkeysModal
        isOpen={isHotkeysOpen}
        onClose={() => setIsHotkeysOpen(false)}
      />

      {/* 1-Click Broadcast Channel Archetype Presets Modal */}
      <ChannelPresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onApplyPreset={handleApplyPreset}
      />

      {/* Interactive Broadcast Academy & Onboarding Tour Modal */}
      <InteractiveBroadcastTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        setActiveTab={setActiveTab}
        onTriggerTestLive={handleTriggerTestLive}
      />
    </div>
  );
}
