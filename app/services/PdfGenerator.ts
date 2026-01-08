import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

// Standard CSS for all your reports
const globalStyles = `
  body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #444; padding-bottom: 10px; }
  .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
  .title { font-size: 18px; font-weight: bold; text-align: right; }
  .section { margin-bottom: 15px; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
  .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
  .value { font-size: 16px; font-weight: bold; margin-top: 4px; }
  .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { text-align: left; background: #f3f4f6; padding: 8px; font-size: 12px; }
  td { border-bottom: 1px solid #eee; padding: 8px; font-size: 14px; }
  .status-pass { color: green; font-weight: bold; }
  .status-fail { color: red; font-weight: bold; }
`;

export const PdfGenerator = {

  // --- 1. GENERATE TIMESHEET PDF ---
  generateTimesheet: async (user: any, date: string, hours: string, notes: string) => {
    const html = `
      <html>
        <head>
          <style>${globalStyles}</style>
        </head>
        <body>
          <div class="header">
            <div class="logo">RORK FLEET</div>
            <div class="title">TIMESHEET RECORD</div>
          </div>

          <div class="section">
            <div class="row">
              <div>
                <div class="label">Employee Name</div>
                <div class="value">${user?.name || 'Unknown'}</div>
              </div>
              <div>
                <div class="label">Payroll Number</div>
                <div class="value">${user?.payrollNumber || 'N/A'}</div>
              </div>
            </div>
            <div class="row">
              <div>
                <div class="label">Date</div>
                <div class="value">${date}</div>
              </div>
              <div>
                <div class="label">Total Hours</div>
                <div class="value">${hours} Hrs</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="label">Job Notes / Codes</div>
            <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${notes || 'No notes provided.'}</div>
          </div>

          <div class="footer">
            Generated via Rork Machinery Tracker • ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;
    await printAndShare(html);
  },

  // --- 2. GENERATE DAILY CHECK PDF ---
  generateCheckReport: async (machine: any, user: any, checks: any[], status: string) => {
    const checkRows = checks.map(c => `
      <tr>
        <td>${c.label}</td>
        <td class="${c.status === 'pass' ? 'status-pass' : 'status-fail'}">
          ${c.status.toUpperCase()}
        </td>
        <td>${c.notes || '-'}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head><style>${globalStyles}</style></head>
        <body>
          <div class="header">
            <div class="logo">RORK FLEET</div>
            <div class="title">DAILY INSPECTION</div>
          </div>

          <div class="section">
             <div class="row">
               <div><div class="label">Machine</div><div class="value">${machine.name}</div></div>
               <div><div class="label">Registration</div><div class="value">${machine.registrationNumber}</div></div>
             </div>
             <div class="row">
               <div><div class="label">Operator</div><div class="value">${user?.name}</div></div>
               <div><div class="label">Result</div><div class="value" style="color:${status === 'passed' ? 'green' : 'red'}">${status.toUpperCase()}</div></div>
             </div>
          </div>

          <table>
            <thead><tr><th>Check Item</th><th>Status</th><th>Notes</th></tr></thead>
            <tbody>${checkRows}</tbody>
          </table>

          <div class="footer">Safety Check Record • ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `;
    await printAndShare(html);
  }
};

// --- HELPER TO PRINT/SHARE ---
const printAndShare = async (html: string) => {
  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } else {
      Alert.alert('PDF Generated', 'PDF support is limited on web.');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to generate PDF');
    console.error(error);
  }
};