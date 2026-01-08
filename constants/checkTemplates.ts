import { CheckItem } from '@/types';

export const TRACTOR_CHECK_TEMPLATE: Omit<CheckItem, 'status'>[] = [
  { id: '1', label: 'Are there any visible fluid leaks (engine oil, coolant, hydraulic systems)?' },
  { id: '2', label: 'Are the tyres in good condition (no cracks, damage, or incorrect inflation)?' },
  { id: '3', label: 'Are all wheel nuts secure and rims in good condition?' },
  { id: '4', label: 'Are all lights, indicators, and beacons present and functioning correctly?' },
  { id: '5', label: 'Are all mirrors intact, clean, and correctly adjusted?' },
  { id: '6', label: 'Is the cab clean, tidy, and free from loose objects or obstructions?' },
  { id: '7', label: 'Is the engine oil level within the correct operating range?' },
  { id: '8', label: 'Is the coolant level within the correct operating range?' },
  { id: '9', label: 'Is the hydraulic oil level within the correct operating range?' },
  { id: '10', label: 'Is the fuel level sufficient for the planned work period?' },
  { id: '11', label: 'Is the AdBlue level sufficient, where applicable?' },
  { id: '12', label: 'Is the PTO guard fitted correctly and free from damage?' },
  { id: '13', label: 'Is the 3-point linkage operating smoothly and correctly?' },
  { id: '14', label: 'Are both service and parking brakes operating effectively?' },
  { id: '15', label: 'Is the steering operating smoothly with no excessive play?' },
  { id: '16', label: 'Are there any warning lights or error codes displayed on the dashboard?' },
  { id: '17', label: 'Is a suitable fire extinguisher present, accessible, and in date/charged?' },
  { id: '18', label: 'Are there any unusual noises, vibrations, or noticeable loss of power during operation?' },
  { id: '19', label: 'Are there any issues with transmission performance or gear selection/gear shifting?' },
];

export const IMPLEMENT_CHECK_TEMPLATE: Omit<CheckItem, 'status'>[] = [
  { id: '1', label: 'Structural Integrity' },
  { id: '2', label: 'Bolts & Fasteners Tight' },
  { id: '3', label: 'Hydraulic Hoses & Connections' },
  { id: '4', label: 'Wear Parts Condition' },
  { id: '5', label: 'Grease Points' },
  { id: '6', label: 'Safety Shields in Place' },
  { id: '7', label: 'Attachment Points' },
  { id: '8', label: 'No Visible Damage' },
];

export const JCB_CHECK_TEMPLATE: Omit<CheckItem, 'status'>[] = [
  { id: '1', label: 'Machine identification confirmed (fleet number, registration, site)' },
  { id: '2', label: 'Engine hours recorded and confirmed' },
  { id: '3', label: 'Any visible fluid leaks (engine oil, coolant, fuel, hydraulic, axle)' },
  { id: '4', label: 'Tyres in good condition (no cuts, bulges, exposed cords; inflation visually OK)' },
  { id: '5', label: 'Wheel nuts present and secure; no obvious damage to rims' },
  { id: '6', label: 'Steps, grab handles and platforms secure, clean and free from slip hazards' },
  { id: '7', label: 'Mirrors, windows and camera lenses (if fitted) clean and undamaged' },
  { id: '8', label: 'Lights, indicators, beacons and work lamps present and operating correctly' },
  { id: '9', label: 'Wipers and washers functioning; screen wash level adequate' },
  { id: '10', label: 'ROPS/FOPS cab structure, doors and glazing intact with no obvious damage' },
  { id: '11', label: 'Seat, seat belt and seat mount secure and in good condition' },
  { id: '12', label: "Operator's manual and load chart present and legible in cab" },
  { id: '13', label: 'Engine oil level within correct operating range' },
  { id: '14', label: 'Coolant level within correct operating range' },
  { id: '15', label: 'Hydraulic oil level within correct operating range' },
  { id: '16', label: 'Fuel level sufficient for the planned work' },
  { id: '17', label: 'AdBlue level sufficient (if applicable)' },
  { id: '18', label: 'Steering operates smoothly with no excessive play or unusual noises' },
  { id: '19', label: 'Service brakes effective and responsive; parking brake holds machine securely' },
  { id: '20', label: 'All warning lamps and gauges operate on start-up and no unresolved warnings remain' },
  { id: '21', label: 'Reversing alarm and/or camera system operating correctly' },
  { id: '22', label: 'Boom structure free from obvious damage, cracks, or excessive wear' },
  { id: '23', label: 'Boom wear pads and extension sections appear in good condition' },
  { id: '24', label: 'Hydraulic hoses, pipes and couplings (including boom services) secure and free from damage' },
  { id: '25', label: 'Quick-hitch / attachment coupler locks fully engaged and safety pins/clamps fitted' },
  { id: '26', label: 'Forks, buckets and other attachments free from visible damage or distortion' },
  { id: '27', label: 'Fork heels and tips not excessively worn; fork backrest and carriage secure' },
  { id: '28', label: 'Stabilizers or chassis-levelling systems (if fitted) operate correctly' },
  { id: '29', label: 'Boom suspension / ride control (if fitted) operates as intended' },
  { id: '30', label: 'All controls, safety interlocks and load-moment/overload warning systems functioning correctly' },
  { id: '31', label: 'Cab and machine free from loose items; any defects reported and machine tagged if unsafe' },
];

