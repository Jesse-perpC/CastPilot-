import React from 'react';
import { X, Keyboard, Zap, Radio, Tv, Volume2, ShieldAlert, Sparkles, MessageSquare, Video, FileText } from 'lucide-react';

interface StudioHotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudioHotkeysModal({ isOpen, onClose }: StudioHotkeysModalProps) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Playout & Video Switcher',
      icon: <Radio className="h-4 w-4 text-rose-400" />,
      shortcuts: [
        { key: 'Space', desc: 'CUT / TAKE: Swap Preview into Program (PGM)' },
        { key: '1 - 4', desc: 'Direct Camera Cut: Switch to Cam 1, 2, 3, or 4' },
        { key: 'E', desc: 'Emergency Slate: Toggle "Technical Difficulties" Kill Switch' },
        { key: 'C', desc: 'SCTE-35 Splice: Trigger 30s digital commercial break' },
        { key: 'S', desc: 'Skip: Jump to next queued video in the lineup' },
        { key: 'M', desc: 'Mute: Toggle Master Control audio mute' },
        { key: 'R', desc: 'Instant Replay: Cue last 15 seconds at 0.5x slow motion' }
      ]
    },
    {
      title: 'Studio Cameras & Scripting',
      icon: <Video className="h-4 w-4 text-indigo-400" />,
      shortcuts: [
        { key: 'T', desc: 'Teleprompter: Toggle optical Mirror Glass mode' },
        { key: 'G', desc: 'Graphics: Toggle On-Air Lower Thirds and Ticker' },
        { key: 'P', desc: 'PFL Audio: Toggle Pre-Fade Listen headphone audition' },
        { key: 'L', desc: 'Theme: Toggle Day Studio / Night Master Control mode' }
      ]
    },
    {
      title: 'Global Navigation & Tools',
      icon: <Zap className="h-4 w-4 text-sky-400" />,
      shortcuts: [
        { key: '?', desc: 'Hotkeys HUD: Show / dismiss this keyboard cheat sheet' },
        { key: 'Esc', desc: 'Dismiss: Close any open modal or return to live stream' },
        { key: '/ (Slash)', desc: 'Omnibox: Focus global search across all shows & tools' }
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shrink-0">
              <Keyboard className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-bold text-xs sm:text-sm text-white font-display">
                  Master Control Keyboard Shortcuts
                </h3>
                <span className="text-[9px] sm:text-[10px] font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">
                  STUDIO HUD
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 leading-normal">
                Physical keyboard commands for directors and master control operators. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[9px] sm:text-[10px] text-sky-300">?</kbd> anytime to toggle.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                {group.icon}
                <span>{group.title}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.shortcuts.map((sc, scIdx) => (
                  <div 
                    key={scIdx}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-2.5 hover:border-slate-700 transition"
                  >
                    <span className="text-xs text-slate-300 font-medium">
                      {sc.desc}
                    </span>
                    <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-[10px] sm:text-[11px] font-mono font-bold text-sky-400 shadow-inner shrink-0">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Pro-Tip footer callout */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 sm:gap-3">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-emerald-300/90 leading-normal">
              <strong>Studio Operator Safety:</strong> Keyboard shortcuts are automatically disabled while typing in text inputs, script editors, and search fields so you never accidentally trigger an on-air cut while writing.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-800/80 bg-slate-900/40 text-xs text-slate-400 gap-2 sm:gap-0">
          <span className="text-[10px] sm:text-xs text-center sm:text-left text-slate-500 sm:text-slate-400">Standard US/ISO Keyboard Map</span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition text-center"
          >
            Got It (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
