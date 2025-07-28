import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';
import { getVaccinationsForLivestock, getAllergiesForLivestock } from '../../services/healthservice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const HealthRecordsScreen = ({ navigation, route }) => {
  const [vaccinationCount, setVaccinationCount] = useState(0);
  const [allergiesCount, setAllergiesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealthCounts();
  }, []);

  const fetchHealthCounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const vaccinationResponse = await getVaccinationsForLivestock();
      if (vaccinationResponse.error) {
        console.error('Error fetching vaccinations:', vaccinationResponse.error);
      } else {
        const vacCount = vaccinationResponse.data ? vaccinationResponse.data.length : 0;
        setVaccinationCount(vacCount);
        console.log(`Found ${vacCount} vaccination records`);
      }

      const allergiesResponse = await getAllergiesForLivestock();
      if (allergiesResponse.error) {
        console.error('Error fetching allergies:', allergiesResponse.error);
      } else {
        const allergyCount = allergiesResponse.data ? allergiesResponse.data.length : 0;
        setAllergiesCount(allergyCount);
        console.log(`Found ${allergyCount} allergy records`);
      }

    } catch (err) {
      setError('Failed to fetch health records');
      console.error('Health records fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const healthCategories = [
    {
      id: 'vaccination',
      label: 'Vaccination',
      image: require('../../assets/images/VaccinationDosage.png'),
      gradient: ['#F4EBD0', '#4C7153'],
      description: 'Manage vaccination records',
      screen: 'VaccineRecordsScreen',
      // count: vaccinationCount,
      icon: '💉',
    },
    {
      id: 'deworming',
      label: 'Deworming',
      image: require('../../assets/images/deworming.png'),
      gradient: ['#BD91D7', '#4C7153'],
      description: 'Track deworming treatments',
      screen: 'DewormingRecordsScreen',
      // count: 2,
      icon: '🪱',
    },
    {
      id: 'treatment',
      label: 'Treatment',
      image: require('../../assets/images/treatment.png'),
      gradient: ['#CBD18F', '#4C7153'],
      description: 'Record medical treatments',
      screen: 'CurativeTreatmentRecordsScreen',
      // count: 5,
      icon: '🏥',
    },
    {
      id: 'disorders',
      label: 'Disorders',
      image: require('../../assets/images/Disorder.png'),
      gradient: ['#CDD9CD', '#4C7153'],
      description: 'Document health disorders',
      screen: 'GeneticDisorderRecordsScreen',
      // count: 1,
      icon: '⚕️',
    },
    {
      id: 'allergies',
      label: 'Allergies',
      image: require('../../assets/images/Allergies.png'),
      gradient: ['#D79F91', '#4C7153'],
      description: 'Track allergies & reactions',
      screen: 'AllergiesRecordsScreen',
      // count: allergiesCount,
      icon: '🚨',
    },
    {
      id: 'boosters',
      label: 'Boosters',
      image: require('../../assets/images/Boosters.png'),
      gradient: ['#91D79E', '#4C7153'],
      description: 'Booster shot records',
      screen: 'BoostersRecordScreen',
      // count: 2,
      icon: '🛡️',
    },
  ];

  const totalRecords = healthCategories.reduce((sum, category) => sum + category.count, 0);
  const thisMonthRecords = Math.floor(totalRecords * 0.3);

  const handleCategoryPress = (category) => {
    navigation.navigate(category.screen);
  };

  const renderCategoryCard = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        {
          marginLeft: index % 2 === 0 ? 0 : 8,
          marginRight: index % 2 === 0 ? 8 : 0,
        }
      ]}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.85}>

      <LinearGradient
        colors={item.gradient}
        style={styles.cardContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>

        <FastImage
          source={item.image}
          style={styles.backgroundImage}
          resizeMode={FastImage.resizeMode.cover}
        />

        <LinearGradient
          colors={['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.4)']}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        <View style={styles.cardOverlay}>
          <View style={styles.cardTopSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.categoryIcon}>{item.icon}</Text>
            </View>
            {item.count > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{item.count}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardBottomSection}>
            <Text style={styles.categoryTitle}>{item.label}</Text>
            <Text style={styles.categoryDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>

        <View style={styles.floatingElement1} />
        <View style={styles.floatingElement2} />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.welcomeCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>

        <View style={styles.welcomeCardHeader}>
          <View style={[styles.healthIconContainer, { backgroundColor: COLORS.green3 }]}>
            <FastImage
              source={icons.livestock || icons.account}
              style={styles.healthIcon}
              tintColor="#FFFFFF"
            />
            <View style={styles.statusIndicator} />
          </View>

          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeTitle}>Health Categories</Text>
            <Text style={styles.welcomeSubtitle}>
              Tap any category to view and manage records
            </Text>

          </View>
        </View>

      </LinearGradient>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            ⚠️ {error}
          </Text>
          <TouchableOpacity onPress={fetchHealthCounts} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.green3} />
          <Text style={styles.loadingText}>Loading health records...</Text>
        </View>
      )}
    </View>
  );

  const renderEmptySpace = () => <View style={{ height: 32 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Health Records"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={healthCategories}
        renderItem={renderCategoryCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderEmptySpace}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerContent: {
    marginBottom: 32,
    marginTop: 20,
  },
  welcomeCard: {
    borderRadius: 28,
    padding: 28,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
  },
  welcomeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  healthIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    position: 'relative',
    shadowColor: COLORS.green2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  healthIcon: {
    width: 40,
    height: 40,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.green3,
    fontWeight: '600',
  },
  healthSummary: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  healthSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  healthSummaryNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.green3,
    marginBottom: 4,
  },
  healthSummaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  healthSummaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#D1FAE5',
  },
  sectionHeader: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: 200,
    marginBottom: 20,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 28,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.25,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardOverlay: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  categoryIcon: {
    fontSize: 20,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  countText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '800',
  },
  cardBottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: -0.3,
  },
  categoryDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 16,
  },
  floatingElement1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  floatingElement2: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  // Error handling styles
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  retryButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.green3,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default HealthRecordsScreen;