import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import SecondaryHeader from '../../components/headers/secondary-header'; // Import your SecondaryHeader

const data = [
  { id: 1, title: 'Vaccine dosage', image: require('../../assets/images/deworming.png'), page: 'VaccinePage' },
  { id: 2, title: 'Deworming', image: require('../../assets/images/deworming.png'), page: 'DewormingPage' },
  { id: 3, title: 'Treatment', image: require('../../assets/images/deworming.png'), page: 'TreatmentPage' },
  { id: 4, title: 'Disorder', image: require('../../assets/images/deworming.png'), page: 'DisorderPage' },
  { id: 5, title: 'Allergies', image: require('../../assets/images/deworming.png'), page: 'AllergiesPage' },
  { id: 6, title: 'Dosage', image: require('../../assets/images/deworming.png'), page: 'DosagePage' },
];

const Healthtreatmentdashboard = () => {
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  const filteredData = data.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item.page)}
    >
      <FastImage
        source={item.image}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover} // Ensures the image covers the card
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.count}>234</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Secondary Header */}
      <SecondaryHeader title="Animal Treatments" />

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search animal ID"
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={setSearch}
      />

      {/* Grid Items */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  searchInput: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    color: '#333',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    height: 150, // Set fixed height for the card
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%', // Image fills the entire card
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    padding: 8,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  count: {
    color: 'white',
    fontSize: 12,
  },
});

export default Healthtreatmentdashboard;
