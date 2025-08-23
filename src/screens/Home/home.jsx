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
import { getLivestockForActiveFarm } from '../../services/livestock';


const Dashboard = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState('This month');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [activeFarm, setActiveFarm] = useState(null);
  const [livestockData, setLivestockData] = useState({
    totalAnimals: 0,
    flocks: 0,
    cattle: 0,
    goats: 0,
    sheep: 0,
    swine: 0,
    rabbits: 0,
  });
  const [loading, setLoading] = useState(false);

  const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];

  const cardScreens = {
    'Production Analysis': 'SalesLandingPage',
    'Inventory Data': 'InventoryDashboard',
    'Health': 'AddHealthRecords',
    'Feeds': 'FarmFeedsScreen',
    'Livestock': 'OptionDetailsScreen',
    'Breeding': 'BreedingRecordForm',
  };

  const fetchLivestockData = async () => {
    try {
      setLoading(true);
      const { data: livestock, error } = await getLivestockForActiveFarm();

      if (error) {
        console.error('Error fetching livestock:', error);
        return;
      }

      if (!livestock || !Array.isArray(livestock)) {
        console.log('No livestock data found or invalid format');
        return;
      }

      const stats = {
        totalAnimals: 0,
        flocks: 0,
        cattle: 0,
        goats: 0,
        sheep: 0,
        swine: 0,
        rabbits: 0,
      };

      livestock.forEach(animal => {
        if (!animal || !animal.type) return;

        const animalType = animal.type.toLowerCase();

        if (animalType === 'poultry') {
          const quantity = animal.poultry?.initialQuantity || 1;
          stats.flocks += quantity;
          stats.totalAnimals += quantity;
        } else {
          stats.totalAnimals += 1;

          switch (animalType) {
            case 'cattle':
              stats.cattle += 1;
              break;
            case 'goats':
              stats.goats += 1;
              break;
            case 'sheep':
              stats.sheep += 1;
              break;
            case 'swine':
              stats.swine += 1;
              break;
            case 'rabbit':
              stats.rabbits += 1;
              break;
          }
        }
      });

      setLivestockData(stats);
    } catch (error) {
      console.error('Error calculating livestock stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Production Analysis',
      details: [
        `Total Animals: ${livestockData.totalAnimals}`,
        livestockData.cattle > 0 ? `Cattle: ${livestockData.cattle}` : null,
        livestockData.goats > 0 ? `Goats: ${livestockData.goats}` : null,
        livestockData.sheep > 0 ? `Sheep: ${livestockData.sheep}` : null,
      ].filter(Boolean),
      colors: ['#F4EBD0', '#4C7153'],
    },
    {
      title: 'Livestock',
      details: [
        `Total Animals: ${livestockData.totalAnimals}`,
        `Flocks (Poultry): ${livestockData.flocks}`,
        livestockData.cattle > 0 ? `Cattle: ${livestockData.cattle}` : null,
      ].filter(Boolean),
      colors: ['#BD91D7', '#4C7153'],
    },
    {
      title: 'Feeds',
      details: ['Feeds available: 10KG', 'Feeds Purchased: 10KG'],
      colors: ['#CBD18F', '#4C7153'],
    },
    {
      title: 'Breeding',
      details: [
        `Total Animals: ${livestockData.totalAnimals}`,
        'Young ones: Coming soon',
      ],
      colors: ['#CDD9CD', '#4C7153'],
    },
    {
      title: 'Inventory Data',
      details: ['Goods in Stock: 500 units', 'Utilities: Water - 1,000L', 'Machines: 5 active'],
      colors: ['#D79F91', '#4C7153'],
    },
    {
      title: 'Health',
      details: [
        `Total Animals: ${livestockData.totalAnimals}`,
        'Health Records: View Details',
      ],
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
      const fetchData = async () => {
        await fetchActiveFarm();
        await fetchLivestockData();
      };
      fetchData();
    }, [])
  );

  const renderCard = ({ title, details, colors }) => (
    <LinearGradient colors={colors} style={styles.card} key={title}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        {details.map((detail, index) => (
          <Text key={index} style={styles.cardDetail}>{detail}</Text>
        ))}
        {loading && title === 'Livestock' && (
          <Text style={styles.loadingText}>Loading...</Text>
        )}
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
            <Text style={styles.welcomeSubtitle}>
              Data to Farm,{"\n"}Data for Business,{"\n"}Smart Solutions for Modern Agriculture
            </Text>
          </View>
          <View style={styles.welcomeIconContainer}>
            <Icon name="tractor" size={60} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>



        <View style={styles.overviewSection}>
          <Text style={styles.overviewTitle}>Farm Management</Text>
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
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 160,
  },
  welcomeTextContainer: { flex: 1, paddingRight: 20 },
  welcomeTitle: { fontSize: 20, fontWeight: '600', color: COLORS.white, marginBottom: 12 },
  welcomeSubtitle: { fontSize: 14, color: COLORS.white, lineHeight: 20 },
  welcomeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
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
  loadingText: { fontSize: 12, color: COLORS.white, fontStyle: 'italic' },
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