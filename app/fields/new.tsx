import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, XCircle, Save, ArrowLeft } from 'lucide-react-native';
import { CheckItem } from '@/types';

// CORRECT IMPORT PATH: Go up one level (../) to find 'services'
import { PdfGenerator } from '../services/PdfGenerator'; 

// Standard list of checks
const STANDARD_CHECKS = [
  'Engine Oil Level',
  'Coolant Level',
  'Hydraulic Oil Level',
  'Brake Fluid',
  'Tyre Condition & Pressure',
  'Lights & Indicators',
  'Mirrors & Glass',
  'Wipers & Washers',
  'Horn',
  'Beacon',
  'Pins & Bushes',
  'Grease Points'
];

export default function NewCheckScreen() {
  const router = useRouter();
  const { machineryId } = useLocalSearchParams();
  const { colors } = useTheme();
  const { machinery, addCheck, updateMachineryStatus } = useFleet();
  const { currentUser } = useAuth();

  const machine = machinery.find(m => m.id === machineryId);
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [comments, setComments] = useState('');

  // Initialize checks
  useEffect(() => {
    if (machine) {
      const initialChecks: CheckItem[] = STANDARD_CHECKS.map((label, index) => ({
        id: `c_${Date.now()}_${index}`,
        machineryId: machineryId as string,
        label,
        status: 'pass',
        notes: ''
      }));
      setChecks(initialChecks);
    }
  }, [machineryId, machine]);

  if (!machine) return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{color: colors.text, padding: 20}}>Machine not found</Text>
    </SafeAreaView>
  );

  const toggleStatus = (index: number) => {
    const newChecks = [...checks];
    const current = newChecks[index].status;
    newChecks[index].status = current === 'pass' ? 'fail' : 'pass';
    setChecks(newChecks);
  };

  const handleSubmit = async () => {
    const failedItems = checks.filter(c => c.status === 'fail');
    const isPass = failedItems.length === 0;

    if (!isPass) {
      Alert.alert(
        'Defects Found',
        `You have marked ${failedItems.length} items as FAILED. The machine status will be set to Maintenance.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit & Report', onPress: processSubmission }
        ]
      );
    } else {
      processSubmission();
    }
  };

  const processSubmission = async () => {
    const isPass = checks.every(c => c.status === 'pass');
    
    // 1. Save Checks
    checks.forEach(check => {
        addCheck(check);
    });

    // 2. Update Status if failed
    if (!isPass) {
        await updateMachineryStatus(machine.id, 'maintenance');
    }

    // 3. GENERATE PDF
    try {
        await PdfGenerator.generateCheckReport(machine, currentUser, checks, isPass ? 'passed' : 'failed');
    } catch (error) {
        console.log('PDF Error:', error);
        Alert.alert('Error', 'Could not generate PDF');
    }

    // 4. Close
    setTimeout(() => {
        router.back();
    }, 500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Daily Check</Text>
            <Text style={{ color: colors.secondary, fontSize: 12 }}>{machine.name}</Text>
        </View>
        <TouchableOpacity onPress={handleSubmit} style={{ padding: 8 }}>
          <Text style={{ color: colors.tint, fontWeight: 'bold' }}>Finish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* INSTRUCTIONS */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
           <Text style={{ color: colors.text }}>
             Tap items to toggle between <Text style={{color:'green', fontWeight:'bold'}}>PASS</Text> and <Text style={{color:'red', fontWeight:'bold'}}>FAIL</Text>.
           </Text>
        </View>

        {/* CHECK LIST */}
        {checks.map((item, index) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.checkRow, { backgroundColor: colors.cardBackground }]}
            onPress={() => toggleStatus(index)}
          >
            <Text style={[styles.checkLabel, { color: colors.text }]}>{item.label}</Text>
            
            {item.status === 'pass' ? (
                <CheckCircle color="green" size={28} />
            ) : (
                <XCircle color="red" size={28} />
            )}
          </TouchableOpacity>
        ))}

        {/* COMMENTS */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, marginTop: 20 }]}>
            <Text style={[styles.label, { color: colors.secondary }]}>General Comments</Text>
            <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Any other notes..."
                placeholderTextColor={colors.secondary}
                value={comments}
                onChangeText={setComments}
                multiline
            />
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
        >
            <Save color="white" size={20} />
            <Text style={styles.submitText}>SUBMIT CHECK</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12 },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8 },
  checkLabel: { fontSize: 16, fontWeight: '500' },
  label: { marginBottom: 8, fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, height: 80, textAlignVertical: 'top' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 12, marginTop: 20, gap: 10 },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});