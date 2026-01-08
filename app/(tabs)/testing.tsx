import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useTestContext } from '@/context/TestContext'; // ✅ Correct Hook Name
import { Ionicons } from '@expo/vector-icons';
import { TestCase } from '@/types'; 

export default function TestingScreen() {
  const { colors } = useTheme();
  
  // ✅ FIX: Use Plural Names to match the Context
  const { 
    testCases, 
    testSuites, 
    deleteTestCase, 
    duplicateTestCase, 
    runTestCase 
  } = useTestContext();

  const [filter, setFilter] = useState('all');

  const categories = useMemo(() => {
    // ✅ FIX: Safe check for undefined list
    const cats = new Set((testCases || []).map((tc: TestCase) => tc.category));
    return ['all', ...Array.from(cats)];
  }, [testCases]);

  const filteredCases = (testCases || []).filter((tc: TestCase) => 
    filter === 'all' ? true : tc.category === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981'; // Green
      case 'draft': return '#F59E0B';  // Orange
      case 'archived': return '#6B7280'; // Gray
      case 'pass': return '#3B82F6';   // Blue
      case 'fail': return '#EF4444';   // Red
      default: return colors.text;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Test Runner</Text>
      </View>

      {/* FILTER BAR */}
      <View style={{ height: 50 }}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item as string}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setFilter(item as string)}
              style={[
                styles.filterChip, 
                { backgroundColor: filter === item ? colors.tint : colors.cardBackground }
              ]}
            >
              <Text style={{ color: filter === item ? 'white' : colors.text, fontWeight: 'bold' }}>
                {(item as string).toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* LIST */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {filteredCases.map((tc: TestCase) => (
          <View key={tc.id} style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{tc.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tc.status) + '20' }]}>
                <Text style={{ color: getStatusColor(tc.status), fontWeight: 'bold', fontSize: 12 }}>
                  {tc.status.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={{ color: colors.secondary, marginVertical: 8 }}>{tc.description}</Text>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => runTestCase(tc.id, 'pass')} style={styles.actionBtn}>
                <Ionicons name="play" size={18} color="green" />
                <Text style={{ color: 'green', fontWeight: 'bold' }}>Pass</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => runTestCase(tc.id, 'fail')} style={styles.actionBtn}>
                <Ionicons name="close-circle" size={18} color="red" />
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Fail</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => duplicateTestCase(tc.id)} style={styles.actionBtn}>
                <Ionicons name="copy" size={18} color={colors.secondary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteTestCase(tc.id)} style={styles.actionBtn}>
                <Ionicons name="trash" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '800' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 12, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 }
});