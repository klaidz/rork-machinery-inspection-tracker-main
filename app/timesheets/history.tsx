import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Plus, Clock, Calendar } from 'lucide-react-native';
import { Timesheet } from '@/types'; 

export default function TimesheetHistoryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { currentUser } = useAuth();

  // Mock data - In the future, this will come from useFleet() or useTimesheets()
  const [history, setHistory] = useState<Timesheet[]>([
    { id: 't1', userId: 'u1', date: '2026-01-05', hours: 8.5, status: 'approved', notes: 'Harvesting Field A' },
    { id: 't2', userId: 'u1', date: '2026-01-04', hours: 9.0, status: 'submitted', notes: 'Maintenance on JD 6155' },
    { id: 't3', userId: 'u1', date: '2026-01-03', hours: 7.5, status: 'draft', notes: 'Yard work' },
  ]);

  const renderItem = ({ item }: { item: Timesheet }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.row}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Calendar size={16} color={colors.secondary} />
          <Text style={[styles.date, { color: colors.text }]}>
            {item.date}
          </Text>
        </View>
        <View style={[
          styles.badge, 
          { backgroundColor: item.status === 'approved' ? '#dcfce7' : item.status === 'submitted' ? '#fff7ed' : '#f3f4f6' }
        ]}>
          <Text style={{ 
            fontSize: 12, fontWeight: 'bold',
            color: item.status === 'approved' ? 'green' : item.status === 'submitted' ? 'orange' : 'gray' 
          }}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Clock size={16} color={colors.tint} />
          <Text style={[styles.hours, { color: colors.text }]}>{item.hours} hrs</Text>
        </View>
        {item.notes && (
          <Text style={{ color: colors.secondary, fontSize: 12, flex: 1, textAlign: 'right' }} numberOfLines={1}>
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Timesheet History</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Clock size={48} color={colors.secondary} />
            <Text style={{ color: colors.secondary, marginTop: 12 }}>No timesheets found.</Text>
          </View>
        }
      />

      {/* THE FIX IS HERE: We added 'as any' to bypass the strict type check */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/timesheets/new' as any)}
      >
        <Plus color="white" size={24} />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  listContent: { padding: 20 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 16, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  hours: { fontSize: 18, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  }
});