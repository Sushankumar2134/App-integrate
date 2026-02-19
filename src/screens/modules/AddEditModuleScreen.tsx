import React, {useEffect, useMemo, useState} from 'react';
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
import {SystemModule} from '../../types/modules';
import {fetchmodules, createmodule, updateModule} from '../../../api/module';
import {Block, Button, Input, Modal, Text} from '../../components';
import {useTheme} from '../../hooks';

interface AddEditModuleScreenProps {
  navigation?: any;
  route?: {
    params?: {
      mode: 'add' | 'edit';
      module?: SystemModule;
      roleFilter?: 'Institution' | 'Service';
      onSave?: (module: SystemModule) => void;
    };
  };
}

const TYPE_OPTIONS: Array<'web' | 'app' | 'both'> = ['web', 'app', 'both'];
const ACCESS_OPTIONS: Array<'Institution' | 'Service'> = [
  'Institution',
  'Service',
];

export const AddEditModuleScreen: React.FC<AddEditModuleScreenProps> = ({
  navigation,
  route,
}) => {
  const {colors, gradients, sizes} = useTheme();
  const {height} = useWindowDimensions();
  const modalMaxHeight = Math.max(240, height * 0.55);
  const {mode = 'add', module, roleFilter, onSave} = route?.params || {};
  const isEditMode = mode === 'edit' && module;

  const [formData, setFormData] = useState<SystemModule>(
    isEditMode
      ? module
      : {
          id: Date.now().toString(),
          moduleLabel: '',
          displayName: '',
          parentModuleId: null,
          priority: 0,
          icon: '',
          fileUrl: '',
          pageName: '',
          type: 'both',
          accessFor: roleFilter || 'Institution',
          isActive: true,
        },
  );

  const [showParentPicker, setShowParentPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showAccessPicker, setShowAccessPicker] = useState(false);
  const [allModules, setAllModules] = useState<SystemModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingParents, setLoadingParents] = useState(true);

  const normalizeModule = (raw: any): SystemModule => {
    const typeRaw = raw.type ?? raw.module_type ?? '';
    const accessRaw = raw.access_for ?? raw.accessFor ?? raw.access ?? '';
    const parentId = raw.parent_module ?? raw.parent_module_id ?? raw.parentModuleId;
    const isActiveValue = raw.is_active ?? raw.isActive ?? raw.status;
    const isActive =
      typeof isActiveValue === 'number'
        ? isActiveValue === 1
        : typeof isActiveValue === 'string'
        ? isActiveValue.toLowerCase() === 'active' || isActiveValue === '1'
        : !!isActiveValue;

    return {
      id: String(raw.id ?? ''),
      moduleLabel: raw.module_label ?? raw.moduleLabel ?? '',
      displayName: raw.module_display_name ?? raw.display_name ?? raw.displayName ?? '',
      parentModuleId: parentId === null || parentId === undefined ? null : String(parentId),
      priority: Number(raw.priority ?? 0),
      icon: raw.icon ?? '',
      fileUrl: raw.file_url ?? raw.fileUrl ?? '',
      pageName: raw.page_name ?? raw.pageName ?? '',
      type: String(typeRaw),
      accessFor: String(accessRaw),
      isActive,
    };
  };

  useEffect(() => {
    loadParentModules();
  }, []);

  const loadParentModules = async () => {
    try {
      setLoadingParents(true);
      const response = await fetchmodules();
      const rawList = response?.data ?? response ?? [];
      const list = Array.isArray(rawList) ? rawList : [];
      setAllModules(list.map(normalizeModule));
    } catch (error) {
      console.error('Error fetching modules for parent selection:', error);
      Alert.alert('Error', 'Failed to load module list');
    } finally {
      setLoadingParents(false);
    }
  };

  const parentModuleOptions = useMemo(() => {
    return [
      {id: null, displayName: 'None (Root Module)'},
      ...allModules
        .filter(
          (m) =>
            m.parentModuleId === null &&
            m.id !== formData.id &&
            m.accessFor === formData.accessFor,
        )
        .map((m) => ({id: m.id, displayName: m.displayName})),
    ];
  }, [formData.id, formData.accessFor, allModules]);

  const updateField = (field: keyof SystemModule, value: any) => {
    setFormData((prev) => ({...prev, [field]: value}));
  };

  const handleSave = async () => {
    if (!formData.moduleLabel.trim()) {
      Alert.alert('Validation Error', 'Module Label is required');
      return;
    }
    if (!formData.displayName.trim()) {
      Alert.alert('Validation Error', 'Display Name is required');
      return;
    }
    if (!formData.icon.trim()) {
      Alert.alert('Validation Error', 'Icon is required');
      return;
    }
    if (!formData.fileUrl.trim()) {
      Alert.alert('Validation Error', 'File URL is required');
      return;
    }
    if (!formData.pageName.trim()) {
      Alert.alert('Validation Error', 'Page Name is required');
      return;
    }

    try {
      setLoading(true);
      const modulePayload = {
        module_label: formData.moduleLabel,
        module_display_name: formData.displayName,
        icon: formData.icon,
        file_url: formData.fileUrl,
        page_name: formData.pageName,
        priority: formData.priority,
        parent_module: formData.parentModuleId,
        type: formData.type,
        access_for: formData.accessFor,
        status: formData.isActive ? 1 : 0,
      };

      if (isEditMode) {
        // Update existing module
        await updateModule(formData.id, modulePayload);
        if (onSave) {
          onSave(formData);
        }
      } else {
        // Create new module
        const response = await createmodule(modulePayload);
        const createdModule = response?.data ?? response;
        if (onSave && createdModule) {
          onSave(normalizeModule(createdModule));
        }
      }

      Alert.alert(
        'Success',
        `Module ${isEditMode ? 'updated' : 'created'} successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Error saving module:', error);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} module`);
    } finally {
      setLoading(false);
    }
  };

  const renderParentPicker = () => (
    <Modal
      transparent
      visible={showParentPicker}
      animationType="slide"
      onRequestClose={() => setShowParentPicker(false)}>
        <View style={StyleSheet.flatten([styles.modalBody, {backgroundColor: colors.card}])}>
          <Text style={StyleSheet.flatten([styles.modalTitle, {color: colors.primary}])}>
            Select Parent Module
          </Text>
          <FlatList
            data={parentModuleOptions}
            keyExtractor={(item) => String(item.id)}
            style={[styles.modalList, {maxHeight: modalMaxHeight}]}
            contentContainerStyle={styles.modalListContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  item.id === formData.parentModuleId && {backgroundColor: colors.primary},
                ]}
                onPress={() => {
                  updateField('parentModuleId', item.id);
                  setShowParentPicker(false);
                }}>
                <Text
                  style={StyleSheet.flatten([
                    styles.modalItemText,
                    {color: colors.text},
                    item.id === formData.parentModuleId
                      ? {color: colors.white, fontWeight: '600'}
                      : undefined,
                  ])}>
                  {item.displayName}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
    </Modal>
  );

  const renderTypePicker = () => (
    <Modal
      transparent
      visible={showTypePicker}
      animationType="slide"
      onRequestClose={() => setShowTypePicker(false)}>
        <View style={StyleSheet.flatten([styles.modalBody, {backgroundColor: colors.card}])}>
          <Text style={StyleSheet.flatten([styles.modalTitle, {color: colors.primary}])}>
            Select Type
          </Text>
          <ScrollView
            style={[styles.modalList, {maxHeight: modalMaxHeight}]}
            contentContainerStyle={styles.modalListContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled">
            {TYPE_OPTIONS.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.radioOption,
                  formData.type === type && {
                    borderColor: colors.primary,
                    backgroundColor: colors.light,
                  },
                ]}
                onPress={() => {
                  updateField('type', type);
                  setShowTypePicker(false);
                }}>
                <View style={[styles.radioCircle, {borderColor: colors.primary}]}>
                  {formData.type === type && (
                    <View
                      style={[
                        styles.radioCircleSelected,
                        {backgroundColor: colors.primary},
                      ]}
                    />
                  )}
                </View>
                <Text style={StyleSheet.flatten([styles.radioText, {color: colors.text}])}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
    </Modal>
  );

  const renderAccessPicker = () => (
    <Modal
      transparent
      visible={showAccessPicker}
      animationType="slide"
      onRequestClose={() => setShowAccessPicker(false)}>
        <View style={StyleSheet.flatten([styles.modalBody, {backgroundColor: colors.card}])}>
          <Text style={StyleSheet.flatten([styles.modalTitle, {color: colors.primary}])}>
            Select Access For
          </Text>
          <ScrollView
            style={[styles.modalList, {maxHeight: modalMaxHeight}]}
            contentContainerStyle={styles.modalListContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled">
            {ACCESS_OPTIONS.map((access) => (
              <TouchableOpacity
                key={access}
                style={[
                  styles.radioOption,
                  formData.accessFor === access && {
                    borderColor: colors.primary,
                    backgroundColor: colors.light,
                  },
                ]}
                onPress={() => {
                  updateField('accessFor', access);
                  updateField('parentModuleId', null);
                  setShowAccessPicker(false);
                }}>
                <View style={[styles.radioCircle, {borderColor: colors.primary}]}>
                  {formData.accessFor === access && (
                    <View
                      style={[
                        styles.radioCircleSelected,
                        {backgroundColor: colors.primary},
                      ]}
                    />
                  )}
                </View>
                <Text style={StyleSheet.flatten([styles.radioText, {color: colors.text}])}>
                  {access}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
    </Modal>
  );

  const getParentDisplayName = () => {
    if (formData.parentModuleId === null) return 'None (Root Module)';
    const parent = allModules.find((m) => m.id === formData.parentModuleId);
    return parent ? parent.displayName : 'None (Root Module)';
  };

  return (
    <Block safe style={[styles.container, {backgroundColor: colors.background}]}> 
      <View
        style={[
          styles.header,
          {backgroundColor: colors.card, borderBottomColor: colors.light},
        ]}>
        <Text style={StyleSheet.flatten([styles.title, {color: colors.text}])}>
          {isEditMode ? 'Edit Module' : 'Add New Module'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, {backgroundColor: colors.card}]}> 
          <Text style={StyleSheet.flatten([styles.sectionTitle, {color: colors.text}])}>
            Basic Information
          </Text>

          <Input
            label="Module Label *"
            placeholder="e.g., patient_management"
            value={formData.moduleLabel}
            onChangeText={(text: string) => updateField('moduleLabel', text)}
            marginBottom={sizes.sm}
          />

          <Input
            label="Display Name *"
            placeholder="e.g., Patient Management"
            value={formData.displayName}
            onChangeText={(text: string) => updateField('displayName', text)}
            marginBottom={sizes.sm}
          />

          <Input
            label="Icon *"
            placeholder="e.g., people, dashboard, settings"
            value={formData.icon}
            onChangeText={(text: string) => updateField('icon', text)}
            marginBottom={sizes.sm}
          />

          <Input
            label="File URL *"
            placeholder="e.g., /patients"
            value={formData.fileUrl}
            onChangeText={(text: string) => updateField('fileUrl', text)}
            marginBottom={sizes.sm}
          />

          <Input
            label="Page Name *"
            placeholder="e.g., PatientPage"
            value={formData.pageName}
            onChangeText={(text: string) => updateField('pageName', text)}
            marginBottom={sizes.sm}
          />

          <Input
            label="Priority *"
            placeholder="e.g., 1"
            value={String(formData.priority)}
            onChangeText={(text: string) => {
              const num = text === '' ? 0 : Number(text);
              if (!isNaN(num)) {
                updateField('priority', num);
              }
            }}
            keyboardType="numeric"
            marginBottom={sizes.sm}
          />
        </View>

        <View style={[styles.section, {backgroundColor: colors.card}]}> 
          <Text style={StyleSheet.flatten([styles.sectionTitle, {color: colors.text}])}>
            Hierarchy & Access
          </Text>

          <TouchableOpacity onPress={() => setShowParentPicker(true)}>
            <Input
              label="Parent Module"
              placeholder="Select parent module"
              value={getParentDisplayName()}
              onChangeText={() => {}}
              disabled
              marginBottom={sizes.sm}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowTypePicker(true)}>
            <Input
              label="Type *"
              placeholder="Select type"
              value={formData.type.toUpperCase()}
              onChangeText={() => {}}
              disabled
              marginBottom={sizes.sm}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowAccessPicker(true)}>
            <Input
              label="Access For *"
              placeholder="Select access"
              value={formData.accessFor}
              onChangeText={() => {}}
              disabled
              marginBottom={sizes.sm}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button gradient={gradients.primary} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text white bold>
                {isEditMode ? 'Update Module' : 'Create Module'}
              </Text>
            )}
          </Button>
          <Button gradient={gradients.primary} onPress={() => navigation.goBack()} disabled={loading}>
            <Text white bold>
              Cancel
            </Text>
          </Button>
        </View>
      </ScrollView>

      {renderParentPicker()}
      {renderTypePicker()}
      {renderAccessPicker()}
    </Block>
  );
};

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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
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
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  radioOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
});
