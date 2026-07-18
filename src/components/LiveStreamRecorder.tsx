import React, { useState, useEffect } from 'react';
import { 
  Disc, 
  Play, 
  Square, 
  Download, 
  Trash2, 
  Film, 
  HardDrive, 
  Radio, 
  Layers, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface RecordedClip {
  id: string;
  title: string;
  format: 'mp4' | 'mkv' | 'webm';
  size: string;
  duration: string;
  recordedAt: string;
}

interface LiveStreamRecorderProps {
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function LiveStreamRecorder({ addToast }: LiveStreamRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordFormat, setRecordFormat] = useState<'mp4' | 'mkv' | 'webm'>('mp4');
  const [recordQuality, setRecordQuality] = useState<'1080p' | '720p' | '4k'>('1080p');
  
  // Real-time stats simulation
  const [duration, setDuration] = useState(0);
  const [fileSizeMb, setFileSizeMb] = useState(0);

  const [recordedClips, setRecordedClips] = useState<RecordedClip[]>([
    { id: 'clip-1', title: 'EcoQuest Amazon Series Airing - July 18', format: 'mp4', size: '1.42 GB', duration: '01:30:15', recordedAt: '2026-07-18 10:45 UTC' },
    { id: 'clip-2', title: 'Global Horizon Morning News Hour', format: 'mkv', size: '894 MB', duration: '01:00:00', recordedAt: '2026-07-18 08:30 UTC' },
    { id: 'clip-3', title: 'Late Night Retro Playout block (SCTE ads)', format: 'webm', size: '2.10 GB', duration: '02:15:42', recordedAt: '2026-07-17 23:45 UTC' }
  ]);

  // Duration & File size ticking simulation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        // Grow file size by ~1.4MB per second for 1080p
        const bytesPerSec = recordQuality === '4k' ? 4.2 : recordQuality === '1080p' ? 1.4 : 0.8;
        setFileSizeMb(prev => parseFloat((prev + bytesPerSec).toFixed(1)));
      }, 1000);
    } else {
      setDuration(0);
      setFileSizeMb(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, recordQuality]);

  const handleStartRecording = () => {
    setIsRecording(true);
    addToast(`Master Live Record triggered on active feed! Format: ${recordFormat.toUpperCase()}`, 'success');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    // Add the newly recorded clip to list!
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    const durationStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const sizeStr = fileSizeMb > 1024 
      ? `${(fileSizeMb / 1024).toFixed(2)} GB` 
      : `${fileSizeMb.toFixed(0)} MB`;

    const newClip: RecordedClip = {
      id: `clip-${Date.now()}`,
      title: `Manual Live Feed Grab - ${new Date().toLocaleDateString()}`,
      format: recordFormat,
      size: sizeStr,
      duration: durationStr || '00:00:10',
      recordedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
    };

    setRecordedClips(prev => [newClip, ...prev]);
    addToast('Recording capture finished. Saved to localized VOD library clips list!', 'success');
  };

  const handleDeleteClip = (id: string, title: string) => {
    setRecordedClips(prev => prev.filter(c => c.id !== id));
    addToast(`Recorded clip file deleted from CastPilot buffer.`, 'info');
  };

  const formatDuration = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handlePublishToMAM = (clip: RecordedClip) => {
    // Post to asset management backend
    fetch('/api/mam/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `[Repurposed VOD] ${clip.title}`,
        type: 'program',
        duration: 30, // Default estimate
        category: 'Repurposed Stream VOD',
        description: `Archived capture from live playout stream recorded on ${clip.recordedAt}. Bitrate and quality validated.`
      })
    })
    .then(res => {
      if (res.ok) {
        addToast(`"${clip.title}" successfully indexed into Media Library (MAM) for automatic FAST rescheduling!`, 'success');
      } else {
        addToast('Failed to publish clip to library', 'error');
      }
    })
    .catch(() => addToast('Network failure publishing clip to library', 'error'));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Recording Master Panel (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Record trigger card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          
          <div className="flex justify-between items-start border-b border-slate-900 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">MASTER RECORDER</span>
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Stream Capture Deck</h3>
            </div>
            
            {isRecording && (
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-md flex items-center gap-1.5 animate-pulse">
                <Disc className="h-3 w-3 animate-spin" />
                ON-AIR RECORDING
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-6 text-center">
            {isRecording ? (
              <div className="space-y-3.5 animate-fadeIn">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-white tracking-wider font-mono">
                  {formatDuration(duration)}
                </span>
                
                <div className="flex gap-4 justify-center text-xs font-mono text-slate-400">
                  <span>File size: <strong className="text-sky-400">{fileSizeMb.toFixed(1)} MB</strong></span>
                  <span>Bitrate: <strong className="text-sky-400">{recordQuality === '4k' ? '12.5 Mbps' : recordQuality === '1080p' ? '4.8 Mbps' : '2.2 Mbps'}</strong></span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Film className="h-12 w-12 text-slate-800 mx-auto" />
                <p className="font-semibold text-slate-300 text-xs">Recorder Armed & Ready</p>
                <p className="text-[11px] text-slate-500 max-w-sm">Capture live playout streams with sub-second RTMP extraction for instant reuse on VOD channels.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-900 pt-4">
            
            <div className="flex items-center gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Video Format</span>
                <div className="flex gap-1">
                  {['mp4', 'mkv', 'webm'].map(fmt => (
                    <button
                      key={fmt}
                      disabled={isRecording}
                      onClick={() => setRecordFormat(fmt as any)}
                      className={`px-2 py-1 rounded font-mono text-[10px] font-bold uppercase transition ${
                        recordFormat === fmt 
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                          : 'bg-slate-900 text-slate-500 border border-slate-850 hover:text-slate-300 disabled:opacity-50'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Quality Stream Rate</span>
                <select
                  disabled={isRecording}
                  value={recordQuality}
                  onChange={(e) => setRecordQuality(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] rounded px-2.5 py-1 font-semibold focus:outline-none disabled:opacity-50"
                >
                  <option value="1080p">1080p60 (AVC / Web-optimized)</option>
                  <option value="720p">720p30 (FAST-Low Latency)</option>
                  <option value="4k">2160p60 (4K Cinema Master)</option>
                </select>
              </div>
            </div>

            {isRecording ? (
              <button
                onClick={handleStopRecording}
                className="py-2.5 px-6 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md border border-rose-500/25 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop Capture & Save
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                className="py-2.5 px-6 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-md border border-sky-400/25 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current animate-pulse" />
                Trigger Live Recording
              </button>
            )}

          </div>

        </div>

        {/* Regulatory disclaimer info */}
        <div className="p-4 rounded-xl border border-slate-850 bg-slate-900/10 flex items-start gap-2.5">
          <AlertCircle className="h-4.5 w-4.5 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-slate-400">
            <span className="font-semibold text-slate-300">FCC Compliant Live Archiver:</span> CastPilot recordings maintain perfect sync across primary and secondary failover playout cycles. Integrated SCTE-35 cue markers are embedded as SMPTE-2038 metadata tracks in standard H.264 broadcast output formats.
          </div>
        </div>

      </div>

      {/* Save VOD clippings list (5 cols) */}
      <div className="lg:col-span-5 flex flex-col bg-slate-950 rounded-xl border border-slate-800 min-h-[400px] shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-900 bg-slate-950 flex justify-between items-center shrink-0">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <HardDrive className="h-4 w-4 text-sky-400" />
            VOD Captured Recordings
          </h4>
          <span className="text-[9px] font-mono text-slate-500 uppercase">
            Playout disk pool: 84% free
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/40">
          {recordedClips.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs flex flex-col items-center gap-2">
              <Film className="h-8 w-8 text-slate-800 animate-pulse" />
              <p>No captured recordings saved on buffer.</p>
            </div>
          ) : (
            recordedClips.map(clip => (
              <div 
                key={clip.id}
                className="p-3 bg-slate-900/30 border border-slate-900 hover:border-slate-850 rounded-xl flex items-start justify-between gap-3 text-xs leading-normal group transition"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-sky-500/15 text-sky-400 font-mono font-bold text-[8px] px-1.5 py-0.5 rounded uppercase border border-sky-500/10">
                      {clip.format}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {clip.recordedAt}
                    </span>
                  </div>

                  <h5 className="font-semibold text-slate-200 truncate pr-2 block">
                    {clip.title}
                  </h5>

                  <p className="text-[10px] font-mono text-slate-400">
                    Duration: <strong className="text-slate-300">{clip.duration}</strong> • Size: <strong className="text-slate-300">{clip.size}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handlePublishToMAM(clip)}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-emerald-400 transition"
                    title="Publish directly to Media Library (MAM) for playout rescheduling"
                  >
                    <Layers className="h-3.5 w-3.5" />
                  </button>

                  <a
                    href={`#download-${clip.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      addToast(`Downloading VOD clip: ${clip.title}.${clip.format}`, 'success');
                    }}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-white transition"
                    title="Download Clip to Local Disk"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>

                  <button
                    onClick={() => handleDeleteClip(clip.id, clip.title)}
                    className="p-1.5 bg-slate-950 hover:bg-rose-900/10 border border-slate-800 rounded text-slate-500 hover:text-rose-400 transition"
                    title="Purge clip file"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
