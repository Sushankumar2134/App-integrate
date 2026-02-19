import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {Organization} from '../../types/organization';
import {
  createOrganization,
  updateOrganization,
  
} from '../../../api/organisation';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import {Block, Modal, Text} from '../../components';
import {useTheme} from '../../hooks';

interface AddEditOrganizationScreenProps {
  navigation: any;
  route: any;
}

const ORG_TYPES: Organization['organizationType'][] = [
  'Private',
  'Trust',
  'Government',
];
const STATUSES: Organization['status'][] = ['Active', 'Inactive'];
const PLANS: Organization['subscriptionPlan'][] = ['Basic', 'Standard', 'Premium'];

const AddEditOrganizationScreen: React.FC<AddEditOrganizationScreenProps> = ({
  navigation,
  route,
}) => {
  const {colors} = useTheme();
  const {height} = useWindowDimensions();
  const modalMaxHeight = Math.max(240, height * 0.55);
  const {organization, isEditMode, onSave} = route.params || {};

  const [formData, setFormData] = useState<Organization>(
    organization || {
      id: Date.now().toString(),
      organizationName: '',
      organizationType: 'Private',
      registrationNumber: '',
      gst: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      contactNumber: '',
      email: '',
      timeZone: 'IST (UTC+5:30)',
      organizationUrl: '',
      institutionUrlSame: false,
      softwareWebsiteUrl: '',
      loginTemplate: 'Standard',
      logo: '',
      defaultLanguage: 'English',
      adminName: '',
      adminEmail: '',
      adminMobile: '',
      status: 'Active',
      mouCopy: '',
      poNumber: '',
      poStartDate: '',
      poEndDate: '',
      subscriptionPlan: 'Standard',
      enabledModules: [],
      invoiceType: '',
      invoiceFrequency: '',
      paymentMode: '',
      invoiceAmount: '',
      paymentStatus: '',
      paymentReceived: false,
      paymentDate: '',
      transactionReference: '',
      pocName: '',
      pocEmail: '',
      pocContact: '',
      supportSLA: '',
      isDeleted: false,
    },
  );

  const [picker, setPicker] = useState<{
    field: keyof Organization;
    options: string[];
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const getErrorMessage = (error: unknown) => {
    const err = error as any;
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Failed to save organization'
    );
  };

  const updateField = (field: keyof Organization, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSave = async () => {
    if (!formData.organizationName || !formData.email) {
      Alert.alert('Validation Error', 'Please fill in Organization Name and Email.');
      return;
    }

    if (!formData.subscriptionPlan) {
      Alert.alert('Validation Error', 'Please select a Subscription Plan.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.organizationName,
        type: formData.organizationType,
        registration_number: formData.registrationNumber,
        gst_number: formData.gst,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        contact_number: formData.contactNumber,
        email: formData.email,
        timezone: formData.timeZone || 'IST (UTC+5:30)',
        organization_url: formData.organizationUrl || '',
        institution_url_same: formData.institutionUrlSame ? 1 : 0,
        software_website_url: formData.softwareWebsiteUrl || '',
        login_template: formData.loginTemplate || 'Standard',
        logo: formData.logo || '',
        default_language: formData.defaultLanguage || 'English',
        admin_name: formData.adminName,
        admin_email: formData.adminEmail,
        admin_mobile: formData.adminMobile,
        status: formData.status === 'Active' ? 1 : 0,
        plan_type: formData.subscriptionPlan,
      };

      if (isEditMode && formData.id) {
        await updateOrganization(formData.id, payload);
      } else {
        await createOrganization(payload);
      }

      if (onSave) {
        onSave();
      }

      Alert.alert(
        'Success',
        isEditMode ? 'Organization updated.' : 'Organization added.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } catch (error) {
      const message = getErrorMessage(error);
      console.error('Error saving organization:', error);
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel', 'Discard changes?', [
      {text: 'Keep', style: 'cancel'},
      {text: 'Discard', style: 'destructive', onPress: navigation.goBack},
    ]);
  };

  const renderSectionTitle = (title: string) => (
    <View
      style={[
        styles.sectionHeader,
        {borderBottomColor: '#000'},
      ]}>
      <Text style={StyleSheet.flatten([styles.sectionTitle, {color: '#000'}])}>
        {title}
      </Text>
    </View>
  );

  const renderPickerModal = () => {
    if (!picker) return null;
    const currentValue = String(formData[picker.field] ?? '');

    return (
      <Modal
        transparent
        visible={true}
        animationType="slide"
        onRequestClose={() => setPicker(null)}>
        <View style={StyleSheet.flatten([styles.modalBody, {backgroundColor: colors.card}])}>
          <Text style={StyleSheet.flatten([styles.modalTitle, {color: colors.primary}])}>
            Select
          </Text>
          <FlatList
            data={picker.options}
            style={[styles.modalList, {maxHeight: 300}]}
            contentContainerStyle={styles.modalListContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  currentValue === item && {backgroundColor: colors.primary},
                ]}
                onPress={() => {
                  updateField(picker.field, item);
                  setPicker(null);
                }}>
                <Text
                  style={StyleSheet.flatten([
                    styles.modalOptionText,
                    {color: colors.text},
                    currentValue === item
                      ? {color: colors.white, fontWeight: '600'}
                      : undefined,
                  ])}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    );
  };

  return (
    <Block safe style={[styles.container, {backgroundColor: colors.background}]}> 
      <View
        style={[
          styles.header,
          {backgroundColor: colors.card, borderBottomColor: colors.light},
        ]}>
        <Text style={StyleSheet.flatten([styles.title, {color: colors.text}])}>
          {isEditMode ? 'Edit Organization' : 'Add Organization'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderSectionTitle('Organization Master')}
        <FormInput
          label="Organization Name *"
          placeholder="Enter organization name"
          value={formData.organizationName}
          onChangeText={value => updateField('organizationName', value)}
        />
        <FormInput
          label="Organization Type *"
          placeholder="Select type"
          value={formData.organizationType}
          onChangeText={() => {}}
          isPickerInput
          onPress={() =>
            setPicker({field: 'organizationType', options: ORG_TYPES})
          }
        />
        <FormInput
          label="Registration Number"
          placeholder="Enter registration number"
          value={formData.registrationNumber}
          onChangeText={value => updateField('registrationNumber', value)}
        />
        <FormInput
          label="GST / Tax ID"
          placeholder="Enter GST number"
          value={formData.gst}
          onChangeText={value => updateField('gst', value)}
        />
        <FormInput
          label="Contact Number *"
          placeholder="Enter contact number"
          value={formData.contactNumber}
          onChangeText={value => updateField('contactNumber', value)}
          keyboardType="phone-pad"
        />
        <FormInput
          label="Email *"
          placeholder="Enter email"
          value={formData.email}
          onChangeText={value => updateField('email', value)}
          keyboardType="email-address"
        />

        {renderSectionTitle('Address Details')}
        <FormInput
          label="Address *"
          placeholder="Enter address"
          value={formData.address}
          onChangeText={value => updateField('address', value)}
          multiline
          numberOfLines={3}
        />
        <FormInput
          label="City *"
          placeholder="Enter city"
          value={formData.city}
          onChangeText={value => updateField('city', value)}
        />
        <FormInput
          label="State *"
          placeholder="Enter state"
          value={formData.state}
          onChangeText={value => updateField('state', value)}
        />
        <FormInput
          label="Country *"
          placeholder="Enter country"
          value={formData.country}
          onChangeText={value => updateField('country', value)}
        />
        <FormInput
          label="Pincode *"
          placeholder="Enter pincode"
          value={formData.pincode}
          onChangeText={value => updateField('pincode', value)}
          keyboardType="numeric"
        />

        {renderSectionTitle('Admin & Subscription')}
        <FormInput
          label="Admin Name *"
          placeholder="Enter admin name"
          value={formData.adminName}
          onChangeText={value => updateField('adminName', value)}
        />
        <FormInput
          label="Admin Email *"
          placeholder="Enter admin email"
          value={formData.adminEmail}
          onChangeText={value => updateField('adminEmail', value)}
          keyboardType="email-address"
        />
        <FormInput
          label="Admin Mobile *"
          placeholder="Enter admin mobile"
          value={formData.adminMobile}
          onChangeText={value => updateField('adminMobile', value)}
          keyboardType="phone-pad"
        />
        <FormInput
          label="Subscription Plan *"
          placeholder="Select plan"
          value={formData.subscriptionPlan}
          onChangeText={() => {}}
          isPickerInput
          onPress={() =>
            setPicker({field: 'subscriptionPlan', options: PLANS})
          }
        />
        <FormInput
          label="Organization Status *"
          placeholder="Select status"
          value={formData.status}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => setPicker({field: 'status', options: STATUSES})}
        />

        <View style={styles.buttonRow}>
          <PrimaryButton title="Save" onPress={handleSave} style={{flex: 1}} />
          {saving ? (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null}
          <PrimaryButton
            title="Cancel"
            onPress={handleCancel}
            variant="danger"
            style={{flex: 1, marginLeft: 10}}
          />
        </View>
      </ScrollView>

      {renderPickerModal()}
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
  sectionHeader: {
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  savingIndicator: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  modalBody: {
    padding: 16,
  },
  modalList: {
  },
  modalListContent: {
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#333',
  },
});

export default AddEditOrganizationScreen;
