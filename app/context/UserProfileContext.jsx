"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'phishield_user_profile';

const defaultProfile = {
  q1: '', // click frequency on unknown links
  q2: '', // verify sender domain
  q3: '', // email usage environment
  q4: '', // previously phished
  q5: '', // frequency of suspicious emails
  q6: '', // MFA usage
};

const UserProfileContext = createContext(null);

export function UserProfileProvider({ children }) {
  const [profile, setProfile] = useState(defaultProfile);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setProfile(JSON.parse(stored));
    } catch (_) {}
    setLoaded(true);
  }, []);

  const saveProfile = (answers) => {
    const updated = { ...defaultProfile, ...answers };
    setProfile(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  };

  const isProfileSet = Object.values(profile).some((v) => v !== '');

  const answeredCount = Object.values(profile).filter((v) => v !== '').length;

  return (
    <UserProfileContext.Provider value={{ profile, saveProfile, resetProfile, isProfileSet, answeredCount, loaded }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
}
