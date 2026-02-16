import React, {useMemo, useState} from 'react';
import {Alert, FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Institution} from '../../types/institution';
import {institutionMockData} from '../../data/institutionMockData';
import {Block, Button, Input, Text} from '../../components';
import {useTheme} from '../../hooks';

interface InstitutionListScreenProps {
  navigation: any;
}

const InstitutionListScreen: React.FC<InstitutionListScreenProps> = ({
  navigation,
}) => {
  const {colors, gradients, sizes} = useTheme();
  const [institutions, setInstitutions] = useState<Institution[]>(
    institutionMockData,
  );
  const [searchText, setSearchText] = useState('');

  const activeInstitutions = useMemo(() => {
    return institutions.filter(inst => !inst.isDeleted);
  }, [institutions]);

  const filteredInstitutions = useMemo(() => {
    return activeInstitutions.filter(inst =>
      inst.institutionName
        .toLowerCase()
        .includes(searchText.toLowerCase()),
    );
  }, [activeInstitutions, searchText]);

  const handleAddInstitution = () => {
    navigation.navigate('AddEditInstitution', {institution: null});
  };

  const handleDeletedInstitutions = () => {
    navigation.navigate('DeletedInstitution');
  };

  const handleViewInstitution = (institution: Institution) => {
    navigation.navigate('AddEditInstitution', {institution});
  };

  const handleEditInstitution = (institution: Institution) => {
    navigation.navigate('AddEditInstitution', {institution, isEditMode: true});
  };

  const handleToggleStatus = (institution: Institution) => {
    const newStatus = institution.status === 'Active' ? 'Inactive' : 'Active';
    setInstitutions(
      institutions.map(inst =>
        inst.id === institution.id ? {...inst, status: newStatus} : inst,
      ),
    );
    Alert.alert(
      'Success',
      `Institution status updated to ${newStatus}`,
      [{text: 'OK'}],
    );
  };

  const handleDeleteInstitution = (institution: Institution) => {
    Alert.alert(
      'Delete Institution',
      `Are you sure you want to delete "${institution.institutionName}"? This action can be undone from the Deleted Institutions screen.`,
      [
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
        {
          text: 'Delete',
          onPress: () => {
            setInstitutions(
              institutions.map(inst =>
                inst.id === institution.id ? {...inst, isDeleted: true} : inst,
              ),
            );
            Alert.alert('Success', 'Institution has been deleted.', [
              {text: 'OK'},
            ]);
          },
          style: 'destructive',
        },
      ],
    );
  };

  const renderInstitutionRow = ({item, index}: {item: Institution; index: number}) => (
    <View style={styles.card}>
      <View style={styles.rowContent}>
        <View style={styles.column}>
          <Text style={styles.slNo}>{index + 1}</Text>
        </View>
        <View style={[styles.column, {flex: 2}]}>
          <Text style={styles.cellText} numberOfLines={1}>
            {item.institutionName}
          </Text>
        </View>
        <View style={[styles.column, {flex: 1.5}]}>
          <Text style={styles.cellText} numberOfLines={1}>
            {item.organizationId}
          </Text>
        </View>
        <View style={[styles.column, {flex: 1.5}]}>
          <Text style={styles.cellText} numberOfLines={1}>
            {item.institutionUrl.replace('https://', '')}
          </Text>
        </View>
        <View style={[styles.column, {flex: 0.8}]}>
          <Text
            style={StyleSheet.flatten([
              styles.cellText,
              {
                color: item.status === 'Active' ? '#4CAF50' : '#ff9800',
                fontWeight: '600',
              },
            ])}>
            {item.status.charAt(0)}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() => handleViewInstitution(item)}>
          <Text style={styles.actionBtnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => handleEditInstitution(item)}>
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.toggleBtn]}
          onPress={() => handleToggleStatus(item)}>
          <Text style={styles.actionBtnText}>
            {item.status === 'Active' ? 'Deact.' : 'Act.'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDeleteInstitution(item)}>
          <Text style={styles.actionBtnText}>Delete</Text>
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
          Institutions
        </Text>
      </View>

      <View style={[styles.searchContainer, {backgroundColor: colors.card}]}>
        <Input
          placeholder="Search by Institution Name..."
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
            onPress={handleDeletedInstitutions}
            style={styles.buttonHalf}>
            <Text white bold>
              Deleted Institutions
            </Text>
          </Button>
          <Button
            gradient={gradients.primary}
            onPress={handleAddInstitution}
            style={styles.buttonHalf}>
            <Text white bold>
              + Add Institution
            </Text>
          </Button>
        </View>
      </View>

      <View
        style={[
          styles.tableHeader,
          {backgroundColor: colors.card, borderBottomColor: colors.light},
        ]}>
        <Text style={StyleSheet.flatten([styles.headerCell, {flex: 0.5}])}>
          Sl
        </Text>
        <Text style={StyleSheet.flatten([styles.headerCell, {flex: 2}])}>
          Institution
        </Text>
        <Text style={StyleSheet.flatten([styles.headerCell, {flex: 1.5}])}>
          Organization
        </Text>
        <Text style={StyleSheet.flatten([styles.headerCell, {flex: 1.5}])}>
          Website
        </Text>
        <Text style={StyleSheet.flatten([styles.headerCell, {flex: 0.8}])}>
          Status
        </Text>
      </View>

      {filteredInstitutions.length > 0 ? (
        <FlatList
          data={filteredInstitutions}
          renderItem={renderInstitutionRow}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No institutions found</Text>
        </View>
      )}

      <View style={styles.footerInfo}>
        <Text style={styles.infoText}>
          Total: {filteredInstitutions.length} of {activeInstitutions.length}
        </Text>
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
  topButtons: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
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
    fontSize: 14,
    backgroundColor: '#fff',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    marginHorizontal: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 4,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  rowContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  column: {
    flex: 1,
    paddingHorizontal: 4,
  },
  slNo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  cellText: {
    fontSize: 12,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  viewBtn: {
    backgroundColor: '#e3f2fd',
  },
  editBtn: {
    backgroundColor: '#f3e5f5',
  },
  toggleBtn: {
    backgroundColor: '#e8f5e9',
  },
  deleteBtn: {
    backgroundColor: '#ffebee',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
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
  footerInfo: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default InstitutionListScreen;
