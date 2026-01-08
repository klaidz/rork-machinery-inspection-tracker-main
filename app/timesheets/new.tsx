import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, ArrowLeft } from 'lucide-react-native';
import { PdfGenerator } from '../services/PdfGenerator';

export default function NewTimesheetScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [date] = useState(new Date().toISOString().split('T')[0]); 

  const handleSubmit = async () => {
    if (!hours) {
      Alert.alert('Missing Info', 'Please enter total hours worked.');
      return;
    }

    const payrollRef = currentUser?.payrollNumber;
    if (!payrollRef) {
      Alert.alert(
        'Missing Payroll Number', 
        'Please go to your Profile and add your Payroll Number before submitting.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => router.push('/profile') }
        ]
      );
      return;
    }

    try {
      // GENERATE PDF
      await PdfGenerator.generateTimesheet(currentUser, date, hours, notes);
      
      // OPTIONAL: Navigate back after generating
      // router.back();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not generate PDF');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Timesheet</Text>
        <TouchableOpacity onPress={handleSubmit} style={{ padding: 8 }}>
          <Text style={{ color: colors.tint, fontWeight: 'bold' }}>Submit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.label, { color: colors.secondary }]}>Employee</Text>
          <Text style={[styles.value, { color: colors.text }]}>{currentUser?.name}</Text>
          
          <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 8 }} />
          
          <View style={styles.row}>
             <Text style={{ color: colors.secondary }}>Payroll ID:</Text>
             <Text style={{ color: currentUser?.payrollNumber ? colors.text : 'red', fontWeight: 'bold' }}>
               {currentUser?.payrollNumber || 'MISSING'}
             </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.row}>
            <Calendar color={colors.tint} size={20} />
            <Text style={[styles.value, { color: colors.text }]}>{date}</Text>
          </View>
          
          <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 12 }} />

          <Text style={[styles.label, { color: colors.secondary }]}>Hours Worked</Text>
          <View style={styles.inputRow}>
            <Clock color={colors.secondary} size={24} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="0.0"
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
              value={hours}
              onChangeText={setHours}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.label, { color: colors.secondary }]}>Notes / Job Codes</Text>
          <TextInput
            style={[styles.notesInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Describe work done..."
            placeholderTextColor={colors.secondary}
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, gap: 16 },
  card: { padding: 16, borderRadius: 12 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  value: { fontSize: 16, fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  input: { fontSize: 32, fontWeight: 'bold', flex: 1 },
  notesInput: { height: 100, borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 8, textAlignVertical: 'top' }
});