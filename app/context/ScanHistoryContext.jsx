"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'phishield_scan_history';
const MAX_HISTORY = 10;

const ScanHistoryContext = createContext(null);

export function ScanHistoryProvider({ children }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const addScan = (scan) => {
    // scan: { text, risk, confidence, timestamp }
    setHistory((prev) => {
      const entry = {
        id: Date.now(),
        snippet: scan.text.slice(0, 60),
        risk: scan.risk,
        confidence: scan.confidence,
        timestamp: scan.timestamp || new Date().toISOString(),
      };
      const updated = [entry, ...prev].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  };

  const totalScans = history.length;

  // Consecutive Safe scans from the most recent
  let cleanStreak = 0;
  for (const scan of history) {
    if (scan.risk === 'Safe') cleanStreak++;
    else break;
  }

  return (
    <ScanHistoryContext.Provider value={{ history, addScan, clearHistory, totalScans, cleanStreak }}>
      {children}
    </ScanHistoryContext.Provider>
  );
}

export function useScanHistory() {
  const ctx = useContext(ScanHistoryContext);
  if (!ctx) throw new Error('useScanHistory must be used within ScanHistoryProvider');
  return ctx;
}
