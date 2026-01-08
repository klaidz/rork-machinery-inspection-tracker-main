import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import { useTheme } from '@/context/ThemeContext';
import { DailyCheck } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import MachineryThumbnail from '@/components/MachineryThumbnail';

export default function CheckHistoryScreen() {
  const { colors } = useTheme();
  // We confirmed these are exported correctly in your FleetContext
  const { dailyChecks, machinery } = useFleet(); 
  const [search, setSearch] = useState('');

  const sortedChecks = useMemo(() => {
    if (!dailyChecks) return [];
    
    // Sort by Date (Newest first)
    let data = [...dailyChecks].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Filter logic
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(check => {
        const machine = machinery.find(m => m.id === check.machineryId);
        const reg = machine?.registrationNumber.toLowerCase() || '';
        const name = machine?.name.toLowerCase() || '';
        const driver = check.completedBy.toLowerCase();
        return reg.includes(q) || name.includes(q) || driver.includes(q);
      });
    }

    return data;
  }, [dailyChecks, machinery, search]);

  const renderItem = ({ item }: { item: DailyCheck }) => {
    const machine = machinery.find(m => m.id === item.machineryId);
    if (!machine) return null;

    const isMajor = item.hasMajorDefect;
    const isMinor = item.checkItems.some(i => i.status === 'minor');
    const statusColor = isMajor ? colors.danger : (isMinor ? colors.warning : colors.success);
    const statusIcon = isMajor ? 'alert-circle' : (isMinor ? 'warning' : 'checkmark-circle');
    const statusText = isMajor ? 'FAILED' : (isMinor ? 'WARNING' : 'PASSED');

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
        // We will build the detail view next
        onPress={() => router.push(`/check/${item.id}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.machineInfo}>
            <MachineryThumbnail type={machine.type} photoUrl={machine.photoUrl} size={40} tintColor={colors.tint} />
            <View>
              <Text style={[styles.regText, { color: colors.text }]}>{machine.registrationNumber}</Text>
              <Text style={[styles.modelText, { color: colors.secondary }]}>{machine.name}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name={statusIcon} size={14} color={statusColor} />
            <Text style={[styles.badgeText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.cardFooter}>
          <Text style={[styles.footerText, { color: colors.secondary }]}>
            <Ionicons name="calendar-outline" size={14} /> {new Date(item.date).toLocaleDateString('en-GB')}
          </Text>
          <Text style={[styles.footerText, { color: colors.secondary }]}>
            <Ionicons name="person-outline" size={14} /> {item.completedBy}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Inspection History' }} />
      
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
        <Ionicons name="search" size={20} color={colors.secondary} style={styles.searchIcon} />
        <TextInput 
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search Reg, Driver, or Machine..."
          placeholderTextColor={colors.secondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={sortedChecks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.secondary }]}>No inspections found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  machineInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  regText: { fontSize: 16, fontWeight: '700' },
  modelText: { fontSize: 13 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  footerText: { fontSize: 13 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16 },
});