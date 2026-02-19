import React, {useMemo, useState} from 'react';
import {Alert, FlatList, StyleSheet, View} from 'react-native';
import {Organization} from '../../types/organization';
import {Block, Text} from '../../components';
import PrimaryButton from '../../components/PrimaryButton';
import {useTheme} from '../../hooks';

interface DeletedOrganizationScreenProps {
  navigation: any;
  route: any;
}

const DeletedOrganizationScreen: React.FC<DeletedOrganizationScreenProps> = ({
  navigation,
  route,
}) => {
  const {colors} = useTheme();
  const [organizations, setOrganizations] = useState<Organization[]>(
    route.params?.deletedOrganizations || [],
  );

  const deletedOrganizations = useMemo(() => {
    return organizations.filter(org => org.isDeleted);
  }, [organizations]);

  const handleRestore = (organization: Organization) => {
    Alert.alert(
      'Restore Organization',
      `Restore "${organization.organizationName}"?`,
      [
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
        {
          text: 'Restore',
          onPress: () => {
            const restored = organizations.map(org =>
              org.id === organization.id ? {...org, isDeleted: false} : org,
            );
            setOrganizations(restored);
            
            if (route.params?.onRestore) {
              route.params.onRestore(restored);
            }
            
            Alert.alert('Success', 'Organization has been restored.', [
              {text: 'OK'},
            ]);
          },
        },
      ],
    );
  };

  const handlePermanentDelete = (organization: Organization) => {
    Alert.alert(
      'Permanent Delete',
      `This will permanently delete "${organization.organizationName}". This action cannot be undone.`,
      [
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
        {
          text: 'Delete',
          onPress: () => {
            const filtered = organizations.filter(org => org.id !== organization.id);
            setOrganizations(filtered);
            
            if (route.params?.onDelete) {
              route.params.onDelete(filtered);
            }
            
            Alert.alert('Success', 'Organization has been permanently deleted.', [
              {text: 'OK'},
            ]);
          },
          style: 'destructive',
        },
      ],
    );
  };

  const renderDeletedOrganization = ({item, index}: {item: Organization; index: number}) => (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.slNo}>#{index + 1}</Text>
          <View style={styles.details}>
            <Text style={styles.organizationName}>{item.organizationName}</Text>
            <Text style={styles.type}>{item.organizationType}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <PrimaryButton
            title="Restore"
            onPress={() => handleRestore(item)}
            variant="secondary"
            size="small"
            style={{flex: 1}}
          />
          <PrimaryButton
            title="Delete"
            onPress={() => handlePermanentDelete(item)}
            variant="danger"
            size="small"
            style={{flex: 1, marginLeft: 10}}
          />
        </View>
      </View>
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
          Deleted Organizations
        </Text>
        <Text style={StyleSheet.flatten([styles.subtitle, {color: colors.gray}])}>
          {deletedOrganizations.length} deleted
        </Text>
      </View>

      {deletedOrganizations.length > 0 ? (
        <FlatList
          data={deletedOrganizations}
          renderItem={renderDeletedOrganization}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No deleted organizations</Text>
          <PrimaryButton
            title="Back to Organizations"
            onPress={() => navigation.goBack()}
            style={{marginTop: 12, minWidth: 20}}
          />
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
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
  infoSection: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  slNo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginRight: 12,
    marginTop: 2,
  },
  details: {
    flex: 1,
  },
  organizationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  type: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default DeletedOrganizationScreen;
