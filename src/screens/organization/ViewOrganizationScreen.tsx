import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View, ActivityIndicator, Alert} from 'react-native';
import axios from 'axios';
import {Block, Text} from '../../components';
import PrimaryButton from '../../components/PrimaryButton';
import {Organization} from '../../types/organization';
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

  const API_URL = 'https://tamala-unsighing-quadrennially.ngrok-free.dev/api/organizations';

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/${organizationId}`);
        
        const org = response.data?.data || response.data;
        
        const transformed: Organization = {
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
          // isDeleted: !!org.deleted_at,
        };
        
        setOrganization(transformed);
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

  return (
    <Block safe style={[styles.container, {backgroundColor: colors.background}]}> 
      <View
        style={[
          styles.header,
          {backgroundColor: colors.card, borderBottomColor: colors.light},
        ]}>
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
          <Text style={styles.cardTitle}>Master Details</Text>
          {renderField('Organization Name', organization?.organizationName)}
          {renderField('Type', organization?.organizationType)}
          {renderField('Registration Number', organization?.registrationNumber)}
          {renderField('GST', organization?.gst)}
          {renderField('Address', organization?.address)}
          {renderField('City', organization?.city)}
          {renderField('State', organization?.state)}
          {renderField('Country', organization?.country)}
          {renderField('Pincode', organization?.pincode)}
          {renderField('Contact', organization?.contactNumber)}
          {renderField('Email', organization?.email)}
          {renderField('Time Zone', organization?.timeZone)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Access & Branding</Text>
          {renderField('Organization URL', organization?.organizationUrl)}
          {renderField('Institution URL Same', organization?.institutionUrlSame)}
          {renderField('Software Website URL', organization?.softwareWebsiteUrl)}
          {renderField('Login Template', organization?.loginTemplate)}
          {renderField('Default Language', organization?.defaultLanguage)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admin & Control</Text>
          {renderField('Admin Name', organization?.adminName)}
          {renderField('Admin Email', organization?.adminEmail)}
          {renderField('Admin Mobile', organization?.adminMobile)}
          {renderField('Status', organization?.status)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal & Commercial</Text>
          {renderField('MOU Copy', organization?.mouCopy)}
          {renderField('PO Number', organization?.poNumber)}
          {renderField('PO Start Date', organization?.poStartDate)}
          {renderField('PO End Date', organization?.poEndDate)}
          {renderField('Subscription Plan', organization?.subscriptionPlan)}
          {renderField('Enabled Modules', organization?.enabledModules)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Billing & Payment</Text>
          {renderField('Invoice Type', organization?.invoiceType)}
          {renderField('Invoice Frequency', organization?.invoiceFrequency)}
          {renderField('Payment Mode', organization?.paymentMode)}
          {renderField('Invoice Amount', organization?.invoiceAmount)}
          {renderField('Payment Status', organization?.paymentStatus)}
          {renderField('Payment Received', organization?.paymentReceived)}
          {renderField('Payment Date', organization?.paymentDate)}
          {renderField('Transaction Reference', organization?.transactionReference)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support & Communication</Text>
          {renderField('POC Name', organization?.pocName)}
          {renderField('POC Email', organization?.pocEmail)}
          {renderField('POC Contact', organization?.pocContact)}
          {renderField('Support SLA', organization?.supportSLA)}
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
            style={{flex: 1}}
          />
          <PrimaryButton
            title="Back"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={{flex: 1, marginLeft: 10}}
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    marginTop: 16,
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
