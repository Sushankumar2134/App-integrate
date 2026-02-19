import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {SystemModule} from '../../types/modules';
import {fetchmoduleById, fetchmodules} from '../../../api/module';
import {Block, Button, Text} from '../../components';
import {useTheme} from '../../hooks';

interface ViewModuleScreenProps {
  navigation?: any;
  route?: {
    params?: {
      moduleId?: string;
      onSave?: (module: SystemModule) => void;
    };
  };
}

export const ViewModuleScreen: React.FC<ViewModuleScreenProps> = ({
  navigation,
  route,
}) => {
  const {colors, gradients} = useTheme();
  const {moduleId, onSave} = route?.params || {};
  const [module, setModule] = useState<SystemModule | null>(null);
  const [modules, setModules] = useState<SystemModule[]>([]);
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
    };
  };

  useEffect(() => {
    const loadModule = async () => {
      try {
        setLoading(true);
        const [moduleResponse, modulesResponse] = await Promise.all([
          fetchmoduleById(String(moduleId)),
          fetchmodules(),
        ]);

        const rawModule = moduleResponse?.data ?? moduleResponse;
        const rawList = modulesResponse?.data ?? modulesResponse ?? [];
        const list = Array.isArray(rawList) ? rawList : [];

        setModules(list.map(normalizeModule));
        setModule(rawModule ? normalizeModule(rawModule) : null);
      } catch (error) {
        console.error('Error fetching module:', error);
        Alert.alert('Error', 'Failed to load module details');
      } finally {
        setLoading(false);
      }
    };

    if (!moduleId) {
      setLoading(false);
      setModule(null);
      setModules([]);
      return;
    }

    loadModule();
  }, [moduleId]);

  const parentModule = useMemo(() => {
    if (!module || module.parentModuleId === null) return null;
    return modules.find((m) => m.id === module.parentModuleId);
  }, [module, modules]);

  const childModules = useMemo(() => {
    if (!module) return [];
    return modules.filter((m) => m.parentModuleId === module.id);
  }, [module, modules]);

  if (loading) {
    return (
      <Block safe style={[styles.container, {backgroundColor: colors.background}]}> 
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Block>
    );
  }

  if (!module) {
    return (
      <Block safe style={[styles.container, {backgroundColor: colors.background}]}> 
        <View
          style={[
            styles.header,
            {backgroundColor: colors.card, borderBottomColor: colors.light},
          ]}>
          <Text style={StyleSheet.flatten([styles.title, {color: colors.text}])}>
            Module Not Found
          </Text>
        </View>
      </Block>
    );
  }

  const handleEdit = () => {
    navigation.navigate('AddEditModule', {
      mode: 'edit',
      module,
      onSave,
    });
  };

  const renderField = (label: string, value: string | number | boolean) => (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}:</Text>
      <Text style={styles.fieldValue}>{String(value)}</Text>
    </View>
  );

  const renderChildModule = (child: SystemModule) => (
    <View key={child.id} style={styles.childCard}>
      <View style={styles.childHeader}>
        <Text style={styles.childName}>{child.displayName}</Text>
        <View style={styles.childBadges}>
          <View style={[styles.badge, styles.otherBadge]}>
            <Text style={styles.badgeText}>
              {child.type ? child.type.toUpperCase() : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.childDetail}>Label: {child.moduleLabel}</Text>
      <Text style={styles.childDetail}>Priority: {child.priority}</Text>
      <Text style={styles.childDetail}>Page: {child.pageName}</Text>
      <Text style={styles.childDetail}>
        Status: {child.isActive ? 'Active' : 'Inactive'}
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
          Module Details
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.card, {backgroundColor: colors.card}]}> 
          <Text style={StyleSheet.flatten([styles.cardTitle, {color: colors.text}])}>
            Basic Information
          </Text>
          {renderField('Display Name', module.displayName)}
          {renderField('Module Label', module.moduleLabel)}
          {renderField('Icon', module.icon)}
          {renderField('File URL', module.fileUrl)}
          {renderField('Page Name', module.pageName)}
          {renderField('Priority', module.priority)}
          {renderField('Status', module.isActive ? 'Active' : 'Inactive')}
        </View>

        <View style={[styles.card, {backgroundColor: colors.card}]}> 
          <Text style={StyleSheet.flatten([styles.cardTitle, {color: colors.text}])}>
            Type & Access
          </Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Type:</Text>
            <View style={[styles.badge, styles.otherBadge]}>
              <Text style={styles.badgeText}>
                {module.type ? module.type.toUpperCase() : 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Access For:</Text>
            <View style={[styles.badge, styles.otherBadge]}>
              <Text style={styles.badgeText}>
                {module.accessFor || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, {backgroundColor: colors.card}]}> 
          <Text style={StyleSheet.flatten([styles.cardTitle, {color: colors.text}])}>
            Hierarchy
          </Text>
          {parentModule ? (
            <View>
              <Text style={styles.hierarchyLabel}>Parent Module:</Text>
              <View style={styles.parentCard}>
                <Text style={styles.parentName}>{parentModule.displayName}</Text>
                <Text style={styles.parentDetail}>
                  Label: {parentModule.moduleLabel}
                </Text>
                <Text style={styles.parentDetail}>
                  URL: {parentModule.fileUrl}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noParentText}>
              This is a root module (no parent)
            </Text>
          )}

          {childModules.length > 0 && (
            <View style={styles.childrenSection}>
              <Text style={styles.hierarchyLabel}>
                Child Modules ({childModules.length}):
              </Text>
              {childModules.map((child) => renderChildModule(child))}
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button gradient={gradients.primary} onPress={handleEdit}>
            <Text white bold>
              Edit Module
            </Text>
          </Button>
          <Button gradient={gradients.primary} onPress={() => navigation.goBack()}>
            <Text white bold>
              Back
            </Text>
          </Button>
        </View>
      </ScrollView>
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
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  fieldValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  otherBadge: {
    backgroundColor: '#607D8B',
  },
  hierarchyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 12,
  },
  noParentText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  parentCard: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  parentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  parentDetail: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  childrenSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  childCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  childName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  childBadges: {
    flexDirection: 'row',
  },
  childDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
