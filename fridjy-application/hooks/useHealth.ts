import { useState, useEffect } from 'react';
import { HealthProfile, DailyLog } from '../types';

const DEFAULT_PROFILE: HealthProfile = {
  name: '',
  age: 30,
  height: 170,
  weight: 70,
  gender: 'female',
  activityLevel: 'moderate',
  calorieGoal: 2000,
  allergies: '',
  dietaryPreferences: ''
};

export const useHealth = () => {
  const [profile, setProfile] = useState<HealthProfile>(DEFAULT_PROFILE);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedProfile = localStorage.getItem('fridjy_health_profile');
    const savedLogs = localStorage.getItem('fridjy_health_logs');

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) { console.error(e); }
    }
    
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) { console.error(e); }
    }
    setLoading(false);
  }, []);

  const updateProfile = (newProfile: HealthProfile) => {
    setProfile(newProfile);
    localStorage.setItem('fridjy_health_profile', JSON.stringify(newProfile));
  };

  const addLog = (log: DailyLog) => {
    // Check if log for date exists, if so update it, else add new
    const existingIndex = logs.findIndex(l => l.date === log.date);
    let newLogs = [...logs];
    
    if (existingIndex >= 0) {
      newLogs[existingIndex] = {
        ...newLogs[existingIndex],
        calories: newLogs[existingIndex].calories + log.calories,
        protein: newLogs[existingIndex].protein + log.protein,
        carbs: newLogs[existingIndex].carbs + log.carbs,
        fats: newLogs[existingIndex].fats + log.fats,
      };
    } else {
      newLogs.push(log);
    }
    
    // Sort logs by date
    newLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setLogs(newLogs);
    localStorage.setItem('fridjy_health_logs', JSON.stringify(newLogs));
  };

  return { profile, logs, loading, updateProfile, addLog };
};