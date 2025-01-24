import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Header from '../../components/headers/main-header';
import {useNavigation} from '@react-navigation/native';
import {icons} from '../../constants';

const MenuSection = ({title, description, children}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const MenuButton = ({title, icon, onPress, color = '#4CAF50'}) => (
  <TouchableOpacity
    style={styles.menuButton}
    onPress={onPress}
    activeOpacity={0.7}>
    <View style={[styles.iconContainer, {backgroundColor: color}]}>
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

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome to XpertFarmer</Text>
          <Text style={styles.welcomeSubtext}>
            Manage your farm operations efficiently
          </Text>
        </View>

        <MenuSection
          title="Farm Management Screens"
          description="Manage your farm records and operational details">
          <MenuButton
            title="Dashboard"
            icon={icons.report}
            onPress={() => navigation.navigate('FarmDashboard')}
          />
          <MenuButton
            title="Farm Record"
            icon={icons.report}
            onPress={() => navigation.navigate('FarmRecord')}
          />
          <MenuButton
            title="Add Farm Details"
            icon={icons.feeding}
            onPress={() => navigation.navigate('AddFarmDetailsScreen')}
          />
          <MenuButton
            title="Profile Settings"
            icon={icons.settings}
            onPress={() => navigation.navigate('ProfileScreen')}
          />
        </MenuSection>

        <MenuSection
          title="Employee Management Screens"
          description="Handle your workforce and staff records">
          <MenuButton
            title="Add Employee"
            icon={icons.user}
            onPress={() => navigation.navigate('AddEmployeeScreen')}
            color="#2196F3"
          />
          <MenuButton
            title="Edit Employee"
            icon={icons.settings}
            onPress={() => navigation.navigate('EditEmployeeScreen')}
            color="#2196F3"
          />
          <MenuButton
            title="Employee Directory"
            icon={icons.account}
            onPress={() => navigation.navigate('FarmEmployeeTableScreen')}
            color="#2196F3"
          />
        </MenuSection>

        <MenuSection
          title="Livestock Management Screens"
          description="Monitor and track your livestock inventory">
          <MenuButton
            title="Add Flock Details"
            icon={icons.agriculture}
            onPress={() => navigation.navigate('AddFlockDetailsScreen')}
            color="#FF9800"
          />
          <MenuButton
            title="Livestock Groups"
            icon={icons.agriculture}
            onPress={() => navigation.navigate('OptionLivestockGroupScreen')}
            color="#FF9800"
          />
          <MenuButton
            title="Livestock Profile"
            icon={icons.agriculture}
            onPress={() => navigation.navigate('OptionDetailsScreen')}
            color="#FF9800"
          />
        </MenuSection>

        <MenuSection
          title="Breeding Management Screens"
          description="Manage your breeding records and operational details">
          <MenuButton
            title="Breeding Record"
            icon={icons.agriculture}
            onPress={() => navigation.navigate('BreedingRecordForm')}
            color="#FF9800"
          />
        </MenuSection>

        <MenuSection
          title="Feeding Management Screens"
          description="Manage your feeding records and operational details">
          <MenuButton
            title="Livestock Feeding Record"
            icon={icons.agriculture}
            onPress={() => navigation.navigate('LivestockFeedingScreen')}
            color="#FF9800"
          />
          <MenuButton
            title=" Farm Feeding Plan"
            icon={icons.agriculture}
            onPress={() => navigation.navigate('FarmFeedsScreen')}
            color="#FF9800"
          />
          <MenuButton
            title=" Animal Feeding Program"
            icon={icons.agriculture}
            onPress={() => navigation.navigate('AnimalFeedingProgramScreen')}
            color="#FF9800"
          />
        </MenuSection>

        <MenuSection
          title="Health Management Screens"
          description="Monitor and manage animal health records">
          <MenuButton
            title="Add Health Records"
            icon={icons.health}
            onPress={() => navigation.navigate('AddHealthRecords')}
            color="#E91E63"
          />

          <MenuButton
            title="Health Records"
            icon={icons.health}
            onPress={() => navigation.navigate('FarmHealthRecords')}
            color="#E91E63"
          />
         
           {/* <MenuButton
            title=" Production"
            icon={icons.health}
            onPress={() => navigation.navigate('ProductionScreen')}
            color="#E91E63"
          /> */}
        
        </MenuSection>
        <MenuSection
          title="Production records"
          description="Monitor and manage animal production records">
          
          {/* <MenuButton
            title="Add Dairy records"
            icon={icons.dairy}
            onPress={() => navigation.navigate('AddDairyDetailsScreen')}
            color="#E57373 "
          />
           <MenuButton
            title=" Beef Production"
            icon={icons.beef}
            onPress={() => navigation.navigate('BeefDetailsScreen')}
            color="#E91E63"
          />
           <MenuButton
            title=" swine Production"
            icon={icons.swine}
            onPress={() => navigation.navigate('SwineRecordScreen')}
            color="#E91E63"
          />
          <MenuButton
            title="sheep & Goat Production"
            icon={icons.sheep}
            onPress={() => navigation.navigate('SheepGoatDetailsScreen')}
            color="#E91E63"
          /> */}
          
          {/* <MenuButton
            title="Poultry Production"
            icon={icons.poultry}
            onPress={() => navigation.navigate('PoultryFlockDetailsScreen')}
            color="#E91E63"
          /> */}
          
          <MenuButton
            title="Beef Production"
            icon={icons.beef}
            onPress={() => navigation.navigate('AnimalProductionListScreen')}
            color="#E91E63"
          />
         
          <MenuButton
            title="Dairy Production"
            icon={icons.dairy}
            onPress={() => navigation.navigate('DairyProductionListScreen')}
            color="#E91E63"
          />
           <MenuButton
            title="Swine Production"
            icon={icons.swine}
            onPress={() => navigation.navigate('SwineProductionListScreen')}
            color="#E91E63"
          />
          <MenuButton
            title="Sheep & Goat Production"
            icon={icons.sheep}
            onPress={() => navigation.navigate('SheepAndGoatProductionListScreen')}
            color="#E91E63"
          /> 
           <MenuButton
            title="Poultry Production"
            icon={icons.poultry}
            onPress={() => navigation.navigate('PoultryProductionListScreen')}
            color="#E91E63"
          />     
        </MenuSection>
        

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
    padding: 16,
  },
  welcomeContainer: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
  },
  sectionContent: {
    gap: 12,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  menuButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
});

export default Dashboard;
