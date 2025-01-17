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
import {useNavigation} from '@react-navigation/native';
import {Switch} from 'native-base';
import {useState} from 'react';

const CustomDrawer1 = props => {
  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleSwitch = () => setIsDarkMode(previousState => !previousState);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate('SignInScreen');
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <FastImage source={icons.avatar} style={styles.avatar} />
        <Text style={styles.nameText}>John Doe</Text>
        <Text style={styles.roleText}>Admin</Text>
        <Divider style={styles.divider} />
      </View>

      {/* Drawer Items */}
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Dark Mode Switch */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Dark Mode</Text>
        <Switch
          isChecked={isDarkMode}
          onToggle={toggleSwitch}
          offTrackColor="#767577"
          onTrackColor="#81b0ff"
          thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

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
