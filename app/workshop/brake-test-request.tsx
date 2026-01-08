import React, { useState, useMemo } from 'react';
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
import { useNotifications } from '@/context/NotificationContext';
import { X, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import SearchableSelectModal from '@/components/SearchableSelectModal';
import { BrakeTestRequest } from '@/types';

export default function BrakeTestRequestScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { currentUser, users } = useAuth();
  const { machinery, addBrakeTestRequest } = useFleet();
  const { notifyBrakeTestRequest } = useNotifications();

  const [selectedRegistration, setSelectedRegistration] = useState('');
  const [requestedDate, setRequestedDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [notes, setNotes] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const wheelerAndTrailerOptions = useMemo(() => {
    const vehicles = machinery.filter(m => 
      m.type === '8_wheeler' || 
      m.type === 'hgv'
    );
    
    return vehicles.map(v => ({
      id: v.id,
      label: v.registrationNumber,
      subtitle: v.name,
    }));
  }, [machinery]);

  const handleSubmit = async () => {
    if (!selectedRegistration || !requestedDate) {
      Alert.alert('Error', 'Please select a vehicle and requested date');
      return;
    }

    const selectedVehicle = machinery.find(m => m.registrationNumber === selectedRegistration);

    const request: BrakeTestRequest = {
      id: `brake-request-${Date.now()}`,
      registrationNumber: selectedRegistration,
      machineryId: selectedVehicle?.id,
      requestedDate,
      requestedBy: currentUser?.name || '',
      requestedByWorkshop: 'milton_workshop',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log('Brake test request submitted:', request);

    try {
      await addBrakeTestRequest(request);
      await notifyBrakeTestRequest(request, users);
      
      Alert.alert(
        'Success',
        'Brake test request submitted. PC Workshop will be notified.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error submitting brake test request:', error);
      Alert.alert('Error', 'Failed to submit brake test request. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Request Brake Test',
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
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground, borderColor: colors.tint }]}>
          <Text style={[styles.infoTitle, { color: colors.tint }]}>Milton Workshop</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>
            Request a brake roller test from PC Workshop for 8-wheelers or trailers.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Request Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Vehicle Registration *</Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                { backgroundColor: colors.background, borderColor: selectedRegistration ? colors.tint : colors.border }
              ]}
              onPress={() => setShowRegistrationModal(true)}
            >
              <Text style={[styles.selectButtonText, { color: selectedRegistration ? colors.text : colors.secondary }]}>
                {selectedRegistration || 'Select vehicle registration'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Requested Date *</Text>
            <View style={[styles.dateInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Calendar color={colors.secondary} size={20} />
              <TextInput
                style={[styles.dateInput, { color: colors.text }]}
                value={requestedDate}
                onChangeText={setRequestedDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Additional Notes</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any specific requirements or notes for PC Workshop..."
              placeholderTextColor={colors.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Requested By</Text>
            <View style={[styles.disabledInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.disabledText, { color: colors.secondary }]}>
                {currentUser?.name || 'Unknown'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.tint }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Request</Text>
        </TouchableOpacity>

        <View style={[styles.helpCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.helpTitle, { color: colors.text }]}>What happens next?</Text>
          <Text style={[styles.helpText, { color: colors.secondary }]}>
            1. PC Workshop will receive a notification about your request{'\n'}
            2. They will schedule and perform the brake roller test{'\n'}
            3. You will be notified once the test is completed{'\n'}
            4. Test results will be available in the system
          </Text>
        </View>
      </ScrollView>

      <SearchableSelectModal
        visible={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        items={wheelerAndTrailerOptions}
        selectedIds={selectedRegistration ? [machinery.find(m => m.registrationNumber === selectedRegistration)?.id || ''] : []}
        onSelect={(id) => {
          const vehicle = machinery.find(m => m.id === id);
          if (vehicle) {
            setSelectedRegistration(vehicle.registrationNumber);
          }
        }}
        title="Select Vehicle"
        placeholder="Search registration..."
        multiSelect={false}
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
    padding: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  selectButtonText: {
    fontSize: 14,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
  },
  textArea: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 100,
  },
  disabledInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
  },
  disabledText: {
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  helpCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
