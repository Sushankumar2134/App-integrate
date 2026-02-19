import React, {useState, useEffect} from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {AxiosError} from 'axios';
import {Institution} from '../../types/institution';
import {Block, Modal, Switch, Text} from '../../components';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import {useTheme} from '../../hooks';
import {
  createInstitution,
  updateInstitution,
  fetchInstitutions,
  fetchInstitutionById,
} from '../../../api/institution';
import {fetchOrganizations} from '../../../api/organisation';
import {fetchmodules} from '../../../api/module';

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
const SUBSCRIPTION_PLANS = ['Basic', 'Standard', 'Premium', 'Enterprise'];
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
const PAYMENT_MODES = ['Bank Transfer', 'Cheque', 'Online', 'Credit Card'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled'];
const PAYMENT_RECEIVED_OPTIONS = ['No', 'Yes'];

const AddEditInstitutionScreen: React.FC<AddEditInstitutionScreenProps> = ({
  navigation,
  route,
}) => {
  const {colors} = useTheme();
  const {height} = useWindowDimensions();
  const modalMaxHeight = Math.max(240, height * 0.55);
  const {institutionId, institution, isEditMode = false, onSave} = route.params || {};

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
      subscriptionPlan: 'Basic',
      modules: [],
      invoiceType: 'Monthly',
      invoiceFrequency: 'Monthly',
      paymentMode: 'Bank Transfer',
      invoiceAmount: '0.02',
      paymentStatus: 'Pending',
      paymentReceived: 'No',
      paymentDate: '',
      transactionReference: '',
      pocName: '',
      pocEmail: '',
      pocContact: '',
      supportSLA: '',
      isDeleted: false,
    },
  );

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [pickerModal, setPickerModal] = useState<{
    field: string;
    options: string[];
  } | null>(null);

  const [organizationModal, setOrganizationModal] = useState(false);
  const [modulesModal, setModulesModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= FETCH ORGANIZATIONS =================
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const response = await fetchOrganizations();
        const list = response?.data || [];
        setOrganizations(list);
      } catch (error) {
        console.error('Error loading organizations:', error);
      }
    };

    loadOrganizations();
  }, []);

  // ================= FETCH MODULES FOR ROLES =================
  useEffect(() => {
    const loadModules = async () => {
      try {
        const response = await fetchmodules();
        const list = Array.isArray(response?.data) 
          ? response.data 
          : response?.data?.data || [];
        setAvailableModules(list);
      } catch (error) {
        console.error('Error loading modules:', error);
      }
    };

    loadModules();
  }, []);

  // ================= LOAD INSTITUTION FOR EDIT =================
  useEffect(() => {
    const loadInstitution = async () => {
      if (isEditMode && institutionId) {
        try {
          const response = await fetchInstitutionById(institutionId);
          const data = response.data || response;
          
          setFormData({
            id: data.id,
            institutionName: data.name || '',
            institutionCode: data.code || '',
            organizationId: data.organization_id || '',
            gst: data.gst_number || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            pincode: data.pincode || '',
            contactNumber: data.contact_number || '',
            email: data.email || '',
            timeZone: data.timezone || 'IST (UTC+5:30)',
            institutionUrl: data.institution_url || '',
            loginTemplate: data.login_template || 'Standard',
            logo: data.logo || '',
            defaultLanguage: data.default_language || 'English',
            adminName: data.admin_name || '',
            adminEmail: data.admin_email || '',
            adminMobile: data.admin_mobile || '',
            role: data.role || 'Administrator',
            status: data.status === 1 ? 'Active' : 'Inactive',
            mouCopy: data.mou_copy || '',
            poNumber: data.po_number || '',
            poStartDate: data.po_start_date || '',
            poEndDate: data.po_end_date || '',
            subscriptionPlan: data.subscription_plan || 'Basic',
            modules: data.modules || [],
            invoiceType: data.invoice_type || 'Monthly',
            invoiceFrequency: data.invoice_frequency || 'Monthly',
            paymentMode: data.payment_mode || 'Bank Transfer',
            invoiceAmount: data.invoice_amount || '0.02',
            paymentStatus: data.payment_status || 'Pending',
            paymentReceived: data.payment_received === true || data.payment_received === 'true' || data.payment_received === 1 ? 'Yes' : 'No',
            paymentDate: data.payment_date || '',
            transactionReference: data.transaction_reference || '',
            pocName: data.poc_name || '',
            pocEmail: data.poc_email || '',
            pocContact: data.poc_contact || '',
            supportSLA: data.support_sla || '',
            isDeleted: data.deleted_at !== null,
          });
        } catch (error) {
          console.error('Error loading institution:', error);
          Alert.alert('Error', 'Failed to load institution data');
        }
      }
    };

    loadInstitution();
  }, [institutionId, isEditMode]);

  // ================= ERROR MESSAGE HELPER =================
  const getErrorMessage = (error: any): string => {
    if (error instanceof AxiosError) {
      return error.response?.data?.message || 'Failed to save institution';
    }
    return 'An unexpected error occurred';
  };

  // Convert mm/dd/yyyy to yyyy-mm-dd for API
  const convertDateToAPI = (dateString: string): string => {
    if (!dateString || dateString.length !== 10) return '';
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

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

  const handleSave = async () => {
    if (
      !formData.institutionName ||
      !formData.institutionCode ||
      !formData.email
    ) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }

    try {
      setLoading(true);

      // Transform camelCase to snake_case for API
      const apiData = {
        name: formData.institutionName,
        code: formData.institutionCode,
        organization_id: formData.organizationId,
        gst_number: formData.gst,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        contact_number: formData.contactNumber,
        email: formData.email,
        timezone: formData.timeZone,
        institution_url: formData.institutionUrl,
        login_template: formData.loginTemplate,
        logo: formData.logo,
        default_language: formData.defaultLanguage,
        admin_name: formData.adminName,
        admin_email: formData.adminEmail,
        admin_mobile: formData.adminMobile,
        role: formData.role,
        status: formData.status === 'Active' ? 1 : 0,
        mou_copy: formData.mouCopy,
        po_number: formData.poNumber,
        po_start_date: convertDateToAPI(formData.poStartDate),
        po_end_date: convertDateToAPI(formData.poEndDate),
        subscription_plan: formData.subscriptionPlan,
        modules: formData.modules,
        invoice_type: formData.invoiceType,
        invoice_frequency: formData.invoiceFrequency,
        payment_mode: formData.paymentMode,
        invoice_amount: formData.invoiceAmount,
        payment_status: formData.paymentStatus,
        payment_received: formData.paymentReceived === 'Yes' ? true : false,
        payment_date: convertDateToAPI(formData.paymentDate),
        transaction_reference: formData.transactionReference,
        poc_name: formData.pocName,
        poc_email: formData.pocEmail,
        poc_contact: formData.pocContact,
        support_sla: formData.supportSLA,
      };

      if (isEditMode && institutionId) {
        // Update existing institution
        console.log('Updating institution:', institutionId, apiData);
        await updateInstitution(institutionId, apiData);
        
        // Call onSave callback before navigation
        if (onSave) {
          onSave();
        }
        
        Alert.alert('Success', 'Institution updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        // Create new institution
        console.log('Creating new institution:', apiData);
        await createInstitution(apiData);
        
        // Call onSave callback before navigation
        if (onSave) {
          onSave();
        }
        
        Alert.alert('Success', 'Institution added successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error saving institution:', error);
      const errorMessage = getErrorMessage(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) {
      Alert.alert('Please wait', 'Request is in progress...');
      return;
    }
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

  const handleOrganizationSelect = (org: any) => {
    setFormData({...formData, organizationId: org.id.toString()});
    setOrganizationModal(false);
  };

  const getSelectedOrganizationName = () => {
    const selected = organizations.find(org => org.id.toString() === formData.organizationId);
    return selected ? selected.name : 'Select Organization';
  };

  const formatDateInput = (text: string, field: keyof Institution) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    
    handleInputChange(field, formatted);
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        handleInputChange('logo', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
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

  const renderOrganizationModal = () => {
    return (
      <Modal
        transparent
        visible={organizationModal}
        animationType="slide"
        onRequestClose={() => setOrganizationModal(false)}>
        <View style={StyleSheet.flatten([styles.modalBody, {backgroundColor: colors.card}])}>
          <Text style={StyleSheet.flatten([styles.modalTitle, {color: colors.primary}])}>
            Select Organization
          </Text>
          <FlatList
            data={organizations}
            style={[styles.modalList, {maxHeight: modalMaxHeight}]}
            contentContainerStyle={styles.modalListContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  formData.organizationId === item.id.toString() && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => handleOrganizationSelect(item)}>
                <Text
                  style={StyleSheet.flatten([
                    styles.modalOptionText,
                    {color: colors.text},
                    formData.organizationId === item.id.toString()
                      ? {color: colors.white, fontWeight: '600'}
                      : undefined,
                  ])}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
          <TouchableOpacity
            style={[styles.modalCloseButton, {backgroundColor: colors.primary}]}
            onPress={() => setOrganizationModal(false)}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
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
        <View style={{marginBottom: 16}}>
          <Text style={{fontSize: 14, marginBottom: 8, color: '#000'}}>Organization *</Text>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              {borderColor: '#ccc', backgroundColor: '#fff'},
            ]}
            onPress={() => setOrganizationModal(true)}>
            <Text style={{color: formData.organizationId ? '#000' : '#999'}}>
              {getSelectedOrganizationName()}
            </Text>
          </TouchableOpacity>
        </View>
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
          label="Contact Number *"
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
        
        {/* Logo Picker */}
        <View style={{marginBottom: 16}}>
          <Text style={{fontSize: 14, color: '#666', marginBottom: 6}}>Logo</Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImage}>
            {formData.logo ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{uri: formData.logo}} 
                  style={styles.imagePreview}
                />
                <Text style={styles.imagePickerText}>Change Logo</Text>
              </View>
            ) : (
              <Text style={styles.imagePickerText}>Choose Logo File</Text>
            )}
          </TouchableOpacity>
        </View>

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
          onPress={() => {
            const moduleNames = availableModules.map(mod => mod.displayName || mod.name || '');
            openPicker('role', moduleNames.length > 0 ? moduleNames : ['Database', 'Out Patient Department']);
          }}
        />
        <TouchableOpacity
          style={styles.modulesButton}
          onPress={() => setModulesModal(true)}>
          <Text style={styles.modulesButtonText}>
            Select Modules * ({formData.modules.length} selected)
          </Text>
        </TouchableOpacity>
        <FormInput
          label="Status *"
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
          placeholder="mm/dd/yyyy"
          value={formData.poStartDate}
          onChangeText={(text) => formatDateInput(text, 'poStartDate' as keyof Institution)}
        />
        <FormInput
          label="PO End Date"
          placeholder="mm/dd/yyyy"
          value={formData.poEndDate}
          onChangeText={(text) => formatDateInput(text, 'poEndDate' as keyof Institution)}
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
            Select Modules * ({formData.modules.length} selected)
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
          placeholder="Select status"
          value={formData.paymentStatus}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => openPicker('paymentStatus', PAYMENT_STATUSES)}
        />
        <FormInput
          label="Payment Received"
          placeholder="Select option"
          value={formData.paymentReceived}
          onChangeText={() => {}}
          isPickerInput
          onPress={() => openPicker('paymentReceived', PAYMENT_RECEIVED_OPTIONS)}
        />
        <FormInput
          label="Payment Date"
          placeholder="mm/dd/yyyy"
          value={formData.paymentDate}
          onChangeText={(text) => formatDateInput(text, 'paymentDate' as keyof Institution)}
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
            loading={loading}
            disabled={loading}
            style={{flex: 1}}
          />
          <PrimaryButton
            title="Cancel"
            onPress={handleCancel}
            variant="danger"
            style={{flex: 1, marginLeft: 10}}
            disabled={loading}
          />
        </View>
      </ScrollView>

      {renderPickerModal()}
      {renderModulesModal()}
      {renderOrganizationModal()}
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
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    color: '#666',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    gap: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});

export default AddEditInstitutionScreen;
