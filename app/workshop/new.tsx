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
import { Stack, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useFleet } from '@/context/FleetContext';
import { Wrench, X, ChevronDown } from 'lucide-react-native';
import SearchableSelectModal, { SelectableItem } from '@/components/SearchableSelectModal';
import Colors from '@/constants/colors';

type WorkshopSite = 'pc_workshop_ad' | 'milton_workshop_cdl';
type JobType = 'brake_test' | 'inspection' | 'repair';

export default function NewWorkshopScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { currentUser } = useAuth();
  const { machinery } = useFleet();
  
  const [selectedSite, setSelectedSite] = useState<WorkshopSite | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [selectedJobType, setSelectedJobType] = useState<JobType | null>(null);
  const [parts, setParts] = useState('');
  const [description, setDescription] = useState('');
  const [mechanicName, setMechanicName] = useState(currentUser?.name || '');
  const [showNumberPlateModal, setShowNumberPlateModal] = useState(false);

  const availableMachinery = machinery.filter(m => m.registrationNumber);

  const machinerySelectItems: SelectableItem[] = availableMachinery.map((machine) => ({
    id: machine.id,
    label: machine.registrationNumber,
    subtitle: `${machine.name} • ${machine.model}`,
  }));

  const workshops = [
    { id: 'pc_workshop_ad' as WorkshopSite, name: 'PC Workshop AD' },
    { id: 'milton_workshop_cdl' as WorkshopSite, name: 'Milton Workshop CDL' },
  ];

  const jobTypes = [
    { id: 'brake_test' as JobType, name: 'Brake Test' },
    { id: 'inspection' as JobType, name: 'Inspection' },
    { id: 'repair' as JobType, name: 'Repair' },
  ];

  const handleSubmit = () => {
    if (!selectedSite || !registrationNumber || !selectedJobType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (selectedJobType === 'repair' && !parts) {
      Alert.alert('Error', 'Please specify parts needed for repair');
      return;
    }

    if (selectedJobType === 'inspection') {
      if (selectedSite === 'pc_workshop_ad') {
        router.push({ pathname: '/workshop/inspection-pc' as any, params: { registration: registrationNumber } });
      } else if (selectedSite === 'milton_workshop_cdl') {
        router.push({ pathname: '/workshop/inspection-milton' as any, params: { registration: registrationNumber } });
      }
      return;
    }

    console.log('Workshop entry created:', {
      site: selectedSite,
      registration: registrationNumber,
      jobType: selectedJobType,
      parts: parts || 'N/A',
      mechanic: mechanicName,
      description,
    });

    Alert.alert(
      'Success',
      `Workshop entry created for ${workshops.find(w => w.id === selectedSite)?.name}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'New Workshop Entry',
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
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Workshop Site *</Text>
            <View style={styles.workshopGrid}>
              {workshops.map((workshop) => (
                <TouchableOpacity
                  key={workshop.id}
                  style={[
                    styles.workshopChip,
                    {
                      backgroundColor: selectedSite === workshop.id ? colors.tint : colors.background,
                      borderColor: selectedSite === workshop.id ? colors.tint : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedSite(workshop.id)}
                >
                  <Wrench
                    color={selectedSite === workshop.id ? '#FFFFFF' : colors.text}
                    size={20}
                  />
                  <Text
                    style={[
                      styles.workshopChipText,
                      { color: selectedSite === workshop.id ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {workshop.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Registration Number *</Text>
            <TouchableOpacity
              style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setShowNumberPlateModal(true)}
            >
              <Text style={[styles.dropdownText, { color: registrationNumber ? colors.text : colors.secondary }]}>
                {registrationNumber || 'Select number plate'}
              </Text>
              <ChevronDown color={colors.secondary} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Job Type *</Text>
            <View style={styles.jobTypeGrid}>
              {jobTypes.map((jobType) => (
                <TouchableOpacity
                  key={jobType.id}
                  style={[
                    styles.jobTypeChip,
                    {
                      backgroundColor: selectedJobType === jobType.id ? colors.tint : colors.background,
                      borderColor: selectedJobType === jobType.id ? colors.tint : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedJobType(jobType.id)}
                >
                  <Text
                    style={[
                      styles.jobTypeChipText,
                      { color: selectedJobType === jobType.id ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {jobType.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedJobType === 'repair' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Parts Required *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="List parts needed for repair..."
                placeholderTextColor={colors.secondary}
                value={parts}
                onChangeText={setParts}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Mechanic Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Mechanic name"
              placeholderTextColor={colors.secondary}
              value={mechanicName}
              onChangeText={setMechanicName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Work Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Describe the work to be done..."
              placeholderTextColor={colors.secondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Create Workshop Entry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SearchableSelectModal
        visible={showNumberPlateModal}
        onClose={() => setShowNumberPlateModal(false)}
        items={machinerySelectItems}
        selectedIds={registrationNumber ? availableMachinery.filter(m => m.registrationNumber === registrationNumber).map(m => m.id) : []}
        onSelect={(id) => {
          const machine = availableMachinery.find(m => m.id === id);
          if (machine) {
            setRegistrationNumber(machine.registrationNumber);
          }
        }}
        title="Select Number Plate"
        placeholder="Search by registration number..."
        multiSelect={false}
        emptyMessage="No machinery found"
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
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    gap: 20,
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
  workshopGrid: {
    gap: 12,
  },
  workshopChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  workshopChipText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  jobTypeGrid: {
    gap: 10,
  },
  jobTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  jobTypeChipText: {
    fontSize: 15,
    fontWeight: '600' as const,
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
