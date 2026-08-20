import React, { useState, useEffect, useRef } from 'react';
import { Radio, RefreshCw, AlertTriangle, ShieldCheck, Power, Server, ChevronLeft, ChevronRight, Globe, ChevronDown, Check, Sun, Moon, UserCheck, Tv, Smartphone } from 'lucide-react';
import { ConflictAlert } from '../types';
import { useLanguage, LANGUAGE_OPTIONS } from '../i18n';
import { useTheme } from '../ThemeContext';

interface HeaderProps {
  alerts: ConflictAlert[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  primaryActive: boolean;
  setPrimaryActive: (active: boolean) => void;
}

const RBAC_ROLES = [
  { id: 'director', label: 'Technical Director', badge: 'TD', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { id: 'traffic', label: 'Traffic Manager', badge: 'TRAFFIC', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'audio', label: 'Audio Engineer', badge: 'AUDIO', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'mcr', label: 'MCR Lead Operator', badge: 'MCR', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
];

const MCN_CHANNELS = [
  { id: 'fast', name: 'FAST Entertainment', status: 'ON AIR', color: 'text-emerald-400' },
  { id: 'news', name: 'News 24 Live', status: 'ON AIR', color: 'text-emerald-400' },
  { id: 'sports', name: 'Sports HD 1', status: 'STANDBY', color: 'text-amber-400' },
  { id: 'music', name: 'Music Vault 4K', status: 'ON AIR', color: 'text-emerald-400' },
];

export default function Header({ alerts, activeTab, setActiveTab, primaryActive, setPrimaryActive }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState<string>('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const currentLangOption = LANGUAGE_OPTIONS.find(o => o.code === language) || LANGUAGE_OPTIONS[0];

  const navRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className="border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo and Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.15)] shrink-0">
            <Radio className="h-4 sm:h-5 sm:w-5 animate-pulse text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-display text-sm sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                CastPilot
                <span className="text-slate-500 font-normal text-xs font-mono hidden md:inline">by</span>
                <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent font-bold text-xs tracking-wider uppercase hidden md:inline">
                  Perp Corp Media
                </span>
              </h1>
              <span className="rounded bg-sky-950/80 px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-sky-300 border border-sky-800/60 font-semibold shadow-sm">
                {t('versionBadge')}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1">
              <span>{t('tagline')}</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-300 font-medium hidden sm:inline">{t('authorAndSuite')}</span>
            </p>
          </div>
        </div>

        {/* Live system state counters */}
        <div className="flex overflow-x-auto flex-nowrap items-center gap-2.5 text-xs w-full sm:w-auto pb-1 sm:pb-0 scroll-smooth no-scrollbar select-none" id="header-status-counters">
          {/* RBAC Role Selector Dropdown */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-2 py-1 text-slate-300 text-[10px] sm:text-xs shrink-0">
            <UserCheck className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-500 font-mono hidden md:inline">ROLE:</span>
            <select
              className="bg-transparent font-semibold text-slate-200 focus:outline-none cursor-pointer text-[10px] sm:text-xs"
              defaultValue="director"
              onChange={(e) => {
                const role = RBAC_ROLES.find(r => r.id === e.target.value);
                if (role) {
                  const evt = new CustomEvent('rbac-role-changed', { detail: role });
                  window.dispatchEvent(evt);
                }
              }}
            >
              {RBAC_ROLES.map(r => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-100">
                  {r.badge} • {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* MCN Multi-Channel Network Active Channel Switcher */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-2 py-1 text-slate-300 text-[10px] sm:text-xs shrink-0">
            <Tv className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-slate-500 font-mono hidden md:inline">MCN:</span>
            <select
              className="bg-transparent font-semibold text-sky-300 focus:outline-none cursor-pointer text-[10px] sm:text-xs"
              defaultValue="fast"
              onChange={(e) => {
                const chan = MCN_CHANNELS.find(c => c.id === e.target.value);
                if (chan) {
                  const evt = new CustomEvent('mcn-channel-changed', { detail: chan });
                  window.dispatchEvent(evt);
                }
              }}
            >
              {MCN_CHANNELS.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>

          {/* Tally & Prompter Field App Companion Launcher */}
          <button
            onClick={() => setActiveTab('prompter')}
            className="flex items-center gap-1 rounded-lg bg-indigo-950/80 border border-indigo-700/60 px-2.5 py-1 text-indigo-300 hover:text-white hover:bg-indigo-900 text-[10px] sm:text-xs font-semibold transition shrink-0"
            title="Mobile Field Tally Light & Teleprompter Sync"
          >
            <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden xs:inline">Mobile Tally</span>
          </button>

          {/* International Language Switcher Dropdown */}
          <div className="relative shrink-0" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-slate-300 hover:text-white hover:border-slate-700 text-[10px] sm:text-xs transition-all shadow-sm font-medium"
              title={t('selectLanguage')}
              id="language-selector-btn"
            >
              <Globe className="h-3.5 w-3.5 text-sky-400" />
              <span className="font-semibold text-slate-200">{currentLangOption.flag} {currentLangOption.code.toUpperCase()}</span>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-md">
                <div className="px-3 py-1.5 border-b border-slate-800/80 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{t('selectLanguage')}</span>
                  <Globe className="h-3 w-3 text-sky-400" />
                </div>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      language === opt.code
                        ? 'bg-sky-500/15 text-sky-300 font-semibold border-l-2 border-sky-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{opt.flag}</span>
                      <span>{opt.nativeName}</span>
                    </span>
                    {language === opt.code ? (
                      <Check className="h-3.5 w-3.5 text-sky-400" />
                    ) : (
                      <span className="text-[10px] font-mono uppercase text-slate-500">{opt.code}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Studio Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-slate-300 hover:text-white hover:border-slate-700 text-[10px] sm:text-xs transition-all shadow-sm font-medium shrink-0"
            title={theme === 'dark' ? t('themeLight') : t('themeDark')}
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span className="font-semibold text-slate-200 hidden xs:inline">{t('themeLight')}</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-slate-200 hidden xs:inline">{t('themeDark')}</span>
              </>
            )}
          </button>

          {/* Playout Failover Status Toggle */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 p-1 border border-slate-800 shrink-0">
            <span className="px-1.5 font-medium text-slate-400 text-[10px] sm:text-xs">{t('streamLabel')}</span>
            <button
              onClick={toggleFailover}
              className={`flex items-center gap-1.5 rounded px-2 py-0.5 sm:py-1 font-semibold text-[10px] sm:text-xs transition-all ${
                primaryActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
              id="failover-toggle-btn"
            >
              <Server className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {primaryActive ? t('primaryServer') : t('backupServer')}
            </button>
            <button
              onClick={toggleFailover}
              title={t('failoverToggle')}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            >
              <Power className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>

          {/* SCTE-35 & Regulatory compliance markers */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 border border-slate-800 text-slate-300 shrink-0 text-[10px] sm:text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>{t('scte35Status')}</span>
            <span className="font-mono text-emerald-400 font-semibold">{t('scte35Ready')}</span>
          </div>

          {/* Alarm Indicator */}
          {unresolvedAlerts.length > 0 ? (
            <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 px-2.5 py-1.5 text-rose-400 animate-pulse shrink-0 text-[10px] sm:text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="font-semibold">{unresolvedAlerts.length} {t('alertsCount')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 text-emerald-400 shrink-0 text-[10px] sm:text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{t('broadcastSafe')}</span>
            </div>
          )}

          {/* Master Clock */}
          <div className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 font-mono text-white text-[11px] sm:text-sm flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-500 animate-ping"></span>
            <span>{time || "00:00:00"} UTC</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs built into Header */}
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
            { id: 'dashboard', label: t('navDashboard') },
            { id: 'scheduler', label: t('navScheduler') },
            { id: 'playout', label: t('navPlayout') },
            { id: 'mam', label: t('navMam') },
            { id: 'prompter', label: t('navPrompter') },
            { id: 'engagement', label: t('navEngagement') },
            { id: 'multicam', label: t('navMultiCam') },
            { id: 'resources', label: t('navResources') },
            { id: 'syndication', label: t('navSyndication') },
            { id: 'setup', label: t('navSetup') },
            { id: 'export', label: t('navExport') },
            { id: 'manual', label: t('navManual') },
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
