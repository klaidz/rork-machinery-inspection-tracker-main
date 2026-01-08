import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkshopPart, WorkshopJobCard } from '@/types';

// ✅ 1. Define what data this "Engine" provides
interface WorkshopPartsContextType {
  stockItems: WorkshopPart[];
  jobCards: WorkshopJobCard[];
  isLoading: boolean; // ✅ Added to prevent "Property 'isLoading' does not exist" error
  addPart: (part: WorkshopPart) => void;
  usePart: (partId: string, quantity: number) => void;
}

const WorkshopPartsContext = createContext<WorkshopPartsContextType | undefined>(undefined);

export function WorkshopPartsProvider({ children }: { children: ReactNode }) {
  const [stockItems, setStockItems] = useState<WorkshopPart[]>([]);
  const [jobCards, setJobCards] = useState<WorkshopJobCard[]>([]);
  const [isLoading, setIsLoading] = useState(false); // ✅ Initialize State

  // Mock Initial Data
  useEffect(() => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setStockItems([
        { 
          id: '1', 
          name: 'Oil Filter', 
          partNumber: 'OF-123', 
          category: 'Filters', 
          quantity: 5, 
          reorderLevel: 2, // ✅ Must match 'reorderLevel' in types/index.ts
          location: 'Shelf A', 
          lastUpdated: new Date().toISOString() 
        },
        { 
          id: '2', 
          name: 'Hydraulic Hose', 
          partNumber: 'HH-55', 
          category: 'Hydraulics', 
          quantity: 1, 
          reorderLevel: 3, // ✅ Must match 'reorderLevel' in types/index.ts
          location: 'Shelf B', 
          lastUpdated: new Date().toISOString() 
        }
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const addPart = (part: WorkshopPart) => setStockItems(prev => [...prev, part]);

  const usePart = (partId: string, quantity: number) => {
    setStockItems(prev => prev.map(item => 
      item.id === partId ? { ...item, quantity: Math.max(0, item.quantity - quantity) } : item
    ));
  };

  return (
    // ✅ Pass 'isLoading' down to the screens
    <WorkshopPartsContext.Provider value={{ stockItems, jobCards, isLoading, addPart, usePart }}>
      {children}
    </WorkshopPartsContext.Provider>
  );
}

export function useWorkshopParts() {
  const context = useContext(WorkshopPartsContext);
  if (context === undefined) throw new Error('useWorkshopParts must be used within WorkshopPartsProvider');
  return context;
}