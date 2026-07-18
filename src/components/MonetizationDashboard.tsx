import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, Percent, TrendingUp, BarChart3, Database, Sparkles, Globe, Play, Square, Radio, ShieldCheck, Zap, Settings, Activity, RefreshCw } from 'lucide-react';
import { AdPerformance } from '../types';

interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // exchange rate relative to 1 USD
  name: string;
  flag: string;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, name: 'British Pound', flag: '🇬🇧' },
  JPY: { code: 'JPY', symbol: '¥', rate: 157.5, name: 'Japanese Yen', flag: '🇯🇵' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.50, name: 'Australian Dollar', flag: '🇦🇺' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.36, name: 'Canadian Dollar', flag: '🇨🇦' },
  INR: { code: 'INR', symbol: '₹', rate: 83.4, name: 'Indian Rupee', flag: '🇮🇳' },
  SGD: { code: 'SGD', symbol: 'S$', rate: 1.34, name: 'Singapore Dollar', flag: '🇸🇬' },
  CHF: { code: 'CHF', symbol: 'CHF', rate: 0.89, name: 'Swiss Franc', flag: '🇨🇭' },
  CNY: { code: 'CNY', symbol: '¥', rate: 7.25, name: 'Chinese Yuan', flag: '🇨🇳' },
  ZAR: { code: 'ZAR', symbol: 'R', rate: 18.2, name: 'South African Rand', flag: '🇿🇦' },
  BRL: { code: 'BRL', symbol: 'R$', rate: 5.30, name: 'Brazilian Real', flag: '🇧🇷' },
  AED: { code: 'AED', symbol: 'AED', rate: 3.67, name: 'UAE Dirham', flag: '🇦🇪' },
};

function detectLocalCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      if (tz.startsWith('America/')) {
        if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles') || tz.includes('Denver') || tz.includes('Phoenix')) return 'USD';
        if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal')) return 'CAD';
        if (tz.includes('Sao_Paulo') || tz.includes('Manaus') || tz.includes('Recife')) return 'BRL';
      }
      if (tz.startsWith('Europe/')) {
        if (tz.includes('London')) return 'GBP';
        if (tz.includes('Zurich')) return 'CHF';
        return 'EUR'; // Default to Euro for other Europe
      }
      if (tz.startsWith('Asia/')) {
        if (tz.includes('Tokyo')) return 'JPY';
        if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('Delhi')) return 'INR';
        if (tz.includes('Singapore')) return 'SGD';
        if (tz.includes('Shanghai') || tz.includes('Chongqing') || tz.includes('Harbin')) return 'CNY';
        if (tz.includes('Dubai')) return 'AED';
      }
      if (tz.startsWith('Australia/')) return 'AUD';
      if (tz.startsWith('Africa/')) {
        if (tz.includes('Johannesburg')) return 'ZAR';
      }
    }

    // Fallback based on browser preferred languages
    const locale = navigator.language || 'en-US';
    if (locale.endsWith('-US')) return 'USD';
    if (locale.endsWith('-GB')) return 'GBP';
    if (locale.endsWith('-JP')) return 'JPY';
    if (locale.endsWith('-AU')) return 'AUD';
    if (locale.endsWith('-CA')) return 'CAD';
    if (locale.endsWith('-IN')) return 'INR';
    if (locale.endsWith('-SG')) return 'SGD';
    if (locale.endsWith('-CH')) return 'CHF';
    if (locale.endsWith('-CN')) return 'CNY';
    if (locale.endsWith('-ZA')) return 'ZAR';
    if (locale.endsWith('-BR')) return 'BRL';
    if (locale.endsWith('-AE')) return 'AED';
    
    if (['de', 'fr', 'it', 'es', 'nl', 'be', 'pt', 'fi', 'gr', 'ie'].some(lang => locale.startsWith(lang))) return 'EUR';
    if (locale.startsWith('ja')) return 'JPY';
    if (locale.startsWith('hi')) return 'INR';
    if (locale.startsWith('zh')) return 'CNY';
  } catch (e) {
    console.warn('Error detecting browser language or timezone:', e);
  }
  return 'USD';
}

