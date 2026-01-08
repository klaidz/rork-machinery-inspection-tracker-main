import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTimesheet } from '@/context/TimesheetContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function ShiftTimer() {
  const { colors } = useTheme();
  const { currentUser } = useAuth();

  const { isOnShift, startShift, finishShift, getActiveShiftDuration } = useTimesheet();

  const [durationString, setDurationString] = useState('00:00:00');

  // Update timer every second if on shift
  useEffect(() => {
    // FIX 1: Use 'any' to avoid conflict between Node.js and Browser timeouts
    let interval: any;

    // Initial update
    setDurationString(getActiveShiftDuration());

    if (isOnShift) {
      interval = setInterval(() => {
        setDurationString(getActiveShiftDuration());
      }, 1000);
    } else {
      setDurationString('00:00:00');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnShift, getActiveShiftDuration]);

  const handleToggleShift = () => {
    if (isOnShift) {
      Alert.alert(
        'Finish Shift',
        'Are you sure you want to finish your shift?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Finish', style: 'destructive', onPress: finishShift }
        ]
      );
    } else {
      startShift();
    }
  };

  if (!currentUser) return null;

  return (
    // FIX 2: Updated property name to 'cardBackground'
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.infoContainer}>
        {/* FIX 3: Updated property name to 'secondary' */}
        <Text style={[styles.label, { color: colors.secondary }]}>
          {isOnShift ? 'CURRENT SHIFT' : 'OFF DUTY'}
        </Text>
        {/* FIX 4: Updated property name to 'tint' */}
        <Text style={[styles.timer, { color: isOnShift ? colors.tint : colors.text }]}>
          {durationString}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isOnShift ? '#FF3B30' : '#34C759' }
        ]}
        onPress={handleToggleShift}
      >
        <Ionicons name={isOnShift ? "stop" : "play"} size={24} color="white" />
        <Text style={styles.buttonText}>
          {isOnShift ? 'End Shift' : 'Start Shift'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// FIX 5: Ensure styles are defined outside the component
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  timer: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});