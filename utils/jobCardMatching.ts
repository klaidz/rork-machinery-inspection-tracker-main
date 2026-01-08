import { JobCard, MaterialType } from '@/types';

export function getJobCardMaterialType(jobCard: JobCard): MaterialType {
  if (jobCard.material) {
    return jobCard.material;
  }
  
  const materialsText = jobCard.materials.toLowerCase();
  
  if (materialsText.includes('straw')) {
    return 'straw';
  }
  if (materialsText.includes('maze') || materialsText.includes('maize')) {
    return 'maze';
  }
  if (materialsText.includes('grain') || materialsText.includes('wheat') || materialsText.includes('barley')) {
    return 'grain';
  }
  if (materialsText.includes('solid digestic')) {
    return 'solid_digestic';
  }
  if (materialsText.includes('liquid digestic')) {
    return 'liquid_digestic';
  }
  if (materialsText.includes('ticale') || materialsText.includes('triticale')) {
    return 'ticale';
  }
  if (materialsText.includes('waste rice')) {
    return 'waste_rice';
  }
  if (materialsText.includes('low loader')) {
    return 'low_loader';
  }
  if (materialsText.includes('a grade bale') || materialsText.includes('a grade')) {
    return 'a_grade';
  }
  if (materialsText.includes('b grade bale') || materialsText.includes('b grade')) {
    return 'b_grade';
  }
  if (materialsText.includes('c grade bale') || materialsText.includes('c grade')) {
    return 'c_grade';
  }
  if (materialsText.includes('sugarbeet') || materialsText.includes('sugar beet')) {
    return 'sugarbeet';
  }
  if (materialsText.includes('beet pulp')) {
    return 'beet_pulp';
  }
  if (materialsText.includes('beet fines')) {
    return 'beet_fines';
  }
  if (materialsText.includes('arable custom')) {
    return 'arable_custom';
  }
  if (materialsText.includes('genesis straw bale')) {
    return 'genesis_straw_bale';
  }
  if (materialsText.includes('genesis loose straw') || materialsText.includes('loose straw')) {
    return 'genesis_loose_straw';
  }
  if (materialsText.includes('gras') || materialsText.includes('grass')) {
    return 'gras';
  }
  if (materialsText.includes('lng') || materialsText.includes('gas')) {
    return 'lng_gas';
  }
  
  return 'other';
}

export function matchJobCardByMaterial(jobCard: JobCard, targetMaterial: MaterialType): boolean {
  const actualMaterial = getJobCardMaterialType(jobCard);
  return actualMaterial === targetMaterial;
}

export function categorizeJobCardsByMaterial(jobCards: JobCard[]): Record<MaterialType, JobCard[]> {
  return jobCards.reduce((acc, jobCard) => {
    const material = getJobCardMaterialType(jobCard);
    if (!acc[material]) {
      acc[material] = [];
    }
    acc[material].push(jobCard);
    return acc;
  }, {} as Record<MaterialType, JobCard[]>);
}

export function getMaterialLabel(material: MaterialType): string {
  const labels: Record<MaterialType, string> = {
    maze: 'Maze',
    gras: 'Gras',
    triticale: 'Triticale',
    sugarbeet: 'Sugar Beet',
    beet_pulp: 'Beet Pulp',
    beet_fines: 'Beet Fines',
    solid_digestic: 'Solid Digestic',
    liquid_digestic: 'Liquid Digestic',
    waste_rice: 'Waste Rice',
    arable_custom: 'Arable Custom',
    genesis_straw_bale: 'Genesis Straw (Bale)',
    a_grade: 'A Grade',
    b_grade: 'B Grade',
    c_grade: 'C Grade',
    genesis_loose_straw: 'Genesis Loose Straw',
    lng_gas: 'LNG Gas',
    grain: 'Grain',
    ticale: 'Ticale',
    low_loader: 'Low Loader',
    straw: 'Straw',
    other: 'Other',
  };
  return labels[material];
}

export function getMaterialColor(material: MaterialType): string {
  const colors: Record<MaterialType, string> = {
    maze: '#f59e0b',
    gras: '#84cc16',
    triticale: '#f97316',
    sugarbeet: '#dc2626',
    beet_pulp: '#be123c',
    beet_fines: '#991b1b',
    solid_digestic: '#78716c',
    liquid_digestic: '#06b6d4',
    waste_rice: '#84cc16',
    arable_custom: '#6366f1',
    genesis_straw_bale: '#eab308',
    a_grade: '#16a34a',
    b_grade: '#65a30d',
    c_grade: '#ca8a04',
    genesis_loose_straw: '#f59e0b',
    lng_gas: '#0ea5e9',
    grain: '#eab308',
    ticale: '#f97316',
    low_loader: '#8b5cf6',
    straw: '#f59e0b',
    other: '#6b7280',
  };
  return colors[material];
}
