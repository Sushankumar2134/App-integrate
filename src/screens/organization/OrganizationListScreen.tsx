import React, {useMemo, useState, useEffect} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

import {Organization} from '../../types/organization';
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

  // ================= API =================

  const API_URL =
    'https://tamala-unsighing-quadrennially.ngrok-free.dev/api/organizations';

  // ================= FETCH =================

  const handleFetchOrganizations = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL);

      // ✅ Laravel returns { status, message, data: [] }
      const list = response.data?.data || [];

      if (!Array.isArray(list)) {
        console.log('Invalid API response:', response.data);
        return;
      }

      const transformed: Organization[] = list.map((org: any) => ({
        id: org.id,

        organizationName: org.name || '',
        organizationType: org.type || '',
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

        status: org.status === 1 ? 'Active' : 'Inactive',

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
      }));

      setOrganizations(transformed);
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
    return organizations.filter(org =>
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
    });
  };

  const handleView = (organization: Organization) => {
    navigation.navigate('ViewOrganization', {
      organizationId: organization.id,
    });
  };

  const handleEdit = (organization: Organization) => {
    navigation.navigate('AddEditOrganization', {
      organizationId: organization.id,
      isEditMode: true,
    });
  };

  const handleToggleStatus = async (organization: Organization) => {
    try {
      const newStatus = organization.status === 'Active' ? 0 : 1;

      await axios.put(`${API_URL}/${organization.id}`, {
        status: newStatus,
      });

      setOrganizations(prev =>
        prev.map(org =>
          org.id === organization.id
            ? {
                ...org,
                status: newStatus === 1 ? 'Active' : 'Inactive',
              }
            : org,
        ),
      );

      Alert.alert(
        'Success',
        `Status updated to ${
          newStatus === 1 ? 'Active' : 'Inactive'
        }`,
      );
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

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
              await axios.delete(
                `${API_URL}/${organization.id}`,
              );

              setOrganizations(prev =>
                prev.filter(
                  org => org.id !== organization.id,
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

  // ================= ROW =================

  const renderRow = ({item}: {item: Organization}) => (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <View style={styles.rowLeft}>
          <Text style={styles.orgName}>
            {item.organizationName}
          </Text>
          <Text style={styles.orgMeta}>
            {item.organizationType}
          </Text>
          <Text style={styles.orgMeta}>{item.city}</Text>
        </View>

        <Text
          style={[
            styles.status,
            {
              color:
                item.status === 'Active'
                  ? '#2e7d32'
                  : '#ef6c00',
            },
          ]}>
          {item.status}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() => handleView(item)}>
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.statusBtn]}
          onPress={() => handleToggleStatus(item)}>
          <Text style={styles.actionText}>
            {item.status === 'Active'
              ? 'Deactivate'
              : 'Activate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDeleteOrganization(item)}>
          <Text style={styles.actionText}>Delete</Text>
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
        <FlatList
          data={filteredOrganizations}
          renderItem={renderRow}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
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

  listContent: {
    padding: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: 12,
  },

  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  rowLeft: {
    flex: 1,
  },

  orgName: {
    fontSize: 16,
    fontWeight: '700',
  },

  orgMeta: {
    fontSize: 12,
    color: '#666',
  },

  status: {
    fontSize: 12,
    fontWeight: '700',
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 6,
  },

  actionBtn: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },

  viewBtn: {
    backgroundColor: '#e3f2fd',
  },

  editBtn: {
    backgroundColor: '#f3e5f5',
  },

  statusBtn: {
    backgroundColor: '#e8f5e9',
  },

  deleteBtn: {
    backgroundColor: '#ffebee',
  },

  actionText: {
    fontSize: 12,
    fontWeight: '600',
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
