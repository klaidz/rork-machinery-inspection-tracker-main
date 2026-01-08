import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Users } from 'lucide-react-native';

export default function StaffScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ title: 'Staff & Departments' }} />
      
      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
        <Users size={60} color="#ccc" />
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20, color: '#333' }}>
          Staff Management
        </Text>
        <Text style={{ color: '#666', marginTop: 10 }}>
          Manage your drivers and depot staff here.
        </Text>
      </View>
    </ScrollView>
  );
}