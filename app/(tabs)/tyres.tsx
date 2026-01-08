import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useTyreStock } from '@/context/TyreStockContext';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Icons
import { Disc, AlertCircle, ClipboardList, Plus } from 'lucide-react-native';

export default function TyresScreen() {
  const { colors } = useTheme();
  const { stockItems, usedStockItems, jobCards, isLoading } = useTyreStock();
  const { currentUser: user } = useAuth(); // ✅ Correct Auth Usage

  const [activeTab, setActiveTab] = useState<'stock' | 'jobs'>('stock');
  const [search, setSearch] = useState('');

  // ✅ SAFE STATS CALCULATION
  const stats = useMemo(() => {
    const totalStock = (stockItems || []).reduce((sum, item) => sum + item.quantity, 0);
    const totalUsedStock = (usedStockItems || []).reduce((sum, item) => sum + item.quantity, 0);
    
    // Filter job cards for "This Week"
    const thisWeekJobCards = (jobCards || []).filter((card) => {
      const cardDate = new Date(card.date);
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return cardDate >= oneWeekAgo;
    });

    return {
      totalStock,
      totalUsedStock,
      weeklyJobs: thisWeekJobCards.length
    };
  }, [stockItems, usedStockItems, jobCards]);

  // ✅ PERMISSIONS (Manual Check)
  const allowedRoles = ['admin', 'manager', 'tyre_fitter'];
  const canManageStock = user && allowedRoles.includes(user.role);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading Tyre Data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Tyre Management</Text>
          <Text style={{ color: colors.secondary }}>{stats.totalStock} New in Stock • {stats.weeklyJobs} Jobs this week</Text>
        </View>
        {canManageStock && (
           <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.tint }]}>
             <Plus color="white" size={24} />
           </TouchableOpacity>
        )}
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'stock' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('stock')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'stock' ? colors.tint : colors.secondary }]}>STOCK</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'jobs' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('jobs')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'jobs' ? colors.tint : colors.secondary }]}>JOB CARDS</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* STOCK TAB */}
        {activeTab === 'stock' && (
          <View>
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.row}>
                <Disc color={colors.tint} size={24} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>New Tyres</Text>
              </View>
              {(stockItems || []).map(item => (
                <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                  <View>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.size}</Text>
                    <Text style={{ color: colors.secondary }}>{item.brand}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.tint + '20' }]}>
                    <Text style={{ color: colors.tint, fontWeight: 'bold' }}>x{item.quantity}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.section, { backgroundColor: colors.cardBackground, marginTop: 20 }]}>
               <View style={styles.row}>
                <AlertCircle color="orange" size={24} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Part Worn / Used</Text>
              </View>
              {(usedStockItems || []).map(item => (
                <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
                  <View>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.size}</Text>
                    <Text style={{ color: colors.secondary }}>{item.brand} ({item.condition})</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: 'orange' }]}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>x{item.quantity}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
           <View>
             {(jobCards || []).map(card => (
               <View key={card.id} style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                 <View style={styles.cardHeader}>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>{card.registrationNumber || 'Unknown Vehicle'}</Text>
                    <Text style={{ color: card.status === 'completed' ? 'green' : 'orange' }}>{card.status.toUpperCase()}</Text>
                 </View>
                 <Text style={{ color: colors.secondary, marginTop: 4 }}>{format(new Date(card.date), 'dd MMM yyyy')}</Text>
                 <Text style={{ color: colors.text, marginTop: 8 }}>{card.workDone || 'No details provided'}</Text>
               </View>
             ))}
           </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: { padding: 12, borderRadius: 50 },
  
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, padding: 16, alignItems: 'center' },
  tabText: { fontWeight: 'bold', fontSize: 14 },

  section: { padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },

  card: { padding: 16, borderRadius: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' }
});