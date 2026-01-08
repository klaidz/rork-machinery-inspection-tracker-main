import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Department {
  id: string;
  name: string;
}

interface DepartmentContextType {
  departments: Department[];
  currentDepartment: Department | null;
  setDepartment: (deptId: string) => void;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export function DepartmentProvider({ children }: { children: ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);

  // Mock Initial Data
  useEffect(() => {
    const mockDepts = [
      { id: '1', name: 'Arable' },
      { id: '2', name: 'Genesis' },
      { id: '3', name: 'CO2' },
      { id: '4', name: 'PC' },
      { id: '5', name: 'Chittering 3' }
    ];
    setDepartments(mockDepts);
    setCurrentDepartment(mockDepts[0]); // Default to Arable
  }, []);

  const setDepartment = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    if (dept) setCurrentDepartment(dept);
  };

  return (
    <DepartmentContext.Provider value={{ departments, currentDepartment, setDepartment }}>
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartment() {
  const context = useContext(DepartmentContext);
  if (context === undefined) throw new Error('useDepartment must be used within DepartmentProvider');
  return context;
}