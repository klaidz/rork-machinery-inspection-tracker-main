import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { Save, ArrowLeft, MapPin } from 'lucide-react-native';

export default function CreateBaleStackScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addBaleStack, fields } = useFleet();

  // NO 'NAME' STATE NEEDED
  const [quantity, setQuantity] = useState('');
  const [baleType, setBaleType] = useState<'straw' | 'hay' | 'silage'>('straw');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!quantity || !selectedFieldId) {
      Alert.alert('Missing Info', 'Please enter quantity and select a location.');
      return;
    }

    // FIX: Removed 'name' property from this object
    await addBaleStack({
      id: Date.now().toString(),
      fieldId: selectedFieldId,
      baleType,
      quantity: parseInt(quantity),
      dateCreated: new Date().toISOString(),
      notes
    });

    Alert.alert('Success', 'Stack recorded!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Stack</Text>
        <TouchableOpacity onPress={handleSave} style={{ padding: 8 }}>
          <Text style={{ color: colors.tint, fontWeight: 'bold' }}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 1. TYPE SELECTOR */}
        <Text style={[styles.label, { color: colors.secondary }]}>Bale Type</Text>
        <View style={styles.typeRow}>
            {['straw', 'hay', 'silage'].map((type) => (
                <TouchableOpacity
                    key={type}
                    style={[
                        styles.typeBtn, 
                        { 
                          backgroundColor: baleType === type ? colors.tint : colors.cardBackground,
                          borderColor: baleType === type ? colors.tint : colors.border
                        }
                    ]}
                    onPress={() => setBaleType(type as any)}
                >
                    <Text style={{ 
                        color: baleType === type ? 'white' : colors.text, 
                        fontWeight: 'bold', 
                        textTransform: 'capitalize' 
                    }}>
                        {type}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* 2. QUANTITY */}
        <Text style={[styles.label, { color: colors.secondary, marginTop: 20 }]}>Quantity</Text>
        <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, fontSize: 24, fontWeight: 'bold' }]}
            placeholder="0"
            placeholderTextColor={colors.secondary}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
        />

        {/* 3. LOCATION (Fields) */}
        <Text style={[styles.label, { color: colors.secondary, marginTop: 20 }]}>Location (Select Field)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fieldScroll}>
            {fields.length > 0 ? fields.map(field => (
                <TouchableOpacity
                    key={field.id}
                    style={[
                        styles.fieldCard,
                        { 
                            backgroundColor: selectedFieldId === field.id ? '#dcfce7' : colors.cardBackground,
                            borderColor: selectedFieldId === field.id ? 'green' : colors.border
                        }
                    ]}
                    onPress={() => setSelectedFieldId(field.id)}
                >
                    <MapPin size={16} color={selectedFieldId === field.id ? 'green' : colors.secondary} />
                    <Text style={{ fontWeight: 'bold', color: colors.text, marginTop: 4 }}>{field.name}</Text>
                    <Text style={{ fontSize: 10, color: colors.secondary }}>{field.crop || 'Field'}</Text>
                </TouchableOpacity>
            )) : (
                <Text style={{color: colors.secondary, fontStyle: 'italic'}}>
                    No fields created yet. Go to Maps to add one.
                </Text>
            )}
        </ScrollView>

        {/* 4. NOTES */}
        <Text style={[styles.label, { color: colors.secondary, marginTop: 20 }]}>Notes</Text>
        <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, height: 80, textAlignVertical: 'top' }]}
            placeholder="e.g. Stacked near the gate..."
            placeholderTextColor={colors.secondary}
            multiline
            value={notes}
            onChangeText={setNotes}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  fieldScroll: { flexDirection: 'row', gap: 10 },
  fieldCard: { width: 100, padding: 12, borderRadius: 8, borderWidth: 1, marginRight: 10, alignItems: 'center' }
});