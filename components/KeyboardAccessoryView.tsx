import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  useColorScheme,
} from 'react-native';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface KeyboardAccessoryViewProps {
  currentInputRef?: React.RefObject<TextInput>;
  nextInputRef?: React.RefObject<TextInput>;
  previousInputRef?: React.RefObject<TextInput>;
  onDone?: () => void;
}

export function KeyboardAccessoryView({
  currentInputRef,
  nextInputRef,
  previousInputRef,
  onDone,
}: KeyboardAccessoryViewProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  if (Platform.OS === 'web') {
    return null;
  }

  const handlePrevious = () => {
    if (previousInputRef?.current) {
      previousInputRef.current.focus();
    }
  };

  const handleNext = () => {
    if (nextInputRef?.current) {
      nextInputRef.current.focus();
    }
  };

  const handleDone = () => {
    currentInputRef?.current?.blur();
    onDone?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}>
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { borderColor: colors.border },
            !previousInputRef && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={!previousInputRef}
        >
          <ChevronUp
            size={20}
            color={previousInputRef ? colors.tint : colors.secondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            { borderColor: colors.border },
            !nextInputRef && styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!nextInputRef}
        >
          <ChevronDown
            size={20}
            color={nextInputRef ? colors.tint : colors.secondary}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={[styles.doneText, { color: colors.tint }]}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
