import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, Percent, TrendingUp, BarChart3, Database, Sparkles } from 'lucide-react';
import { AdPerformance } from '../types';

interface MonetizationDashboardProps {
  adData: AdPerformance[];
}

export default function MonetizationDashboard({ adData }: MonetizationDashboardProps) {
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [avgFillRate, setAvgFillRate] = useState<number>(0);
  const [avgCpm, setAvgCpm] = useState<number>(0);

  useEffect(() => {
    if (adData.length === 0) return;
    
    const rev = adData.reduce((acc, cur) => acc + cur.revenue, 0);
    const fill = adData.reduce((acc, cur) => acc + cur.fillRate, 0) / adData.length;
    const cpmVal = adData.reduce((acc, cur) => acc + cur.cpm, 0) / adData.length;

    setTotalRevenue(rev);
    setAvgFillRate(parseFloat(fill.toFixed(1)));
    setAvgCpm(parseFloat(cpmVal.toFixed(2)));
  }, [adData]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Forecasted Revenue */}
        <div className="rounded-xl border border-slate-850 bg-slate-950/70 p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium tracking-wide">Forecasted Daily Ad Revenue</span>
            <div className="font-display text-2xl font-bold text-white">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>+18.4% vs previous cycle</span>
            </p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
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
              ${avgCpm.toFixed(2)}
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
              <AreaChart data={adData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeSlot" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#10b981', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Calculated Revenue ($)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
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
              <BarChart data={adData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeSlot" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="fillRate" name="Fill Rate (%)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cpm" name="Avg CPM ($)" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
