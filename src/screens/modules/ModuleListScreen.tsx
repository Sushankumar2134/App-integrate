import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SystemModule} from '../../types/modules';
import {fetchmodules} from '../../../api/module';
import {Block, Button, Input, Text} from '../../components';
import {useTheme} from '../../hooks';

interface ModuleListScreenProps {
  navigation: any;
}

export const ModuleListScreen: React.FC<ModuleListScreenProps> = ({
  navigation,
}) => {
  const {colors, gradients, sizes} = useTheme();
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter] = useState<'Institution' | 'Service'>('Institution');
  const [loading, setLoading] = useState(true);

  const normalizeModule = (raw: any): SystemModule => {
    const typeRaw = String(raw.type ?? raw.module_type ?? '').toLowerCase();
    const type: SystemModule['type'] =
      typeRaw === 'web' || typeRaw === 'app' || typeRaw === 'both'
        ? (typeRaw as SystemModule['type'])
        : 'both';

    const accessRaw = raw.access_for ?? raw.accessFor ?? raw.access ?? 'Institution';
    const accessFor: SystemModule['accessFor'] =
      String(accessRaw).toLowerCase().includes('service') ? 'Service' : 'Institution';

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
      displayName:
        raw.module_display_name ?? raw.display_name ?? raw.displayName ?? '',
      parentModuleId:
        parentId === null || parentId === undefined ? null : String(parentId),
      priority: Number(raw.priority ?? 0),
      icon: raw.icon ?? '',
      fileUrl: raw.file_url ?? raw.fileUrl ?? '',
      pageName: raw.page_name ?? raw.pageName ?? '',
      type,
      accessFor,
      isActive,
    };
  };

  const loadModules = async () => {
    try {
      setLoading(true);
      const response = await fetchmodules();
      const list = response?.data ?? response ?? [];
      console.log('Raw modules response:', response);
      if (!Array.isArray(list)) {
        console.log('Invalid modules response:', response);
        return;
      }

      setModules(list.map(normalizeModule));
    } catch (error) {
      console.error('Error fetching modules:', error);
      Alert.alert('Error', 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const filteredModules = useMemo(() => {
    return modules
      .filter((module) => module.moduleLabel !== 'dashboard') // Hide dashboard
      .filter((module) => {
        const matchesSearch =
          module.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.moduleLabel.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = module.accessFor === roleFilter;
        return matchesSearch && matchesRole;
      });
  }, [modules, searchQuery, roleFilter]);

  const getParentModuleFileUrl = (parentId: string | null): string => {
    if (!parentId) return '-';
    const parentModule = modules.find((m) => m.id === parentId);
    return parentModule ? parentModule.fileUrl : '-';
  };

  const handleAdd = () => {
    navigation.navigate('AddEditModule', {mode: 'add', roleFilter});
  };

  const handleDeletedModules = () => {
    // Navigate to deleted modules screen
    // navigation.navigate('DeletedModules');
    console.log('Navigate to Deleted Modules');
  };

  const handleEdit = (module: SystemModule) => {
    navigation.navigate('AddEditModule', {
      mode: 'edit',
      module,
      roleFilter,
      onSave: (updatedModule: SystemModule) => {
        setModules((prev) =>
          prev.map((m) => (m.id === updatedModule.id ? updatedModule : m)),
        );
      },
    });
  };

  const handleView = (module: SystemModule) => {
    navigation.navigate('ViewModule', {
      moduleId: module.id,
    });
  };

  const handleToggleStatus = (id: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === id ? {...module, isActive: !module.isActive} : module,
      ),
    );
  };

  const renderTableRow = (module: SystemModule) => (
    <View key={module.id} style={styles.tableRow}>
      <View style={[styles.tableCell, styles.labelCell]}>
        <Text style={styles.cellText}>{module.moduleLabel}</Text>
      </View>
      <View style={[styles.tableCell, styles.nameCell]}>
        <Text style={styles.cellText}>{module.displayName}</Text>
      </View>
      <View style={[styles.tableCell, styles.pathCell]}>
        <Text style={styles.cellText}>
          {getParentModuleFileUrl(module.parentModuleId)}
        </Text>
      </View>
      <View style={[styles.tableCell, styles.accessCell]}>
        <Text style={styles.cellText}>{module.accessFor}</Text>
      </View>
      <View style={[styles.tableCell, styles.pageNameCell]}>
        <Text style={styles.cellText}>{module.pageName}</Text>
      </View>
      <View style={[styles.tableCell, styles.typeCell]}>
        <View
          style={[
            styles.typeBadge,
            module.type === 'web'
              ? styles.webBadge
              : module.type === 'app'
              ? styles.appBadge
              : styles.bothBadge,
          ]}>
          <Text style={styles.badgeText}>{module.type.toUpperCase()}</Text>
        </View>
      </View>
      <View style={[styles.tableCell, styles.statusCell]}>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: module.isActive ? '#4CAF50' : '#f44336'},
          ]}>
          <Text style={styles.badgeText}>
            {module.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <View style={[styles.tableCell, styles.actionCell]}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleView(module)}>
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleEdit(module)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <Block safe style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Block>
    );
  }

  return (
    <Block safe style={[styles.container, {backgroundColor: colors.background}]}>
      <View
        style={[
          styles.header,
          {backgroundColor: colors.card, borderBottomColor: colors.light},
        ]}>
        <Text style={StyleSheet.flatten([styles.title, {color: colors.text}])}>
          Module Management
        </Text>
      </View>

      <View style={[styles.searchContainer, {backgroundColor: colors.card}]}> 
        <Input
          placeholder="Search by name or label..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          marginBottom={sizes.s}
        />
      </View>

      <View
        style={[
          styles.addButtonContainer,
          {backgroundColor: colors.card, borderBottomColor: colors.light},
        ]}>
        <View style={styles.buttonRow}>
          <Button 
            gradient={gradients.primary} 
            onPress={handleDeletedModules}
            style={styles.buttonHalf}>
            <Text white bold>
              Deleted Modules
            </Text>
          </Button>
          <Button 
            gradient={gradients.primary} 
            onPress={handleAdd}
            style={styles.buttonHalf}>
            <Text white bold>
              Add New Module
            </Text>
          </Button>
        </View>
      </View>
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
  roleFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  roleFilterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#2196F3',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  addButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  labelCell: {
    width: 120,
  },
  nameCell: {
    width: 140,
  },
  pathCell: {
    width: 150,
  },
  accessCell: {
    width: 110,
  },
  pageNameCell: {
    width: 150,
  },
  typeCell: {
    width: 90,
  },
  statusCell: {
    width: 100,
  },
  actionCell: {
    width: 130,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 13,
    color: '#333',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
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
  webBadge: {
    backgroundColor: '#FF9800',
  },
  appBadge: {
    backgroundColor: '#9C27B0',
  },
  bothBadge: {
    backgroundColor: '#4CAF50',
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});