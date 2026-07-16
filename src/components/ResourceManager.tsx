import React, { useState } from 'react';
import { ShieldCheck, HardHat, AlertTriangle, Users, Play, Plus, RefreshCw, Key, HelpCircle } from 'lucide-react';
import { ResourceAsset, ConflictAlert } from '../types';

interface ResourceManagerProps {
  resources: ResourceAsset[];
  alerts: ConflictAlert[];
  onBookResource: (id: string, programTitle: string, details: string) => Promise<void>;
  onReleaseResource: (id: string) => Promise<void>;
  loadingBook: boolean;
}

export default function ResourceManager({
  resources,
  alerts,
  onBookResource,
  onReleaseResource,
  loadingBook
}: ResourceManagerProps) {
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [bookingTitle, setBookingTitle] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId || !bookingTitle) {
      setErrorMessage("Please select a resource and provide a booking title.");
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');

    // Book resource
    const targetRes = resources.find(r => r.id === selectedResourceId);
    if (targetRes?.status === 'booked') {
      // Overbooking!
      await onBookResource(selectedResourceId, bookingTitle, bookingDetails);
      setErrorMessage(`Conflict warning: ${targetRes.name} is already booked! Check active critical alerts.`);
    } else {
      await onBookResource(selectedResourceId, bookingTitle, bookingDetails);
      setSuccessMessage(`Successfully allocated resource.`);
      // Reset form
      setBookingTitle('');
      setBookingDetails('');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Active Resource Allocation Tracking Board (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                <HardHat className="h-5 w-5 text-sky-400" />
                Physical Capital & Studio Assets
              </h2>
              <p className="text-xs text-slate-400">High-concurrency shared studio spaces, 4K/8K gear, and critical voice/stage talent</p>
            </div>
            <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-mono text-slate-400 uppercase">
              {resources.length} Total Registered
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((res) => {
              // Color badges based on status
              const statusColors = {
                active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                booked: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
              };

              const resourceIcons = {
                studio: '🏢',
                camera: '🎥',
                talent: '🎙️'
              };

              return (
                <div
                  key={res.id}
                  className="rounded-xl border border-slate-850 bg-slate-950/55 p-4 flex flex-col justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <span className="text-lg bg-slate-900 p-2 rounded-lg border border-slate-800">
                        {resourceIcons[res.type]}
                      </span>
                      <div>
                        <h3 className="text-xs font-semibold text-white tracking-wide">{res.name}</h3>
                        <p className="text-[10px] text-slate-400 capitalize">{res.type} Resource</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase border ${statusColors[res.status]}`}>
                      {res.status}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-900 text-[11px] text-slate-400 leading-normal">
                    {res.status === 'booked' ? (
                      <div>
                        <strong className="text-slate-300">Booking:</strong> {res.currentBooking}
                        <p className="text-[10px] text-slate-500 italic truncate mt-0.5">{res.allocationDetails}</p>
                      </div>
                    ) : res.status === 'maintenance' ? (
                      <div className="text-amber-400">
                        <strong>Maintenance:</strong> Routine sensor tuning and calibration block.
                      </div>
                    ) : (
                      <span className="text-slate-500">Idle - Available for direct allocation.</span>
                    )}
                  </div>

                  {res.status === 'booked' && (
                    <button
                      onClick={() => onReleaseResource(res.id)}
                      className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-semibold text-slate-400 hover:text-white border border-slate-800 transition"
                    >
                      Release Resource / End Playout session
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resource Allocation Booking Form (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Key className="h-4.5 w-4.5 text-sky-400" />
            <h3 className="font-display text-sm font-semibold text-white">Automated Booking</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Reserve studios, cinema equipment, or voice-over talent blocks.
          </p>

          {errorMessage && (
            <div className="mb-3 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-3 p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleBookSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1">Target Asset</label>
              <select
                required
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="">Select Studio, Camera or Talent...</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.status === 'booked' ? '(⚠️ BOOKED)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1">Broadcast Title</label>
              <input
                type="text"
                required
                value={bookingTitle}
                onChange={(e) => setBookingTitle(e.target.value)}
                placeholder="e.g. Beyond the Peak Show Episode 2"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1">Booking Allocation Details</label>
              <input
                type="text"
                value={bookingDetails}
                onChange={(e) => setBookingDetails(e.target.value)}
                placeholder="e.g. Sound design rehearsals & mic tune checks"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={loadingBook}
              className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-lg shadow-sky-500/10 border border-sky-400/10"
              id="reserve-resource-btn"
            >
              Confirm Reservation Slot
            </button>
          </form>
        </div>

        {/* Dynamic Conflict Alerts warning board */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg flex-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Resource Conflict Logs</h3>
          <div className="space-y-2.5 max-h-60 overflow-y-auto no-scrollbar">
            {alerts.filter(a => a.type === 'resource').length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No active studio resource conflicts detected.
              </div>
            ) : (
              alerts.filter(a => a.type === 'resource').map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                    alert.resolved 
                      ? 'bg-slate-900/40 border-slate-800 text-slate-500' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{alert.description}</p>
                  {!alert.resolved && (
                    <div className="bg-slate-900/60 p-2 rounded text-[10px] text-slate-300">
                      <strong>AI Suggestion:</strong> {alert.recommendation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
