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
  Share,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';
import { FileText, Search, X, DollarSign, Mail, Calendar, User } from 'lucide-react-native';
import { Invoice } from '@/types';

export default function InvoicesListScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { invoices, customers, jobCards, updateInvoice } = useFleet();
  const { isAdmin, isManager } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return sortedInvoices;
    const query = searchQuery.toLowerCase();
    return sortedInvoices.filter((invoice) => {
      const customer = customers.find((c) => c.id === invoice.customerId);
      const customerName = customer?.name.toLowerCase() || '';
      const invoiceNumber = invoice.invoiceNumber.toLowerCase();
      return customerName.includes(query) || invoiceNumber.includes(query);
    });
  }, [sortedInvoices, searchQuery, customers]);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const generateInvoiceText = (invoice: Invoice) => {
    const customer = customers.find((c) => c.id === invoice.customerId);
    const jobCard = jobCards.find((jc) => jc.id === invoice.jobCardId);

    let text = `INVOICE\n\n`;
    text += `Invoice Number: ${invoice.invoiceNumber}\n`;
    text += `Date: ${new Date(invoice.date).toLocaleDateString()}\n`;
    text += `Status: ${invoice.status === 'paid' ? 'PAID' : 'PENDING'}\n\n`;
    
    text += `CUSTOMER DETAILS\n`;
    text += `Name: ${customer?.name || 'Unknown'}\n`;
    text += `Email: ${customer?.email || 'N/A'}\n`;
    text += `Phone: ${customer?.phone || 'N/A'}\n`;
    if (customer?.address) {
      text += `Address: ${customer.address}\n`;
    }
    text += `\n`;

    if (jobCard) {
      text += `JOB DETAILS\n`;
      text += `Job Card: #${jobCard.id.slice(-8)}\n`;
      text += `Materials: ${jobCard.materials}\n`;
      text += `Loading: ${jobCard.loadingLocation}\n`;
      text += `Unloading: ${jobCard.unloadingLocation}\n\n`;
    }

    text += `ITEMS\n`;
    text += `${'='.repeat(50)}\n`;
    invoice.items.forEach((item, index) => {
      text += `${index + 1}. ${item.description}\n`;
      text += `   Qty: ${item.quantity} × $${item.rate.toFixed(2)} = $${item.amount.toFixed(2)}\n`;
    });
    text += `${'='.repeat(50)}\n`;
    text += `TOTAL: $${invoice.amount.toFixed(2)}\n\n`;

    if (invoice.notes) {
      text += `NOTES\n${invoice.notes}\n\n`;
    }

    text += `Thank you for your business!\n`;
    return text;
  };

  const handleSendEmail = async (invoice: Invoice) => {
    const customer = customers.find((c) => c.id === invoice.customerId);
    if (!customer) {
      Alert.alert('Error', 'Customer not found');
      return;
    }

    setEmailSending(true);
    try {
      const invoiceText = generateInvoiceText(invoice);
      const subject = `Invoice ${invoice.invoiceNumber}`;
      const body = invoiceText;

      if (Platform.OS === 'web') {
        const mailtoUrl = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl, '_blank');
      } else {
        const result = await Share.share({
          title: subject,
          message: `To: ${customer.email}\n\n${body}`,
        });
        
        if (result.action === Share.sharedAction) {
          Alert.alert('Success', 'Invoice shared successfully');
        }
      }
    } catch (error) {
      console.error('Error sharing invoice:', error);
      Alert.alert('Error', 'Failed to share invoice');
    } finally {
      setEmailSending(false);
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    Alert.alert(
      'Mark as Paid',
      `Mark invoice ${invoice.invoiceNumber} as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          onPress: async () => {
            await updateInvoice(invoice.id, { status: 'paid' });
            Alert.alert('Success', 'Invoice marked as paid');
            setShowDetailModal(false);
          },
        },
      ]
    );
  };

  if (!isAdmin && !isManager) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Invoices' }} />
        <View style={styles.errorContainer}>
          <FileText color={colors.secondary} size={64} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Access Denied
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.secondary }]}>
            Only admins and managers can view invoices
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Invoices' }} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>All Invoices</Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
          {invoices.length} total • {invoices.filter(inv => inv.status === 'pending').length} pending
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Search color={colors.secondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by customer or invoice number..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredInvoices.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
            <FileText color={colors.secondary} size={48} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery ? 'No matching invoices found' : 'No invoices yet'}
            </Text>
          </View>
        ) : (
          filteredInvoices.map((invoice) => {
            const customer = customers.find((c) => c.id === invoice.customerId);
            const jobCard = jobCards.find((jc) => jc.id === invoice.jobCardId);
            
            return (
              <TouchableOpacity
                key={invoice.id}
                style={[styles.invoiceCard, { backgroundColor: colors.cardBackground }]}
                onPress={() => handleViewInvoice(invoice)}
                activeOpacity={0.7}
              >
                <View style={styles.invoiceHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.invoiceNumber, { color: colors.text }]}>
                      {invoice.invoiceNumber}
                    </Text>
                    <Text style={[styles.customerName, { color: colors.secondary }]}>
                      {customer?.name || 'Unknown Customer'}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: invoice.status === 'paid' ? colors.success + '20' : colors.warning + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: invoice.status === 'paid' ? colors.success : colors.warning }
                    ]}>
                      {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>

                <View style={styles.invoiceDetails}>
                  <View style={styles.detailRow}>
                    <Calendar color={colors.secondary} size={14} />
                    <Text style={[styles.detailText, { color: colors.secondary }]}>
                      {new Date(invoice.date).toLocaleDateString()}
                    </Text>
                  </View>
                  {jobCard && (
                    <View style={styles.detailRow}>
                      <FileText color={colors.secondary} size={14} />
                      <Text style={[styles.detailText, { color: colors.secondary }]}>
                        Job #{jobCard.id.slice(-8)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.invoiceFooter}>
                  <Text style={[styles.amountLabel, { color: colors.secondary }]}>Amount:</Text>
                  <Text style={[styles.amountValue, { color: colors.tint }]}>
                    ${invoice.amount.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {selectedInvoice && (
        <Modal visible={showDetailModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedInvoice.invoiceNumber}
                </Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                  <X color={colors.text} size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={[styles.statusBadgeLarge, { 
                  backgroundColor: selectedInvoice.status === 'paid' ? colors.success + '20' : colors.warning + '20' 
                }]}>
                  <Text style={[
                    styles.statusTextLarge,
                    { color: selectedInvoice.status === 'paid' ? colors.success : colors.warning }
                  ]}>
                    {selectedInvoice.status === 'paid' ? 'PAID' : 'PENDING'}
                  </Text>
                </View>

                <View style={[styles.section, { backgroundColor: colors.background }]}>
                  <View style={styles.sectionHeader}>
                    <User color={colors.tint} size={18} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer</Text>
                  </View>
                  <Text style={[styles.sectionValue, { color: colors.text }]}>
                    {customers.find(c => c.id === selectedInvoice.customerId)?.name || 'Unknown'}
                  </Text>
                  <Text style={[styles.sectionSubvalue, { color: colors.secondary }]}>
                    {customers.find(c => c.id === selectedInvoice.customerId)?.email || 'N/A'}
                  </Text>
                </View>

                <View style={[styles.section, { backgroundColor: colors.background }]}>
                  <View style={styles.sectionHeader}>
                    <FileText color={colors.tint} size={18} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Invoice Details</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.secondary }]}>Date:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {new Date(selectedInvoice.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.secondary }]}>Job Card:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      #{jobCards.find(jc => jc.id === selectedInvoice.jobCardId)?.id.slice(-8) || 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.section, { backgroundColor: colors.background }]}>
                  <View style={styles.sectionHeader}>
                    <DollarSign color={colors.tint} size={18} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Items</Text>
                  </View>
                  {selectedInvoice.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemDescription, { color: colors.text }]}>
                          {item.description}
                        </Text>
                        <Text style={[styles.itemDetails, { color: colors.secondary }]}>
                          {item.quantity} × ${item.rate.toFixed(2)}
                        </Text>
                      </View>
                      <Text style={[styles.itemAmount, { color: colors.text }]}>
                        ${item.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
                    <Text style={[styles.totalAmount, { color: colors.tint }]}>
                      ${selectedInvoice.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {selectedInvoice.notes && (
                  <View style={[styles.section, { backgroundColor: colors.background }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
                    <Text style={[styles.notesText, { color: colors.secondary }]}>
                      {selectedInvoice.notes}
                    </Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.tint }]}
                    onPress={() => handleSendEmail(selectedInvoice)}
                    disabled={emailSending}
                  >
                    <Mail color="#FFFFFF" size={20} />
                    <Text style={styles.actionButtonText}>
                      {emailSending ? 'Sending...' : 'Send to Customer'}
                    </Text>
                  </TouchableOpacity>

                  {selectedInvoice.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.success }]}
                      onPress={() => handleMarkAsPaid(selectedInvoice)}
                    >
                      <DollarSign color="#FFFFFF" size={20} />
                      <Text style={styles.actionButtonText}>Mark as Paid</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  invoiceCard: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  invoiceDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  emptyCard: {
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  modalContent: {
    padding: 20,
  },
  statusBadgeLarge: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusTextLarge: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  sectionValue: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  sectionSubvalue: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  itemDescription: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 13,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
