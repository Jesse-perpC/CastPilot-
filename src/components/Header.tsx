import React, { useState, useEffect, useRef } from 'react';
import { Radio, RefreshCw, AlertTriangle, ShieldCheck, Power, Server, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConflictAlert } from '../types';

interface HeaderProps {
  alerts: ConflictAlert[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  primaryActive: boolean;
  setPrimaryActive: (active: boolean) => void;
}

export default function Header({ alerts, activeTab, setActiveTab, primaryActive, setPrimaryActive }: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  const navRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
    }
  };

  useEffect(() => {
    const nav = navRef.current;
    if (nav) {
      nav.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      // Run initial check
      setTimeout(checkScroll, 100);
    }
    return () => {
      if (nav) {
        nav.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  // Check scroll when activeTab or alerts changes, as content width or tab selection changes
  useEffect(() => {
    checkScroll();
  }, [activeTab, alerts]);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const { clientWidth } = navRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.5 : clientWidth * 0.5;
      navRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleTabClick = (tabId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    setActiveTab(tabId);
    event.currentTarget.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFailover = () => {
    setPrimaryActive(!primaryActive);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo and Status */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)]">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-bold tracking-tight text-white">CastPilot</h1>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 border border-slate-700">
                v1.1-AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Automated Broadcast Management System</p>
          </div>
        </div>

        {/* Live system state counters */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Playout Failover Status Toggle */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-900 p-1.5 border border-slate-800">
            <span className="px-2 font-medium text-slate-400">Stream Status:</span>
            <button
              onClick={toggleFailover}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold transition-all ${
                primaryActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
              id="failover-toggle-btn"
            >
              <Server className="h-3.5 w-3.5" />
              {primaryActive ? 'PRIMARY' : 'BACKUP DR'}
            </button>
            <button
              onClick={toggleFailover}
              title="Force Manual Failover"
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            >
              <Power className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* SCTE-35 & Regulatory compliance markers */}
          <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 border border-slate-800 text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>SCTE-35 Insertion:</span>
            <span className="font-mono text-emerald-400">READY</span>
          </div>

          {/* Alarm Indicator */}
          {unresolvedAlerts.length > 0 ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-rose-400 animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="font-semibold">{unresolvedAlerts.length} Critical Alerts</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Broadcast Safe</span>
            </div>
          )}

          {/* Master Clock */}
          <div className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 font-mono text-white text-sm flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span>{time || "00:00:00"} UTC</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs built into Header for clean, sleek layout */}
      <div className="mx-auto max-w-7xl mt-4 relative flex items-center">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => scrollNav('left')}
            className="absolute left-0 top-0 bottom-0 z-25 flex items-center justify-center bg-gradient-to-r from-slate-950 via-slate-950 to-transparent pr-12 pl-1 text-slate-400 hover:text-white transition-all"
            title="Scroll navigation left"
          >
            <span className="p-1.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition shadow-lg">
              <ChevronLeft className="h-3.5 w-3.5" />
            </span>
          </button>
        )}

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={() => scrollNav('right')}
            className="absolute right-0 top-0 bottom-0 z-25 flex items-center justify-center bg-gradient-to-l from-slate-950 via-slate-950 to-transparent pl-12 pr-1 text-slate-400 hover:text-white transition-all"
            title="Scroll navigation right"
          >
            <span className="p-1.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition shadow-lg">
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </button>
        )}

        <div
          ref={navRef}
          className="flex border-b border-slate-800 overflow-x-auto scroll-smooth no-scrollbar gap-1 w-full"
        >
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'scheduler', label: 'AI Scheduling' },
            { id: 'playout', label: 'Playout Stream' },
            { id: 'mam', label: 'Media Library (MAM)' },
            { id: 'prompter', label: 'Show Scripts & Prompter' },
            { id: 'engagement', label: 'Audience Overlays & Chat' },
            { id: 'resources', label: 'Resource Allocator' },
            { id: 'syndication', label: 'Streaming & VOD' },
            { id: 'setup', label: 'Setup & Logins' },
            { id: 'export', label: 'Native Apps & Desktop' },
            { id: 'manual', label: 'User Manual & Academy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => handleTabClick(tab.id, e)}
              className={`border-b-2 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              id={`nav-${tab.id}-btn`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
