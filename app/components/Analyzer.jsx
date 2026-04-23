"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, AlertTriangle, CheckCircle, Search, Zap, Activity,
    AlertOctagon, Terminal, ShieldCheck, XCircle, ListChecks,
    Ban, RotateCcw, Settings, ShieldOff
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { useScanHistory } from '../context/ScanHistoryContext';
import { useUserProfile } from '../context/UserProfileContext';

// Derive ring / badge color from a 0-100 score
function getRiskColor(score) {
    if (score <= 25) return 'text-tactical-green';
    if (score <= 50) return 'text-tactical-amber';
    if (score <= 75) return 'text-tactical-red';
    return 'text-tactical-red'; // Critical — still red
}

export default function Analyzer({ onOpenProfile }) {
    const [text, setText] = useState('');
    const [status, setStatus] = useState('idle'); // idle | analyzing | done | error
    const [results, setResults] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [showProfileWarning, setShowProfileWarning] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalContent, setErrorModalContent] = useState('');
    const [pendingAnalyze, setPendingAnalyze] = useState(false);

    const { addScan } = useScanHistory();
    const { isProfileSet, profile } = useUserProfile();

    const resultsRef = useRef(null);

    // Auto-scroll to results once they appear
    useEffect(() => {
        if (status === 'done' && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        }
    }, [status]);

    const runAnalyze = async () => {
        if (!text.trim()) return;
        setStatus('analyzing');
        setApiError(null);
        setResults(null);

        try {
            if (!navigator.onLine) {
                throw new Error("You appear to be offline. Please check your connection and try again.");
            }

            const response = await fetch('/api/submit-mcq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailContent: text,
                    userProfile: profile,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Analysis failed. Please try again.');
            }

            setResults(data);
            setStatus('done');
            addScan({
                text,
                risk: data.messageRisk,
                confidence: data.confidence,
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            console.error('[Analyzer] API error:', err.message);
            // Catch native fetch network errors
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                setErrorModalContent("Analysis service is temporarily unavailable. Please try again later.");
            } else {
                setErrorModalContent(err.message);
            }
            setShowErrorModal(true);
            setStatus('error');
        }
    };

    const handleAnalyze = () => {
        if (!text.trim()) return;
        if (!isProfileSet) {
            setShowProfileWarning(true);
            setPendingAnalyze(true);
        } else {
            runAnalyze();
        }
    };

    const handleNewScan = () => {
        setText('');
        setStatus('idle');
        setResults(null);
        setApiError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Color helpers for the vulnerability ring
    const ringColorClass = results
        ? getRiskColor(results.userSusceptibility)
        : 'text-tactical-green';

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 relative z-10 font-mono">

            {/* ── Profile Warning Modal ── */}
            <AnimatePresence>
                {showProfileWarning && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="warning-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
                            onClick={() => setShowProfileWarning(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            key="warning-modal"
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        >
                            <div
                                className="w-full max-w-md rounded-sm font-mono"
                                style={{
                                    background: 'rgba(18,16,14,0.98)',
                                    border: '1px solid rgba(249,115,22,0.3)',
                                    boxShadow: '0 0 60px rgba(249,115,22,0.12)',
                                }}
                            >
                                {/* Modal Header */}
                                <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/5">
                                    <div className="p-2.5 rounded-sm bg-tactical-amber/10 border border-tactical-amber/25 shrink-0">
                                        <ShieldOff className="w-5 h-5 text-tactical-amber" />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-sm uppercase tracking-[0.15em]">
                                            Profile Not Configured
                                        </h2>
                                        <p className="text-gray-600 text-[11px] mt-0.5 tracking-wide">
                                            Personalisation unavailable
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="px-6 py-5 space-y-4">
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        You're about to run a scan <span className="text-tactical-amber font-bold">without a behavioural profile</span>. This means PhiShield AI cannot personalise your vulnerability score or tailor recommendations to your habits.
                                    </p>
                                    <div className="border-l-2 border-tactical-orange/40 pl-4 space-y-1.5">
                                        <p className="text-gray-500 text-xs leading-relaxed">
                                            <span className="text-tactical-orange">→</span> Your <span className="text-white">Risk Score</span> will reflect the message threat only, not your personal susceptibility.
                                        </p>
                                        <p className="text-gray-500 text-xs leading-relaxed">
                                            <span className="text-tactical-orange">→</span> <span className="text-white">Recommendations</span> will be generic rather than targeted to your behaviour.
                                        </p>
                                        <p className="text-gray-500 text-xs leading-relaxed">
                                            <span className="text-tactical-orange">→</span> It only takes <span className="text-white">60 seconds</span> to configure your profile — and it makes a real difference.
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="px-6 pb-6 flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowProfileWarning(false);
                                            setPendingAnalyze(false);
                                            if (onOpenProfile) onOpenProfile();
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider bg-tactical-orange text-white hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] cursor-pointer"
                                    >
                                        <Settings className="w-3.5 h-3.5" />
                                        Configure Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowProfileWarning(false);
                                            setPendingAnalyze(false);
                                            runAnalyze();
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider border border-white/15 text-gray-400 hover:text-white hover:border-white/30 transition-all cursor-pointer"
                                    >
                                        Scan Anyway
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Error Modal ── */}
            <AnimatePresence>
                {showErrorModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
                            onClick={() => setShowErrorModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        >
                            <div
                                className="w-full max-w-sm rounded-sm font-mono relative"
                                style={{
                                    background: 'rgba(18,16,14,0.98)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    boxShadow: '0 0 60px rgba(239,68,68,0.12)',
                                }}
                            >
                                <button 
                                    onClick={() => setShowErrorModal(false)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                                <div className="flex flex-col items-center justify-center p-6 text-center">
                                    <div className="p-3 rounded-full bg-tactical-red/10 border border-tactical-red/25 mb-4">
                                        <AlertTriangle className="w-6 h-6 text-tactical-red" />
                                    </div>
                                    <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-2">
                                        System Error
                                    </h2>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {errorModalContent}
                                    </p>
                                </div>
                                <div className="px-6 pb-6">
                                    <button
                                        onClick={() => setShowErrorModal(false)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm font-bold text-xs uppercase tracking-wider bg-tactical-red/20 text-tactical-red hover:bg-tactical-red hover:text-white transition-all border border-tactical-red/50 cursor-pointer"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Input Card ── */}
            <GlassCard className="relative overflow-hidden group border-l-4 border-l-tactical-orange">
                <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-tactical-orange uppercase tracking-widest">
                            <Terminal className="w-5 h-5" />
                            Input stream
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                            {isProfileSet && (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-tactical-green/10 border border-tactical-green/20 text-tactical-green text-[10px] tracking-wider">
                                    <ShieldCheck className="w-3 h-3" /> Profile Active
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-tactical-green rounded-full animate-pulse" />
                                SYSTEM READY
                            </span>
                            <span>::</span>
                            <span>ENC_LEVEL_3</span>
                        </div>
                    </div>

                    <textarea
                        className="w-full h-56 p-4 rounded-none bg-tactical-item/50 border border-white/10 text-gray-300 placeholder-gray-600 outline-none resize-none font-mono text-sm focus:border-tactical-orange/50 transition-colors"
                        placeholder="// Paste raw message content for heuristic scanning..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    {/* Button Row */}
                    <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 pt-2">
                        {/* New Scan — only enabled after done/error */}
                        <button
                            onClick={handleNewScan}
                            disabled={status !== 'done' && status !== 'error'}
                            title="Start a new scan"
                            className={`
                                px-5 py-3 sm:py-2 rounded-sm font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm
                                ${status === 'done' || status === 'error'
                                    ? 'border border-white/20 text-gray-300 hover:border-white/40 hover:text-white cursor-pointer'
                                    : 'border border-white/5 text-gray-700 cursor-not-allowed opacity-40'}
                            `}
                        >
                            <RotateCcw className="w-4 h-4" />
                            New Scan
                        </button>

                        {/* Execute Scan */}
                        <button
                            onClick={handleAnalyze}
                            disabled={status === 'analyzing' || status === 'done' || !text.trim()}
                            className={`
                                px-6 py-3 sm:py-2 rounded-sm font-bold text-white transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm
                                ${status === 'analyzing' || status === 'done' || !text.trim()
                                    ? 'bg-white/5 cursor-not-allowed opacity-50'
                                    : 'bg-tactical-orange hover:bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.4)] cursor-pointer'}
                            `}
                        >
                            {status === 'analyzing' ? (
                                <>
                                    <Activity className="w-4 h-4 animate-spin" />
                                    AI Analysing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Execute Scan
                                </>
                            )}
                        </button>
                    </div>

                    {/* API Error Banner */}
                    {status === 'error' && apiError && (
                        <div className="flex items-start gap-3 p-3 mt-2 rounded-sm bg-tactical-red/10 border border-tactical-red/30 text-tactical-red text-xs font-mono">
                            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{apiError}</span>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* ── Results Section ── */}
            <AnimatePresence>
                {status === 'done' && results && (
                    <motion.div
                        ref={resultsRef}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Risk Card */}
                            <GlassCard className={`md:col-span-2 relative overflow-hidden border-t-2 ${
                                results.messageRisk === 'Phishing' ? 'border-t-tactical-red' :
                                results.messageRisk === 'Safe'     ? 'border-t-tactical-green'
                                                                   : 'border-t-tactical-amber'
                            }`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Shield className="w-32 h-32" />
                                </div>

                                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                                    <h3 className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold">Threat Assessment</h3>
                                    <span className={`text-xs font-bold font-mono px-3 py-1 rounded-sm border ${
                                        results.messageRisk === 'Phishing' ? 'bg-tactical-red/10 border-tactical-red/30 text-tactical-red' :
                                        results.messageRisk === 'Safe'     ? 'bg-tactical-green/10 border-tactical-green/30 text-tactical-green'
                                                                           : 'bg-tactical-amber/10 border-tactical-amber/30 text-tactical-amber'
                                    }`}>
                                        CONFIDENCE: {results.confidence !== null ? `${results.confidence}%` : 'N/A'}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-6">
                                    <div className={`p-5 rounded-sm border-2 shrink-0 ${
                                        results.messageRisk === 'Phishing' ? 'border-tactical-red bg-tactical-red/10 text-tactical-red' :
                                        results.messageRisk === 'Safe'     ? 'border-tactical-green bg-tactical-green/10 text-tactical-green'
                                                                           : 'border-tactical-amber bg-tactical-amber/10 text-tactical-amber'
                                    }`}>
                                        {results.messageRisk === 'Phishing'   && <AlertOctagon className="w-10 h-10" />}
                                        {results.messageRisk === 'Safe'        && <CheckCircle  className="w-10 h-10" />}
                                        {results.messageRisk === 'Suspicious'  && <AlertTriangle className="w-10 h-10" />}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex flex-col">
                                            <h2 className="text-4xl font-black text-white tracking-tight uppercase leading-none">
                                                {results.messageRisk}
                                            </h2>
                                            {results.attackType && results.attackType !== 'Unknown' && (
                                                <span className={`text-sm font-bold uppercase tracking-wider mt-2 ${
                                                    results.messageRisk === 'Phishing' ? 'text-tactical-red/80' :
                                                    results.messageRisk === 'Safe'     ? 'text-tactical-green/80'
                                                                                       : 'text-tactical-amber/80'
                                                }`}>
                                                    {results.attackType}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm mt-2 border-l-2 border-white/10 pl-3">
                                            {results.messageRisk === 'Safe'     ? 'Traffic authorized. No malicious intent detected.' :
                                             results.messageRisk === 'Phishing' ? 'Immediate intervention required. High probability of malicious intent.'
                                                                                : 'Manual verification advised. Potential anomaly detected.'}
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Vulnerability Ring */}
                            <GlassCard className="flex flex-col items-center justify-center relative border-t-2 border-t-gray-700">
                                <h3 className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold mb-6 w-full text-left">Target Vuln.</h3>
                                <div className="relative">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="#292524" strokeWidth="8" fill="none" />
                                        <circle
                                            cx="64" cy="64" r="56"
                                            stroke="currentColor" strokeWidth="8" fill="none"
                                            strokeDasharray={351}
                                            strokeDashoffset={results.userSusceptibility !== null ? 351 - (351 * results.userSusceptibility) / 100 : 351}
                                            className={`transition-all duration-1000 ease-out ${ringColorClass}`}
                                            strokeLinecap="square"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-white">
                                            {results.userSusceptibility !== null ? results.userSusceptibility : 'N/A'}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-bold tracking-widest">RISK</span>
                                    </div>
                                </div>
                                {/* Risk level label below ring */}
                                <span className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${ringColorClass}`}>
                                    {results.riskLevel}
                                </span>
                            </GlassCard>
                        </div>

                        {/* Behavioural Analysis + Immediate Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <GlassCard className="border-l-2 border-l-tactical-orange">
                                <h3 className="text-tactical-orange text-xs uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Analysis Log
                                </h3>
                                <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-white/10 pl-4">
                                    {results.behaviouralAnalysis || results.explanation}
                                </p>
                            </GlassCard>

                            <GlassCard className="border-l-2 border-l-tactical-green">
                                <h3 className="text-tactical-green text-xs uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                                    <ListChecks className="w-4 h-4" />
                                    Immediate Actions
                                </h3>
                                <ul className="space-y-3">
                                    {(results.immediateActions || results.advice || []).map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 bg-white/5 p-2 rounded-sm text-sm text-gray-300 border border-white/5">
                                            <span className="text-tactical-green font-mono shrink-0">0{i + 1}</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>
                        </div>

                        {/* Things To Stop */}
                        {results.thingsToStop && results.thingsToStop.length > 0 && (
                            <GlassCard className="border-l-2 border-l-tactical-red">
                                <h3 className="text-tactical-red text-xs uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                                    <Ban className="w-4 h-4" />
                                    Stop Doing This
                                </h3>
                                <ul className="space-y-3">
                                    {results.thingsToStop.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 bg-tactical-red/5 p-2 rounded-sm text-sm text-gray-300 border border-tactical-red/10">
                                            <span className="text-tactical-red font-mono shrink-0">✕{i + 1}</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
