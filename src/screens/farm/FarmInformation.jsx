import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box, Text, VStack, HStack, ScrollView, Pressable,
  IconButton, Heading, Button, FlatList, Spinner, Center,
  Input, Select, CheckIcon, AlertDialog, useToast
} from 'native-base';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';
import { getUserFarms, deleteFarm } from '../../services/farm';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FarmDetailsModal from './FarmDetailsModal';

export default function FarmInformation() {
  const [farms, setFarms] = useState([]);
  const [filteredFarms, setFilteredFarms] = useState([]);
  const [activeFarm, setActiveFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [farmToDelete, setFarmToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  // New state for details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);

  const route = useRoute();
  const navigation = useNavigation();
  const cancelRef = useRef(null);
  const toast = useToast();

  const fetchFarms = async () => {
    setLoading(true);
    const { data } = await getUserFarms();

    if (data) {
      const storedActive = JSON.parse(await AsyncStorage.getItem('activeFarm') || '{}');
      const formatted = data.map((f) => ({
        id: f.id,
        name: f.name,
        location: f.administrativeLocation,
        county: f.county,
        ownership: f.ownership,
        size: `${f.size} acres`,
        sizeNumber: f.size,
        animals: Array.isArray(f.farmingTypes) ? f.farmingTypes : [],
        isActive: f.id === storedActive?.id,
      }));

      setFarms(formatted);
      setActiveFarm(formatted.find(f => f.isActive) || formatted[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    let filtered = [...farms];

    if (searchQuery.trim()) {
      filtered = filtered.filter(farm =>
        farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farm.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        farm.animals.some(animal =>
          animal.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (filterBy === 'active') {
      filtered = filtered.filter(farm => farm.isActive);
    } else if (filterBy === 'inactive') {
      filtered = filtered.filter(farm => !farm.isActive);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.sizeNumber - a.sizeNumber;
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    setFilteredFarms(filtered);
  }, [farms, searchQuery, sortBy, filterBy]);

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

  // New function to handle showing farm details
  const handleShowDetails = (farm) => {
    setSelectedFarm(farm);
    setShowDetailsModal(true);
  };

  // New function to handle setting active farm from modal
  const handleSetActiveFarmFromModal = async (farm) => {
    await handleFarmSelect(farm);
  };

  const handleDeleteConfirm = (farm) => {
    setFarmToDelete(farm);
    setIsDeleteOpen(true);
  };

  const handleDeleteFarm = async () => {
    if (!farmToDelete) return;

    try {
      setDeleting(true);
      await deleteFarm(farmToDelete.id);

      const currentActive = JSON.parse(await AsyncStorage.getItem('activeFarm') || '{}');
      if (currentActive?.id === farmToDelete.id) {
        await AsyncStorage.removeItem('activeFarm');
      }

      toast.show({
        description: `Farm "${farmToDelete.name}" deleted successfully`,
        placement: "top",
        duration: 2000,
        backgroundColor: "green.500",
      });

      fetchFarms();
    } catch (err) {
      toast.show({
        description: typeof err === 'string' ? err : 'Failed to delete farm',
        placement: "top",
        duration: 3000,
        backgroundColor: "red.500",
      });
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
      setFarmToDelete(null);
    }
  };

  const navigateToEditFarm = (farm) => {
    navigation.navigate('EditFarm', { farm, refresh: true });
  };

  const navigateToAddFarm = () => {
    navigation.navigate('AddFarm');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('name');
    setFilterBy('all');
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
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack space={1} flex={1} pr={2}>
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

          <VStack alignItems="flex-end" space={2} minW="70px">
            {item.isActive && (
              <Box bg={COLORS.green} px={2} py={1} borderRadius={4}>
                <Text fontSize="xs" color="white">Active</Text>
              </Box>
            )}

            {/* Updated Action Buttons */}
            <VStack space={1}>
              {/* First Row of Buttons */}
              <HStack space={1}>
                <IconButton
                  icon={
                    <FastImage
                      source={icons.eye || icons.agriculture}
                      style={styles.actionIcon}
                      resizeMode="contain"
                      tintColor={COLORS.blue || COLORS.green}
                    />
                  }
                  borderRadius="full"
                  bg="blue.50"
                  _pressed={{ bg: "blue.100" }}
                  onPress={() => handleShowDetails(item)}
                  size="sm"
                />
                <IconButton
                  icon={
                    <FastImage
                      source={icons.edit}
                      style={styles.actionIcon}
                      resizeMode="contain"
                      tintColor={COLORS.green}
                    />
                  }
                  borderRadius="full"
                  bg="green.50"
                  _pressed={{ bg: "green.100" }}
                  onPress={() => navigateToEditFarm(item)}
                  size="sm"
                />
              </HStack>

              {/* Second Row */}
              <HStack space={1} justifyContent="center">
                <IconButton
                  icon={
                    <FastImage
                      source={icons.remove || icons.trash}
                      style={styles.actionIcon}
                      resizeMode="contain"
                      tintColor="#FF4444"
                    />
                  }
                  borderRadius="full"
                  bg="red.50"
                  _pressed={{ bg: "red.100" }}
                  onPress={() => handleDeleteConfirm(item)}
                  size="sm"
                />
              </HStack>
            </VStack>
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
                <HStack space={2}>
                  <IconButton
                    icon={
                      <FastImage
                        source={icons.eye || icons.agriculture}
                        style={styles.smallIcon}
                        resizeMode="contain"
                        tintColor={COLORS.blue || COLORS.green}
                      />
                    }
                    borderRadius="full"
                    bg="blue.50"
                    _pressed={{ bg: "blue.100" }}
                    onPress={() => handleShowDetails(activeFarm)}
                    size="sm"
                  />
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
                    bg="green.50"
                    _pressed={{ bg: "green.100" }}
                    onPress={() => navigateToEditFarm(activeFarm)}
                    size="sm"
                  />
                  <IconButton
                    icon={
                      <FastImage
                        source={icons.remove || icons.trash}
                        style={styles.smallIcon}
                        resizeMode="contain"
                        tintColor="#FF4444"
                      />
                    }
                    borderRadius="full"
                    bg="red.50"
                    _pressed={{ bg: "red.100" }}
                    onPress={() => handleDeleteConfirm(activeFarm)}
                    size="sm"
                  />
                </HStack>
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
            <Box bg="white" borderRadius={10} p={4} shadow={1}>
              <Text color={COLORS.darkGray3} textAlign="center">No active farm selected.</Text>
            </Box>
          )}
        </Box>

        {/* Search and Filter Section */}
        <VStack space={4} mb={4}>
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="md">My Farms ({filteredFarms.length})</Heading>
            {(searchQuery || sortBy !== 'name' || filterBy !== 'all') && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="gray"
                onPress={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </HStack>

          <Input
            placeholder="Search farms by name, location, or animals..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            InputLeftElement={
              <Box ml={2}>
                <FastImage
                  source={icons.search || icons.agriculture}
                  style={styles.smallIcon}
                  resizeMode="contain"
                  tintColor={COLORS.gray}
                />
              </Box>
            }
            bg="white"
            borderRadius={10}
          />

          <HStack space={3}>
            <Box flex={1}>
              <Text fontSize="sm" mb={1} color={COLORS.darkGray3}>Sort by:</Text>
              <Select
                selectedValue={sortBy}
                onValueChange={setSortBy}
                _selectedItem={{
                  bg: COLORS.lightGreen,
                  endIcon: <CheckIcon size="5" />
                }}
                bg="white"
              >
                <Select.Item label="Name (A-Z)" value="name" />
                <Select.Item label="Size (Largest)" value="size" />
                <Select.Item label="Location (A-Z)" value="location" />
              </Select>
            </Box>

            <Box flex={1}>
              <Text fontSize="sm" mb={1} color={COLORS.darkGray3}>Filter:</Text>
              <Select
                selectedValue={filterBy}
                onValueChange={setFilterBy}
                _selectedItem={{
                  bg: COLORS.lightGreen,
                  endIcon: <CheckIcon size="5" />
                }}
                bg="white"
              >
                <Select.Item label="All Farms" value="all" />
                <Select.Item label="Active Only" value="active" />
                <Select.Item label="Inactive Only" value="inactive" />
              </Select>
            </Box>
          </HStack>
        </VStack>

        {filteredFarms.length === 0 ? (
          <Center py={8}>
            <Text color={COLORS.darkGray3} textAlign="center">
              {searchQuery || filterBy !== 'all'
                ? "No farms match your search criteria"
                : "No farms found"
              }
            </Text>
          </Center>
        ) : (
          <FlatList
            data={filteredFarms}
            renderItem={renderFarmItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            refreshing={loading}
            onRefresh={fetchFarms}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Button
          mt={4}
          bg={COLORS.green}
          borderRadius={10}
          onPress={navigateToAddFarm}
          _text={{ fontSize: "md", fontWeight: "bold" }}
          py={4}
          _pressed={{
            bg: COLORS.green3,
            opacity: 0.9
          }}
        >
          Add New Farm
        </Button>

      </ScrollView>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialog.Content borderRadius={16}>
          <AlertDialog.CloseButton />
          <AlertDialog.Header borderBottomWidth={0} pb={2}>
            <HStack alignItems="center" space={2}>
              <FastImage
                source={icons.warning || icons.alert}
                style={styles.warningIcon}
                resizeMode="contain"
                tintColor="#FF4444"
              />
              <Text fontSize="lg" fontWeight="bold" color="red.500">
                Delete Farm
              </Text>
            </HStack>
          </AlertDialog.Header>
          <AlertDialog.Body pt={0}>
            <VStack space={3}>
              <Text fontSize="md" color="gray.600">
                Are you sure you want to delete
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="black" textAlign="center">
                "{farmToDelete?.name}"?
              </Text>
              <Text fontSize="sm" color="red.500" textAlign="center">
                This action cannot be undone and all farm data will be permanently removed.
              </Text>
              {farmToDelete?.isActive && (
                <Box bg="orange.100" p={3} borderRadius={8}>
                  <Text fontSize="sm" color="orange.700" textAlign="center">
                    This is your active farm. Deleting it will require you to select a new active farm.
                  </Text>
                </Box>
              )}
            </VStack>
          </AlertDialog.Body>
          <AlertDialog.Footer borderTopWidth={0} pt={4}>
            <Button.Group space={3} flex={1}>
              <Button
                variant="ghost"
                onPress={() => setIsDeleteOpen(false)}
                ref={cancelRef}
                flex={1}
                py={3}
                _text={{ color: "gray.600", fontWeight: "medium" }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="danger"
                onPress={handleDeleteFarm}
                isLoading={deleting}
                flex={1}
                py={3}
                _text={{ fontWeight: "bold" }}
                borderRadius={8}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>

      {/* Farm Details Modal */}
      <FarmDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        farm={selectedFarm}
        onEdit={navigateToEditFarm}
        onDelete={handleDeleteConfirm}
        onSetActive={handleSetActiveFarmFromModal}
      />
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
  actionIcon: {
    width: 14,
    height: 14,
  },
  warningIcon: {
    width: 24,
    height: 24,
  },
  headerIcon: {
    width: 20,
    height: 20,
  },
  detailIcon: {
    width: 16,
    height: 16,
  },
  buttonIcon: {
    width: 14,
    height: 14,
  },
});