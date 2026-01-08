import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { loginWithCredentials } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const resetAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['current_user', 'users_list']);
      Alert.alert(
        'Success',
        'Authentication data reset. App will reload.',
        [{
          text: 'OK',
          onPress: () => {
            if (Platform.OS === 'web') {
              window.location.reload();
            }
          }
        }]
      );
    } catch (error) {
      console.error('[LoginScreen] Error resetting auth:', error);
      Alert.alert('Error', 'Failed to reset authentication data');
    }
  };

  const handleLogin = async () => {
    console.log('[LoginScreen] Login attempt starting...');
    console.log('[LoginScreen] Username/Email entered:', username.trim());
    console.log('[LoginScreen] Password length:', password.length);
    
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    const success = await loginWithCredentials(username.trim(), password);
    console.log('[LoginScreen] Login result:', success ? 'SUCCESS' : 'FAILED');

    if (success) {
      console.log('[LoginScreen] Redirecting to app...');
      router.replace('/(tabs)');
    } else {
      console.log('[LoginScreen] Showing error alert');
      Alert.alert(
        'Login Failed', 
        'Invalid username/email or password.\n\nPlease check your credentials and try again.\n\nYou can use either your username or email address to login.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <View style={[styles.logoWrapper, { backgroundColor: colors.cardBackground }]}
            testID="company-logo-wrapper"
          >
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/fsutpj7xzwzf6xt035yme' }}
              style={styles.logoImage}
              resizeMode="contain"
              testID="company-logo"
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Pretoria Energy</Text>
          <Text style={[styles.subtitle, { color: colors.secondary }] }>
            Sign in to continue
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Username / Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={colors.secondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              testID="username-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={colors.secondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              testID="password-input"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: colors.tint,
              },
            ]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={[styles.helpText, { color: colors.secondary }]}>
            Login credentials are provided by your administrator
          </Text>

          <View style={styles.debugSection}>
            <Text style={[styles.debugTitle, { color: colors.text }]}>Default Test Accounts:</Text>
            <Text style={[styles.debugText, { color: colors.secondary }]}>admin@fleet.com / 12345</Text>
            <Text style={[styles.debugText, { color: colors.secondary }]}>manager@fleet.com / 12345</Text>
            <Text style={[styles.debugText, { color: colors.secondary }]}>operator@fleet.com / 12345</Text>
            <Text style={[styles.debugText, { color: colors.secondary }]}>fitter@fleet.com / 12345</Text>
            <Text style={[styles.debugText, { color: colors.secondary }]}>mechanic@fleet.com / 12345</Text>
          </View>

          <TouchableOpacity
            style={[styles.resetButton, { borderColor: colors.border }]}
            onPress={resetAuthData}
            activeOpacity={0.7}
          >
            <Text style={[styles.resetButtonText, { color: colors.tint }]}>Reset Auth Data</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoWrapper: {
    width: 240,
    height: 240,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 4,
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  loginButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  testAccountsContainer: {
    gap: 4,
    alignItems: 'center',
  },
  testAccount: {
    fontSize: 13,
  },
  debugSection: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    gap: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  debugText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  resetButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 16,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
