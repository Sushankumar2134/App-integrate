import React, {useMemo, useState, useEffect} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Organization} from '../../types/organization';
import {
  deleteOrganization,
  fetchOrganizations,
  updateOrganization,
   toggleOrganizationStatus,
} from '../../../api/organisation';
import {Block, Button, Input, Text} from '../../components';
import {useTheme} from '../../hooks';

interface OrganizationListScreenProps {
  navigation: any;
}

const OrganizationListScreen: React.FC<OrganizationListScreenProps> = ({
  navigation,
}) => {
  const {colors, gradients, sizes} = useTheme();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const normalizeOrganization = (org: any): Organization => ({
    id: org.id,
    organizationName: org.name || '',
organizationType:
  org.type === 'private'
    ? 'Private'
    : org.type === 'trust'
    ? 'Trust'
    : org.type === 'government'
    ? 'Government'
    : org.type || 'Private',
    registrationNumber: org.registration_number || '',
    gst: org.gst_number || '',
    address: org.address || '',
    city: org.city || '',
    state: org.state || '',
    country: org.country || '',
    pincode: org.pincode || '',
    contactNumber: org.contact_number || '',
    email: org.email || '',
    timeZone: org.timezone || '',
    organizationUrl: org.organization_url || '',
    institutionUrlSame: org.institution_url_same || false,
    softwareWebsiteUrl: org.software_website_url || '',
    loginTemplate: org.login_template || 'Standard',
    logo: org.logo || '',
    defaultLanguage: org.default_language || 'English',
    adminName: org.admin_name || '',
    adminEmail: org.admin_email || '',
    adminMobile: org.admin_mobile || '',
    status: org.status ? 'Active' : 'Inactive',
    mouCopy: org.mou_copy || '',
    poNumber: org.po_number || '',
    poStartDate: org.po_start_date || '',
    poEndDate: org.po_end_date || '',
    subscriptionPlan: org.subscription_plan || 'Standard',
    enabledModules: org.enabled_modules || [],
    invoiceType: org.invoice_type || '',
    invoiceFrequency: org.invoice_frequency || '',
    paymentMode: org.payment_mode || '',
    invoiceAmount: org.invoice_amount || '',
    paymentStatus: org.payment_status || '',
    paymentReceived: org.payment_received || false,
    paymentDate: org.payment_date || '',
    transactionReference: org.transaction_reference || '',
    pocName: org.poc_name || '',
    pocEmail: org.poc_email || '',
    pocContact: org.poc_contact || '',
    supportSLA: org.support_sla || '',
    isDeleted: !!org.deleted_at,
  });

  // ================= FETCH =================

  const handleFetchOrganizations = async () => {
    try {
      setLoading(true);

      const response = await fetchOrganizations();
      const list = response?.data || [];

      if (!Array.isArray(list)) {
        console.log('Invalid API response:', response.data);
        return;
      }

      setOrganizations(list.map(normalizeOrganization));
    } catch (error) {
      console.error('Error fetching organizations:', error);
      Alert.alert('Error', 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD =================

  useEffect(() => {
    handleFetchOrganizations();
  }, []);

  // ================= SEARCH =================

  const filteredOrganizations = useMemo(() => {
    return organizations
      .filter(org => !org.isDeleted)
      .filter(org =>
        (org.organizationName || '')
          .toLowerCase()
          .includes(searchText.toLowerCase()),
      );
  }, [organizations, searchText]);

  // ================= HANDLERS =================

  const handleAdd = () => {
    navigation.navigate('AddEditOrganization', {
      organizationId: null,
      isEditMode: false,
      onSave: handleFetchOrganizations,
    });
  };

  const handleView = (organization: Organization) => {
    navigation.navigate('ViewOrganization', {
      organizationId: organization.id,
      onSave: handleFetchOrganizations,
    });
  };

  const handleEdit = (organization: Organization) => {
    navigation.navigate('AddEditOrganization', {
      organizationId: organization.id,
      organization,
      isEditMode: true,
      onSave: handleFetchOrganizations,
    });
  };

  const handleToggleStatus = async (org: Organization) => {
    try {
      await toggleOrganizationStatus(org.id);

      // Reload latest data from backend - same as institution
      await handleFetchOrganizations();

      Alert.alert('Success', 'Status updated successfully');
    } catch (error) {
      console.error('Toggle error:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };


  // const handleToggleStatus = async (organization: Organization) => {
  //   try {
  //     const newStatus = organization.status === 'Active' ? 0 : 1;

  //     await updateOrganization(organization.id, {status: newStatus});

  //     setOrganizations(prev =>
  //       prev.map(org =>
  //         org.id === organization.id
  //           ? {
  //               ...org,
  //               status: newStatus === 1 ? 'Active' : 'Inactive',
  //             }
  //           : org,
  //       ),
  //     );

  //     Alert.alert(
  //       'Success',
  //       `Status updated to ${
  //         newStatus === 1 ? 'Active' : 'Inactive'
  //       }`,
  //     );
  //   } catch (error) {
  //     console.error('Error updating status:', error);
  //     Alert.alert('Error', 'Failed to update status');
  //   }
  const handleDeleteOrganization = (organization: Organization) => {
  Alert.alert(
    'Confirm Delete',
    'Are you sure you want to delete this organization?',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteOrganization(organization.id);

            // Move to deleted screen
            setOrganizations(prev =>
              prev.map(org =>
                org.id === organization.id
                  ? {...org, isDeleted: true}
                  : org,
              ),
            );

            Alert.alert(
              'Success',
              'Organization deleted',
            );
          } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ],
  );
};
  const handleViewDeleted = () => {
    const deletedOrgs = organizations.filter(org => org.isDeleted);
    navigation.navigate('DeletedOrganization', {
      deletedOrganizations: deletedOrgs,
      onRestore: (restored: Organization[]) => {
        setOrganizations(restored);
      },
      onDelete: (filtered: Organization[]) => {
        setOrganizations(filtered);
      },
    });
  };

  // ================= TABLE ROW =================

  const renderTableRow = (item: Organization, index: number) => (
    <View key={item.id} style={styles.tableRow}>
      <View style={[styles.tableCell, styles.slnoCell]}>
        <Text style={styles.cellText}>{index + 1}</Text>
      </View>
      <View style={[styles.tableCell, styles.nameCell]}>
        <Text style={styles.cellText}>{item.organizationName}</Text>
      </View>
      <View style={[styles.tableCell, styles.typeCell]}>
        <Text style={styles.cellText}>{item.organizationType}</Text>
      </View>
      <View style={[styles.tableCell, styles.emailCell]}>
        <Text style={styles.cellText}>{item.email}</Text>
      </View>
      <View style={[styles.tableCell, styles.planCell]}>
        <Text style={styles.cellText}>{item.subscriptionPlan}</Text>
      </View>
      <View style={[styles.tableCell, styles.statusCell]}>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: item.status === 'Active' ? '#4CAF50' : '#f44336'},
          ]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <View style={[styles.tableCell, styles.actionCell]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleView(item)}>
          <Ionicons name="eye" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleEdit(item)}>
          <Ionicons name="pencil" size={20} color="#FFC107" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleToggleStatus(item)}>
          <Ionicons
            name={item.status === 'Active' ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={item.status === 'Active' ? '#4CAF50' : '#f44336'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleDeleteOrganization(item)}>
          <Ionicons name="trash" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ================= LOADING =================

  if (loading) {
    return (
      <Block safe style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      </Block>
    );
  }

  // ================= UI =================

  return (
    <Block safe style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>Organizations</Text>
      </View>

      {/* SEARCH */}

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by organization name"
          value={searchText}
          onChangeText={setSearchText}
          marginBottom={sizes.s}
        />
      </View>

      {/* ADD */}

      <View style={styles.addButtonContainer}>
        <View style={styles.buttonRow}>
          <Button
            gradient={gradients.primary}
            onPress={handleViewDeleted}
            style={styles.buttonHalf}>
            <Text white bold>
              Deleted Organizations
            </Text>
          </Button>
          <Button
            gradient={gradients.primary}
            onPress={handleAdd}
            style={styles.buttonHalf}>
            <Text white bold>
              + Add Organization
            </Text>
          </Button>
        </View>
      </View>

      {/* LIST */}

      {filteredOrganizations.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, styles.slnoCell]}>
                <Text style={styles.headerText}>SL.NO</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.nameCell]}>
                <Text style={styles.headerText}>Organization Name</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.typeCell]}>
                <Text style={styles.headerText}>Type</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.emailCell]}>
                <Text style={styles.headerText}>Email</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.planCell]}>
                <Text style={styles.headerText}>Plan</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.statusCell]}>
                <Text style={styles.headerText}>Status</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.actionCell]}>
                <Text style={styles.headerText}>Actions</Text>
              </View>
            </View>

            {filteredOrganizations.map((item, index) =>
              renderTableRow(item, index),
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No organizations found
          </Text>
        </View>
      )}
    </Block>
  );
};

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },

  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },

  addButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },

  buttonHalf: {
    flex: 1,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tableHeaderCell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2196F3',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  slnoCell: {
    width: 60,
  },
  nameCell: {
    width: 170,
  },
  typeCell: {
    width: 100,
  },
  emailCell: {
    width: 200,
  },
  planCell: {
    width: 110,
  },
  statusCell: {
    width: 110,
  },
  actionCell: {
    width: 150,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 13,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  iconBtn: {
    padding: 6,
    marginHorizontal: 4,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});

export default OrganizationListScreen;
