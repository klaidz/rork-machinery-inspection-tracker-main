import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DailyCheck, DamageReport, MovementLog, Machinery, MachineryDepartment, NearMissReport, TyreFitterJobCard, WorkshopJobCard, TestResult } from '@/types';

const getDepartmentName = (dept?: MachineryDepartment, fullName: boolean = false): string => {
  if (!dept) return 'Unassigned';
  switch (dept) {
    case 'arable': return 'Arable';
    case 'straw_e1': return 'Straw E1';
    case 'straw_e2': return 'Straw E2';
    case 'genesis': return 'Genesis';
    case 'co2': return 'CO2';
    case 'mepal_yard': return 'Mepal';
    case 'pc': return fullName ? 'The Produce Connection' : 'PC';
    default: return 'Unassigned';
  }
};

interface DepartmentCheckGroup {
  department: string;
  checks: {
    check: DailyCheck;
    machine: Machinery;
  }[];
}

export const generateChecksCSV = (
  checks: DailyCheck[],
  machinery: Machinery[]
): string => {
  const checksByDepartment: Map<string, DepartmentCheckGroup> = new Map();
  
  checks.forEach(check => {
    const machine = machinery.find(m => m.id === check.machineryId);
    if (!machine) return;
    
    const deptName = getDepartmentName(machine.department, true);
    
    if (!checksByDepartment.has(deptName)) {
      checksByDepartment.set(deptName, {
        department: deptName,
        checks: []
      });
    }
    
    checksByDepartment.get(deptName)!.checks.push({ check, machine });
  });
  
  const sections: string[] = [];
  
  checksByDepartment.forEach((group) => {
    sections.push(`\n${group.department} Department`);
    sections.push('='.repeat(50));
    sections.push('');
    
    const headers = ['Date', 'Machinery', 'Registration', 'Completed By', 'Items Checked', 'Major Defects', 'Minor Defects', 'Photos', 'Status'];
    sections.push(headers.join(','));
    
    group.checks.forEach(({ check, machine }) => {
      const majorDefects = check.checkItems.filter(item => item.status === 'major').length;
      const minorDefects = check.checkItems.filter(item => item.status === 'minor').length;
      const status = check.hasMajorDefect ? 'Major Defect' : minorDefects > 0 ? 'Minor Defects' : 'Pass';
      
      const row = [
        check.date,
        machine.name,
        machine.registrationNumber,
        check.completedBy,
        check.checkItems.length.toString(),
        majorDefects.toString(),
        minorDefects.toString(),
        check.photos.length.toString(),
        status
      ].map(field => `"${field}"`).join(',');
      
      sections.push(row);
    });
    
    sections.push('');
  });

  return sections.join('\n');
};

