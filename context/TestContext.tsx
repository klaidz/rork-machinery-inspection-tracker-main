import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TestCase, TestSuite, TestCaseStatus } from '@/types';

interface TestContextType {
  testCases: TestCase[];
  testSuites: TestSuite[];
  addTestCase: (testCase: TestCase) => void;
  deleteTestCase: (id: string) => void;
  duplicateTestCase: (id: string) => void;
  runTestCase: (id: string, status: TestCaseStatus) => void;
  getTestCaseStats: () => { total: number; active: number; pass: number; fail: number };
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export function TestProvider({ children }: { children: ReactNode }) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);

  // Mock Data
  useEffect(() => {
    setTestCases([
      { 
        id: '1', title: 'Verify Login', description: 'Check user login flow', 
        category: 'Auth', status: 'active', priority: 'high', lastUpdated: new Date().toISOString() 
      },
      { 
        id: '2', title: 'Check GPS', description: 'Verify location tracking', 
        category: 'Location', status: 'draft', priority: 'medium', lastUpdated: new Date().toISOString() 
      }
    ]);
  }, []);

  const addTestCase = (tc: TestCase) => setTestCases(prev => [...prev, tc]);

  const deleteTestCase = (id: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  };

  const duplicateTestCase = (id: string) => {
    const original = testCases.find(tc => tc.id === id);
    if (original) {
      const copy = { ...original, id: Date.now().toString(), title: `${original.title} (Copy)` };
      setTestCases(prev => [...prev, copy]);
    }
  };

  const runTestCase = (id: string, status: TestCaseStatus) => {
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, status } : tc));
  };

  const getTestCaseStats = () => {
    return {
      total: testCases.length,
      active: testCases.filter(t => t.status === 'active').length,
      pass: testCases.filter(t => t.status === 'pass').length,
      fail: testCases.filter(t => t.status === 'fail').length,
    };
  };

  return (
    <TestContext.Provider value={{ 
      testCases, testSuites, addTestCase, deleteTestCase, 
      duplicateTestCase, runTestCase, getTestCaseStats 
    }}>
      {children}
    </TestContext.Provider>
  );
}

// ✅ THIS IS THE EXPORT YOUR SCREEN WAS MISSING
export function useTestContext() {
  const context = useContext(TestContext);
  if (context === undefined) throw new Error('useTestContext must be used within TestProvider');
  return context;
}