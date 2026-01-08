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

type InspectionStatus = 'Satisfactory' | 'X - Repairs Required' | 'NC - Not Checked' | 'N/A - Not applicable';

interface InspectionItem {
  id: string;
  label: string;
  status: InspectionStatus | null;
}

export default function RHAInspectionScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { currentUser } = useAuth();
  const { machinery } = useFleet();
  const params = useLocalSearchParams();
  
  const registrationNumber = params.registration as string | undefined;

  const vehicle = useMemo(() => {
    if (!registrationNumber) return null;
    return machinery.find(m => m.registrationNumber === registrationNumber);
  }, [machinery, registrationNumber]);

  const [inspectionDate, setInspectionDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [inspectorName, setInspectorName] = useState(currentUser?.name || '');
  const [inspectorContact, setInspectorContact] = useState(currentUser?.phoneNumber || '');
  const [workshopLocation, setWorkshopLocation] = useState('PC Workshop');
  
  const [company, setCompany] = useState('');
  const [regNo, setRegNo] = useState(registrationNumber || '');
  const [fleetNo, setFleetNo] = useState('');
  const [make, setMake] = useState(vehicle?.make || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [odoReading, setOdoReading] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [isoWeekNumber, setIsoWeekNumber] = useState('');
  const [oLicenceExpiry, setOLicenceExpiry] = useState('');
  const [tachographCalibrationDate, setTachographCalibrationDate] = useState('');
  const [last2YearTestDate, setLast2YearTestDate] = useState('');
  const [digitalTachograph, setDigitalTachograph] = useState<'Yes' | 'No' | null>(null);
  
  const [globalMarkingCode, setGlobalMarkingCode] = useState<InspectionStatus | null>(null);

  const [insideCab, setInsideCab] = useState<InspectionItem[]>([
    { id: 'dft_plate', label: 'DFT plate - condition (IM 33)', status: null },
    { id: 'speed_limiter_plate', label: 'Speed limiter plate - condition (IM 33)', status: null },
    { id: 'seat_belts_srs', label: 'Seat belts & SRS condition (IM 3)', status: null },
    { id: 'cab_floor_steps', label: 'Cab floor & steps (IM 17)', status: null },
    { id: 'driver_seat', label: 'Driver seat adjustments (IM 18)', status: null },
    { id: 'internal_mirrors', label: 'Mirrors (internal) (IM 22)', status: null },
    { id: 'view_to_front', label: 'View to front (IM 23)', status: null },
    { id: 'condition_of_glass', label: 'Condition of glass (IM 23)', status: null },
    { id: 'screen_wipers', label: 'Screen wipers & washers (IM 25)', status: null },
    { id: 'speedometer_tacho', label: 'Speedometer/Tachograph (IM 26)', status: null },
    { id: 'engine_tachometer', label: 'Engine tachometer (IM 26)', status: null },
    { id: 'audible_warning', label: 'Audible warning - horn (IM 27)', status: null },
    { id: 'driving_controls', label: 'Driving controls (IM 28)', status: null },
    { id: 'steering_wheel', label: 'Steering wheel - free play (IM 30)', status: null },
    { id: 'hand_lever_park', label: 'Hand lever controlling mechanical/electronic park brake (IM 36)', status: null },
    { id: 'service_brake_pedal', label: 'Service brake pedal (IM 37)', status: null },
    { id: 'service_brake_warning', label: 'Service brake/ABS/ESP/EBS warning lights (IM 38)', status: null },
    { id: 'hand_brake_valves', label: 'Hand operated brake control valves (IM 39)', status: null },
    { id: 'electrical_wiring', label: 'Electrical wiring/equipment/switches (IM 42)', status: null },
  ]);

  const [cabExterior, setCabExterior] = useState<InspectionItem[]>([
    { id: 'bumper_front', label: 'Bumper (front) (IM 9)', status: null },
    { id: 'wings_front', label: 'Condition of wings/spray suppression (front) (IM 14)', status: null },
    { id: 'cab_panels', label: 'Cab panels & heated mirrors (IM 15)', status: null },
    { id: 'cab_doors', label: 'Cab doors incl. hinges/locks (IM 16)', status: null },
    { id: 'external_mirrors', label: 'Mirrors & indirect vision devices (external) (IM 22)', status: null },
    { id: 'front_lamps', label: 'Front lamps/outline markers (IM 63)', status: null },
    { id: 'headlamps', label: 'Headlamps operation/aim (IM 67)', status: null },
  ]);

  const [groundLevel, setGroundLevel] = useState<InspectionItem[]>([
    { id: 'road_wheels_hubs', label: 'Road wheels & hubs (IM 6)', status: null },
    { id: 'sideguards', label: 'Sideguards & rear underrun (IM 9)', status: null },
    { id: 'spare_wheel', label: 'Spare wheel carrier (IM 10)', status: null },
    { id: 'vehicle_trailer_coupling', label: 'Vehicle to trailer coupling (IM 11/12)', status: null },
    { id: 'wings_rear', label: 'Condition of wings/spray suppression (rear) (IM 14)', status: null },
    { id: 'security_body', label: 'Security / condition of body (IM 19/20)', status: null },
  ]);

  const [underAlongside, setUnderAlongside] = useState<InspectionItem[]>([
    { id: 'chassis_condition', label: 'Chassis - condition (IM 41)', status: null },
    { id: 'electrical_batteries', label: 'Electrical wiring & batteries (IM 42)', status: null },
    { id: 'electrical_trailer', label: 'Electrical connections for trailer (IM 42)', status: null },
    { id: 'suspension_springs', label: 'Suspension - springs & mounting (IM 43)', status: null },
    { id: 'suspension_airbags', label: 'Suspension - air bags/bellows (IM 43)', status: null },
    { id: 'shock_absorbers', label: 'Shock absorbers (IM 44)', status: null },
    { id: 'stub_axles', label: 'Stub axles (IM 45)', status: null },
    { id: 'steering_linkage', label: 'Steering linkage (IM 46)', status: null },
    { id: 'power_steering', label: 'Power steering equipment (IM 47)', status: null },
    { id: 'wheel_bearings', label: 'Wheel bearings (IM 48)', status: null },
    { id: 'prop_shafts', label: 'Prop shafts (IM 49)', status: null },
    { id: 'transmission', label: 'Transmission - gearbox/diff (IM 50)', status: null },
    { id: 'exhaust_system', label: 'Exhaust system (IM 51)', status: null },
    { id: 'fuel_system', label: 'Fuel system (IM 52)', status: null },
    { id: 'engine_mountings', label: 'Engine mountings (IM 53)', status: null },
    { id: 'brake_pipes', label: 'Brake pipes/hoses/valves (IM 54)', status: null },
    { id: 'brake_chambers', label: 'Brake chambers/actuators (IM 55)', status: null },
    { id: 'brake_shoes_pads', label: 'Brake shoes/pads/discs (IM 56)', status: null },
    { id: 'parking_brake', label: 'Parking brake system (IM 57)', status: null },
  ]);

  const [lightsSignals, setLightsSignals] = useState<InspectionItem[]>([
    { id: 'rear_lamps', label: 'Rear lamps, reflectors and number plate illumination (IM 63)', status: null },
    { id: 'brake_lamps', label: 'Brake lamps (IM 64)', status: null },
    { id: 'rear_fog_lamps', label: 'Rear fog lamp(s) (IM 65)', status: null },
    { id: 'reversing_lamps', label: 'Reversing lamps (IM 66)', status: null },
    { id: 'direction_indicators', label: 'Direction indicators (IM 68)', status: null },
    { id: 'hazard_warning', label: 'Hazard warning (IM 69)', status: null },
    { id: 'registration_plates', label: 'Registration plates - secure, complete and legible (IM 70)', status: null },
    { id: 'side_marker_lamps', label: 'Side marker lamps (IM 71)', status: null },
  ]);

  const [tyresWheels, setTyresWheels] = useState<InspectionItem[]>([
    { id: 'tyre_condition', label: 'Tyre condition/tread depth (IM 5)', status: null },
    { id: 'tyre_pressure', label: 'Tyre pressure (IM 5)', status: null },
    { id: 'tyre_size_type', label: 'Tyre size and type (IM 5)', status: null },
    { id: 'wheel_nuts', label: 'Wheel nuts/studs (IM 6)', status: null },
    { id: 'wheel_rims', label: 'Wheel rims (IM 6)', status: null },
  ]);

  const [brakeTest, setBrakeTest] = useState<InspectionItem[]>([
    { id: 'service_brake_performance', label: 'Service brake performance', status: null },
    { id: 'secondary_brake_performance', label: 'Secondary brake performance', status: null },
    { id: 'parking_brake_performance', label: 'Parking brake performance', status: null },
  ]);

  const [additionalNotes, setAdditionalNotes] = useState('');
  const [defectsFound, setDefectsFound] = useState('');
  const [workCarriedOut, setWorkCarriedOut] = useState('');

  const statusOptions: InspectionStatus[] = ['Satisfactory', 'X - Repairs Required', 'NC - Not Checked', 'N/A - Not applicable'];

  const toggleItemStatus = (
    items: InspectionItem[],
    setItems: React.Dispatch<React.SetStateAction<InspectionItem[]>>,
    id: string
  ) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const currentIndex = item.status ? statusOptions.indexOf(item.status) : -1;
        const nextIndex = (currentIndex + 1) % statusOptions.length;
        return { ...item, status: statusOptions[nextIndex] };
      }
      return item;
    }));
  };

  const applyGlobalMarkingCode = () => {
    if (!globalMarkingCode) return;
    
    setInsideCab(insideCab.map(item => ({ ...item, status: globalMarkingCode })));
    setCabExterior(cabExterior.map(item => ({ ...item, status: globalMarkingCode })));
    setGroundLevel(groundLevel.map(item => ({ ...item, status: globalMarkingCode })));
    setUnderAlongside(underAlongside.map(item => ({ ...item, status: globalMarkingCode })));
    setLightsSignals(lightsSignals.map(item => ({ ...item, status: globalMarkingCode })));
    setTyresWheels(tyresWheels.map(item => ({ ...item, status: globalMarkingCode })));
    setBrakeTest(brakeTest.map(item => ({ ...item, status: globalMarkingCode })));
    
    Alert.alert('Applied', `Global marking code "${globalMarkingCode}" applied to all items`);
  };

  const handleSubmit = () => {
    if (!inspectionDate || !inspectorName || !regNo || !make) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const inspectionData = {
      inspectionDate,
      inspectorName,
      inspectorContact,
      workshopLocation,
      company,
      regNo,
      fleetNo,
      make,
      model,
      odoReading,
      chassisNo,
      bodyType,
      isoWeekNumber,
      oLicenceExpiry,
      tachographCalibrationDate,
      last2YearTestDate,
      digitalTachograph,
      insideCab,
      cabExterior,
      groundLevel,
      underAlongside,
      lightsSignals,
      tyresWheels,
      brakeTest,
      additionalNotes,
      defectsFound,
      workCarriedOut,
      completedBy: currentUser?.id,
      completedAt: new Date().toISOString(),
    };

    console.log('RHA Safety Inspection submitted:', inspectionData);

    Alert.alert(
      'Success',
      'RHA Safety Inspection completed successfully',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const renderInspectionItem = (
    items: InspectionItem[],
    setItems: React.Dispatch<React.SetStateAction<InspectionItem[]>>,
    item: InspectionItem
  ) => {
    const getStatusColor = (status: InspectionStatus | null) => {
      switch (status) {
        case 'Satisfactory': return '#10b981';
        case 'X - Repairs Required': return '#ef4444';
        case 'NC - Not Checked': return '#f59e0b';
        case 'N/A - Not applicable': return '#6b7280';
        default: return 'transparent';
      }
    };

    const getStatusLabel = (status: InspectionStatus | null) => {
      switch (status) {
        case 'Satisfactory': return '✓';
        case 'X - Repairs Required': return 'X';
        case 'NC - Not Checked': return 'NC';
        case 'N/A - Not applicable': return 'N/A';
        default: return '○';
      }
    };

    return (
      <View key={item.id} style={styles.checkRow}>
        <Text style={[styles.checkLabel, { color: colors.text }]}>{item.label}</Text>
        <TouchableOpacity
          style={[
            styles.statusButton,
            { 
              borderColor: item.status ? getStatusColor(item.status) : colors.border,
              backgroundColor: item.status ? getStatusColor(item.status) : 'transparent',
            },
          ]}
          onPress={() => toggleItemStatus(items, setItems, item.id)}
        >
          <Text style={[
            styles.statusButtonText,
            { color: item.status ? '#fff' : colors.text }
          ]}>
            {getStatusLabel(item.status)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderInspectionGroup = (
    title: string,
    items: InspectionItem[],
    setItems: React.Dispatch<React.SetStateAction<InspectionItem[]>>
  ) => (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {items.map(item => renderInspectionItem(items, setItems, item))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'RHA Safety Inspection',
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
        <View style={[styles.headerCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            RHA Safety Inspection and Maintenance Record
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
            Powered Vehicles - Revised June 2020
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Inspection Details</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Inspection Date *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={inspectionDate}
                onChangeText={setInspectionDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Inspector Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={inspectorName}
                onChangeText={setInspectorName}
                placeholder="Name"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Inspector Contact</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={inspectorContact}
                onChangeText={setInspectorContact}
                placeholder="Phone"
                placeholderTextColor={colors.secondary}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Workshop / Location</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={workshopLocation}
                onChangeText={setWorkshopLocation}
                placeholder="Location"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Information</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Company</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={company}
                onChangeText={setCompany}
                placeholder="Company name"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Reg No *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={regNo}
                onChangeText={setRegNo}
                placeholder="Reg no"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Fleet No</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={fleetNo}
                onChangeText={setFleetNo}
                placeholder="Fleet no"
                placeholderTextColor={colors.secondary}
              />
            </View>
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
          </View>

          <View style={styles.row}>
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
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Odo Reading (miles/km)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={odoReading}
                onChangeText={setOdoReading}
                placeholder="Miles/km"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Chassis No</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={chassisNo}
                onChangeText={setChassisNo}
                placeholder="Chassis no"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Body Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={bodyType}
                onChangeText={setBodyType}
                placeholder="Body type"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>ISO Week Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={isoWeekNumber}
                onChangeText={setIsoWeekNumber}
                placeholder="Week no"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>O-Licence & Expiry</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={oLicenceExpiry}
                onChangeText={setOLicenceExpiry}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Tachograph Calibration Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={tachographCalibrationDate}
                onChangeText={setTachographCalibrationDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Last 2 Year Test Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={last2YearTestDate}
                onChangeText={setLast2YearTestDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Digital Tachograph Fitted</Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  { borderColor: colors.border },
                  digitalTachograph === 'Yes' && { backgroundColor: colors.tint },
                ]}
                onPress={() => setDigitalTachograph('Yes')}
              >
                <Text style={[
                  styles.radioButtonText,
                  { color: digitalTachograph === 'Yes' ? '#fff' : colors.text }
                ]}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  { borderColor: colors.border },
                  digitalTachograph === 'No' && { backgroundColor: colors.tint },
                ]}
                onPress={() => setDigitalTachograph('No')}
              >
                <Text style={[
                  styles.radioButtonText,
                  { color: digitalTachograph === 'No' ? '#fff' : colors.text }
                ]}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Global Marking Code</Text>
          <Text style={[styles.helpText, { color: colors.secondary }]}>
            Apply the same marking code to all inspection items
          </Text>
          
          <View style={styles.globalMarkingRow}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.globalMarkingButton,
                  { borderColor: colors.border },
                  globalMarkingCode === status && { backgroundColor: colors.tint },
                ]}
                onPress={() => setGlobalMarkingCode(status)}
              >
                <Text style={[
                  styles.globalMarkingButtonText,
                  { color: globalMarkingCode === status ? '#fff' : colors.text }
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[
              styles.applyButton,
              { backgroundColor: colors.tint },
              !globalMarkingCode && { opacity: 0.5 },
            ]}
            onPress={applyGlobalMarkingCode}
            disabled={!globalMarkingCode}
          >
            <Text style={styles.applyButtonText}>Apply to All Items</Text>
          </TouchableOpacity>
        </View>

        {renderInspectionGroup('Inside Cab', insideCab, setInsideCab)}
        {renderInspectionGroup('Cab Exterior', cabExterior, setCabExterior)}
        {renderInspectionGroup('Ground Level', groundLevel, setGroundLevel)}
        {renderInspectionGroup('Under / Alongside Vehicle', underAlongside, setUnderAlongside)}
        {renderInspectionGroup('Lights & Signals', lightsSignals, setLightsSignals)}
        {renderInspectionGroup('Tyres & Wheels', tyresWheels, setTyresWheels)}
        {renderInspectionGroup('Brake Test', brakeTest, setBrakeTest)}

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Defects Found</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={defectsFound}
              onChangeText={setDefectsFound}
              placeholder="List any defects found during inspection..."
              placeholderTextColor={colors.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Work Carried Out</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={workCarriedOut}
              onChangeText={setWorkCarriedOut}
              placeholder="Describe any work carried out or repairs made..."
              placeholderTextColor={colors.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Additional Notes</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              placeholder="Any additional notes or observations..."
              placeholderTextColor={colors.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.footerText, { color: colors.secondary }]}>
            NOTE: IT IS ALWAYS THE RESPONSIBILITY OF THE OPERATOR THAT THE VEHICLE IS IN A ROADWORTHY CONDITION BEFORE BEING USED ON THE ROAD.
          </Text>
          <Text style={[styles.footerText, { color: colors.secondary, marginTop: 12 }]}>
            Printed by The Road Haulage Association Limited, Roadway House, Bretton, Peterborough PE3 8DD
          </Text>
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
  headerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
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
  helpText: {
    fontSize: 13,
    marginBottom: 12,
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
  radioRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  radioButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
  },
  radioButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  globalMarkingRow: {
    gap: 8,
    marginBottom: 12,
  },
  globalMarkingButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  globalMarkingButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  applyButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  checkLabel: {
    fontSize: 13,
    flex: 1,
    paddingRight: 12,
  },
  statusButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
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
