"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, ChevronUp, Trash2, AlertOctagon, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useScanHistory } from '../context/ScanHistoryContext';

const RISK_CONFIG = {
  Safe: {
    icon: CheckCircle,
    textColor: 'text-tactical-green',
    bgColor: 'bg-tactical-green/10',
    borderColor: 'border-tactical-green/25',
    dotColor: 'bg-tactical-green',
  },
  Suspicious: {
    icon: AlertTriangle,
    textColor: 'text-tactical-amber',
    bgColor: 'bg-tactical-amber/10',
    borderColor: 'border-tactical-amber/25',
    dotColor: 'bg-tactical-amber',
  },
  Phishing: {
    icon: AlertOctagon,
    textColor: 'text-tactical-red',
    bgColor: 'bg-tactical-red/10',
    borderColor: 'border-tactical-red/25',
    dotColor: 'bg-tactical-red',
  },
};

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoString) {
  const d = new Date(isoString);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ScanHistoryPanel() {
  const { history, clearHistory, totalScans } = useScanHistory();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto font-mono">
      {/* Panel Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none rounded-t-lg border border-white/8 bg-white/3 hover:bg-white/5 transition-colors"
        onClick={() => setCollapsed((p) => !p)}
      >
        <div className="flex items-center gap-2.5 text-gray-400">
          <History className="w-3.5 h-3.5 text-tactical-orange" />
          <span className="text-xs font-bold uppercase tracking-[0.15em]">Scan History</span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-tactical-orange/15 text-tactical-orange rounded font-bold">
            {totalScans}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {history.length > 0 && !collapsed && (
            <button
              onClick={(e) => { e.stopPropagation(); clearHistory(); }}
              className="text-gray-700 hover:text-tactical-red transition-colors flex items-center gap-1 text-[10px] uppercase tracking-wider"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-gray-600" />
            : <ChevronUp className="w-4 h-4 text-gray-600" />
          }
        </div>
      </div>

      {/* Panel Body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="history-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-x border-b border-white/8 rounded-b-lg"
          >
            {history.length === 0 ? (
              <div className="py-8 text-center text-gray-700 text-xs uppercase tracking-widest">
                <History className="w-6 h-6 mx-auto mb-2 opacity-30" />
                No scans recorded yet
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-56 overflow-y-auto">
                {history.map((scan, idx) => {
                  const cfg = RISK_CONFIG[scan.risk] || RISK_CONFIG.Safe;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={scan.id}
                      initial={idx === 0 ? { opacity: 0, y: -8 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors"
                    >
                      {/* Risk Badge */}
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-sm border text-[10px] font-bold uppercase shrink-0 ${cfg.bgColor} ${cfg.borderColor} ${cfg.textColor}`}>
                        <Icon className="w-3 h-3" />
                        {scan.risk}
                      </div>

                      {/* Snippet */}
                      <span className="text-gray-500 text-xs flex-1 truncate">
                        {scan.snippet || '(no text)'}...
                      </span>

                      {/* Time */}
                      <div className="flex items-center gap-1 text-gray-700 text-[10px] shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatDate(scan.timestamp)} {formatTime(scan.timestamp)}</span>
                      </div>

                      {/* Confidence */}
                      <span className="text-gray-700 text-[10px] shrink-0 hidden sm:block">
                        {scan.confidence}%
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
