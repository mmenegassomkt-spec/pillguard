import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, Medication, Alarm, PremiumTrial, Stats } from '../_types';
import { api } from '../_utils/api';

interface AppContextType {
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
  profiles: Profile[];
  refreshProfiles: () => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  medications: Medication[];
  refreshMedications: () => Promise<void>;
  alarms: Alarm[];
  refreshAlarms: () => Promise<void>;
  premiumTrial: PremiumTrial | null;
  refreshPremiumTrial: () => Promise<void>;
  stats: Stats | null;
  refreshStats: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentProfile, setCurrentProfileState] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [premiumTrial, setPremiumTrial] = useState<PremiumTrial | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfiles = useCallback(async () => {
    try {
      const data = await api.getProfiles();
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  }, []);

  const deleteProfile = useCallback(async (profileId: string) => {
    try {
      await api.deleteProfile(profileId);
      // Se o perfil deletado é o atual, limpa o perfil atual
      if (currentProfile?.id === profileId) {
        await AsyncStorage.removeItem('currentProfileId');
        setCurrentProfileState(null);
      }
      await refreshProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }, [currentProfile, refreshProfiles]);

  const refreshMedications = useCallback(async () => {
    if (!currentProfile) return;
    try {
      const data = await api.getMedications(currentProfile.id);
      setMedications(data);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  }, [currentProfile]);

  const refreshAlarms = useCallback(async () => {
    if (!currentProfile) return;
    try {
      const data = await api.getAlarms(currentProfile.id);
      setAlarms(data);
    } catch (error) {
      console.error('Error fetching alarms:', error);
    }
  }, [currentProfile]);

  const refreshPremiumTrial = useCallback(async () => {
    if (!currentProfile) return;
    try {
      const data = await api.getPremiumTrial(currentProfile.id);
      setPremiumTrial(data);
    } catch (error) {
      console.error('Error fetching premium trial:', error);
    }
  }, [currentProfile]);

  const refreshStats = useCallback(async () => {
    if (!currentProfile) return;
    try {
      const data = await api.getStats(currentProfile.id);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [currentProfile]);

  // Load current profile from AsyncStorage
  useEffect(() => {
    loadCurrentProfile();
  }, []);

  // When profile changes, fetch related data
  useEffect(() => {
    if (currentProfile) {
      refreshMedications();
      refreshAlarms();
      refreshPremiumTrial();
      refreshStats();
    }
  }, [currentProfile, refreshMedications, refreshAlarms, refreshPremiumTrial, refreshStats]);

  const loadCurrentProfile = async () => {
    console.log('loadCurrentProfile: starting...');
    try {
      const profileId = await AsyncStorage.getItem('currentProfileId');
      console.log('loadCurrentProfile: profileId =', profileId);
      if (profileId) {
        try {
          const profile = await api.getProfile(profileId);
          console.log('loadCurrentProfile: profile loaded =', profile?.name);
          setCurrentProfileState(profile);
        } catch (error) {
          // Profile doesn't exist anymore, clear it
          console.log('Profile not found, clearing from storage');
          await AsyncStorage.removeItem('currentProfileId');
          setCurrentProfileState(null);
        }
      }
      console.log('loadCurrentProfile: refreshing profiles...');
      await refreshProfiles();
      console.log('loadCurrentProfile: done');
    } catch (error) {
      console.error('Error loading current profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrentProfile = async (profile: Profile | null) => {
    try {
      if (profile) {
        await AsyncStorage.setItem('currentProfileId', profile.id);
      } else {
        await AsyncStorage.removeItem('currentProfileId');
      }
      setCurrentProfileState(profile);
    } catch (error) {
      console.error('Error setting current profile:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentProfile,
        setCurrentProfile,
        profiles,
        refreshProfiles,
        deleteProfile,
        medications,
        refreshMedications,
        alarms,
        refreshAlarms,
        premiumTrial,
        refreshPremiumTrial,
        stats,
        refreshStats,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};