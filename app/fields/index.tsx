import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
import MapView, { Polygon, Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import { Plus, ArrowLeft, User, AlertTriangle, Navigation, Info } from 'lucide-react-native';

export default function FieldsMapScreen() {
  const router = useRouter();
  const { farmers, getFieldsByFarmer } = useFleet();
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);

  const displayFields = selectedFarmerId ? getFieldsByFarmer(selectedFarmerId) : [];

  // 🛰️ SAT-NAV: Routes to the first Entrance Pin found
  const handleRouteToFolder = () => {
    if (displayFields.length === 0) return;
    // Prefer Entrance Pin, fall back to Boundary start
    const target = displayFields[0].entrance || displayFields[0].boundary[0];
    const label = `${farmers.find(f=>f.id===selectedFarmerId)?.name} Yard`;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${target.latitude},${target.longitude}`,
      android: `geo:0,0?q=${target.latitude},${target.longitude}(${label})`
    });
    if(url) Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => selectedFarmerId ? setSelectedFarmerId(null) : router.back()} style={styles.iconBtn}>
            <ArrowLeft color="black" />
        </TouchableOpacity>
        
        <Text style={styles.title}>
            {selectedFarmerId ? farmers.find(f=>f.id===selectedFarmerId)?.name : 'Client Maps'}
        </Text>
        
        {/* 🔒 MANAGER ONLY: Hide 'Add' buttons on Mobile. Only show on Web. */}
        {Platform.OS === 'web' && (
            <View style={{flexDirection:'row', gap:8}}>
                {!selectedFarmerId && (
                     <TouchableOpacity onPress={() => router.push('/fields/new-farmer' as any)} style={[styles.textBtn, {backgroundColor:'#e0f2fe'}]}>
                        <Text style={{color:'#0284c7', fontWeight:'bold', fontSize:12}}>+ Farmer</Text>
                     </TouchableOpacity>
                )}
                {selectedFarmerId && (
                    <TouchableOpacity 
                        onPress={() => router.push({ pathname: '/fields/create', params: { farmerId: selectedFarmerId } })} 
                        style={[styles.textBtn, {backgroundColor:'#007AFF'}]}
                    >
                        <Plus color="white" size={16} />
                        <Text style={{color:'white', fontWeight:'bold', fontSize:12}}>Field</Text>
                    </TouchableOpacity>
                )}
            </View>
        )}
      </View>

      {/* 1. DEPARTMENT LIST (Select Farmer) */}
      {!selectedFarmerId && (
        <ScrollView contentContainerStyle={{padding:20}}>
            {farmers.length === 0 && (
                 <Text style={{color:'#666', textAlign:'center', marginTop:20}}>
                    No Clients found. Use the Web Dashboard to add them.
                 </Text>
            )}
            
            {farmers.map(f => (
                <TouchableOpacity key={f.id} onPress={() => setSelectedFarmerId(f.id)} style={styles.card}>
                    <View style={styles.avatar}>
                         <User size={24} color="white" />
                    </View>
                    <View style={{flex:1}}>
                        <Text style={{fontSize:18, fontWeight:'bold'}}>{f.name}</Text>
                        <Text style={{color:'#666'}}>{getFieldsByFarmer(f.id).length} Fields • {f.contactName || 'No Contact'}</Text>
                    </View>
                    <ArrowLeft size={20} color="#ccc" style={{transform:[{rotate:'180deg'}]}} />
                </TouchableOpacity>
            ))}
        </ScrollView>
      )}

      {/* 2. DRIVER VIEW (The Map) */}
      {selectedFarmerId && (
          <View style={{flex:1}}>
            <MapView 
                provider={PROVIDER_GOOGLE}
                style={{flex:1}} 
                mapType="hybrid"
                showsUserLocation={true} // 🔵 Shows Live Driver Location
                showsMyLocationButton={true}
                initialRegion={displayFields.length > 0 ? {
                    latitude: displayFields[0].boundary[0].latitude,
                    longitude: displayFields[0].boundary[0].longitude,
                    latitudeDelta: 0.05, longitudeDelta: 0.05,
                } : undefined}
            >
                {displayFields.map((field) => (
                    <React.Fragment key={field.id}>
                        {/* 🟡 Field Shape */}
                        <Polygon coordinates={field.boundary} strokeColor="#FACC15" fillColor="rgba(250, 204, 21, 0.4)" strokeWidth={2} />
                        
                        {/* ℹ️ Info Pin (Click for Name & Notes) */}
                        <Marker coordinate={field.boundary[0]} anchor={{x:0.5, y:0.5}}>
                            <Callout tooltip>
                                <View style={styles.calloutBubble}>
                                    <Text style={styles.calloutTitle}>{field.name}</Text>
                                    <Text style={styles.calloutNote}>{field.area} Acres</Text>
                                    {field.notes ? <Text style={styles.calloutNote}>📝 {field.notes}</Text> : null}
                                </View>
                            </Callout>
                            <View style={styles.infoDot}><Text style={{fontSize:10, fontWeight:'bold'}}>{field.name}</Text></View>
                        </Marker>

                        {/* 🟢 Entrance Pin */}
                        {field.entrance && (
                            <Marker coordinate={field.entrance} pinColor="green" title={`${field.name} Entrance`}>
                                <Callout><Text style={{fontWeight:'bold'}}>GATEWAY</Text></Callout>
                            </Marker>
                        )}

                        {/* 🔴 Hazard Pins */}
                        {field.hazards.map((h, i) => (
                            <Marker key={i} coordinate={h.location} title={h.label} pinColor="red">
                                <View style={{backgroundColor:'#ef4444', padding:4, borderRadius:4, borderWidth:1, borderColor:'white'}}>
                                    <AlertTriangle size={12} color="white"/>
                                </View>
                            </Marker>
                        ))}
                    </React.Fragment>
                ))}
            </MapView>

            {/* 🚀 Route Button */}
            <View style={styles.floatContainer}>
                {displayFields.length > 0 && (
                    <TouchableOpacity onPress={handleRouteToFolder} style={styles.routeBtn}>
                        <Navigation color="white" size={20} />
                        <Text style={{color:'white', fontWeight:'bold'}}>Navigate to {farmers.find(f=>f.id===selectedFarmerId)?.name}</Text>
                    </TouchableOpacity>
                )}
            </View>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor:'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingTop: 50, backgroundColor: 'white', alignItems: 'center', borderBottomWidth:1, borderColor:'#eee' },
  title: { fontSize: 18, fontWeight: 'bold' },
  iconBtn: { padding: 8, backgroundColor: '#eee', borderRadius: 8 },
  textBtn: { flexDirection:'row', alignItems:'center', gap:5, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  card: { flexDirection:'row', alignItems:'center', gap:15, padding:15, backgroundColor:'#f9f9f9', borderRadius:12, marginBottom:10, borderWidth:1, borderColor:'#eee' },
  avatar: { width:50, height:50, borderRadius:25, backgroundColor:'#007AFF', justifyContent:'center', alignItems:'center' },
  floatContainer: { position:'absolute', bottom:40, left:20, right:20, flexDirection:'row', justifyContent:'center', gap:10 },
  routeBtn: { flexDirection:'row', gap:8, backgroundColor:'#0284c7', padding:15, borderRadius:30, alignItems:'center', elevation:5, shadowColor:'black', shadowOpacity:0.3 },
  
  // Custom Map Markers
  infoDot: { backgroundColor: 'white', paddingHorizontal:6, paddingVertical:2, borderRadius:4, borderWidth:1, borderColor:'#ccc', opacity:0.9 },
  calloutBubble: { backgroundColor: 'white', padding:10, borderRadius:8, width: 200, borderWidth:1, borderColor:'#ccc' },
  calloutTitle: { fontWeight:'bold', fontSize:16, marginBottom:4 },
  calloutNote: { fontSize:14, color:'#555' }
});