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
type BrakeTestResult = 'pass' | 'not_serviceable' | null;

interface InspectionItem {
  id: string;
  label: string;
  status: CheckStatus;
}

interface TyreReading {
  position: string;
  mm: string;
  psi: string;
}

interface BrakeEfficiency {
  service: string;
  parking: string;
}

export default function PCWorkshopInspectionScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { currentUser } = useAuth();
  const params = useLocalSearchParams();
  const registrationNumber = params.registration as string;

  const [company, setCompany] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [regNo, setRegNo] = useState(registrationNumber || '');
  const [fleetNo, setFleetNo] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [odoReading, setOdoReading] = useState('');

  const [chassisNo, setChassisNo] = useState('');
  const [isoWeekNumber, setIsoWeekNumber] = useState('');
  const [dLicenceExpiry, setDLicenceExpiry] = useState('');
  const [tachographCalDate, setTachographCalDate] = useState('');
  const [last2YearTestDate, setLast2YearTestDate] = useState('');


  const [part1Items, setPart1Items] = useState<InspectionItem[]>([
    { id: '1', label: 'General cab condition clean', status: null },
    { id: '2', label: 'Excessive cab condition rattles', status: null },
    { id: '3', label: 'Sun belts and support/entry restraint systems - cabs/body', status: null },
    { id: '4', label: 'Other seats and seat assemblies', status: null },
    { id: '5', label: 'Mirrors (internal)', status: null },
    { id: '6', label: 'Bonnet fastenings', status: null },
    { id: '7', label: 'Condition of glass screen/windows', status: null },
    { id: '8', label: 'Windscreen wipers and washers', status: null },
    { id: '9', label: 'Sun visor(s)', status: null },
    { id: '10', label: 'Brake systems and components', status: null },
    { id: '11', label: 'Under coupling, bogies and traction or anti-wheelspin or anti-skid device', status: null },
    { id: '12', label: 'Drive shaft, coupling bogies and traction or anti-wheelspin or anti-skid device', status: null },
    { id: '13', label: 'Air brake and flexible device', status: null },
    { id: '14', label: 'Anti-lock device - braking', status: null },
    { id: '15', label: 'Operation of multi-circuit protection', status: null },
    { id: '16', label: 'Additional braking devices', status: null },
    { id: '17', label: 'Excessive braking system/spongy/uneven application', status: null },
    { id: '18', label: 'Brake systems and components', status: null },
    { id: '19', label: 'Rims and fittings of tyres (road side/nearside)', status: null },
    { id: '20', label: 'Size and type of tyres, Strap and tyres correct', status: null },
    { id: '21', label: 'Condition of tyres', status: null },
    { id: '22', label: 'Security/condition of body', status: null },
    { id: '23', label: 'Doors and seats - secure mounting equipment', status: null },
    { id: '24', label: 'Doors and fastenings - condition and operation', status: null },
    { id: '25', label: 'Other ancillary equipment', status: null },
    { id: '26', label: 'UNDERBODY/FENDERS/VEHICLE', status: null },
    { id: '27', label: 'Engine mountings', status: null },
    { id: '28', label: 'Exhaust system', status: null },
    { id: '29', label: 'Fuel system (including LPG)', status: null },
    { id: '30', label: 'Electrical wiring equipment (including batteries)', status: null },
    { id: '31', label: 'Prop shafts', status: null },
    { id: '32', label: 'Wheel bearings and seals (rear)', status: null },
    { id: '33', label: 'Springs and mounting', status: null },
    { id: '34', label: 'Stub axles', status: null },
    { id: '35', label: 'Steering alignment', status: null },
    { id: '36', label: 'Steering gear', status: null },
    { id: '37', label: 'Power steering equipment', status: null },
    { id: '38', label: 'Anti-roll bars', status: null },
    { id: '39', label: 'Suspension bellows, brackets & dust covers - condition', status: null },
    { id: '40', label: 'Springs and suspension and torque arms', status: null },
    { id: '41', label: 'Shock absorbers', status: null },
    { id: '42', label: 'Transmission - drive line', status: null },
    { id: '43', label: 'Transmission - drive line - cladging/levers; dust covers', status: null },
    { id: '44', label: 'Rear lamps, reflectors and number plate illumination (incl rear)', status: null },
    { id: '45', label: 'Rear lamp reflectors and number plate illumination (dual rear)', status: null },
    { id: '46', label: 'Rear lamp reflectors and number plate illumination (dual rear)', status: null },
    { id: '47', label: 'Brake lamps', status: null },
    { id: '48', label: 'Rear fog lamp(s)', status: null },
    { id: '49', label: 'Reversing lamps', status: null },
    { id: '50', label: 'Direction indicators', status: null },
    { id: '51', label: 'Hazard warning', status: null },
    { id: '52', label: 'Registration plates - secure, complete and legible', status: null },
    { id: '53', label: 'Other signaling equipment', status: null },
    { id: '54', label: 'Steering alignment', status: null },
    { id: '55', label: 'Steering gear and shaves', status: null },
    { id: '56', label: 'Steering column', status: null },
    { id: '57', label: 'Axle alignment', status: null },
    { id: '58', label: 'Clutch', status: null },
    { id: '59', label: 'Gearbox', status: null },
    { id: '60', label: 'Charging speed mechanism', status: null },
    { id: '61', label: 'Power (diesel)', status: null },
    { id: '62', label: 'Smoke', status: null },
    { id: '63', label: 'Z - Speed test (maximum)', status: null },
    { id: '64', label: 'Different lock to suspension of steering', status: null },
    { id: '65', label: 'Prop transmission joints if', status: null },
    { id: '66', label: 'Petrol/diesel - condition', status: null },
    { id: '67', label: 'Fasteners and fixings - condition', status: null },
    { id: '68', label: 'Linkwork', status: null },
    { id: '69', label: 'NOISE', status: null },
    { id: '70', label: 'Registration plates - secure, complete and legible', status: null },
    { id: '71', label: 'Other dangerous defects not covered by this checklist', status: null },
    { id: '72', label: 'SMOKE EMISSION', status: null },
    { id: '73', label: 'Engine idle', status: null },
    { id: '74', label: 'Engine NOS compliance or indicating a malfunction', status: null },
  ]);

  const [groundLiftItems, setGroundLiftItems] = useState<InspectionItem[]>([
    { id: 'g1', label: 'Rope suspension and bed', status: null },
    { id: 'g2', label: 'Brake wheel center hub loose wheel', status: null },
    { id: 'g3', label: 'Brake wheel center hub drum wheel', status: null },
    { id: 'g4', label: 'Vehicle to trailer - mating joints', status: null },
    { id: 'g5', label: 'King pins to trailer', status: null },
    { id: 'g6', label: 'Security/condition of body', status: null },
    { id: 'g7', label: 'Condition of load securing device', status: null },
    { id: 'g8', label: 'Drawing attachment - securing & condition of operation', status: null },
    { id: 'g9', label: 'Other ancillary equipment', status: null },
  ]);

  const [tyreReadings, setTyreReadings] = useState<TyreReading[]>([
    { position: '1st', mm: '', psi: '' },
    { position: '2nd', mm: '', psi: '' },
    { position: '3rd', mm: '', psi: '' },
    { position: '4th', mm: '', psi: '' },
    { position: '5th', mm: '', psi: '' },
  ]);

  const [brakeTestSteer, setBrakeTestSteer] = useState('');
  const [brakeTestFront, setBrakeTestFront] = useState('');
  const [brakeTestPass, setBrakeTestPass] = useState<BrakeTestResult>(null);
  const [brakeEfficiency, setBrakeEfficiency] = useState<BrakeEfficiency>({
    service: '',
    parking: '',
  });


  const [rectificationDetails, setRectificationDetails] = useState<string[]>(['', '', '', '', '']);

  const [roadTestData, setRoadTestData] = useState({
    serviceBreakPerf: '',
    secondaryBreakPerf: '',
    parkingBreakPerf: '',
    injectorComments: '',
    rollerBrakeTest: '',
    efficiency_service: '',
    efficiency_parking: '',
    brake_axle1: '',
    brake_axle2: '',
    brake_axle3: '',
    brake_axle4: '',
  });

  const [dateOfBrake, setDateOfBrake] = useState('');
  const [inspected, setInspected] = useState(currentUser?.name || '');

  const toggleItemStatus = (items: InspectionItem[], setItems: React.Dispatch<React.SetStateAction<InspectionItem[]>>, id: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const nextStatus: CheckStatus = item.status === null ? 'pass' : item.status === 'pass' ? 'fail' : null;
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleSubmit = () => {
    if (!company || !make || !regNo) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    console.log('PC Workshop Inspection submitted:', {
      company,
      make,
      model,
      regNo,
      part1Items,
      groundLiftItems,
      tyreReadings,
      brakeTest: {
        steer: brakeTestSteer,
        front: brakeTestFront,
        pass: brakeTestPass,
        efficiency: brakeEfficiency,
      },
      roadTestData,
      rectificationDetails,
    });

    Alert.alert(
      'Success',
      'PC Workshop Inspection completed',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const renderCheckItem = (
    items: InspectionItem[],
    setItems: React.Dispatch<React.SetStateAction<InspectionItem[]>>,
    item: InspectionItem
  ) => (
    <View key={item.id} style={styles.checkRow}>
      <Text style={[styles.checkLabel, { color: colors.text }]}>{item.label}</Text>
      <View style={styles.checkButtons}>
        <TouchableOpacity
          style={[
            styles.checkButton,
            { borderColor: colors.border },
            item.status === 'pass' && { backgroundColor: '#10b981' },
          ]}
          onPress={() => toggleItemStatus(items, setItems, item.id)}
        >
          <Text style={[styles.checkButtonText, { color: item.status === 'pass' ? '#fff' : colors.text }]}>
            {item.status === 'pass' ? '✓' : 'MC'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.checkButton,
            { borderColor: colors.border },
            item.status === 'fail' && { backgroundColor: '#ef4444' },
          ]}
          onPress={() => {
            setItems(items.map(i => i.id === item.id ? { ...i, status: 'fail' as CheckStatus } : i));
          }}
        >
          <Text style={[styles.checkButtonText, { color: item.status === 'fail' ? '#fff' : colors.text }]}>
            IM NO
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
          title: 'PC Workshop Inspection',
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
            Safety Inspection and Maintenance Record Forms for Powered Vehicles
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>RHA - Road Haulage Association Limited</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Information</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Company *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={company}
                onChangeText={setCompany}
                placeholder="Company name"
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
              <Text style={[styles.label, { color: colors.text }]}>Reg no *</Text>
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
              <Text style={[styles.label, { color: colors.text }]}>Fleet no</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={fleetNo}
                onChangeText={setFleetNo}
                placeholder="Fleet no"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Body type</Text>
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
              <Text style={[styles.label, { color: colors.text }]}>Odo reading</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={odoReading}
                onChangeText={setOdoReading}
                placeholder="miles/km"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Chassis no</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={chassisNo}
                onChangeText={setChassisNo}
                placeholder="Chassis no"
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
                placeholder="ISO Week"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>D-Licence & Expiry Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={dLicenceExpiry}
                onChangeText={setDLicenceExpiry}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Tachograph Calibration date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={tachographCalDate}
                onChangeText={setTachographCalDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Last 2 year test date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={last2YearTestDate}
                onChangeText={setLast2YearTestDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>PART 1: INSPECTION</Text>
          {part1Items.map(item => renderCheckItem(part1Items, setPart1Items, item))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>GROUND LIFT</Text>
          {groundLiftItems.map(item => renderCheckItem(groundLiftItems, setGroundLiftItems, item))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>THREAD WEAR & TYRE PRESSURE</Text>
          {tyreReadings.map((tyre, index) => (
            <View key={index} style={styles.tyreRow}>
              <Text style={[styles.tyreLabel, { color: colors.text }]}>{tyre.position}</Text>
              <TextInput
                style={[styles.tyreInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={tyre.mm}
                onChangeText={(text) => {
                  const updated = [...tyreReadings];
                  updated[index].mm = text;
                  setTyreReadings(updated);
                }}
                placeholder="mm"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.tyreInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={tyre.psi}
                onChangeText={(text) => {
                  const updated = [...tyreReadings];
                  updated[index].psi = text;
                  setTyreReadings(updated);
                }}
                placeholder="PSI"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>BRAKES</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Steer</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={brakeTestSteer}
                onChangeText={setBrakeTestSteer}
                placeholder="Brake value"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Brake load</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={brakeTestFront}
                onChangeText={setBrakeTestFront}
                placeholder="Brake value"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Valve (n %)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={brakeEfficiency.service}
                onChangeText={(text) => setBrakeEfficiency({ ...brakeEfficiency, service: text })}
                placeholder="%"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>PART 2: RECTIFICATION</Text>
          <Text style={[styles.label, { color: colors.text }]}>DETAILS OF FAULTS</Text>
          {rectificationDetails.map((detail, index) => (
            <TextInput
              key={index}
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginTop: 8 }]}
              value={detail}
              onChangeText={(text) => {
                const updated = [...rectificationDetails];
                updated[index] = text;
                setRectificationDetails(updated);
              }}
              placeholder={`Fault ${index + 1}`}
              placeholderTextColor={colors.secondary}
              multiline
            />
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>C: Brake Test Roller Brake (if calibration)</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Service Brake Performance</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={roadTestData.serviceBreakPerf}
                onChangeText={(text) => setRoadTestData({ ...roadTestData, serviceBreakPerf: text })}
                placeholder="%"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Secondary Brake Performance</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={roadTestData.secondaryBreakPerf}
                onChangeText={(text) => setRoadTestData({ ...roadTestData, secondaryBreakPerf: text })}
                placeholder="%"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Parking Brake Performance</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={roadTestData.parkingBreakPerf}
                onChangeText={(text) => setRoadTestData({ ...roadTestData, parkingBreakPerf: text })}
                placeholder="%"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Injector Comments</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={roadTestData.injectorComments}
                onChangeText={(text) => setRoadTestData({ ...roadTestData, injectorComments: text })}
                placeholder="Comments"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>D: Road Test</Text>
            <View style={styles.roadTestButtons}>
              <TouchableOpacity
                style={[
                  styles.roadTestButton,
                  { borderColor: colors.border },
                  brakeTestPass === 'pass' && { backgroundColor: '#10b981' },
                ]}
                onPress={() => setBrakeTestPass('pass')}
              >
                <Text style={[styles.roadTestButtonText, { color: brakeTestPass === 'pass' ? '#fff' : colors.text }]}>
                  O/S
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roadTestButton,
                  { borderColor: colors.border },
                  brakeTestPass === 'not_serviceable' && { backgroundColor: '#ef4444' },
                ]}
                onPress={() => setBrakeTestPass('not_serviceable')}
              >
                <Text style={[styles.roadTestButtonText, { color: brakeTestPass === 'not_serviceable' ? '#fff' : colors.text }]}>
                  N/S
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Efficiency - Service</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={roadTestData.efficiency_service}
                onChangeText={(text) => setRoadTestData({ ...roadTestData, efficiency_service: text })}
                placeholder="%"
                placeholderTextColor={colors.secondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Axle 1</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={roadTestData.brake_axle1}
                onChangeText={(text) => setRoadTestData({ ...roadTestData, brake_axle1: text })}
                placeholder="°C"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Axle 2</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={roadTestData.brake_axle2}
                onChangeText={(text) => setRoadTestData({ ...roadTestData, brake_axle2: text })}
                placeholder="°C"
                placeholderTextColor={colors.secondary}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Axle 3</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={roadTestData.brake_axle3}
                onChangeText={(text) => setRoadTestData({ ...roadTestData, brake_axle3: text })}
                placeholder="°C"
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Date of Brake Assessment</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={dateOfBrake}
              onChangeText={setDateOfBrake}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.secondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Item Inspected</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={inspected}
              onChangeText={setInspected}
              placeholder="Inspector name"
              placeholderTextColor={colors.secondary}
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  checkButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  tyreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  tyreLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    width: 40,
  },
  tyreInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
  },
  roadTestButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  roadTestButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    flex: 1,
    alignItems: 'center',
  },
  roadTestButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
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
