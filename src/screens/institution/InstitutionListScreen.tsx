import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Institution } from '../../types/institution';
import { Block, Button, Input, Text } from '../../components';
import { useTheme } from '../../hooks';
import {
  fetchInstitutions,
  deleteInstitution,
  updateInstitution,
  toggleInstitutionStatus,
} from '../../../api/institution';

interface InstitutionListScreenProps {
  navigation: any;
}

const InstitutionListScreen: React.FC<InstitutionListScreenProps> = ({
  navigation,
}) => {
  const { colors, gradients, sizes } = useTheme();

  // ================= STATES =================
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  // ================= NORMALIZE =================
  const normalizeInstitution = (inst: any): Institution => ({
    id: inst.id,
    institutionName: inst.name || '',
    institutionCode: inst.code || '',
    organizationId: inst.organization_id || '',
    organizationName: inst.organization?.name || '',
    gst: inst.gst_number || '',
    address: inst.address || '',
    city: inst.city || '',
    state: inst.state || '',
    country: inst.country || '',
    pincode: inst.pincode || '',
    contactNumber: inst.contact_number || '',
    email: inst.email || '',
    timeZone: inst.timezone || '',
    institutionUrl: inst.institution_url || '',
    loginTemplate: inst.login_template || '',
    logo: inst.logo || '',
    defaultLanguage: inst.default_language || '',
    adminName: inst.admin_name || '',
    adminEmail: inst.admin_email || '',
    adminMobile: inst.admin_mobile || '',
    role: inst.role || '',
    status: inst.status === 1 ? 'Active' : 'Inactive',
    mouCopy: inst.mou_copy || '',
    poNumber: inst.po_number || '',
    poStartDate: inst.po_start_date || '',
    poEndDate: inst.po_end_date || '',
    subscriptionPlan: inst.subscription_plan || '',
    modules: inst.modules || [],
    invoiceType: inst.invoice_type || '',
    invoiceFrequency: inst.invoice_frequency || '',
    paymentMode: inst.payment_mode || '',
    invoiceAmount: inst.invoice_amount || '',
    paymentStatus: inst.payment_status || '',
    paymentReceived: inst.payment_received === true || inst.payment_received === 1 ? 'Yes' : 'No',
    paymentDate: inst.payment_date || '',
    transactionReference: inst.transaction_reference || '',
    pocName: inst.poc_name || '',
    pocEmail: inst.poc_email || '',
    pocContact: inst.poc_contact || '',
    supportSLA: inst.support_sla || '',
    isDeleted: false,
  });

  // ================= FETCH DATA =================
  const handleFetchInstitutions = async () => {
    try {
      setLoading(true);

      const response = await fetchInstitutions();
      const list = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data || [];

      if (!Array.isArray(list)) {
        console.log('Invalid API response:', response?.data);
        return;
      }

      setInstitutions(list.map(normalizeInstitution));
    } catch (error) {
      console.error('Error fetching institutions:', error);
      Alert.alert('Error', 'Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  // ================= ON LOAD =================
  useEffect(() => {
    handleFetchInstitutions();
  }, []);

  // ================= FILTERS =================
  const activeInstitutions = useMemo(() => {
    return institutions.filter(inst => !inst?.isDeleted);
  }, [institutions]);

  const filteredInstitutions = useMemo(() => {
    return activeInstitutions.filter(inst => {
      const name = inst?.institutionName || '';

      return name
        .toLowerCase()
        .includes(searchText.toLowerCase());
    });
  }, [activeInstitutions, searchText]);

  // ================= HANDLERS =================
  const handleAddInstitution = () => {
    navigation.navigate('AddEditInstitution', { 
      institutionId: null,
      isEditMode: false,
      onSave: () => {
        console.log('onSave callback triggered from add');
        handleFetchInstitutions();
      },
    });
  };

  const handleDeletedInstitutions = () => {
    const deletedInsts = institutions.filter(inst => inst.isDeleted);
    navigation.navigate('DeletedInstitution', {
      deletedInstitutions: deletedInsts,
      onRestore: (restoredInstitutions: Institution[]) => {
        // Update with restored array
        setInstitutions(restoredInstitutions);
      },
      onDelete: (filteredInstitutions: Institution[]) => {
        // Update with filtered array
        setInstitutions(filteredInstitutions);
      },
    });
  };

  const handleViewInstitution = (institution: Institution) => {
    navigation.navigate('ViewInstitution', { 
      institutionId: institution.id,
      onSave: () => {
        console.log('onSave callback triggered from view');
        handleFetchInstitutions();
      },
    });
  };

  const handleEditInstitution = (institution: Institution) => {
    navigation.navigate('AddEditInstitution', {
      institutionId: institution.id,
      isEditMode: true,
      onSave: () => {
        console.log('onSave callback triggered from edit');
        handleFetchInstitutions();
      },
    });
  };

  // // ================= TOGGLE STATUS =================
  // const handleToggleStatus = async (institution: Institution) => {
  //   try {
  //     const newStatus = institution.status === 'Active' ? 0 : 1;

  //     await updateInstitution(institution.id, { status: newStatus });

  //     setInstitutions(prev =>
  //       prev.map(inst =>
  //         inst.id === institution.id
  //           ? { ...inst, status: newStatus === 1 ? 'Active' : 'Inactive' }
  //           : inst,
  //       ),
  //     );

  //     Alert.alert(
  //       'Success',
  //       `Status updated to ${newStatus === 1 ? 'Active' : 'Inactive'}`,
  //     );
  //   } catch (error) {
  //     console.error('Error updating status:', error);
  //     Alert.alert('Error', 'Failed to update status');
  //   }
  // };
// ================= TOGGLE STATUS =================
const handleToggleStatus = async (institution: Institution) => {
  try {
    await toggleInstitutionStatus(institution.id); // ✅ NEW API

    // Reload latest data from backend
    await handleFetchInstitutions();

    Alert.alert('Success', 'Status updated successfully');
  } catch (error) {
    console.error('Error updating status:', error);
    Alert.alert('Error', 'Failed to update status');
  }
};

  // ================= DELETE =================
  const handleDeleteInstitution = (institution: Institution) => {
    Alert.alert(
      'Delete Institution',
      `Are you sure you want to delete "${institution.institutionName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            try {
              await deleteInstitution(institution.id);

              setInstitutions(prev =>
                prev.map(inst =>
                  inst.id === institution.id ? { ...inst, isDeleted: true } : inst,
                ),
              );

              Alert.alert('Success', 'Institution deleted');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete institution');
            }
          },
        },
      ],
    );
  };

  // ================= RENDER ROW =================
  const renderInstitutionRow = ({ item, index }: { item: Institution; index: number }) => (
    <View style={styles.tableRow}>
      <View style={[styles.tableCell, styles.slnoCell]}>
        <Text style={styles.cellText}>{index + 1}</Text>
      </View>

      <View style={[styles.tableCell, styles.nameCell]}>
        <Text style={styles.cellText} numberOfLines={1}>
          {item?.institutionName || 'N/A'}
        </Text>
      </View>

   <View style={[styles.tableCell, styles.orgCell]}>
  <Text style={styles.cellText} numberOfLines={1}>
    {item?.organizationName || 'N/A'}
  </Text>
</View>

      <View style={[styles.tableCell, styles.urlCell]}>
        <Text style={styles.cellText} numberOfLines={1}>
          {item?.institutionUrl
            ? item.institutionUrl.replace('https://', '')
            : 'N/A'}
        </Text>
      </View>

      <View style={[styles.tableCell, styles.statusCell]}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'Active' ? '#4CAF50' : '#f44336' },
          ]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <View style={[styles.tableCell, styles.actionCell]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleViewInstitution(item)}>
          <Ionicons name="eye" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleEditInstitution(item)}>
          <Ionicons name="pencil" size={20} color="#FFC107" />
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleToggleStatus(item)}>
          <Ionicons
            name={item.status === 'Active' ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={item.status === 'Active' ? '#4CAF50' : '#f44336'}
          />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleDeleteInstitution(item)}>
          <Ionicons name="trash" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ================= UI =================
  return (
    <Block
      safe
      style={[styles.container, { backgroundColor: colors.background }]}>

      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.light },
        ]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Institutions
        </Text>
      </View>

      {/* SEARCH */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Input
          placeholder="Search by Institution Name..."
          value={searchText}
          onChangeText={setSearchText}
          marginBottom={sizes.s}
        />
      </View>

      {/* BUTTONS */}
      <View style={styles.addButtonContainer}>
        <View style={styles.buttonRow}>
          <Button
            gradient={gradients.primary}
            onPress={handleDeletedInstitutions}
            style={styles.buttonHalf}>
            <Text white bold>
              Deleted Institutions
            </Text>
          </Button>

          <Button
            gradient={gradients.primary}
            onPress={handleAddInstitution}
            style={styles.buttonHalf}>
            <Text white bold>
              + Add Institution
            </Text>
          </Button>
        </View>
      </View>

      {/* TABLE HEADER */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <View style={[styles.headerCell, styles.slnoCell]}>
              <Text style={styles.headerText}>SL.NO</Text>
            </View>
            <View style={[styles.headerCell, styles.nameCell]}>
              <Text style={styles.headerText}>Institution</Text>
            </View>
            <View style={[styles.headerCell, styles.orgCell]}>
              <Text style={styles.headerText}>Organization</Text>
            </View>
            <View style={[styles.headerCell, styles.urlCell]}>
              <Text style={styles.headerText}>Website</Text>
            </View>
            <View style={[styles.headerCell, styles.statusCell]}>
              <Text style={styles.headerText}>Status</Text>
            </View>
            <View style={[styles.headerCell, styles.actionCell]}>
              <Text style={styles.headerText}>Actions</Text>
            </View>
          </View>

          {/* LIST */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredInstitutions.length > 0 ? (
            <FlatList
              data={filteredInstitutions}
              renderItem={renderInstitutionRow}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No institutions found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footerInfo}>
        <Text style={styles.infoText}>
          Total: {filteredInstitutions.length} of{' '}
          {activeInstitutions.length}
        </Text>
      </View>
    </Block>
  );
};

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },

  searchContainer: { 
    padding: 16,
    backgroundColor: '#fff',
  },

  addButtonContainer: { padding: 16 },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },

  buttonHalf: { flex: 1 },

  tableContainer: {
    minWidth: 900,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  headerCell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  tableCell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  slnoCell: { width: 60 },
  nameCell: { width: 200 },
  orgCell: { width: 150 },
  urlCell: { width: 200 },
  statusCell: { width: 100 },
  actionCell: { 
    width: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  cellText: { 
    fontSize: 14,
    color: '#333',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  iconBtn: {
    padding: 4,
  },

  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },

  listContent: {
    paddingBottom: 12,
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#999',
  },

  footerInfo: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },

  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default InstitutionListScreen;
