import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import SignatureDisplay from '@/components/SignatureDisplay';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function CheckDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const { dailyChecks, machinery } = useFleet();

  // Find the specific check from the ID in the URL
  const check = useMemo(() => 
    dailyChecks.find(c => c.id === id), 
  [dailyChecks, id]);

  const machine = useMemo(() => 
    machinery.find(m => m.id === check?.machineryId), 
  [machinery, check]);

  if (!check || !machine) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.secondary }}>Inspection not found.</Text>
      </View>
    );
  }

  const isMajor = check.hasMajorDefect;
  const isMinor = check.checkItems.some(i => i.status === 'minor');
  const statusColor = isMajor ? colors.danger : (isMinor ? colors.warning : colors.success);
  const statusText = isMajor ? 'FAILED - OUT OF USE' : (isMinor ? 'PASSED WITH WARNINGS' : 'PASSED');

  const handleExportPDF = async () => {
    Alert.alert("Coming Soon", "PDF Export will be enabled in the next update.");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: `Report #${check.id.slice(-4)}` }} />

      {/* STATUS BANNER */}
      <View style={[styles.banner, { backgroundColor: statusColor }]}>
        <Ionicons name={isMajor ? "alert-circle" : "checkmark-circle"} size={24} color="white" />
        <Text style={styles.bannerText}>{statusText}</Text>
      </View>

      <View style={styles.content}>
        
        {/* HEADER INFO */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View>
              <Text style={[styles.label, { color: colors.secondary }]}>Vehicle</Text>
              <Text style={[styles.value, { color: colors.text }]}>{machine.registrationNumber}</Text>
              <Text style={[styles.subValue, { color: colors.secondary }]}>{machine.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.label, { color: colors.secondary }]}>Date</Text>
              <Text style={[styles.value, { color: colors.text }]}>{new Date(check.date).toLocaleDateString('en-GB')}</Text>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.row}>
            <View>
              <Text style={[styles.label, { color: colors.secondary }]}>Inspector</Text>
              <Text style={[styles.value, { color: colors.text }]}>{check.completedBy}</Text>
            </View>
            {check.metadata?.mileageStart && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.label, { color: colors.secondary }]}>Mileage</Text>
                <Text style={[styles.value, { color: colors.text }]}>{check.metadata.mileageStart}</Text>
              </View>
            )}
          </View>
        </View>

        {/* DEFECTS LIST (Only show if there are defects) */}
        {(isMajor || isMinor) && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reported Defects</Text>
            {check.checkItems.filter(i => i.status !== 'pass').map((item, index) => (
              <View key={index} style={[styles.defectRow, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                <Ionicons 
                  name={item.status === 'major' ? "close-circle" : "warning"} 
                  size={20} 
                  color={item.status === 'major' ? colors.danger : colors.warning} 
                />
                <Text style={[styles.defectText, { color: colors.text }]}>{item.label}</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: item.status === 'major' ? colors.danger + '20' : colors.warning + '20' }
                ]}>
                  <Text style={[
                    styles.statusText, 
                    { color: item.status === 'major' ? colors.danger : colors.warning }
                  ]}>
                    {item.status?.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* PHOTOS */}
        {check.photos && check.photos.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos Evidence</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {check.photos.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* NOTES */}
        {check.notes ? (
          <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
            <Text style={[styles.noteText, { color: colors.text }]}>{check.notes}</Text>
          </View>
        ) : null}

        {/* SIGNATURE */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Signed Off By</Text>
          <SignatureDisplay signatureData={check.signature} width={300} height={100} />
          <Text style={[styles.timestamp, { color: colors.secondary }]}>
            Signed at {new Date(Number(check.id)).toLocaleTimeString()}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.exportButton, { borderColor: colors.tint }]} 
          onPress={handleExportPDF}
        >
          <Ionicons name="share-outline" size={20} color={colors.tint} />
          <Text style={[styles.exportText, { color: colors.tint }]}>Export Report PDF</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  bannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  content: { padding: 16, gap: 16 },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 12, textTransform: 'uppercase', fontWeight: '600', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '700' },
  subValue: { fontSize: 13 },
  divider: { height: 1, width: '100%' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  defectRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  defectText: { flex: 1, fontSize: 15, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  photoScroll: { flexDirection: 'row', marginTop: 8 },
  photo: { width: 120, height: 120, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
  noteText: { fontSize: 15, lineHeight: 22 },
  timestamp: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
    marginBottom: 40,
  },
  exportText: { fontSize: 16, fontWeight: '600' },
});