interface MonetizationDashboardProps {
  adData: AdPerformance[];
}

export default function MonetizationDashboard({ adData }: MonetizationDashboardProps) {
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [avgFillRate, setAvgFillRate] = useState<number>(0);
  const [avgCpm, setAvgCpm] = useState<number>(0);

  // Localization / Geolocation States
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [detectedLocation, setDetectedLocation] = useState<string>('Detecting local region...');
  const [detectionSource, setDetectionSource] = useState<'local' | 'api' | 'manual'>('local');

  // SCTE-35 Splicer & Playout Automation States
  const [scteState, setScteState] = useState({
    adTriggered: false,
    scteStatus: "Idle / Monitoring",
    preRollEnabled: true,
    midRollEnabled: true,
    postRollEnabled: false,
    preRollDuration: 30,
    midRollDuration: 60,
    postRollDuration: 30,
    autoTrigger: true,
    targetingProfile: "programmatic",
    provider: "Google Ad Manager"
  });

  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([
    "[" + new Date().toLocaleTimeString('en-US', { hour12: false }) + "] Playout simulation engine armed and standby."
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setSimLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const fetchScteState = async () => {
    try {
      const res = await fetch('/api/scte/state');
      if (res.ok) {
        const data = await res.json();
        setScteState(data);
      }
    } catch (err) {
      console.warn("Failed to fetch SCTE state on MonetizationDashboard:", err);
    }
  };

  useEffect(() => {
    fetchScteState();
    const interval = setInterval(fetchScteState, 1500);
    return () => clearInterval(interval);
  }, []);

  const updateScteConfig = async (updatedFields: Partial<typeof scteState>) => {
    setScteState(prev => ({ ...prev, ...updatedFields }));
    try {
      const res = await fetch('/api/scte/update-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const data = await res.json();
        setScteState(data.state);
      }
    } catch (err) {
      console.error("Failed to update SCTE configuration:", err);
    }
  };

  const triggerDirectSplice = async (slotType: "pre-roll" | "mid-roll" | "post-roll") => {
    try {
      addLog(`[SCTE-35] Sending manual splice cue Command [0xFC] for ${slotType.toUpperCase()}...`);
      const res = await fetch('/api/scte/trigger-splice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotType })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setScteState(data.state);
          addLog(`[SCTE-35] Splice Command acknowledged. Playout server injecting SCTE-35 ad break.`);
        } else {
          addLog(`[SCTE-35] Splice skipped: ${data.message}`);
        }
      }
    } catch (err) {
      console.error("Failed to trigger direct splice:", err);
      addLog(`[SCTE-35] Network error triggering splice.`);
    }
  };

  // Run simulated broadcast playout cycle
  useEffect(() => {
    if (!simRunning) return;

    let interval: NodeJS.Timeout;
    let currentPct = 0;
    
    const triggered = {
      preRoll: false,
      midRoll: false,
      postRoll: false
    };

    addLog("🎬 Starting Compressed Broadcast Cycle (60s simulation)...");

    interval = setInterval(() => {
      currentPct += 2;
      setSimProgress(currentPct);

      if (currentPct === 2) {
        if (scteState.preRollEnabled && !triggered.preRoll) {
          triggered.preRoll = true;
          addLog("🚀 Playout T+0s: SCTE-35 Splicer matching PRE-ROLL rule!");
          triggerDirectSplice("pre-roll");
        } else {
          addLog("ℹ️ Playout T+0s: Pre-Roll ad slot is disabled. Bypassed.");
        }
      }

      if (currentPct === 50) {
        if (scteState.midRollEnabled && !triggered.midRoll) {
          triggered.midRoll = true;
          addLog("🚀 Playout T+30s: SCTE-35 Splicer matching MID-ROLL rule!");
          triggerDirectSplice("mid-roll");
        } else {
          addLog("ℹ️ Playout T+30s: Mid-Roll ad slot is disabled. Bypassed.");
        }
      }

      if (currentPct >= 100) {
        if (scteState.postRollEnabled && !triggered.postRoll) {
          triggered.postRoll = true;
          addLog("🚀 Playout T+60s: SCTE-35 Splicer matching POST-ROLL rule!");
          triggerDirectSplice("post-roll");
        } else {
          addLog("ℹ️ Playout T+60s: Post-Roll ad slot is disabled. Bypassed.");
        }
        
        clearInterval(interval);
        setSimRunning(false);
        addLog("✅ Broadcast playout cycle test completed.");
      }
    }, 250); // complete cycle in ~12s

    return () => clearInterval(interval);
  }, [simRunning, scteState.preRollEnabled, scteState.midRollEnabled, scteState.postRollEnabled]);

  useEffect(() => {
    // 1. Instant timezone detection fallback
    const fallbackCode = detectLocalCurrency();
    setSelectedCurrency(fallbackCode);
    
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local System';
      const cleanTz = tz.split('/').pop()?.replace('_', ' ') || tz;
      setDetectedLocation(`Estimated: ${cleanTz} (via browser)`);
    } catch {
      setDetectedLocation('Estimated: Local Region (via browser)');
    }

    // 2. High-precision Geolocation fetch
    const fetchGeoLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          if (data && data.currency) {
            const apiCurrency = data.currency.toUpperCase();
            if (CURRENCIES[apiCurrency]) {
              setSelectedCurrency(apiCurrency);
              setDetectionSource('api');
              const locStr = [data.city, data.region, data.country_name].filter(Boolean).join(', ');
              setDetectedLocation(`Detected: ${locStr || 'Your Location'} (via IP Geolocation)`);
            }
          }
        }
      } catch (err) {
        console.warn('Dynamic IP Geolocation unavailable, relying on browser local estimates:', err);
      }
    };

    fetchGeoLocation();
  }, []);

  useEffect(() => {
    if (adData.length === 0) return;
    
    const rev = adData.reduce((acc, cur) => acc + cur.revenue, 0);
    const fill = adData.reduce((acc, cur) => acc + cur.fillRate, 0) / adData.length;
    const cpmVal = adData.reduce((acc, cur) => acc + cur.cpm, 0) / adData.length;

    setTotalRevenue(rev);
    setAvgFillRate(parseFloat(fill.toFixed(1)));
    setAvgCpm(parseFloat(cpmVal.toFixed(2)));
  }, [adData]);

  const currentConfig = CURRENCIES[selectedCurrency] || CURRENCIES.USD;

  // Converts and formats any programmatic ad value based on currently configured rate
  const formatCurrency = (valueInUSD: number, fractionDigits = 0) => {
    const converted = valueInUSD * currentConfig.rate;
    return new Intl.NumberFormat(navigator.language || 'en-US', { 
      style: 'currency', 
      currency: currentConfig.code, 
      maximumFractionDigits: fractionDigits 
    }).format(converted);
  };

  // Convert raw array metrics to local currency so chart rendering values scale correctly
  const convertedAdData = adData.map(item => ({
    ...item,
    revenue: parseFloat((item.revenue * currentConfig.rate).toFixed(2)),
    cpm: parseFloat((item.cpm * currentConfig.rate).toFixed(2))
  }));

  return (
    <div className="space-y-6">
      {/* Location-based Currency Config Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-850 bg-slate-900/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Globe className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">Dynamic Yield Localization</span>
              <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                detectionSource === 'manual'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : detectionSource === 'api' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
              }`}>
                {detectionSource === 'manual' ? 'Manual Override' : detectionSource === 'api' ? 'High Precision IP' : 'Timezone Estimate'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{detectedLocation}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <span className="text-[10px] font-mono uppercase text-slate-500">Currency:</span>
          <select
            value={selectedCurrency}
            onChange={(e) => {
              setSelectedCurrency(e.target.value);
              setDetectionSource('manual');
            }}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 hover:border-slate-700 transition font-medium cursor-pointer"
          >
            {Object.values(CURRENCIES).map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.flag} {curr.code} ({curr.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Forecasted Revenue */}
        <div className="rounded-xl border border-slate-850 bg-slate-950/70 p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium tracking-wide">Forecasted Daily Ad Revenue</span>
            <div className="font-display text-2xl font-bold text-white">
              {formatCurrency(totalRevenue, 0)}
            </div>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>+18.4% vs previous cycle</span>
            </p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <span className="text-lg font-bold font-mono">{currentConfig.symbol}</span>
          </div>
        </div>

        {/* Ad Fill Rate */}
        <div className="rounded-xl border border-slate-850 bg-slate-950/70 p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium tracking-wide">Average Ad Fill Rate</span>
            <div className="font-display text-2xl font-bold text-white">
              {avgFillRate}%
            </div>
            <p className="text-[10px] text-sky-400 flex items-center gap-1">
              <span>99.7% Peak (Primetime Hour)</span>
            </p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        {/* CPM Valuation */}
        <div className="rounded-xl border border-slate-850 bg-slate-950/70 p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium tracking-wide">Average Yield CPM</span>
            <div className="font-display text-2xl font-bold text-white">
              {formatCurrency(avgCpm, 2)}
            </div>
            <p className="text-[10px] text-slate-400">
              Premium linear rates apply
            </p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Active SCTE Cue Slots */}
        <div className="rounded-xl border border-slate-850 bg-slate-950/70 p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium tracking-wide">SCTE-35 Active Cue Slots</span>
            <div className="font-display text-2xl font-bold text-white">
              71
            </div>
            <p className="text-[10px] text-slate-400">
              Direct and Programmatic RTB ready
            </p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Database className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Yield Curve Graph (Area Chart) */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display text-sm font-semibold text-white">Revenue Performance Curve</h3>
              <p className="text-xs text-slate-400">Programmatic real-time bidding yields across broadcast cycles</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
              Live Forecasts
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={convertedAdData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeSlot" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${currentConfig.symbol}${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#10b981', fontSize: '12px' }}
                  formatter={(value: any) => [`${currentConfig.symbol}${Number(value).toFixed(2)}`, 'Localized Revenue']}
                />
                <Area type="monotone" dataKey="revenue" name={`Calculated Revenue (${currentConfig.symbol})`} stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CPM & Fill Rates (Bar Chart) */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display text-sm font-semibold text-white">Fill Rate vs CPM Valuation</h3>
              <p className="text-xs text-slate-400">Ad slot inventory occupancy contrasted with cost-per-mille cost benchmarks</p>
            </div>
            <BarChart3 className="h-4.5 w-4.5 text-sky-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={convertedAdData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeSlot" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value: any, name: any) => {
                    if (name.includes('CPM')) {
                      return [`${currentConfig.symbol}${Number(value).toFixed(2)}`, 'Avg CPM'];
                    }
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="fillRate" name="Fill Rate (%)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cpm" name={`Avg CPM (${currentConfig.symbol})`} fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SCTE-35 Splicer & Playout Automation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-8">
        {/* Left Side: Ad Placement Toggles & Core Config (7 Columns) */}
        <div className="lg:col-span-7 rounded-xl bg-slate-950 border border-slate-800 p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-5">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-rose-500 animate-spin-slow" />
                <div>
                  <h3 className="font-display text-sm font-semibold text-white">SCTE-35 Splicer Ad Insertion Policy</h3>
                  <p className="text-[11px] text-slate-500">Configure pre-roll, mid-roll, and post-roll programmatic triggers</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                <span className={`h-2 w-2 rounded-full ${scteState.adTriggered ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                  {scteState.adTriggered ? "Splicing Active" : "Splicer Armed"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Pre-Roll Card */}
              <div className={`p-4 rounded-xl border transition-colors ${scteState.preRollEnabled ? 'bg-slate-900/40 border-amber-500/20' : 'bg-slate-950/60 border-slate-900'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${scteState.preRollEnabled ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-900 text-slate-500'}`}>
                      PRE
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Pre-Roll Ad Slot Trigger</h4>
                      <p className="text-[10px] text-slate-500">Automate commercial break insertion before stream playback begins</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Toggle */}
                    <button
                      onClick={() => updateScteConfig({ preRollEnabled: !scteState.preRollEnabled })}
                      className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${scteState.preRollEnabled ? 'bg-emerald-600' : 'bg-slate-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${scteState.preRollEnabled ? 'translate-x-4.5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {scteState.preRollEnabled && (
                  <div className="mt-3 pt-3 border-t border-slate-905/60 flex items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Duration</span>
                      <select
                        value={scteState.preRollDuration}
                        onChange={(e) => updateScteConfig({ preRollDuration: Number(e.target.value) })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
                      >
                        <option value={15}>15 Seconds</option>
                        <option value={30}>30 Seconds</option>
                        <option value={45}>45 Seconds</option>
                        <option value={60}>60 Seconds</option>
                      </select>
                    </div>

                    <button
                      onClick={() => triggerDirectSplice("pre-roll")}
                      disabled={scteState.adTriggered}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 rounded text-[10px] font-mono text-amber-400 transition font-bold"
                    >
                      Manual Inject [0xFC]
                    </button>
                  </div>
                )}
              </div>

              {/* Mid-Roll Card */}
              <div className={`p-4 rounded-xl border transition-colors ${scteState.midRollEnabled ? 'bg-slate-900/40 border-sky-500/20' : 'bg-slate-950/60 border-slate-900'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${scteState.midRollEnabled ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-slate-900 text-slate-500'}`}>
                      MID
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Mid-Roll Ad Slot Trigger</h4>
                      <p className="text-[10px] text-slate-500">Splice programmatic ad break at the calculated program midpoints</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Toggle */}
                    <button
                      onClick={() => updateScteConfig({ midRollEnabled: !scteState.midRollEnabled })}
                      className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${scteState.midRollEnabled ? 'bg-emerald-600' : 'bg-slate-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${scteState.midRollEnabled ? 'translate-x-4.5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {scteState.midRollEnabled && (
                  <div className="mt-3 pt-3 border-t border-slate-905/60 flex items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Duration</span>
                      <select
                        value={scteState.midRollDuration}
                        onChange={(e) => updateScteConfig({ midRollDuration: Number(e.target.value) })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-sky-500"
                      >
                        <option value={30}>30 Seconds</option>
                        <option value={60}>60 Seconds</option>
                        <option value={90}>90 Seconds</option>
                        <option value={120}>120 Seconds</option>
                      </select>
                    </div>

                    <button
                      onClick={() => triggerDirectSplice("mid-roll")}
                      disabled={scteState.adTriggered}
                      className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 rounded text-[10px] font-mono text-sky-400 transition font-bold"
                    >
                      Manual Inject [0xFC]
                    </button>
                  </div>
                )}
              </div>

              {/* Post-Roll Card */}
              <div className={`p-4 rounded-xl border transition-colors ${scteState.postRollEnabled ? 'bg-slate-900/40 border-rose-500/20' : 'bg-slate-950/60 border-slate-900'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${scteState.postRollEnabled ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-900 text-slate-500'}`}>
                      POST
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Post-Roll Ad Slot Trigger</h4>
                      <p className="text-[10px] text-slate-500">Inject SCTE markers immediately upon program playback ending</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Toggle */}
                    <button
                      onClick={() => updateScteConfig({ postRollEnabled: !scteState.postRollEnabled })}
                      className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${scteState.postRollEnabled ? 'bg-emerald-600' : 'bg-slate-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${scteState.postRollEnabled ? 'translate-x-4.5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {scteState.postRollEnabled && (
                  <div className="mt-3 pt-3 border-t border-slate-905/60 flex items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Duration</span>
                      <select
                        value={scteState.postRollDuration}
                        onChange={(e) => updateScteConfig({ postRollDuration: Number(e.target.value) })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-rose-500"
                      >
                        <option value={15}>15 Seconds</option>
                        <option value={30}>30 Seconds</option>
                        <option value={45}>45 Seconds</option>
                        <option value={60}>60 Seconds</option>
                      </select>
                    </div>

                    <button
                      onClick={() => triggerDirectSplice("post-roll")}
                      disabled={scteState.adTriggered}
                      className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 rounded text-[10px] font-mono text-rose-400 transition font-bold"
                    >
                      Manual Inject [0xFC]
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* General Splicer Parameters */}
            <div className="mt-5 grid grid-cols-2 gap-4 pt-4 border-t border-slate-900">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 font-bold">Targeting Profile</label>
                <select
                  value={scteState.targetingProfile}
                  onChange={(e) => updateScteConfig({ targetingProfile: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="programmatic">Programmatic OpenRTB Bidding</option>
                  <option value="direct-sold">Direct-Sold Guaranteed</option>
                  <option value="hybrid">Hybrid Waterfall Allocation</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 font-bold">Primary SSP Provider</label>
                <select
                  value={scteState.provider}
                  onChange={(e) => updateScteConfig({ provider: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="Google Ad Manager">Google Ad Manager 360</option>
                  <option value="OpenX">OpenX Ad Exchange</option>
                  <option value="SpotX">SpotX / Magnite FAST</option>
                  <option value="FreeWheel">FreeWheel MRM</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Stream Timeline & Auto Playout Simulation (5 Columns) */}
        <div className="lg:col-span-5 rounded-xl bg-slate-950 border border-slate-800 p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3.5 pb-3 border-b border-slate-900">
              <Activity className="h-4.5 w-4.5 text-sky-400" />
              <div>
                <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider">Active Stream Timeline & Auto-Splicer</h4>
                <p className="text-[10px] text-slate-500">Live feed preview mapping armed SCTE blocks</p>
              </div>
            </div>

            {/* Graphic Timeline Visualization */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-900 mb-5">
              <div className="text-[9px] font-mono text-slate-500 uppercase mb-3 flex items-center justify-between font-bold">
                <span>Stream Segment Map</span>
                <span>Program Block Lifecycle</span>
              </div>

              <div className="flex items-stretch gap-1.5 h-14 bg-slate-950 rounded-lg p-1.5 border border-slate-900 overflow-hidden">
                {/* Pre-Roll Segment */}
                <div className={`relative flex-1 rounded flex flex-col items-center justify-center transition-all ${
                  scteState.preRollEnabled 
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                    : 'bg-slate-900 text-slate-600 border border-slate-800 line-through opacity-40'
                }`}>
                  <span className="font-mono text-[9px] font-bold">PRE-ROLL</span>
                  <span className="text-[7px] font-mono tracking-tighter mt-0.5">
                    {scteState.preRollEnabled ? `${scteState.preRollDuration}s Armed` : 'Bypassed'}
                  </span>
                </div>

                {/* Main Program Segment 1 */}
                <div className="flex-[2.5] bg-sky-950/20 border border-sky-500/20 rounded text-sky-400 flex flex-col items-center justify-center">
                  <span className="font-mono text-[9px] font-bold">PROGRAM PT. 1</span>
                  <span className="text-[7px] font-mono text-slate-500 mt-0.5">Stream Payload</span>
                </div>

                {/* Mid-Roll Segment */}
                <div className={`relative flex-[1.5] rounded flex flex-col items-center justify-center transition-all ${
                  scteState.midRollEnabled 
                    ? 'bg-sky-500/10 border border-sky-500/30 text-sky-400' 
                    : 'bg-slate-900 text-slate-600 border border-slate-800 line-through opacity-40'
                }`}>
                  <span className="font-mono text-[9px] font-bold">MID-ROLL</span>
                  <span className="text-[7px] font-mono tracking-tighter mt-0.5">
                    {scteState.midRollEnabled ? `${scteState.midRollDuration}s Armed` : 'Bypassed'}
                  </span>
                </div>

                {/* Main Program Segment 2 */}
                <div className="flex-[2.5] bg-sky-950/20 border border-sky-500/20 rounded text-sky-400 flex flex-col items-center justify-center">
                  <span className="font-mono text-[9px] font-bold">PROGRAM PT. 2</span>
                  <span className="text-[7px] font-mono text-slate-500 mt-0.5">Stream Payload</span>
                </div>

                {/* Post-Roll Segment */}
                <div className={`relative flex-1 rounded flex flex-col items-center justify-center transition-all ${
                  scteState.postRollEnabled 
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
                    : 'bg-slate-900 text-slate-600 border border-slate-800 line-through opacity-40'
                }`}>
                  <span className="font-mono text-[9px] font-bold">POST-ROLL</span>
                  <span className="text-[7px] font-mono tracking-tighter mt-0.5">
                    {scteState.postRollEnabled ? `${scteState.postRollDuration}s Armed` : 'Bypassed'}
                  </span>
                </div>
              </div>

              {/* Progress pointer if simulation is running */}
              {simRunning && (
                <div className="mt-3.5 space-y-2">
                  <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-200"
                      style={{ width: `${simProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 font-bold">
                    <span>PLAYOUT ELAPSED: {Math.round(simProgress * 0.6)}s</span>
                    <span className="text-emerald-400 animate-pulse">SIMULATION PLAYING</span>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Technical logs console */}
            <div className="bg-black rounded-xl p-4 border border-slate-900">
              <div className="text-[9px] font-mono text-slate-500 uppercase mb-2 flex items-center justify-between font-bold">
                <span>Splicer Core Diagnostics Logs</span>
                <span className="text-rose-500 font-bold">Live Status: {scteState.scteStatus}</span>
              </div>
              <div className="h-[105px] overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1.5 select-text no-scrollbar">
                {simLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`leading-relaxed border-l-2 pl-2 ${
                      log.includes('🚀') ? 'text-amber-400 border-amber-500' : 
                      log.includes('🎬') ? 'text-sky-400 border-sky-500' :
                      log.includes('✅') ? 'text-emerald-400 border-emerald-500' :
                      log.includes('[SCTE-35]') ? 'text-rose-400 border-rose-500 font-bold' : 'text-slate-500 border-slate-800'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            {!simRunning ? (
              <button
                onClick={() => {
                  setSimRunning(true);
                  setSimProgress(0);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg border border-emerald-500 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Play className="h-4 w-4" />
                Run Live Playout Ad Test
              </button>
            ) : (
              <button
                onClick={() => {
                  setSimRunning(false);
                  addLog("🛑 Playout test aborted manually.");
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg border border-rose-500 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Square className="h-4 w-4" />
                Abort Broadcast Test
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Programmatic Direct Ad Connectors manual guide */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-sky-400" />
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">AI programmatic traffic optimizer</h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          CastPilot dynamically evaluates schedule slots to insert local commercial blocks that maximize regional ad revenue yields. Live bidding connectors integrate with Google Ad Manager, OpenX, and premium FAST platform supply partners to inject micro-targeted programmatic ad overlays in real-time.
        </p>
      </div>
    </div>
  );
}
