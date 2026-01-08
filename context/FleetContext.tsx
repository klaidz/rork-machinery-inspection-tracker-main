import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Machinery, Field, TransportJob, SafetyStock, Farmer, 
  DailyCheck, Invoice, Customer, NearMissReport, FieldMeasurement 
} from '../types';

export interface FleetContextType {
  // MACHINERY
  machinery: Machinery[];
  addMachinery: (machine: Machinery) => Promise<void>; // 👈 Added this
  updateMachineryStatus: (id: string, status: 'active' | 'maintenance' | 'broken') => Promise<void>; // 👈 Added this

  // FARMERS & FIELDS
  farmers: Farmer[];
  addFarmer: (farmer: Farmer) => Promise<void>;
  getFieldsByFarmer: (farmerId: string) => Field[];
  
  fields: Field[];
  addField: (field: Field) => Promise<void>;

  // JOBS
  transportJobs: TransportJob[];
  addTransportJob: (job: TransportJob) => Promise<void>;

  // INVENTORY
  safetyStock: SafetyStock[];
  addSafetyStock: (item: SafetyStock) => Promise<void>;
  updateSafetyStockLevel: (id: string, change: number) => Promise<void>;

  // DAILY CHECKS
  dailyChecks: DailyCheck[];
  addDailyCheck: (check: DailyCheck) => void;
  getChecksByMachine: (machineId: string) => DailyCheck[];

  // INVOICES & CUSTOMERS (Stubbed for now)
  invoices: Invoice[];
  addInvoice: (inv: Invoice) => void;
  customers: Customer[];
  addCustomer: (cust: Customer) => void;

