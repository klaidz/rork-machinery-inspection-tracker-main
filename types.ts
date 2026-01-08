// types.ts - COMPLETE DICTIONARY

// --- FARMING & FIELDS ---
export interface Farmer {
  id: string;
  name: string;
}

export interface Field {
  id: string;
  farmerId: string;
  name: string;
  coordinates: { latitude: number; longitude: number }[];
  riskSpots?: { latitude: number; longitude: number; description: string }[];
}

export interface FieldMeasurement {
  id: string;
  fieldId: string;
  type: string;
  value: number;
  unit: string;
  date: Date;
}

// --- MACHINERY & FLEET ---
export interface Machinery {
  id: string;
  name: string;
  type: 'Tractor' | 'Trailer' | 'Combine' | 'Forklift' | 'Truck' | 'Other' | 'Car';
  model?: string;
  registration?: string;
  hours?: number;
  lastCheckDate?: Date;
  status: 'active' | 'maintenance' | 'broken';
  photoUrl?: string;
}

// --- DAILY CHECKS ---
export type DefectLevel = 'safe' | 'advisory' | 'danger';

export interface CheckItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
  photoUrl?: string;
}

export interface DailyCheck {
  id: string;
  machineryId: string;
  machineryName: string;
  driverId: string;
  driverName: string;
  date: Date;
  odometer: number;
  items: CheckItem[];
  defectsFound: boolean;
  defectLevel: DefectLevel;
  signatureUrl?: string;
}

// --- JOBS & TRANSPORT ---
export interface TransportJob {
  id: string;
  customerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: 'pending' | 'in-progress' | 'completed';
}

// --- INVOICING & CUSTOMERS ---
export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  date: Date;
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid';
}

// --- SAFETY & NEAR MISS ---
export type NearMissNature = 'Unsafe Act' | 'Unsafe Condition' | 'Incident';
export type NearMissUrgency = 'Low' | 'Medium' | 'High';

export interface NearMissReport {
  id: string;
  date: Date;
  nature: NearMissNature;
  urgency: NearMissUrgency;
  description: string;
  location: string;
  witnesses?: string;
}

// --- INVENTORY ---
export interface SafetyStock {
  id: string;
  itemName: string;
  quantity: number;
  minLevel: number;
  unit: string;
}