import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import MachineryThumbnail from '@/components/MachineryThumbnail';
import * as Location from 'expo-location';

// Helper: Calculate distance between two GPS points (Haversine Formula)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d * 0.621371; // Convert to Miles
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export default function DamageHistoryScreen() {
  const { colors } = useTheme();
  const { damageReports, machinery, loadAllData } = useFleet();
  const { currentUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [myLocation, setMyLocation] = useState<Location.LocationObject | null>(null);

  // 1. Filter reports for this user
  const myReports = damageReports
    .filter(r => r.reportedBy === currentUser?.name)
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

  // 2. Get User's Current Location (to compare with Mechanic)
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setMyLocation(loc);
      }
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (loadAllData) await loadAllData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.tint;
      default: return colors.warning;
    }
  };

  const renderLiveEta = (report: any) => {
    if (report.status !== 'in_progress' || !report.mechanicLocation || !myLocation) return null;

    try {
      const [mechLat, mechLon] = report.mechanicLocation.split(',').map(Number);
      const distMiles = getDistanceFromLatLonInKm(
        myLocation.coords.latitude, myLocation.coords.longitude,
        mechLat, mechLon
      );
      
      // Estimate: Assuming mechanic travels at 30mph average
      const timeHours = distMiles / 30;
      const timeMins = Math.ceil(timeHours * 60);

      return (
        <View style={[styles.etaContainer, { backgroundColor: '#E0F2FE', borderColor: '#0284C7' }]}>
          <View style={styles.etaHeader}>
             <ActivityIndicator size="small" color="#0284C7" />
             <Text style={[styles.etaTitle, { color: '#0284C7' }]}>MECHANIC EN ROUTE</Text>
          </View>
          <Text style={[styles.etaText, { color: '#0369A1' }]}>
             {distMiles.toFixed(1)} miles away
          </Text>
          <Text style={[styles.etaTime, { color: '#0284C7' }]}>
             Arrival in approx {timeMins} mins
          </Text>
        </View>
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ title: 'My Defect Reports' }} />
      
      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
      >
        {myReports.length === 0 ? (
          <View style={styles.emptyState}>
             <Ionicons name="shield-checkmark-outline" size={64} color={colors.success} />
             <Text style={[styles.emptyText, { color: colors.secondary }]}>No defects reported recently.</Text>
          </View>
        ) : (
          myReports.map(report => {
            const machine = machinery.find(m => m.id === report.machineryId);
            const statusColor = getStatusColor(report.status);

            return (
              <View 
                key={report.id} 
                style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              >
                {/* HEADER */}
                <View style={styles.header}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MachineryThumbnail type={machine?.type || 'tractor'} size={40} photoUrl={machine?.photoUrl} tintColor={colors.text} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.reg, { color: colors.text }]}>{machine?.registrationNumber}</Text>
                      <Text style={[styles.date, { color: colors.secondary }]}>
                        {new Date(report.reportedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.badgeText, { color: statusColor }]}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* CONTENT */}
                <View style={styles.content}>
                  <Text style={[styles.desc, { color: colors.text }]}>{report.description}</Text>
                  
                  {report.status === 'in_progress' && report.acceptedBy && (
                     <Text style={[styles.mechanicName, { color: colors.tint }]}>
                       👨‍🔧 Accepted by {report.acceptedBy}
                     </Text>
                  )}

                  {/* LIVE ETA COMPONENT */}
                  {renderLiveEta(report)}
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
  scroll: { padding: 16 },
  emptyState: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16 },
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, alignItems: 'center' },
  reg: { fontSize: 16, fontWeight: '700' },
  date: { fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  divider: { height: 1, width: '100%' },
  content: { padding: 12 },
  desc: { fontSize: 14, marginBottom: 8 },
  mechanicName: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  etaContainer: { padding: 12, borderRadius: 8, borderWidth: 1, marginTop: 8 },
  etaHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  etaTitle: { fontSize: 12, fontWeight: '800' },
  etaText: { fontSize: 18, fontWeight: '700' },
  etaTime: { fontSize: 12, fontWeight: '600' }
});