export const SCANIA_CHECK_TEMPLATE: Omit<CheckItem, 'status'>[] = [
  { id: '1', label: 'Vehicle identification confirmed (registration, fleet number, body ID if applicable)' },
  { id: '2', label: 'Odometer reading recorded and confirmed' },
  { id: '3', label: 'Any visible leaks (engine oil, fuel, coolant, gearbox, differential, hydraulic systems)' },
  { id: '4', label: 'Tyres in good condition on all axles (no cuts, bulges, exposed cords; tread depth adequate)' },
  { id: '5', label: 'Wheel nuts present and secure; nut indicators (if fitted) aligned; rims undamaged' },
  { id: '6', label: 'Mudguards and spray suppression fitted correctly and secure' },
  { id: '7', label: 'Chassis, cross-members and body mounts visually sound with no obvious damage or cracks' },
  { id: '8', label: 'Front and rear lights, indicators, side markers, beacons and brake lights all operating' },
  { id: '9', label: 'Reflectors and number plates present, clean and legible' },
  { id: '10', label: 'Mirrors, windows and cameras (if fitted) clean, correctly adjusted and undamaged' },
  { id: '11', label: 'Wipers and washers working; screen wash level adequate' },
  { id: '12', label: 'Cab steps and grab handles secure, clean and free from slip hazards' },
  { id: '13', label: 'Engine oil level within correct operating range' },
  { id: '14', label: 'Coolant level within correct operating range' },
  { id: '15', label: 'Power steering / hydraulic fluid (where visible) within correct range' },
  { id: '16', label: 'Fuel level sufficient for planned work; AdBlue level sufficient' },
  { id: '17', label: 'Air system builds and holds pressure correctly; no obvious air leaks' },
  { id: '18', label: 'Service brakes and park brake operating effectively; trailer brake (if fitted) operates correctly' },
  { id: '19', label: 'No unresolved warning lights or error messages displayed' },
  { id: '20', label: 'Body structure, headboard, side panels and tailgate free from obvious damage or cracks' },
  { id: '21', label: 'Tailgate locks, hinges and seals intact and operating correctly' },
  { id: '22', label: 'Walking-floor / chain floor free from obvious damage or obstructions' },
  { id: '23', label: 'Floor chains, slats and guides appear correctly tensioned and undamaged' },
  { id: '24', label: 'Hydraulic hoses, rams and fittings for body/floor free from leaks or damage' },
  { id: '25', label: 'PTO engagement and body/floor controls operating correctly and safely' },
  { id: '26', label: 'Safety props / body supports (if fitted) present and functional' },
  { id: '27', label: 'Load sheet, nets or side curtains (if fitted) present and serviceable' },
  { id: '28', label: 'Fire extinguisher present, accessible and in date/charged' },
  { id: '29', label: 'Cab interior clean, tidy and free from loose objects that could interfere with controls' },
  { id: '30', label: 'Any defects or damage reported immediately and vehicle not used if safety-critical' },
];

