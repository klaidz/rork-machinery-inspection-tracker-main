import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import Colors from '@/constants/colors';
import { FileText, Search, X, DollarSign, Calendar, MapPin, Package } from 'lucide-react-native';

// 🛠️ FIXED: Correct Import Path
import { Invoice, InvoiceItem, Customer, TransportJob } from '../../types';

export default function CompletedJobCardsScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // 🛠️ FIXED: Using 'transportJobs' instead of 'jobCards'
  const { transportJobs, addInvoice, customers, addCustomer } = useFleet();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<TransportJob | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // Filter for only COMPLETED jobs
  const completedJobs = useMemo(() => {
    return transportJobs.filter(job => 
      job.status === 'completed' && 
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transportJobs, searchQuery]);

  // Invoice State
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: 'Transport Service', quantity: 1, rate: 0, amount: 0 },
  ]);

  const calculateTotal = () => invoiceItems.reduce((sum, item) => sum + item.amount, 0);

  const handleCreateInvoice = () => {
    if (!selectedJob) return;

    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: selectedJob.customerName, // Simplified linking
      date: new Date(),
      items: invoiceItems,
      total: calculateTotal(),
      status: 'draft',
    };

    addInvoice(newInvoice);
    setShowInvoiceModal(false);
    setSelectedJob(null);
    Alert.alert("Success", "Invoice Created!");
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...invoiceItems];
    const item = { ...newItems[index], [field]: value };
    
    // Auto-calc amount if rate/qty changes
    if (field === 'rate' || field === 'quantity') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    }
    
    newItems[index] = item as InvoiceItem;
    setInvoiceItems(newItems);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: 'Completed Jobs' }} />
      
      {/* SEARCH BAR */}
      <View style={{ padding: 15, backgroundColor: colors.tint }}>
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: 'white', 
          borderRadius: 10, 
          padding: 10, 
          alignItems: 'center' 
        }}>
          <Search color="#666" size={20} />
          <TextInput 
            placeholder="Search by customer..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, marginLeft: 10, fontSize: 16 }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color="#666" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* JOB LIST */}
      <View style={{ padding: 15 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 }}>
          Ready for Invoicing ({completedJobs.length})
        </Text>

        {completedJobs.map(job => (
          <TouchableOpacity 
            key={job.id}
            onPress={() => {
              setSelectedJob(job);
              setShowInvoiceModal(true);
            }}
            style={{
              backgroundColor: colors.cardBackground,
              padding: 15,
              borderRadius: 12,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: '#eee',
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{job.customerName}</Text>
              <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 }}>
                <Text style={{ color: '#2E7D32', fontSize: 12, fontWeight: 'bold' }}>COMPLETED</Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <MapPin size={14} color="#666" />
              <Text style={{ color: '#666', marginLeft: 5, fontSize: 13 }}>
                {job.dropoffLocation}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {completedJobs.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Package size={50} color="#ccc" />
            <Text style={{ color: '#999', marginTop: 10 }}>No completed jobs found.</Text>
          </View>
        )}
      </View>

      {/* INVOICE MODAL */}
      <Modal visible={showInvoiceModal} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Create Invoice</Text>
            <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
              <Text style={{ color: 'blue', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 20 }}>
            <Text style={{ color: '#666' }}>Customer</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{selectedJob?.customerName}</Text>
            
            <Text style={{ color: '#666' }}>Job Location</Text>
            <Text style={{ fontSize: 16 }}>{selectedJob?.dropoffLocation}</Text>
          </View>

          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Line Items</Text>
          {invoiceItems.map((item, index) => (
            <View key={index} style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10 }}>
              <TextInput 
                value={item.description}
                onChangeText={(text) => updateItem(index, 'description', text)}
                placeholder="Description"
                style={{ fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5, marginBottom: 10 }}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Rate (£)</Text>
                  <TextInput 
                    value={item.rate.toString()}
                    onChangeText={(text) => updateItem(index, 'rate', parseFloat(text) || 0)}
                    keyboardType="numeric"
                    style={{ backgroundColor: '#f9f9f9', padding: 10, borderRadius: 5, marginTop: 5 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: '#666' }}>Qty</Text>
                  <TextInput 
                    value={item.quantity.toString()}
                    onChangeText={(text) => updateItem(index, 'quantity', parseFloat(text) || 0)}
                    keyboardType="numeric"
                    style={{ backgroundColor: '#f9f9f9', padding: 10, borderRadius: 5, marginTop: 5 }}
                  />
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <Text style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>Amount</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginTop: 10 }}>
                    £{item.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity 
            onPress={handleCreateInvoice}
            style={{ 
              backgroundColor: Colors.light.tint, 
              padding: 15, 
              borderRadius: 10, 
              alignItems: 'center', 
              marginTop: 20 
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              Send Invoice (£{calculateTotal().toFixed(2)})
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}