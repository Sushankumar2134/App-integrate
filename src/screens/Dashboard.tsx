import React, {useState, useMemo} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import {Block, Text} from '../components';
import {useTheme} from '../hooks';

interface DashboardProps {
  navigation: any;
}

const Dashboard: React.FC<DashboardProps> = ({navigation}) => {
  const {colors, gradients, sizes} = useTheme();
  const {width} = useWindowDimensions();
  const cardWidth = (width - 48) / 2; // 2 columns with padding
  const [searchQuery, setSearchQuery] = useState('');

  const dashboardItems = [
    {
      id: 'institution',
      title: 'Institution',
      description: 'Manage institution data',
      icon: '🏥',
      screenName: 'Institution',
      fields: [
        'Institution',
        'institution data',
        'manage institution',
        'school',
        'college',
        'university',
        'institute',
        'educational',
        'academic',
      ],
    },
    {
      id: 'organization',
      title: 'Organization',
      description: 'Manage organization data',
      icon: '🏢',
      screenName: 'Organization',
      fields: [
        'Organization',
        'organization data',
        'manage organization',
        'org',
        'company',
        'business',
        'enterprise',
        'corporate',
        'department',
        'team',
      ],
    },
    {
      id: 'modules',
      title: 'Module Management',
      description: 'Manage system modules',
      icon: '📦',
      screenName: 'Modules',
      fields: [
        'Module',
        'Management',
        'system modules',
        'manage modules',
        'Religion',
        'Blood Group',
        'Department',
        'Designation',
        'Job Type',
        'Work Status',
        'Caste',
        'Contractor',
        'Staff',
        'Shift',
        'Grade',
        'Category',
        'Section',
        'Role',
      ],
    },
  ];

  // Filter items based on search query - search through titles, descriptions, and fields
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return dashboardItems;
    const query = searchQuery.toLowerCase();
    return dashboardItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.fields.some((field) => field.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleCardPress = (screenName: string) => {
    navigation.navigate(screenName);
  };

  return (
    <Block safe style={[styles.container, {backgroundColor: colors.background}]}>
      <View
        style={[
          styles.header,
          {backgroundColor: colors.card, borderBottomColor: colors.light},
        ]}>
        <View>
          <Text style={StyleSheet.flatten([styles.title, {color: colors.text}])}>
            Master Data
          </Text>
          <Text style={[styles.subtitle, {color: colors.gray}]}>
            Manage master data across modules
          </Text>
        </View>
      </View>

      <View style={[styles.searchContainer, {backgroundColor: colors.card}]}>
        <TextInput
          style={[styles.searchInput, {color: colors.text, borderColor: colors.light}]}
          placeholder="Search modules..."
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {filteredItems.length > 0 ? (
          <View style={styles.gridContainer}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, {width: cardWidth}]}
                onPress={() => handleCardPress(item.screenName)}>
                <View
                  style={[
                    styles.cardContent,
                    {backgroundColor: colors.white, borderColor: '#D8D8D8'},
                  ]}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.cardIcon}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.cardTitle, {color: colors.text}]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.cardDescription, {color: colors.gray}]}>
                    {item.description}
                  </Text>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, {color: colors.gray}]}>
              No modules found
            </Text>
          </View>
        )}
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
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    fontWeight: '400',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    height: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: '#D8D8D8',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    marginBottom: 8,
  },
  cardContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D8D8D8',
    borderBottomWidth: 4,
    borderBottomColor: '#000',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 0,
    color: '#333',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFE4F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  cardDescription: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 16,
    color: '#999',
  },
  arrow: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 32,
    color: '#1ABC9C',
    fontWeight: '300',
  },
  arrowIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
});

export default Dashboard;
