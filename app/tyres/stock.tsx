import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TyreStockItem, TyreFitterJobCard } from '@/types';

interface TyreStockContextType {
  stock: TyreStockItem[];
  jobCards: TyreFitterJobCard[];
  addStock: (item: TyreStockItem) => Promise<void>;
  useStock: (id: string, quantity: number) => Promise<void>;
  addJobCard: (card: TyreFitterJobCard) => Promise<void>;
}

const TyreStockContext = createContext<TyreStockContextType | undefined>(undefined);

export function TyreStockProvider({ children }: { children: ReactNode }) {
  const [stock, setStock] = useState<TyreStockItem[]>([]);
  const [jobCards, setJobCards] = useState<TyreFitterJobCard[]>([]);

  // Placeholder functions - you can connect these to backend later
  const addStock = async (item: TyreStockItem) => {
    setStock(prev => [...prev, item]);
  };

  const useStock = async (id: string, quantity: number) => {
    setStock(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: item.quantity - quantity } : item
    ));
  };

  const addJobCard = async (card: TyreFitterJobCard) => {
    setJobCards(prev => [...prev, card]);
  };

  return (
    <TyreStockContext.Provider value={{ stock, jobCards, addStock, useStock, addJobCard }}>
      {children}
    </TyreStockContext.Provider>
  );
}

export default function useTyreStock() {
  const context = useContext(TyreStockContext);
  if (context === undefined) {
    throw new Error('useTyreStock must be used within a TyreStockProvider');
  }
  return context;
}