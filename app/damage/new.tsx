import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { DamageReport } from '@/types';
import MachineryThumbnail from '@/components/MachineryThumbnail';

export default function NewDamageReportScreen() {
  const { colors } = useTheme();
  const { machinery, addDamageReport } = useFleet();
  const { currentUser } = useAuth();

  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [damageType, setDamageType] = useState<'general' | 'tyre'>('general');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get User's Location on Mount
  useEffect(() => {
    (async () => {
      setIsLocating(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to enable live tracking for the workshop.');
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setIsLocating(false);
    })();
  }, []);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMachineId) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please describe the damage');
      return;
    }

    setIsSubmitting(true);

    // ✅ FIX: location converted to string to match Type Definition
    const locationString = location 
      ? `${location.coords.latitude}, ${location.coords.longitude}`
      : "Unknown Location";

    const newReport: DamageReport = {
      id: Date.now().toString(),
      machineryId: selectedMachineId,
      reportedBy: currentUser?.name || 'Unknown',
      reportedAt: new Date().toISOString(),
      type: damageType,
      priority: priority,
      description: description,
      photos: photos,
      status: 'pending',
      location: locationString, // <--- Corrected here
    };

    await addDamageReport(newReport);

    setIsSubmitting(false);
    Alert.alert("Report Sent", "The workshop has been notified.", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  const selectedMachine = machinery.find(m => m.id === selectedMachineId);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Report Damage' }} />

        {/* 1. SELECT VEHICLE */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle</Text>
          {selectedMachine ? (
            <TouchableOpacity 
              style={[styles.selectedCard, { borderColor: colors.tint }]} 
              onPress={() => setSelectedMachineId(null)}
            >
              <MachineryThumbnail type={selectedMachine.type} size={40} photoUrl={selectedMachine.photoUrl} tintColor={colors.tint} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.machineName, { color: colors.text }]}>{selectedMachine.name}</Text>
                <Text style={[styles.machineReg, { color: colors.secondary }]}>{selectedMachine.registrationNumber}</Text>
              </View>
              <Ionicons name="close-circle" size={24} color={colors.secondary} />
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.machineList}>
              {machinery.map(m => (
                <TouchableOpacity 
                  key={m.id} 
                  style={[styles.machineChip, { borderColor: colors.border }]}
                  onPress={() => setSelectedMachineId(m.id)}
                >
                  <Text style={{ color: colors.text }}>{m.registrationNumber}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 2. DAMAGE TYPE */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Type of Damage</Text>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[
                styles.typeButton, 
                damageType === 'general' && { backgroundColor: colors.tint }
              ]}
              onPress={() => setDamageType('general')}
            >
              <Ionicons name="hammer" size={20} color={damageType === 'general' ? 'white' : colors.text} />
              <Text style={{ color: damageType === 'general' ? 'white' : colors.text, fontWeight: '600' }}>General</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.typeButton, 
                damageType === 'tyre' && { backgroundColor: colors.tint }
              ]}
              onPress={() => setDamageType('tyre')}
            >
              <Ionicons name="disc" size={20} color={damageType === 'tyre' ? 'white' : colors.text} />
              <Text style={{ color: damageType === 'tyre' ? 'white' : colors.text, fontWeight: '600' }}>Tyre Issue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. LOCATION STATUS */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.row}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
            {isLocating && <ActivityIndicator size="small" color={colors.tint} />}
          </View>
          {location ? (
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={16} color={colors.success} />
              <Text style={{ color: colors.text }}>
                {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
              </Text>
            </View>
          ) : (
            <Text style={{ color: colors.danger }}>Location unavailable. Workshop won't see live ETA.</Text>
          )}
        </View>

        {/* 4. DETAILS & PHOTOS */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Describe the issue..."
            placeholderTextColor={colors.secondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
          
          <TouchableOpacity style={[styles.photoButton, { borderColor: colors.border }]} onPress={handleTakePhoto}>
            <Ionicons name="camera" size={24} color={colors.tint} />
            <Text style={{ color: colors.tint, fontWeight: '600' }}>Add Photo</Text>
          </TouchableOpacity>

          <ScrollView horizontal style={{ marginTop: 12 }}>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoContainer}>
                <Text style={{ fontSize: 10, color: colors.secondary }}>Photo {i+1}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: colors.danger, opacity: isSubmitting ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>REPORT DAMAGE</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { padding: 16, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  machineList: { flexDirection: 'row', gap: 8 },
  machineChip: { padding: 12, borderRadius: 8, borderWidth: 1, marginRight: 8 },
  selectedCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 2, gap: 12 },
  machineName: { fontSize: 16, fontWeight: '700' },
  machineReg: { fontSize: 12 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  typeButton: { flex: 1, flexDirection: 'row', gap: 8, padding: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 100, textAlignVertical: 'top' },
  photoButton: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, marginTop: 12 },
  submitButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  submitText: { color: 'white', fontSize: 16, fontWeight: '800' },
  locationBadge: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#f0fdf4', padding: 8, borderRadius: 8, alignSelf: 'flex-start' },
  photoContainer: { width: 60, height: 60, backgroundColor: '#eee', marginRight: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }
});