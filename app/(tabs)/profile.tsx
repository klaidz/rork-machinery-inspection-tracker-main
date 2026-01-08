import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Save, Mail, Hash, ArrowLeft } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { currentUser, updateUserProfile } = useAuth(); 
  
  const [payrollNumber, setPayrollNumber] = useState(currentUser?.payrollNumber || '');
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photoUrl || '');

  const handleUpdatePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to update your profile.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    if (updateUserProfile) {
      await updateUserProfile(currentUser.id, {
        payrollNumber,
        photoUrl
      });
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', 'Update function missing in AuthContext');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>My Profile</Text>
          <View style={{ width: 24 }} /> 
        </View>

        {/* PHOTO SECTION */}
        <View style={styles.photoContainer}>
          <Image 
            source={{ uri: photoUrl || 'https://placehold.co/150/png' }} 
            style={[styles.avatar, { borderColor: colors.cardBackground }]} 
          />
          <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: colors.tint }]} onPress={handleUpdatePhoto}>
            <Camera color="white" size={20} />
          </TouchableOpacity>
        </View>

        {/* USER NAME */}
        <Text style={[styles.userName, { color: colors.text }]}>{currentUser?.name || 'User'}</Text>
        <Text style={[styles.userRole, { color: colors.secondary }]}>{currentUser?.role?.toUpperCase() || 'DRIVER'}</Text>

        {/* FORM */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>Payroll Number</Text>
            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
              <Hash color={colors.secondary} size={20} />
              <TextInput 
                style={[styles.input, { color: colors.text }]}
                value={payrollNumber}
                onChangeText={setPayrollNumber}
                placeholder="Enter Payroll No."
                placeholderTextColor={colors.secondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>Email</Text>
            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.cardBackground, opacity: 0.7 }]}>
              <Mail color={colors.secondary} size={20} />
              <Text style={[styles.inputText, { color: colors.text }]}>{currentUser?.email || 'email@example.com'}</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.tint }]} onPress={handleSave}>
            <Save color="white" size={20} />
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, alignItems: 'center' },
  header: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: 'bold' },
  photoContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4 },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, padding: 10, borderRadius: 20 },
  userName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  userRole: { fontSize: 14, fontWeight: '600', marginBottom: 32 },
  form: { width: '100%', gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 50, gap: 12 },
  input: { flex: 1, fontSize: 16 },
  inputText: { flex: 1, fontSize: 16 },
  saveBtn: { flexDirection: 'row', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});