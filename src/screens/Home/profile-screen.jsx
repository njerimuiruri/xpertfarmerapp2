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
} from 'native-base';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import { TouchableOpacity } from 'react-native';

export default function ProfileScreen({ navigation }) {
  return (
    <Box flex={1} bg="white">
      <Box bg={COLORS.green2} h={200} borderBottomLeftRadius={200} borderBottomRightRadius={200} position="relative">
        <HStack alignItems="center" justifyContent="space-between" px={4} mt={8}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FastImage
              source={icons.backarrow}
              className="w-[35px] h-[35px] p-3"
              resizeMode="contain"
              tintColor="white"
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <FastImage
              source={icons.settings}
              className="w-[30px] h-[30px] p-3"
              resizeMode="contain"
              tintColor="white"
            />
          </TouchableOpacity>
        </HStack>

        <Center mt={8}>
          <Text fontSize="md" fontWeight="bold" color="white">
            Farmer Profile
          </Text>
        </Center>
      </Box>

      <Center mt={-50}>
        <Image
          source={require('../../assets/images/profile-avatar.png')}
          style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: "white" }}
          alt="Farmer Profile Image"
        />
      </Center>
      
      <VStack mt={4} alignItems="center">
        <Text fontSize="xl" fontWeight="bold" color="black">Jane Doe</Text>
        <Text fontSize="sm" color={COLORS.darkGray3}>Experienced Farmer</Text>
      </VStack>

      <VStack mt={6} px={4} space={4}>
        <Text fontSize="lg" fontWeight="bold" color={COLORS.green2}>Farmer Details</Text>
        
        <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.green2} py={3}>
          <Text fontSize="md" color={COLORS.darkGray3}>Phone number</Text>
          <Text fontSize="md" color="black">0707625331</Text>
        </HStack>

        <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.green2} py={3}>
          <Text fontSize="md" color={COLORS.darkGray3}>Email Address</Text>
          <Text fontSize="md" color="black">support@yahoo.com</Text>
        </HStack>
        
        <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.green2} py={3}>
          <Text fontSize="md" color={COLORS.darkGray3}>Years of Experience</Text>
          <Text fontSize="md" color="black">12 years</Text>
        </HStack>

        <HStack justifyContent="space-between" borderBottomWidth={1} borderBottomColor={COLORS.green2} py={3}>
          <Text fontSize="md" color={COLORS.darkGray3}>Specialization</Text>
          <Text fontSize="md" color="black">Organic Farming</Text>
        </HStack>
      </VStack>
      
      
     

      <Center flex={1} justifyContent="flex-end" mb={8}>
        <Button bg={COLORS.green2} width="60%" borderRadius={25} _text={{ color: "white", fontWeight: "bold" }}>
          Edit Profile
        </Button>
      </Center>
    </Box>
  );
}