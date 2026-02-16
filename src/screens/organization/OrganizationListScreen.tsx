import React, {useMemo, useState} from 'react';
import {Alert, FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Organization} from '../../types/organization';
import {organizationMockData} from '../../data/organizationMockData';
import {Block, Button, Input, Text} from '../../components';
import {useTheme} from '../../hooks';

interface OrganizationListScreenProps {
  navigation: any;
}

const OrganizationListScreen: React.FC<OrganizationListScreenProps> = ({
  navigation,
}) => {
  const {colors, gradients, sizes} = useTheme();
  const [organizations, setOrganizations] = useState<Organization[]>(
    organizationMockData,
  );
  const [searchText, setSearchText] = useState('');

  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org =>
      org.organizationName
        .toLowerCase()
        .includes(searchText.toLowerCase()),
    );
  }, [organizations, searchText]);

  const handleAdd = () => {
    navigation.navigate('AddEditOrganization', {
      organization: null,
      isEditMode: false,
      onSave: (org: Organization) => {
        setOrganizations(prev => [org, ...prev]);
      },
    });
  };

  const handleDeletedOrganizations = () => {
    // Navigate to deleted organizations screen
    // navigation.navigate('DeletedOrganizations');
    console.log('Navigate to Deleted Organizations');
  };

  const handleView = (organization: Organization) => {
    navigation.navigate('ViewOrganization', {
      organization,
      onSave: (updated: Organization) => {
        setOrganizations(prev =>
          prev.map(item => (item.id === updated.id ? updated : item)),
        );
      },
    });
  };

  const handleEdit = (organization: Organization) => {
    navigation.navigate('AddEditOrganization', {
      organization,
      isEditMode: true,
      onSave: (updated: Organization) => {
        setOrganizations(prev =>
          prev.map(item => (item.id === updated.id ? updated : item)),
        );
      },
    });
  };

  const handleToggleStatus = (organization: Organization) => {
    const nextStatus = organization.status === 'Active' ? 'Inactive' : 'Active';
    setOrganizations(prev =>
      prev.map(item =>
        item.id === organization.id ? {...item, status: nextStatus} : item,
      ),
    );
    Alert.alert('Success', `Status updated to ${nextStatus}.`, [{text: 'OK'}]);
  };

  const renderRow = ({item}: {item: Organization}) => (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <View style={styles.rowLeft}>
          <Text style={styles.orgName}>{item.organizationName}</Text>
          <Text style={styles.orgMeta}>{item.organizationType}</Text>
          <Text style={styles.orgMeta}>{item.city}</Text>
        </View>
        <Text
          style={StyleSheet.flatten([
            styles.status,
            {color: item.status === 'Active' ? '#2e7d32' : '#ef6c00'},
          ])}>
          {item.status}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() => handleView(item)}>
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.statusBtn]}
          onPress={() => handleToggleStatus(item)}>
          <Text style={styles.actionText}>
            {item.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
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
          Organizations
        </Text>
      </View>

      <View style={[styles.searchContainer, {backgroundColor: colors.card}]}>
        <Input
          placeholder="Search by organization name"
          value={searchText}
          onChangeText={setSearchText}
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
            onPress={handleDeletedOrganizations}
            style={styles.buttonHalf}>
            <Text white bold>
              Deleted Organizations
            </Text>
          </Button>
          <Button
            gradient={gradients.primary}
            onPress={handleAdd}
            style={styles.buttonHalf}>
            <Text white bold>
              + Add Organization
            </Text>
          </Button>
        </View>
      </View>

      {filteredOrganizations.length > 0 ? (
        <FlatList
          data={filteredOrganizations}
          renderItem={renderRow}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No organizations found</Text>
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
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    marginBottom: 12,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowLeft: {
    flex: 1,
    paddingRight: 8,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  orgMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewBtn: {
    backgroundColor: '#e3f2fd',
  },
  editBtn: {
    backgroundColor: '#f3e5f5',
  },
  statusBtn: {
    backgroundColor: '#e8f5e9',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});

export default OrganizationListScreen;
