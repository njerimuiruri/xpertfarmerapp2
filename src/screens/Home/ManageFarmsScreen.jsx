import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  FlatList,
  Button,
  Pressable,
  Center,
} from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import SecondaryHeader from '../../components/headers/secondary-header';

export default function ManageFarmsScreen({ navigation }) {
  const [farms, setFarms] = useState([
    {
      id: '1',
      farmName: "Green Valley Farm",
      county: "Nairobi",
      adminLocation: "Westlands",
      farmSize: "15",
      ownership: "Freehold",
      productionTypes: ["Dairy cattle", "Poultry"],
      isActive: true
    },
    {
      id: '2',
      farmName: "Sunrise Ranch",
      county: "Nakuru",
      adminLocation: "Molo",
      farmSize: "25",
      ownership: "Leasehold",
      productionTypes: ["Beef cattle", "Sheep"],
      isActive: false
    },
    {
      id: '3',
      farmName: "Highland Dairy",
      county: "Kiambu",
      adminLocation: "Limuru",
      farmSize: "8",
      ownership: "Freehold",
      productionTypes: ["Dairy cattle"],
      isActive: false
    }
  ]);

  const switchActiveFarm = (id) => {
    setFarms(farms.map(farm => ({
      ...farm,
      isActive: farm.id === id
    })));
  };

  const renderFarmCard = ({ item }) => (
    <Pressable onPress={() => switchActiveFarm(item.id)}>
      <Box 
        bg="white" 
        borderRadius={12} 
        my={2} 
        p={4} 
        shadow={2}
        borderLeftWidth={4}
        borderLeftColor={item.isActive ? COLORS.green : 'transparent'}
      >
        <HStack space={4} alignItems="center">
          <Center 
            bg={COLORS.lightGreen} 
            size={14} 
            borderRadius={12}
          >
            <FastImage
              source={icons.home}
              style={styles.farmIcon}
              resizeMode="contain"
              tintColor={COLORS.green}
            />
          </Center>
          
          <VStack flex={1}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="bold" color="black">{item.farmName}</Text>
              {item.isActive && (
                <Box bg={COLORS.green} px={2} py={1} borderRadius={4}>
                  <Text fontSize="xs" color="white" fontWeight="bold">Active</Text>
                </Box>
              )}
            </HStack>
            
            <Text fontSize="sm" color={COLORS.darkGray3}>{item.county}, {item.adminLocation}</Text>
            <Text fontSize="sm" color={COLORS.darkGray3}>{item.farmSize} acres • {item.ownership}</Text>
            <Text fontSize="sm" color={COLORS.darkGray3} mt={1}>
              {item.productionTypes.join(", ")}
            </Text>
          </VStack>

          <TouchableOpacity onPress={() => navigation.navigate('EditFarmScreen', { farm: item })}>
            <FastImage
              source={icons.submited}
              style={styles.editIcon}
              tintColor={COLORS.green}
            />
          </TouchableOpacity>
        </HStack>
      </Box>
    </Pressable>
  );

  return (
    <Box flex={1} bg={COLORS.lightGreen}>
      <SecondaryHeader title="Manage Farms" />
      
      <Box flex={1} px={4} pt={4}>
        <Text fontSize="md" fontWeight="600" color={COLORS.darkGray3} mb={2}>
          Your Farms ({farms.length})
        </Text>
        
        <FlatList
          data={farms}
          renderItem={renderFarmCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </Box>
      
      <Center position="absolute" bottom={6} width="100%">
        <Button 
          bg={COLORS.green} 
          width="80%" 
          borderRadius={30} 
          shadow={3}
          leftIcon={<FastImage source={icons.plus} style={styles.btnIcon} tintColor="white" />}
          _text={{ color: "white", fontWeight: "bold" }}
          // onPress={() => navigation.navigate('AddFarmScreen')}  
        >
          Add New Farm
        </Button>
      </Center>
    </Box>
  );
}

const styles = StyleSheet.create({
  farmIcon: {
    width: 24,
    height: 24,
  },
  editIcon: {
    width: 22,
    height: 22,
  },
  btnIcon: {
    width: 16,
    height: 16,
  }
});