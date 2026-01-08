import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useWorkshopParts } from '@/context/WorkshopPartsContext';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';
import { 
  Search, 
  X, 
  Calendar, 
  Package, 
  Wrench,
  Clock,
  User,
  FileText,
  Trash2,
  ChevronDown,
} from 'lucide-react-native';

type TimeFilter = 'all' | 'today' | 'week' | 'month' | 'year';
type SortOption = 'date_desc' | 'date_asc' | 'reg_asc' | 'reg_desc';

export default function WorkshopJobCardsScreen() {
  const { colors } = useTheme();
  const { jobCards, deleteJobCard, stockItems } = useWorkshopParts();
  const { machinery } = useFleet();
  const { hasRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [selectedJobCard, setSelectedJobCard] = useState<string | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);

  const canDelete = hasRole(['admin', 'manager']);

  const filteredAndSortedJobCards = useMemo(() => {
    let filtered = [...jobCards];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    if (timeFilter === 'today') {
      filtered = filtered.filter((card) => new Date(card.date) >= todayStart);
    } else if (timeFilter === 'week') {
      filtered = filtered.filter((card) => new Date(card.date) >= weekStart);
    } else if (timeFilter === 'month') {
      filtered = filtered.filter((card) => new Date(card.date) >= monthStart);
    } else if (timeFilter === 'year') {
      filtered = filtered.filter((card) => new Date(card.date) >= yearStart);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.registrationNumber.toLowerCase().includes(query) ||
          card.workDescription.toLowerCase().includes(query) ||
          card.completedBy.toLowerCase().includes(query) ||
          card.partsUsed.some((part) => 
            part.partName.toLowerCase().includes(query) || 
            part.partNumber.toLowerCase().includes(query)
          )
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        case 'date_asc':
          return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
        case 'reg_asc':
          return a.registrationNumber.localeCompare(b.registrationNumber);
        case 'reg_desc':
          return b.registrationNumber.localeCompare(a.registrationNumber);
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobCards, timeFilter, searchQuery, sortBy]);

  const selectedJobCardData = useMemo(() => {
    if (!selectedJobCard) return null;
    return jobCards.find((card) => card.id === selectedJobCard);
  }, [selectedJobCard, jobCards]);

  const selectedMachine = useMemo(() => {
    if (!selectedJobCardData) return null;
    return machinery.find((m) => m.id === selectedJobCardData.machineryId);
  }, [selectedJobCardData, machinery]);

  const handleDeleteJobCard = (jobCardId: string) => {
    Alert.alert(
      'Delete Job Card',
      'Are you sure you want to delete this job card? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteJobCard(jobCardId);
            setSelectedJobCard(null);
            console.log('[WorkshopJobCards] Deleted job card:', jobCardId);
          },
        },
      ]
    );
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'date_desc':
        return 'Date (Newest First)';
      case 'date_asc':
        return 'Date (Oldest First)';
      case 'reg_asc':
        return 'Registration (A-Z)';
      case 'reg_desc':
        return 'Registration (Z-A)';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Workshop Job Cards' }} />
      
      <View style={styles.header}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}>
          <Search color={colors.secondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search job cards..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color={colors.secondary} size={20} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {(['all', 'today', 'week', 'month', 'year'] as TimeFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                { backgroundColor: colors.cardBackground },
                timeFilter === filter && { backgroundColor: colors.tint },
              ]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.text },
                  timeFilter === filter && { color: '#FFFFFF' },
                ]}
              >
                {filter === 'all' ? 'All Time' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: colors.cardBackground }]}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={[styles.sortButtonText, { color: colors.text }]}>
            {getSortLabel(sortBy)}
          </Text>
          <ChevronDown color={colors.text} size={18} />
        </TouchableOpacity>
      </View>

      <View style={[styles.statsBar, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {filteredAndSortedJobCards.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Job Cards</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {filteredAndSortedJobCards.reduce((sum, card) => sum + card.partsUsed.length, 0)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Parts Used</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {filteredAndSortedJobCards.reduce((sum, card) => sum + card.laborHours, 0).toFixed(1)}h
          </Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Total Hours</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredAndSortedJobCards.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
            <Calendar color={colors.secondary} size={48} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No Job Cards Found</Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              {searchQuery.trim() ? 'Try a different search query' : 'No job cards match the selected filter'}
            </Text>
          </View>
        ) : (
          filteredAndSortedJobCards.map((jobCard) => {
            const machine = machinery.find((m) => m.id === jobCard.machineryId);
            
            return (
              <TouchableOpacity
                key={jobCard.id}
                style={[styles.jobCard, { backgroundColor: colors.cardBackground }]}
                onPress={() => setSelectedJobCard(jobCard.id)}
                activeOpacity={0.7}
              >
                <View style={styles.jobCardHeader}>
                  <View style={styles.jobCardHeaderLeft}>
                    <Text style={[styles.jobCardReg, { color: colors.text }]}>
                      {jobCard.registrationNumber}
                    </Text>
                    {machine && (
                      <Text style={[styles.jobCardMachine, { color: colors.secondary }]}>
                        {machine.name} • {machine.model}
                      </Text>
                    )}
                  </View>
                  <View style={styles.jobCardHeaderRight}>
                    <Text style={[styles.jobCardDate, { color: colors.secondary }]}>
                      {new Date(jobCard.date).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.jobCardTime, { color: colors.secondary }]}>
                      {new Date(jobCard.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>

                <View style={styles.jobCardBody}>
                  <View style={styles.workDescriptionRow}>
                    <Wrench color={colors.secondary} size={16} />
                    <Text style={[styles.workDescription, { color: colors.text }]} numberOfLines={2}>
                      {jobCard.workDescription}
                    </Text>
                  </View>

                  <View style={styles.jobCardInfo}>
                    <View style={styles.infoItem}>
                      <Package color={colors.tint} size={14} />
                      <Text style={[styles.infoText, { color: colors.secondary }]}>
                        {jobCard.partsUsed.length} part{jobCard.partsUsed.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Clock color={colors.tint} size={14} />
                      <Text style={[styles.infoText, { color: colors.secondary }]}>
                        {jobCard.laborHours}h
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <User color={colors.tint} size={14} />
                      <Text style={[styles.infoText, { color: colors.secondary }]}>
                        {jobCard.completedBy}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.sortModal, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sortModalTitle, { color: colors.text }]}>Sort By</Text>
            {(['date_desc', 'date_asc', 'reg_asc', 'reg_desc'] as SortOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  sortBy === option && { backgroundColor: colors.tint + '20' },
                ]}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    { color: colors.text },
                    sortBy === option && { color: colors.tint, fontWeight: '700' },
                  ]}
                >
                  {getSortLabel(option)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={selectedJobCard !== null}
        animationType="slide"
        onRequestClose={() => setSelectedJobCard(null)}
      >
        <View style={[styles.detailContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.detailHeader, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity onPress={() => setSelectedJobCard(null)} style={styles.closeButton}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
            <Text style={[styles.detailTitle, { color: colors.text }]}>Job Card Details</Text>
            {canDelete && selectedJobCardData && (
              <TouchableOpacity 
                onPress={() => handleDeleteJobCard(selectedJobCardData.id)}
                style={styles.deleteButton}
              >
                <Trash2 color={colors.danger} size={22} />
              </TouchableOpacity>
            )}
          </View>

          {selectedJobCardData && (
            <ScrollView style={styles.detailScrollView} showsVerticalScrollIndicator={false}>
              <View style={[styles.detailSection, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Vehicle Information</Text>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.secondary }]}>Registration:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedJobCardData.registrationNumber}
                  </Text>
                </View>
                {selectedMachine && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.secondary }]}>Name:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {selectedMachine.name}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.secondary }]}>Model:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {selectedMachine.model}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <View style={[styles.detailSection, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Work Details</Text>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.secondary }]}>Date:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {new Date(selectedJobCardData.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.secondary }]}>Time:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {new Date(selectedJobCardData.completedAt).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.secondary }]}>Labor Hours:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedJobCardData.laborHours}h
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.secondary }]}>Completed By:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedJobCardData.completedBy}
                  </Text>
                </View>
                <View style={styles.workDescriptionDetail}>
                  <Text style={[styles.detailLabel, { color: colors.secondary }]}>Work Description:</Text>
                  <Text style={[styles.workDescriptionText, { color: colors.text }]}>
                    {selectedJobCardData.workDescription}
                  </Text>
                </View>
              </View>

              {selectedJobCardData.partsUsed.length > 0 && (
                <View style={[styles.detailSection, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                    Parts Used ({selectedJobCardData.partsUsed.length})
                  </Text>
                  {selectedJobCardData.partsUsed.map((part, index) => {
                    const stockItem = part.stockItemId ? stockItems.find((s) => s.id === part.stockItemId) : null;
                    
                    return (
                      <View key={index} style={[styles.partDetail, { borderBottomColor: colors.border }]}>
                        <View style={styles.partDetailHeader}>
                          <Text style={[styles.partName, { color: colors.text }]}>
                            {part.partName}
                          </Text>
                          <Text style={[styles.partQuantity, { color: colors.tint }]}>
                            ×{part.quantity}
                          </Text>
                        </View>
                        <Text style={[styles.partNumber, { color: colors.secondary }]}>
                          PN: {part.partNumber}
                        </Text>
                        <View style={styles.partMeta}>
                          <View style={[styles.categoryBadge, { backgroundColor: colors.tint + '20' }]}>
                            <Text style={[styles.categoryBadgeText, { color: colors.tint }]}>
                              {part.category.replace(/_/g, ' ')}
                            </Text>
                          </View>
                          {stockItem && (
                            <View style={[styles.stockItemBadge, { backgroundColor: colors.success + '20' }]}>
                              <Package color={colors.success} size={12} />
                              <Text style={[styles.stockItemBadgeText, { color: colors.success }]}>
                                From Stock
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {selectedJobCardData.notes && (
                <View style={[styles.detailSection, { backgroundColor: colors.cardBackground }]}>
                  <View style={styles.notesHeader}>
                    <FileText color={colors.secondary} size={18} />
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>Notes</Text>
                  </View>
                  <Text style={[styles.notesText, { color: colors.text }]}>
                    {selectedJobCardData.notes}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  divider: {
    width: 1,
    height: 32,
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyCard: {
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  jobCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobCardHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  jobCardReg: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  jobCardMachine: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  jobCardHeaderRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  jobCardDate: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  jobCardTime: {
    fontSize: 12,
  },
  jobCardBody: {
    gap: 12,
  },
  workDescriptionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  workDescription: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  jobCardInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModal: {
    width: '80%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 16,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  sortOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
  },
  closeButton: {
    padding: 4,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  detailScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  detailSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right' as const,
  },
  workDescriptionDetail: {
    paddingTop: 8,
    gap: 8,
  },
  workDescriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  partDetail: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  partDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partName: {
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
  },
  partQuantity: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  partNumber: {
    fontSize: 13,
  },
  partMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  stockItemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockItemBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
