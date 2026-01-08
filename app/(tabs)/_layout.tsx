import React from 'react';
import { Tabs, Link } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Chrome as Truck, LayoutDashboard, PlusCircle, FileText, UserCircle } from 'lucide-react-native';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: 'bold',
        },
        // GLOBAL HEADER RIGHT (Profile Button)
        headerRight: () => (
          <Link href="/profile" asChild>
            <TouchableOpacity style={{ marginRight: 16 }}>
              <UserCircle size={28} color={colors.tint} />
            </TouchableOpacity>
          </Link>
        ),
      }}
    >
      {/* 1. Dashboard Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />

      {/* 2. Machinery List Tab */}
      <Tabs.Screen
        name="machinery"
        options={{
          title: 'Fleet',
          tabBarLabel: 'Fleet',
          tabBarIcon: ({ color, size }) => <Truck color={color} size={size} />,
        }}
      />

      {/* 3. Add Button (Centered) */}
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add New',
          tabBarLabel: 'Add',
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={32} />,
        }}
      />

      {/* 4. Hide other screens from the tab bar if they exist in the folder but shouldn't be tabs */}
      <Tabs.Screen
        name="fields"
        options={{
          href: null, // Hides this from the bottom tab bar
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}