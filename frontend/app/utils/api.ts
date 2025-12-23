import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';
const API_URL = `${BACKEND_URL}/api`;

export const api = {
  // Profiles
  createProfile: async (data: any) => {
    const response = await fetch(`${API_URL}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  getProfiles: async () => {
    const response = await fetch(`${API_URL}/profiles`);
    return response.json();
  },
  
  getProfile: async (id: string) => {
    const response = await fetch(`${API_URL}/profiles/${id}`);
    return response.json();
  },
  
  deleteProfile: async (id: string) => {
    const response = await fetch(`${API_URL}/profiles/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Medications
  createMedication: async (data: any) => {
    const response = await fetch(`${API_URL}/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  getMedications: async (profileId?: string) => {
    const url = profileId ? `${API_URL}/medications?profile_id=${profileId}` : `${API_URL}/medications`;
    const response = await fetch(url);
    return response.json();
  },
  
  getMedication: async (id: string) => {
    const response = await fetch(`${API_URL}/medications/${id}`);
    return response.json();
  },
  
  updateMedication: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/medications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  deleteMedication: async (id: string) => {
    const response = await fetch(`${API_URL}/medications/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Alarms
  createAlarm: async (data: any) => {
    const response = await fetch(`${API_URL}/alarms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  getAlarms: async (profileId?: string) => {
    const url = profileId ? `${API_URL}/alarms?profile_id=${profileId}` : `${API_URL}/alarms`;
    const response = await fetch(url);
    return response.json();
  },
  
  getAlarm: async (id: string) => {
    const response = await fetch(`${API_URL}/alarms/${id}`);
    return response.json();
  },
  
  updateAlarm: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/alarms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  deleteAlarm: async (id: string) => {
    const response = await fetch(`${API_URL}/alarms/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Alarm Logs
  createAlarmLog: async (data: any) => {
    const response = await fetch(`${API_URL}/alarm-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  getAlarmLogs: async (profileId?: string, limit: number = 100) => {
    const url = profileId 
      ? `${API_URL}/alarm-logs?profile_id=${profileId}&limit=${limit}`
      : `${API_URL}/alarm-logs?limit=${limit}`;
    const response = await fetch(url);
    return response.json();
  },

  // Premium Trial
  createPremiumTrial: async (data: any) => {
    const response = await fetch(`${API_URL}/premium-trial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  getPremiumTrial: async (profileId: string) => {
    const response = await fetch(`${API_URL}/premium-trial/${profileId}`);
    return response.json();
  },

  // Stats
  getStats: async (profileId: string) => {
    const response = await fetch(`${API_URL}/stats/${profileId}`);
    return response.json();
  },
};