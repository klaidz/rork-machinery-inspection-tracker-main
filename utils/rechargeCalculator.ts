import { JobCard, MachineryDepartment, RechargeInfo } from '@/types';

const STANDARD_RATE = 600;
const MOT_RATE = 300;

export function calculateRecharge(jobCard: JobCard): RechargeInfo | null {
  const materials = jobCard.materials?.toLowerCase() || '';
  const workDone = jobCard.workDone?.toLowerCase() || '';
  const transporter = jobCard.transporter;

  if (!transporter) {
    console.log('[Recharge] No transporter set, skipping calculation');
    return null;
  }

  const isArable = transporter === 'arable';
  const isGenesis = transporter === 'genesis';
  const isCO2 = transporter === 'co2';

  console.log('[Recharge] Analyzing:', { materials, workDone, transporter, isArable, isGenesis, isCO2 });

  if (materials.includes('stone') || workDone.includes('stone')) {
    console.log('[Recharge] Rule: Stones → Chittering 3 at £600');
    return {
      rechargeTo: 'arable',
      rate: STANDARD_RATE,
      notes: 'Stones recharge to Chittering 3'
    };
  }

  if (materials.includes('potato') || workDone.includes('potato')) {
    console.log('[Recharge] Rule: Potatoes → PC at £600');
    return {
      rechargeTo: 'arable',
      rate: STANDARD_RATE,
      notes: 'Potatoes recharge to PC'
    };
  }

  if (materials.includes('straw') || workDone.includes('straw')) {
    if (isArable || isCO2) {
      console.log('[Recharge] Rule: Straw by Arable/CO2 → Genesis at £600');
      return {
        rechargeTo: 'genesis',
        rate: STANDARD_RATE,
        notes: 'Straw transported by Arable/CO2 recharged to Genesis'
      };
    }
    if (isGenesis) {
      console.log('[Recharge] Rule: Straw by Genesis → No recharge');
      return null;
    }
  }

  const isArableTypeJob = 
    materials.includes('tanker') || workDone.includes('tanker') ||
    materials.includes('maize') || materials.includes('maze') || 
    workDone.includes('maize') || workDone.includes('maze') ||
    materials.includes('feeding pc') || workDone.includes('feeding pc') ||
    materials.includes('sugarbeet') || materials.includes('sugar beet') || 
    workDone.includes('sugarbeet') || workDone.includes('sugar beet') ||
    materials.includes('muck') || workDone.includes('muck') ||
    materials.includes('digest') || workDone.includes('digest') ||
    materials.includes('triticale') || materials.includes('seed') ||
    workDone.includes('triticale') || workDone.includes('seed') ||
    materials.includes('trailer') || workDone.includes('trailer');

  if (isArableTypeJob) {
    if (isArable) {
      console.log('[Recharge] Rule: Arable doing Arable-type job → No recharge');
      return null;
    }
    if (isCO2 || isGenesis) {
      console.log('[Recharge] Rule: Arable-type job by CO2/Genesis → Arable at £600');
      return {
        rechargeTo: 'arable',
        rate: STANDARD_RATE,
        notes: 'Arable-type work recharged to Arable'
      };
    }
  }

  if (workDone.includes('genesis mot')) {
    if (isArable || isCO2) {
      console.log('[Recharge] Rule: Genesis MOT by Arable/CO2 → Genesis at £300');
      return {
        rechargeTo: 'genesis',
        rate: MOT_RATE,
        notes: 'Genesis MOT recharged to Genesis'
      };
    }
    if (isGenesis) {
      console.log('[Recharge] Rule: Genesis MOT by Genesis → No recharge');
      return null;
    }
  }

  if (workDone.includes('arable mot')) {
    if (isGenesis || isCO2) {
      console.log('[Recharge] Rule: Arable MOT by Genesis/CO2 → Arable at £300');
      return {
        rechargeTo: 'arable',
        rate: MOT_RATE,
        notes: 'Arable MOT recharged to Arable'
      };
    }
    if (isArable) {
      console.log('[Recharge] Rule: Arable MOT by Arable → No recharge');
      return null;
    }
  }

  if (materials.includes('mot') || workDone.includes('mot')) {
    if (isCO2 || isGenesis) {
      console.log('[Recharge] Rule: Generic MOT by CO2/Genesis → Arable at £300');
      return {
        rechargeTo: 'arable',
        rate: MOT_RATE,
        notes: 'MOT recharged to Arable'
      };
    }
    if (isArable) {
      console.log('[Recharge] Rule: Generic MOT by Arable → No recharge');
      return null;
    }
  }

  console.log('[Recharge] No recharge rules matched');
  return null;
}

export function formatRechargeInfo(rechargeInfo: RechargeInfo | null): string {
  if (!rechargeInfo) {
    return 'No recharge';
  }

  const departmentName = getDepartmentName(rechargeInfo.rechargeTo);
  return `${departmentName} - £${rechargeInfo.rate}`;
}

function getDepartmentName(department?: MachineryDepartment): string {
  if (!department) return 'Unknown';
  
  switch (department) {
    case 'arable':
      return 'Arable';
    case 'straw_e1':
      return 'Straw E1';
    case 'straw_e2':
      return 'Straw E2';
    case 'genesis':
      return 'Genesis';
    case 'co2':
      return 'CO2';
    default:
      return department;
  }
}
