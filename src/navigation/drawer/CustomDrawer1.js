import React, {useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
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
  const [allFarms, setAllFarms] = useState([]);
  const [livestockCount, setLivestockCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFarmModal, setShowFarmModal] = useState(false);

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

  const fetchAllFarms = async () => {
    try {
      setLoading(true);
      const storedActiveFarm = await AsyncStorage.getItem('activeFarm');
      const {data} = await getUserFarms();

      if (data && data.length > 0) {
        const formattedFarms = data.map(farm => ({
          id: farm.id,
          name: farm.name,
          location: farm.administrativeLocation,
          size: `${farm.size} acres`,
          animals: Array.isArray(farm.farmingTypes) ? farm.farmingTypes : [],
          isActive: false,
        }));

        // Set active farm
        let activeId = null;
        if (storedActiveFarm) {
          const parsed = JSON.parse(storedActiveFarm);
          activeId = parsed.id;
        } else {
          activeId = formattedFarms[0]?.id;
        }

        const updatedFarms = formattedFarms.map(farm => ({
          ...farm,
          isActive: farm.id === activeId,
        }));

        const active = updatedFarms.find(f => f.isActive);
        setAllFarms(updatedFarms);
        setActiveFarm(active || updatedFarms[0]);

        // Update stored active farm if needed
        if (
          active &&
          (!storedActiveFarm || JSON.parse(storedActiveFarm).id !== active.id)
        ) {
          await AsyncStorage.setItem('activeFarm', JSON.stringify(active));
        }
      } else {
        setAllFarms([]);
        setActiveFarm(null);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
      setAllFarms([]);
      setActiveFarm(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmSelect = async farm => {
    if (farm.id === activeFarm?.id) return;

    const updatedFarms = allFarms.map(f => ({
      ...f,
      isActive: f.id === farm.id,
    }));

    setAllFarms(updatedFarms);
    setActiveFarm(farm);
    await AsyncStorage.setItem('activeFarm', JSON.stringify(farm));
    setShowFarmModal(false);

    // Refresh livestock count for new active farm
    await fetchLivestockCount();
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await fetchAllFarms();
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

  const renderModalFarmItem = ({item}) => {
    const isActive = item.isActive;

    return (
      <TouchableOpacity
        style={[styles.modalFarmItem, isActive && styles.activeModalFarmItem]}
        onPress={() => handleFarmSelect(item)}
        activeOpacity={0.8}>
        <View style={styles.modalFarmContent}>
          <View
            style={[
              styles.farmIconContainer,
              isActive && styles.activeFarmIcon,
            ]}>
            <Icon
              name="barn"
              size={20}
              color={isActive ? COLORS.green : 'rgba(255,255,255,0.7)'}
            />
          </View>

          <View style={styles.modalFarmInfo}>
            <Text
              style={[
                styles.modalFarmName,
                isActive && styles.activeModalFarmName,
              ]}>
              {item.name}
            </Text>
            <Text style={styles.modalFarmLocation}>📍 {item.location}</Text>
            <Text style={styles.modalFarmSize}>🌾 {item.size}</Text>
          </View>

          {isActive && (
            <Icon name="check-circle" size={20} color={COLORS.green} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const FarmSwitcherModal = () => (
    <Modal
      visible={showFarmModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFarmModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Switch Farm</Text>
            <TouchableOpacity
              onPress={() => setShowFarmModal(false)}
              style={styles.closeButton}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={allFarms}
            renderItem={renderModalFarmItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{height: 12}} />}
            style={styles.farmsList}
          />

          <TouchableOpacity
            style={styles.addFarmButton}
            onPress={() => {
              setShowFarmModal(false);
              navigation.navigate('AddFarm');
            }}>
            <Icon name="plus" size={20} color={COLORS.green} />
            <Text style={styles.addFarmText}>Add New Farm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <FastImage source={icons.avatar} style={styles.avatar} />
        <Text style={styles.nameText}>
          {`${userData.firstName} ${userData.lastName}`}
        </Text>
        <Text style={styles.roleText}>{userData.role || 'User'}</Text>
        <Divider style={styles.divider} />
      </View>

      <DrawerContentScrollView {...props} style={styles.drawerScrollView}>
        <DrawerItemList {...props} />

        <View style={styles.activeFarmSection}>
          <Divider style={[styles.divider, {marginBottom: 15}]} />

          {activeFarm ? (
            <>
              <TouchableOpacity
                style={styles.activeFarmCard}
                onPress={() => setShowFarmModal(true)}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={['rgba(76, 113, 83, 0.8)', 'rgba(76, 113, 83, 0.6)']}
                  style={styles.activeFarmGradient}>
                  <View style={styles.activeFarmHeader}>
                    <View style={styles.activeFarmIconContainer}>
                      <Icon name="barn" size={18} color={COLORS.green} />
                    </View>
                    <View style={styles.activeFarmInfo}>
                      <Text style={styles.activeFarmName}>
                        {activeFarm.name}
                      </Text>
                      <Text style={styles.activeFarmLocation}>
                        📍 {activeFarm.location}
                      </Text>
                    </View>
                    <View style={styles.switchButton}>
                      <Icon name="swap-horizontal" size={16} color="white" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Farm Stats */}
              <View style={styles.farmStatsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{activeFarm.size}</Text>
                  <Text style={styles.statLabel}>Farm Size</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{livestockCount}</Text>
                  <Text style={styles.statLabel}>Livestock</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{allFarms.length}</Text>
                  <Text style={styles.statLabel}>Total Farms</Text>
                </View>
              </View>

              <View style={styles.quickActionsContainer}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={navigateToFarmInfo}>
                  <Icon
                    name="information-outline"
                    size={16}
                    color={COLORS.green}
                  />
                  <Text style={styles.quickActionText}>Farm Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => setShowFarmModal(true)}>
                  <Icon name="swap-horizontal" size={16} color={COLORS.green} />
                  <Text style={styles.quickActionText}>Switch Farm</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.noFarmCard}
              onPress={navigateToFarmInfo}
              activeOpacity={0.8}>
              <View style={styles.noFarmContent}>
                <Icon
                  name="plus-circle-outline"
                  size={24}
                  color={COLORS.green}
                />
                <View style={styles.noFarmTextContainer}>
                  <Text style={styles.noFarmText}>Set Up Your Farm</Text>
                  <Text style={styles.noFarmSubtext}>
                    Start your farming journey
                  </Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={20}
                  color="rgba(255,255,255,0.6)"
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
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

      <View style={styles.footer}>
        <Divider style={styles.divider} />
        <AppVersion color="white" />
        <CopyRight color="white" />
      </View>

      <FarmSwitcherModal />
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
    marginTop: 10,
  },
  activeFarmCard: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  activeFarmGradient: {
    padding: 12,
  },
  activeFarmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFarmIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeFarmInfo: {
    flex: 1,
  },
  activeFarmName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  activeFarmLocation: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  switchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  farmStatsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 113, 83, 0.3)',
  },
  quickActionText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
    fontWeight: '500',
  },
  noFarmCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 113, 83, 0.4)',
    borderStyle: 'dashed',
    padding: 15,
  },
  noFarmContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noFarmTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  noFarmText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  noFarmSubtext: {
    fontSize: 12,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
  },
  farmsList: {
    maxHeight: 300,
  },
  modalFarmItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeModalFarmItem: {
    borderColor: COLORS.green,
    backgroundColor: 'rgba(76, 113, 83, 0.1)',
  },
  modalFarmContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeFarmIcon: {
    backgroundColor: 'rgba(76, 113, 83, 0.3)',
  },
  modalFarmInfo: {
    flex: 1,
  },
  modalFarmName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  activeModalFarmName: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalFarmLocation: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  modalFarmSize: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  addFarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 113, 83, 0.2)',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(76, 113, 83, 0.4)',
    borderStyle: 'dashed',
  },
  addFarmText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green,
    marginLeft: 8,
  },
});
