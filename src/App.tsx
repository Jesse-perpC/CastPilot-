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
import ExportHub from './components/ExportHub';
import UserManual from './components/UserManual';
import StandaloneOverlay from './components/StandaloneOverlay';
import StandaloneChatPopout from './components/StandaloneChatPopout';
import PflCueDeck from './components/PflCueDeck';
import { ScheduleItem, ContentAsset, ResourceAsset, ConflictAlert, AdPerformance } from './types';

export default function App() {
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

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data from full-stack Express server
  const fetchAllData = async () => {
    try {
      const [resSched, resAssets, resRes, resAlerts, resMonetization] = await Promise.all([
        fetch('/api/schedule'),
        fetch('/api/mam/assets'),
        fetch('/api/resources'),
        fetch('/api/conflicts'),
        fetch('/api/monetization')
      ]);

      const dataSched = await resSched.json();
      const dataAssets = await resAssets.json();
      const dataRes = await resRes.json();
      const dataAlerts = await resAlerts.json();
      const dataMonetization = await resMonetization.json();

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
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans antialiased pb-12">
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

      {/* Header component */}
      <Header
        alerts={alerts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        primaryActive={primaryActive}
        setPrimaryActive={setPrimaryActive}
      />

      {/* Core Body Container */}
      <main className="app-main-container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6 sm:py-8">
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
              <div className="space-y-8">
                {/* Status KPI Widget row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Playout Active channel */}
                  <div className="rounded-xl bg-slate-950 border border-slate-850 p-4 flex items-center gap-4 shadow-lg">
                    <span className="text-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 p-2.5 rounded-lg">
                      📺
                    </span>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">On-Air Active Feed</div>
                      <div className="text-sm font-bold text-white truncate">{channelName}</div>
                    </div>
                  </div>

                  {/* Redundant Core failover */}
                  <div className="rounded-xl bg-slate-950 border border-slate-850 p-4 flex items-center gap-4 shadow-lg">
                    <span className="text-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 p-2.5 rounded-lg">
                      🛡️
                    </span>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">Redundant Core State</div>
                      <div className="text-sm font-bold text-white uppercase">
                        {primaryActive ? 'Primary Playout' : 'Secondary Fallback'}
                      </div>
                    </div>
                  </div>

                  {/* SCTE-35 Splicer state */}
                  <div className="rounded-xl bg-slate-950 border border-slate-850 p-4 flex items-center gap-4 shadow-lg">
                    <span className="text-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 p-2.5 rounded-lg">
                      📡
                    </span>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">SCTE-35 Splicer</div>
                      <div className="text-sm font-bold text-white uppercase">Online & Triggerable</div>
                    </div>
                  </div>

                  {/* System warnings counter */}
                  <div className="rounded-xl bg-slate-950 border border-slate-850 p-4 flex items-center gap-4 shadow-lg">
                    <span className={`text-2xl p-2.5 rounded-lg ${
                      unresolvedAlertsCount > 0 
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      ⚠️
                    </span>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400">System Warnings</div>
                      <div className={`text-sm font-bold ${unresolvedAlertsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
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
                  />
                </div>
              </div>
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
              />
            )}
          </>
        )}
      </main>

      {/* Studio Pre-Fade Listen Cue Deck */}
      <PflCueDeck cuedItem={cuedMedia} onClose={() => setCuedMedia(null)} />
    </div>
  );
}
