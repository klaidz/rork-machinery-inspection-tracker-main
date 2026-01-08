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
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useFleet } from '@/context/FleetContext';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { BrakeTestResult, BrakeTestAxle, AxleType } from '@/types';

export default function BrakeRollerTestScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { currentUser } = useAuth();
  const { machinery, addBrakeTestResult } = useFleet();
  const params = useLocalSearchParams();
  
  const requestId = params.requestId as string | undefined;
  const registrationNumber = params.registration as string | undefined;

  const vehicle = useMemo(() => {
    if (!registrationNumber) return null;
    return machinery.find(m => m.registrationNumber === registrationNumber);
  }, [machinery, registrationNumber]);

  const [testDate, setTestDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [testLocation, setTestLocation] = useState('PC Workshop');
  const [testerName, setTesterName] = useState(currentUser?.name || '');
  const [testerContact, setTesterContact] = useState(currentUser?.phoneNumber || '');
  
  const [vehicleMake, setVehicleMake] = useState(vehicle?.make || '');
  const [vehicleModel, setVehicleModel] = useState(vehicle?.model || '');
  const [regNo, setRegNo] = useState(registrationNumber || '');
  const [fleetNumber, setFleetNumber] = useState('');
  const [grossVehicleMass, setGrossVehicleMass] = useState('');
  const [totalAxleWeightsEntered, setTotalAxleWeightsEntered] = useState(false);
  
  const [testEquipmentId, setTestEquipmentId] = useState('');
  const [testSpeed, setTestSpeed] = useState('');
  const [airPressure, setAirPressure] = useState('');
  
  const [maxWheelImbalance, setMaxWheelImbalance] = useState('30');
  const [minAxleEfficiency, setMinAxleEfficiency] = useState('');
  const [minTotalEfficiency, setMinTotalEfficiency] = useState('');

  const [numberOfAxles, setNumberOfAxles] = useState(4);
  const [axles, setAxles] = useState<BrakeTestAxle[]>([
    { axleNumber: 1, leftBrakeForce: '', rightBrakeForce: '', axleLoad: '', axleType: 'steer' },
    { axleNumber: 2, leftBrakeForce: '', rightBrakeForce: '', axleLoad: '', axleType: 'steer' },
    { axleNumber: 3, leftBrakeForce: '', rightBrakeForce: '', axleLoad: '', axleType: 'drive' },
    { axleNumber: 4, leftBrakeForce: '', rightBrakeForce: '', axleLoad: '', axleType: 'drive' },
  ]);

  const [overallRemarks, setOverallRemarks] = useState('');

  const calculateAxleValues = (axle: BrakeTestAxle): BrakeTestAxle => {
    const left = parseFloat(axle.leftBrakeForce) || 0;
    const right = parseFloat(axle.rightBrakeForce) || 0;
    const load = parseFloat(axle.axleLoad) || 0;

    const difference = Math.abs(left - right);
    const maxForce = Math.max(left, right);
    const imbalance = maxForce > 0 ? (difference / maxForce) * 100 : 0;
    const combined = left + right;
    const efficiency = load > 0 ? (combined / (load * 9.81)) * 100 : 0;

    return {
      ...axle,
      difference: parseFloat(difference.toFixed(2)),
      imbalance: parseFloat(imbalance.toFixed(2)),
      axleCombinedForce: parseFloat(combined.toFixed(2)),
      axleEfficiency: parseFloat(efficiency.toFixed(2)),
    };
  };

  const updateAxle = (index: number, field: keyof BrakeTestAxle, value: string | AxleType) => {
    const updated = [...axles];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'leftBrakeForce' || field === 'rightBrakeForce' || field === 'axleLoad') {
      updated[index] = calculateAxleValues(updated[index]);
    }
    
    setAxles(updated);
  };

  const addAxle = () => {
    if (numberOfAxles < 6) {
      setNumberOfAxles(numberOfAxles + 1);
      setAxles([
        ...axles,
        { axleNumber: numberOfAxles + 1, leftBrakeForce: '', rightBrakeForce: '', axleLoad: '', axleType: 'drive' },
      ]);
    }
  };

  const removeAxle = () => {
    if (numberOfAxles > 2) {
      setNumberOfAxles(numberOfAxles - 1);
      setAxles(axles.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (!testDate || !testLocation || !testerName || !regNo || !vehicleMake) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const result: BrakeTestResult = {
      id: `brake-test-${Date.now()}`,
      requestId: requestId,
      testDate,
      testLocation,
      testerName,
      testerContact,
      vehicleMake,
      vehicleModel,
      registrationNumber: regNo,
      machineryId: vehicle?.id,
      fleetNumber,
      grossVehicleMass,
      totalAxleWeightsEntered,
      testEquipmentId,
      testSpeed,
      airPressure,
      maxWheelImbalance,
      minAxleEfficiency,
      minTotalEfficiency,
      axles: axles.slice(0, numberOfAxles),
      overallRemarks,
      testedBy: currentUser?.id || '',
      completedAt: new Date().toISOString(),
    };

    console.log('Brake roller test submitted:', result);

    try {
      await addBrakeTestResult(result);
      
      Alert.alert(
        'Success',
        'Brake roller test completed successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error submitting brake test result:', error);
      Alert.alert('Error', 'Failed to submit brake test. Please try again.');
    }
  };

  const renderAxleSection = (axle: BrakeTestAxle, index: number) => {
    const axleLabel = index === 0 || index === 1 ? 'FRONT STEER' : 'REAR';
    
    return (
      <View key={index} style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.axleHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Axle {axle.axleNumber} — {axleLabel}
          </Text>
          {index >= 2 && (
            <View style={styles.axleTypeButtons}>
              {(['drive', 'lift', 'tag'] as AxleType[]).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.axleTypeButton,
                    { borderColor: colors.border },
                    axle.axleType === type && { backgroundColor: colors.tint },
                  ]}
                  onPress={() => updateAxle(index, 'axleType', type)}
                >
                  <Text style={[
                    styles.axleTypeButtonText,
                    { color: axle.axleType === type ? '#fff' : colors.text }
                  ]}>
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Wheel Left - Brake Force (N) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={axle.leftBrakeForce}
              onChangeText={(text) => updateAxle(index, 'leftBrakeForce', text)}
              placeholder="N"
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Wheel Right - Brake Force (N) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={axle.rightBrakeForce}
              onChangeText={(text) => updateAxle(index, 'rightBrakeForce', text)}
              placeholder="N"
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Difference (N)</Text>
            <View style={[styles.calculatedField, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.calculatedText, { color: colors.text }]}>
                {axle.difference?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
          <View style={styles.halfInput}>
            <Text style={[styles.label, { color: colors.text }]}>Imbalance (%)</Text>
            <View style={[styles.calculatedField, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.calculatedText, { color: colors.text }]}>
                {axle.imbalance?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Axle Combined Force (N)</Text>
          <View style={[styles.calculatedField, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.calculatedText, { color: colors.text }]}>
              {axle.axleCombinedForce?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Axle Load (kg) *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={axle.axleLoad}
            onChangeText={(text) => updateAxle(index, 'axleLoad', text)}
            placeholder="kg"
            placeholderTextColor={colors.secondary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Axle Efficiency (%)</Text>
          <View style={[styles.calculatedField, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.calculatedText, { color: colors.text }]}>
              {axle.axleEfficiency?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Remarks / Defects</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={axle.remarks || ''}
            onChangeText={(text) => updateAxle(index, 'remarks', text)}
            placeholder="Any defects or remarks"
            placeholderTextColor={colors.secondary}
            multiline
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Brake Roller Test',
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Test Information</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Test Date *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={testDate}
                onChangeText={setTestDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Test Location / Workshop *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={testLocation}
                onChangeText={setTestLocation}
                placeholder="Location"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Tester Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={testerName}
                onChangeText={setTesterName}
                placeholder="Name"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Contact</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={testerContact}
                onChangeText={setTesterContact}
                placeholder="Phone"
                placeholderTextColor={colors.secondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Information</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Vehicle Make *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={vehicleMake}
                onChangeText={setVehicleMake}
                placeholder="Make"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Vehicle Model</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={vehicleModel}
                onChangeText={setVehicleModel}
                placeholder="Model"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Reg (VRM) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={regNo}
                onChangeText={setRegNo}
                placeholder="Registration"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Fleet / Asset No.</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={fleetNumber}
                onChangeText={setFleetNumber}
                placeholder="Fleet no"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Gross Vehicle Mass (kg)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={grossVehicleMass}
                onChangeText={setGrossVehicleMass}
                placeholder="kg"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Total Axle Weights Entered?</Text>
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { borderColor: colors.border },
                    totalAxleWeightsEntered && { backgroundColor: colors.tint },
                  ]}
                  onPress={() => setTotalAxleWeightsEntered(true)}
                >
                  <Text style={[styles.checkboxText, { color: totalAxleWeightsEntered ? '#fff' : colors.text }]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { borderColor: colors.border },
                    !totalAxleWeightsEntered && { backgroundColor: colors.tint },
                  ]}
                  onPress={() => setTotalAxleWeightsEntered(false)}
                >
                  <Text style={[styles.checkboxText, { color: !totalAxleWeightsEntered ? '#fff' : colors.text }]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Test Equipment</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Roller Brake Tester (ID / Calibration No)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={testEquipmentId}
              onChangeText={setTestEquipmentId}
              placeholder="Equipment ID"
              placeholderTextColor={colors.secondary}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Test Speed / Roller RPM</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={testSpeed}
                onChangeText={setTestSpeed}
                placeholder="Speed / RPM"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Air Pressure at Test</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={airPressure}
                onChangeText={setAirPressure}
                placeholder="bar / kPa"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Operator Thresholds</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Max Wheel Imbalance (%)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={maxWheelImbalance}
                onChangeText={setMaxWheelImbalance}
                placeholder="30 (default)"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Min Axle Efficiency (%)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={minAxleEfficiency}
                onChangeText={setMinAxleEfficiency}
                placeholder="%"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Min Total Efficiency (%)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={minTotalEfficiency}
              onChangeText={setMinTotalEfficiency}
              placeholder="%"
              placeholderTextColor={colors.secondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.axleControlHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Axle Measurements</Text>
            <View style={styles.axleControls}>
              <TouchableOpacity
                style={[styles.axleControlButton, { backgroundColor: colors.tint }]}
                onPress={removeAxle}
                disabled={numberOfAxles <= 2}
              >
                <Text style={styles.axleControlButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.axleCount, { color: colors.text }]}>{numberOfAxles} axles</Text>
              <TouchableOpacity
                style={[styles.axleControlButton, { backgroundColor: colors.tint }]}
                onPress={addAxle}
                disabled={numberOfAxles >= 6}
              >
                <Text style={styles.axleControlButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {axles.slice(0, numberOfAxles).map((axle, index) => renderAxleSection(axle, index))}

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overall Test Remarks</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={overallRemarks}
            onChangeText={setOverallRemarks}
            placeholder="Any overall test comments or defects..."
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
          <Text style={styles.submitButtonText}>Complete Brake Test</Text>
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
  calculatedField: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
  },
  calculatedText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  checkbox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  axleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  axleTypeButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  axleTypeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  axleTypeButtonText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  axleControlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  axleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  axleControlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  axleControlButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700' as const,
  },
  axleCount: {
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
