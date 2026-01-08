import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';
import { Shield, UserCog, User, Wrench, Truck, Trash2, Plus, X, Mail, Phone, Image as ImageIcon, Edit, Building2, Briefcase, FileText, Eye } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserRole, MachineryDepartment, UserTeam, VehicleTeam, InductionDocument } from '@/types';
import { useFleet } from '@/context/FleetContext';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import SearchableSelectModal from '@/components/SearchableSelectModal';
import InductionDocumentViewer from '@/components/InductionDocumentViewer';

export default function ManageUsersScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
 const { users, isAdmin, isManager, addUser, deleteUser, updateUser, currentUser } = useAuth();
  const { machinery } = useFleet();
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('operator');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserWorkId, setNewUserWorkId] = useState('');
  const [newUserSystemId, setNewUserSystemId] = useState('');
  const [newUserEmployeeId, setNewUserEmployeeId] = useState('');
  const [newUserDriverRef, setNewUserDriverRef] = useState('');
  const [newUserDisplayName, setNewUserDisplayName] = useState('');
  const [newUserDepartment, setNewUserDepartment] = useState<MachineryDepartment | undefined>(undefined);

  const [newUserDedicatedMachinery, setNewUserDedicatedMachinery] = useState<string[]>([]);
  const [newUserTeams, setNewUserTeams] = useState<UserTeam[]>([]);
  const [newUserWorkshopAccess, setNewUserWorkshopAccess] = useState<UserTeam[]>([]);
  const [newUserVehicleTeams, setNewUserVehicleTeams] = useState<VehicleTeam[]>([]);
  const [newUserManagerId, setNewUserManagerId] = useState<string | undefined>(undefined);
  const [showManagerPicker, setShowManagerPicker] = useState(false);
  const [showMachineryPicker, setShowMachineryPicker] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWorkId, setEditWorkId] = useState('');
  const [editSystemId, setEditSystemId] = useState('');
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editDriverRef, setEditDriverRef] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');

  const [editDepartment, setEditDepartment] = useState<MachineryDepartment | undefined>(undefined);

  const [editDedicatedMachinery, setEditDedicatedMachinery] = useState<string[]>([]);
  const [editTeams, setEditTeams] = useState<UserTeam[]>([]);
  const [editWorkshopAccess, setEditWorkshopAccess] = useState<UserTeam[]>([]);
  const [editVehicleTeams, setEditVehicleTeams] = useState<VehicleTeam[]>([]);
  const [editManagerId, setEditManagerId] = useState<string | undefined>(undefined);
  const [showEditManagerPicker, setShowEditManagerPicker] = useState(false);
  const [editCertifications, setEditCertifications] = useState({
    hgvCpcExpiryDate: '',
    licenceExpiryDate: '',
    pointsOnLicence: '',
    jcbCertificateCopy: '',
    additionalInfo: '',
  });
  const [showEditMachineryPicker, setShowEditMachineryPicker] = useState(false);
  const [inductionImages, setInductionImages] = useState<string[]>([]);
  const [inductionDocuments, setInductionDocuments] = useState<InductionDocument[]>([]);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  const departmentOptions = useState<{ id: MachineryDepartment; label: string }[]>(() => [
    { id: 'arable', label: 'Arable' },
    { id: 'genesis', label: 'Genesis' },
    { id: 'co2', label: 'CO2' },
    { id: 'mepal_yard', label: 'Mepal Yard' },
    { id: 'pc', label: 'PC' },
    { id: 'straw_e1', label: 'Straw E1' },
    { id: 'straw_e2', label: 'Straw E2' },
    { id: 'arable_land', label: 'Arable Land' },
    { id: 'arable_yard', label: 'Arable Yard' },
    { id: 'engineers', label: 'Engineers' },
    { id: 'electricians', label: 'Electricians' },
    { id: 'pc_workshop_arable', label: 'Pc Workshop (Arable)' },
    { id: 'milton_workshop_arable', label: 'Milton Workshop (Arable)' },
    { id: 'tyre_fitter_arable', label: 'Tyre Fitter (Arable)' },
    { id: 'pc_storage10_pc', label: 'Pc Storage10 (PC)' },
    { id: 'lab', label: 'Lab' },
  ])[0];

  const vehicleTeamOptions = useState<{ id: VehicleTeam; label: string }[]>(() => [
    { id: '8_wheeler', label: '8 Wheeler' },
    { id: 'jcb', label: 'JCB' },
    { id: 'tractor', label: 'Tractor' },
    { id: 'hgv', label: 'HGV' },
    { id: 'other_machinery', label: 'Other machinery' },
    { id: 'company_car', label: 'Company car' },
  ])[0];

  const getRoleIcon = (role: UserRole) => {
    if (role === 'admin') return Shield;
    if (role === 'manager') return UserCog;
    if (role === 'tyre_fitter') return Truck;
    if (role === 'mechanic') return Wrench;
    return User;
  };

  const getRoleColor = (role: UserRole) => {
    if (role === 'admin') return '#EF4444';
    if (role === 'manager') return '#F59E0B';
    if (role === 'tyre_fitter') return '#8B5CF6';
    if (role === 'mechanic') return '#06B6D4';
    return '#3B82F6';
  };

  const generateWorkId = (name: string, department: MachineryDepartment | undefined): string => {
    if (!name.trim() || !department) return '';

    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) return '';

    const departmentLetter = department.charAt(0).toUpperCase();
    const firstNameLetter = nameParts[0].charAt(0).toUpperCase();
    const lastNameLetter = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    const prefix = `${departmentLetter}${firstNameLetter}${lastNameLetter}`;

    const existingWorkIds = users
      .map(u => u.workId)
      .filter((id): id is string => !!id && id.startsWith(prefix));

    const existingNumbers = existingWorkIds
      .map(id => {
        const match = id.match(/\d+$/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter(num => num > 0);

    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const numberStr = nextNumber.toString().padStart(3, '0');

    return `${prefix}${numberStr}`;
  };

  const generateSystemId = (name: string, role: UserRole): string => {
    if (!name.trim()) return '';

    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) return '';

    const rolePrefix = role === 'admin' ? 'ADM' : 
                      role === 'manager' ? 'MGR' :
                      role === 'workshop_manager' ? 'WMG' :
                      role === 'inspector' ? 'INS' :
                      role === 'repairman' ? 'REP' :
                      role === 'operator' ? 'OP' :
                      role === 'engineer' ? 'ENG' :
                      role === 'electrician' ? 'ELC' :
                      role === 'contractor' ? 'CTR' :
                      role === 'seasonal' ? 'SEA' :
                      role === 'office' ? 'OFF' :
                      role === 'service_account' ? 'SVC' :
                      role === 'tyre_fitter' ? 'TYR' :
                      role === 'mechanic' ? 'MEC' : 'USR';

    const lastName = nameParts[nameParts.length - 1];
    const firstName = nameParts[0].charAt(0).toUpperCase();
    
    const existingSystemIds = users
      .map(u => u.systemID)
      .filter((id): id is string => !!id && id.startsWith(`U_${rolePrefix}_${lastName}`));

    const existingNumbers = existingSystemIds
      .map(id => {
        const match = id.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);

    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const numberStr = nextNumber.toString().padStart(3, '0');

    return `U_${rolePrefix}_${lastName}${firstName}_${numberStr}`;
  };

  if (!isAdmin && !isManager) {
  router.back();
  return null;
}

  const handleAddUser = async () => {
    console.log('[ManageUsers] ===== CREATING NEW USER =====');
    console.log('[ManageUsers] Full Name Input Value:', newUserName);
    console.log('[ManageUsers] Full Name After Trim:', newUserName.trim());
    console.log('[ManageUsers] Email:', newUserEmail.trim());
    console.log('[ManageUsers] Password length:', newUserPassword.length);
    
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      Alert.alert('Error', 'Please enter name, email, and password');
      return;
    }

    if (!newUserManagerId && newUserRole !== 'admin' && newUserRole !== 'manager' && newUserRole !== 'workshop_manager') {
      Alert.alert('Error', 'Please assign a manager. All users (except admins and managers) must have a dedicated manager.');
      return;
    }

    const generatedUsername = newUserEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    console.log('[ManageUsers] Generated username:', generatedUsername);
    
    if (!generatedUsername) {
      Alert.alert('Error', 'Invalid email format for username generation');
      return;
    }

    const usernameExists = users.find(
      (u) => u.username?.toLowerCase() === generatedUsername
    );
    if (usernameExists) {
      Alert.alert('Error', 'A user with this username already exists');
      return;
    }

    const emailExists = users.find(
      (u) => u.email.toLowerCase() === newUserEmail.toLowerCase().trim()
    );
    if (emailExists) {
      Alert.alert('Error', 'A user with this email already exists');
      return;
    }

    const finalSystemId = newUserSystemId.trim() || generateSystemId(newUserName.trim(), newUserRole);
    const finalDisplayName = newUserDisplayName.trim() || newUserName.trim();

    const newUser = {
      id: Date.now().toString(),
      systemID: finalSystemId,
      name: newUserName.trim(),
      displayName: finalDisplayName,
      email: newUserEmail.trim(),
      username: generatedUsername,
      password: newUserPassword,
      role: newUserRole,
      phoneNumber: newUserPhone.trim() || undefined,
      mobileNumber: newUserPhone.trim() || undefined,
      workId: newUserWorkId.trim() || undefined,
      employeeID: newUserEmployeeId.trim() || undefined,
      driverRef: newUserDriverRef.trim() || undefined,
      department: newUserDepartment,

      dedicatedMachineryIds: newUserDedicatedMachinery.length > 0 ? newUserDedicatedMachinery : undefined,
      teams: newUserTeams.length > 0 ? newUserTeams : undefined,
      workshopAccess: newUserWorkshopAccess.length > 0 ? newUserWorkshopAccess : undefined,
      vehicleTeams: newUserVehicleTeams.length > 0 ? newUserVehicleTeams : undefined,
      managerUserID: newUserManagerId,
    };

    console.log('[ManageUsers] New user object created:', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      hasPassword: !!newUser.password,
      passwordLength: newUser.password.length,
      role: newUser.role,
    });

    await addUser(newUser);
    console.log('[ManageUsers] User added to system');
    console.log('[ManageUsers] Verifying saved user data...');
    console.log('[ManageUsers] Saved Name:', newUser.name);
    console.log('[ManageUsers] Name Length:', newUser.name.length);
    console.log('[ManageUsers] Full User Object:', JSON.stringify(newUser, null, 2));
    setShowAddModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserUsername('');
    setNewUserPassword('');
    setNewUserRole('operator');
    setNewUserPhone('');
    setNewUserWorkId('');
    setNewUserSystemId('');
    setNewUserEmployeeId('');
    setNewUserDriverRef('');
    setNewUserDisplayName('');
    setNewUserDepartment(undefined);

    setNewUserDedicatedMachinery([]);
    setNewUserTeams([]);
    setNewUserWorkshopAccess([]);
    setNewUserVehicleTeams([]);
    setNewUserManagerId(undefined);
    
    // Define the message based on role
    let alertMessage = `Name: ${newUser.name}`;

    // Security Check: Only show credentials if the user is an Admin
    if (isAdmin) {
      alertMessage += `\n\nLogin Credentials:\nUsername: ${newUser.username}\nPassword: ${newUser.password}`;
    } else {
      alertMessage += `\n\nUser created successfully. (Credentials hidden for security)`;
    }

    Alert.alert(
      'User Created Successfully',
      alertMessage,
      [{ text: 'OK' }]
    );
    
    console.log('[ManageUsers] ========== NEW USER CREDENTIALS ==========');
    console.log('[ManageUsers] Name:', newUser.name);
    console.log('[ManageUsers] Email:', newUser.email);
    console.log('[ManageUsers] Username:', newUser.username);
    console.log('[ManageUsers] Password:', newUser.password);
    console.log('[ManageUsers] ==========================================');
  };

  const handleEditUser = (user: typeof users[0]) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditPhone(user.phoneNumber || '');
    setEditWorkId(user.workId || '');
    setEditSystemId(user.systemID || '');
    setEditEmployeeId(user.employeeID || '');
    setEditDriverRef(user.driverRef || '');
    setEditDisplayName(user.displayName || user.name || '');

    setEditDepartment(user.department);

    setEditDedicatedMachinery(user.dedicatedMachineryIds || []);
    setEditTeams(user.teams || []);
    setEditWorkshopAccess(user.workshopAccess || []);
    setEditVehicleTeams(user.vehicleTeams || []);
    setEditManagerId(user.managerUserID);
    setInductionImages(user.inductionScreenshots || []);
    setInductionDocuments(user.inductionDocuments || []);
    setEditCertifications({
      hgvCpcExpiryDate: user.certifications?.hgvCpcExpiryDate || '',
      licenceExpiryDate: user.certifications?.licenceExpiryDate || '',
      pointsOnLicence: user.certifications?.pointsOnLicence?.toString() || '',
      jcbCertificateCopy: user.certifications?.jcbCertificateCopy || '',
      additionalInfo: user.certifications?.additionalInfo || '',
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    await updateUser(editingUser.id, {
      name: editName.trim(),
      displayName: editDisplayName.trim() || editName.trim(),
      phoneNumber: editPhone.trim() || undefined,
      mobileNumber: editPhone.trim() || undefined,
      workId: editWorkId.trim() || undefined,
      systemID: editSystemId.trim() || undefined,
      employeeID: editEmployeeId.trim() || undefined,
      driverRef: editDriverRef.trim() || undefined,

      department: editDepartment,

      dedicatedMachineryIds: editDedicatedMachinery.length > 0 ? editDedicatedMachinery : undefined,
      teams: editTeams.length > 0 ? editTeams : undefined,
      workshopAccess: editWorkshopAccess.length > 0 ? editWorkshopAccess : undefined,
      vehicleTeams: editVehicleTeams.length > 0 ? editVehicleTeams : undefined,
      managerUserID: editManagerId,
      inductionScreenshots: inductionImages.length > 0 ? inductionImages : undefined,
      inductionDocuments: inductionDocuments.length > 0 ? inductionDocuments : undefined,
      certifications: {
        hgvCpcExpiryDate: editCertifications.hgvCpcExpiryDate.trim() || undefined,
        licenceExpiryDate: editCertifications.licenceExpiryDate.trim() || undefined,
        pointsOnLicence: editCertifications.pointsOnLicence ? parseInt(editCertifications.pointsOnLicence, 10) : undefined,
        jcbCertificateCopy: editCertifications.jcbCertificateCopy.trim() || undefined,
        additionalInfo: editCertifications.additionalInfo.trim() || undefined,
      },
    });

    setEditingUser(null);
    setEditName('');
    setEditPhone('');
    setEditWorkId('');
    setEditSystemId('');
    setEditEmployeeId('');
    setEditDriverRef('');
    setEditDisplayName('');

    setEditDepartment(undefined);

    setEditDedicatedMachinery([]);
    setEditTeams([]);
    setEditWorkshopAccess([]);
    setEditVehicleTeams([]);
    setEditManagerId(undefined);
    setInductionImages([]);
    setInductionDocuments([]);
    setEditCertifications({
      hgvCpcExpiryDate: '',
      licenceExpiryDate: '',
      pointsOnLicence: '',
      jcbCertificateCopy: '',
      additionalInfo: '',
    });
    Alert.alert('Success', `User ${editingUser.name} has been updated`);
  };

  const handlePickInductionImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newDocs: InductionDocument[] = result.assets.map(asset => ({
        uri: asset.uri,
        type: 'image' as const,
        name: asset.fileName || `Image_${Date.now()}.jpg`,
        addedDate: new Date().toISOString(),
      }));
      setInductionDocuments([...inductionDocuments, ...newDocs]);
    }
  };

  const handlePickInductionPDF = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets) {
      const newDocs: InductionDocument[] = result.assets.map(asset => ({
        uri: asset.uri,
        type: 'pdf' as const,
        name: asset.name || `Document_${Date.now()}.pdf`,
        addedDate: new Date().toISOString(),
      }));
      setInductionDocuments([...inductionDocuments, ...newDocs]);
    }
  };

  const handleRemoveInductionDocument = (index: number) => {
    setInductionDocuments(inductionDocuments.filter((_, i) => i !== index));
  };

  const handleViewDocument = (index: number) => {
    setViewerInitialIndex(index);
    setShowDocumentViewer(true);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      Alert.alert('Error', "You cannot delete your own account");
      return;
    }

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteUser(userId);
            Alert.alert('Success', `User ${userName} has been deleted`);
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Manage Users',
          headerShown: true,
          headerStyle: { backgroundColor: colors.cardBackground },
          headerTintColor: colors.text,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              User Management
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
              {users.length} total users
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.addButtonText}>Add New User</Text>
          </TouchableOpacity>

          <View style={styles.usersList}>
            {users.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              const roleColor = getRoleColor(user.role);
              const isCurrentUser = user.id === currentUser?.id;
              const isBeingEdited = editingUser?.id === user.id;
              const isSelected = selectedUserId === user.id;

              return (
                <React.Fragment key={user.id}>
                  <Pressable
                    testID={`userCard-${user.id}`}
                    onPress={() => {
                      console.log('[ManageUsers] User card pressed:', { userId: user.id, userName: user.name, userNameLength: user.name?.length });
                      console.log('[ManageUsers] Full user data:', JSON.stringify(user, null, 2));
                      setSelectedUserId((prev) => (prev === user.id ? null : user.id));
                    }}
                    style={[
                      styles.userCard,
                      { backgroundColor: colors.cardBackground },
                      isSelected && { borderWidth: 2, borderColor: '#007AFF' },
                      !isSelected && isCurrentUser && { borderWidth: 2, borderColor: colors.tint },
                    ]}
                  >
                    <View style={styles.userCardHeader}>
                      <View style={[styles.userIconCircle, { backgroundColor: roleColor + '20' }]}>
                        <RoleIcon size={24} color={roleColor} strokeWidth={2} />
                      </View>
                      <View style={styles.userInfo}>
                        <View style={styles.userNameRow}>
                          <Text style={[styles.userName, { color: colors.text }]}>
                            {user.name || 'No Name'}
                          </Text>
                          {isCurrentUser && (
                            <View style={[styles.currentUserBadge, { backgroundColor: colors.tint }]}>
                              <Text style={styles.currentUserBadgeText}>You</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.userRole, { color: roleColor }]}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.userActions}>
                        <TouchableOpacity
                          onPress={() => handleEditUser(user)}
                          style={styles.iconButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Edit size={20} color={colors.tint} strokeWidth={2} />
                        </TouchableOpacity>
                        {!isCurrentUser && (
                          <TouchableOpacity
                            onPress={() => handleDeleteUser(user.id, user.name)}
                            style={styles.iconButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Trash2 size={20} color={colors.danger} strokeWidth={2} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <View style={styles.userDetails}>
                      {/* Only show Username if Admin */}
{isAdmin && user.username && (
  <View style={styles.detailRow}>
    <User size={14} color={colors.secondary} />
    <Text style={[styles.detailText, { color: colors.text }]}>
      {user.username}
    </Text>
  </View>
)}
                      <View style={styles.detailRow}>
                        <Mail size={14} color={colors.secondary} />
                        <Text style={[styles.detailText, { color: colors.text }]}>
                          {user.email}
                        </Text>
                      </View>
                      {user.phoneNumber && (
                        <View style={styles.detailRow}>
                          <Phone size={14} color={colors.secondary} />
                          <Text style={[styles.detailText, { color: colors.text }]}>
                            {user.phoneNumber}
                          </Text>
                        </View>
                      )}
                      {user.systemID && (
                        <View style={styles.detailRow}>
                          <Briefcase size={14} color={colors.secondary} />
                          <Text style={[styles.detailText, { color: colors.text }]}>
                            System ID: {user.systemID}
                          </Text>
                        </View>
                      )}
                      {user.workId && (
                        <View style={styles.detailRow}>
                          <Briefcase size={14} color={colors.secondary} />
                          <Text style={[styles.detailText, { color: colors.text }]}>
                            Work ID: {user.workId}
                          </Text>
                        </View>
                      )}
                      {user.employeeID && (
                        <View style={styles.detailRow}>
                          <Briefcase size={14} color={colors.secondary} />
                          <Text style={[styles.detailText, { color: colors.text }]}>
                            Employee ID: {user.employeeID}
                          </Text>
                        </View>
                      )}
                      {user.driverRef && (
                        <View style={styles.detailRow}>
                          <Truck size={14} color={colors.secondary} />
                          <Text style={[styles.detailText, { color: colors.text }]}>
                            Driver Ref: {user.driverRef}
                          </Text>
                        </View>
                      )}
                      {user.department && (
                        <View style={styles.detailRow}>
                          <Building2 size={14} color={colors.secondary} />
                          <Text style={[styles.detailText, { color: colors.text }]}>
                            {user.department.replace(/_/g, ' ').toUpperCase()}
                          </Text>
                        </View>
                      )}

                      {user.managerUserID && (() => {
                        const manager = users.find(u => u.id === user.managerUserID);
                        return manager ? (
                          <View style={styles.detailRow}>
                            <UserCog size={14} color={colors.secondary} />
                            <Text style={[styles.detailText, { color: colors.text }]}>
                              Manager: {manager.name}
                            </Text>
                          </View>
                        ) : null;
                      })()}

                      {user.inductionDocuments && user.inductionDocuments.length > 0 && (
                        <View style={styles.detailRow}>
                          <FileText size={14} color={colors.secondary} />
                          <Text style={[styles.detailText, { color: colors.text }]}>
                            {user.inductionDocuments.length} induction document(s)
                          </Text>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.secondary }]}>
                          User ID:
                        </Text>
                        <Text style={[styles.detailText, { color: colors.secondary }]}>
                          {user.id}
                        </Text>
                      </View>
                    </View>
                  </Pressable>

                  {isBeingEdited && (
                    <View style={[styles.editCard, { backgroundColor: colors.cardBackground }]}>
                      <View style={styles.editHeader}>
                        <Text style={[styles.editTitle, { color: colors.text }]}>
                          Edit {user.name}
                        </Text>
                        <TouchableOpacity onPress={() => setEditingUser(null)}>
                          <X size={24} color={colors.secondary} />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.editContent}>
                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name *</Text>
                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="Full Name"
                            placeholderTextColor={colors.secondary}
                            value={editName}
                            onChangeText={setEditName}
                            autoCapitalize="words"
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Display Name</Text>
                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="Display Name (defaults to Full Name)"
                            placeholderTextColor={colors.secondary}
                            value={editDisplayName}
                            onChangeText={setEditDisplayName}
                            autoCapitalize="words"
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>System ID</Text>
                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="U_OP_SmithJ_001"
                            placeholderTextColor={colors.secondary}
                            value={editSystemId}
                            onChangeText={setEditSystemId}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Work ID</Text>
                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="EMP-001"
                            placeholderTextColor={colors.secondary}
                            value={editWorkId}
                            onChangeText={setEditWorkId}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Employee ID</Text>
                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="Employee ID Number"
                            placeholderTextColor={colors.secondary}
                            value={editEmployeeId}
                            onChangeText={setEditEmployeeId}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Driver Reference</Text>
                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="Driver Reference Number"
                            placeholderTextColor={colors.secondary}
                            value={editDriverRef}
                            onChangeText={setEditDriverRef}
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="+1 (555) 123-4567"
                            placeholderTextColor={colors.secondary}
                            value={editPhone}
                            onChangeText={setEditPhone}
                            keyboardType="phone-pad"
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Department</Text>
                          <View style={styles.departmentChipsContainer}>
                            {departmentOptions.map((dept) => (
                              <TouchableOpacity
                                key={dept.id}
                                style={[
                                  styles.chipButton,
                                  { backgroundColor: colors.background, borderColor: colors.border },
                                  editDepartment === dept.id && { borderColor: '#007AFF', backgroundColor: '#007AFF' + '20', borderWidth: 2 },
                                ]}
                                onPress={() => setEditDepartment(editDepartment === dept.id ? undefined : dept.id)}
                              >
                                <Text style={[styles.chipText, { color: editDepartment === dept.id ? '#007AFF' : colors.text }]}>
                                  {dept.label.toUpperCase()}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>



                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Vehicle Teams</Text>
                          <Text style={[styles.inputHint, { color: colors.secondary }]}>Select one or more</Text>
                          <View style={styles.departmentChipsContainer}>
                            {vehicleTeamOptions.map((team) => (
                              <TouchableOpacity
                                key={team.id}
                                style={[
                                  styles.chipButton,
                                  { backgroundColor: colors.background, borderColor: colors.border },
                                  editVehicleTeams.includes(team.id) && { borderColor: '#0EA5E9', backgroundColor: '#0EA5E9' + '20', borderWidth: 2 },
                                ]}
                                onPress={() => {
                                  if (editVehicleTeams.includes(team.id)) {
                                    setEditVehicleTeams(editVehicleTeams.filter((t) => t !== team.id));
                                  } else {
                                    setEditVehicleTeams([...editVehicleTeams, team.id]);
                                  }
                                }}
                              >
                                <Text style={[styles.chipText, { color: editVehicleTeams.includes(team.id) ? '#0EA5E9' : colors.text }]}>
                                  {team.label.toUpperCase()}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        {(editingUser?.role === 'mechanic' || editingUser?.role === 'tyre_fitter') && (
                          <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Workshop Access *</Text>
                            <Text style={[styles.inputHint, { color: colors.secondary }]}>
                              {editingUser.role === 'tyre_fitter' 
                                ? 'Tyre fitters can work across workshops' 
                                : 'Select which workshop(s) this mechanic can access'}
                            </Text>
                            <View style={styles.departmentChipsContainer}>
                              {(['pc_workshop', 'milton_workshop'] as UserTeam[]).map((workshop) => (
                                <TouchableOpacity
                                  key={workshop}
                                  style={[
                                    styles.chipButton,
                                    { backgroundColor: colors.background, borderColor: colors.border },
                                    editWorkshopAccess.includes(workshop) && { borderColor: '#10B981', backgroundColor: '#10B981' + '20', borderWidth: 2 },
                                  ]}
                                  onPress={() => {
                                    if (editWorkshopAccess.includes(workshop)) {
                                      setEditWorkshopAccess(editWorkshopAccess.filter(w => w !== workshop));
                                    } else {
                                      setEditWorkshopAccess([...editWorkshopAccess, workshop]);
                                    }
                                  }}
                                >
                                  <Text style={[styles.chipText, { color: editWorkshopAccess.includes(workshop) ? '#10B981' : colors.text }]}>
                                    {workshop === 'pc_workshop' ? 'PC WORKSHOP' : 'MILTON WORKSHOP'}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        )}

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Manager Assignment *</Text>
                          <Text style={[styles.inputHint, { color: colors.secondary }]}>All users must have a dedicated manager</Text>
                          <TouchableOpacity
                            style={[styles.imagePickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => setShowEditManagerPicker(true)}
                          >
                            <UserCog size={20} color={colors.tint} />
                            <Text style={[styles.imagePickerText, { color: colors.tint }]}>
                              {editManagerId ? users.find(u => u.id === editManagerId)?.name || 'Select Manager' : 'Select Manager'}
                            </Text>
                          </TouchableOpacity>
                          {editManagerId && (() => {
                            const manager = users.find(u => u.id === editManagerId);
                            return manager ? (
                              <View style={[styles.imageItem, { backgroundColor: colors.background, marginTop: 8 }]}>
                                <View style={styles.managerInfoRow}>
                                  <UserCog size={16} color={getRoleColor(manager.role)} />
                                  <View style={{ flex: 1 }}>
                                    <Text style={[styles.imageItemText, { color: colors.text }]}>{manager.name}</Text>
                                    <Text style={[styles.managerRole, { color: colors.secondary }]}>
                                      {manager.role.replace('_', ' ').toUpperCase()}
                                    </Text>
                                  </View>
                                </View>
                                <TouchableOpacity onPress={() => setEditManagerId(undefined)}>
                                  <X size={16} color={colors.danger} />
                                </TouchableOpacity>
                              </View>
                            ) : null;
                          })()}
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Dedicated Machinery</Text>
                          <TouchableOpacity
                            style={[styles.imagePickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => setShowEditMachineryPicker(true)}
                          >
                            <Truck size={20} color={colors.tint} />
                            <Text style={[styles.imagePickerText, { color: colors.tint }]}>
                              {editDedicatedMachinery.length === 0 ? 'Select Machinery' : `${editDedicatedMachinery.length} Selected`}
                            </Text>
                          </TouchableOpacity>
                          {editDedicatedMachinery.length > 0 && (
                            <View style={styles.imageList}>
                              {editDedicatedMachinery.map((machineryId) => {
                                const machine = machinery.find(m => m.id === machineryId);
                                return (
                                  <View key={machineryId} style={[styles.imageItem, { backgroundColor: colors.background }]}>
                                    <Text style={[styles.imageItemText, { color: colors.text }]} numberOfLines={1}>
                                      {machine?.registrationNumber || 'Unknown'}
                                    </Text>
                                    <TouchableOpacity onPress={() => setEditDedicatedMachinery(editDedicatedMachinery.filter(id => id !== machineryId))}>
                                      <X size={16} color={colors.danger} />
                                    </TouchableOpacity>
                                  </View>
                                );
                              })}
                            </View>
                          )}
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Certifications</Text>
                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                            ]}
                            placeholder="HGV CPC Expiry Date (YYYY-MM-DD)"
                            placeholderTextColor={colors.secondary}
                            value={editCertifications.hgvCpcExpiryDate}
                            onChangeText={(text) => setEditCertifications({ ...editCertifications, hgvCpcExpiryDate: text })}
                          />
                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginTop: 8 },
                            ]}
                            placeholder="Licence Expiry Date (YYYY-MM-DD)"
                            placeholderTextColor={colors.secondary}
                            value={editCertifications.licenceExpiryDate}
                            onChangeText={(text) => setEditCertifications({ ...editCertifications, licenceExpiryDate: text })}
                          />
                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginTop: 8 },
                            ]}
                            placeholder="Points on Licence"
                            placeholderTextColor={colors.secondary}
                            value={editCertifications.pointsOnLicence}
                            onChangeText={(text) => setEditCertifications({ ...editCertifications, pointsOnLicence: text })}
                            keyboardType="number-pad"
                          />
                          <TextInput
                            style={[
                              styles.input,
                              { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginTop: 8 },
                            ]}
                            placeholder="Additional Information"
                            placeholderTextColor={colors.secondary}
                            value={editCertifications.additionalInfo}
                            onChangeText={(text) => setEditCertifications({ ...editCertifications, additionalInfo: text })}
                            multiline
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: colors.text }]}>Induction Documents</Text>
                          <Text style={[styles.inputHint, { color: colors.secondary }]}>Upload images and PDFs</Text>
                          
                          <View style={styles.documentButtonsRow}>
                            <TouchableOpacity
                              style={[styles.halfButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                              onPress={handlePickInductionImage}
                            >
                              <ImageIcon size={20} color={colors.tint} />
                              <Text style={[styles.halfButtonText, { color: colors.tint }]}>Add Images</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.halfButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                              onPress={handlePickInductionPDF}
                            >
                              <FileText size={20} color={colors.tint} />
                              <Text style={[styles.halfButtonText, { color: colors.tint }]}>Add PDFs</Text>
                            </TouchableOpacity>
                          </View>

                          {inductionDocuments.length > 0 && (
                            <View style={styles.imageList}>
                              {inductionDocuments.map((doc, index) => (
                                <View key={index} style={[styles.documentItem, { backgroundColor: colors.background }]}>
                                  <View style={styles.documentItemLeft}>
                                    {doc.type === 'image' ? (
                                      <ImageIcon size={16} color={colors.tint} />
                                    ) : (
                                      <FileText size={16} color={colors.danger} />
                                    )}
                                    <Text style={[styles.documentItemText, { color: colors.text }]} numberOfLines={1}>
                                      {doc.name}
                                    </Text>
                                  </View>
                                  <View style={styles.documentItemRight}>
                                    <TouchableOpacity 
                                      onPress={() => handleViewDocument(index)}
                                      style={styles.documentActionButton}
                                    >
                                      <Eye size={18} color={colors.tint} />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                      onPress={() => handleRemoveInductionDocument(index)}
                                      style={styles.documentActionButton}
                                    >
                                      <X size={18} color={colors.danger} />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>

                        <TouchableOpacity
                          style={[styles.updateButton, { backgroundColor: colors.tint }]}
                          onPress={handleUpdateUser}
                        >
                          <Text style={styles.updateButtonText}>Update User</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </ScrollView>

        <SearchableSelectModal
          visible={showManagerPicker}
          onClose={() => setShowManagerPicker(false)}
          items={users
            .filter(u => u.role === 'manager' || u.role === 'admin' || u.role === 'workshop_manager')
            .map((user) => ({
              id: user.id,
              label: user.name,
              subtitle: `${user.role.replace('_', ' ').toUpperCase()}${user.email ? ` • ${user.email}` : ''}`,
            }))}
          selectedIds={newUserManagerId ? [newUserManagerId] : []}
          onSelect={(userId) => {
            setNewUserManagerId(userId);
            setShowManagerPicker(false);
          }}
          title="Select Manager"
          placeholder="Search managers..."
          multiSelect={false}
          emptyMessage="No managers found. Create a manager account first."
        />

        <SearchableSelectModal
          visible={showEditManagerPicker}
          onClose={() => setShowEditManagerPicker(false)}
          items={users
            .filter(u => u.role === 'manager' || u.role === 'admin' || u.role === 'workshop_manager')
            .filter(u => u.id !== editingUser?.id)
            .map((user) => ({
              id: user.id,
              label: user.name,
              subtitle: `${user.role.replace('_', ' ').toUpperCase()}${user.email ? ` • ${user.email}` : ''}`,
            }))}
          selectedIds={editManagerId ? [editManagerId] : []}
          onSelect={(userId) => {
            setEditManagerId(userId);
            setShowEditManagerPicker(false);
          }}
          title="Select Manager"
          placeholder="Search managers..."
          multiSelect={false}
          emptyMessage="No managers found. Create a manager account first."
        />

        <SearchableSelectModal
          visible={showEditMachineryPicker}
          onClose={() => setShowEditMachineryPicker(false)}
          items={machinery.map((machine) => ({
            id: machine.id,
            label: machine.registrationNumber,
            subtitle: `${machine.type.replace('_', ' ').toUpperCase()} • ${machine.model}`,
          }))}
          selectedIds={editDedicatedMachinery}
          onSelect={(machineryId) => {
            if (editDedicatedMachinery.includes(machineryId)) {
              setEditDedicatedMachinery(editDedicatedMachinery.filter(id => id !== machineryId));
            } else {
              setEditDedicatedMachinery([...editDedicatedMachinery, machineryId]);
            }
          }}
          title="Select Dedicated Machinery"
          placeholder="Search by registration number..."
          multiSelect
          emptyMessage="No machinery found"
        />

        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
          statusBarTranslucent
        >
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableOpacity 
                style={styles.modalOverlayTouchable} 
                activeOpacity={1} 
                onPress={() => {
                  Keyboard.dismiss();
                  setShowAddModal(false);
                }}
              >
                <View />
              </TouchableOpacity>
              <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Add New User</Text>
                  <TouchableOpacity onPress={() => setShowAddModal(false)}>
                    <X size={24} color={colors.secondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                >
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      placeholder="Full Name"
                      placeholderTextColor={colors.secondary}
                      value={newUserName}
                      onChangeText={(text) => {
                        setNewUserName(text);
                        const generatedWorkId = generateWorkId(text, newUserDepartment);
                        const generatedSystemId = generateSystemId(text, newUserRole);
                        if (generatedWorkId) {
                          setNewUserWorkId(generatedWorkId);
                        }
                        if (generatedSystemId) {
                          setNewUserSystemId(generatedSystemId);
                        }
                      }}
                      autoCapitalize="words"
                    />
                  </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Email *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      placeholder="Email Address"
                      placeholderTextColor={colors.secondary}
                      value={newUserEmail}
                      onChangeText={(text) => {
                        setNewUserEmail(text);
                        const emailUsername = text.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                        if (emailUsername) {
                          setNewUserUsername(emailUsername);
                        }
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                    />
                    <Text style={[styles.inputHint, { color: colors.secondary, marginTop: 4 }]}>
                      {newUserUsername ? `Username will be generated: ${newUserUsername}` : 'Username will be generated from email'}
                    </Text>
                  </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Password *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      placeholder="Password"
                      placeholderTextColor={colors.secondary}
                      value={newUserPassword}
                      onChangeText={setNewUserPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      placeholder="Phone Number"
                      placeholderTextColor={colors.secondary}
                      value={newUserPhone}
                      onChangeText={setNewUserPhone}
                      keyboardType="phone-pad"
                    />
                  </View>



                <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Role *</Text>
                    <View style={styles.roleSelector}>
                    {(['operator', 'manager', 'admin', 'workshop_manager', 'inspector', 'repairman', 'engineer', 'electrician', 'contractor', 'seasonal', 'office', 'tyre_fitter', 'mechanic'] as UserRole[]).map((role) => {
                      const RoleIcon = getRoleIcon(role);
                      const roleColor = getRoleColor(role);
                      const isSelected = newUserRole === role;

                      return (
                        <TouchableOpacity
                          key={role}
                          style={[
                            styles.roleOption,
                            { backgroundColor: colors.background, borderColor: colors.border },
                            isSelected && { backgroundColor: roleColor + '20', borderColor: roleColor, borderWidth: 2 },
                          ]}
                          onPress={() => setNewUserRole(role)}
                          activeOpacity={0.7}
                        >
                          <RoleIcon size={20} color={isSelected ? roleColor : colors.secondary} strokeWidth={2} />
                          <Text
                            style={[
                              styles.roleOptionText,
                              { color: isSelected ? roleColor : colors.text },
                            ]}
                          >
                            {role.replace('_', ' ')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <Text style={[styles.sectionHeader, { color: colors.text }]}>Department Assignment</Text>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Department</Text>
                    <View style={styles.departmentChipsContainer}>
                    {departmentOptions.map((dept) => (
                      <TouchableOpacity
                        key={dept.id}
                        style={[
                          styles.chipButton,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          newUserDepartment === dept.id && { borderColor: '#007AFF', backgroundColor: '#007AFF' + '20', borderWidth: 2 },
                        ]}
                        onPress={() => {
                          const newDept = newUserDepartment === dept.id ? undefined : dept.id;
                          setNewUserDepartment(newDept);
                          const generatedWorkId = generateWorkId(newUserName, newDept);
                          if (generatedWorkId) {
                            setNewUserWorkId(generatedWorkId);
                          }
                        }}
                      >
                        <Text style={[styles.chipText, { color: newUserDepartment === dept.id ? '#007AFF' : colors.text }]}>
                          {dept.label.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    </View>
                  </View>

                  {newUserWorkId && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.text }]}>Work ID (Auto-generated)</Text>
                      <View style={[
                        styles.input,
                        { backgroundColor: colors.background + '80', borderColor: colors.border, justifyContent: 'center' },
                      ]}>
                        <Text style={[{ color: colors.text, fontSize: 16, fontWeight: '600' as const }]}>
                          {newUserWorkId}
                        </Text>
                      </View>
                      <Text style={[styles.inputHint, { color: colors.secondary, marginTop: 4 }]}>Generated from Department + Name</Text>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Employee ID</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      placeholder="Employee ID Number"
                      placeholderTextColor={colors.secondary}
                      value={newUserEmployeeId}
                      onChangeText={setNewUserEmployeeId}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Driver Reference</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                      ]}
                      placeholder="Driver Reference Number"
                      placeholderTextColor={colors.secondary}
                      value={newUserDriverRef}
                      onChangeText={setNewUserDriverRef}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Vehicle Teams</Text>
                    <Text style={[styles.inputHint, { color: colors.secondary }]}>Select one or more</Text>
                    <View style={styles.departmentChipsContainer}>
                    {vehicleTeamOptions.map((team) => (
                      <TouchableOpacity
                        key={team.id}
                        style={[
                          styles.chipButton,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          newUserVehicleTeams.includes(team.id) && { borderColor: '#0EA5E9', backgroundColor: '#0EA5E9' + '20', borderWidth: 2 },
                        ]}
                        onPress={() => {
                          if (newUserVehicleTeams.includes(team.id)) {
                            setNewUserVehicleTeams(newUserVehicleTeams.filter((t) => t !== team.id));
                          } else {
                            setNewUserVehicleTeams([...newUserVehicleTeams, team.id]);
                          }
                        }}
                      >
                        <Text style={[styles.chipText, { color: newUserVehicleTeams.includes(team.id) ? '#0EA5E9' : colors.text }]}>
                          {team.label.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Manager Assignment {(newUserRole === 'admin' || newUserRole === 'manager' || newUserRole === 'workshop_manager') ? '' : '*'}</Text>
                    <Text style={[styles.inputHint, { color: colors.secondary }]}>
                      {(newUserRole === 'admin' || newUserRole === 'manager' || newUserRole === 'workshop_manager') ? 'Optional for admins and managers' : 'Required: All users must have a dedicated manager'}
                    </Text>
                    <TouchableOpacity
                      style={[styles.imagePickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => setShowManagerPicker(true)}
                    >
                      <UserCog size={20} color={colors.tint} />
                      <Text style={[styles.imagePickerText, { color: colors.tint }]}>
                        {newUserManagerId ? users.find(u => u.id === newUserManagerId)?.name || 'Select Manager' : 'Select Manager'}
                      </Text>
                    </TouchableOpacity>
                    {newUserManagerId && (() => {
                      const manager = users.find(u => u.id === newUserManagerId);
                      return manager ? (
                        <View style={[styles.imageItem, { backgroundColor: colors.background, marginTop: 8 }]}>
                          <View style={styles.managerInfoRow}>
                            <UserCog size={16} color={getRoleColor(manager.role)} />
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.imageItemText, { color: colors.text }]}>{manager.name}</Text>
                              <Text style={[styles.managerRole, { color: colors.secondary }]}>
                                {manager.role.replace('_', ' ').toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity onPress={() => setNewUserManagerId(undefined)}>
                            <X size={16} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      ) : null;
                    })()}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Dedicated Machinery</Text>
                    <Text style={[styles.inputHint, { color: colors.secondary }]}>Optional: Assign specific machinery</Text>
                    <TouchableOpacity
                      style={[styles.imagePickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => {
                        console.log('[ManageUsers] Opening machinery picker, count:', machinery.length);
                        setShowMachineryPicker(true);
                      }}
                    >
                      <Truck size={20} color={colors.tint} />
                      <Text style={[styles.imagePickerText, { color: colors.tint }]}>
                        {newUserDedicatedMachinery.length === 0 ? 'Select Machinery' : `${newUserDedicatedMachinery.length} Selected`}
                      </Text>
                    </TouchableOpacity>
                    {newUserDedicatedMachinery.length > 0 && (
                      <View style={styles.imageList}>
                        {newUserDedicatedMachinery.map((machineryId) => {
                          const machine = machinery.find(m => m.id === machineryId);
                          return (
                            <View key={machineryId} style={[styles.imageItem, { backgroundColor: colors.background }]}>
                              <Text style={[styles.imageItemText, { color: colors.text }]} numberOfLines={1}>
                                {machine?.registrationNumber || 'Unknown'}
                              </Text>
                              <TouchableOpacity onPress={() => setNewUserDedicatedMachinery(newUserDedicatedMachinery.filter(id => id !== machineryId))}>
                                <X size={16} color={colors.danger} />
                              </TouchableOpacity>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.tint }]}
                  onPress={handleAddUser}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Create User</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>

        <SearchableSelectModal
          visible={showMachineryPicker}
          onClose={() => setShowMachineryPicker(false)}
          items={machinery.map((machine) => ({
            id: machine.id,
            label: machine.registrationNumber,
            subtitle: `${machine.type.replace('_', ' ').toUpperCase()} • ${machine.model}`,
          }))}
          selectedIds={newUserDedicatedMachinery}
          onSelect={(machineryId) => {
            console.log('[ManageUsers] Machinery selected:', machineryId);
            if (newUserDedicatedMachinery.includes(machineryId)) {
              setNewUserDedicatedMachinery(newUserDedicatedMachinery.filter(id => id !== machineryId));
            } else {
              setNewUserDedicatedMachinery([...newUserDedicatedMachinery, machineryId]);
            }
          }}
          title="Select Dedicated Machinery"
          placeholder="Search by registration number..."
          multiSelect
          emptyMessage="No machinery found"
        />

        <InductionDocumentViewer
          visible={showDocumentViewer}
          onClose={() => setShowDocumentViewer(false)}
          documents={inductionDocuments}
          initialIndex={viewerInitialIndex}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  usersList: {
    gap: 16,
  },
  userCard: {
    borderRadius: 16,
    padding: 16,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  currentUserBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentUserBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
  },
  editCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  editContent: {
    gap: 16,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  imagePickerText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  imageList: {
    gap: 8,
    marginTop: 8,
  },
  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  imageItemText: {
    fontSize: 14,
    flex: 1,
  },
  updateButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
  },
  roleSelector: {
    gap: 12,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: '500' as const,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  inputHint: {
    fontSize: 13,
    marginTop: -4,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  departmentChipsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  chipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  machineryPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  machineryPickerName: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  machineryPickerType: {
    fontSize: 13,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  halfButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  documentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  documentItemText: {
    fontSize: 14,
    flex: 1,
  },
  documentItemRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  documentActionButton: {
    padding: 4,
  },
  managerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  managerRole: {
    fontSize: 12,
    marginTop: 2,
  },
});