export const generateDamageReportsCSV = (
  reports: DamageReport[],
  machinery: Machinery[]
): string => {
  const reportsByDepartment: Map<string, { report: DamageReport; machine: Machinery }[]> = new Map();
  
  reports.forEach(report => {
    const machine = machinery.find(m => m.id === report.machineryId);
    if (!machine) return;
    
    const deptName = getDepartmentName(machine.department, true);
    
    if (!reportsByDepartment.has(deptName)) {
      reportsByDepartment.set(deptName, []);
    }
    
    reportsByDepartment.get(deptName)!.push({ report, machine });
  });
  
  const sections: string[] = [];
  
  reportsByDepartment.forEach((items, deptName) => {
    sections.push(`\n${deptName} Department`);
    sections.push('='.repeat(50));
    sections.push('');
    
    const headers = ['Date', 'Machinery', 'Registration', 'Severity', 'Description', 'Location', 'Reported By', 'Photos', 'Type', 'Status'];
    sections.push(headers.join(','));
    
    items.forEach(({ report, machine }) => {
      const row = [
        report.date,
        machine.name,
        machine.registrationNumber,
        report.severity.charAt(0).toUpperCase() + report.severity.slice(1),
        report.description.replace(/"/g, '""'),
        report.location,
        report.reportedBy,
        report.photos.length.toString(),
        report.damageType === 'tyre' ? 'Tyre' : 'General',
        report.status.charAt(0).toUpperCase() + report.status.slice(1)
      ].map(field => `"${field}"`).join(',');
      
      sections.push(row);
    });
    
    sections.push('');
  });

  return sections.join('\n');
};

export const generateMovementLogsCSV = (
  logs: MovementLog[],
  machinery: Machinery[]
): string => {
  const logsByDepartment: Map<string, { log: MovementLog; machine: Machinery }[]> = new Map();
  
  logs.forEach(log => {
    const machine = machinery.find(m => m.id === log.machineryId);
    if (!machine) return;
    
    const deptName = getDepartmentName(machine.department, true);
    
    if (!logsByDepartment.has(deptName)) {
      logsByDepartment.set(deptName, []);
    }
    
    logsByDepartment.get(deptName)!.push({ log, machine });
  });
  
  const sections: string[] = [];
  
  logsByDepartment.forEach((items, deptName) => {
    sections.push(`\n${deptName} Department`);
    sections.push('='.repeat(50));
    sections.push('');
    
    const headers = ['Date', 'Machinery', 'Registration', 'Start Time', 'End Time', 'Start Location', 'End Location', 'Purpose', 'Hours Used', 'Fuel Used (L)', 'Operated By'];
    sections.push(headers.join(','));
    
    items.forEach(({ log, machine }) => {
      const row = [
        log.date,
        machine.name,
        machine.registrationNumber,
        log.startTime,
        log.endTime,
        log.startLocation,
        log.endLocation,
        log.purpose.replace(/"/g, '""'),
        log.hoursUsed.toFixed(2),
        log.fuelUsed?.toFixed(2) || '0',
        log.operatedBy
      ].map(field => `"${field}"`).join(',');
      
      sections.push(row);
    });
    
    sections.push('');
  });

  return sections.join('\n');
};

export const generateNearMissReportsCSV = (
  reports: NearMissReport[]
): string => {
  const sections: string[] = [];
  
  sections.push('Near-Miss Reports');
  sections.push('='.repeat(50));
  sections.push('');
  
  const headers = [
    'Date Prepared',
    'Time Prepared',
    'Department',
    'Site',
    'Nature of Near-Miss',
    'Urgency Level',
    'Problem Description',
    'Immediate Action Taken',
    'Root Cause Analysis',
    'Long-Term Actions',
    'Reporting Person',
    'Issued To',
    'Responsible Person',
    'Date Closed',
    'Created By'
  ];
  sections.push(headers.join(','));
  
  reports.forEach(report => {
    const getNatureName = (nature: string) => {
      const natureMap: Record<string, string> = {
        'process_procedure_deviation': 'Process/Procedure Deviation',
        'equipment_mechanical_failure': 'Equipment/Mechanical Failure',
        'vehicle_workplace_transport': 'Vehicle/Workplace Transport',
        'unsafe_condition': 'Unsafe Condition',
        'unsafe_acting': 'Unsafe Acting',
        'environmental': 'Environmental',
        'other': 'Other',
      };
      return natureMap[nature] || nature;
    };
    
    const getDepartmentName = (dept: string) => {
      const deptMap: Record<string, string> = {
        'arable': 'Arable',
        'arable_land': 'Arable Land',
        'arable_yard': 'Arable Yard',
        'genesis': 'Genesis',
        'co2': 'CO2',
        'mepal_yard': 'Mepal Yard',
        'pc': 'PC',
        'straw_e1': 'Straw E1',
        'straw_e2': 'Straw E2',
        'engineers': 'Engineers',
        'electricians': 'Electricians',
      };
      return deptMap[dept] || dept;
    };
    
    const natureList = report.natureOfNearMiss.map(n => getNatureName(n)).join('; ');
    
    const row = [
      report.datePrepared,
      report.timePrepared,
      getDepartmentName(report.department),
      report.site,
      natureList,
      report.urgencyLevel.charAt(0).toUpperCase() + report.urgencyLevel.slice(1),
      report.problemDescription.replace(/"/g, '""'),
      report.immediateActionTaken.replace(/"/g, '""'),
      report.rootCauseAnalysis.replace(/"/g, '""'),
      report.longTermActions.replace(/"/g, '""'),
      report.reportingPersonName,
      report.issuedToName,
      report.responsiblePersonName,
      report.dateClosed || 'Open',
      report.createdBy
    ].map(field => `"${field}"`).join(',');
    
    sections.push(row);
  });
  
  sections.push('');
  sections.push(`Total Near-Miss Reports: ${reports.length}`);
  sections.push(`Critical: ${reports.filter(r => r.urgencyLevel === 'critical').length}`);
  sections.push(`High: ${reports.filter(r => r.urgencyLevel === 'high').length}`);
  sections.push(`Medium: ${reports.filter(r => r.urgencyLevel === 'medium').length}`);
  sections.push(`Low: ${reports.filter(r => r.urgencyLevel === 'low').length}`);

  return sections.join('\n');
};

export const downloadReport = async (
  csvContent: string,
  filename: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Report downloaded successfully (web)');
    } else {
      const file = new File(Paths.cache, filename);
      file.create({ overwrite: true });
      file.write(csvContent);
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Download Report',
          UTI: 'public.comma-separated-values-text',
        });
        console.log('Report shared successfully (native)');
      } else {
        console.log('Sharing is not available on this device');
      }
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};

export const generateTyreReportsCSV = (
  jobCards: TyreFitterJobCard[]
): string => {
  const sections: string[] = [];
  
  sections.push('Tyre Fitter Job Cards');
  sections.push('='.repeat(50));
  sections.push('');
  
  const headers = [
    'Date',
    'Registration Number',
    'Position',
    'Tyre Size',
    'Tyre Brand',
    'Old Tyre Size',
    'Old Tyre Brand',
    'Old Tyre Condition',
    'Work Description',
    'Completed By',
    'Photos'
  ];
  sections.push(headers.join(','));
  
  jobCards.forEach(card => {
    const getPositionName = (pos: string) => {
      return pos.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };
    
    const getConditionName = (cond: string) => {
      const condMap: Record<string, string> = {
        'good_to_use': 'Good to Use',
        'worn_out': 'Worn Out',
        'damaged': 'Damaged',
        'other': 'Other',
      };
      return condMap[cond] || cond;
    };
    
    const row = [
      card.date,
      card.registrationNumber,
      getPositionName(card.tyrePosition),
      card.tyreSize || '',
      card.tyreBrand || '',
      card.oldTyreSize || '',
      card.oldTyreBrand || '',
      card.oldTyreCondition ? getConditionName(card.oldTyreCondition) : '',
      card.workDone?.replace(/"/g, '""') || '',
      card.createdBy,
      card.photos?.length.toString() || '0'
    ].map(field => `"${field}"`).join(',');
    
    sections.push(row);
  });
  
  sections.push('');
  sections.push(`Total Job Cards: ${jobCards.length}`);

  return sections.join('\n');
};

export const generateWorkshopReportsCSV = (
  jobCards: WorkshopJobCard[],
  machinery: Machinery[]
): string => {
  const sections: string[] = [];
  
  sections.push('Workshop Job Cards');
  sections.push('='.repeat(50));
  sections.push('');
  
  const headers = [
    'Date',
    'Machinery',
    'Registration',
    'Work Description',
    'Parts Used',
    'Labor Hours',
    'Completed By',
    'Photos',
    'Notes'
  ];
  sections.push(headers.join(','));
  
  jobCards.forEach(card => {
    const machine = machinery.find(m => m.id === card.machineryId);
    const partsUsedText = card.partsUsed
      .map(p => `${p.partName} (${p.quantity}x)`)
      .join('; ');
    
    const row = [
      card.date,
      machine?.name || 'Unknown',
      card.registrationNumber,
      card.workDescription.replace(/"/g, '""'),
      partsUsedText.replace(/"/g, '""'),
      card.laborHours.toString(),
      card.completedBy,
      card.photos?.length.toString() || '0',
      card.notes?.replace(/"/g, '""') || ''
    ].map(field => `"${field}"`).join(',');
    
    sections.push(row);
  });
  
  sections.push('');
  sections.push(`Total Job Cards: ${jobCards.length}`);
  sections.push(`Total Labor Hours: ${jobCards.reduce((sum, card) => sum + card.laborHours, 0).toFixed(1)}`);

  return sections.join('\n');
};

export const generateTestingReportsCSV = (
  testResults: TestResult[]
): string => {
  const sections: string[] = [];
  
  sections.push('Testing Reports');
  sections.push('='.repeat(50));
  sections.push('');
  
  const headers = [
    'Date',
    'Test Name',
    'Material',
    'Moisture Level',
    'Status',
    'Duration (min)',
    'Executed By',
    'Notes'
  ];
  sections.push(headers.join(','));
  
  testResults.forEach(result => {
    const duration = result.duration ? (result.duration / 60).toFixed(1) : '0';
    
    const row = [
      new Date(result.completedAt).toISOString().split('T')[0],
      result.testCaseName,
      result.notes?.includes('Material:') ? result.notes.split('Material:')[1]?.split('\n')[0]?.trim() || '' : '',
      result.moistureLevel || '',
      result.status.charAt(0).toUpperCase() + result.status.slice(1),
      duration,
      result.executedBy,
      result.notes?.replace(/"/g, '""') || ''
    ].map(field => `"${field}"`).join(',');
    
    sections.push(row);
  });
  
  sections.push('');
  sections.push(`Total Tests: ${testResults.length}`);
  sections.push(`Passed: ${testResults.filter(r => r.status === 'passed').length}`);
  sections.push(`Failed: ${testResults.filter(r => r.status === 'failed').length}`);
  sections.push(`Skipped: ${testResults.filter(r => r.status === 'skipped').length}`);

  return sections.join('\n');
};

interface BaleStackMovement {
  stackId: string;
  stackName: string;
  date: string;
  time: string;
  type: 'added' | 'removed';
  count: number;
  user: string;
  notes: string;
}

export const generateBaleStackReportsCSV = (
  movements: BaleStackMovement[]
): string => {
  const sections: string[] = [];
  
  sections.push('Bale Stack Movement Reports');
  sections.push('='.repeat(50));
  sections.push('');
  
  const headers = [
    'Date',
    'Time',
    'Stack Name',
    'Movement Type',
    'Bale Count',
    'User',
    'Notes'
  ];
  sections.push(headers.join(','));
  
  movements.forEach(movement => {
    const row = [
      movement.date,
      movement.time,
      movement.stackName,
      movement.type.charAt(0).toUpperCase() + movement.type.slice(1),
      movement.count.toString(),
      movement.user,
      movement.notes.replace(/"/g, '""')
    ].map(field => `"${field}"`).join(',');
    
    sections.push(row);
  });
  
  sections.push('');
  sections.push(`Total Movements: ${movements.length}`);
  sections.push(`Total Bales Added: ${movements.filter(m => m.type === 'added').reduce((sum, m) => sum + m.count, 0)}`);
  sections.push(`Total Bales Removed: ${movements.filter(m => m.type === 'removed').reduce((sum, m) => sum + m.count, 0)}`);

  return sections.join('\n');
};
