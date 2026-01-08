import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timesheet, ActiveShift } from '@/types';

interface TimesheetContextType {
  isOnShift: boolean;
  activeShift: ActiveShift | null;
  startShift: () => Promise<void>;
  endShift: () => Promise<void>;
  // ✅ This is the function the app was missing:
  getActiveShiftDuration: () => string; 
  timesheets: Timesheet[];
}

const TimesheetContext = createContext<TimesheetContextType | undefined>(undefined);

export function TimesheetProvider({ children }: { children: ReactNode }) {
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [isOnShift, setIsOnShift] = useState(false);

  // Load state on startup
  useEffect(() => {
    loadShiftState();
  }, []);

  const loadShiftState = async () => {
    try {
      const storedShift = await AsyncStorage.getItem('active_shift');
      if (storedShift) {
        const parsed = JSON.parse(storedShift);
        setActiveShift(parsed);
        setIsOnShift(true);
      }
    } catch (e) {
      console.error('Failed to load shift state', e);
    }
  };

  const startShift = async () => {
    const newShift: ActiveShift = {
      timesheetId: Date.now().toString(),
      userId: 'user_1', // In real app, get from AuthContext
      startTime: new Date().toISOString(),
    };
    setActiveShift(newShift);
    setIsOnShift(true);
    await AsyncStorage.setItem('active_shift', JSON.stringify(newShift));
  };

  const endShift = async () => {
    if (!activeShift) return;
    
    // Save to history (Mocking saving to DB)
    const endTime = new Date();
    const startTime = new Date(activeShift.startTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    const newTimesheet: Timesheet = {
      id: activeShift.timesheetId,
      userId: activeShift.userId,
      userName: 'Current User',
      date: new Date().toISOString(),
      startTime: activeShift.startTime,
      endTime: endTime.toISOString(),
      duration: parseFloat(durationHours.toFixed(2)),
      createdAutomatically: true,
    };

    setTimesheets(prev => [newTimesheet, ...prev]);
    
    // Clear active shift
    setActiveShift(null);
    setIsOnShift(false);
    await AsyncStorage.removeItem('active_shift');
  };

  // ✅ THE MISSING FUNCTION
  const getActiveShiftDuration = () => {
    if (!activeShift) return "00:00:00";
    
    const start = new Date(activeShift.startTime).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, now - start);

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)));

    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <TimesheetContext.Provider value={{ 
      isOnShift, 
      activeShift, 
      startShift, 
      endShift, 
      getActiveShiftDuration, 
      timesheets 
    }}>
      {children}
    </TimesheetContext.Provider>
  );
}

export function useTimesheet() {
  const context = useContext(TimesheetContext);
  if (context === undefined) throw new Error('useTimesheet must be used within TimesheetProvider');
  return context;
}