import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps'; // <--- ADDED BACK
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import { Save, ArrowLeft, MapPin, Slash, Undo, AlertTriangle } from 'lucide-react-native';
import * as Location from 'expo-location';

const calculateAcres = (coords: any[]) => {
  if (coords.length < 3) return 0;
  const earthRadius = 6378137; 
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    area += (coords[j].longitude - coords[i].longitude) * (2 + Math.sin(coords[i].latitude * Math.PI / 180) + Math.sin(coords[j].latitude * Math.PI / 180));
  }
  area = (Math.abs(area) * earthRadius * earthRadius) / 2;
  return parseFloat((area * 0.000247105).toFixed(2));
};

export default function CreateFieldScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const { addField, farmers } = useFleet();

  const [selectedFarmerId, setSelectedFarmerId] = useState(params.farmerId || farmers[0]?.id || '');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'gateway' | 'boundary' | 'hazard'>('boundary');
  
  const [gateway, setGateway] = useState<any>(null);
  const [boundary, setBoundary] = useState<any[]>([]);
  const [hazards, setHazards] = useState<{id:string, location:any, label:string}[]>([]);
  const [acres, setAcres] = useState(0);

  const [region, setRegion] = useState({
    latitude: 52.4862, longitude: 0.11, latitudeDelta: 0.005, longitudeDelta: 0.005,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setRegion({ ...region, latitude: location.coords.latitude, longitude: location.coords.longitude });
      }
    })();
  }, []);

  const handleMapPress = (e: any) => {
    const coord = e.nativeEvent.coordinate;
    if (mode === 'gateway') setGateway(coord);
    else if (mode === 'boundary') {
        const newBoundary = [...boundary, coord];
        setBoundary(newBoundary);
        setAcres(calculateAcres(newBoundary));
    }
    else if (mode === 'hazard') {
        Alert.prompt(
            "New Hazard", "What is here?",
            [{ text: "Cancel", style: "cancel" },
             { text: "Add", onPress: (label?: string) => {
                 if (label) setHazards(prev => [...prev, { id: Date.now().toString(), location: coord, label }]);
             }}]
        );
    }
  };

  const handleUndo = () => {
    if (boundary.length > 0) {
        const newBoundary = boundary.slice(0, -1);
        setBoundary(newBoundary);
        setAcres(calculateAcres(newBoundary));
    }
  };

  const handleSave = async () => {
    if (!selectedFarmerId) { Alert.alert('Missing Farmer', 'Please select a Farmer.'); return; }
    if (!name) { Alert.alert('Missing Name', 'Please enter a Field Name'); return; }
    if (boundary.length < 3) { Alert.alert('Missing Boundary', 'Draw the field shape.'); return; }
    
    await addField({
      id: Date.now().toString(),
      farmerId: selectedFarmerId as string,
      name,
      boundary,
      area: acres,
      entrance: gateway || boundary[0],
      hazards, notes: '', accessCodes: ''
    });

    Alert.alert('Saved', `${name} created!`, [{ text: 'OK', onPress: () => router.navigate('/fields') }]);
  };

  const currentFarmerName = farmers.find(f => f.id === selectedFarmerId)?.name || 'Select Farmer';

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <View style={styles.row}>
            <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="black" /></TouchableOpacity>
            <Text style={styles.title}>New Field</Text>
            <TouchableOpacity onPress={handleSave}><Save size={24} color="#007AFF" /></TouchableOpacity>
        </View>

        <View style={{marginBottom:10}}>
            <Text style={{fontSize:12, fontWeight:'bold', color:'#666', marginBottom:4}}>DEPARTMENT / FARMER</Text>
            <View style={styles.lockedChip}><Text style={{color:'white', fontWeight:'bold'}}>{currentFarmerName}</Text></View>
        </View>

        <TextInput style={styles.input} placeholder="Field Name" placeholderTextColor="#666" value={name} onChangeText={setName} />

        <View style={styles.tabs}>
            <TouchableOpacity onPress={() => setMode('gateway')} style={[styles.tab, mode === 'gateway' ? {backgroundColor:'#fee2e2', borderColor:'red'} : {}]}>
                <MapPin size={16} color={mode==='gateway'?'red':'black'} /><Text style={{fontSize:12}}>Gateway</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('boundary')} style={[styles.tab, mode === 'boundary' ? {backgroundColor:'#e0f2fe', borderColor:'#0284c7'} : {}]}>
                <Slash size={16} color={mode==='boundary'?'#0284c7':'black'} /><Text style={{fontSize:12}}>Boundary</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMode('hazard')} style={[styles.tab, mode === 'hazard' ? {backgroundColor:'#fef3c7', borderColor:'#d97706'} : {}]}>
                <AlertTriangle size={16} color={mode==='hazard'?'#d97706':'black'} /><Text style={{fontSize:12}}>Risk Spot</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* MAP WITH GOOGLE PROVIDER RESTORED */}
      <MapView 
        provider={PROVIDER_GOOGLE} // <--- Forces usage of your API Key
        style={styles.map} 
        region={region} 
        mapType="hybrid" 
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {gateway && <Marker coordinate={gateway} pinColor="green" title="Entrance" />}
        {boundary.length > 0 && <Polygon coordinates={boundary} strokeColor="#FACC15" fillColor="rgba(250, 204, 21, 0.3)" strokeWidth={2} />}
        {boundary.map((p, i) => <Marker key={i} coordinate={p} anchor={{x:0.5,y:0.5}}><View style={styles.dot}/></Marker>)}
        {hazards.map((h, i) => (
            <Marker key={i} coordinate={h.location} title={h.label} pinColor="red">
                <View style={{backgroundColor:'red', padding:4, borderRadius:4}}><AlertTriangle size={10} color="white"/></View>
            </Marker>
        ))}
      </MapView>

      <View style={styles.floatBox}><Text style={styles.floatText}>{acres} Acres</Text></View>
      {mode === 'boundary' && boundary.length > 0 && (
          <TouchableOpacity style={styles.undoBtn} onPress={handleUndo}><Undo size={24} color="black" /></TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  panel: { padding: 16, paddingTop: 50, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#ddd' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 16, color:'black', backgroundColor:'#f9f9f9' },
  lockedChip: { alignSelf:'flex-start', backgroundColor:'#007AFF', paddingVertical:6, paddingHorizontal:12, borderRadius:20 },
  tabs: { flexDirection: 'row', gap: 10 },
  tab: { flex: 1, flexDirection:'row', justifyContent:'center', alignItems:'center', gap:5, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  map: { flex: 1 },
  dot: { width: 10, height: 10, backgroundColor: 'white', borderRadius: 5, borderWidth: 1 },
  floatBox: { position: 'absolute', top: 250, right: 20, backgroundColor: 'black', padding: 8, borderRadius: 8 },
  floatText: { color: '#FACC15', fontWeight: 'bold' },
  undoBtn: { position: 'absolute', bottom: 40, right: 20, backgroundColor: 'white', padding: 12, borderRadius: 30, elevation:5 }
});