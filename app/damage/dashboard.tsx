import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, MapPin, CheckCircle, Clock, Navigation, FileText } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DamageReport } from '@/types';

export default function DamageDashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { machinery, getVisibleDamageReports, updateDamageReport } = useFleet();
  const { currentUser, users } = useAuth();
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    if (!currentUser) return [];
    return getVisibleDamageReports(currentUser.role, currentUser.id);
  }, [getVisibleDamageReports, currentUser]);

  const sortedReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      if (a.status === 'accepted' && b.status !== 'accepted') return -1;
      if (a.status !== 'accepted' && b.status === 'accepted') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredReports]);

  const handleAcceptReport = async (report: DamageReport) => {
    if (!currentUser) return;

    Alert.alert(
      'Accept Job',
      'Are you on your way to fix this issue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await updateDamageReport(report.id, {
                status: 'accepted',
                acceptedBy: currentUser.id,
                acceptedAt: new Date().toISOString(),
              });
              console.log(`✅ ${currentUser.name} accepted report ${report.id}`);
              Alert.alert(
                'Job Accepted',
                'The driver has been notified that you are on your way!',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error accepting report:', error);
              Alert.alert('Error', 'Failed to accept job. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleOpenInMaps = (report: DamageReport) => {
    if (!report.coordinates) {
      Alert.alert('Error', 'Location coordinates not available');
      return;
    }
    const { latitude, longitude } = report.coordinates;
    const url = Platform.select({
      ios: `maps://app?saddr=&daddr=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        Linking.openURL(fallbackUrl);
      });
    }
  };

  const getMachineryName = (machineryId: string) => {
    const machine = machinery.find(m => m.id === machineryId);
    return machine ? `${machine.name} (${machine.registrationNumber})` : 'Unknown Vehicle';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'accepted':
        return colors.tint;
      case 'completed':
        return colors.success;
      default:
        return colors.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'accepted':
        return Navigation;
      case 'completed':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const toggleExpand = (reportId: string) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId);
  };

  if (!currentUser || (!['tyre_fitter', 'mechanic', 'admin', 'manager'].includes(currentUser.role))) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Damage Reports' }} />
        <View style={[styles.emptyContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Access Denied
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
            You do not have permission to view this page
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: currentUser.role === 'tyre_fitter' ? 'Tyre Jobs' : currentUser.role === 'mechanic' ? 'Workshop Jobs' : 'All Damage Reports'
        }} 
      />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {currentUser.role === 'tyre_fitter' ? 'Tyre Damage Reports' : currentUser.role === 'mechanic' ? 'Vehicle Damage Reports' : 'All Damage Reports'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
          {sortedReports.filter(r => r.status === 'pending').length} pending • {sortedReports.filter(r => r.status === 'accepted').length} in progress
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {sortedReports.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
            <AlertTriangle color={colors.secondary} size={48} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No damage reports</Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              {currentUser.role === 'tyre_fitter' 
                ? 'No tyre damage reports to show'
                : 'No damage reports to show'}
            </Text>
          </View>
        ) : (
          sortedReports.map((report) => {
            const StatusIcon = getStatusIcon(report.status);
            const statusColor = getStatusColor(report.status);
            const isExpanded = expandedReportId === report.id;

            return (
              <TouchableOpacity
                key={report.id}
                style={[styles.reportCard, { backgroundColor: colors.cardBackground }]}
                onPress={() => toggleExpand(report.id)}
                activeOpacity={0.7}
              >
                <View style={styles.reportHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.reportTitleRow}>
                      <AlertTriangle 
                        color={
                          report.severity === 'minor' ? colors.success :
                          report.severity === 'moderate' ? colors.warning :
                          colors.danger
                        } 
                        size={20} 
                      />
                      <Text style={[styles.reportTitle, { color: colors.text }]}>
                        {getMachineryName(report.machineryId)}
                      </Text>
                    </View>
                    <Text style={[styles.reportSubtitle, { color: colors.secondary }]}>
                      {report.date} • Reported by {report.reportedBy}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <StatusIcon color={statusColor} size={16} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {report.status}
                    </Text>
                  </View>
                </View>

                {isExpanded && (
                  <View style={styles.reportDetails}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.secondary }]}>Type:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {report.damageType === 'tyre' ? 'Tyre' : 'General'}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.secondary }]}>Severity:</Text>
                      <Text style={[
                        styles.detailValue, 
                        { 
                          color: report.severity === 'minor' ? colors.success :
                                 report.severity === 'moderate' ? colors.warning :
                                 colors.danger 
                        }
                      ]}>
                        {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.secondary }]}>Assigned to:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {report.assignedTo ? users.find(u => u.id === report.assignedTo)?.name || 'Unknown' : 'Not assigned'}
                      </Text>
                    </View>

                    <View style={styles.descriptionSection}>
                      <Text style={[styles.detailLabel, { color: colors.secondary }]}>Description:</Text>
                      <Text style={[styles.descriptionText, { color: colors.text }]}>
                        {report.description}
                      </Text>
                    </View>

                    <View style={styles.locationSection}>
                      <View style={styles.locationHeader}>
                        <MapPin color={colors.tint} size={18} />
                        <Text style={[styles.locationLabel, { color: colors.text }]}>Location</Text>
                      </View>
                      <Text style={[styles.locationText, { color: colors.secondary }]}>
                        {report.location}
                      </Text>
                      {report.coordinates && (
                        <Text style={[styles.coordinatesText, { color: colors.secondary }]}>
                          {report.coordinates.latitude.toFixed(6)}, {report.coordinates.longitude.toFixed(6)}
                        </Text>
                      )}
                    </View>

                    <View style={styles.actionButtons}>
                      {report.coordinates && (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.tint }]}
                          onPress={() => handleOpenInMaps(report)}
                        >
                          <Navigation color="#FFFFFF" size={18} />
                          <Text style={styles.actionButtonText}>Navigate</Text>
                        </TouchableOpacity>
                      )}
                      
                      {report.status === 'pending' && (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.success, flex: 1 }]}
                          onPress={() => handleAcceptReport(report)}
                        >
                          <CheckCircle color="#FFFFFF" size={18} />
                          <Text style={styles.actionButtonText}>Accept Job</Text>
                        </TouchableOpacity>
                      )}
                      
                      {currentUser.role === 'tyre_fitter' && report.damageType === 'tyre' && report.status !== 'completed' && (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.tint, flex: 1 }]}
                          onPress={() => {
                            router.push({
                              pathname: '/tyres/job-card/new',
                              params: {
                                fromDamageReport: 'true',
                                damageReportId: report.id,
                                machineryId: report.machineryId,
                                tyrePosition: report.tyrePosition || '',
                                location: report.location || '',
                                latitude: report.coordinates?.latitude?.toString() || '',
                                longitude: report.coordinates?.longitude?.toString() || '',
                              },
                            } as any);
                          }}
                        >
                          <FileText color="#FFFFFF" size={18} />
                          <Text style={styles.actionButtonText}>Create Job Card</Text>
                        </TouchableOpacity>
                      )}
                      
                      {report.status === 'accepted' && currentUser.role === 'tyre_fitter' && report.damageType === 'tyre' && (
                        <View style={[styles.infoBox, { backgroundColor: colors.tint + '20' }]}>  
                          <Text style={[styles.infoText, { color: colors.tint }]}>
                            Create a job card to complete this repair
                          </Text>
                        </View>
                      )}
                      
                      {report.status === 'completed' && (
                        <View style={[styles.infoBox, { backgroundColor: colors.success + '20' }]}>  
                          <CheckCircle color={colors.success} size={16} />
                          <Text style={[styles.infoText, { color: colors.success }]}>
                            Completed on {report.completedAt ? new Date(report.completedAt).toLocaleDateString() : 'N/A'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 12,
  },
  reportCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    flex: 1,
  },
  reportSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  reportDetails: {
    marginTop: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    flex: 1,
  },
  descriptionSection: {
    gap: 4,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  locationSection: {
    gap: 6,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  locationText: {
    fontSize: 14,
    lineHeight: 18,
  },
  coordinatesText: {
    fontSize: 12,
    fontStyle: 'italic' as const,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 40,
    borderRadius: 16,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600' as const,
    flex: 1,
  },
});
