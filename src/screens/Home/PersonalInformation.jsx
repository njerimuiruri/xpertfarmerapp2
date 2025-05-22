import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Pressable,
  Modal,
  Input,
  Button,
  IconButton,
  useToast,
  Divider,
  Select,
  Spinner
} from 'native-base';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import SecondaryHeader from '../../components/headers/secondary-header';
import { fetchUserProfile, updateUserProfile } from '../../services/personalInfo';

export default function PersonalInformation({ navigation }) {
  const toast = useToast();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectOptions, setSelectOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [userData, setUserData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dob: "",
    residenceCounty: "",
    residenceLocation: "",
    email: "",
    businessNumber: ""
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    const { data, error } = await fetchUserProfile();
    if (data) {
      setUserData({
        firstName: data.firstName || "",
        middleName: data.middleName || "",
        lastName: data.lastName || "",
        gender: data.gender || "",
        dob: data.dob || "",
        residenceCounty: data.residenceCounty || "",
        residenceLocation: data.residenceLocation || "",
        email: data.email || "",
        businessNumber: data.businessNumber || ""
      });
    } else if (error) {
      toast.show({
        description: error,
        placement: "top",
        duration: 3000,
        render: () => (
          <Box bg="red.500" px={6} py={3} rounded="md" mb={5}>
            <Text color="white" fontWeight="medium">Failed to load profile</Text>
          </Box>
        )
      });
    }
    setLoading(false);
  };

  const personalInfoFields = [
    {
      id: 'firstName',
      title: 'First Name',
      value: userData.firstName,
      icon: icons.user,
      editable: true,
      type: 'text'
    },
    {
      id: 'middleName',
      title: 'Middle Name',
      value: userData.middleName,
      icon: icons.user,
      editable: true,
      type: 'text'
    },
    {
      id: 'lastName',
      title: 'Last Name',
      value: userData.lastName,
      icon: icons.user,
      editable: true,
      type: 'text'
    },
    {
      id: 'gender',
      title: 'Gender',
      value: userData.gender,
      icon: icons.people,
      editable: true,
      type: 'select',
      options: ['Male', 'Female']
    },
    {
      id: 'dob',
      title: 'Date of Birth',
      value: userData.dob,
      icon: icons.calendar,
      editable: true,
      type: 'date'
    }
  ];

  const contactInfoFields = [
    {
      id: 'email',
      title: 'Email Address',
      value: userData.email,
      icon: icons.email,
      editable: true,
      type: 'text'
    },
    {
      id: 'businessNumber',
      title: 'Business Number',
      value: userData.businessNumber,
      icon: icons.call,
      editable: true,
      type: 'text'
    }
  ];

  const locationInfoFields = [
    {
      id: 'residenceCounty',
      title: 'Residence County',
      value: userData.residenceCounty,
      icon: icons.addressbook,
      editable: true,
      type: 'select',
      options: ['Nairobi', 'Mombasa', 'Siaya', 'Turkana']
    },
    {
      id: 'residenceLocation',
      title: 'Residence Location',
      value: userData.residenceLocation,
      icon: icons.addressbook,
      editable: true,
      type: 'select',
      options: ['Siaya', 'Turkana']
    }
  ];

  const handleEdit = (field) => {
    setCurrentField(field);
    setEditValue(userData[field.id]);
    if (field.type === 'select') {
      setSelectOptions(field.options || []);
    }
    setEditModalVisible(true);
  };

  const saveChanges = async () => {
    setUpdating(true);
    const updates = {
      [currentField.id]: editValue
    };

    const { data, error } = await updateUserProfile(updates);

    if (data) {
      setUserData({
        ...userData,
        [currentField.id]: editValue
      });

      setEditModalVisible(false);

      toast.show({
        description: "Information updated successfully",
        placement: "top",
        duration: 2000,
        render: () => (
          <Box bg={COLORS.green} px={6} py={3} rounded="md" mb={5}>
            <HStack space={3} alignItems="center">
              <FastImage
                source={icons.check}
                style={{ width: 24, height: 24 }}
                tintColor="white"
              />
              <Text color="white" fontWeight="medium">Updated successfully</Text>
            </HStack>
          </Box>
        )
      });
    } else if (error) {
      toast.show({
        description: error,
        placement: "top",
        duration: 3000,
        render: () => (
          <Box bg="red.500" px={6} py={3} rounded="md" mb={5}>
            <Text color="white" fontWeight="medium">Update failed</Text>
          </Box>
        )
      });
    }
    setUpdating(false);
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderInfoCard = (field, index) => {
    const displayValue = field.type === 'date' ? formatDateDisplay(field.value) : field.value;

    return (
      <Pressable
        key={index}
        onPress={() => field.editable && handleEdit(field)}
      >
        <Box
          bg="white"
          borderRadius={12}
          shadow={1}
          mb={3}
          overflow="hidden"
          borderWidth={1}
          borderColor="#F0F0F0"
        >
          <HStack
            p={4}
            justifyContent="space-between"
            alignItems="center"
          >
            <HStack space={3} alignItems="center" flex={1}>
              <Box
                bg={COLORS.lightGreen}
                p={3}
                borderRadius={10}
              >
                <FastImage
                  source={field.icon}
                  style={styles.fieldIcon}
                  resizeMode="contain"
                  tintColor={COLORS.green}
                />
              </Box>
              <VStack flex={1}>
                <Text fontSize="13" color="#666666">
                  {field.title}
                </Text>
                <Text fontSize="16" fontWeight="600" color="black" mt={0.5}>
                  {displayValue || 'Not set'}
                </Text>
              </VStack>
            </HStack>

            {field.editable && (
              <Pressable
                onPress={() => handleEdit(field)}
                bg={COLORS.lightGreen}
                borderRadius={10}
                p={2.5}
                hitSlop={10}
              >
                <FastImage
                  source={icons.edit || icons.plus}
                  style={styles.editIcon}
                  resizeMode="contain"
                  tintColor={COLORS.green}
                />
              </Pressable>
            )}
          </HStack>
        </Box>
      </Pressable>
    );
  };

  const renderSectionTitle = (title) => (
    <HStack alignItems="center" mb={4} mt={6}>
      <Box flex={1} height="1px" bg="#E0E0E0" />
      <Text px={3} fontSize="15" fontWeight="600" color="#555555">
        {title}
      </Text>
      <Box flex={1} height="1px" bg="#E0E0E0" />
    </HStack>
  );

  const renderEditField = () => {
    if (!currentField) return null;

    if (currentField.type === 'select') {
      return (
        <Select
          selectedValue={editValue}
          onValueChange={setEditValue}
          fontSize="16"
          py={3}
          px={4}
          borderColor="gray.300"
          borderWidth={1}
          borderRadius={10}
          bg="white"
          _focus={{
            borderColor: COLORS.green,
            backgroundColor: "white"
          }}
        >
          {selectOptions.map((option) => (
            <Select.Item key={option} label={option} value={option} />
          ))}
        </Select>
      );
    }

    return (
      <Input
        value={editValue}
        onChangeText={setEditValue}
        fontSize="16"
        py={3}
        px={4}
        borderColor="gray.300"
        borderWidth={1}
        borderRadius={10}
        bg="white"
        autoFocus
        keyboardType={currentField.id === 'businessNumber' ? 'phone-pad' :
          currentField.id === 'email' ? 'email-address' : 'default'}
        _focus={{
          borderColor: COLORS.green,
          backgroundColor: "white"
        }}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader title="Personal Information" />
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" color={COLORS.green} />
          <Text mt={4} fontSize="16" color="gray.500">Loading profile...</Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Personal Information" />
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <Box
          bg="white"
          borderRadius={16}
          overflow="hidden"
          shadow={2}
          mb={6}
        >
          <Box
            height={70}
            bg={{
              linearGradient: {
                colors: [COLORS.green, COLORS.lightGreen],
                start: [0, 0],
                end: [1, 0]
              }
            }}
          />

          <Box
            alignItems="center"
            mt={-50}
            pb={6}
            px={4}
          >
            <Box
              bg="white"
              width={100}
              height={100}
              borderRadius={50}
              justifyContent="center"
              alignItems="center"
              borderWidth={4}
              borderColor="white"
              shadow={3}
              mb={3}
              backgroundColor={COLORS.lightGreen}
            >
              <FastImage
                source={require('../../assets/images/profile-avatar.png')}
                style={{ width: 90, height: 90, borderRadius: 45 }}
                resizeMode="cover"
              />
            </Box>

            <Text fontSize="22" fontWeight="700" mb={1}>
              {userData.firstName} {userData.lastName}
            </Text>

            <HStack space={2} mb={4} alignItems="center">
              <FastImage
                source={icons.location || icons.addressbook}
                style={{ width: 16, height: 16 }}
                tintColor={COLORS.green}
              />
              <Text fontSize="14" color="gray.500">
                {userData.residenceCounty} County
              </Text>
            </HStack>

            <HStack space={4}>
              <VStack alignItems="center">
                <Text fontSize="20" fontWeight="700" color={COLORS.green}>
                  {userData.gender || 'N/A'}
                </Text>
                <Text fontSize="12" color="gray.500">Gender</Text>
              </VStack>

              <Divider orientation="vertical" mx={2} bg="gray.200" />

              <VStack alignItems="center">
                <Text fontSize="20" fontWeight="700" color={COLORS.green}>
                  Farmer
                </Text>
                <Text fontSize="12" color="gray.500">Occupation</Text>
              </VStack>
            </HStack>
          </Box>
        </Box>

        {renderSectionTitle('PERSONAL DETAILS')}
        <VStack space={0}>
          {personalInfoFields.map(renderInfoCard)}
        </VStack>

        {renderSectionTitle('CONTACT INFORMATION')}
        <VStack space={0}>
          {contactInfoFields.map(renderInfoCard)}
        </VStack>

        {renderSectionTitle('LOCATION DETAILS')}
        <VStack space={0}>
          {locationInfoFields.map(renderInfoCard)}
        </VStack>
      </ScrollView>

      {/* Edit Modal */}
      <Modal isOpen={editModalVisible} onClose={() => setEditModalVisible(false)}>
        <Modal.Content width="90%" maxWidth={400} borderRadius={16} overflow="hidden">
          <Box
            bg={{
              linearGradient: {
                colors: [COLORS.green, COLORS.lightGreen],
                start: [0, 0],
                end: [1, 0]
              }
            }}
            py={3}
            px={4}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <Text color="white" fontWeight="bold" fontSize="16">
                {currentField && `Edit ${currentField.title}`}
              </Text>
              <IconButton
                icon={
                  <FastImage
                    source={icons.close}
                    style={{ width: 20, height: 20 }}
                    tintColor="white"
                  />
                }
                borderRadius="full"
                onPress={() => setEditModalVisible(false)}
                _pressed={{ bg: 'rgba(255,255,255,0.2)' }}
              />
            </HStack>
          </Box>

          <Modal.Body py={6} px={5}>
            <VStack space={4}>
              <Text fontSize="14" color="gray.600">
                Enter new {currentField?.title.toLowerCase()}:
              </Text>
              {renderEditField()}
            </VStack>
          </Modal.Body>

          <Modal.Footer borderTopWidth={0} px={5} pb={5} pt={0}>
            <HStack space={3} width="100%">
              <Button
                flex={1}
                variant="outline"
                borderColor={COLORS.green}
                _text={{ color: COLORS.green }}
                onPress={() => setEditModalVisible(false)}
                borderRadius={10}
                py={3}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                flex={1}
                bg={COLORS.green}
                _text={{ color: "white", fontWeight: "600" }}
                onPress={saveChanges}
                borderRadius={10}
                py={3}
                _pressed={{ bg: COLORS.green + "E6" }}
                disabled={updating}
                isLoading={updating}
                isLoadingText="Saving..."
              >
                Save
              </Button>
            </HStack>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7'
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  fieldIcon: {
    width: 20,
    height: 20,
  },
  editIcon: {
    width: 18,
    height: 18,
  }
});