import {StyleSheet, Text, View} from 'react-native';
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

const CustomDrawer1 = props => {
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
    backgroundColor: '#929b92',
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
});
