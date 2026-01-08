import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTyreStock } from '@/context/TyreStockContext';
import { useFleet } from '@/context/FleetContext';
import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';
import { Search, X, Calendar, TrendingUp, Package, PieChart } from 'lucide-react-native';

type TimeFilter = 'all' | 'today' | 'week' | 'month';

export default function TyreUsageScreen() {
  const { colors } = useTheme();
  const { jobCards, stockItems } = useTyreStock();
  const { machinery } = useFleet();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const filteredJobCards = useMemo(() => {
    let filtered = [...jobCards];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    if (timeFilter === 'today') {
      filtered = filtered.filter((card) => new Date(card.date) >= todayStart);
    } else if (timeFilter === 'week') {
      filtered = filtered.filter((card) => new Date(card.date) >= weekStart);
    } else if (timeFilter === 'month') {
      filtered = filtered.filter((card) => new Date(card.date) >= monthStart);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.registrationNumber.toLowerCase().includes(query) ||
          card.tyreBrand.toLowerCase().includes(query) ||
          card.workDone.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [jobCards, timeFilter, searchQuery]);

  const analytics = useMemo(() => {
    const totalJobCards = filteredJobCards.length;
    const tyresUsed = filteredJobCards.filter((card) => card.stockItemId).length;
    
    const brandCounts: Record<string, number> = {};
    const sizeCounts: Record<string, number> = {};
    const vehicleCounts: Record<string, number> = {};
    
    filteredJobCards.forEach((card) => {
      brandCounts[card.tyreBrand] = (brandCounts[card.tyreBrand] || 0) + 1;
      sizeCounts[card.tyreSize] = (sizeCounts[card.tyreSize] || 0) + 1;
      vehicleCounts[card.registrationNumber] = (vehicleCounts[card.registrationNumber] || 0) + 1;
    });

    const topBrand = Object.entries(brandCounts).sort(([, a], [, b]) => b - a)[0];
    const topSize = Object.entries(sizeCounts).sort(([, a], [, b]) => b - a)[0];
    const topVehicle = Object.entries(vehicleCounts).sort(([, a], [, b]) => b - a)[0];

    return {
      totalJobCards,
      tyresUsed,
      topBrand: topBrand ? topBrand[0] : 'N/A',
      topBrandCount: topBrand ? topBrand[1] : 0,
      topSize: topSize ? topSize[0] : 'N/A',
      topSizeCount: topSize ? topSize[1] : 0,
      topVehicle: topVehicle ? topVehicle[0] : 'N/A',
      topVehicleCount: topVehicle ? topVehicle[1] : 0,
    };
  }, [filteredJobCards]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Tyre Usage & Analytics' }} />
      
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
          {(['all', 'today', 'week', 'month'] as TimeFilter[]).map((filter) => (
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
                {filter === 'all' ? 'All Time' : filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'This Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.analyticsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Analytics Overview</Text>
          
          <View style={styles.analyticsGrid}>
            <View style={[styles.analyticsCard, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.analyticsIcon, { backgroundColor: colors.tint + '20' }]}>
                <Calendar color={colors.tint} size={24} />
              </View>
              <Text style={[styles.analyticsValue, { color: colors.text }]}>{analytics.totalJobCards}</Text>
              <Text style={[styles.analyticsLabel, { color: colors.secondary }]}>Total Jobs</Text>
            </View>

            <View style={[styles.analyticsCard, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.analyticsIcon, { backgroundColor: colors.success + '20' }]}>
                <Package color={colors.success} size={24} />
              </View>
              <Text style={[styles.analyticsValue, { color: colors.text }]}>{analytics.tyresUsed}</Text>
              <Text style={[styles.analyticsLabel, { color: colors.secondary }]}>From Stock</Text>
            </View>

            <View style={[styles.analyticsCard, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.analyticsIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                <TrendingUp color="#8b5cf6" size={24} />
              </View>
              <Text style={[styles.analyticsValue, { color: colors.text }]}>{analytics.topBrand}</Text>
              <Text style={[styles.analyticsLabel, { color: colors.secondary }]}>Top Brand</Text>
              <Text style={[styles.analyticsSubLabel, { color: colors.secondary }]}>
                {analytics.topBrandCount} times
              </Text>
            </View>

            <View style={[styles.analyticsCard, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.analyticsIcon, { backgroundColor: '#f59e0b' + '20' }]}>
                <PieChart color="#f59e0b" size={24} />
              </View>
              <Text style={[styles.analyticsValue, { color: colors.text, fontSize: 16 }]}>{analytics.topSize}</Text>
              <Text style={[styles.analyticsLabel, { color: colors.secondary }]}>Top Size</Text>
              <Text style={[styles.analyticsSubLabel, { color: colors.secondary }]}>
                {analytics.topSizeCount} times
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.jobCardsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Job Cards History</Text>
          
          {filteredJobCards.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
              <Calendar color={colors.secondary} size={48} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No Job Cards Found</Text>
              <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
                {searchQuery.trim() ? 'Try a different search query' : 'No job cards match the selected filter'}
              </Text>
            </View>
          ) : (
            filteredJobCards.map((jobCard) => {
              const machine = machinery.find((m) => m.id === jobCard.machineryId);
              const stockItem = jobCard.stockItemId ? stockItems.find((s) => s.id === jobCard.stockItemId) : null;
              
              return (
                <View key={jobCard.id} style={[styles.jobCard, { backgroundColor: colors.cardBackground }]}>
                  <View style={styles.jobCardHeader}>
                    <View style={styles.jobCardHeaderLeft}>
                      <Text style={[styles.jobCardReg, { color: colors.text }]}>
                        {jobCard.registrationNumber}
                      </Text>
                      {machine && (
                        <Text style={[styles.jobCardMachine, { color: colors.secondary }]}>
                          {machine.name}
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

                  <View style={styles.jobCardDetails}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.secondary }]}>Position:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {jobCard.tyrePosition.replace(/_/g, ' ')}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.secondary }]}>Tyre:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {jobCard.tyreSize} • {jobCard.tyreBrand} • {jobCard.tyreCondition}
                      </Text>
                    </View>
                    {stockItem && (
                      <View style={[styles.stockBadge, { backgroundColor: colors.success + '20' }]}>
                        <Package color={colors.success} size={14} />
                        <Text style={[styles.stockBadgeText, { color: colors.success }]}>
                          From Stock: {stockItem.location}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.jobCardWork}>
                    <Text style={[styles.workLabel, { color: colors.secondary }]}>Work Done:</Text>
                    <Text style={[styles.workText, { color: colors.text }]}>
                      {jobCard.workDone}
                    </Text>
                  </View>

                  <View style={styles.jobCardFooter}>
                    <Text style={[styles.createdBy, { color: colors.secondary }]}>
                      By: {jobCard.createdBy}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  analyticsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  analyticsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  analyticsSubLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  jobCardsSection: {
    padding: 16,
    paddingTop: 0,
  },
  emptyCard: {
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
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
  jobCardDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    minWidth: 70,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textTransform: 'capitalize' as const,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  jobCardWork: {
    marginBottom: 12,
    gap: 6,
  },
  workLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  workText: {
    fontSize: 14,
    lineHeight: 20,
  },
  jobCardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.1)',
  },
  createdBy: {
    fontSize: 12,
    fontStyle: 'italic' as const,
  },
});
