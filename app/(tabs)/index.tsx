import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import Colors from '@/constants/colors';
import { 
  AlertTriangle, 
  CheckCircle, 
  Truck, 
  Map as MapIcon, 
  FileText, 
  Users, 
  Activity 
} from 'lucide-react-native';

// 🖥️ WEB DASHBOARD COMPONENT
const WebDashboard = () => {
  const { machinery, dailyChecks, transportJobs } = useFleet();

  const activeFleet = machinery.filter(m => m.status === 'active').length;
  const issues = machinery.filter(m => m.status === 'broken' || m.status === 'maintenance').length;
  const todayChecks = dailyChecks.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).length;
  const pendingJobs = transportJobs.filter(j => j.status === 'pending').length;

  return (
    <ScrollView style={styles.webContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Operations Control Centre</Text>
        <Text style={styles.subtitle}>{new Date().toDateString()} • Littleport Depot</Text>
      </View>

      {/* STATS ROW */}
      <View style={styles.statsGrid}>
        <StatCard label="Active Fleet" value={activeFleet} icon={<Truck color="white" />} color="#2E7D32" />
        <StatCard label="Fleet Issues" value={issues} icon={<AlertTriangle color="white" />} color="#C62828" />
        <StatCard label="Checks Today" value={todayChecks} icon={<CheckCircle color="white" />} color="#1565C0" />
        <StatCard label="Pending Jobs" value={pendingJobs} icon={<FileText color="white" />} color="#F9A825" />
      </View>

      <View style={styles.mainContentGrid}>
        {/* RECENT ACTIVITY */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Activity size={20} color="#333" />
            <Text style={styles.panelTitle}>Recent Activity</Text>
          </View>
          {dailyChecks.slice(0, 5).map((check) => (
            <TouchableOpacity 
              key={check.id} 
              style={styles.listItem}
              // 👇 SAFE LINKING
              onPress={() => { /* Add navigation later if needed */ }}
            >
              <View>
                <Text style={{fontWeight: 'bold'}}>{check.machineryName}</Text>
                <Text style={{color: '#666', fontSize: 12}}>{check.driverName}</Text>
              </View>
              <View style={{
                backgroundColor: check.defectsFound ? '#FFEBEE' : '#E8F5E9',
                padding: 5, borderRadius: 5
              }}>
                <Text style={{
                  color: check.defectsFound ? '#C62828' : '#2E7D32', 
                  fontWeight: 'bold', fontSize: 12
                }}>
                  {check.defectsFound ? 'DEFECT' : 'PASS'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {dailyChecks.length === 0 && <Text style={{color:'#999', padding:20}}>No checks today.</Text>}
        </View>

        {/* ACTIONS */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <MapIcon size={20} color="#333" />
            <Text style={styles.panelTitle}>Actions</Text>
          </View>
          
          <View style={styles.actionGrid}>
             {/* 👇 NEW CHECK BUTTON - WEB SAFE STYLE */}
             <Link href="/check/new" asChild>
              <TouchableOpacity style={{ ...styles.actionButton, borderColor: '#2E7D32', backgroundColor: '#E8F5E9' }}>
                <CheckCircle size={24} color="#2E7D32" />
                <Text style={{ ...styles.actionText, color: '#2E7D32' }}>New Check</Text>
              </TouchableOpacity>
            </Link>

             <Link href="/machinery" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <Truck size={24} color={Colors.light.tint} />
                <Text style={styles.actionText}>Fleet List</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/jobcard/completed" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <FileText size={24} color={Colors.light.tint} />
                <Text style={styles.actionText}>Invoices</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/departments" asChild>
              <TouchableOpacity style={styles.actionButton}>
                <Users size={24} color={Colors.light.tint} />
                <Text style={styles.actionText}>Staff</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// 📱 MOBILE HOME (Simpler version)
const MobileHome = () => {
  const router = useRouter();
  return (
    <ScrollView style={styles.mobileContainer}>
      <Text style={styles.mobileTitle}>Good Morning</Text>
      
      <TouchableOpacity 
        style={{ ...styles.bigButton, backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }}
        onPress={() => router.push('/check/new')}
      >
        <CheckCircle size={40} color="#2E7D32" />
        <Text style={{ ...styles.bigButtonText, color: '#2E7D32' }}>Start Check</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ ...styles.bigButton, backgroundColor: '#E3F2FD', borderColor: '#1565C0' }}
        onPress={() => router.push('/jobcard')}
      >
        <FileText size={40} color="#1565C0" />
        <Text style={{ ...styles.bigButtonText, color: '#1565C0' }}>My Jobs</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ ...styles.bigButton, backgroundColor: '#FFF3E0', borderColor: '#EF6C00' }}
        onPress={() => router.push('/near-miss/new')}
      >
        <AlertTriangle size={40} color="#EF6C00" />
        <Text style={{ ...styles.bigButtonText, color: '#EF6C00' }}>Report Hazard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default function HomeScreen() {
  const isWeb = Platform.OS === 'web';
  return isWeb ? <WebDashboard /> : <MobileHome />;
}

// 👇 SAFE STATCARD (No Array Styles)
const StatCard = ({ label, value, icon, color }: any) => (
  <View style={{ ...styles.statCard, borderTopColor: color }}>
    <View style={{ ...styles.iconBox, backgroundColor: color }}>{icon}</View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  webContainer: { flex: 1, backgroundColor: '#f4f6f8', padding: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  
  statsGrid: { flexDirection: 'row', gap: 20, marginBottom: 30, flexWrap: 'wrap' },
  statCard: { 
    flex: 1, minWidth: 200, backgroundColor: 'white', padding: 20, 
    borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 15,
    borderTopWidth: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  iconBox: { padding: 10, borderRadius: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 14, color: '#666' },

  mainContentGrid: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  panel: { flex: 1, minWidth: 300, backgroundColor: 'white', borderRadius: 12, padding: 20 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  panelTitle: { fontSize: 18, fontWeight: 'bold' },
  
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  
  actionGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  actionButton: { 
    width: 100, height: 100, backgroundColor: '#f8f9fa', 
    borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1, borderColor: '#eee'
  },
  actionText: { fontSize: 12, fontWeight: '600', color: '#333' },

  mobileContainer: { flex: 1, backgroundColor: 'white', padding: 20 },
  mobileTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, marginTop: 20 },
  bigButton: {
    padding: 25, borderRadius: 15, marginBottom: 20, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: 10
  },
  bigButtonText: { fontSize: 22, fontWeight: 'bold' }
});