import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Center,
  Image,
  Button,
  Divider,
  ScrollView,
} from 'native-base';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import { TouchableOpacity, StyleSheet } from 'react-native';

export default function ProfileScreen({ navigation }) {
  const farmData = {
    farmName: "Green Valley Farm",
    county: "Nairobi",
    adminLocation: "Westlands",
    farmSize: "15",
    ownership: "Freehold",
    productionTypes: ["Dairy cattle", "Poultry", "Sheep"],
    ownerName: "Jane Doe",
    gender: "Female",
    ageGroup: "41-50",
    yearsOfFarming: "12",
    phoneNumber: "0707625331",
    businessContact: "0789123456",
    email: "support@yahoo.com"
  };

  return (
    <Box flex={1} bg={COLORS.lightGreen}>
      <Box 
        bg={COLORS.green2} 
        h={200} 
        borderBottomLeftRadius={200} 
        borderBottomRightRadius={200} 
        position="relative"
        zIndex={1}
      >
        <HStack alignItems="center" justifyContent="space-between" px={4} mt={8}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FastImage
              source={icons.backarrow}
              style={styles.headerIcon}
              resizeMode="contain"
              tintColor="white"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <FastImage
              source={icons.settings}
              style={styles.headerIcon}
              resizeMode="contain"
              tintColor="white"
            />
          </TouchableOpacity>
        </HStack>
        
        <VStack mt={6} alignItems="center" space={1}>
          <Text fontSize="xl" fontWeight="bold" color="white">
            {farmData.farmName}
          </Text>
          <Text fontSize="sm" color="white" opacity={0.9}>
            {farmData.productionTypes.join(", ")}
          </Text>
        </VStack>
      </Box>
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingTop: 80 }} 
        zIndex={1}
      >
        <Box mx={4} mt={6} bg="white" borderRadius={16} p={4} shadow={2}>
          <Text fontSize="lg" fontWeight="bold" color={COLORS.green2} mb={3}>Farm Details</Text>
          
          <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.lightGreen} py={3}>
            <Text fontSize="md" color={COLORS.darkGray3}>County</Text>
            <Text fontSize="md" color="black">{farmData.county}</Text>
          </HStack>
          
          <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.lightGreen} py={3}>
            <Text fontSize="md" color={COLORS.darkGray3}>Location</Text>
            <Text fontSize="md" color="black">{farmData.adminLocation}</Text>
          </HStack>
          
          <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.lightGreen} py={3}>
            <Text fontSize="md" color={COLORS.darkGray3}>Farm Size</Text>
            <Text fontSize="md" color="black">{farmData.farmSize} acres</Text>
          </HStack>
          
          <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.lightGreen} py={3}>
            <Text fontSize="md" color={COLORS.darkGray3}>Ownership</Text>
            <Text fontSize="md" color="black">{farmData.ownership}</Text>
          </HStack>
        </Box>
        
        <Box mx={4} mt={4} bg="white" borderRadius={16} p={4} shadow={2} mb={6}>
          <Text fontSize="lg" fontWeight="bold" color={COLORS.green2} mb={3}>Owner Details</Text>
          
          <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.lightGreen} py={3}>
            <Text fontSize="md" color={COLORS.darkGray3}>Name</Text>
            <Text fontSize="md" color="black">{farmData.ownerName}</Text>
          </HStack>
          
          <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.lightGreen} py={3}>
            <Text fontSize="md" color={COLORS.darkGray3}>Phone Number</Text>
            <Text fontSize="md" color="black">{farmData.phoneNumber}</Text>
          </HStack>
          
          <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.lightGreen} py={3}>
            <Text fontSize="md" color={COLORS.darkGray3}>Business Contact</Text>
            <Text fontSize="md" color="black">{farmData.businessContact}</Text>
          </HStack>
          
          <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.lightGreen} py={3}>
            <Text fontSize="md" color={COLORS.darkGray3}>Email</Text>
            <Text fontSize="md" color="black">{farmData.email}</Text>
          </HStack>
          
          <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.lightGreen} py={3}>
            <Text fontSize="md" color={COLORS.darkGray3}>Age Group</Text>
            <Text fontSize="md" color="black">{farmData.ageGroup}</Text>
          </HStack>
          
          <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.lightGreen} py={3}>
            <Text fontSize="md" color={COLORS.darkGray3}>Years of Farming</Text>
            <Text fontSize="md" color="black">{farmData.yearsOfFarming} years</Text>
          </HStack>
        </Box>
        
       
      </ScrollView>
      <Center mb={6}>
          <HStack space={4} justifyContent="center" width="80%">
            <Button 
              bg={COLORS.green} 
              width="48%" 
              borderRadius={30} 
              shadow={3}
              _text={{ color: "white", fontWeight: "bold" }}
              onPress={() => navigation.navigate('EditFarmScreen')}
            >
              Edit Farm Profile
            </Button>
            <Button 
              variant="outline" 
              borderColor={COLORS.green}
              width="48%" 
              borderRadius={30} 
              _text={{ color: COLORS.green, fontWeight: "bold" }}
              onPress={() => navigation.navigate('ManageFarmsScreen')}
            >
              Manage Farm
            </Button>
          </HStack>
        </Center>
      <Box 
        position="absolute" 
        top={160} 
        left="50%" 
        style={{ transform: [{ translateX: -60 }] }}
        zIndex={10}
      >
        <Image
          source={require('../../assets/images/profile-avatar.png')}
          style={styles.profileImage}
          alt="Farmer Profile Image"
        />
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    width: 35,
    height: 35,
    padding: 3,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "white",
    backgroundColor: COLORS.lightGreen,
  },
});