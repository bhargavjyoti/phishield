"use client";

import { useState } from 'react';
import Analyzer from './components/Analyzer';
import UserProfileModal from './components/UserProfileModal';
import StatsBar from './components/StatsBar';
import ScanHistoryPanel from './components/ScanHistoryPanel';

export default function Home() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative z-0 selection:bg-tactical-orange/30 selection:text-tactical-orange">

      {/* ── Header ── */}
      <div className="text-center mb-12 relative">

        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 bg-tactical-orange/10 border border-tactical-orange/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-tactical-orange animate-pulse" />
          <span className="text-tactical-orange text-[11px] font-bold tracking-[0.25em] uppercase font-mono">
            AI-Powered • System Active
          </span>
        </div>

        {/* Main title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 leading-[1.1]"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className="text-white">Phi</span>
          <span className="text-tactical-orange">Shield</span>
          <span className="text-white"> AI</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mt-2"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, letterSpacing: '0.01em' }}
        >
          Analyse Your{' '}
          <span className="text-white font-medium">Phishing Vulnerability</span>
          {' '}in Real Time
        </p>

        {/* Divider line */}
        <div className="mt-8 flex items-center justify-center gap-4 text-gray-700">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-gray-600">Human-Centric Defense</span>
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </div>

      {/* ── Stats Bar + Settings ── */}
      <StatsBar onSettingsClick={() => setProfileOpen(true)} />

      {/* ── Main Analyzer ── */}
      <Analyzer onOpenProfile={() => setProfileOpen(true)} />

      {/* ── Scan History ── */}
      <div className="mt-6">
        <ScanHistoryPanel />
      </div>

      {/* ── Footer ── */}
      <div className="mt-16 text-center text-xs text-gray-700 font-mono uppercase tracking-widest">
        <p className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tactical-orange animate-pulse" />
          Secure Connection Established • PhiShield AI v3.0
        </p>
      </div>

      {/* ── User Risk Profile Modal ── */}
      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </main>
  );
}
