import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View, ActivityIndicator, Alert, TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Block, Text} from '../../components';
import PrimaryButton from '../../components/PrimaryButton';
import {Organization} from '../../types/organization';
import {fetchOrganizationById, deleteOrganization} from '../../../api/organisation';
import {useTheme} from '../../hooks';

interface ViewOrganizationScreenProps {
  navigation: any;
  route: any;
}

const ViewOrganizationScreen: React.FC<ViewOrganizationScreenProps> = ({
  navigation,
  route,
}) => {
  const {colors} = useTheme();
  const {organizationId} = route.params || {};
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeOrganization = (org: any): Organization => ({
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
    isDeleted: org.isDeleted || false,
  });

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const response = await fetchOrganizationById(String(organizationId));
        const org = response?.data || response;
        setOrganization(org ? normalizeOrganization(org) : null);
      } catch (error) {
        console.error('Error fetching organization:', error);
        Alert.alert('Error', 'Failed to load organization details');
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchOrganization();
    }
  }, [organizationId]);

  const renderField = (label: string, value?: string | boolean | string[]) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>
        {Array.isArray(value)
          ? value.join(', ')
          : typeof value === 'boolean'
          ? value
            ? 'Yes'
            : 'No'
          : value || '-'}
      </Text>
    </View>
  );

  const handleDelete = () => {
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
              await deleteOrganization(organization!.id);
              Alert.alert(
                'Success',
                'Organization deleted',
                [{text: 'OK', onPress: () => {
                  if (route.params?.onSave) {
                    route.params.onSave();
                  }
                  navigation.goBack();
                }}],
              );
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete organization');
            }
          },
        },
      ],
    );
  };

  return (
    <Block safe style={[styles.container, {backgroundColor: colors.background}]}> 
      <View
        style={[
          styles.header,
          {backgroundColor: colors.card, borderBottomColor: colors.light},
        ]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={StyleSheet.flatten([styles.title, {color: colors.text}])}>
          Organization Details
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : organization ? (
        <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Organization Master</Text>
          {renderField('Organization Name', organization?.organizationName)}
          {renderField('Type', organization?.organizationType)}
          {renderField('Registration Number', organization?.registrationNumber)}
          {renderField('GST', organization?.gst)}
          {renderField('Contact', organization?.contactNumber)}
          {renderField('Email', organization?.email)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Address Details</Text>
          {renderField('Address', organization?.address)}
          {renderField('City', organization?.city)}
          {renderField('State', organization?.state)}
          {renderField('Country', organization?.country)}
          {renderField('Pincode', organization?.pincode)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin & Subscription</Text>
          {renderField('Admin Name', organization?.adminName)}
          {renderField('Admin Email', organization?.adminEmail)}
          {renderField('Admin Mobile', organization?.adminMobile)}
          {renderField('Subscription Plan', organization?.subscriptionPlan)}
          {renderField('Status', organization?.status)}
        </View>

        <View style={styles.buttonRow}>
          <PrimaryButton
            title="Edit"
            onPress={() =>
              navigation.navigate('AddEditOrganization', {
                organization,
                isEditMode: true,
                onSave: route.params?.onSave,
              })
            }
            style={styles.button}
          />
          <PrimaryButton
            title="Delete"
            onPress={handleDelete}
            variant="danger"
            style={styles.button}
          />
        </View>
      </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Failed to load organization</Text>
        </View>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  fieldRow: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
  },
  fieldValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  button: {
    flex: 1,
    minWidth: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});

export default ViewOrganizationScreen;
