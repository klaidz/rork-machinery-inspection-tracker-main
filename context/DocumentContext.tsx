import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define what a "Document" looks like
export interface SigningDocument {
  id: string;
  title: string;
  url: string; // The Adobe/DocuSign link
  assignedTo: string; // 'all', or a specific user ID
  status: 'pending' | 'signed';
  createdAt: string;
}

interface DocumentContextType {
  documents: SigningDocument[];
  addDocument: (doc: SigningDocument) => void;
  markAsSigned: (id: string) => void;
  deleteDocument: (id: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<SigningDocument[]>([]);

  // Mock Initial Data (Example)
  useEffect(() => {
    setDocuments([
      { 
        id: '1', 
        title: 'H&S Policy 2026', 
        url: 'https://secure.echosign.com/public/example', 
        assignedTo: 'all', 
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ]);
  }, []);

  const addDocument = (doc: SigningDocument) => setDocuments(prev => [doc, ...prev]);

  const markAsSigned = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: 'signed' } : d));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <DocumentContext.Provider value={{ documents, addDocument, markAsSigned, deleteDocument }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) throw new Error('useDocuments must be used within DocumentProvider');
  return context;
}