  // SAFETY (Stubbed for now)
  nearMisses: NearMissReport[];
  addNearMissReport: (report: NearMissReport) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export function FleetProvider({ children }: { children: ReactNode }) {
  
  // --- STATE ---
  // 1. Machinery (Your Real Fleet)
  const [machinery, setMachinery] = useState<Machinery[]>([
    // --- TRACTORS (Massey Ferguson & Fendt) ---
    { id: 't1', name: '8740 S', registration: 'AE74BFK', type: 'Tractor', status: 'active' },
    { id: 't2', name: '8740 MF', registration: 'AF25FHJ', type: 'Tractor', status: 'active' },
    { id: 't3', name: '8740 MF', registration: 'AF25UVE', type: 'Tractor', status: 'active' },
    { id: 't4', name: '8740 MF', registration: 'AF25FHH', type: 'Tractor', status: 'active' },
    { id: 't5', name: '8740 MF', registration: 'AE74BFJ', type: 'Tractor', status: 'active' },
    { id: 't6', name: '8740 MF', registration: 'AE74BFL', type: 'Tractor', status: 'active' },
    { id: 't7', name: '7719 MF', registration: 'AE21 BZN', type: 'Tractor', status: 'active' },
    { id: 't8', name: '8740 MF', registration: 'AE22 CXP', type: 'Tractor', status: 'active' },
    { id: 't9', name: '7719 MF', registration: 'AE71 DVR', type: 'Tractor', status: 'active' },
    { id: 't10', name: '7719 MF (Black)', registration: 'AE71 DVT', type: 'Tractor', status: 'active' },
    { id: 't11', name: '7719 MF', registration: 'AE71 DVU', type: 'Tractor', status: 'active' },
    { id: 't12', name: '7719 MF', registration: 'AE71 DVV', type: 'Tractor', status: 'active' },
    { id: 't13', name: '7719 MF', registration: 'AE71 DVW', type: 'Tractor', status: 'active' },
    { id: 't14', name: '7719 MF', registration: 'AE71 DVX', type: 'Tractor', status: 'active' },
    { id: 't15', name: '7719 MF', registration: 'AE70 CCJ', type: 'Tractor', status: 'active' },
    { id: 't16', name: '7719 MF (Black)', registration: 'AU21 BBF', type: 'Tractor', status: 'active' },
    { id: 't17', name: '7719 MF', registration: 'AE20 BYW', type: 'Tractor', status: 'active' },
    { id: 't18', name: '7S.180', registration: 'AE23 CZV', type: 'Tractor', status: 'active' },
    { id: 't19', name: '7S.180', registration: 'AO23 PXT', type: 'Tractor', status: 'active' },
    { id: 't20', name: '8740 MF', registration: 'AE23 CZN', type: 'Tractor', status: 'active' },
    { id: 't21', name: '8740 MF', registration: 'AE23 CZO', type: 'Tractor', status: 'active' },
    { id: 't22', name: '8740 MF', registration: 'AE23 CZM', type: 'Tractor', status: 'active' },
    { id: 't23', name: '8740 MF', registration: 'AE23 CZL', type: 'Tractor', status: 'active' },
    { id: 't24', name: '8740 MF', registration: 'AE24 CVA', type: 'Tractor', status: 'active' },
    { id: 't25', name: '8740 MF', registration: 'AE24 CVC', type: 'Tractor', status: 'active' },
    { id: 't26', name: '8740 MF', registration: 'AE24 CVD', type: 'Tractor', status: 'active' },
    { id: 't27', name: '8740 MF', registration: 'AE24 CVK', type: 'Tractor', status: 'active' },
    { id: 't28', name: '8740 MF', registration: 'AK25 DKA', type: 'Tractor', status: 'active' },
    { id: 't29', name: '8741 MF', registration: 'AK25 DKD', type: 'Tractor', status: 'active' },

    // --- HEAVY MACHINERY ---
    { id: 'm1', name: 'CAT Loader', registration: 'AE15 BWU', type: 'Forklift', status: 'active' },
    { id: 'm2', name: 'CAT Loader', registration: 'AE15 BUJ', type: 'Forklift', status: 'active' },
    { id: 'm3', name: 'CAT Loader', registration: 'AE62 AEU', type: 'Forklift', status: 'active' },
    { id: 'm4', name: 'Claas JAG', registration: 'AV63 GBO', type: 'Combine', status: 'maintenance' }, 
    { id: 'm5', name: 'Claas Xerion', registration: 'AY23 FCM', type: 'Tractor', status: 'active' },
    { id: 'm6', name: 'Claas Xerion', registration: 'AY72 CZM', type: 'Tractor', status: 'active' },
    { id: 'm7', name: 'Claas JAG', registration: 'AY23 FHG', type: 'Combine', status: 'active' },
    { id: 'm8', name: 'Claas JAG', registration: 'AY23 FHK', type: 'Combine', status: 'active' },
    { id: 'm9', name: 'Horsch 8300 (Sprayer)', registration: 'DY70 DLF', type: 'Other', status: 'active' },
    { id: 'm10', name: 'Horsch PT280 (Sprayer)', registration: 'DY73 BKN', type: 'Other', status: 'active' },
    { id: 'm11', name: 'Holmer T7 (Beet)', registration: 'AF70 YRE', type: 'Combine', status: 'active' },
    { id: 'm12', name: 'Maize Maus', registration: 'AU06 FXW', type: 'Other', status: 'active' },
    { id: 'm13', name: 'Beet Maus', registration: 'GN71 DJO', type: 'Other', status: 'active' },
    { id: 'm14', name: 'Volvo Shovel 60', registration: 'Fleet 60', type: 'Forklift', status: 'active' },
    { id: 'm15', name: 'Volvo Shovel 62', registration: 'Fleet 62', type: 'Forklift', status: 'active' },
    { id: 'm16', name: 'Nurse Slurry Tank', registration: 'AO24 ABG', type: 'Trailer', status: 'active' },
    { id: 'm17', name: 'Hitachi Digger 1', registration: 'Hitachi 360', type: 'Other', status: 'active' },
    { id: 'm18', name: 'Ploeger Muck 1', registration: 'AO74 CDK', type: 'Other', status: 'active' },
    { id: 'm19', name: 'Manitou', registration: 'AO22 EHR', type: 'Forklift', status: 'active' },

    // --- JCB FLEET ---
    { id: 'j1', name: 'JCB 536-95', registration: 'AF19 DJK', type: 'Forklift', status: 'active' },
    { id: 'j2', name: 'JCB 536-95', registration: 'AF19 DJU', type: 'Forklift', status: 'active' },
    { id: 'j3', name: 'JCB 536-95', registration: 'AF19 DJO', type: 'Forklift', status: 'active' },
    { id: 'j4', name: 'JCB Produce', registration: 'AF25 OYA', type: 'Forklift', status: 'active' },
    { id: 'j5', name: 'JCB Produce', registration: 'AF25 OYB', type: 'Forklift', status: 'active' },
    { id: 'j6', name: 'JCB Pretoria Mepal', registration: 'AF25 OYD', type: 'Forklift', status: 'active' },
    { id: 'j7', name: 'JCB Pretoria Arable', registration: 'AF25 OYE', type: 'Forklift', status: 'active' },
    { id: 'j8', name: 'JCB Genesis Bio', registration: 'AF25 OYM', type: 'Forklift', status: 'active' },

    // --- TRUCKS (Volvo LNG & MAN) ---
    { id: 'h1', name: 'Volvo HGV', registration: 'KS24 BWO', type: 'Truck', status: 'active' },
    { id: 'h2', name: 'Volvo HGV', registration: 'KS24 BWP', type: 'Truck', status: 'active' },
    { id: 'h3', name: 'Volvo HGV', registration: 'KS24 BWU', type: 'Truck', status: 'active' },
    { id: 'h4', name: 'Volvo HGV', registration: 'KS24 BWV', type: 'Truck', status: 'active' },
    { id: 'h5', name: 'Volvo HGV', registration: 'KS24 BWW', type: 'Truck', status: 'active' },
    { id: 'h6', name: 'Volvo LNG', registration: 'KU75 XOK', type: 'Truck', status: 'active' },
    { id: 'h7', name: 'Volvo LNG', registration: 'KU75 XOL', type: 'Truck', status: 'active' },
    { id: 'h8', name: 'Volvo LNG', registration: 'KU75 XON', type: 'Truck', status: 'active' },
    { id: 'h9', name: 'Volvo LNG', registration: 'KU75 XND', type: 'Truck', status: 'active' },
    { id: 'h10', name: 'Volvo LNG', registration: 'KU75 XNE', type: 'Truck', status: 'active' },
    { id: 'h11', name: 'Volvo LNG', registration: 'KU75 XOH', type: 'Truck', status: 'active' },
    { id: 'h12', name: 'Volvo LNG', registration: 'KU75 XOO', type: 'Truck', status: 'active' },
    { id: 'h13', name: 'Volvo LNG', registration: 'KU75 XOP', type: 'Truck', status: 'active' },
    { id: 'h14', name: 'MAN HGV', registration: 'EY17 DCU', type: 'Truck', status: 'active' },
    { id: 'h15', name: 'Volvo LNG', registration: 'KY24 MGZ', type: 'Truck', status: 'active' },
    { id: 'h16', name: 'Volvo LNG', registration: 'KY24 MGV', type: 'Truck', status: 'active' },
    { id: 'h17', name: 'Volvo LNG', registration: 'KT73 HMJ', type: 'Truck', status: 'active' },
    { id: 'h18', name: 'Volvo LNG', registration: 'KY24 MGX', type: 'Truck', status: 'active' },
    { id: 'h19', name: 'Volvo LNG', registration: 'KT73 HMH', type: 'Truck', status: 'active' },
    { id: 'h20', name: 'Volvo LNG', registration: 'KU75 XNH', type: 'Truck', status: 'active' },
    { id: 'h21', name: 'Volvo LNG', registration: 'KU75 XNJ', type: 'Truck', status: 'active' },
    { id: 'h22', name: 'Volvo LNG', registration: 'KU75 XOT', type: 'Truck', status: 'active' },
    { id: 'h23', name: 'Volvo LNG', registration: 'KU75 XOV', type: 'Truck', status: 'active' },
    { id: 'h24', name: 'Volvo LNG', registration: 'KU75 XNG', type: 'Truck', status: 'active' },
    { id: 'h25', name: 'Volvo LNG', registration: 'KS24 BWK', type: 'Truck', status: 'active' },
    { id: 'h26', name: 'Volvo LNG', registration: 'KS24 BWL', type: 'Truck', status: 'active' },
    { id: 'h27', name: 'Volvo LNG', registration: 'KS24 BWM', type: 'Truck', status: 'active' },
    { id: 'h28', name: 'Volvo LNG', registration: 'KU75 XNF', type: 'Truck', status: 'active' }
  ]);

  // 2. Farmers & Fields
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [fields, setFields] = useState<Field[]>([]);

  // 3. Transport
  const [transportJobs, setTransportJobs] = useState<TransportJob[]>([]);

  // 4. Inventory
  const [safetyStock, setSafetyStock] = useState<SafetyStock[]>([]);

  // 5. Daily Checks
  const [dailyChecks, setDailyChecks] = useState<DailyCheck[]>([]);

  // 6. Invoices & Customers
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // 7. Safety
  const [nearMisses, setNearMisses] = useState<NearMissReport[]>([]);

  // --- ACTIONS ---

  // 🚜 MACHINERY ACTIONS (FIXED)
  const addMachinery = async (m: Machinery) => setMachinery(prev => [...prev, m]);
  const updateMachineryStatus = async (id: string, status: 'active' | 'maintenance' | 'broken') => {
    setMachinery(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const addFarmer = async (f: Farmer) => setFarmers(prev => [...prev, f]);
  const getFieldsByFarmer = (id: string) => fields.filter(f => f.farmerId === id);
  const addField = async (f: Field) => setFields(prev => [...prev, f]);

  const addTransportJob = async (j: TransportJob) => setTransportJobs(prev => [...prev, j]);

  const addSafetyStock = async (s: SafetyStock) => setSafetyStock(prev => [...prev, s]);
  const updateSafetyStockLevel = async (id: string, change: number) => {
    setSafetyStock(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
    ));
  };

  const addDailyCheck = (check: DailyCheck) => {
    console.log("Saving Check:", check.id);
    setDailyChecks(prev => [check, ...prev]);
  };
  const getChecksByMachine = (id: string) => dailyChecks.filter(c => c.machineryId === id);

  const addInvoice = (inv: Invoice) => setInvoices(prev => [...prev, inv]);
  const addCustomer = (cust: Customer) => setCustomers(prev => [...prev, cust]);
  const addNearMissReport = (r: NearMissReport) => setNearMisses(prev => [...prev, r]);


  // --- RETURN PROVIDER ---
  return (
    <FleetContext.Provider value={{
      machinery, addMachinery, updateMachineryStatus, // 👈 Added Here
      farmers, addFarmer, getFieldsByFarmer,
      fields, addField,
      transportJobs, addTransportJob,
      safetyStock, addSafetyStock, updateSafetyStockLevel,
      dailyChecks, addDailyCheck, getChecksByMachine,
      invoices, addInvoice,
      customers, addCustomer,
      nearMisses, addNearMissReport
    }}>
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const context = useContext(FleetContext);
  if (context === undefined) throw new Error('useFleet must be used within FleetProvider');
  return context;
}