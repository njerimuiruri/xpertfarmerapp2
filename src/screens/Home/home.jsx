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
    const storedFarm = await AsyncStorage.getItem('activeFarm');
    if (storedFarm) {
      const farm = JSON.parse(storedFarm);
      setActiveFarm(farm);
    } else {
      setActiveFarm(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveFarm();
    }, [])
  );

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

  const navigateToFarmInfo = () => {
    navigation.navigate('FarmInformation');
  };

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
              Data to Farm,{'\n'}
              Data for Business,{'\n'}
            </Text>
          </View>
          <View style={styles.rightContainer}>
            <View style={[styles.circle, styles.circleSmall, { top: 10, right: 10 }]} />
            <View style={[styles.circle, styles.circleMedium, { top: '40%', right: 40 }]} />
            <View style={[styles.circle, styles.circleSmall, { bottom: 30, right: 20 }]} />
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>See more</Text>
            </TouchableOpacity>
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
              <View style={styles.farmIconContainer}>
                <Icon name="warehouse" size={24} color={COLORS.white} />
              </View>
              <View style={styles.farmInfoContainer}>
                <Text style={styles.farmName}>{activeFarm.name}</Text>
                <View style={styles.farmDetailsRow}>
                  <View style={styles.farmDetailItem}>
                    <Icon name="map-marker" size={14} color={COLORS.darkGray3} />
                    <Text style={styles.farmDetailText}>{activeFarm.location}</Text>
                  </View>
                  <View style={styles.farmDetailItem}>
                    <Icon name="resize" size={14} color={COLORS.darkGray3} />
                    <Text style={styles.farmDetailText}>{activeFarm.size}</Text>
                  </View>
                </View>
                <View style={styles.cropTagsContainer}>
                  {activeFarm.animals.map((a, i) => (
                    <View key={i} style={styles.cropTag}>
                      <Text style={styles.cropTagText}>{a}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Icon name="chevron-right" size={24} color={COLORS.darkGray3} style={styles.rightArrow} />
            </TouchableOpacity>
          ) : (
            <Text style={{ marginLeft: 16, color: '#666' }}>No active farm selected.</Text>
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
                style={[
                  styles.periodOption,
                  selectedPeriod === period && styles.selectedPeriodOption,
                ]}
                onPress={() => {
                  setSelectedPeriod(period);
                  setShowPeriodModal(false);
                }}
              >
                <Text
                  style={[
                    styles.periodOptionText,
                    selectedPeriod === period && styles.selectedPeriodOptionText,
                  ]}
                >
                  {period}
                </Text>
                {selectedPeriod === period && (
                  <Icon name="check" size={20} color={COLORS.green} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
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
  welcomeTextContainer: {
    flex: 1,
    paddingRight: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 24,
  },
  rightContainer: {
    width: 100,
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
  },
  seeMoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
    marginTop: 'auto',
    marginBottom: 10,
  },
  seeMoreText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  circleSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  circleMedium: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeFarmSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  activeFarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeFarmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.green,
    marginRight: 4,
  },
  activeFarmCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  farmIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  farmInfoContainer: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  farmDetailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  farmDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  farmDetailText: {
    fontSize: 13,
    color: COLORS.darkGray3,
    marginLeft: 4,
  },
  cropTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cropTag: {
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  cropTagText: {
    fontSize: 12,
    color: COLORS.green,
  },
  rightArrow: {
    marginLeft: 10,
  },
  overviewSection: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  monthText: {
    marginRight: 4,
    color: '#666',
  },
  cardsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    minHeight: 140,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  cardDetail: {
    fontSize: 13,
    color: COLORS.white,
    marginBottom: 4,
  },
  plusButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  periodModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  periodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPeriodOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  priodOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPeriodOptionText: {
    color: COLORS.green,
    fontWeight: '500',
  },
});

export default Dashboard;
