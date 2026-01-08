import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useWorkshopParts } from '@/context/WorkshopPartsContext';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Package, TrendingUp, AlertCircle, CheckCircle2, Clock, ClipboardList, Plus } from 'lucide-react-native';

export default function WorkshopPartsScreen() {
  const { colors } = useTheme();
  const { stockItems, jobCards, isLoading } = useWorkshopParts();
  const { currentUser: user } = useAuth(); 

  const stats = useMemo(() => {
    const totalParts = (stockItems || []).reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = (stockItems || []).filter(
      (item) => item.reorderLevel && item.quantity <= item.reorderLevel
    ).length;
    return { totalParts, lowStockItems };
  }, [stockItems]);

  const recentJobCards = useMemo(() => {
    return (jobCards || [])
      .filter(c => c.status === 'completed')
      // ✅ FIX: Handle undefined dates safely by falling back to 0
      .sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [jobCards]);

  // Roles Check
  const allowedRoles = ['admin', 'manager', 'mechanic'];
  const canManageStock = user && allowedRoles.includes(user.role);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading Workshop Data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Workshop</Text>
          <Text style={{ color: colors.secondary }}>{stats.totalParts} Parts • {stats.lowStockItems} Low Stock</Text>
        </View>
        {canManageStock && (
           <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.tint }]}>
             <Plus color="white" size={24} />
           </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* RECENT ACTIVITY */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Jobs</Text>
        {recentJobCards.map(card => (
          <View key={card.id} style={[styles.card, { backgroundColor: colors.cardBackground }]}>
             <View style={styles.cardHeader}>
               <Text style={{ color: colors.text, fontWeight: 'bold' }}>{card.registrationNumber || 'Unknown'}</Text>
               <CheckCircle2 size={16} color="green" />
             </View>
             <Text style={{ color: colors.secondary }}>{card.workDescription}</Text>
          </View>
        ))}

        {/* INVENTORY PREVIEW */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>Inventory</Text>
        {(stockItems || []).map(item => (
          <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
             <View>
               <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.name}</Text>
               <Text style={{ color: colors.secondary }}>{item.partNumber}</Text>
             </View>
             <View style={[styles.badge, { backgroundColor: item.quantity <= item.reorderLevel ? 'red' : colors.tint }]}>
               <Text style={{ color: 'white', fontWeight: 'bold' }}>x{item.quantity}</Text>
             </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold' },
  addButton: { padding: 12, borderRadius: 50 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 16, borderRadius: 12, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }
});