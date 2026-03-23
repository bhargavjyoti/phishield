"use client";

import { Flame, ScanLine, ShieldCheck, ShieldOff, Settings } from 'lucide-react';
import { useScanHistory } from '../context/ScanHistoryContext';
import { useUserProfile } from '../context/UserProfileContext';

export default function StatsBar({ onSettingsClick }) {
  const { totalScans, cleanStreak } = useScanHistory();
  const { isProfileSet, answeredCount } = useUserProfile();

  const stats = [
    {
      icon: ScanLine,
      label: 'Total Scans',
      value: totalScans,
      color: 'text-tactical-orange',
    },
    {
      icon: Flame,
      label: 'Clean Streak',
      value: cleanStreak,
      color: cleanStreak >= 3 ? 'text-tactical-green' : cleanStreak > 0 ? 'text-tactical-amber' : 'text-gray-600',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 flex items-center justify-between px-4 py-2.5 rounded-sm border border-white/6 bg-white/2 font-mono">
      {/* Left: stats */}
      <div className="flex items-center gap-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-2">
              <Icon className={`w-3.5 h-3.5 ${s.color}`} />
              <span className="text-gray-600 text-[11px] uppercase tracking-wider">{s.label}</span>
              <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
            </div>
          );
        })}
      </div>

      {/* Right: profile pill + settings */}
      <div className="flex items-center gap-3">
        {isProfileSet ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tactical-green/10 border border-tactical-green/25 text-tactical-green text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            Profile Active <span className="text-tactical-green/60 font-normal">({answeredCount}/6)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
            <ShieldOff className="w-3 h-3" />
            Profile Not Set
          </div>
        )}

        <button
          onClick={onSettingsClick}
          title="Open Risk Profile Settings"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-tactical-orange/25 bg-tactical-orange/8 text-tactical-orange text-[11px] font-bold uppercase tracking-wider hover:bg-tactical-orange/20 hover:border-tactical-orange/50 transition-all group"
        >
          <Settings className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
          Configure
        </button>
      </div>
    </div>
  );
}
