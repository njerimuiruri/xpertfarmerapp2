import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Image,
  ScrollView,
  Pressable,
  Divider,
  Center,

} from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const menuItems = [
    {
      title: 'Personal Information',
      subTitle: 'Chat and notifications settings',
      icon: icons.user,
      route: 'PersonalInformation',
    },
    {
      title: 'Farm Information',
      subTitle: 'Chat and notifications settings',
      icon: icons.agriculture,
      route: 'FarmInformation',
    },
    {
      title: 'Admin Permission',
      subTitle: 'Data preferences and storage settings',
      icon: icons.settings,
      route: 'AdminPermission',
    },
    {
      title: 'Privacy & Permissions',
      subTitle: 'Contact, My Admin and Block Contact',
      icon: icons.shield,
      route: 'PrivacyPermissions',
    },
    {
      title: 'Help',
      subTitle: 'Data preferences and storage settings',
      icon: icons.help,
      route: 'HelpScreen',
    },
    {
      title: 'Feedback',
      subTitle: 'Chat and notifications settings',
      icon: icons.feedback,
      route: 'FeedbackScreen',
    },
    {
      title: 'About',
      subTitle: 'Version 1.7',
      icon: icons.about,
      route: 'AboutScreen',
    },
  ];
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate('SignInScreen');
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  };
  const renderMenuItem = (item, index) => {
    return (
      <Pressable key={index} onPress={() => navigation.navigate(item.route)}>
        <HStack
          alignItems="center"
          justifyContent="space-between"
          py={3}
        >
          <HStack space={3} alignItems="center">
            <Box
              bg={COLORS.lightGreen}
              p={2}
              borderRadius={8}
            >
              <FastImage
                source={item.icon}
                style={styles.menuIcon}
                resizeMode="contain"
                tintColor={COLORS.green}
              />
            </Box>
            <VStack>
              <Text fontSize="md" fontWeight="medium" color="black">
                {item.title}
              </Text>
              <Text fontSize="xs" color={COLORS.darkGray3}>
                {item.subTitle}
              </Text>
            </VStack>
          </HStack>
          <FastImage
            source={icons.right_arrow}
            style={styles.arrowIcon}
            resizeMode="contain"
            tintColor={COLORS.darkGray3}
          />
        </HStack>
        {index < menuItems.length - 1 && (
          <Divider bg={COLORS.lightGreen} opacity={0.5} />
        )}
      </Pressable>
    );
  };

  return (
    <Box flex={1} bg="white">
      <Box
        bg={COLORS.green}
        h={180}
        borderBottomLeftRadius={200}
        borderBottomRightRadius={180}
        position="relative"
        alignItems="center"
        pt={10}
      >

        <HStack width="full" justifyContent="space-between" px={4} alignItems="center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FastImage
              source={icons.backarrow}
              style={styles.headerIcon}
              resizeMode="contain"
              tintColor="white"
            />
          </TouchableOpacity>

          <Text fontSize="md" fontWeight="bold" color="white">
            General Details
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <FastImage onPress={() => navigation.navigate('Settings')}
              source={icons.settings}
              style={styles.headerIcon}
              resizeMode="contain"
              tintColor="white"
            />
          </TouchableOpacity>


        </HStack>
      </Box>

      <Box
        position="absolute"
        top={110}
        left="50%"
        style={{ transform: [{ translateX: -40 }] }}
        zIndex={10}
        alignItems="center"
      >
        <Box position="relative">
          <Image
            source={require('../../assets/images/profile-avatar.png')}
            style={styles.profileImage}
            alt="Profile Image"
          />
          <Box
            position="absolute"
            bottom={0}
            right={0}
            bg={COLORS.green}
            borderRadius={15}
            p={2}
          >
            <FastImage
              source={icons.camera}
              style={styles.cameraIcon}
              resizeMode="contain"
              tintColor="white"
            />
          </Box>
        </Box>
        <Text fontSize="sm" color={COLORS.darkGray3} mt={2}>
          App Settings
        </Text>
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 80, paddingBottom: 20 }}
      >
        <Text fontSize="md" color={COLORS.darkGray3} ml={4} mb={2}>
          More
        </Text>

        <Box mx={4} bg="white" borderRadius={12} p={4} shadow={2}>
          <VStack space={0}>
            {menuItems.map(renderMenuItem)}
          </VStack>
        </Box>

        <Center mt={6}>
          <Pressable
            bg={COLORS.green}
            w="60%"
            py={2}
            borderRadius={30}
            alignItems="center"

          >
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <FastImage
                source={icons.logout}
                style={styles.logoutIcon}
                tintColor={'white'}
              />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </Pressable>
        </Center>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    width: 24,
    height: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "white",
  },
  menuIcon: {
    width: 20,
    height: 20,
  },
  arrowIcon: {
    width: 16,
    height: 16,
  },
  cameraIcon: {
    width: 16,
    height: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    backgroundColor: COLORS.green,
    marginVertical: 4,
    borderRadius: 4,
  },
  logoutIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

});