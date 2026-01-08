import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define what a location looks like
interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface LocationContextType {
  location: LocationData | null;
  errorMsg: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mock Location Logic (Simulates GPS for now)
  useEffect(() => {
    // Simulating a location (e.g., Home Farm)
    setLocation({
      latitude: 52.45, 
      longitude: 0.28,
      timestamp: Date.now()
    });
  }, []);

  return (
    <LocationContext.Provider value={{ location, errorMsg }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}