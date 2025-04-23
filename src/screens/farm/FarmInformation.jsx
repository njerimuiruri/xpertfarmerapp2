import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Pressable,
  Divider,
  IconButton,
  Heading,
  Button,
  FlatList,
} from 'native-base';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';

export default function FarmInformation({ navigation }) {
  const [farms, setFarms] = useState([
    {
      id: '1',
      name: 'Green Valley Farm',
      location: 'Eastern Region',
      size: '5.2 acres',
      animals: ['Pigs', 'Goats'],
      isActive: true,
    },
    {
      id: '2',
      name: 'Sunrise Plantation',
      location: 'Western Region',
      size: '3.7 acres',
      animals: ['Poultry', 'Dairy Cattle'],
      isActive: false,
    },
    {
      id: '3',
      name: 'Riverside Fields',
      location: 'Central Region',
      size: '8.1 acres',
      animals: ['Beef Goats', 'Sheep'],
      isActive: false,
    },
  ]);

  const [activeFarm, setActiveFarm] = useState(farms.find(farm => farm.isActive) || farms[0]);

  const handleFarmSelect = (farm) => {
    if (farm.id === activeFarm.id) return;

    const updatedFarms = farms.map(f => ({
      ...f,
      isActive: f.id === farm.id
    }));

    setFarms(updatedFarms);
    setActiveFarm(farm);
  };

  const navigateToEditFarm = (farm) => {
    navigation.navigate('EditFarm', { farm });
  };

  const navigateToAddFarm = () => {
    navigation.navigate('AddFarm');
  };

  const renderFarmItem = ({ item }) => (
    <Pressable
      onPress={() => handleFarmSelect(item)}
      mb={3}
    >
      <Box
        bg={item.isActive ? COLORS.lightGreen : 'white'}
        borderWidth={1}
        borderColor={item.isActive ? COLORS.green : COLORS.gray3}
        borderRadius={10}
        p={4}
        shadow={2}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <VStack space={1} flex={1}>
            <HStack alignItems="center" space={2}>
              <FastImage
                source={icons.agriculture}
                style={styles.smallIcon}
                resizeMode="contain"
                tintColor={COLORS.green}
              />
              <Text fontSize="md" fontWeight="bold" color="black">
                {item.name}
              </Text>
            </HStack>
            <Text fontSize="sm" color={COLORS.darkGray3}>
              Location: {item.location}
            </Text>
            <Text fontSize="sm" color={COLORS.darkGray3}>
              Size: {item.size}
            </Text>
            <Text fontSize="sm" color={COLORS.darkGray3}>
              animals: {item.animals.join(', ')}
            </Text>
          </VStack>

          <VStack alignItems="flex-end" space={2}>
            {item.isActive && (
              <Box bg={COLORS.green} px={2} py={1} borderRadius={4}>
                <Text fontSize="xs" color="white">Active</Text>
              </Box>
            )}

            <IconButton
              icon={
                <FastImage
                  source={icons.edit}
                  style={styles.smallIcon}
                  resizeMode="contain"
                  tintColor={COLORS.green}
                />
              }
              borderRadius="full"
              onPress={() => navigateToEditFarm(item)}
            />
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  return (
    < SafeAreaView style={styles.container} >
      <SecondaryHeader title="Farm Information" />
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />

      <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
        <Box mb={6}>
          <Heading size="md" mb={4}>Active Farm</Heading>
          {activeFarm ? (
            <Box
              bg={COLORS.lightGreen}
              borderRadius={10}
              p={4}
              shadow={2}
            >
              <HStack justifyContent="space-between" mb={2}>
                <Text fontSize="lg" fontWeight="bold" color="black">
                  {activeFarm.name}
                </Text>
                <IconButton
                  icon={
                    <FastImage
                      source={icons.edit}
                      style={styles.smallIcon}
                      resizeMode="contain"
                      tintColor={COLORS.green}
                    />
                  }
                  borderRadius="full"
                  onPress={() => navigateToEditFarm(activeFarm)}
                />
              </HStack>

              <VStack space={2}>
                <HStack alignItems="center" space={2}>
                  <FastImage
                    source={icons.location}
                    style={styles.smallIcon}
                    resizeMode="contain"
                    tintColor={COLORS.green}
                  />
                  <Text fontSize="sm" color={COLORS.darkGray3}>
                    Location: {activeFarm.location}
                  </Text>
                </HStack>

                <HStack alignItems="center" space={2}>
                  <FastImage
                    source={icons.size}
                    style={styles.smallIcon}
                    resizeMode="contain"
                    tintColor={COLORS.green}
                  />
                  <Text fontSize="sm" color={COLORS.darkGray3}>
                    Size: {activeFarm.size}
                  </Text>
                </HStack>

                <HStack alignItems="center" space={2}>
                  <FastImage
                    source={icons.plant}
                    style={styles.smallIcon}
                    resizeMode="contain"
                    tintColor={COLORS.green}
                  />
                  <Text fontSize="sm" color={COLORS.darkGray3}>
                    animals: {activeFarm.animals.join(', ')}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          ) : (
            <Text>No active farm selected.</Text>
          )}
        </Box>

        <Heading size="md" mb={4}>My Farms</Heading>

        <FlatList
          data={farms}
          renderItem={renderFarmItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ListFooterComponent={
            <Button
              mt={4}
              bg={COLORS.green}
              borderRadius={10}
              leftIcon={
                <FastImage
                  source={icons.plus}
                  style={styles.smallIcon}
                  resizeMode="contain"
                  tintColor="white"
                />
              }
              onPress={navigateToAddFarm}
            >
              Add New Farm
            </Button>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  smallIcon: {
    width: 16,
    height: 16,
  },
});