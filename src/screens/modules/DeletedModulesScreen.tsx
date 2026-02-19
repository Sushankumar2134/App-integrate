import React, {useMemo, useState} from 'react';
import {Alert, FlatList, StyleSheet, View} from 'react-native';
import {SystemModule} from '../../types/modules';
import {Block, Text} from '../../components';
import PrimaryButton from '../../components/PrimaryButton';
import {useTheme} from '../../hooks';

interface DeletedModulesScreenProps {
  navigation: any;
  route: any;
}

const DeletedModulesScreen: React.FC<DeletedModulesScreenProps> = ({
  navigation,
  route,
}) => {
  const {colors} = useTheme();
  const [modules, setModules] = useState<SystemModule[]>(
    route.params?.deletedModules || [],
  );

  const deletedModules = useMemo(() => {
    return modules.filter(mod => mod.isDeleted);
  }, [modules]);

  const handleRestore = async (module: SystemModule) => {
    Alert.alert(
      'Restore Module',
      `Restore "${module.displayName}"?`,
      [
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
        {
          text: 'Restore',
          onPress: async () => {
            try {
              let success = false;
              
              // Convert module to API format (snake_case)
              const apiModule = {
                id: module.id,
                module_label: module.moduleLabel,
                module_display_name: module.displayName,
                display_name: module.displayName,
                parent_module_id: module.parentModuleId,
                parent_module: module.parentModuleId,
                priority: module.priority,
                icon: module.icon,
                file_url: module.fileUrl,
                page_name: module.pageName,
                module_type: module.type,
                type: module.type,
                access_for: module.accessFor,
                is_active: module.isActive ? 1 : 0,
                status: module.isActive ? 'active' : 'inactive',
              };
              
              // Try Pattern 1: POST /modules/{id}/restore
              try {
                const response1 = await fetch(`https://tamala-unsighing-quadrennially.ngrok-free.dev/api/modules/${module.id}/restore`, {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                });
                if (response1.ok) {
                  success = true;
                  console.log('Restore Pattern 1 succeeded');
                }
              } catch (error) {
                console.log('Pattern 1 failed, trying pattern 2');
              }

              // Try Pattern 2: PUT with is_deleted: false
              if (!success) {
                try {
                  const response2 = await fetch(`https://tamala-unsighing-quadrennially.ngrok-free.dev/api/modules/${module.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      ...apiModule,
                      is_deleted: false,
                    }),
                  });
                  if (response2.ok) {
                    success = true;
                    console.log('Restore Pattern 2 succeeded');
                  }
                } catch (error) {
                  console.log('Pattern 2 failed, trying pattern 3');
                }
              }

              // Try Pattern 3: PATCH with is_deleted
              if (!success) {
                try {
                  const response3 = await fetch(`https://tamala-unsighing-quadrennially.ngrok-free.dev/api/modules/${module.id}`, {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({is_deleted: false}),
                  });
                  if (response3.ok) {
                    success = true;
                    console.log('Restore Pattern 3 succeeded');
                  }
                } catch (error) {
                  console.log('Pattern 3 failed, trying pattern 4');
                }
              }

              // Try Pattern 4: PUT with full data
              if (!success) {
                try {
                  const response4 = await fetch(`https://tamala-unsighing-quadrennially.ngrok-free.dev/api/modules/${module.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      ...apiModule,
                      is_deleted: 0,
                    }),
                  });
                  if (response4.ok) {
                    success = true;
                    console.log('Restore Pattern 4 succeeded');
                  }
                } catch (error) {
                  console.log('All restore patterns failed');
                }
              }

              if (success) {
                const restored = modules.map(mod =>
                  mod.id === module.id ? {...mod, isDeleted: false} : mod,
                );
                setModules(restored);
                
                if (route.params?.onRestore) {
                  route.params.onRestore();
                }
                
                Alert.alert('Success', 'Module has been restored.', [
                  {text: 'OK'},
                ]);
              } else {
                throw new Error('All restore attempts failed');
              }
            } catch (error) {
              console.error('Error restoring module:', error);
              Alert.alert('Error', 'Failed to restore module. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handlePermanentDelete = async (module: SystemModule) => {
    Alert.alert(
      'Permanent Delete',
      `This will permanently delete "${module.displayName}". This action cannot be undone.`,
      [
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
        {
          text: 'Delete',
          onPress: async () => {
            try {
              // Delete from API
              const response = await fetch(`https://tamala-unsighing-quadrennially.ngrok-free.dev/api/modules/${module.id}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                const filtered = modules.filter(mod => mod.id !== module.id);
                setModules(filtered);
                
                if (route.params?.onDelete) {
                  route.params.onDelete();
                }
                
                Alert.alert('Success', 'Module has been permanently deleted.', [
                  {text: 'OK'},
                ]);
              } else {
                throw new Error('Failed to delete module');
              }
            } catch (error) {
              console.error('Error deleting module:', error);
              Alert.alert('Error', 'Failed to delete module. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const renderDeletedModule = ({
    item,
    index,
  }: {
    item: SystemModule;
    index: number;
  }) => (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.slNo}>#{index + 1}</Text>
          <View style={styles.details}>
            <Text style={styles.moduleName}>{item.displayName}</Text>
            <Text style={styles.label}>{item.moduleLabel}</Text>
            <Text style={styles.type}>{item.type}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <PrimaryButton
            title="Restore"
            onPress={() => handleRestore(item)}
            variant="secondary"
            size="small"
            style={{flex: 1, marginRight: 8}}
          />
          <PrimaryButton
            title="Delete"
            onPress={() => handlePermanentDelete(item)}
            variant="danger"
            size="small"
            style={{flex: 1}}
          />
        </View>
      </View>
    </View>
  );

  return (
    <Block safe style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.card}]}>
        <Text style={styles.title}>Deleted Modules</Text>
        <Text style={styles.subtitle}>{deletedModules.length} deleted</Text>
      </View>

      {deletedModules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No deleted modules found</Text>
        </View>
      ) : (
        <FlatList
          data={deletedModules}
          renderItem={renderDeletedModule}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
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
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    gap: 12,
  },
  infoSection: {
    flexDirection: 'row',
    gap: 12,
  },
  slNo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    width: 40,
  },
  details: {
    flex: 1,
  },
  moduleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  type: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default DeletedModulesScreen;
