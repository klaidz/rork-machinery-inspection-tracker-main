import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { MapPin, Navigation, Wheat } from 'lucide-react-native';

// Mock Data for Fields
const FIELDS = [
  { id: '1', name: 'Big Field', crop: 'Wheat', acres: 120, location: '52.45,0.28' },
  { id: '2', name: 'Riverside', crop: 'Potatoes', acres: 85, location: '52.46,0.29' },
  { id: '3', name: 'Home Farm', crop: 'Barley', acres: 200, location: '52.44,0.27' },
  { id: '4', name: 'Chittering 3', crop: 'Sugar Beet', acres: 150, location: '52.43,0.30' },
];

export default function FieldsScreen() {
  const { colors } = useTheme();

  const openMaps = (loc: string) => {
    const url = `http://maps.apple.com/?ll=${loc}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Active Fields</Text>
      </View>

      <FlatList
        data={FIELDS}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.iconContainer}>
              <Wheat color={colors.tint} size={28} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.fieldName, { color: colors.text }]}>{item.name}</Text>
              <Text style={{ color: colors.secondary }}>{item.crop} • {item.acres} Acres</Text>
            </View>
            <TouchableOpacity 
              onPress={() => openMaps(item.location)}
              style={[styles.navButton, { backgroundColor: colors.tint + '20' }]}
            >
              <Navigation color={colors.tint} size={24} />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12 },
  iconContainer: { marginRight: 16 },
  info: { flex: 1 },
  fieldName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  navButton: { padding: 10, borderRadius: 8 }
});