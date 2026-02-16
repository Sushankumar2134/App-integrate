import React, {useMemo, useState} from 'react';
import {Alert, FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Institution} from '../../types/institution';
import {institutionMockData} from '../../data/institutionMockData';
import {Block, Text} from '../../components';
import PrimaryButton from '../../components/PrimaryButton';
import {useTheme} from '../../hooks';

interface DeletedInstitutionScreenProps {
  navigation: any;
}

const DeletedInstitutionScreen: React.FC<DeletedInstitutionScreenProps> = ({
  navigation,
}) => {
  const {colors} = useTheme();
  const [institutions, setInstitutions] = useState<Institution[]>(
    institutionMockData,
  );

  const deletedInstitutions = useMemo(() => {
    return institutions.filter(inst => inst.isDeleted);
  }, [institutions]);

  const handleRestore = (institution: Institution) => {
    Alert.alert(
      'Restore Institution',
      `Restore "${institution.institutionName}"?`,
      [
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
        {
          text: 'Restore',
          onPress: () => {
            setInstitutions(
              institutions.map(inst =>
                inst.id === institution.id ? {...inst, isDeleted: false} : inst,
              ),
            );
            Alert.alert('Success', 'Institution has been restored.', [
              {text: 'OK'},
            ]);
          },
        },
      ],
    );
  };

  const handlePermanentDelete = (institution: Institution) => {
    Alert.alert(
      'Permanent Delete',
      `This will permanently delete "${institution.institutionName}". This action cannot be undone.`,
      [
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
        {
          text: 'Delete',
          onPress: () => {
            setInstitutions(
              institutions.filter(inst => inst.id !== institution.id),
            );
            Alert.alert('Success', 'Institution has been permanently deleted.', [
              {text: 'OK'},
            ]);
          },
          style: 'destructive',
        },
      ],
    );
  };

  const renderDeletedInstitution = ({item, index}: {item: Institution; index: number}) => (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.slNo}>#{index + 1}</Text>
          <View style={styles.details}>
            <Text style={styles.institutionName}>{item.institutionName}</Text>
            <Text style={styles.code}>{item.institutionCode}</Text>
            <Text style={styles.organization}>{item.organizationId}</Text>
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
          Deleted Institutions
        </Text>
        <Text style={StyleSheet.flatten([styles.subtitle, {color: colors.gray}])}>
          {deletedInstitutions.length} deleted
        </Text>
      </View>

      {deletedInstitutions.length > 0 ? (
        <FlatList
          data={deletedInstitutions}
          renderItem={renderDeletedInstitution}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No deleted institutions</Text>
          <PrimaryButton
            title="Back to Institutions"
            onPress={() => navigation.goBack()}
            style={{marginTop: 20, minWidth: 200}}
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
  institutionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  code: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  organization: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
  },
});

export default DeletedInstitutionScreen;
