import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronDown, Save, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import SearchableSelectModal from '@/components/SearchableSelectModal';
import { useTests } from '@/context/TestContext';
import { useAuth } from '@/context/AuthContext';

const MATERIALS = [
  'Concrete',
  'Steel',
  'Aluminum',
  'Copper',
  'Plastic',
  'Wood',
  'Rubber',
  'Glass',
  'Ceramic',
  'Composite',
  'Other',
];

export default function LabEntryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  useTests();
  const { currentUser } = useAuth();

  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [testValues, setTestValues] = useState<string[]>(['', '', '', '', '', '']);
  const [testLabels, setTestLabels] = useState<string[]>([
    'Test 1',
    'Test 2',
    'Test 3',
    'Test 4',
    'Test 5',
    'Test 6',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!selectedMaterial) {
      Alert.alert('Error', 'Please select a material');
      return;
    }

    const filledValues = testValues.filter((v) => v.trim() !== '');
    if (filledValues.length === 0) {
      Alert.alert('Error', 'Please enter at least one test value');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const labData = {
        material: selectedMaterial,
        testValues: testValues.map((value, index) => ({
          label: testLabels[index],
          value: value,
        })),
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
      };

      console.log('Lab entry data:', labData);

      Alert.alert('Success', 'Lab entry saved successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving lab entry:', error);
      Alert.alert('Error', 'Failed to save lab entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (selectedMaterial || testValues.some((v) => v.trim() !== '')) {
      Alert.alert('Discard Changes?', 'Are you sure you want to discard this entry?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Lab Entry',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Material Selection</Text>
            <TouchableOpacity
              style={[
                styles.materialSelector,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
              ]}
              onPress={() => setShowMaterialModal(true)}
            >
              <Text
                style={[
                  styles.materialText,
                  { color: selectedMaterial ? colors.text : colors.secondary },
                ]}
              >
                {selectedMaterial || 'Select Material'}
              </Text>
              <ChevronDown size={20} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Test Values</Text>
            <Text style={[styles.sectionDescription, { color: colors.secondary }]}>
              Enter the test values below. You can customize the label by tapping on it.
            </Text>

            {testValues.map((value, index) => (
              <View key={index} style={styles.testBox}>
                <TouchableOpacity
                  style={styles.labelContainer}
                  onPress={() => {
                    Alert.prompt(
                      'Edit Label',
                      'Enter a name for this test',
                      (text) => {
                        if (text) {
                          const newLabels = [...testLabels];
                          newLabels[index] = text;
                          setTestLabels(newLabels);
                        }
                      },
                      'plain-text',
                      testLabels[index]
                    );
                  }}
                >
                  <Text style={[styles.testLabel, { color: colors.secondary }]}>
                    {testLabels[index]}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  style={[
                    styles.testInput,
                    { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.border },
                  ]}
                  placeholder="Enter value"
                  placeholderTextColor={colors.secondary}
                  value={value}
                  onChangeText={(text) => {
                    const newValues = [...testValues];
                    newValues[index] = text;
                    setTestValues(newValues);
                  }}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>
        </ScrollView>
        </TouchableWithoutFeedback>

        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>{isSubmitting ? 'Saving...' : 'Save Entry'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <SearchableSelectModal
        visible={showMaterialModal}
        items={MATERIALS.map((m) => ({ id: m, label: m }))}
        selectedIds={selectedMaterial ? [selectedMaterial] : []}
        onSelect={(materialId) => {
          setSelectedMaterial(materialId);
          setShowMaterialModal(false);
        }}
        onClose={() => setShowMaterialModal(false)}
        title="Select Material"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  materialSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  materialText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  testBox: {
    marginBottom: 20,
  },
  labelContainer: {
    marginBottom: 8,
  },
  testLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  testInput: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
