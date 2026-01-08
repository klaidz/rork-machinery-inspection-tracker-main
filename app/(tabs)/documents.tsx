import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useDocuments } from '@/context/DocumentContext';
import { FileSignature, Plus, Trash2, ExternalLink, CheckCircle2 } from 'lucide-react-native';

export default function DocumentsScreen() {
  const { colors } = useTheme();
  const { currentUser: user } = useAuth();
  const { documents, addDocument, deleteDocument, markAsSigned } = useDocuments();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Only Admin/Manager can add new links
  const canEdit = user && ['admin', 'manager'].includes(user.role);

  const handleAdd = () => {
    if (!newTitle || !newUrl) return Alert.alert('Error', 'Please enter title and link');
    
    addDocument({
      id: Date.now().toString(),
      title: newTitle,
      url: newUrl,
      assignedTo: 'all',
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const openLink = async (url: string, id: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      // Ask user if they finished signing
      Alert.alert(
        'Did you sign it?',
        'Mark this document as signed?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => markAsSigned(id) }
        ]
      );
    } else {
      Alert.alert("Error", "Cannot open this link");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Digital Signatures</Text>
        {canEdit && (
          <TouchableOpacity onPress={() => setIsAdding(!isAdding)} style={[styles.addButton, { backgroundColor: colors.tint }]}>
            <Plus color="white" size={24} />
          </TouchableOpacity>
        )}
      </View>

      {/* ADMIN UPLOAD SECTION */}
      {isAdding && (
        <View style={[styles.form, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Upload Signing Link</Text>
          <TextInput 
            placeholder="Document Title (e.g. Contract 2026)" 
            placeholderTextColor={colors.secondary}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput 
            placeholder="Paste Adobe/DocuSign Link Here" 
            placeholderTextColor={colors.secondary}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={newUrl}
            onChangeText={setNewUrl}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={handleAdd} style={[styles.saveButton, { backgroundColor: colors.tint }]}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Post Link</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LIST OF DOCUMENTS */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {documents.map(doc => (
          <View key={doc.id} style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.cardIcon}>
              <FileSignature color={doc.status === 'signed' ? 'green' : colors.tint} size={32} />
            </View>
            
            <View style={{ flex: 1, paddingHorizontal: 12 }}>
              <Text style={[styles.docTitle, { color: colors.text }]}>{doc.title}</Text>
              <Text style={{ color: colors.secondary, fontSize: 12 }}>Status: {doc.status.toUpperCase()}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openLink(doc.url, doc.id)} style={[styles.actionBtn, { backgroundColor: colors.tint + '20' }]}>
                <ExternalLink size={20} color={colors.tint} />
              </TouchableOpacity>
              
              {canEdit && (
                <TouchableOpacity onPress={() => deleteDocument(doc.id)} style={[styles.actionBtn, { backgroundColor: 'red' + '20' }]}>
                  <Trash2 size={20} color="red" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: { padding: 10, borderRadius: 50 },
  form: { margin: 20, padding: 16, borderRadius: 12, marginTop: 0 },
  formTitle: { fontWeight: 'bold', marginBottom: 12 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 12 },
  saveButton: { padding: 12, borderRadius: 8, alignItems: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12 },
  cardIcon: { width: 40, alignItems: 'center' },
  docTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, borderRadius: 8 }
});