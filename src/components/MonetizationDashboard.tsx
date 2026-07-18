import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, Percent, TrendingUp, BarChart3, Database, Sparkles, Globe } from 'lucide-react';
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
