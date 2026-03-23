"use client";

import { useState } from 'react';
import Analyzer from './components/Analyzer';
import UserProfileModal from './components/UserProfileModal';
import StatsBar from './components/StatsBar';
import ScanHistoryPanel from './components/ScanHistoryPanel';

export default function Home() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative z-0 selection:bg-tactical-orange/30 selection:text-tactical-orange">

      {/* Header Section */}
      <div className="text-center mb-10 relative">
        <div className="inline-block mb-6 px-3 py-1 bg-tactical-orange/10 border border-tactical-orange/20 rounded-sm">
          <span className="text-tactical-orange text-xs font-bold tracking-[0.2em] uppercase">CyFocus // System Active</span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tighter mb-6 leading-tight">
          Human-Centric <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-400 to-gray-600">
            Defense Matrix
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono text-sm leading-relaxed border-t border-white/5 pt-6">
          <span className="text-tactical-orange">{">>"}</span> ANALYZE THREAT VULNERABILITY IN REAL-TIME
        </p>
      </div>

      {/* Stats Bar + Settings */}
      <StatsBar onSettingsClick={() => setProfileOpen(true)} />

      {/* Main Analyzer Component */}
      <Analyzer />

      {/* Scan History Panel */}
      <div className="mt-6">
        <ScanHistoryPanel />
      </div>

      {/* Footer / Credits */}
      <div className="mt-16 text-center text-xs text-gray-700 font-mono uppercase tracking-widest">
        <p className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tactical-orange animate-pulse"></span>
          Secure Connection Established • PhiShield Sys v2.4
        </p>
      </div>

      {/* User Risk Profile Modal */}
      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </main>
  );
}
