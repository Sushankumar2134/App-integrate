import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';

import { Institution } from '../../types/institution';
import { Block, Button, Text } from '../../components';
import { useTheme } from '../../hooks';

interface ViewInstitutionScreenProps {
  navigation: any;
  route: any;
}

const ViewInstitutionScreen: React.FC<ViewInstitutionScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, gradients, sizes } = useTheme();
  const { institutionId } = route.params;
  const [institution, setInstitution] = React.useState<Institution | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);

  const API_URL =
    'https://tamala-unsighing-quadrennially.ngrok-free.dev/api/institutions';

  // ================= FORMAT DATE FUNCTION =================
  const formatDateToIndian = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'N/A';
    }
  };

  // ================= RENDER IMAGE FUNCTION =================
  const renderImage = (imageUrl: string | undefined, fallback: string = '📷') => {
    if (!imageUrl) return fallback;
    return `https://tamala-unsighing-quadrennially.ngrok-free.dev/${imageUrl}`;
  };

  // ================= FETCH INSTITUTION DATA =================
  const fetchInstitutionData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/${institutionId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle the response - could be { data: {...} } or direct object
      const data = response.data.data || response.data;
      
      // Transform API response to Institution type
      const formattedData: Institution = {
        id: data.id,
        institutionName: data.name,
        institutionCode: data.code,
        organizationId: data.organization_id,
        gst: data.gst_number,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        contactNumber: data.contact_number,
        email: data.email,
        timeZone: data.timezone,
        institutionUrl: data.institution_url,
        loginTemplate: data.login_template,
        logo: data.logo,
        defaultLanguage: data.default_language,
        adminName: data.admin_name,
        adminEmail: data.admin_email,
        adminMobile: data.admin_mobile,
        role: data.role,
        status: data.status === 1 ? 'Active' : 'Inactive',
        mouCopy: data.mou_copy,
        poNumber: data.po_number,
        poStartDate: data.po_start_date,
        poEndDate: data.po_end_date,
        subscriptionPlan: data.subscription_plan,
        modules: data.modules || [],
        invoiceType: data.invoice_type,
        invoiceFrequency: data.invoice_frequency,
        paymentMode: data.payment_mode,
        invoiceAmount: data.invoice_amount,
        paymentStatus: data.payment_status,
        paymentReceived: String(data.payment_received),
        paymentDate: data.payment_date,
        transactionReference: data.transaction_reference,
        pocName: data.poc_name,
        pocEmail: data.poc_email,
        pocContact: data.poc_contact,
        supportSLA: data.support_sla,
        isDeleted: data.deleted_at !== null,
      };

      setInstitution(formattedData);
    } catch (error) {
      console.error('Error fetching institution:', error);
      Alert.alert('Error', 'Unable to load institution details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // ================= ON LOAD =================
  useEffect(() => {
    fetchInstitutionData();
  }, [institutionId]);

  // ================= HANDLERS =================
  const handleEditInstitution = () => {
    if (institution) {
      navigation.navigate('AddEditInstitution', {
        institution,
        isEditMode: true,
      });
    }
  };

  const handleDeleteInstitution = () => {
    if (!institution) return;
    
    Alert.alert(
      'Delete Institution',
      `Are you sure you want to delete "${institution?.institutionName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await axios.delete(`${API_URL}/${institution?.id}`);
              Alert.alert('Success', 'Institution deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Unable to delete institution');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleToggleStatus = async () => {
    if (!institution) return;
    
    try {
      setActionLoading(true);
      const newStatus =
        String(institution?.status) === 'Active' ? 'Inactive' : 'Active';

      await axios.put(`${API_URL}/${institution?.id}`, {
        status: newStatus,
      });

      Alert.alert('Success', `Status changed to ${newStatus}`);
      // Refresh the data
      await fetchInstitutionData();
    } catch (error) {
      Alert.alert('Error', 'Unable to update status');
    } finally {
      setActionLoading(false);
    }
  };

  // ================= RENDER SECTION =================
  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {title}
      </Text>
      <View style={styles.divider} />
      {children}
    </View>
  );

  // ================= RENDER FIELD =================
  const renderField = (label: string, value: string | undefined) => (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>
        {label}
      </Text>
      <Text style={[styles.fieldValue, { color: colors.gray }]}>
        {value || 'N/A'}
      </Text>
    </View>
  );

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: colors.text }]}
          numberOfLines={1}>
          {institution?.institutionName || 'Institution Details'}
        </Text>
      </View>

      {/* LOADING STATE */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.gray }}>
            Loading institution details...
          </Text>
        </View>
      ) : !institution ? (
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>
            Unable to load institution details
          </Text>
        </View>
      ) : (
        <>
          {/* SCROLLABLE CONTENT */}
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={{ paddingBottom: 100 }}>

            {/* LOGO SECTION */}
            {institution?.logo && (
              <View style={[styles.logoSection, { backgroundColor: colors.card }]}>
                <Image
                  source={{ uri: renderImage(institution?.logo) }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            )}

        {/* BASIC INFORMATION */}
        {renderSection('Basic Information', (
          <View>
            {renderField('Institution Name', institution?.institutionName)}
            {renderField('Institution Code', institution?.institutionCode)}
            {renderField('Organization ID', institution?.organizationId)}
            {renderField('Status', institution?.status)}
          </View>
        ))}

        {/* ADDRESS INFORMATION */}
        {renderSection('Address Information', (
          <View>
            {renderField('Address', institution?.address)}
            {renderField('City', institution?.city)}
            {renderField('State', institution?.state)}
            {renderField('Country', institution?.country)}
            {renderField('Pincode', institution?.pincode)}
            {renderField('Timezone', institution?.timeZone)}
          </View>
        ))}

        {/* CONTACT INFORMATION */}
        {renderSection('Contact Information', (
          <View>
            {renderField('Contact Number', institution?.contactNumber)}
            {renderField('Email', institution?.email)}
            {renderField('Institution URL', institution?.institutionUrl)}
            {renderField('GST Number', institution?.gst)}
          </View>
        ))}

        {/* ADMIN INFORMATION */}
        {renderSection('Admin Information', (
          <View>
            {renderField('Admin Name', institution?.adminName)}
            {renderField('Admin Email', institution?.adminEmail)}
            {renderField('Admin Mobile', institution?.adminMobile)}
          </View>
        ))}

        {/* POINT OF CONTACT */}
        {renderSection('Point of Contact', (
          <View>
            {renderField('POC Name', institution?.pocName)}
            {renderField('POC Email', institution?.pocEmail)}
            {renderField('POC Contact', institution?.pocContact)}
            {renderField('Support SLA', institution?.supportSLA)}
          </View>
        ))}

        {/* CONFIGURATION */}
        {renderSection('Configuration', (
          <View>
            {renderField('Default Language', institution?.defaultLanguage)}
            {renderField('Role', institution?.role)}
            {renderField('Login Template', institution?.loginTemplate)}
            {renderField('Logo', institution?.logo)}
            {institution?.logo && (
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Logo
                </Text>
                <Image
                  source={{ uri: renderImage(institution?.logo) }}
                  style={styles.documentImage}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
        ))}

        {/* SUBSCRIPTION DETAILS */}
        {renderSection('Subscription Details', (
          <View>
            {renderField('Subscription Plan', institution?.subscriptionPlan)}
            {renderField('Invoice Type', institution?.invoiceType)}
            {renderField('Invoice Frequency', institution?.invoiceFrequency)}
            {renderField('Invoice Amount', institution?.invoiceAmount)}
          </View>
        ))}

        {/* PAYMENT INFORMATION */}
        {renderSection('Payment Information', (
          <View>
            {renderField('Payment Mode', institution?.paymentMode)}
            {renderField('Payment Status', institution?.paymentStatus)}
            {renderField('Payment Received', 
              institution?.paymentReceived === 'true' ? 'Yes' : 'No'
            )}
            {renderField('Payment Date', formatDateToIndian(institution?.paymentDate))}
            {renderField('Transaction Reference', institution?.transactionReference)}
          </View>
        ))}

        {/* PO DETAILS */}
        {renderSection('PO Details', (
          <View>
            {renderField('PO Number', institution?.poNumber)}
            {renderField('PO Start Date', formatDateToIndian(institution?.poStartDate))}
            {renderField('PO End Date', formatDateToIndian(institution?.poEndDate))}
            {institution?.mouCopy && (
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  MOU Copy
                </Text>
                <Image
                  source={{ uri: renderImage(institution?.mouCopy) }}
                  style={styles.documentImage}
                  resizeMode="contain"
                />
              </View>
            )}
            {!institution?.mouCopy && renderField('MOU Copy', 'N/A')}
          </View>
        ))}
      </ScrollView>

      {/* ACTION BUTTONS */}
      <View style={[styles.actionContainer, { backgroundColor: colors.card }]}>
        <Button
          gradient={gradients.primary}
          onPress={handleEditInstitution}
          style={styles.actionButton}
          disabled={actionLoading}>
          <Text white bold>
            Edit
          </Text>
        </Button>

        <Button
          gradient={gradients.warning}
          onPress={handleToggleStatus}
          style={styles.actionButton}
          disabled={actionLoading}>
          <Text white bold>
            {String(institution?.status) === 'Active'
              ? 'Deactivate'
              : 'Activate'}
          </Text>
        </Button>

        <Button
          gradient={gradients.danger}
          onPress={handleDeleteInstitution}
          style={styles.actionButton}
          disabled={actionLoading}>
          {actionLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text white bold>
              Delete
            </Text>
          )}
        </Button>
      </View>
        </>
      )}
    </Block>
  );
};

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  backButton: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },

  scrollContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },

  section: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
  },

  field: {
    marginBottom: 12,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },

  fieldValue: {
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },

  actionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },

  actionButton: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoSection: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoImage: {
    width: 120,
    height: 120,
  },

  documentImage: {
    width: '100%',
    height: 200,
    marginTop: 8,
    borderRadius: 4,
  },
});

export default ViewInstitutionScreen;