export const EIGHT_WHEELER_CHECK_TEMPLATE: Omit<CheckItem, 'status'>[] = [
  { id: '1', label: 'PRE-START: Mirrors & windscreen clean, secure; wipers & washer working' },
  { id: '2', label: 'PRE-START: Lights & signals work (dipped/main, sidelights, indicators, brake, reverse, hazard)' },
  { id: '3', label: 'PRE-START: Horn working' },
  { id: '4', label: 'PRE-START: Tyres — no cuts/bulges, tread visible, valves present (check spare if carried)' },
  { id: '5', label: 'PRE-START: Wheels & wheel nuts present (no obvious loose nuts)' },
  { id: '6', label: 'PRE-START: No obvious fuel, oil, coolant or hydraulic leaks beneath vehicle' },
  { id: '7', label: 'PRE-START: Exhaust secure; no excessive smoke when started' },
  { id: '8', label: 'PRE-START: Doors close & lock; steps & handholds secure' },
  { id: '9', label: 'PRE-START: Tailboard/tailgate secured and locking mechanisms engaged' },
  { id: '10', label: 'PRE-START: Fuel cap secure / no smell of fuel' },
  { id: '11', label: 'PRE-START: Fire extinguisher, warning triangle, hi-vis jacket present and serviceable' },
  { id: '12', label: 'PRE-START: First aid / spill kit present (if required by company)' },
  { id: '13', label: 'PRE-START: Driver documents present — driving licence, CPC, tachograph card, company paperwork, MOT/insurance where required' },
  { id: '14', label: 'TYRES & WHEELS: Tyre condition: no major damage; even wear; tread depth acceptable' },
  { id: '15', label: 'TYRES & WHEELS: No missing studs or dangerously loose nuts' },
  { id: '16', label: 'TYRES & WHEELS: Suspension / springs / airbags visually intact — no obvious damage or leaks' },
  { id: '17', label: 'TYRES & WHEELS: Brake pipes/air lines free from chafing; no visible air leaks' },
  { id: '18', label: 'ENGINE & FLUIDS: Steering — no obvious play, linkages secure' },
  { id: '19', label: 'ENGINE & FLUIDS: Oil, coolant and washer fluid at correct levels (visual check)' },
  { id: '20', label: 'ENGINE & FLUIDS: Battery secure; terminals clean (visual)' },
  { id: '21', label: 'ENGINE & FLUIDS: No signs of significant fluid loss or pooling' },
  { id: '22', label: 'BODY & HYDRAULICS: Hydraulic rams, hoses and couplings — no visible leaks, hoses secure' },
  { id: '23', label: 'BODY & HYDRAULICS: Body/bed free of structural damage that affects safe operation' },
  { id: '24', label: 'BODY & HYDRAULICS: PTO and hydraulic controls operate correctly (safe test if needed)' },
  { id: '25', label: 'CAB & CONTROLS: Seatbelt(s) serviceable; seat adjusted for safe driving' },
  { id: '26', label: 'CAB & CONTROLS: Handbrake holds' },
  { id: '27', label: 'CAB & CONTROLS: Fire extinguisher present and accessible' },
  { id: '28', label: 'OPERATIONAL TEST: Engine runs smoothly; no unusual noises or smoke' },
  { id: '29', label: 'OPERATIONAL TEST: Brakes function normally under progressive braking' },
  { id: '30', label: 'OPERATIONAL TEST: Steering response normal; no severe pull or vibration' },
  { id: '31', label: 'OPERATIONAL TEST: Handbrake holds vehicle securely' },
];

