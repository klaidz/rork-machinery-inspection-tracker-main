import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { Plus, Package, MapPin, ArrowRight } from 'lucide-react-native';

export default function BaleStackListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { baleStacks, fields } = useFleet();

  const getLocationName = (stack: any) => {
    if (stack.fieldId) {
      const field = fields.find(f => f.id === stack.fieldId);
      return field ? `${field.name} (Field)` : 'Unknown Field';
    }
    return 'Yard / Depot';
  };

  const totalStraw = baleStacks.filter(s => s.baleType === 'straw').reduce((sum, s) => sum + s.quantity, 0);
  const totalHay = baleStacks.filter(s => s.baleType === 'hay').reduce((sum, s) => sum + s.quantity, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bale Logistics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
                <Text style={[styles.statNumber, { color: '#d97706' }]}>{totalStraw}</Text>
                <Text style={[styles.statLabel, { color: '#d97706' }]}>Straw Bales</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
                <Text style={[styles.statNumber, { color: '#16a34a' }]}>{totalHay}</Text>
                <Text style={[styles.statLabel, { color: '#16a34a' }]}>Hay Bales</Text>
            </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Stacks</Text>

        {baleStacks.length > 0 ? (
           baleStacks.map(stack => (
             <TouchableOpacity 
                key={stack.id}
                style={[styles.card, { backgroundColor: colors.cardBackground }]}
                onPress={() => router.push(`/balestack/${stack.id}` as any)}
             >
                <View style={styles.row}>
                    <View style={{flexDirection:'row', alignItems:'center', gap: 12}}>
                        <View style={[styles.iconBox, { backgroundColor: '#f3f4f6' }]}>
                            <Package size={24} color="#4b5563" />
                        </View>
                        <View>
                            <Text style={[styles.stackTitle, { color: colors.text }]}>
                                {stack.quantity}x {stack.baleType.toUpperCase()}
                            </Text>
                            <View style={{flexDirection:'row', alignItems:'center', gap: 4}}>
                                <MapPin size={12} color={colors.secondary} />
                                <Text style={{ color: colors.secondary, fontSize: 12 }}>
                                    {getLocationName(stack)}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <ArrowRight size={20} color={colors.border} />
                </View>
             </TouchableOpacity>
           ))
        ) : (
            <View style={styles.emptyState}>
                <Package size={48} color={colors.secondary} style={{ opacity: 0.5 }} />
                <Text style={{ color: colors.secondary, marginTop: 12 }}>No bale stacks recorded.</Text>
            </View>
        )}

      </ScrollView>

      {/* FAB BUTTON - This was likely broken in your version */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/balestack/create' as any)} 
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
  content: { padding: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  stackTitle: { fontSize: 16, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 4
  }
});