import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

const ProductionModuleLandingScreen = ({navigation}) => {
  const productionModules = [
    {
      id: '1',
      title: 'Dairy Cattle',
      icon: icons.dairy,
      description: 'Daily milk yield, milk quality, lactation period, drying off period, sales information',
      route: 'DairyProductionListScreen'
    },
    {
      id: '2',
      title: 'Beef Cattle',
      icon: icons.beef,
      description: 'Weight gain, weaning weight, scheduled checkup weights, sales information',
      route: 'AnimalProductionListScreen'
    },
    {
      id: '3',
      title: 'Swine',
      icon: icons.swine,
      description: 'Farrowing records, growth and market records, sales information',
      route: 'SwineProductionListScreen'
    },
    {
      id: '4',
      title: 'Sheep & Goats',
      icon: icons.sheep,
      description: 'Wool/fiber production, meat and milk production, sales information',
      route: 'SheepAndGoatProductionListScreen'
    },
    {
      id: '5',
      title: 'Poultry',
      icon: icons.poultry,
      description: 'Daily egg count, egg weight/size, number of layers per day',
      route: 'PoultryFlockDetailsScreen'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      <SecondaryHeader title="Production Module" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Production Records</Text>
          <Text style={styles.subheading}>
            Manage and track production records for all livestock
          </Text>
        </View>

        {productionModules.map((module) => (
          <TouchableOpacity
            key={module.id}
            style={styles.moduleCard}
            onPress={() => navigation.navigate(module.route)}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <FastImage
                  source={module.icon}
                  style={styles.moduleIcon}
                  tintColor={COLORS.green}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>
                  {module.description}
                </Text>
              </View>
              <FastImage
                source={icons.arrowRight}
                style={styles.arrowIcon}
                tintColor={COLORS.green}
              />
            </View>
          </TouchableOpacity>
        ))}

       
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: 16,
  },
  headingContainer: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  moduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray3,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moduleIcon: {
    width: 28,
    height: 28,
  },
  textContainer: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 6,
  },
  moduleDescription: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
 
});

export default ProductionModuleLandingScreen;