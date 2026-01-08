import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import MachineryThumbnail from '@/components/MachineryThumbnail';
import { DamageReport } from '@/types';
import * as Location from 'expo-location';

export default function TyreDashboardScreen() {
  const { colors } = useTheme();
  const { getVisibleDamageReports, machinery, updateDamageReport, loadAllData } = useFleet();
  const { currentUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  // GPS Subscription Ref
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // 1. Get ONLY Tyre Jobs (The Context handles the filtering based on role 'tyre_fitter')
  const jobs = getVisibleDamageReports('tyre_fitter', currentUser?.id || '');

  const sortedJobs = jobs.sort((a, b) => {
    const statusOrder = { pending: 1, in_progress: 2, completed: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Cleanup GPS on unmount
  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (loadAllData) await loadAllData();
    setRefreshing(false);
  };

  // --- LIVE TRACKING LOGIC ---
  const startLiveTracking = async (jobId: string) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Cannot track location.");
      return;
    }

    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 50 },
      async (location) => {
        const coords = `${location.coords.latitude},${location.coords.longitude}`;
        console.log("📍 Tyre Fitter Location:", coords);
        await updateDamageReport(jobId, { mechanicLocation: coords });
      }
    );
  };

  const stopLiveTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };
  // ---------------------------------------------

  const handleAcceptJob = async (job: DamageReport) => {
    Alert.alert("Dispatch", "Accept this tyre job? Driver will see your ETA.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Accept & Go", 
        onPress: async () => {
          await updateDamageReport(job.id, {
            status: 'in_progress',
            acceptedBy: currentUser?.name,
            acceptedAt: new Date().toISOString(),
            assignedTo: currentUser?.id
          });
          startLiveTracking(job.id);
        } 
      }
    ]);
  };

  const handleCompleteJob = async (job: DamageReport) => {
    Alert.alert("Job Complete", "Is the tyre changed/repaired?", [
      { text: "No", style: "cancel" },
      { 
        text: "Yes, Finished", 
        onPress: async () => {
          stopLiveTracking();
          await updateDamageReport(job.id, {
            status: 'completed',
            completedAt: new Date().toISOString()
          });
        } 
      }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tyre Dispatch</Text>
          <Text style={{ color: colors.secondary }}>{jobs.length} Active Jobs</Text>
        </View>
        
        {/* ACTION BUTTONS */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
           {/* New Stock */}
           <TouchableOpacity onPress={() => router.push('/tyres/stock' as any)}>
             <Ionicons name="cube-outline" size={32} color={colors.tint} />
           </TouchableOpacity>
           
           {/* Used Stock */}
           <TouchableOpacity onPress={() => router.push('/tyres/used-stock' as any)}>
             <Ionicons name="repeat-outline" size={32} color="#F59E0B" />
           </TouchableOpacity>

           {/* Profile */}
           <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as any)}>
             <Ionicons name="person-circle" size={32} color={colors.tint} />
           </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
      >
        {sortedJobs.length === 0 ? (
          <View style={styles.emptyState}>
             <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} />
             <Text style={[styles.emptyText, { color: colors.secondary }]}>No tyre defects reported.</Text>
          </View>
        ) : (
          sortedJobs.map(job => {
            const machine = machinery.find(m => m.id === job.machineryId);
            const isMyJob = job.assignedTo === currentUser?.id;
            const isInProgress = job.status === 'in_progress';

            return (
              <View 
                key={job.id} 
                style={[
                  styles.card, 
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  isInProgress && { borderColor: colors.tint, borderWidth: 2 }
                ]}
              >
                {/* PRIORITY STRIP */}
                <View style={[styles.priorityStrip, { 
                  backgroundColor: job.priority === 'critical' ? colors.danger : 
                                 job.priority === 'high' ? '#F59E0B' : colors.success 
                }]} />

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <MachineryThumbnail type={machine?.type || 'tractor'} size={48} photoUrl={machine?.photoUrl} tintColor={colors.text} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                       <Text style={[styles.reg, { color: colors.text }]}>{machine?.registrationNumber}</Text>
                       <Text style={[styles.model, { color: colors.secondary }]}>{machine?.name} • {machine?.model}</Text>
                    </View>
                    {isInProgress && (
                      <View style={{ alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={colors.danger} />
                        <Text style={{ fontSize: 10, color: colors.danger, fontWeight: '700' }}>TRACKING</Text>
                      </View>
                    )}
                  </View>

                  <View style={[styles.details, { backgroundColor: colors.background }]}>
                    <Text style={[styles.desc, { color: colors.text }]}>
                      <Text style={{ fontWeight: '700' }}>Issue: </Text>
                      {job.description}
                    </Text>
                    {job.location && (
                      <View style={styles.locRow}>
                        <Ionicons name="navigate" size={14} color={colors.tint} />
                        <Text style={{ color: colors.tint, fontSize: 12, fontWeight: '600' }}>Location Attached</Text>
                      </View>
                    )}
                  </View>

                  {/* CARD BUTTONS */}
                  <View style={styles.actions}>
                    {job.status === 'pending' && (
                      <TouchableOpacity 
                        style={[styles.btn, { backgroundColor: colors.tint }]}
                        onPress={() => handleAcceptJob(job)}
                      >
                        <Ionicons name="navigate-circle" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.btnText}>ACCEPT & TRACK</Text>
                      </TouchableOpacity>
                    )}

                    {isInProgress && isMyJob && (
                      <TouchableOpacity 
                        style={[styles.btn, { backgroundColor: colors.success }]}
                        onPress={() => handleCompleteJob(job)}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.btnText}>JOB DONE</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  scroll: { padding: 16 },
  emptyState: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16 },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  priorityStrip: { height: 6, width: '100%' },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  reg: { fontSize: 20, fontWeight: '800' },
  model: { fontSize: 14 },
  details: { padding: 12, borderRadius: 8, marginBottom: 16 },
  desc: { fontSize: 16, marginBottom: 8 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: 'white', fontWeight: '800', fontSize: 14 },
});