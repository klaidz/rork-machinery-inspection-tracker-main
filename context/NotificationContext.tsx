import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { DailyCheck, User } from '@/types';


// Configure how notifications appear when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // <--- Add this
    shouldShowList: true,   // <--- Add this
  }),
});
interface NotificationContextType {
  notifyDailyCheck: (
    check: DailyCheck, 
    machineInfo: { registrationNumber: string; type: string },
    users: User[]
  ) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {

  const requestPermissions = async () => {
    if (Platform.OS === 'web') return false;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  };

  const sendToPowerAutomate = async (payload: any) => {
    try {
      // TODO: Replace with your actual Power Automate / Logic App Webhook URL
      // const WEBHOOK_URL = 'https://prod-12.uksouth.logic.azure.com:443/workflows/...';
      
      // await fetch(WEBHOOK_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      
      console.log('[Power Automate] Mock trigger sent:', payload);
    } catch (error) {
      console.error('[Power Automate] Failed to trigger workflow:', error);
    }
  };

  const notifyDailyCheck = async (
    check: DailyCheck, 
    machineInfo: { registrationNumber: string; type: string },
    users: User[]
  ) => {
    // 1. If everything is fine, do nothing (or just log it)
    if (!check.hasMajorDefect) {
      console.log('[Notification] Check passed, no alerts needed.');
      return;
    }

    // 2. Identify who needs to know (Workshop Managers)
    // Filter users who have the role 'manager' or 'admin'
    // const recipients = users.filter(u => u.role === 'manager' || u.role === 'admin');

    console.log(`[Notification] 🚨 MAJOR DEFECT on ${machineInfo.registrationNumber}`);

    // 3. Trigger Local Notification (Feedback for the Driver)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 Vehicle Marked Out of Use',
        body: `${machineInfo.registrationNumber} reported with major defects. Workshop has been notified.`,
        data: { checkId: check.id },
      },
      trigger: null, // Send immediately
    });

    // 4. Trigger Backend / Power Platform Workflow
    // This payload matches what a Power Automate "When a HTTP request is received" trigger expects
    const workflowPayload = {
      event: 'MAJOR_DEFECT_REPORTED',
      timestamp: new Date().toISOString(),
      vehicle: {
        reg: machineInfo.registrationNumber,
        type: machineInfo.type,
      },
      driver: {
        name: check.completedBy,
      },
      defects: check.checkItems
        .filter(item => item.status === 'major')
        .map(item => item.label),
      notes: check.notes,
    };

    await sendToPowerAutomate(workflowPayload);
    
    // Optional: Show an in-app alert if permission wasn't granted for push
    // Alert.alert("Workshop Notified", "An email has been sent to the maintenance team.");
  };

  return (
    <NotificationContext.Provider value={{ notifyDailyCheck, requestPermissions }}>
      {children}
    </NotificationContext.Provider>
  );
};