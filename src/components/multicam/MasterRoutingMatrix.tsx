import React, { useState } from 'react';
import {
  Grid,
  Shuffle,
  Tv,
  Lock,
  Unlock,
  Layers,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  Radio,
  ArrowRight,
  Shield,
  Zap,
  Play,
  Monitor,
  Activity,
  Plus
} from 'lucide-react';
import { VideoFeed } from '../MultiCamNdiIngestion';
import { MatrixInput, MatrixOutput, SalvoPreset } from './types';

interface MasterRoutingMatrixProps {
  feeds: VideoFeed[];
  onToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const FACTORY_SALVOS: SalvoPreset[] = [
  {
    id: 'salvo-debate',
    name: 'Debate Dual-Anchor Setup',
    description: 'Routes CAM 1 & 2 to PGM/PVW, CAM 4 Guest to Prompter & Confidence Monitor.',
    category: 'Debate',
    isFactory: true,
    routes: {
      'out-pgm': 'in-cam-1',
      'out-pvw': 'in-cam-2',
      'out-aux1': 'in-cam-3',
      'out-aux2': 'in-cam-4',
      'out-prompter': 'in-cam-1',
      'out-ifb1': 'in-cam-2',
      'out-ifb2': 'in-cam-4',
      'out-srt': 'in-cam-1',
    }
  },
  {
    id: 'salvo-breaking',
    name: 'Breaking News Solo Anchor',
    description: 'Locks Main Anchor Desk to PGM & Stage Prompter, feeds Overhead Jib to Preview.',
    category: 'News',
    isFactory: true,
    routes: {
      'out-pgm': 'in-cam-1',
      'out-pvw': 'in-cam-5',
      'out-aux1': 'in-cam-1',
      'out-aux2': 'in-cam-6',
      'out-prompter': 'in-cam-1',
      'out-ifb1': 'in-cam-1',
      'out-ifb2': 'in-cam-5',
      'out-srt': 'in-cam-1',
    }
  },
  {
    id: 'salvo-interview',
    name: 'Guest Remote Interview',
    description: 'Crosspoints set for Remote WebRTC Guest with dual-way confidence return.',
    category: 'Talkshow',
    isFactory: true,
    routes: {
      'out-pgm': 'in-cam-4',
      'out-pvw': 'in-cam-1',
      'out-aux1': 'in-cam-4',
      'out-aux2': 'in-cam-2',
      'out-prompter': 'in-cam-1',
      'out-ifb1': 'in-cam-4',
      'out-ifb2': 'in-cam-1',
      'out-srt': 'in-cam-4',
    }
  },
  {
    id: 'salvo-sports',
    name: 'Sports Multi-Angle / Steadicam',
    description: 'Focuses high frame-rate Tracking Jib & Steadicam across all Aux and SRT outputs.',
    category: 'Sports',
    isFactory: true,
    routes: {
      'out-pgm': 'in-cam-7',
      'out-pvw': 'in-cam-8',
      'out-aux1': 'in-cam-5',
      'out-aux2': 'in-cam-7',
      'out-prompter': 'in-cam-1',
      'out-ifb1': 'in-cam-7',
      'out-ifb2': 'in-cam-8',
      'out-srt': 'in-cam-7',
    }
  }
];

export default function MasterRoutingMatrix({ feeds, onToast }: MasterRoutingMatrixProps) {
  // Matrix Inputs (8 feeds + test bars)
  const inputs: MatrixInput[] = [
    ...feeds.map((feed) => ({
      id: `in-${feed.id}`,
      name: feed.name,
      label: `CAM ${feed.camNumber}`,
      type: (feed.sourceType.startsWith('NDI') ? 'NDI' : 'WebRTC') as 'NDI' | 'WebRTC',
      resolution: feed.resolution,
      fps: feed.fps,
      color: feed.tallyState === 'pgm' ? 'text-red-400' : feed.tallyState === 'pvw' ? 'text-emerald-400' : 'text-sky-400'
    })),
    {
      id: 'in-colorbars',
      name: 'SMPTE Color Bars 100%',
      label: 'BARS',
      type: 'INTERNAL',
      resolution: '1080p60',
      fps: 60,
      color: 'text-amber-400'
    },
    {
      id: 'in-black',
      name: 'Video Black / Silence',
      label: 'BLACK',
      type: 'INTERNAL',
      resolution: '1080p60',
      fps: 60,
      color: 'text-slate-500'
    }
  ];

  // Matrix Outputs (8 destinations)
  const [outputs, setOutputs] = useState<MatrixOutput[]>([
    { id: 'out-pgm', name: 'Program Broadcast (PGM)', destLabel: 'PGM 1', category: 'PGM', currentInputId: 'in-feed-1', isLocked: false },
    { id: 'out-pvw', name: 'Preview Bus (PVW)', destLabel: 'PVW 1', category: 'PVW', currentInputId: 'in-feed-2', isLocked: false },
    { id: 'out-aux1', name: 'Multiviewer Quad AUX 1', destLabel: 'MV-1', category: 'AUX', currentInputId: 'in-feed-3', isLocked: false },
    { id: 'out-aux2', name: 'Multiviewer Quad AUX 2', destLabel: 'MV-2', category: 'AUX', currentInputId: 'in-feed-4', isLocked: false },
    { id: 'out-prompter', name: 'Stage Teleprompter Aux', destLabel: 'PROMPT', category: 'PROMPTER', currentInputId: 'in-feed-1', isLocked: false },
    { id: 'out-ifb1', name: 'Talent Confidence Monitor A', destLabel: 'CONF-A', category: 'IFB', currentInputId: 'in-feed-2', isLocked: false },
    { id: 'out-ifb2', name: 'Guest Return Video B', destLabel: 'CONF-B', category: 'IFB', currentInputId: 'in-feed-4', isLocked: false },
    { id: 'out-srt', name: 'SRT Cloud Edge Encoder', destLabel: 'SRT-TX', category: 'SRT_STREAM', currentInputId: 'in-feed-1', isLocked: true },
  ]);

  // Salvos
  const [salvos, setSalvos] = useState<SalvoPreset[]>(FACTORY_SALVOS);
  const [newSalvoName, setNewSalvoName] = useState<string>('');
  const [isCreatingSalvo, setIsCreatingSalvo] = useState<boolean>(false);

  // Handle crossbar switch
  const handleCrosspointClick = (outputId: string, inputId: string) => {
    const targetOut = outputs.find(o => o.id === outputId);
    if (targetOut?.isLocked) {
      onToast(`Cannot route: Destination "${targetOut.name}" is locked. Unlock to change route.`, 'error');
      return;
    }

    const targetInput = inputs.find(i => i.id === inputId);

    setOutputs(prev => prev.map(out => {
      if (out.id === outputId) {
        return { ...out, currentInputId: inputId };
      }
      return out;
    }));

    onToast(`Routed [${targetInput?.label || inputId}] ➔ [${targetOut?.destLabel || outputId}]`, 'success');
  };

  // Toggle Output Lock
  const toggleOutputLock = (outputId: string) => {
    setOutputs(prev => prev.map(out => {
      if (out.id === outputId) {
        const next = !out.isLocked;
        onToast(`Output "${out.destLabel}" ${next ? 'Locked' : 'Unlocked'}`, 'info');
        return { ...out, isLocked: next };
      }
      return out;
    }));
  };

  // Recall Salvo Snapshot
  const handleRecallSalvo = (salvo: SalvoPreset) => {
    setOutputs(prev => prev.map(out => {
      if (out.isLocked) return out; // keep locked outputs safe
      const newIn = salvo.routes[out.id];
      if (newIn) {
        return { ...out, currentInputId: newIn };
      }
      return out;
    }));
    onToast(`Salvo Snapshot "${salvo.name}" executed across all unlocked outputs!`, 'success');
  };

  // Save current matrix state as custom Salvo
  const handleSaveCustomSalvo = () => {
    const trimmed = newSalvoName.trim();
    if (!trimmed) return;

    const routes: Record<string, string> = {};
    outputs.forEach(out => {
      routes[out.id] = out.currentInputId;
    });

    const newSalvo: SalvoPreset = {
      id: `salvo-custom-${Date.now()}`,
      name: trimmed,
      description: `Custom salvo configuration saved at ${new Date().toLocaleTimeString()}`,
      category: 'Custom',
      isFactory: false,
      routes
    };

    setSalvos(prev => [newSalvo, ...prev]);
    setNewSalvoName('');
    setIsCreatingSalvo(false);
    onToast(`Saved new Salvo Snapshot "${trimmed}"!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold uppercase tracking-wider">
                <Grid className="h-3.5 w-3.5 text-emerald-400" />
                10x8 CROSSBAR MATRIX SWITCHER
              </span>
              <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono text-[10px]">
                NON-BLOCKING 100GbE FABRIC
              </span>
            </div>
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              Master Routing Matrix & Instant Salvo Presets
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Clean 10-Input × 8-Output low-latency video crossbar router. Route live NDI/WebRTC feeds to Program, Preview, Stage Prompters, and In-Ear Confidence screens with 1-click Salvo snapshots.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreatingSalvo(true)}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-sky-500/20"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Snapshot Salvo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Salvo Snapshot Quick-Fire Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Production Salvo Presets (Atomic Crossbar Recalls)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Re-routes all 8 outputs in 1ms</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {salvos.map((salvo) => (
            <div
              key={salvo.id}
              className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-2.5 shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-white truncate">{salvo.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-800 text-slate-400">
                    {salvo.category}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{salvo.description}</p>
              </div>

              <button
                onClick={() => handleRecallSalvo(salvo)}
                className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Execute Salvo</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Salvo Creation Modal/Form */}
      {isCreatingSalvo && (
        <div className="rounded-xl bg-slate-900 border border-sky-500/40 p-4 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5">
              <Save className="h-4 w-4 text-sky-400" />
              <span>Save Current Matrix Routing as New Salvo Preset</span>
            </span>
            <button
              onClick={() => setIsCreatingSalvo(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g., Post-Show Wrap Up, Press Briefing..."
              value={newSalvoName}
              onChange={(e) => setNewSalvoName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveCustomSalvo()}
              autoFocus
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleSaveCustomSalvo}
              disabled={!newSalvoName.trim()}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Snapshot</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Matrix Crosspoint Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 space-y-4 overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Shuffle className="h-4 w-4 text-sky-400" />
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Matrix Crosspoint Routing Grid (Click Cell to Route)
            </h4>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" /> PGM Route
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Active Route
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-2.5 w-2.5 text-amber-400" /> Locked Route
            </span>
          </div>
        </div>

        {/* The Matrix Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-400">
                <th className="py-2.5 px-3 bg-slate-900/60 rounded-tl-lg">OUTPUT DESTINATION</th>
                <th className="py-2.5 px-2 bg-slate-900/60 text-center">LOCK</th>
                {inputs.map((inp) => (
                  <th key={inp.id} className="py-2.5 px-2 bg-slate-900/40 text-center">
                    <div className={`font-bold ${inp.color}`}>{inp.label}</div>
                    <div className="text-[9px] text-slate-500 uppercase">{inp.type}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {outputs.map((out) => {
                const isPgm = out.category === 'PGM';
                return (
                  <tr key={out.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Destination Label */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                          isPgm ? 'bg-red-600/20 text-red-300 border border-red-500/40' :
                          out.category === 'PVW' ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40' :
                          out.category === 'PROMPTER' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40' :
                          'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {out.destLabel}
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs">{out.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Currently: <span className="text-sky-300">{inputs.find(i => i.id === out.currentInputId)?.name || out.currentInputId}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Lock Button */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => toggleOutputLock(out.id)}
                        className={`p-1.5 rounded-lg transition ${
                          out.isLocked
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={out.isLocked ? 'Locked (Click to Unlock)' : 'Unlocked (Click to Protect)'}
                      >
                        {out.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                      </button>
                    </td>

                    {/* Crosspoint Cells */}
                    {inputs.map((inp) => {
                      const isConnected = out.currentInputId === inp.id;
                      return (
                        <td key={inp.id} className="py-3 px-2 text-center">
                          <button
                            onClick={() => handleCrosspointClick(out.id, inp.id)}
                            disabled={out.isLocked && !isConnected}
                            title={`Route ${inp.name} -> ${out.name}`}
                            className={`w-7 h-7 rounded-lg font-mono text-[10px] font-bold transition flex items-center justify-center mx-auto ${
                              isConnected
                                ? isPgm
                                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 animate-pulse border border-red-400'
                                  : 'bg-emerald-500 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20 border border-emerald-300'
                                : out.isLocked
                                ? 'bg-slate-900/50 text-slate-700 cursor-not-allowed'
                                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-white border border-slate-800'
                            }`}
                          >
                            {isConnected ? '●' : '○'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