export const HGV_CHECK_TEMPLATE: Omit<CheckItem, 'status'>[] = [
  { id: '1', label: 'Wipers / Washers / Windscreen' },
  { id: '2', label: 'Steering / Brakes' },
  { id: '3', label: 'Fuel / Oil / Water Leaks' },
  { id: '4', label: 'Tyres and Wheel Nuts' },
  { id: '5', label: 'Tachograph Unit' },
  { id: '6', label: 'Brakes and Hoses / Electrical Couplings' },
  { id: '7', label: 'Lights / Reflectors / Battery' },
  { id: '8', label: 'Mirrors / Indicators / Horn' },
  { id: '9', label: 'Rear / Side Lights & Markers' },
  { id: '10', label: 'Speed Limiter' },
  { id: '11', label: 'Speedometer' },
  { id: '12', label: 'Spray Suppression / Wings' },
  { id: '13', label: '5th Wheel Couplings Security' },
  { id: '14', label: 'Excessive Engine / Exhaust Smoke' },
  { id: '15', label: 'First Aid Kit' },
  { id: '16', label: 'Passenger Seat Belts' },
  { id: '17', label: 'Glass' },
  { id: '18', label: 'AdBlue: If Required' },
  { id: '19', label: 'Steering' },
  { id: '20', label: 'Tacho Discs / Digital Card / Printer Rolls' },
  { id: '21', label: 'Body / Wings / Load Security' },
  { id: '22', label: 'Brake Lights' },
  { id: '23', label: 'Markers / Registration Plates' },
  { id: '24', label: 'Lights / Head / Side / Marker / Tail Board / Tail and Stop / Reverse / Fog' },
  { id: '25', label: 'Check for Air Leaks' },
  { id: '26', label: 'Trailer Connections - Condition / Function / Leaks' },
];

export const COMPANY_CAR_CHECK_TEMPLATE: Omit<CheckItem, 'status'>[] = [
  { id: 'isuzu-1', label: 'Exterior / Bodywork – Walk-round visual check completed' },
  { id: 'isuzu-2', label: 'Exterior / Bodywork – Body panels secure, no major damage' },
  { id: 'isuzu-3', label: 'Exterior / Bodywork – Bumper & grille secure' },
  { id: 'isuzu-4', label: 'Exterior / Bodywork – Doors, handles & locks working' },
  { id: 'isuzu-5', label: 'Exterior / Bodywork – Mirrors clean & intact' },
  { id: 'isuzu-6', label: 'Exterior / Bodywork – Windows clean, no cracks' },
  { id: 'isuzu-7', label: 'Exterior / Bodywork – Load bed/tailgate secure' },
  { id: 'isuzu-8', label: 'Exterior / Bodywork – Towbar / hitch secure (if fitted)' },
  { id: 'isuzu-9', label: 'Fluids & Leaks – Engine oil level OK' },
  { id: 'isuzu-10', label: 'Fluids & Leaks – Coolant level OK' },
  { id: 'isuzu-11', label: 'Fluids & Leaks – Brake fluid OK' },
  { id: 'isuzu-12', label: 'Fluids & Leaks – Power steering fluid OK (if fitted)' },
  { id: 'isuzu-13', label: 'Fluids & Leaks – Washer fluid OK' },
  { id: 'isuzu-14', label: 'Fluids & Leaks – Fuel level sufficient for shift' },
  { id: 'isuzu-15', label: 'Fluids & Leaks – AdBlue level OK (if applicable)' },
  { id: 'isuzu-16', label: 'Fluids & Leaks – No visible leaks (oil, fuel, coolant, AdBlue)' },
  { id: 'isuzu-17', label: 'Tyres/Wheels/Suspension – Tyres correct pressure' },
  { id: 'isuzu-18', label: 'Tyres/Wheels/Suspension – No cuts, bulges, exposed cords' },
  { id: 'isuzu-19', label: 'Tyres/Wheels/Suspension – Tyre tread above minimum' },
  { id: 'isuzu-20', label: 'Tyres/Wheels/Suspension – Wheel nuts secure' },
  { id: 'isuzu-21', label: 'Tyres/Wheels/Suspension – Rims undamaged' },
  { id: 'isuzu-22', label: 'Tyres/Wheels/Suspension – Suspension feels normal (no sagging or knocks)' },
  { id: 'isuzu-23', label: 'Cabin & Safety – Seat belts working, no fraying' },
  { id: 'isuzu-24', label: 'Cabin & Safety – Seats secure & adjust normally' },
  { id: 'isuzu-25', label: 'Cabin & Safety – Cab clean, no loose items' },
  { id: 'isuzu-26', label: 'Cabin & Safety – Horn operational' },
  { id: 'isuzu-27', label: 'Cabin & Safety – Dashboard displays normal' },
  { id: 'isuzu-28', label: 'Cabin & Safety – No uninvestigated warning lights' },
  { id: 'isuzu-29', label: 'Cabin & Safety – AC / heater working' },
  { id: 'isuzu-30', label: 'Cabin & Safety – Reversing camera/sensors working (if fitted)' },
  { id: 'isuzu-31', label: 'Cabin & Safety – Fire extinguisher present & in date (if carried)' },
  { id: 'isuzu-32', label: 'Cabin & Safety – First aid kit present (if required)' },
  { id: 'isuzu-33', label: 'Lights & Indicators – Headlights (low/high beam) functional' },
  { id: 'isuzu-34', label: 'Lights & Indicators – Side lights working' },
  { id: 'isuzu-35', label: 'Lights & Indicators – Daytime running lights working' },
  { id: 'isuzu-36', label: 'Lights & Indicators – Fog lights (front/rear) working' },
  { id: 'isuzu-37', label: 'Lights & Indicators – Indicators / hazards working' },
  { id: 'isuzu-38', label: 'Lights & Indicators – Brake lights working' },
  { id: 'isuzu-39', label: 'Lights & Indicators – Reverse lights working' },
  { id: 'isuzu-40', label: 'Lights & Indicators – Number plate lights working' },
  { id: 'isuzu-41', label: 'Lights & Indicators – All lenses clean & undamaged' },
  { id: 'isuzu-42', label: 'Engine & Drive Test – Engine starts smoothly' },
  { id: 'isuzu-43', label: 'Engine & Drive Test – No excessive smoke' },
  { id: 'isuzu-44', label: 'Engine & Drive Test – No unusual noises or vibrations' },
  { id: 'isuzu-45', label: 'Engine & Drive Test – Acceleration normal' },
  { id: 'isuzu-46', label: 'Engine & Drive Test – Steering responsive' },
  { id: 'isuzu-47', label: 'Engine & Drive Test – Clutch operates normally (if manual)' },
  { id: 'isuzu-48', label: 'Engine & Drive Test – Automatic gearbox shifting normally (if auto)' },
  { id: 'isuzu-49', label: 'Engine & Drive Test – Brakes effective with no pulling' },
  { id: 'isuzu-50', label: 'Engine & Drive Test – Handbrake/parking brake holds securely' },
];

