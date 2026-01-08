import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { MapPin, Plus, ChevronRight, Package } from 'lucide-react-native';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Location, BaleStack } from '@/types';

type ListItem = 
  | { type: 'section'; title: string }
  | { type: 'location'; data: Location }
  | { type: 'balestack'; data: BaleStack };

export default function LocationsScreen() {
  const { colors } = useTheme();
  const { locations, baleStacks } = useFleet();
  const { isManagerOrAdmin } = useAuth();

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={[styles.locationCard, { backgroundColor: colors.cardBackground }]}
      onPress={() => router.push({ pathname: '/location/[id]' as any, params: { id: item.id } })}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
        <MapPin color={colors.tint} size={24} />
      </View>
      
      <View style={styles.locationInfo}>
        <Text style={[styles.locationName, { color: colors.text }]}>{item.name}</Text>
        {item.address ? (
          <Text style={[styles.locationAddress, { color: colors.secondary }]} numberOfLines={1}>
            {item.address}
          </Text>
        ) : null}
        <Text style={[styles.locationCoords, { color: colors.secondary }]}>
          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </Text>
      </View>

      <ChevronRight color={colors.secondary} size={20} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Locations',
          headerShown: true,
          headerRight: isManagerOrAdmin
            ? () => (
                <TouchableOpacity
                  onPress={() => router.push('/location/new' as any)}
                  style={styles.headerButton}
                >
                  <Plus color={colors.tint} size={24} />
                </TouchableOpacity>
              )
            : undefined,
        }}
      />

      {locations.length === 0 && baleStacks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MapPin color={colors.secondary} size={64} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Locations Yet</Text>
          <Text style={[styles.emptyText, { color: colors.secondary }]}>
            {isManagerOrAdmin
              ? 'Create locations and bale stacks to track operations'
              : 'Ask your admin to create locations'}
          </Text>
          {isManagerOrAdmin ? (
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/location/new' as any)}
            >
              <Plus color="#FFFFFF" size={20} />
              <Text style={styles.createButtonText}>Create Location</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <>
          <FlatList
            data={[
              { type: 'section' as const, title: 'Locations' },
              ...locations.map(loc => ({ type: 'location' as const, data: loc })),
              { type: 'section' as const, title: 'Bale Stacks' },
              ...baleStacks.map(stack => ({ type: 'balestack' as const, data: stack })),
            ] as ListItem[]}
            keyExtractor={(item, index) => 
              item.type === 'section' 
                ? `section-${index}` 
                : item.type === 'location'
                ? `loc-${item.data.id}`
                : `stack-${item.data.id}`
            }
            renderItem={({ item }) => {
              if (item.type === 'section') {
                return (
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{item.title}</Text>
                    {item.title === 'Bale Stacks' && isManagerOrAdmin && (
                      <TouchableOpacity
                        onPress={() => router.push('/balestack/new' as any)}
                        style={styles.sectionButton}
                      >
                        <Plus color={colors.tint} size={20} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }
              
              if (item.type === 'location') {
                return renderLocationItem({ item: item.data as Location });
              }

              if (item.type === 'balestack') {
                const stack = item.data as BaleStack;
                return (
                  <TouchableOpacity
                    style={[styles.locationCard, { backgroundColor: colors.cardBackground }]}
                    onPress={() => router.push({ pathname: '/balestack/[id]' as any, params: { id: stack.id } })}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: '#10B981' + '20' }]}>       
                      <Package color="#10B981" size={24} />
                    </View>
                    
                    <View style={styles.locationInfo}>
                      <Text style={[styles.locationName, { color: colors.text }]}>{stack.name}</Text>
                      <Text style={[styles.baleCount, { color: '#10B981' }]}>
                        {stack.currentCount} bales
                      </Text>
                      {stack.address ? (
                        <Text style={[styles.locationAddress, { color: colors.secondary }]} numberOfLines={1}>
                          {stack.address}
                        </Text>
                      ) : (
                        <Text style={[styles.locationCoords, { color: colors.secondary }]}>
                          {stack.latitude.toFixed(4)}, {stack.longitude.toFixed(4)}
                        </Text>
                      )}
                    </View>

                    <ChevronRight color={colors.secondary} size={20} />
                  </TouchableOpacity>
                );
              }

              return null;
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
    gap: 4,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  locationCoords: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  sectionButton: {
    padding: 8,
  },
  baleCount: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
