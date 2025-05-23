import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Text, VStack, HStack, ScrollView, Pressable,
  IconButton, Heading, Button, FlatList, Spinner, Center
} from 'native-base';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';
import { getUserFarms, deleteFarm } from '../../services/farm';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FarmInformation() {
  const [farms, setFarms] = useState([]);
  const [activeFarm, setActiveFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  const route = useRoute();
  const navigation = useNavigation();

  const fetchFarms = async () => {
    setLoading(true);
    const { data } = await getUserFarms();

    if (data) {
      const storedActive = JSON.parse(await AsyncStorage.getItem('activeFarm') || '{}');
      const formatted = data.map((f) => ({
        id: f.id,
        name: f.name,
        location: f.administrativeLocation,
        size: `${f.size} acres`,
        animals: Array.isArray(f.farmingTypes) ? f.farmingTypes : [],
        isActive: f.id === storedActive?.id,
      }));

      setFarms(formatted);
      setActiveFarm(formatted.find(f => f.isActive) || formatted[0]);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchFarms();
    }, [route.params?.refresh])
  );

  useEffect(() => {
    if (route.params?.refresh) {
      navigation.setParams({ refresh: false });
    }
  }, [route.params]);

  const handleFarmSelect = async (farm) => {
    if (farm.id === activeFarm?.id) return;

    setFarms(prev => prev.map(f => ({ ...f, isActive: f.id === farm.id })));
    setActiveFarm(farm);

    await AsyncStorage.setItem('activeFarm', JSON.stringify(farm));
  };

  const handleDeleteFarm = async (farmId) => {
    await deleteFarm(farmId);
    const currentActive = JSON.parse(await AsyncStorage.getItem('activeFarm'));
    if (currentActive?.id === farmId) {
      await AsyncStorage.removeItem('activeFarm');
    }
    fetchFarms();
  };

  const navigateToEditFarm = (farm) => {
    navigation.navigate('EditFarm', { farm, refresh: true });
  };

  const navigateToAddFarm = () => {
    navigation.navigate('AddFarm');
  };

  const renderFarmItem = ({ item }) => (
    <Pressable onPress={() => handleFarmSelect(item)} mb={3}>
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
              Animals: {Array.isArray(item.animals) ? item.animals.join(', ') : 'N/A'}
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader title="Farm Information" />
        <StatusBar translucent backgroundColor={COLORS.green2} animated barStyle={'light-content'} />
        <Center flex={1}>
          <Spinner size="lg" color={COLORS.green} />
        </Center>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Farm Information" />
      <StatusBar translucent backgroundColor={COLORS.green2} animated barStyle={'light-content'} />

      <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
        <Box mb={6}>
          <Heading size="md" mb={4}>Active Farm</Heading>
          {activeFarm ? (
            <Box bg={COLORS.lightGreen} borderRadius={10} p={4} shadow={2}>
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
                <Text fontSize="sm" color={COLORS.darkGray3}>Location: {activeFarm.location}</Text>
                <Text fontSize="sm" color={COLORS.darkGray3}>Size: {activeFarm.size}</Text>
                <Text fontSize="sm" color={COLORS.darkGray3}>
                  Animals: {Array.isArray(activeFarm.animals) ? activeFarm.animals.join(', ') : 'N/A'}
                </Text>
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
          refreshing={loading}
          onRefresh={fetchFarms}
          ListFooterComponent={
            <Button
              mt={4}
              bg={COLORS.green}
              borderRadius={10}
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
  smallIcon: {
    width: 16,
    height: 16,
  },
});
