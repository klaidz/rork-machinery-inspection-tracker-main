import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ArrowLeft, Navigation, AlertTriangle, FileText, MapPin, Edit, Check, Plus, X } from 'lucide-react-native';

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { fields } = useFleet(); 

  const field = fields.find(f => f.id === id);
  const [isEditing, setIsEditing] = useState(false);
  
  // State initialization fixed for complex objects
  const [tempNotes, setTempNotes] = useState(field?.notes || ''); 

  if (!field) return <View style={styles.container}><Text>Field not found</Text></View>;

  const openMaps = () => {
    const lat = field.entrance?.latitude || field.boundary[0].latitude;
    const lng = field.entrance?.longitude || field.boundary[0].longitude;
    const label = field.name;
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`
    });
    Linking.openURL(url as string);
  };

  const handleSave = () => {
    field.notes = tempNotes; 
    setIsEditing(false);
    Alert.alert('Updated', 'Field details saved successfully.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* 1. MAP HEADER */}
      <View style={styles.mapHeader}>
        <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
                latitude: field.boundary[0].latitude,
                longitude: field.boundary[0].longitude,
                latitudeDelta: 0.01, longitudeDelta: 0.01,
            }}
            mapType="hybrid"
            scrollEnabled={false}
        >
            <Polygon coordinates={field.boundary} strokeColor="#FACC15" fillColor="rgba(250, 204, 21, 0.4)" strokeWidth={2} />
            {field.entrance && <Marker coordinate={field.entrance} title="Entrance" pinColor="red" />}
            
            {/* Show Risk Pins on Viewer Map too */}
            {field.hazards.map((h, i) => (
               <Marker key={i} coordinate={h.location} title={h.label} pinColor="red">
                   <View style={{backgroundColor:'red', padding:4, borderRadius:4}}>
                       <AlertTriangle size={10} color="white"/>
                   </View>
               </Marker>
            ))}
        </MapView>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color="black" size={24} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)} style={styles.editBtn}>
            {isEditing ? <Check color="white" size={24} /> : <Edit color="black" size={24} />}
        </TouchableOpacity>

        <View style={styles.titleOverlay}>
            <Text style={styles.titleText}>{field.name}</Text>
            <Text style={styles.subText}>{field.area} Acres</Text>
        </View>
      </View>

      {/* 2. DETAILS CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>
        
        {!isEditing && (
            <TouchableOpacity style={styles.actionBtn} onPress={openMaps}>
                <Navigation size={24} color="white" />
                <Text style={styles.actionText}>Navigate to Entrance</Text>
            </TouchableOpacity>
        )}

        {/* NOTES */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.cardHeader}>
                <FileText size={20} color={colors.text} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Field Information</Text>
            </View>
            
            {isEditing ? (
                <TextInput 
                    style={[styles.input, {color: colors.text, borderColor: colors.border}]}
                    multiline
                    value={tempNotes}
                    onChangeText={setTempNotes}
                    placeholder="E.g. Gate code: 1234..."
                    placeholderTextColor={colors.secondary}
                />
            ) : (
                <Text style={{color: colors.text, fontSize:16, lineHeight:22}}>
                    {field.notes || 'No notes added.'}
                </Text>
            )}
        </View>

        {/* HAZARDS LIST (Fixed to show label) */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.cardHeader}>
                <AlertTriangle size={20} color="#ef4444" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Risk Assessment</Text>
            </View>

            {field.hazards && field.hazards.length > 0 ? (
                field.hazards.map((h, i) => (
                    <View key={i} style={{flexDirection:'row', justifyContent:'space-between', paddingVertical:4}}>
                        {/* FIX: Use h.label to render the text string */}
                        <Text style={{color: colors.text, fontSize:16}}>• {h.label}</Text>
                    </View>
                ))
            ) : (
                <Text style={{color: colors.secondary, fontStyle:'italic'}}>No recorded hazards.</Text>
            )}
        </View>

        {/* COORDS */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.cardHeader}>
                <MapPin size={20} color="#3b82f6" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Coordinates</Text>
            </View>
            <Text style={{color: colors.secondary}}>Lat: {field.boundary[0].latitude.toFixed(6)}</Text>
            <Text style={{color: colors.secondary}}>Lng: {field.boundary[0].longitude.toFixed(6)}</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapHeader: { height: 250, width: '100%', position: 'relative' },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'white', padding: 8, borderRadius: 20 },
  editBtn: { position: 'absolute', top: 50, right: 20, backgroundColor: '#3b82f6', padding: 8, borderRadius: 20, zIndex:10 },
  titleOverlay: { position: 'absolute', bottom: 20, left: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 8 },
  titleText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  subText: { color: '#FACC15', fontWeight: 'bold' },
  content: { padding: 20 },
  actionBtn: { flexDirection: 'row', backgroundColor: '#0284c7', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 },
  actionText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  card: { padding: 16, borderRadius: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16, minHeight: 60, textAlignVertical: 'top' }
});