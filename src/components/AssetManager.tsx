import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Tag, 
  Eye, 
  ShieldCheck, 
  Volume2, 
  Film, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  FileText, 
  RefreshCw, 
  Cpu,
  Trash2,
  Edit,
  Sliders,
  Clock,
  Grid,
  List,
  ArrowUpDown,
  UploadCloud,
  X,
  Check,
  Play,
  VolumeX,
  FileVideo,
  Settings,
  SlidersHorizontal,
  Bookmark,
  Calendar,
  AlertOctagon,
  Download,
  Activity,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { ContentAsset } from '../types';

interface AssetManagerProps {
  assets: ContentAsset[];
  onAddAsset: (newAsset: { title: string; type: string; duration: number; category: string; description: string }) => Promise<void>;
  onEnrichAsset: (assetId: string) => Promise<void>;
  onUpdateAsset?: (assetId: string, updatedFields: Partial<ContentAsset>) => Promise<void>;
  onDeleteAsset?: (assetId: string) => Promise<void>;
  enrichingAssetId: string | null;
  schedulingMode: 'auto' | 'manual';
  setSchedulingMode: (mode: 'auto' | 'manual') => void;
  addToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  speed: string;
  eta: number; // in seconds
  status: 'uploading' | 'completed' | 'failed';
}

