"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Save, RotateCcw, ChevronRight, ShieldCheck } from 'lucide-react';
import { useUserProfile } from '../context/UserProfileContext';

const QUESTIONS = [
  {
    key: 'q1',
    label: 'How often do you click links in emails from unknown senders?',
    options: [
      { value: 'never', label: 'Never — I always verify first' },
      { value: 'rarely', label: 'Rarely — only if it looks legitimate' },
      { value: 'sometimes', label: 'Sometimes — if the subject is relevant' },
      { value: 'often', label: 'Often — I click most links' },
    ],
  },
  {
    key: 'q2',
    label: 'Do you verify the sender\'s domain before opening attachments?',
    options: [
      { value: 'always', label: 'Always — it\'s part of my routine' },
      { value: 'usually', label: 'Usually — unless I\'m in a hurry' },
      { value: 'rarely', label: 'Rarely — I trust the display name' },
      { value: 'never', label: 'Never — I didn\'t know I should' },
    ],
  },
  {
    key: 'q3',
    label: 'What best describes your primary email usage environment?',
    options: [
      { value: 'corporate', label: 'Corporate — work emails only' },
      { value: 'personal', label: 'Personal — non-work usage' },
      { value: 'both', label: 'Both — work and personal mixed' },
      { value: 'high_volume', label: 'High-Volume — large org, many senders' },
    ],
  },
  {
    key: 'q4',
    label: 'Have you ever interacted with a phishing or scam email?',
    options: [
      { value: 'never', label: 'Never — I\'ve always caught them' },
      { value: 'almost', label: 'Almost — I realized before submitting data' },
      { value: 'once', label: 'Once — it was a sophisticated attack' },
      { value: 'multiple', label: 'Multiple times — I\'m unsure how to spot them' },
    ],
  },
  {
    key: 'q5',
    label: 'How frequently do you receive emails requesting personal or financial info?',
    options: [
      { value: 'daily', label: 'Daily — very common in my inbox' },
      { value: 'weekly', label: 'Weekly — a few times per week' },
      { value: 'monthly', label: 'Monthly — occasional' },
      { value: 'rarely', label: 'Rarely — almost never' },
    ],
  },
  {
    key: 'q6',
    label: 'Do you use Multi-Factor Authentication (MFA) on your important accounts?',
    options: [
      { value: 'all', label: 'Yes — on all critical accounts' },
      { value: 'some', label: 'Some — on a few important ones' },
      { value: 'planning', label: 'Not yet — planning to set it up' },
      { value: 'no', label: 'No — I use passwords only' },
    ],
  },
];

export default function UserProfileModal({ isOpen, onClose }) {
  const { profile, saveProfile, resetProfile, answeredCount } = useUserProfile();
  const [answers, setAnswers] = useState({ ...profile });

  // Sync when modal opens
  useEffect(() => {
    if (isOpen) setAnswers({ ...profile });
  }, [isOpen, profile]);

  const handleSelect = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveProfile(answers);
    onClose();
  };

  const handleReset = () => {
    resetProfile();
    setAnswers({ q1: '', q2: '', q3: '', q4: '', q5: '', q6: '' });
  };

  const localAnsweredCount = Object.values(answers).filter((v) => v !== '').length;
  const totalQuestions = QUESTIONS.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-lg flex flex-col font-mono"
            style={{ background: 'rgba(18, 16, 14, 0.98)', borderLeft: '1px solid rgba(249,115,22,0.25)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tactical-orange/10 rounded-sm border border-tactical-orange/20">
                  <User className="w-4 h-4 text-tactical-orange" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-sm uppercase tracking-[0.15em]">Risk Profile Config</h2>
                  <p className="text-gray-600 text-xs mt-0.5">{localAnsweredCount} / {totalQuestions} parameters set</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-0.5 bg-white/5">
              <motion.div
                className="h-full bg-tactical-orange"
                initial={{ width: 0 }}
                animate={{ width: `${(localAnsweredCount / totalQuestions) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Questions */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
              <p className="text-gray-500 text-xs leading-relaxed border-l-2 border-tactical-orange/30 pl-3">
                These parameters calibrate your personal threat susceptibility model. Responses are stored locally and used to personalize your phishing risk assessment.
              </p>

              {QUESTIONS.map((q, idx) => (
                <div key={q.key} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-tactical-orange text-xs font-bold mt-0.5 shrink-0">0{idx + 1}</span>
                    <p className="text-gray-300 text-sm leading-snug">{q.label}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pl-5">
                    {q.options.map((opt) => {
                      const selected = answers[q.key] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(q.key, opt.value)}
                          className={`flex items-center justify-between text-left px-3 py-2.5 rounded-sm border text-xs transition-all duration-200 ${
                            selected
                              ? 'border-tactical-orange/60 bg-tactical-orange/10 text-white'
                              : 'border-white/8 bg-white/3 text-gray-500 hover:border-white/20 hover:text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {selected && <ChevronRight className="w-3.5 h-3.5 text-tactical-orange shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-5 border-t border-white/5 flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-sm border border-white/10 text-gray-500 text-xs font-bold uppercase tracking-wider hover:text-white hover:border-white/25 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={localAnsweredCount === 0}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-sm font-bold text-xs uppercase tracking-wider transition-all ${
                  localAnsweredCount === 0
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                    : 'bg-tactical-orange text-white hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.35)]'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                Save Profile
              </button>
            </div>

            {/* Saved indicator if profile fully set */}
            {answeredCount === totalQuestions && (
              <div className="px-6 pb-4 flex items-center gap-2 text-tactical-green text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Profile active — AI personalization enabled
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
