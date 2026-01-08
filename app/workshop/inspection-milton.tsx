import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';

type CheckStatus = 'pass' | 'fail' | null;

interface InspectionItem {
  id: string;
  label: string;
  status: CheckStatus;
}

export default function MiltonWorkshopInspectionScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { currentUser } = useAuth();
  const params = useLocalSearchParams();
  const registrationNumber = params.registration as string;

  const [vehicleReg, setVehicleReg] = useState(registrationNumber || '');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toLocaleDateString());
  const [inspectorName, setInspectorName] = useState(currentUser?.name || '');

  const [basicChecks, setBasicChecks] = useState<InspectionItem[]>([
    { id: '1', label: 'Engine oil level', status: null },
    { id: '2', label: 'Coolant level', status: null },
    { id: '3', label: 'Brake fluid level', status: null },
    { id: '4', label: 'Windscreen washer fluid', status: null },
    { id: '5', label: 'Tyre condition and pressure', status: null },
    { id: '6', label: 'Lights (all)', status: null },
    { id: '7', label: 'Indicators', status: null },
    { id: '8', label: 'Horn', status: null },
    { id: '9', label: 'Wipers and washers', status: null },
    { id: '10', label: 'Mirrors', status: null },
    { id: '11', label: 'Seat belts', status: null },
    { id: '12', label: 'Brakes (service)', status: null },
    { id: '13', label: 'Brakes (parking)', status: null },
    { id: '14', label: 'Steering', status: null },
    { id: '15', label: 'Suspension', status: null },
    { id: '16', label: 'Exhaust system', status: null },
    { id: '17', label: 'Body condition', status: null },
    { id: '18', label: 'Windscreen condition', status: null },
    { id: '19', label: 'Registration plates', status: null },
    { id: '20', label: 'Fire extinguisher', status: null },
  ]);

  const [additionalNotes, setAdditionalNotes] = useState('');
  const [workRequired, setWorkRequired] = useState('');

  const toggleItemStatus = (id: string) => {
    setBasicChecks(basicChecks.map(item => {
      if (item.id === id) {
        const nextStatus: CheckStatus = item.status === null ? 'pass' : item.status === 'pass' ? 'fail' : null;
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleSubmit = () => {
    if (!vehicleReg || !make) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    console.log('Milton Workshop Inspection submitted:', {
      vehicleReg,
      make,
      model,
      mileage,
      basicChecks,
      additionalNotes,
      workRequired,
      inspectorName,
    });

    Alert.alert(
      'Success',
      'Milton Workshop Inspection completed',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const renderCheckItem = (item: InspectionItem) => (
    <View key={item.id} style={styles.checkRow}>
      <Text style={[styles.checkLabel, { color: colors.text }]}>{item.label}</Text>
      <View style={styles.checkButtons}>
        <TouchableOpacity
          style={[
            styles.checkButton,
            { borderColor: colors.border },
            item.status === 'pass' && { backgroundColor: '#10b981' },
          ]}
          onPress={() => toggleItemStatus(item.id)}
        >
          <Text style={[styles.checkButtonText, { color: item.status === 'pass' ? '#fff' : colors.text }]}>
            ✓
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.checkButton,
            { borderColor: colors.border },
            item.status === 'fail' && { backgroundColor: '#ef4444' },
          ]}
          onPress={() => {
            setBasicChecks(basicChecks.map(i => i.id === item.id ? { ...i, status: 'fail' as CheckStatus } : i));
          }}
        >
          <Text style={[styles.checkButtonText, { color: item.status === 'fail' ? '#fff' : colors.text }]}>
            ✗
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Milton Workshop - 8 Wheeler Inspection',
          headerStyle: { backgroundColor: colors.cardBackground },
          headerTintColor: colors.text,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>8 Wheeler Vehicle Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Registration Number *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={vehicleReg}
              onChangeText={setVehicleReg}
              placeholder="Reg no"
              placeholderTextColor={colors.secondary}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Make *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={make}
                onChangeText={setMake}
                placeholder="Make"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Model</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={model}
                onChangeText={setModel}
                placeholder="Model"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Mileage</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={mileage}
                onChangeText={setMileage}
                placeholder="Mileage"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Inspection Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={inspectionDate}
                onChangeText={setInspectionDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Inspector Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={inspectorName}
              onChangeText={setInspectorName}
              placeholder="Inspector name"
              placeholderTextColor={colors.secondary}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Safety Checks</Text>
          {basicChecks.map(item => renderCheckItem(item))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Notes</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            placeholder="Any additional observations..."
            placeholderTextColor={colors.secondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Work Required</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={workRequired}
            onChangeText={setWorkRequired}
            placeholder="List any work required..."
            placeholderTextColor={colors.secondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.tint }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Complete Inspection</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 100,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  checkLabel: {
    fontSize: 13,
    flex: 1,
    paddingRight: 8,
  },
  checkButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  checkButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 45,
    alignItems: 'center',
  },
  checkButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
