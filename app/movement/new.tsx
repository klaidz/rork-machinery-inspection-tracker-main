import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import Colors from '@/constants/colors';
import { MovementLog, Machinery } from '@/types';
import MachineryThumbnail from '@/components/MachineryThumbnail';

export default function NewMovementScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { machinery, addMovementLog } = useFleet();

  const [selectedMachinery, setSelectedMachinery] = useState<Machinery | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [purpose, setPurpose] = useState('');
  const [hoursUsed, setHoursUsed] = useState('');
  const [fuelUsed, setFuelUsed] = useState('');
  const [operatedBy, setOperatedBy] = useState('');

  const handleSelectMachinery = (machine: Machinery) => {
    setSelectedMachinery(machine);
  };

  const handleSubmit = async () => {
    if (!selectedMachinery) {
      Alert.alert('Error', 'Please select machinery');
      return;
    }

    if (!startTime.trim() || !endTime.trim()) {
      Alert.alert('Error', 'Please enter start and end times');
      return;
    }

    if (!startLocation.trim() || !endLocation.trim()) {
      Alert.alert('Error', 'Please enter start and end locations');
      return;
    }

    if (!purpose.trim()) {
      Alert.alert('Error', 'Please enter purpose of movement');
      return;
    }

    if (!hoursUsed.trim() || isNaN(parseFloat(hoursUsed))) {
      Alert.alert('Error', 'Please enter valid hours used');
      return;
    }

    if (!operatedBy.trim()) {
      Alert.alert('Error', 'Please enter operator name');
      return;
    }

    const newLog: MovementLog = {
      id: Date.now().toString(),
      machineryId: selectedMachinery.id,
      date: new Date().toISOString().split('T')[0],
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      startLocation: startLocation.trim(),
      endLocation: endLocation.trim(),
      purpose: purpose.trim(),
      hoursUsed: parseFloat(hoursUsed),
      fuelUsed: fuelUsed.trim() ? parseFloat(fuelUsed) : undefined,
      operatedBy: operatedBy.trim(),
    };

    await addMovementLog(newLog);
    Alert.alert('Success', 'Movement log recorded', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (!selectedMachinery) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Movement Log' }} />
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Select Machinery</Text>
          <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
            Choose the equipment that was moved
          </Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {machinery.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.emptyText, { color: colors.text }]}>No machinery available</Text>
              <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
                Add machinery first before creating logs
              </Text>
            </View>
          ) : (
            machinery.map((machine) => (
              <TouchableOpacity
                key={machine.id}
                style={[styles.machineryCard, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleSelectMachinery(machine)}
              >
                <MachineryThumbnail type={machine.type} photoUrl={machine.photoUrl} size={56} tintColor={colors.tint} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.machineryName, { color: colors.text }]}>{machine.name}</Text>
                  <Text style={[styles.machineryType, { color: colors.secondary }]}>
                    {machine.model} • {machine.registrationNumber}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen options={{ title: `Movement: ${selectedMachinery.name}` }} />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        keyboardDismissMode="on-drag"
      >
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Time</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.secondary }]}>Start Time *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="e.g., 08:00"
                placeholderTextColor={colors.secondary}
                value={startTime}
                onChangeText={setStartTime}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.secondary }]}>End Time *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="e.g., 16:00"
                placeholderTextColor={colors.secondary}
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Locations</Text>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>From *</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Starting location"
              placeholderTextColor={colors.secondary}
              value={startLocation}
              onChangeText={setStartLocation}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>To *</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Destination"
              placeholderTextColor={colors.secondary}
              value={endLocation}
              onChangeText={setEndLocation}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Purpose *</Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
            ]}
            placeholder="What was the purpose of this movement?"
            placeholderTextColor={colors.secondary}
            value={purpose}
            onChangeText={setPurpose}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Usage Details</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.secondary }]}>Hours Used *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="e.g., 8.5"
                placeholderTextColor={colors.secondary}
                value={hoursUsed}
                onChangeText={setHoursUsed}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.secondary }]}>Fuel Used (L)</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Optional"
                placeholderTextColor={colors.secondary}
                value={fuelUsed}
                onChangeText={setFuelUsed}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Operated By *</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
            ]}
            placeholder="Operator name"
            placeholderTextColor={colors.secondary}
            value={operatedBy}
            onChangeText={setOperatedBy}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.tint }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Record Movement</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  machineryCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
    alignItems: 'center',
  },
  machineryName: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  machineryType: {
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
    gap: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 80,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
