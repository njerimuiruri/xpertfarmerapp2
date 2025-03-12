import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Header from '../../components/headers/main-header';
import { useNavigation } from '@react-navigation/native';
import { icons } from '../../constants';

const MenuSection = ({ title, description, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const MenuButton = ({ title, icon, onPress, color = '#4CAF50' }) => (
  <TouchableOpacity
    style={styles.menuButton}
    onPress={onPress}
    activeOpacity={0.7}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <FastImage
        source={icon}
        style={styles.icon}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>
    <Text style={styles.menuButtonText}>{title}</Text>
    <FastImage
      source={icons.rightArrow}
      style={styles.arrowIcon}
      tintColor="#666"
      resizeMode={FastImage.resizeMode.contain}
    />
  </TouchableOpacity>
);

const Dashboard = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState('This month');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  
  const timePeriods = ['This week', 'This month', 'This quarter', 'This year'];
  
  const cardScreens = {
    'Production Analysis': 'AnimalProductionListScreen',
    'Inventory Data': 'InventoryDashboard',
    'Employees': 'AddEmployeeScreen',
    'Feeds': 'FarmFeedsScreen',
    'Animals': 'OptionDetailsScreen',
    'Breeding': 'BreedingModuleLandingScreen',
  };

  const cards = [
    {
      title: 'Production Analysis',
      details: ['Total Animal: 200', 'Cows: 100', 'Dairy: 100'],
      colors: ['#F4EBD0', '#4C7153'],
    },
    {
      "title": "Inventory Data",
      "details": [
        "Goods in Stock: 500 units",
        "Utilities: Water - 1,000L",
        "Machines: 5 active"
      ],
      "colors": ["#D79F91", "#4C7153"]
    },
    
    {
      title: 'Employees',
      details: ['Total: 20', 'Exits: 2'],
      colors: ['#91D79E', '#4C7153'],
    },
    {
      title: 'Feeds',
      details: ['Feeds available: 10KG', 'Feeds Purchased: 10KG'],
      colors: ['#CBD18F', '#4C7153'],
    },
    {
      title: 'Animals',
      details: ['Total Animal: 200', 'Flocks: 100'],
      colors: ['#BD91D7', '#4C7153'],
    },
    {
      title: 'Breeding',
      details: ['Total Animal: 50', 'Young ones: 52'],
      colors: ['#CDD9CD', '#4C7153'],
    },
  ];

  const renderCard = ({ title, details, colors }) => (
    <LinearGradient colors={colors} style={styles.card} key={title}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        {details.map((detail, index) => (
          <Text key={index} style={styles.cardDetail}>
            {detail}
          </Text>
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
  
  const renderTimePeriodsModal = () => (
    <Modal
      transparent={true}
      visible={showPeriodModal}
      animationType="fade"
      onRequestClose={() => setShowPeriodModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowPeriodModal(false)}
      >
        <View style={styles.periodModalContainer}>
          {timePeriods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodOption,
                selectedPeriod === period && styles.selectedPeriodOption
              ]}
              onPress={() => {
                setSelectedPeriod(period);
                setShowPeriodModal(false);
              }}
            >
              <Text 
                style={[
                  styles.periodOptionText,
                  selectedPeriod === period && styles.selectedPeriodOptionText
                ]}
              >
                {period}
              </Text>
              {selectedPeriod === period && (
                <Icon name="check" size={18} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
  
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView style={styles.scrollView}>
        <Text style={styles.headerTitle}>Hello, John!</Text>

        <LinearGradient
          colors={['#8CD18C', '#A7E3A7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.welcomeBanner}
        >
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Welcome to Xpert Farmers</Text>
            <Text style={styles.welcomeSubtitle}>
              Cultivating Success,{'\n'}
              Harvesting Excellence,{'\n'}
              Nurturing Tomorrow
            </Text>
          </View>

          {/* Right side with see more and circles */}
          <View style={styles.rightContainer}>
            <View
              style={[styles.circle, styles.circleSmall, { top: 10, right: 10 }]}
            />
            <View
              style={[styles.circle, styles.circleMedium, { top: '40%', right: 40 }]}
            />
            <View
              style={[styles.circle, styles.circleSmall, { bottom: 30, right: 20 }]}
            />
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>See more</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Farm Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.overviewTitle}>Farm Overview</Text>
          <TouchableOpacity style={styles.monthSelector}>
            <Text style={styles.monthText}>This month</Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardsGrid}>{cards.map(renderCard)}</View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },


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
    color: '#fff',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#fff',
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
    color: '#fff',
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
    color: '#fff',
    marginBottom: 8,
  },
  cardDetail: {
    fontSize: 13,
    color: '#fff',
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
  periodOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPeriodOptionText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default Dashboard;