export const SHOVEL_CHECK_TEMPLATE: Omit<CheckItem, 'status'>[] = [
  { id: '1', label: 'Machine identification confirmed (fleet number, registration, site)' },
  { id: '2', label: 'Engine hours recorded and confirmed' },
  { id: '3', label: 'Any visible fluid leaks (engine oil, coolant, fuel, hydraulic, axle)' },
  { id: '4', label: 'Tyres in good condition (no cuts, bulges, exposed cords; inflation visually OK)' },
  { id: '5', label: 'Wheel nuts present and secure; no obvious damage to rims' },
  { id: '6', label: 'Steps, grab handles and platforms secure, clean and free from slip hazards' },
  { id: '7', label: 'Mirrors, windows and camera lenses (if fitted) clean and undamaged' },
  { id: '8', label: 'Lights, indicators, beacons and work lamps present and operating correctly' },
  { id: '9', label: 'Wipers and washers functioning; screen wash level adequate' },
  { id: '10', label: 'ROPS/FOPS cab structure, doors and glazing intact with no obvious damage' },
  { id: '11', label: 'Seat, seat belt and seat mount secure and in good condition' },
  { id: '12', label: "Operator's manual and load chart present and legible in cab" },
  { id: '13', label: 'Engine oil level within correct operating range' },
  { id: '14', label: 'Coolant level within correct operating range' },
  { id: '15', label: 'Hydraulic oil level within correct operating range' },
  { id: '16', label: 'Fuel level sufficient for the planned work' },
  { id: '17', label: 'AdBlue level sufficient (if applicable)' },
  { id: '18', label: 'Steering operates smoothly with no excessive play or unusual noises' },
  { id: '19', label: 'Service brakes effective and responsive; parking brake holds machine securely' },
  { id: '20', label: 'All warning lamps and gauges operate on start-up and no unresolved warnings remain' },
  { id: '21', label: 'Reversing alarm and/or camera system operating correctly' },
  { id: '22', label: 'Boom/arm structure free from obvious damage, cracks, or excessive wear' },
  { id: '23', label: 'Hydraulic hoses, pipes and couplings secure and free from damage' },
  { id: '24', label: 'Bucket and cutting edge free from visible damage or excessive wear' },
  { id: '25', label: 'Quick-hitch / attachment coupler locks fully engaged and safety pins fitted' },
  { id: '26', label: 'All controls and safety interlocks functioning correctly' },
  { id: '27', label: 'Cab and machine free from loose items; any defects reported and machine tagged if unsafe' },
];

