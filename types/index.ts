// --- USER & AUTH ---
export type UserRole = 'admin' | 'manager' | 'driver' | 'workshop' | 'clerk';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// --- MACHINERY ---
export interface Machinery {
  registration: string;
  id: string;
  name: string;
  registrationNumber: string;
  type: string;
  // FIX: Added 'maintenance' and 'out_of_use' to the allowed list
  status: 'active' | 'maintenance' | 'retired' | 'out_of_use'; 
  hours: number;
  department?: string; 
}

// --- FARMERS ---
export interface Farmer {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
}

// --- FIELDS & RISKS ---
export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Hazard {
  id: string;
  location: Coordinate;
  label: string; 
}

export interface Field {
  id: string;
  farmerId: string;
  name: string;
  boundary: Coordinate[];
  area?: number;
  entrance?: Coordinate;
  hazards: Hazard[]; 
  notes?: string;
  accessCodes?: string;
}

// --- TRANSPORT JOBS ---
export interface TransportJob {
  id: string;
  date: string; 
  status: string;
  loadingLocationId: string;
  unloadingLocationId: string;
  description: string;
  machineryReg: string;
  machineryId: string;
  department: string;
  ticketNumber?: string;
}

// --- SAFETY STOCK ---
export interface SafetyStock {
  id: string;
  itemType: string;
  quantity: number;
  minLevel: number;
  location: string;
  expiryDate?: string;
}