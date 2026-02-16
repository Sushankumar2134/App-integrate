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
import {Institution} from '../../types/institution';
import {institutionMockData} from '../../data/institutionMockData';
import {Block, Modal, Switch, Text} from '../../components';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import {useTheme} from '../../hooks';

interface AddEditInstitutionScreenProps {
  navigation: any;
  route: any;
}

const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu'];
const TIMEZONES = [
  'IST (UTC+5:30)',
  'UTC',
  'EST (UTC-5)',
  'PST (UTC-8)',
  'GMT (UTC+0)',
];
const SUBSCRIPTION_PLANS = ['Starter', 'Professional', 'Enterprise', 'Enterprise Plus'];
const MODULES = [
  'OPD',
  'IPD',
  'Laboratory',
  'Pharmacy',
  'HIS',
  'Pathology',
  'Billing',
  'Radiology',
];
const INVOICE_TYPES = ['Monthly', 'Quarterly', 'Annual'];
const PAYMENT_MODES = ['Bank Transfer', 'Check', 'Online', 'Credit Card'];
const PAYMENT_STATUSES = ['Pending', 'Partial', 'Paid'];
const ROLES = ['Administrator', 'Manager', 'Supervisor', 'Staff'];

const AddEditInstitutionScreen: React.FC<AddEditInstitutionScreenProps> = ({
  navigation,
  route,
}) => {
  const {colors} = useTheme();
  const {height} = useWindowDimensions();
  const modalMaxHeight = Math.max(240, height * 0.55);
  const {institution, isEditMode = false} = route.params;

  const [formData, setFormData] = useState<Institution>(
    institution || {
      id: Date.now().toString(),
      institutionName: '',
      institutionCode: '',
      organizationId: '',
      gst: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      contactNumber: '',
      email: '',
      timeZone: 'IST (UTC+5:30)',
      institutionUrl: '',
      loginTemplate: 'Standard',
      logo: '',
      defaultLanguage: 'English',
      adminName: '',
      adminEmail: '',
      adminMobile: '',
      role: 'Administrator',
      status: 'Active',
      mouCopy: '',
      poNumber: '',
      poStartDate: '',
      poEndDate: '',
      subscriptionPlan: 'Professional',
      modules: [],
      invoiceType: 'Monthly',
      invoiceFrequency: 'Monthly',
      paymentMode: 'Bank Transfer',
      invoiceAmount: '',
      paymentStatus: 'Pending',
      paymentReceived: '',
      paymentDate: '',
      transactionReference: '',
      pocName: '',
      pocEmail: '',
      pocContact: '',
      supportSLA: '',
      isDeleted: false,
    },
  );

  const [pickerModal, setPickerModal] = useState<{
    field: string;
    options: string[];
  } | null>(null);

  const [modulesModal, setModulesModal] = useState(false);

  const handleInputChange = (field: keyof Institution, value: string) => {
    setFormData({...formData, [field]: value});
  };

  const handleModuleToggle = (module: string) => {
    if (formData.modules.includes(module)) {
      setFormData({
        ...formData,
        modules: formData.modules.filter(m => m !== module),
      });
    } else {
      setFormData({
        ...formData,
        modules: [...formData.modules, module],
      });
    }
  };

  const handleSave = () => {
    if (
      !formData.institutionName ||
      !formData.institutionCode ||
      !formData.email
    ) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }

    Alert.alert(
      'Success',
      isEditMode
        ? 'Institution updated successfully!'
        : 'Institution added successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert('Cancel', 'Discard changes?', [
      {text: 'Keep', style: 'cancel'},
      {
        text: 'Discard',
        onPress: () => navigation.goBack(),
        style: 'destructive',
      },
    ]);
  };

  const openPicker = (field: string, options: string[]) => {
    setPickerModal({field, options});
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
    if (!pickerModal) return null;

    const currentValue =
      formData[pickerModal.field as keyof Institution] || '';

    return (
      <Modal
        transparent
        visible={true}
        animationType="slide"
        onRequestClose={() => setPickerModal(null)}>
        <View style={StyleSheet.flatten([styles.modalBody, {backgroundColor: colors.card}])}>
          <Text style={StyleSheet.flatten([styles.modalTitle, {color: colors.primary}])}>
            Select {pickerModal.field}
          </Text>
          <FlatList
            data={pickerModal.options}
            style={[styles.modalList, {maxHeight: modalMaxHeight}]}
            contentContainerStyle={styles.modalListContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  currentValue === item && {backgroundColor: colors.primary},
                ]}
                onPress={() => {
                  handleInputChange(
                    pickerModal.field as keyof Institution,
                    item,
                  );
                  setPickerModal(null);
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
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </Modal>
    );
  };

  const renderModulesModal = () => {
    return (
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
            renderItem={({item}) => (
              <View style={styles.moduleItem}>
                <Text style={styles.moduleLabel}>{item}</Text>
                <Switch
                  checked={formData.modules.includes(item)}
                  onPress={() => handleModuleToggle(item)}
                />
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
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
          {isEditMode ? 'Edit Institution' : 'Add New Institution'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}>
        {/* SECTION 1: Institution Details */}
        {renderSectionTitle('Institution Details')}
        <FormInput
          label="Institution Name *"
          placeholder="Enter institution name"
          value={formData.institutionName}
          onChangeText={value => handleInputChange('institutionName', value)}
        />
        <FormInput
          label="Institution Code *"
          placeholder="e.g., GHI001"
          value={formData.institutionCode}
          onChangeText={value => handleInputChange('institutionCode', value)}
        />
        <FormInput
          label="Organization ID"
          placeholder="Enter organization ID"
          value={formData.organizationId}
          onChangeText={value => handleInputChange('organizationId', value)}
        />
        <FormInput
          label="GST"
          placeholder="Enter GST number"
          value={formData.gst}
          onChangeText={value => handleInputChange('gst', value)}
        />
        <FormInput
          label="Address"
          placeholder="Enter address"
          value={formData.address}
          onChangeText={value => handleInputChange('address', value)}
          multiline
          numberOfLines={2}
        />
        <FormInput
          label="City"
          placeholder="Enter city"
          value={formData.city}
          onChangeText={value => handleInputChange('city', value)}
        />
        <FormInput
          label="State"
          placeholder="Enter state"
          value={formData.state}
          onChangeText={value => handleInputChange('state', value)}
        />
        <FormInput
          label="Country"
          placeholder="Enter country"
          value={formData.country}
          onChangeText={value => handleInputChange('country', value)}
        />
        <FormInput
          label="Pincode"
          placeholder="Enter pincode"
          value={formData.pincode}
          onChangeText={value => handleInputChange('pincode', value)}
          keyboardType="numeric"
        />
        <FormInput
          label="Contact Number"
          placeholder="Enter contact number"
          value={formData.contactNumber}
          onChangeText={value => handleInputChange('contactNumber', value)}
          keyboardType="phone-pad"
        />
        <FormInput
          label="Email *"
          placeholder="Enter email"
          value={formData.email}
          onChangeText={value => handleInputChange('email', value)}
          keyboardType="email-address"
        />
        <FormInput
          label="Time Zone"
          placeholder="Select time zone"
          value={formData.timeZone}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => openPicker('timeZone', TIMEZONES)}
        />

        {/* SECTION 2: Access & Branding */}
        {renderSectionTitle('Access & Branding')}
        <FormInput
          label="Institution URL"
          placeholder="https://example.com"
          value={formData.institutionUrl}
          onChangeText={value => handleInputChange('institutionUrl', value)}
        />
        <FormInput
          label="Login Template"
          placeholder="Select template"
          value={formData.loginTemplate}
          onChangeText={value => handleInputChange('loginTemplate', value)}
        />
        <FormInput
          label="Default Language"
          placeholder="Select language"
          value={formData.defaultLanguage}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => openPicker('defaultLanguage', LANGUAGES)}
        />

        {/* SECTION 3: Admin & Control */}
        {renderSectionTitle('Admin & Control')}
        <FormInput
          label="Admin Name"
          placeholder="Enter admin name"
          value={formData.adminName}
          onChangeText={value => handleInputChange('adminName', value)}
        />
        <FormInput
          label="Admin Email"
          placeholder="Enter admin email"
          value={formData.adminEmail}
          onChangeText={value => handleInputChange('adminEmail', value)}
          keyboardType="email-address"
        />
        <FormInput
          label="Admin Mobile"
          placeholder="Enter admin mobile"
          value={formData.adminMobile}
          onChangeText={value => handleInputChange('adminMobile', value)}
          keyboardType="phone-pad"
        />
        <FormInput
          label="Role"
          placeholder="Select role"
          value={formData.role}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => openPicker('role', ROLES)}
        />
        <FormInput
          label="Status"
          placeholder="Select status"
          value={formData.status}
          onChangeText={() => {}}
          isPickerInput
          onPress={() =>
            openPicker('status', ['Active', 'Inactive'])
          }
        />

        {/* SECTION 4: Legal & Commercial */}
        {renderSectionTitle('Legal & Commercial')}
        <FormInput
          label="PO Number"
          placeholder="Enter PO number"
          value={formData.poNumber}
          onChangeText={value => handleInputChange('poNumber', value)}
        />
        <FormInput
          label="PO Start Date"
          placeholder="YYYY-MM-DD"
          value={formData.poStartDate}
          onChangeText={value => handleInputChange('poStartDate', value)}
        />
        <FormInput
          label="PO End Date"
          placeholder="YYYY-MM-DD"
          value={formData.poEndDate}
          onChangeText={value => handleInputChange('poEndDate', value)}
        />
        <FormInput
          label="Subscription Plan"
          placeholder="Select plan"
          value={formData.subscriptionPlan}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => openPicker('subscriptionPlan', SUBSCRIPTION_PLANS)}
        />
        <TouchableOpacity
          style={styles.modulesButton}
          onPress={() => setModulesModal(true)}>
          <Text style={styles.modulesButtonText}>
            Select Modules ({formData.modules.length} selected)
          </Text>
        </TouchableOpacity>

        {/* SECTION 5: Billing & Payment */}
        {renderSectionTitle('Billing & Payment')}
        <FormInput
          label="Invoice Type"
          placeholder="Select invoice type"
          value={formData.invoiceType}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => openPicker('invoiceType', INVOICE_TYPES)}
        />
        <FormInput
          label="Invoice Frequency"
          placeholder="Select frequency"
          value={formData.invoiceFrequency}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => openPicker('invoiceFrequency', INVOICE_TYPES)}
        />
        <FormInput
          label="Payment Mode"
          placeholder="Select payment mode"
          value={formData.paymentMode}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => openPicker('paymentMode', PAYMENT_MODES)}
        />
        <FormInput
          label="Invoice Amount"
          placeholder="Enter amount"
          value={formData.invoiceAmount}
          onChangeText={value => handleInputChange('invoiceAmount', value)}
          keyboardType="decimal-pad"
        />
        <FormInput
          label="Payment Status"
          placeholder="Enter status"
          value={formData.paymentStatus}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => openPicker('paymentStatus', PAYMENT_STATUSES)}
        />
        <FormInput
          label="Payment Received"
          placeholder="Enter amount received"
          value={formData.paymentReceived}
          onChangeText={value => handleInputChange('paymentReceived', value)}
          keyboardType="decimal-pad"
        />
        <FormInput
          label="Payment Date"
          placeholder="YYYY-MM-DD"
          value={formData.paymentDate}
          onChangeText={value => handleInputChange('paymentDate', value)}
        />
        <FormInput
          label="Transaction Reference"
          placeholder="Enter reference"
          value={formData.transactionReference}
          onChangeText={value =>
            handleInputChange('transactionReference', value)
          }
        />

        {/* SECTION 6: Support & Communication */}
        {renderSectionTitle('Support & Communication')}
        <FormInput
          label="POC Name"
          placeholder="Point of Contact name"
          value={formData.pocName}
          onChangeText={value => handleInputChange('pocName', value)}
        />
        <FormInput
          label="POC Email"
          placeholder="POC email"
          value={formData.pocEmail}
          onChangeText={value => handleInputChange('pocEmail', value)}
          keyboardType="email-address"
        />
        <FormInput
          label="POC Contact"
          placeholder="POC contact number"
          value={formData.pocContact}
          onChangeText={value => handleInputChange('pocContact', value)}
          keyboardType="phone-pad"
        />
        <FormInput
          label="Support SLA"
          placeholder="e.g. 99.9%"
          value={formData.supportSLA}
          onChangeText={value => handleInputChange('supportSLA', value)}
        />

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <PrimaryButton
            title="Save"
            onPress={handleSave}
            style={{flex: 1}}
          />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
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
  modulesButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  modulesButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 10,
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

export default AddEditInstitutionScreen;
