import React, {useState, useCallback, useEffect} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import FastImage from 'react-native-fast-image';
import {icons} from '../../constants';
import {Divider} from 'native-base';
import {COLORS} from '../../constants/theme';
import AppVersion from '../../components/AppVersion';
import CopyRight from '../../components/CopyRight';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {getUserFarms, getFarmById} from '../../services/farm';
import {getLivestockForActiveFarm} from '../../services/livestock';

const CustomDrawer1 = props => {
  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    role: '',
  });
  const [activeFarm, setActiveFarm] = useState(null);
  const [livestockCount, setLivestockCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('user');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadUserData();
  }, []);

  const fetchLivestockCount = async () => {
    try {
      const {data: livestock, error} = await getLivestockForActiveFarm();
      if (!error && livestock && Array.isArray(livestock)) {
        let totalCount = 0;
        livestock.forEach(animal => {
          if (animal?.type?.toLowerCase() === 'poultry') {
            totalCount += animal.poultry?.initialQuantity || 1;
          } else {
            totalCount += 1;
          }
        });
        setLivestockCount(totalCount);
      }
    } catch (error) {
      console.error('Error fetching livestock count:', error);
    }
  };

  const fetchActiveFarm = async () => {
    try {
      setLoading(true);
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
            animals: Array.isArray(updatedFarm.farmingTypes)
              ? updatedFarm.farmingTypes
              : [],
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

      const {data} = await getUserFarms();
      if (data && data.length > 0) {
        const firstFarm = data[0];
        const activeFarmData = {
          id: firstFarm.id,
          name: firstFarm.name,
          location: firstFarm.administrativeLocation,
          size: `${firstFarm.size} acres`,
          animals: Array.isArray(firstFarm.farmingTypes)
            ? firstFarm.farmingTypes
            : [],
        };
        setActiveFarm(activeFarmData);
        await AsyncStorage.setItem(
          'activeFarm',
          JSON.stringify(activeFarmData),
        );
      } else {
        setActiveFarm(null);
      }
    } catch (error) {
      console.error('Error fetching active farm:', error);
      setActiveFarm(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await fetchActiveFarm();
        await fetchLivestockCount();
      };
      fetchData();
    }, []),
  );

  const toggleSwitch = () => setIsDarkMode(previousState => !previousState);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate('SignInScreen');
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  };

  const navigateToFarmInfo = () => {
    navigation.navigate('FarmInformation');
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <FastImage source={icons.avatar} style={styles.avatar} />
        <Text style={styles.nameText}>
          {`${userData.firstName} ${userData.lastName}`}
        </Text>
        <Text style={styles.roleText}>{userData.role || 'User'}</Text>
        <Divider style={styles.divider} />
      </View>

      {/* Active Farm Section */}
      <View style={styles.activeFarmSection}>
        <Text style={styles.farmSectionTitle}>Active Farm</Text>

        {activeFarm ? (
          <TouchableOpacity
            style={styles.activeFarmCard}
            onPress={navigateToFarmInfo}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(76, 113, 83, 0.8)', 'rgba(76, 113, 83, 0.6)']}
              style={styles.farmCardGradient}>
              <View style={styles.farmCardContent}>
                <View style={styles.farmIconContainer}>
                  <Icon name="barn" size={20} color={COLORS.green} />
                </View>

                <View style={styles.farmInfo}>
                  <Text style={styles.farmName} numberOfLines={1}>
                    {activeFarm.name}
                  </Text>
                  <View style={styles.farmDetails}>
                    <Text style={styles.farmDetail} numberOfLines={1}>
                      📍 {activeFarm.location}
                    </Text>
                    <View style={styles.farmStatsRow}>
                      <Text style={styles.farmStat}>🌾 {activeFarm.size}</Text>
                      <Text style={styles.farmStat}>🐄 {livestockCount}</Text>
                    </View>
                  </View>
                </View>

                <Icon
                  name="chevron-right"
                  size={18}
                  color="rgba(255,255,255,0.8)"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.noFarmCard}
            onPress={navigateToFarmInfo}
            activeOpacity={0.8}>
            <View style={styles.noFarmContent}>
              <Icon name="plus-circle-outline" size={24} color={COLORS.green} />
              <View style={styles.noFarmTextContainer}>
                <Text style={styles.noFarmText}>Add Your Farm</Text>
                <Text style={styles.noFarmSubtext}>Set up your first farm</Text>
              </View>
              <Icon
                name="chevron-right"
                size={16}
                color="rgba(255,255,255,0.6)"
              />
            </View>
          </TouchableOpacity>
        )}

        <Divider style={styles.divider} />
      </View>

      {/* Drawer Items */}
      <DrawerContentScrollView {...props} style={styles.drawerScrollView}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FastImage
          source={icons.logout}
          style={styles.logoutIcon}
          tintColor={'white'}
        />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Divider style={styles.divider} />
        <AppVersion color="white" />
        <CopyRight color="white" />
      </View>
    </View>
  );
};

export default CustomDrawer1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nameText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginTop: 10,
  },
  roleText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 10,
  },
  divider: {
    backgroundColor: COLORS.greenAlpha,
    width: '85%',
  },
  activeFarmSection: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  farmSectionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.9,
  },
  activeFarmCard: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  farmCardGradient: {
    padding: 12,
  },
  farmCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  farmInfo: {
    flex: 1,
    paddingRight: 8,
  },
  farmName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  farmDetails: {
    gap: 4,
  },
  farmDetail: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  farmStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  farmStat: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  noFarmCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 113, 83, 0.4)',
    borderStyle: 'dashed',
    padding: 12,
    marginBottom: 15,
  },
  noFarmContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noFarmTextContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  noFarmText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  noFarmSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  drawerScrollView: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    padding: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.green,
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 5,
  },
  logoutIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  switchLabel: {
    color: 'white',
    fontSize: 16,
  },
});
