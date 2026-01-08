import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter, Link } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import Colors from '@/constants/colors';
import { MapPin, ArrowRight, CheckCircle } from 'lucide-react-native';

export default function JobCardListScreen() {
  const router = useRouter();
  const { transportJobs } = useFleet();

  // Filter for Active Jobs (Pending or In-Progress)
  const activeJobs = transportJobs.filter(j => j.status !== 'completed');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f4f6f8' }}>
      <Stack.Screen options={{ title: 'My Active Jobs' }} />

      <View style={{ padding: 20 }}>
        {/* Link to Completed History */}
        <Link href="/jobcard/completed" asChild>
          <TouchableOpacity style={styles.historyButton}>
            <CheckCircle size={20} color={Colors.light.tint} />
            <Text style={styles.historyText}>View Completed History</Text>
          </TouchableOpacity>
        </Link>

        <Text style={styles.header}>Today's Schedule</Text>

        {activeJobs.map(job => (
          <TouchableOpacity 
            key={job.id}
            onPress={() => router.push(`/jobcard/${job.id}`)} // Goes to details page
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.customer}>{job.customerName}</Text>
              <View style={[styles.badge, { backgroundColor: job.status === 'in-progress' ? '#E3F2FD' : '#FFF3E0' }]}>
                <Text style={{ 
                  color: job.status === 'in-progress' ? '#1565C0' : '#EF6C00',
                  fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' 
                }}>
                  {job.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.row}>
              <MapPin size={16} color="#666" />
              <Text style={styles.location}>{job.pickupLocation} ➡️ {job.dropoffLocation}</Text>
            </View>
            
            <View style={styles.footer}>
              <Text style={{ color: '#999', fontSize: 12 }}>ID: {job.id}</Text>
              <ArrowRight size={20} color={Colors.light.tint} />
            </View>
          </TouchableOpacity>
        ))}

        {activeJobs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 18, color: '#999' }}>No active jobs assigned.</Text>
            <Text style={{ color: '#ccc' }}>Enjoy your break! ☕</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  historyButton: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 20,
    borderWidth: 1, borderColor: '#eee' 
  },
  historyText: { marginLeft: 10, color: Colors.light.tint, fontWeight: '600' },
  card: { 
    backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  customer: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  location: { marginLeft: 8, color: '#555', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  emptyState: { alignItems: 'center', marginTop: 50, gap: 10 }
});