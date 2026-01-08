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
import { router, Stack } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';
import { LandWork } from '@/types';
import SearchableSelectModal, { SelectableItem } from '@/components/SearchableSelectModal';
import { X, ChevronDown } from 'lucide-react-native';

export default function NewLandWorkScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { addLandWork, machinery } = useFleet();
  const { currentUser } = useAuth();

  const [fieldName, setFieldName] = useState<string>('');
  const [acres, setAcres] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [workType, setWorkType] = useState<string>('');
  const [selectedMachineryIds, setSelectedMachineryIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [showMachineryModal, setShowMachineryModal] = useState(false);

  const landMachinery = machinery.filter(
    (m) => m.type === 'tractor' || m.type === 'jcb' || m.type === '8_wheeler' || m.type === 'implement' || m.type === 'other_machinery'
  );

  const machinerySelectItems: SelectableItem[] = landMachinery.map((machine) => ({
    id: machine.id,
    label: machine.registrationNumber,
    subtitle: `${machine.model}`,
  }));

  const toggleMachinerySelection = (id: string) => {
    setSelectedMachineryIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((machId) => machId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const calculatePeriodHours = (): number => {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    
    const diffInMinutes = endInMinutes - startInMinutes;
    return diffInMinutes / 60;
  };

  const handleSubmit = async () => {
    if (!fieldName.trim()) {
      Alert.alert('Error', 'Please enter a field name');
      return;
    }

    if (!acres || isNaN(parseFloat(acres)) || parseFloat(acres) <= 0) {
      Alert.alert('Error', 'Please enter a valid number of acres');
      return;
    }

    if (!startTime || !endTime) {
      Alert.alert('Error', 'Please enter start and end time');
      return;
    }

    if (!workType.trim()) {
      Alert.alert('Error', 'Please enter the work type');
      return;
    }

    if (selectedMachineryIds.length === 0) {
      Alert.alert('Error', 'Please select at least one machinery');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    const periodHours = calculatePeriodHours();
    if (periodHours <= 0) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    const newLandWork: LandWork = {
      id: Date.now().toString(),
      date: date,
      fieldName: fieldName.trim(),
      acres: parseFloat(acres),
      startTime,
      endTime,
      periodHours,
      workType: workType.trim(),
      machineryIds: selectedMachineryIds,
      operatedBy: currentUser.name,
      notes: notes.trim() || undefined,
    };

    await addLandWork(newLandWork);
    Alert.alert('Success', 'Land work record created successfully');
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Create Land Work',
          headerStyle: { backgroundColor: colors.cardBackground },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Date *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.secondary}
              value={date}
              onChangeText={setDate}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Field Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., North Field, Plot 42"
              placeholderTextColor={colors.secondary}
              value={fieldName}
              onChangeText={setFieldName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Acres *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., 25.5"
              placeholderTextColor={colors.secondary}
              value={acres}
              onChangeText={setAcres}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Work Type *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., Ploughing, Seeding, Harvesting"
              placeholderTextColor={colors.secondary}
              value={workType}
              onChangeText={setWorkType}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Start Time *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="HH:MM (e.g., 09:00)"
                placeholderTextColor={colors.secondary}
                value={startTime}
                onChangeText={setStartTime}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.text }]}>End Time *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="HH:MM (e.g., 17:00)"
                placeholderTextColor={colors.secondary}
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
          </View>

          {startTime && endTime && (
            <View style={[styles.periodCard, { backgroundColor: colors.background, borderColor: colors.tint }]}>
              <Text style={[styles.periodLabel, { color: colors.secondary }]}>Period Duration</Text>
              <Text style={[styles.periodValue, { color: colors.tint }]}>
                {calculatePeriodHours().toFixed(2)} hours
              </Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Machinery * (Select multiple)</Text>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setShowMachineryModal(true)}
            >
              <Text style={[styles.dropdownText, { color: selectedMachineryIds.length > 0 ? colors.text : colors.secondary }]}>
                {selectedMachineryIds.length > 0 
                  ? `${selectedMachineryIds.length} machinery selected`
                  : 'Select machinery'}
              </Text>
              <ChevronDown color={colors.secondary} size={20} />
            </TouchableOpacity>
            {selectedMachineryIds.length > 0 && (
              <View style={styles.selectedMachineryList}>
                {selectedMachineryIds.map((id) => {
                  const machine = landMachinery.find(m => m.id === id);
                  if (!machine) return null;
                  return (
                    <View key={id} style={[styles.selectedMachineryChip, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
                      <View style={styles.selectedMachineryChipContent}>
                        <Text style={[styles.selectedMachineryChipText, { color: colors.tint }]}>
                          {machine.registrationNumber}
                        </Text>
                        <Text style={[styles.selectedMachineryChipSubtext, { color: colors.tint }]}>
                          {machine.model}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleMachinerySelection(id)}
                        style={styles.removeChipButton}
                      >
                        <X color={colors.tint} size={16} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Operator</Text>
            <View style={[styles.readOnlyField, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.readOnlyText, { color: colors.text }]}>
                {currentUser?.name || 'Unknown'}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Add notes about this land work..."
              placeholderTextColor={colors.secondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Create Land Work Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SearchableSelectModal
        visible={showMachineryModal}
        onClose={() => setShowMachineryModal(false)}
        items={machinerySelectItems}
        selectedIds={selectedMachineryIds}
        onSelect={toggleMachinerySelection}
        title="Select Machinery"
        placeholder="Search by registration number..."
        multiSelect={true}
        emptyMessage="No land work machinery available"
      />
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
  },
  readOnlyField: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  readOnlyText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  helperText: {
    fontSize: 12,
    fontWeight: '400' as const,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  periodCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 4,
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  periodValue: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
  },
  selectedMachineryList: {
    marginTop: 12,
    gap: 8,
  },
  selectedMachineryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedMachineryChipContent: {
    flex: 1,
    gap: 2,
  },
  selectedMachineryChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  selectedMachineryChipSubtext: {
    fontSize: 12,
  },
  removeChipButton: {
    padding: 4,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
