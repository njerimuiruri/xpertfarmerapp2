import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import Header from '../../components/headers/main-header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserFarms, getFarmById } from '../../services/farm';

const Dashboard = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState('This month');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [activeFarm, setActiveFarm] = useState(null);

  const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];

  const cardScreens = {
    'Production Analysis': 'ProductionModuleLandingScreen',
    'Inventory Data': 'InventoryDashboard',
    'Health': 'AddHealthRecords',
    'Feeds': 'FarmFeedsScreen',
    'Livestock': 'OptionDetailsScreen',
    'Breeding': 'BreedingRecordForm',
  };

  const cards = [
    {
      title: 'Production Analysis',
      details: ['Total Animal: 200', 'Cows: 100', 'Dairy: 100'],
      colors: ['#F4EBD0', '#4C7153'],
    },
    {
      title: 'Livestock',
      details: ['Total Animal: 200', 'Flocks: 100'],
      colors: ['#BD91D7', '#4C7153'],
    },
    {
      title: 'Feeds',
      details: ['Feeds available: 10KG', 'Feeds Purchased: 10KG'],
      colors: ['#CBD18F', '#4C7153'],
    },
    {
      title: 'Breeding',
      details: ['Total Animal: 50', 'Young ones: 52'],
      colors: ['#CDD9CD', '#4C7153'],
    },
    {
      title: 'Inventory Data',
      details: ['Goods in Stock: 500 units', 'Utilities: Water - 1,000L', 'Machines: 5 active'],
      colors: ['#D79F91', '#4C7153'],
    },
    {
      title: 'Health',
      details: ['Total: 20', 'Exits: 2'],
      colors: ['#91D79E', '#4C7153'],
    },
  ];

  const fetchActiveFarm = async () => {
    try {
      const storedFarm = await AsyncStorage.getItem('activeFarm');

      if (storedFarm) {
        const parsed = JSON.parse(storedFarm);
        try {
          const updatedFarm = await getFarmById(parsed.id);
          const newActive = {
            id: updatedFarm.id,
            name: updatedFarm.name,
            location: updatedFarm.administrativeLocation,
            size: `${updatedFarm.size} acres`,
            animals: Array.isArray(updatedFarm.farmingTypes) ? updatedFarm.farmingTypes : [],
          };
          setActiveFarm(newActive);
          await AsyncStorage.setItem('activeFarm', JSON.stringify(newActive));
          return;
        } catch (error) {
          console.log('Error fetching stored farm, using cached data:', error);
          setActiveFarm(parsed);
          return;
        }
      }

      const { data } = await getUserFarms();
      if (data && data.length > 0) {
        const firstFarm = data[0];
        const activeFarmData = {
          id: firstFarm.id,
          name: firstFarm.name,
          location: firstFarm.administrativeLocation,
          size: `${firstFarm.size} acres`,
          animals: Array.isArray(firstFarm.farmingTypes) ? firstFarm.farmingTypes : [],
        };
        setActiveFarm(activeFarmData);
        await AsyncStorage.setItem('activeFarm', JSON.stringify(activeFarmData));
      } else {
        setActiveFarm(null);
      }
    } catch (error) {
      console.error('Error fetching active farm:', error);
      setActiveFarm(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveFarm();
    }, [])
  );

  const navigateToFarmInfo = () => {
    navigation.navigate('FarmInformation');
  };

  const renderCard = ({ title, details, colors }) => (
    <LinearGradient colors={colors} style={styles.card} key={title}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        {details.map((detail, index) => (
          <Text key={index} style={styles.cardDetail}>{detail}</Text>
        ))}
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate(cardScreens[title])}
        style={styles.plusButton}
      >
        <Icon name="plus-circle-outline" size={32} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#8CD18C', '#A7E3A7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.welcomeBanner}
        >
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Welcome to Xpert Farmer</Text>
            <Text style={styles.welcomeSubtitle}>Data to Farm,{"\n"}Data for Business,{"\n"}</Text>
          </View>
        </LinearGradient>

        <View style={styles.activeFarmSection}>
          <View style={styles.activeFarmHeader}>
            <Text style={styles.activeFarmTitle}>Active Farm</Text>
            <TouchableOpacity style={styles.viewAllButton} onPress={navigateToFarmInfo}>
              <Text style={styles.viewAllText}>View All</Text>
              <Icon name="chevron-right" size={16} color={COLORS.green} />
            </TouchableOpacity>
          </View>

          {activeFarm ? (
            <TouchableOpacity style={styles.activeFarmCard} onPress={navigateToFarmInfo}>
              <Text style={styles.farmName}>{activeFarm.name}</Text>
              <Text style={styles.farmDetail}>Location: {activeFarm.location}</Text>
              <Text style={styles.farmDetail}>Size: {activeFarm.size}</Text>
              <Text style={styles.farmDetail}>
                Animals: {Array.isArray(activeFarm.animals) && activeFarm.animals.length > 0
                  ? activeFarm.animals.join(', ')
                  : 'N/A'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.noFarmCard} onPress={navigateToFarmInfo}>
              <Text style={styles.noFarm}>No active farm selected.</Text>
              <Text style={styles.noFarmSubtext}>Tap to add or select a farm</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.overviewSection}>
          <Text style={styles.overviewTitle}>Farm Overview</Text>
          <TouchableOpacity style={styles.monthSelector} onPress={() => setShowPeriodModal(true)}>
            <Text style={styles.monthText}>{selectedPeriod}</Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardsGrid}>{cards.map(renderCard)}</View>
      </ScrollView>

      <Modal
        visible={showPeriodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPeriodModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPeriodModal(false)}
        >
          <View style={styles.periodModalContainer}>
            <Text style={styles.modalTitle}>Select Time Period</Text>
            {timePeriods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.periodOption, selectedPeriod === period && styles.selectedPeriodOption]}
                onPress={() => {
                  setSelectedPeriod(period);
                  setShowPeriodModal(false);
                }}
              >
                <Text style={[styles.periodOptionText, selectedPeriod === period && styles.selectedPeriodOptionText]}>
                  {period}
                </Text>
                {selectedPeriod === period && <Icon name="check" size={20} color={COLORS.green} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollView: { flex: 1 },
  welcomeBanner: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    minHeight: 160,
  },
  welcomeTextContainer: { flex: 1, paddingRight: 20 },
  welcomeTitle: { fontSize: 20, fontWeight: '600', color: COLORS.white, marginBottom: 12 },
  welcomeSubtitle: { fontSize: 16, color: COLORS.white, lineHeight: 24 },
  activeFarmSection: { paddingHorizontal: 16, marginBottom: 20 },
  activeFarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeFarmTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  viewAllButton: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { fontSize: 14, color: COLORS.green, marginRight: 4 },
  activeFarmCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  farmName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  farmDetail: { fontSize: 13, color: COLORS.darkGray3, marginBottom: 4 },
  noFarmCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  noFarm: { color: '#666', fontSize: 16, fontWeight: '500' },
  noFarmSubtext: { color: '#999', fontSize: 12, marginTop: 4 },
  overviewSection: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  monthText: { marginRight: 4, color: '#666' },
  cardsGrid: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { width: '47%', padding: 16, borderRadius: 16, minHeight: 140 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.white, marginBottom: 8 },
  cardDetail: { fontSize: 13, color: COLORS.white, marginBottom: 4 },
  plusButton: { position: 'absolute', bottom: 12, right: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  periodModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  periodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPeriodOption: { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
  periodOptionText: { fontSize: 16, color: '#333' },
  selectedPeriodOptionText: { color: COLORS.green, fontWeight: '500' },
});

export default Dashboard;