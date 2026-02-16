import React, {useState} from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {Organization} from '../../types/organization';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import {Block, Modal, Switch, Text} from '../../components';
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
const PAYMENT_STATUSES: Organization['paymentStatus'][] = [
  'Pending',
  'Partial',
  'Paid',
];
const TIMEZONES = ['IST (UTC+5:30)', 'UTC', 'EST (UTC-5)'];
const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu'];
const INVOICE_TYPES = ['Monthly', 'Quarterly', 'Annual'];
const PAYMENT_MODES = ['Bank Transfer', 'Check', 'Online', 'Card'];
const MODULES = ['OPD', 'IPD', 'Laboratory', 'Pharmacy', 'Billing', 'HIS'];

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
      institutionUrlSame: true,
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
      invoiceType: 'Monthly',
      invoiceFrequency: 'Monthly',
      paymentMode: 'Bank Transfer',
      invoiceAmount: '',
      paymentStatus: 'Pending',
      paymentReceived: false,
      paymentDate: '',
      transactionReference: '',
      pocName: '',
      pocEmail: '',
      pocContact: '',
      supportSLA: '',
    },
  );

  const [picker, setPicker] = useState<{
    field: keyof Organization;
    options: string[];
  } | null>(null);
  const [modulesModal, setModulesModal] = useState(false);

  const updateField = (field: keyof Organization, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const toggleModule = (module: string) => {
    setFormData(prev => {
      const exists = prev.enabledModules.includes(module);
      return {
        ...prev,
        enabledModules: exists
          ? prev.enabledModules.filter(item => item !== module)
          : [...prev.enabledModules, module],
      };
    });
  };

  const handleSave = () => {
    if (!formData.organizationName || !formData.email) {
      Alert.alert('Validation Error', 'Please fill required fields.');
      return;
    }

    if (onSave) {
      onSave(formData);
    }

    Alert.alert(
      'Success',
      isEditMode ? 'Organization updated.' : 'Organization added.',
      [{text: 'OK', onPress: () => navigation.goBack()}],
    );
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
            style={[styles.modalList, {maxHeight: modalMaxHeight}]}
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

  const renderModulesModal = () => (
    <Modal
      transparent
      visible={modulesModal}
      animationType="slide"
      onRequestClose={() => setModulesModal(false)}>
      <View style={StyleSheet.flatten([styles.modalBody, {backgroundColor: colors.card}])}>
        <Text style={StyleSheet.flatten([styles.modalTitle, {color: colors.primary}])}>
          Select Modules
        </Text>
        <FlatList
          data={MODULES}
          style={[styles.modalList, {maxHeight: modalMaxHeight}]}
          contentContainerStyle={styles.modalListContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({item}) => (
            <View style={styles.moduleItem}>
              <Text style={styles.moduleLabel}>{item}</Text>
              <Switch
                checked={formData.enabledModules.includes(item)}
                onPress={() => toggleModule(item)}
              />
            </View>
          )}
        />
      </View>
    </Modal>
  );

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
        {renderSectionTitle('Master Details')}
        <FormInput
          label="Organization Name *"
          placeholder="Enter organization name"
          value={formData.organizationName}
          onChangeText={value => updateField('organizationName', value)}
        />
        <FormInput
          label="Organization Type"
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
          label="GST"
          placeholder="Enter GST"
          value={formData.gst}
          onChangeText={value => updateField('gst', value)}
        />
        <FormInput
          label="Address"
          placeholder="Enter address"
          value={formData.address}
          onChangeText={value => updateField('address', value)}
          multiline
          numberOfLines={2}
        />
        <FormInput
          label="City"
          placeholder="Enter city"
          value={formData.city}
          onChangeText={value => updateField('city', value)}
        />
        <FormInput
          label="State"
          placeholder="Enter state"
          value={formData.state}
          onChangeText={value => updateField('state', value)}
        />
        <FormInput
          label="Country"
          placeholder="Enter country"
          value={formData.country}
          onChangeText={value => updateField('country', value)}
        />
        <FormInput
          label="Pincode"
          placeholder="Enter pincode"
          value={formData.pincode}
          onChangeText={value => updateField('pincode', value)}
          keyboardType="numeric"
        />
        <FormInput
          label="Contact Number"
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
        <FormInput
          label="Time Zone"
          placeholder="Select time zone"
          value={formData.timeZone}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => setPicker({field: 'timeZone', options: TIMEZONES})}
        />

        {renderSectionTitle('Access & Branding')}
        <FormInput
          label="Organization URL"
          placeholder="https://example.com"
          value={formData.organizationUrl}
          onChangeText={value => updateField('organizationUrl', value)}
        />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Institution URL Same?</Text>
          <Switch
            checked={formData.institutionUrlSame}
            onPress={value => updateField('institutionUrlSame', value)}
          />
        </View>
        <FormInput
          label="Software Website URL"
          placeholder="https://software.example.com"
          value={formData.softwareWebsiteUrl}
          onChangeText={value => updateField('softwareWebsiteUrl', value)}
        />
        <FormInput
          label="Login Template"
          placeholder="Enter login template"
          value={formData.loginTemplate}
          onChangeText={value => updateField('loginTemplate', value)}
        />
        <FormInput
          label="Default Language"
          placeholder="Select language"
          value={formData.defaultLanguage}
          onChangeText={() => {}}
          isPickerInput
          onPress={() =>
            setPicker({field: 'defaultLanguage', options: LANGUAGES})
          }
        />

        {renderSectionTitle('Admin & Control')}
        <FormInput
          label="Admin Name"
          placeholder="Enter admin name"
          value={formData.adminName}
          onChangeText={value => updateField('adminName', value)}
        />
        <FormInput
          label="Admin Email"
          placeholder="Enter admin email"
          value={formData.adminEmail}
          onChangeText={value => updateField('adminEmail', value)}
          keyboardType="email-address"
        />
        <FormInput
          label="Admin Mobile"
          placeholder="Enter admin mobile"
          value={formData.adminMobile}
          onChangeText={value => updateField('adminMobile', value)}
          keyboardType="phone-pad"
        />
        <FormInput
          label="Status"
          placeholder="Select status"
          value={formData.status}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => setPicker({field: 'status', options: STATUSES})}
        />

        {renderSectionTitle('Legal & Commercial')}
        <FormInput
          label="PO Number"
          placeholder="Enter PO number"
          value={formData.poNumber}
          onChangeText={value => updateField('poNumber', value)}
        />
        <FormInput
          label="PO Start Date"
          placeholder="YYYY-MM-DD"
          value={formData.poStartDate}
          onChangeText={value => updateField('poStartDate', value)}
        />
        <FormInput
          label="PO End Date"
          placeholder="YYYY-MM-DD"
          value={formData.poEndDate}
          onChangeText={value => updateField('poEndDate', value)}
        />
        <FormInput
          label="Subscription Plan"
          placeholder="Select plan"
          value={formData.subscriptionPlan}
          onChangeText={() => {}}
          isPickerInput
          onPress={() =>
            setPicker({field: 'subscriptionPlan', options: PLANS})
          }
        />
        <TouchableOpacity
          style={styles.modulesButton}
          onPress={() => setModulesModal(true)}>
          <Text style={styles.modulesText}>
            Enabled Modules ({formData.enabledModules.length} selected)
          </Text>
        </TouchableOpacity>

        {renderSectionTitle('Billing & Payment')}
        <FormInput
          label="Invoice Type"
          placeholder="Select type"
          value={formData.invoiceType}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => setPicker({field: 'invoiceType', options: INVOICE_TYPES})}
        />
        <FormInput
          label="Invoice Frequency"
          placeholder="Select frequency"
          value={formData.invoiceFrequency}
          onChangeText={() => {}}
          isPickerInput
          onPress={() =>
            setPicker({field: 'invoiceFrequency', options: INVOICE_TYPES})
          }
        />
        <FormInput
          label="Payment Mode"
          placeholder="Select payment mode"
          value={formData.paymentMode}
          onChangeText={() => {}}
          isPickerInput
          onPress={() =>
            setPicker({field: 'paymentMode', options: PAYMENT_MODES})
          }
        />
        <FormInput
          label="Invoice Amount"
          placeholder="Enter amount"
          value={formData.invoiceAmount}
          onChangeText={value => updateField('invoiceAmount', value)}
          keyboardType="decimal-pad"
        />
        <FormInput
          label="Payment Status"
          placeholder="Select status"
          value={formData.paymentStatus}
          onChangeText={() => {}}
          isPickerInput
          onPress={() =>
            setPicker({field: 'paymentStatus', options: PAYMENT_STATUSES})
          }
        />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Payment Received</Text>
          <Switch
            checked={formData.paymentReceived}
            onPress={value => updateField('paymentReceived', value)}
          />
        </View>
        <FormInput
          label="Payment Date"
          placeholder="YYYY-MM-DD"
          value={formData.paymentDate}
          onChangeText={value => updateField('paymentDate', value)}
        />
        <FormInput
          label="Transaction Reference"
          placeholder="Enter transaction id"
          value={formData.transactionReference}
          onChangeText={value => updateField('transactionReference', value)}
        />

        {renderSectionTitle('Support & Communication')}
        <FormInput
          label="POC Name"
          placeholder="Enter POC name"
          value={formData.pocName}
          onChangeText={value => updateField('pocName', value)}
        />
        <FormInput
          label="POC Email"
          placeholder="Enter POC email"
          value={formData.pocEmail}
          onChangeText={value => updateField('pocEmail', value)}
          keyboardType="email-address"
        />
        <FormInput
          label="POC Contact"
          placeholder="Enter POC contact"
          value={formData.pocContact}
          onChangeText={value => updateField('pocContact', value)}
          keyboardType="phone-pad"
        />
        <FormInput
          label="Support SLA"
          placeholder="e.g. 99.9%"
          value={formData.supportSLA}
          onChangeText={value => updateField('supportSLA', value)}
        />

        <View style={styles.buttonRow}>
          <PrimaryButton title="Save" onPress={handleSave} style={{flex: 1}} />
          <PrimaryButton
            title="Cancel"
            onPress={handleCancel}
            variant="danger"
            style={{flex: 1, marginLeft: 10}}
          />
        </View>
      </ScrollView>

      {renderPickerModal()}
      {renderModulesModal()}
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  modulesButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  modulesText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
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
  modalOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  moduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  moduleLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default AddEditOrganizationScreen;