export default function AssetManager({
  assets,
  onAddAsset,
  onEnrichAsset,
  onUpdateAsset,
  onDeleteAsset,
  enrichingAssetId,
  schedulingMode,
  setSchedulingMode,
  addToast
}: AssetManagerProps) {
  // Navigation & Filter States
  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);

  // Ingestion Form State
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('program');
  const [duration, setDuration] = useState<number>(30);
  const [category, setCategory] = useState<string>('Science & Nature');
  const [description, setDescription] = useState<string>('');
  const [loadingAdd, setLoadingAdd] = useState<boolean>(false);

  // Drag & Drop / Uploading States
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editing Inspector State
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editType, setEditType] = useState<'program' | 'commercial' | 'promo' | 'filler'>('program');
  const [editDuration, setEditDuration] = useState<number>(30);
  const [editCategory, setEditCategory] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editSafetyRating, setEditSafetyRating] = useState<string>('G');
  const [editLoudnessDb, setEditLoudnessDb] = useState<number>(-24.0);
  const [editIsQCed, setEditIsQCed] = useState<boolean>(false);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editAdMarkers, setEditAdMarkers] = useState<string[]>([]);
  const [newMarkerTime, setNewMarkerTime] = useState<string>('');
  const [newTagInput, setNewTagInput] = useState<string>('');

  // Collect all unique tags across all assets
  const allUniqueTags = Array.from(
    new Set(assets.flatMap(asset => asset.tags || []))
  ).filter(Boolean);

  // Form submission for manually registering asset
  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoadingAdd(true);
    try {
      await onAddAsset({ title, type, duration, category, description });
      setTitle('');
      setDescription('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdd(false);
    }
  };

  // Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: any) => simulateUpload(file as File));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: any) => simulateUpload(file as File));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Simulated Media Ingestion handshaking
  const simulateUpload = (file: File) => {
    const fileId = `upload-${Date.now()}-${Math.random()}`;
    const newUpload: UploadingFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type || 'video/mp4',
      progress: 0,
      speed: '0 MB/s',
      eta: 10,
      status: 'uploading'
    };

    setUploadingFiles(prev => [newUpload, ...prev]);

    let currentProgress = 0;
    const interval = setInterval(async () => {
      currentProgress += Math.floor(Math.random() * 15) + 12;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Complete state
        setUploadingFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'completed' as const, speed: '0 MB/s', eta: 0 } : f));
        
        // Register in MAM vault
        const extension = file.name.split('.').pop()?.toLowerCase();
        const rawTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        
        // Inferred fields
        let assetType: 'program' | 'commercial' | 'promo' | 'filler' = 'program';
        let inferredDuration = 30;
        let inferredCategory = 'General Media';
        
        const lowerName = file.name.toLowerCase();
        if (lowerName.includes('promo') || lowerName.includes('teaser') || lowerName.includes('hype')) {
          assetType = 'promo';
          inferredDuration = 3;
          inferredCategory = 'Promotion';
        } else if (lowerName.includes('commercial') || lowerName.includes('ad') || lowerName.includes('spot') || file.size < 10 * 1024 * 1024) {
          assetType = 'commercial';
          inferredDuration = 2;
          inferredCategory = 'Advertising';
        } else if (lowerName.includes('filler') || lowerName.includes('loop') || lowerName.includes('background')) {
          assetType = 'filler';
          inferredDuration = 5;
          inferredCategory = 'Filler Playout';
        } else {
          inferredDuration = 15 + Math.floor(Math.random() * 3) * 15; // 15, 30 or 45 mins
          inferredCategory = 'Ingested Video';
        }

        await onAddAsset({
          title: rawTitle,
          type: assetType,
          duration: inferredDuration,
          category: inferredCategory,
          description: `Ingested media payload file. Original name: "${file.name}". Format: ${extension?.toUpperCase() || 'RAW'}. Volume size: ${(file.size / (1024 * 1024)).toFixed(1)} MB. Safety certified for FAST playout scheduling.`
        });
        
        if (addToast) {
          addToast(`Registered ingested media "${rawTitle}" successfully!`, 'success');
        }
      } else {
        const speedNum = (18 + Math.random() * 22).toFixed(1);
        const remainingPct = 100 - currentProgress;
        const etaSeconds = Math.max(1, Math.round((remainingPct / currentProgress) * 3));
        setUploadingFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: currentProgress, speed: `${speedNum} MB/s`, eta: etaSeconds } : f));
      }
    }, 300);
  };

  // Editing Actions
  const startEditing = (asset: ContentAsset) => {
    setEditingAssetId(asset.id);
    setEditTitle(asset.title);
    setEditType(asset.type);
    setEditDuration(asset.duration);
    setEditCategory(asset.category);
    setEditDescription(asset.description || '');
    setEditSafetyRating(asset.safetyRating || 'G');
    setEditLoudnessDb(asset.loudnessDb || -24.0);
    setEditIsQCed(asset.isQCed);
    setEditTags([...(asset.tags || [])]);
    setEditAdMarkers([...(asset.adMarkers || [])]);
    setNewMarkerTime('');
    setNewTagInput('');
    
    // Smooth scroll to editor if on mobile
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSaveEdit = async () => {
    if (!onUpdateAsset || !editingAssetId) return;
    try {
      await onUpdateAsset(editingAssetId, {
        title: editTitle,
        type: editType,
        duration: Number(editDuration),
        category: editCategory,
        description: editDescription,
        safetyRating: editSafetyRating,
        loudnessDb: Number(editLoudnessDb),
        isQCed: editIsQCed,
        tags: editTags,
        adMarkers: editAdMarkers
      });
      setEditingAssetId(null);
    } catch (err) {
      console.error(err);
      if (addToast) addToast("Failed to save asset modifications", "error");
    }
  };

  const handleDeleteClick = (assetId: string) => {
    setShowDeleteConfirmId(assetId);
  };

  const handleConfirmDelete = async (assetId: string) => {
    if (!onDeleteAsset) return;
    try {
      await onDeleteAsset(assetId);
      setShowDeleteConfirmId(null);
      if (editingAssetId === assetId) {
        setEditingAssetId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add tag to editing asset
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().toLowerCase().replace(/#/g, '');
    if (!editTags.includes(cleanTag)) {
      setEditTags([...editTags, cleanTag]);
    }
    setNewTagInput('');
  };

  // Remove tag from editing asset
  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(t => t !== tagToRemove));
  };

  // Add ad splicing cue marker
  const handleAddMarker = () => {
    if (!newMarkerTime.trim()) return;
    // Basic regex validation for hh:mm:ss
    const timePattern = /^([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
    if (!timePattern.test(newMarkerTime)) {
      if (addToast) addToast("Use HH:MM:SS format for cue points", "info");
      return;
    }
    if (!editAdMarkers.includes(newMarkerTime)) {
      const sortedMarkers = [...editAdMarkers, newMarkerTime].sort();
      setEditAdMarkers(sortedMarkers);
    }
    setNewMarkerTime('');
  };

  // Remove ad marker
  const handleRemoveMarker = (markerToRemove: string) => {
    setEditAdMarkers(editAdMarkers.filter(m => m !== markerToRemove));
  };

  // Filter & Sort Logic
  const filteredAssets = assets.filter((asset) => {
    // Search match
    const matchesSearch = 
      asset.title.toLowerCase().includes(search.toLowerCase()) || 
      (asset.category && asset.category.toLowerCase().includes(search.toLowerCase())) ||
      (asset.description && asset.description.toLowerCase().includes(search.toLowerCase())) ||
      (asset.tags && asset.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
    
    // Type match
    let matchesType = true;
    if (filterType !== 'all') {
      if (filterType === 'uploads') {
        // Tagged as ingested or has custom description
        matchesType = asset.tags.includes('pending-enrichment') || 
                      (asset.description && asset.description.includes('Ingested')) ||
                      !['asset-1', 'asset-2', 'asset-3', 'asset-4', 'asset-5'].includes(asset.id);
      } else {
        matchesType = asset.type === filterType;
      }
    }

    // Selected Tag match
    const matchesTag = !selectedTag || (asset.tags && asset.tags.includes(selectedTag));

    return matchesSearch && matchesType && matchesTag;
  });

  // Sort Logic
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (sortBy === 'newest') {
      // Simulate newest based on id or default fallback
      return b.id.localeCompare(a.id);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'duration-desc') {
      return b.duration - a.duration;
    }
    if (sortBy === 'duration-asc') {
      return a.duration - b.duration;
    }
    if (sortBy === 'loudness') {
      // Closer to compliant -24 LUFS first
      return Math.abs(a.loudnessDb + 24) - Math.abs(b.loudnessDb + 24);
    }
    if (sortBy === 'qc-compliant') {
      if (a.isQCed === b.isQCed) return 0;
      return a.isQCed ? -1 : 1;
    }
    return 0;
  });

  // Calculate Quick Stats
  const totalDuration = assets.reduce((sum, current) => sum + current.duration, 0);
  const qcedCount = assets.filter(a => a.isQCed).length;
  const pendingQC = assets.filter(a => !a.isQCed).length;
  const criticalAudioLoudnessCount = assets.filter(a => a.loudnessDb > -21.0).length;

  return (
    <div className="space-y-6">
      {/* 4-Column Bento Statistics Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-slate-950 border border-slate-900 p-4 shadow flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/10">
            <Film className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">{assets.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold font-mono">Total Assets</div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-900 p-4 shadow flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">{qcedCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold font-mono font-sans">QC Certified</div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-900 p-4 shadow flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/10">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">{pendingQC}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold font-mono">Awaiting QC</div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-900 p-4 shadow flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/10 animate-pulse">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-white">{criticalAudioLoudnessCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold font-mono">Audio Warnings</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Vault Content Panel (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-xl bg-slate-950 border border-slate-900 p-6 shadow-lg">
            
            {/* Header section with view toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <Film className="h-5 w-5 text-sky-400" />
                  MAM Media Library & Broadcast Vault
                </h2>
                <p className="text-xs text-slate-400">Manage video clips, program guides, mid-roll ad markers, and EBU R128 compliance ratings</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded border transition ${
                    viewMode === 'grid' 
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' 
                      : 'bg-slate-900 text-slate-500 border-slate-850 hover:text-slate-300'
                  }`}
                  title="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded border transition ${
                    viewMode === 'list' 
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' 
                      : 'bg-slate-900 text-slate-500 border-slate-850 hover:text-slate-300'
                  }`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="ml-2 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-sky-500/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Register Log
                </button>
              </div>
            </div>

            {/* Quick Ingestion Drag & Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-sky-500 bg-sky-950/20 shadow-lg shadow-sky-500/5' 
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/10'
              } mb-6`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                multiple 
                accept="video/*,audio/*" 
                className="hidden" 
              />
              <UploadCloud className={`h-10 w-10 mx-auto mb-3.5 ${isDragging ? 'text-sky-400 animate-bounce' : 'text-slate-500'}`} />
              <div className="text-xs font-bold text-slate-200">Drag & Drop Broadcast Video files here</div>
              <p className="text-[11px] text-slate-500 mt-1">or click to browse local drives (MP4, MKV, TS, MXF formats up to 4GB)</p>
              <div className="inline-flex items-center gap-1.5 mt-3 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[9px] text-slate-400 font-mono">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                Auto-analyzes format, sizes & airtime lengths
              </div>
            </div>

            {/* Ingestion progress items */}
            {uploadingFiles.length > 0 && (
              <div className="mb-6 space-y-2.5 bg-slate-900/40 border border-slate-800 rounded-lg p-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-sky-400 animate-pulse" />
                    Active Media Ingestion Pipelines
                  </span>
                  <button 
                    onClick={() => setUploadingFiles([])} 
                    className="text-[9px] text-slate-500 hover:text-slate-300 font-mono hover:underline"
                  >
                    Clear Log
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar">
                  {uploadingFiles.map((file) => (
                    <div key={file.id} className="bg-slate-950/80 border border-slate-850 p-2.5 rounded-lg flex items-center justify-between gap-4 text-[11px]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-slate-200 truncate pr-1" title={file.name}>{file.name}</span>
                          <span className="text-slate-500 shrink-0 font-mono">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              file.status === 'completed' ? 'bg-emerald-500' : 'bg-sky-500'
                            }`}
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                        {file.status === 'uploading' && (
                          <div className="flex items-center justify-between mt-1 text-[9px] text-slate-500 font-mono">
                            <span>Ingesting: {file.speed}</span>
                            <span>ETA: {file.eta}s</span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 min-w-[70px] text-right">
                        {file.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Check className="h-3 w-3" />
                            INGESTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] text-sky-400 font-bold font-mono animate-pulse">
                            {file.progress}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter controls, tag cloud & search bar */}
            <div className="space-y-4 mb-6">
              {/* Search & Ingestion Category Filter */}
              <div className="flex flex-col md:flex-row gap-3 bg-slate-900/30 p-3 rounded-lg border border-slate-800/80">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by titles, categories, description, or tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800/85 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">Sort By</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                  >
                    <option value="newest">Newest Ingested</option>
                    <option value="title">Alphabetical (A-Z)</option>
                    <option value="duration-desc">Duration (Longest)</option>
                    <option value="duration-asc">Duration (Shortest)</option>
                    <option value="loudness">Compliant Loudness (-24 LUFS)</option>
                    <option value="qc-compliant">QC Certified First</option>
                  </select>
                </div>
              </div>

              {/* Quick Tab Selectors */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-900 pb-2.5">
                {[
                  { id: 'all', label: 'All Vault Assets' },
                  { id: 'program', label: 'Programs' },
                  { id: 'commercial', label: 'Commercials' },
                  { id: 'promo', label: 'Promos' },
                  { id: 'filler', label: 'Filler loops' },
                  { id: 'uploads', label: 'Uploaded Files' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setFilterType(tab.id);
                      setSelectedTag(null); // clear tag filter when changing type
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                      filterType === tab.id
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-slate-300 hover:border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tag Cloud Selector */}
              {allUniqueTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="text-slate-500 flex items-center gap-1 shrink-0 font-mono">
                    <Tag className="h-3 w-3" />
                    Popular Tags:
                  </span>
                  {allUniqueTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`px-2.5 py-0.5 rounded-full border transition ${
                        selectedTag === tag 
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 font-bold' 
                          : 'bg-slate-900 text-slate-400 border-slate-850 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {selectedTag && (
                    <button 
                      onClick={() => setSelectedTag(null)}
                      className="ml-1 px-2 py-0.5 text-rose-400 hover:text-rose-300 hover:underline text-[9px] font-semibold"
                    >
                      Clear tag filter
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Asset Rendering Engine */}
            {sortedAssets.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                <Film className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                No assets in the MAM library match the current search filters.
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View (Visual Cards) */
              <div className="grid gap-4 sm:grid-cols-2">
                {sortedAssets.map((asset) => {
                  const isEditing = editingAssetId === asset.id;
                  const showDelete = showDeleteConfirmId === asset.id;
                  
                  return (
                    <div
                      key={asset.id}
                      className={`group rounded-xl border p-4.5 transition-all flex flex-col justify-between ${
                        isEditing 
                          ? 'bg-slate-900/30 border-sky-500/50 ring-1 ring-sky-500/20' 
                          : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/30 hover:border-slate-750'
                      }`}
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[9px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wide border border-slate-800">
                              {asset.type}
                            </span>
                            <h3 className="font-bold text-sm text-slate-100 mt-1.5 truncate group-hover:text-white transition-colors" title={asset.title}>
                              {asset.title}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              {asset.category} • {asset.duration} mins
                            </span>
                          </div>

                          {/* QC Stamp */}
                          <div className="shrink-0">
                            {asset.isQCed ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                <Check className="h-2.5 w-2.5" />
                                QC OK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                <AlertCircle className="h-2.5 w-2.5 animate-pulse" />
                                NO QC
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {asset.description || "No synopsis provided. Run AI CastPilot enrichment to sync tags & metadata."}
                        </p>

                        {/* Metadata row */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-[10px]">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Volume2 className={`h-3.5 w-3.5 shrink-0 ${asset.loudnessDb > -21.0 ? 'text-rose-400' : 'text-slate-500'}`} />
                            <span className="truncate">Loudness: <strong className={asset.loudnessDb > -21.0 ? 'text-rose-400' : 'text-slate-300'}>{asset.loudnessDb} dB</strong></span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 truncate">
                            <Eye className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">Rating: <strong className="text-slate-300">{asset.safetyRating}</strong></span>
                          </div>
                        </div>

                        {/* Tags display */}
                        {asset.tags && asset.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {asset.tags.slice(0, 3).map(t => (
                              <span key={t} className="bg-slate-900 text-slate-500 text-[9px] font-mono px-2 py-0.5 rounded">
                                #{t}
                              </span>
                            ))}
                            {asset.tags.length > 3 && (
                              <span className="text-[9px] text-slate-600 font-mono py-0.5">
                                +{asset.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Cue points count */}
                        {asset.adMarkers && asset.adMarkers.length > 0 && (
                          <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {asset.adMarkers.length} ad cue points inserted: {asset.adMarkers.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Control buttons */}
                      <div className="mt-4 pt-3.5 border-t border-slate-900/60 flex items-center justify-between gap-1">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => startEditing(asset)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition"
                            title="Edit metadata & cue points"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => onEnrichAsset(asset.id)}
                            disabled={enrichingAssetId === asset.id}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[10px] font-bold tracking-wider uppercase transition flex items-center gap-1 shrink-0"
                            title="Run AI tag generation"
                          >
                            {enrichingAssetId === asset.id ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Tagging...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3 w-3 text-sky-400" />
                                AI Tag
                              </>
                            )}
                          </button>
                        </div>

                        {showDelete ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleConfirmDelete(asset.id)}
                              className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirmId(null)}
                              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteClick(asset.id)}
                            className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/20 text-red-400 hover:text-red-300 border border-red-900/20 transition"
                            title="Delete asset"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View (Compact Table Rows) */
              <div className="border border-slate-900 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-900 font-mono">
                      <th className="p-3">Title & Type</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Loudness</th>
                      <th className="p-3 text-center">QC Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {sortedAssets.map((asset) => {
                      const showDelete = showDeleteConfirmId === asset.id;
                      return (
                        <tr key={asset.id} className="hover:bg-slate-900/20 bg-slate-950/10">
                          <td className="p-3">
                            <div className="font-bold text-slate-200">{asset.title}</div>
                            <div className="text-[9px] font-mono text-slate-500 uppercase">{asset.type}</div>
                          </td>
                          <td className="p-3 text-slate-400">{asset.category}</td>
                          <td className="p-3 text-slate-300 font-mono">{asset.duration}m</td>
                          <td className="p-3 font-mono">
                            <span className={asset.loudnessDb > -21.0 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                              {asset.loudnessDb} dB
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {asset.isQCed ? (
                              <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                                Compliant
                              </span>
                            ) : (
                              <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/10 px-2 py-0.5 rounded-full font-bold">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startEditing(asset)}
                                className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => onEnrichAsset(asset.id)}
                                disabled={enrichingAssetId === asset.id}
                                className="p-1 rounded bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 disabled:opacity-50"
                              >
                                <Sparkles className="h-3 w-3" />
                              </button>
                              
                              {showDelete ? (
                                <button
                                  onClick={() => handleConfirmDelete(asset.id)}
                                  className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px]"
                                >
                                  Del
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleDeleteClick(asset.id)}
                                  className="p-1 rounded bg-red-950/20 text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Sidebar Control & Editor Panel (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Metadata Inspector & Editor Container */}
          {editingAssetId ? (
            <div className="rounded-xl bg-slate-950 border border-sky-500/40 p-5 shadow-xl animate-fadeIn space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-sky-400 animate-spin" />
                  <h3 className="font-display text-sm font-semibold text-white">Asset Inspector</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingAssetId(null)}
                  className="p-1 rounded hover:bg-slate-900 text-slate-500 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-[11px] max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Asset Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Asset Type</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="program">Program</option>
                      <option value="commercial">Commercial</option>
                      <option value="promo">Promo</option>
                      <option value="filler">Filler</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Duration (Min)</label>
                    <input
                      type="number"
                      value={editDuration}
                      onChange={(e) => setEditDuration(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Category / Genre</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Safety Rating</label>
                  <select
                    value={editSafetyRating}
                    onChange={(e) => setEditSafetyRating(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="G">G (General Audience)</option>
                    <option value="PG">PG (Parental Guidance)</option>
                    <option value="PG-13">PG-13 (Teenagers)</option>
                    <option value="R">R (Restricted Adult)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">Description / Synopsis</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full h-16 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* EBU R128 Manual Compliance Sliders */}
                <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Audio Volume Calibration</span>
                    <span className={`font-mono text-xs font-bold ${editLoudnessDb > -21.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {editLoudnessDb} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="-10"
                    step="0.1"
                    value={editLoudnessDb}
                    onChange={(e) => setEditLoudnessDb(Number(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                  
                  {editLoudnessDb > -21.0 ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-[10px] text-red-400 flex items-start gap-1.5 font-mono">
                      <AlertOctagon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <div>
                        <strong>CALM Act Violation flag!</strong> Audio exceeds standard -24 LUFS threshold.
                        <button 
                          type="button" 
                          onClick={() => setEditLoudnessDb(-24.0)} 
                          className="block text-sky-400 underline hover:text-sky-300 mt-1"
                        >
                          Auto-calibrate to -24.0 dB
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <ShieldCheck className="h-3 w-3" />
                      Loudness meets EBU R128 broadcast specs.
                    </div>
                  )}

                  {/* Manual QC compliancy override */}
                  <div className="flex items-center justify-between border-t border-slate-800/50 pt-2.5 mt-2">
                    <span className="text-slate-400 font-medium">Verify Compliant QC Check:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editIsQCed}
                        onChange={(e) => setEditIsQCed(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                </div>

                {/* Splicing Ad Cue Marker points */}
                <div className="border border-slate-850 p-3 rounded-lg bg-slate-900/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Cue Point Ad Inserters</span>
                    <span className="text-[10px] text-slate-500 font-mono">{editAdMarkers.length} markers</span>
                  </div>

                  {/* Simulated timeline line */}
                  <div className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-visible border border-slate-800">
                    {editAdMarkers.map((marker, idx) => {
                      // Try to parse marker as MM:SS or HH:MM:SS to find percentage
                      const parts = marker.split(':');
                      let percentage = 40; // fallback
                      if (parts.length === 3) {
                        const totalSec = parseInt(parts[0], 10)*3600 + parseInt(parts[1],10)*60 + parseInt(parts[2],10);
                        const durSec = editDuration * 60;
                        percentage = Math.min(95, Math.max(5, Math.round((totalSec / durSec) * 100)));
                      }
                      return (
                        <div 
                          key={idx} 
                          className="absolute h-3 w-1.5 bg-red-500 -top-[2px] rounded-full group/pin"
                          style={{ left: `${percentage}%` }}
                          title={`Splicing break: ${marker}`}
                        >
                          <div className="absolute opacity-0 group-hover/pin:opacity-100 bg-black border border-slate-800 text-[9px] text-slate-300 px-1 py-0.5 rounded -top-6 -left-10 z-10 whitespace-nowrap transition-opacity">
                            Cue {marker}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* List of active cue points with clear delete button */}
                  {editAdMarkers.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 py-1">
                      {editAdMarkers.map(m => (
                        <span key={m} className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                          {m}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveMarker(m)} 
                            className="text-red-500 hover:text-red-400 hover:scale-110 ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No ad splicing breaks inserted. Playout will execute ad-free.</p>
                  )}

                  {/* Add ad splicing time input form */}
                  <div className="flex gap-1.5 mt-2.5">
                    <input
                      type="text"
                      placeholder="HH:MM:SS (e.g. 00:15:00)"
                      value={newMarkerTime}
                      onChange={(e) => setNewMarkerTime(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-650 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddMarker}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 font-semibold flex items-center gap-1"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-sky-400" />
                      Add Marker
                    </button>
                  </div>
                </div>

                {/* Tags Management */}
                <div className="border border-slate-850 p-3 rounded-lg bg-slate-900/20 space-y-2">
                  <span className="font-bold text-slate-300 block">Edit Asset Tags</span>
                  
                  {editTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {editTags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-slate-900 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-800 font-mono">
                          #{tag}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTag(tag)} 
                            className="text-slate-500 hover:text-slate-300 ml-0.5"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No tags associated.</p>
                  )}

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add tag (e.g. outdoors)"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setEditingAssetId(null)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-lg border border-sky-450/20 shadow-md shadow-sky-500/15"
                >
                  Save Ingest updates
                </button>
              </div>
            </div>
          ) : (
            /* Scheduling Mode Selector if not editing details */
            <div className="rounded-xl bg-slate-950 border border-slate-900 p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className={`h-4.5 w-4.5 ${schedulingMode === 'auto' ? 'text-sky-400' : 'text-amber-400'}`} />
                <h3 className="font-display text-sm font-semibold text-white">FAST Scheduling Lineup</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Configure how your TV channel lineup is sequenced. Opt for Gemini automated scheduling or customize every timing block.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSchedulingMode('auto');
                    if (addToast) addToast("Switched to Auto AI Lineup Scheduling", "success");
                  }}
                  className={`p-3 rounded-lg text-left border transition-all flex flex-col gap-1.5 ${
                    schedulingMode === 'auto'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      : 'bg-slate-900/60 text-slate-400 border-slate-850 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                    <span className="text-[11px] font-bold tracking-wide">Auto AI</span>
                  </div>
                  <span className="text-[9px] text-slate-400 leading-normal">Gemini auto-schedules playout and ad breaks.</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSchedulingMode('manual');
                    if (addToast) addToast("Switched to Manual Playout Scheduling", "success");
                  }}
                  className={`p-3 rounded-lg text-left border transition-all flex flex-col gap-1.5 ${
                    schedulingMode === 'manual'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-slate-900/60 text-slate-400 border-slate-850 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold tracking-wide">Manual</span>
                  </div>
                  <span className="text-[9px] text-slate-400 leading-normal">Manually allocate, time, and order every block.</span>
                </button>
              </div>
            </div>
          )}

          {/* Form for registering new asset */}
          {showAddForm && !editingAssetId && (
            <div className="rounded-xl bg-slate-950 border border-sky-500/30 p-5 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4.5 w-4.5 text-sky-400" />
                <h3 className="font-display text-sm font-semibold text-white">Manual Ingestion Registry</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Manually record catalog information for any local program or commercial spot. Run the compliance checker once registered.
              </p>

              <form onSubmit={handleSubmitManual} className="flex flex-col gap-3.5 text-[11px]">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Asset Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chronicles of the Moon base"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Asset Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="program">Program</option>
                      <option value="commercial">Commercial</option>
                      <option value="promo">Promo</option>
                      <option value="filler">Filler</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Duration (Min)</label>
                    <input
                      type="number"
                      required
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      placeholder="30"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Category / Genre</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Documentary / Sci-Fi"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Ingest Description / Synopsis</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief synopsis of media files..."
                    className="w-full h-16 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 text-xs font-semibold border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAdd}
                    className="flex-1 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs border border-sky-450/20 shadow-md shadow-sky-500/10"
                  >
                    {loadingAdd ? 'Registering...' : 'Register Ingestion Entry'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Guidelines / Help Card */}
          <div className="rounded-xl bg-slate-950 border border-slate-900 p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Library Control Guidelines</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              FAST TV networks require absolute precision. Follow these parameters when preparing media for automatic playout scheduling:
            </p>
            <div className="space-y-2.5 bg-slate-900/60 border border-slate-800 p-3 rounded-lg text-[10px] text-slate-300 font-mono">
              <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-sky-400 rounded-full"></span>Programs are placed in main block hourly slots.</div>
              <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-red-400 rounded-full"></span>Commercials run at inserted Cue Points.</div>
              <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></span>Playout checks loudness for CALM Act violations.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
