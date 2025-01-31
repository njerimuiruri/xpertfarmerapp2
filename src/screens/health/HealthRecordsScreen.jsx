import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

const healthCategories = [
  {
    id: '1',
    title: 'Vaccine dosage',
    code: '234',
    image: require('../../assets/images/VaccinationDosage.png'),
    color: '#FFD700',
    route: 'VaccineDetailsScreen'
  },
  {
    id: '2',
    title: 'Deworming',
    code: '234',
    image: require('../../assets/images/deworming.png'),
    color: '#FF6347',
    route: 'DewormingDetailsRecords'
  },
  {
    id: '3',
    title: 'Treatment',
    code: '234',
    image: require('../../assets/images/treatment.png'),
    color: '#90EE90',
    route: 'DewormingDetailsRecords'
  },
  {
    id: '4',
    title: 'Disorder',
    code: '234',
    image: require('../../assets/images/Disorder.png'),
    color: '#8B4513',
    route: 'DisorderScreen'
  },
  {
    id: '5',
    title: 'Allergies',
    code: '234',
    image: require('../../assets/images/Allergies.png'),
    color: '#F4E4BC',
    route: 'Allergiesrecordsscreen'
  },
  {
    id: '6',
    title: 'Boosters',
    code: '234',
    image: require('../../assets/images/Boosters.png'),
    color: '#808080',
    route: 'AllergyBoosterScreen'
  },
];
const HealthRecordsScreen = ({ navigation }) => {
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(true);

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <FastImage source={icons.search} style={styles.searchIcon} tintColor="#666" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search animal ID"
        placeholderTextColor="#666"
      />
      <TouchableOpacity>
        <FastImage 
          source={icons.close} 
          style={styles.closeIcon} 
          tintColor="#666" 
        />
      </TouchableOpacity>
    </View>
  );
  const renderHealthCard = ({item, index}) => (
    <TouchableOpacity 
      style={[styles.card, {borderTopColor: item.color}]}
      onPress={() => navigation.navigate(item.route)}
    >
      <FastImage
        source={item.image}
        style={styles.cardImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardCode}>{item.code}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLastAdministered = () => (
    <View style={styles.lastAdministeredContainer}>
      <TouchableOpacity 
        style={styles.seeAllLink}
        onPress={() => navigation.navigate('FarmHealthRecords')}
      >
        <Text style={styles.seeAllText}>See all</Text>
      </TouchableOpacity>

      <View style={styles.accordionContainer}>
        <TouchableOpacity 
          style={styles.accordionHeader}
          onPress={() => setIsAccordionExpanded(!isAccordionExpanded)}
        >
          <Text style={styles.accordionTitle}>Last administered treatment</Text>
          <FastImage 
            source={icons.downchevron}
            style={styles.accordionIcon}
            tintColor="#333"
          />
        </TouchableOpacity>

        {isAccordionExpanded && (
          <View style={styles.accordionContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date administered:</Text>
              <Text style={styles.infoValue}>30/09/2024</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>Deworming</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Administered by:</Text>
              <Text style={styles.infoValue}>John Doe</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Recorded by:</Text>
              <Text style={styles.infoValue}>John Doe</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      
      <SecondaryHeader title="Health Records" />
      
      {renderSearchBar()}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.gridContainer}>
          {healthCategories.map((item, index) => (
            <View key={item.id} style={styles.gridItem}>
              {renderHealthCard({item, index})}
            </View>
          ))}
        </View>
        {renderLastAdministered()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  scrollContent: {
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardCode: {
    fontSize: 14,
    color: '#666',
  },
  lastAdministeredContainer: {
    marginTop: 16,
  },
  seeAllLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  accordionContainer: {
    marginTop: 8,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    // borderBottomWidth: isAccordionExpanded ? 1 : 0,
    borderBottomColor: '#e0e0e0',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  accordionIcon: {
    width: 20,
    height: 20,
  },
  accordionContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default HealthRecordsScreen;