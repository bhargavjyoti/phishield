"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Search, Lock, Zap, Activity, AlertOctagon, Terminal, ShieldCheck } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { useScanHistory } from '../context/ScanHistoryContext';
import { useUserProfile } from '../context/UserProfileContext';

export default function Analyzer() {
    const [text, setText] = useState('');
    const [status, setStatus] = useState('idle'); // idle, analyzing, done
    const [results, setResults] = useState(null);
    const { addScan } = useScanHistory();
    const { isProfileSet } = useUserProfile();

    const handleAnalyze = () => {
        if (!text.trim()) return;
        setStatus('analyzing');

        setTimeout(() => {
            // Mock Analysis Logic
            const isPhishing = /urgent|verify|click|login|bank|compromised|immedate|suspend/i.test(text);
            const isSuspicious = /offer|winner|prize|account|deal|limit/i.test(text);

            let mockResults = {
                messageRisk: 'Safe',
                confidence: 98,
                userSusceptibility: 5,
                userRiskCategory: 'Low',
                explanation: 'System heuristics analysis complete. No malicious patterns or social engineering triggers identified. The communication structure aligns with standard safe protocols.',
                advice: ['Verify sender identity via secondary channel.', 'Ensure endpoint security software is active.', 'Proceed with standard operational caution.']
            };

            if (isPhishing) {
                mockResults = {
                    messageRisk: 'Phishing',
                    confidence: 96,
                    userSusceptibility: 92,
                    userRiskCategory: 'High',
                    explanation: 'CRITICAL THREAT DETECTED. The message employs urgency cues ("immediately", "suspend") and manipulative styling typical of credential harvesting attacks.',
                    advice: ['DO NOT INTERACT with any links or attachments.', 'Forward message headers to SOC immediately.', 'Block sender domain at gateway level.']
                };
            } else if (isSuspicious) {
                mockResults = {
                    messageRisk: 'Suspicious',
                    confidence: 72,
                    userSusceptibility: 45,
                    userRiskCategory: 'Medium',
                    explanation: 'ANOMALY DETECTED. While no direct malicious payload was found, the promotional language utilizes psychological pressure tactics that warrant elevated caution.',
                    advice: ['Validate offer authenticity on official vendor portal.', 'Do not disclose PII (Personally Identifiable Information).', 'Treat as potential recon attempt.']
                };
            }

            setResults(mockResults);
            setStatus('done');
            addScan({
                text,
                risk: mockResults.messageRisk,
                confidence: mockResults.confidence,
                timestamp: new Date().toISOString(),
            });
        }, 2000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 relative z-10 font-mono">

            {/* Input Section */}
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
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-tactical-green rounded-full animate-pulse" /> SYSTEM READY</span>
                            <span>::</span>
                            <span>ENC_LEVEL_3</span>
                        </div>
                    </div>

                    <textarea
                        className="w-full h-40 p-4 rounded-none bg-tactical-item/50 border border-white/10 text-gray-300 placeholder-gray-600 outline-none resize-none font-mono text-sm focus:border-tactical-orange/50 transition-colors"
                        placeholder="// Paste raw message content for heuristic scanning..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleAnalyze}
                            disabled={status === 'analyzing' || !text.trim()}
                            className={`
                px-6 py-2 rounded-sm font-bold text-white transition-all flex items-center gap-2 uppercase tracking-wider text-sm
                ${status === 'analyzing' || !text.trim()
                                    ? 'bg-white/5 cursor-not-allowed opacity-50'
                                    : 'bg-tactical-orange hover:bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.4)]'}
              `}
                        >
                            {status === 'analyzing' ? (
                                <>
                                    <Activity className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Execute Scan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </GlassCard>

            {/* Results Section */}
            <AnimatePresence>
                {status === 'done' && results && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Risk Card */}
                            <GlassCard className={`md:col-span-2 relative overflow-hidden border-t-2 ${results.messageRisk === 'Phishing' ? 'border-t-tactical-red' :
                                    results.messageRisk === 'Safe' ? 'border-t-tactical-green' : 'border-t-tactical-amber'
                                }`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Shield className="w-32 h-32" />
                                </div>

                                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                                    <h3 className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold">Threat Assessment</h3>
                                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${results.messageRisk === 'Phishing' ? 'bg-tactical-red/20 text-tactical-red' :
                                            results.messageRisk === 'Safe' ? 'bg-tactical-green/20 text-tactical-green' : 'bg-tactical-amber/20 text-tactical-amber'
                                        }`}>
                                        CONFIDENCE: {results.confidence}%
                                    </span>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-full border-2 ${results.messageRisk === 'Phishing' ? 'border-tactical-red bg-tactical-red/10 text-tactical-red' :
                                            results.messageRisk === 'Safe' ? 'border-tactical-green bg-tactical-green/10 text-tactical-green' : 'border-tactical-amber bg-tactical-amber/10 text-tactical-amber'
                                        }`}>
                                        {results.messageRisk === 'Phishing' && <AlertOctagon className="w-8 h-8" />}
                                        {results.messageRisk === 'Safe' && <CheckCircle className="w-8 h-8" />}
                                        {results.messageRisk === 'Suspicious' && <AlertTriangle className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight uppercase mb-1">
                                            {results.messageRisk}
                                        </h2>
                                        <p className="text-gray-400 text-sm">
                                            {results.messageRisk === 'Safe' ? 'Traffic authorized.' :
                                                results.messageRisk === 'Phishing' ? 'Immediate intervention required.' : 'Manual verification advised.'}
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Visual User Risk */}
                            <GlassCard className="flex flex-col items-center justify-center relative border-t-2 border-t-gray-700">
                                <h3 className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold mb-6 w-full text-left">Target Vuln.</h3>
                                <div className="relative">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="#292524" strokeWidth="8" fill="none" />
                                        <circle
                                            cx="64" cy="64" r="56"
                                            stroke="currentColor" strokeWidth="8" fill="none"
                                            strokeDasharray={351}
                                            strokeDashoffset={351 - (351 * results.userSusceptibility) / 100}
                                            className={`transition-all duration-1000 ease-out ${results.userRiskCategory === 'High' ? 'text-tactical-red' :
                                                    results.userRiskCategory === 'Medium' ? 'text-tactical-amber' : 'text-tactical-green'
                                                }`}
                                            strokeLinecap="square"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold text-white">{results.userSusceptibility}</span>
                                        <span className="text-[10px] text-gray-500 font-bold tracking-widest">RISK</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Explanation & Advice - RESTORED */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <GlassCard className="border-l-2 border-l-tactical-orange">
                                <h3 className="text-tactical-orange text-xs uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Analysis Log
                                </h3>
                                <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-white/10 pl-4">
                                    {results.explanation}
                                </p>
                            </GlassCard>

                            <GlassCard className="border-l-2 border-l-tactical-green">
                                <h3 className="text-tactical-green text-xs uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Countermeasures
                                </h3>
                                <ul className="space-y-3">
                                    {results.advice.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 bg-white/5 p-2 rounded-sm text-sm text-gray-300 border border-white/5">
                                            <span className="text-tactical-green font-mono">0{i + 1}</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </GlassCard>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
