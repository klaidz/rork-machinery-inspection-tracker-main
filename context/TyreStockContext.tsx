import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TyreStockItem, TyreFitterJobCard } from '@/types';

interface TyreStockContextType {
  stockItems: TyreStockItem[];
  usedStockItems: TyreStockItem[];
  jobCards: TyreFitterJobCard[];
  isLoading: boolean;
  addStock: (item: TyreStockItem) => Promise<void>;
}

const TyreStockContext = createContext<TyreStockContextType | undefined>(undefined);

export function TyreStockProvider({ children }: { children: ReactNode }) {
  const [stockItems, setStockItems] = useState<TyreStockItem[]>([]);
  const [usedStockItems, setUsedStockItems] = useState<TyreStockItem[]>([]);
  const [jobCards, setJobCards] = useState<TyreFitterJobCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock Initial Data
  useEffect(() => {
    setStockItems([
      { id: '1', size: '315/80R22.5', brand: 'Michelin', quantity: 4, condition: 'new', location: 'Main Depot', addedDate: new Date().toISOString(), addedBy: 'System' },
      { id: '2', size: '385/65R22.5', brand: 'Bridgestone', quantity: 2, condition: 'part_worn', location: 'Yard', addedDate: new Date().toISOString(), addedBy: 'System' }
    ]);
  }, []);

  const addStock = async (item: TyreStockItem) => {
    setStockItems(prev => [...prev, item]);
  };

  return (
    <TyreStockContext.Provider value={{ stockItems, usedStockItems, jobCards, isLoading, addStock }}>
      {children}
    </TyreStockContext.Provider>
  );
}

export function useTyreStock() {
  const context = useContext(TyreStockContext);
  if (context === undefined) throw new Error('useTyreStock must be used within TyreStockProvider');
  return context;
}