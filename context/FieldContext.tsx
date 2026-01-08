import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Field, Farmer } from '@/types';

interface FieldContextType {
  farmers: Farmer[];
  fields: Field[];
  addFarmer: (name: string) => Promise<void>;
  addField: (field: Field) => Promise<void>;
  getFieldsByFarmer: (farmerId: string) => Field[];
}

const FieldContext = createContext<FieldContextType | undefined>(undefined);

export function FieldProvider({ children }: { children: ReactNode }) {
  // Mock Data: One Farmer Folder to start
  const [farmers, setFarmers] = useState<Farmer[]>([
    { id: 'f1', name: 'Smith Farms Ltd' },
    { id: 'f2', name: 'Pretoria Energy' }
  ]);

  const [fields, setFields] = useState<Field[]>([]);

  const addFarmer = async (name: string) => {
    const newFarmer: Farmer = { id: Date.now().toString(), name };
    setFarmers(prev => [...prev, newFarmer]);
  };

  const addField = async (field: Field) => {
    setFields(prev => [...prev, field]);
  };

  const getFieldsByFarmer = (farmerId: string) => {
    return fields.filter(f => f.farmerId === farmerId);
  };

  return (
    <FieldContext.Provider value={{ farmers, fields, addFarmer, addField, getFieldsByFarmer }}>
      {children}
    </FieldContext.Provider>
  );
}

export function useFields() {
  const context = useContext(FieldContext);
  if (context === undefined) throw new Error('useFields must be used within FieldProvider');
  return context;
}