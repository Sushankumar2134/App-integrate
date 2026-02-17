import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

import { Institution } from '../../types/institution';
import { Block, Button, Input, Text } from '../../components';
import { useTheme } from '../../hooks';
import { clampRGBA } from 'react-native-reanimated/lib/typescript/Colors';

interface InstitutionListScreenProps {
  navigation: any;
}

const InstitutionListScreen: React.FC<InstitutionListScreenProps> = ({
  navigation,
}) => {
  const { colors, gradients, sizes } = useTheme();

  // ================= STATES =================
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  // ================= API URL =================
  const API_URL =
    'https://tamala-unsighing-quadrennially.ngrok-free.dev/api/institutions';

  // ================= FETCH DATA =================
  const fetchInstitutions = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data;
        
      const formattedData = data.map((item: any) => ({
      id: item.id,
      institutionName: item.name, // ✅ Fix name field
      organizationId: item.organization_id,
      institutionUrl: item.institution_url,
      status: item.status === 1 ? 'Active' : 'Inactive', // ✅ Fix status
      isDeleted: item.deleted_at !== null,
    }));

    setInstitutions(formattedData);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to load institutions from server');
    } finally {
      setLoading(false);
    }
  };

  // ================= ON LOAD =================
  useEffect(() => {
    fetchInstitutions();
  }, []);

  // ================= FILTERS =================
  const activeInstitutions = useMemo(() => {
    return institutions.filter(inst => !inst?.isDeleted);
  }, [institutions]);

  const filteredInstitutions = useMemo(() => {
    return activeInstitutions.filter(inst => {
      const name = inst?.institutionName || '';

      return name
        .toLowerCase()
        .includes(searchText.toLowerCase());
    });
  }, [activeInstitutions, searchText]);

  // ================= HANDLERS =================
  const handleAddInstitution = () => {
    navigation.navigate('AddEditInstitution', { institution: null });
  };

  const handleDeletedInstitutions = () => {
    navigation.navigate('DeletedInstitution');
  };

  const handleViewInstitution = (institution: Institution) => {
    navigation.navigate('ViewInstitution', { institutionId: institution.id });
  };

  const handleEditInstitution = (institution: Institution) => {
    navigation.navigate('AddEditInstitution', {
      institution,
      isEditMode: true,
    });
  };

  // ================= TOGGLE STATUS =================
  const handleToggleStatus = async (institution: Institution) => {
    try {
      const newStatus =
        String(institution.status) === 'Active'
          ? 'Inactive'
          : 'Active';

      await axios.put(`${API_URL}/${institution.id}`, {
        status: newStatus,
      });

      Alert.alert('Success', 'Status updated');

      fetchInstitutions();
    } catch (error) {
      Alert.alert('Error', 'Unable to update status');
    }
  };

  // ================= DELETE =================
  const handleDeleteInstitution = (institution: Institution) => {
    Alert.alert(
      'Delete Institution',
      `Are you sure you want to delete "${institution.institutionName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/${institution.id}`);

              Alert.alert('Success', 'Institution deleted');

              fetchInstitutions();
            } catch (error) {
              Alert.alert('Error', 'Unable to delete');
            }
          },
        },
      ],
    );
  };

  // ================= RENDER ROW =================
  const renderInstitutionRow = ({ item,index,}: {
    item: Institution;
    index: number;
  }) => (
    <View style={styles.card}>
      <View style={styles.rowContent}>
        <View style={styles.column}>
          <Text style={styles.slNo}>{index + 1}</Text>
        </View>

        <View style={[styles.column, { flex: 2 }]}>
          <Text style={styles.cellText} numberOfLines={1}>
            
            {item?.institutionName || 'N/A'}
          </Text>
        </View>

        <View style={[styles.column, { flex: 1.5 }]}>
          <Text style={styles.cellText} numberOfLines={1}>
            {item?.organizationId || 'N/A'}
          </Text>
        </View>

        <View style={[styles.column, { flex: 1.5 }]}>
          <Text style={styles.cellText} numberOfLines={1}>
            {item?.institutionUrl
              ? item.institutionUrl.replace('https://', '')
              : 'N/A'}
          </Text>
        </View>

        {/* ✅ SAFE STATUS */}
        <View style={[styles.column, { flex: 0.8 }]}>
          <Text
            style={[
              styles.cellText,
              {
                color:
                  String(item?.status) === 'Active'
                    ? '#4CAF50'
                    : '#ff9800',
                fontWeight: '600',
              },
            ]}>
            {String(item?.status ?? '-').charAt(0)}
          </Text>
        </View>
      </View>

      {/* ACTION BUTTONS */}
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
            {String(item?.status) === 'Active' ? 'Deact.' : 'Act.'}
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

  // ================= UI =================
  return (
    <Block
      safe
      style={[styles.container, { backgroundColor: colors.background }]}>

      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.light },
        ]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Institutions
        </Text>
      </View>

      {/* SEARCH */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Input
          placeholder="Search by Institution Name..."
          value={searchText}
          onChangeText={setSearchText}
          marginBottom={sizes.s}
        />
      </View>

      {/* BUTTONS */}
      <View style={styles.addButtonContainer}>
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

      {/* TABLE HEADER */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>Sl</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Institution</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>Organization</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>Website</Text>
        <Text style={[styles.headerCell, { flex: 0.8 }]}>Status</Text>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 30 }}
        />
      ) : filteredInstitutions.length > 0 ? (
        <FlatList
          data={filteredInstitutions}
          renderItem={renderInstitutionRow}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No institutions found</Text>
        </View>
      )}

      {/* FOOTER */}
      <View style={styles.footerInfo}>
        <Text style={styles.infoText}>
          Total: {filteredInstitutions.length} of{' '}
          {activeInstitutions.length}
        </Text>
      </View>
    </Block>
  );
};

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    padding: 16,
    borderBottomWidth: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  searchContainer: { padding: 16 },

  addButtonContainer: { padding: 16 },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },

  buttonHalf: { flex: 1 },

  tableHeader: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#007AFF',
    marginHorizontal: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },

  rowContent: {
    flexDirection: 'row',
    padding: 10,
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
  },

  cellText: { fontSize: 12 },

  actionButtons: {
    flexDirection: 'row',
    padding: 8,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  actionBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },

  viewBtn: { backgroundColor: '#e3f2fd' },
  editBtn: { backgroundColor: '#f3e5f5' },
  toggleBtn: { backgroundColor: '#e8f5e9' },
  deleteBtn: { backgroundColor: '#ffebee' },

  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
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
    padding: 10,
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
