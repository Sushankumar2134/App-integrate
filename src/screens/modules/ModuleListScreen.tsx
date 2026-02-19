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
import {Ionicons} from '@expo/vector-icons';
import {SystemModule} from '../../types/modules';
import {fetchmodules, deleteModule, updateModule} from '../../../api/module';
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
      displayName:
        raw.module_display_name ?? raw.display_name ?? raw.displayName ?? '',
      parentModuleId:
        parentId === null || parentId === undefined ? null : String(parentId),
      priority: Number(raw.priority ?? 0),
      icon: raw.icon ?? '',
      fileUrl: raw.file_url ?? raw.fileUrl ?? '',
      pageName: raw.page_name ?? raw.pageName ?? '',
      type: String(typeRaw),
      accessFor: String(accessRaw),
      isActive,
      isDeleted: false,
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
      .filter((module) => !module.isDeleted) // Exclude deleted modules
      .filter((module) => module.moduleLabel !== 'dashboard') // Hide dashboard
      .filter((module) => {
        const matchesSearch =
          module.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          module.moduleLabel.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      });
  }, [modules, searchQuery]);

  const getParentModuleFileUrl = (parentId: string | null): string => {
    if (!parentId) return '-';
    const parentModule = modules.find((m) => m.id === parentId);
    return parentModule ? parentModule.fileUrl : '-';
  };

  const handleAdd = () => {
    navigation.navigate('AddEditModule', {
      mode: 'add',
      roleFilter,
      onSave: () => {
        // Reload modules after creating new one
        loadModules();
      },
    });
  };

  const handleDeletedModules = () => {
    const deletedMods = modules.filter(mod => mod.isDeleted);
    navigation.navigate('DeletedModules', {
      deletedModules: deletedMods,
      onRestore: () => {
        // Reload all modules from API after restore
        loadModules();
      },
      onDelete: () => {
        // Reload all modules from API after permanent delete
        loadModules();
      },
    });
  };

  const handleEdit = (module: SystemModule) => {
    navigation.navigate('AddEditModule', {
      mode: 'edit',
      module,
      roleFilter,
      onSave: () => {
        // Reload modules after updating to get latest data from API
        loadModules();
      },
    });
  };

  const handleView = (module: SystemModule) => {
    navigation.navigate('ViewModule', {
      moduleId: module.id,
    });
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const module = modules.find((m) => m.id === id);
      if (!module) return;

      const newStatus = !module.isActive;
      // Call API to update status - backend expects status as 1 or 0
      await updateModule(id, {status: newStatus ? 1 : 0});

      // Update local state after successful API call
      setModules((prev) =>
        prev.map((mod) =>
          mod.id === id ? {...mod, isActive: newStatus} : mod,
        ),
      );
      Alert.alert(
        'Success',
        `Module ${newStatus ? 'activated' : 'deactivated'} successfully`,
      );
    } catch (error) {
      console.error('Error toggling module status:', error);
      Alert.alert('Error', 'Failed to update module status');
    }
  };

  const handleDeleteModule = (id: string, displayName: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${displayName}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteModule(id);
              
              setModules(prev =>
                prev.map(mod =>
                  mod.id === id ? {...mod, isDeleted: true} : mod,
                ),
              );
              
              Alert.alert('Success', 'Module deleted successfully');
            } catch (error) {
              console.error('Error deleting module:', error);
              Alert.alert('Error', 'Failed to delete module');
            }
          },
        },
      ],
    );
  };

  const renderTableRow = (module: SystemModule, index: number) => (
    <View key={module.id} style={styles.tableRow}>
      <View style={[styles.tableCell, styles.slnoCell]}>
        <Text style={styles.cellText}>{index + 1}</Text>
      </View>
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
        <View style={[styles.typeBadge, styles.otherBadge]}>
          <Text style={styles.badgeText}>
            {module.type ? module.type.toUpperCase() : 'N/A'}
          </Text>
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
          style={styles.iconBtn}
          onPress={() => handleView(module)}>
          <Ionicons name="eye" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleEdit(module)}>
          <Ionicons name="pencil" size={20} color="#FFC107" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleToggleStatus(module.id)}>
          <Ionicons
            name={module.isActive ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={module.isActive ? '#4CAF50' : '#f44336'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleDeleteModule(module.id, module.displayName)}>
          <Ionicons name="trash" size={20} color="#f44336" />
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

      {filteredModules.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, styles.slnoCell]}>
                <Text style={styles.headerText}>SL.NO</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.labelCell]}>
                <Text style={styles.headerText}>Label</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.nameCell]}>
                <Text style={styles.headerText}>Display Name</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.pathCell]}>
                <Text style={styles.headerText}>Parent</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.accessCell]}>
                <Text style={styles.headerText}>Access For</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.pageNameCell]}>
                <Text style={styles.headerText}>Page Name</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.typeCell]}>
                <Text style={styles.headerText}>Type</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.statusCell]}>
                <Text style={styles.headerText}>Status</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.actionCell]}>
                <Text style={styles.headerText}>Actions</Text>
              </View>
            </View>

            {/* Table Rows */}
            {filteredModules.map((item, index) => renderTableRow(item, index))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No modules found</Text>
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
  listContent: {
    padding: 12,
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
  slnoCell: {
    width: 60,
  },
  statusCell: {
    width: 100,
  },
  actionCell: {
    width: 150,
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
  otherBadge: {
    backgroundColor: '#607D8B',
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  iconBtn: {
    padding: 6,
    marginHorizontal: 4,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
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