export const FARMING_MACHINERY_CHECK_TEMPLATE: Omit<CheckItem, 'status'>[] = [
  { id: '1', label: 'Machine identification confirmed (fleet number, registration, model)' },
  { id: '2', label: 'Engine hours or odometer reading recorded and confirmed' },
  { id: '3', label: 'Any visible fluid leaks (engine oil, coolant, fuel, hydraulic)' },
  { id: '4', label: 'Tyres/tracks in good condition (no cuts, bulges, exposed cords; inflation/tension OK)' },
  { id: '5', label: 'Wheel nuts present and secure; no obvious damage to rims' },
  { id: '6', label: 'Steps, grab handles and platforms secure, clean and free from slip hazards' },
  { id: '7', label: 'Mirrors, windows and camera lenses (if fitted) clean and undamaged' },
  { id: '8', label: 'Lights, indicators, beacons and work lamps present and operating correctly' },
  { id: '9', label: 'ROPS/FOPS cab structure, doors and glazing intact with no obvious damage' },
  { id: '10', label: 'Seat, seat belt and seat mount secure and in good condition' },
  { id: '11', label: 'Engine oil level within correct operating range' },
  { id: '12', label: 'Coolant level within correct operating range' },
  { id: '13', label: 'Hydraulic oil level within correct operating range' },
  { id: '14', label: 'Fuel level sufficient for the planned work' },
  { id: '15', label: 'AdBlue level sufficient (if applicable)' },
  { id: '16', label: 'Service brakes effective and responsive; parking brake holds machine securely' },
  { id: '17', label: 'All warning lamps and gauges operate on start-up and no unresolved warnings remain' },
  { id: '18', label: 'Hydraulic hoses, pipes and couplings secure and free from damage' },
  { id: '19', label: 'All guards, shields and safety devices in place and functioning' },
  { id: '20', label: 'Machinery-specific systems operating correctly (e.g., harvester header, tank unloading, etc.)' },
  { id: '21', label: 'All controls and safety interlocks functioning correctly' },
  { id: '22', label: 'Cab and machine free from loose items; any defects reported and machine tagged if unsafe' },
];

export const getCheckTemplate = (type: string): Omit<CheckItem, 'status'>[] => {
  console.log('[DEBUG] getCheckTemplate called with type:', type);
  let template: Omit<CheckItem, 'status'>[] = [];
  
  switch (type) {
    case 'tractor':
      template = TRACTOR_CHECK_TEMPLATE;
      break;
    case 'implement':
      template = IMPLEMENT_CHECK_TEMPLATE;
      break;
    case 'scania_18ton':
      template = SCANIA_CHECK_TEMPLATE;
      break;
    case 'jcb':
      template = JCB_CHECK_TEMPLATE;
      break;
    case '8_wheeler':
      template = EIGHT_WHEELER_CHECK_TEMPLATE;
      break;
    case 'hgv':
      template = HGV_CHECK_TEMPLATE;
      break;
    case 'company_car':
      template = COMPANY_CAR_CHECK_TEMPLATE;
      break;
    case 'shovel':
      template = SHOVEL_CHECK_TEMPLATE;
      break;
    case 'farming':
      template = FARMING_MACHINERY_CHECK_TEMPLATE;
      break;
    default:
      console.warn('[WARNING] Unknown machinery type:', type, '- returning empty template');
      template = [];
  }
  
  console.log('[DEBUG] Returning template with', template.length, 'items');
  return template;
};
