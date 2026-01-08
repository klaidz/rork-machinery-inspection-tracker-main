import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useTyreStock } from '@/context/TyreStockContext';
import { useAuth } from '@/context/AuthContext';
import { useTestContext } from '@/context/TestContext'; // ✅ CORRECT IMPORT
import { PieChart } from 'react-native-chart-kit';

type ReportTab = 'checks' | 'tyres' | 'workshop' | 'testing';

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { jobCards: tyreJobCards } = useTyreStock();
  const { getTestCaseStats } = useTestContext(); // ✅ CORRECT HOOK
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<ReportTab>('testing');

  // Calculate Stats
  const testStats = useMemo(() => {
    const stats = getTestCaseStats(); // ✅ Returns { total, active, pass, fail }
    return [
      { name: 'Pass', population: stats.pass, color: '#3B82F6', legendFontColor: colors.text, legendFontSize: 12 },
      { name: 'Fail', population: stats.fail, color: '#EF4444', legendFontColor: colors.text, legendFontSize: 12 },
      { name: 'Active', population: stats.active, color: '#10B981', legendFontColor: colors.text, legendFontSize: 12 },
    ];
  }, [getTestCaseStats, colors.text]);

  const tyreStats = useMemo(() => {
    const completed = (tyreJobCards || []).filter(j => j.status === 'completed').length;
    const pending = (tyreJobCards || []).filter(j => j.status === 'pending').length;
    return [
      { name: 'Done', population: completed, color: 'green', legendFontColor: colors.text, legendFontSize: 12 },
      { name: 'Pending', population: pending, color: 'orange', legendFontColor: colors.text, legendFontSize: 12 },
    ];
  }, [tyreJobCards, colors.text]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Operations Reports</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        {(['testing', 'tyres'] as ReportTab[]).map(tab => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.tint : colors.secondary }]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* TEST REPORTS */}
        {activeTab === 'testing' && (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
             <Text style={[styles.cardTitle, { color: colors.text }]}>Test Coverage</Text>
             <PieChart
               data={testStats}
               width={Dimensions.get('window').width - 80}
               height={220}
               chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
               accessor={"population"}
               backgroundColor={"transparent"}
               paddingLeft={"15"}
               absolute
             />
          </View>
        )}

        {/* TYRE REPORTS */}
        {activeTab === 'tyres' && (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
             <Text style={[styles.cardTitle, { color: colors.text }]}>Tyre Jobs</Text>
             <PieChart
               data={tyreStats}
               width={Dimensions.get('window').width - 80}
               height={220}
               chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
               accessor={"population"}
               backgroundColor={"transparent"}
               paddingLeft={"15"}
               absolute
             />
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 20 },
  tab: { flex: 1, padding: 16, alignItems: 'center' },
  tabText: { fontWeight: 'bold' },
  card: { padding: 20, borderRadius: 12, alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, alignSelf: 'flex-start' }
});