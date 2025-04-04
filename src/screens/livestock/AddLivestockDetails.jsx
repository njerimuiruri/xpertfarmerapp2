import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  ScrollView,
  HStack,
  Radio,
  Modal,
  Select,
  CheckIcon,
  FormControl,
  Divider,
  IconButton,
  Pressable,
  Icon,
  useToast
} from "native-base";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import SecondaryHeader from "../../components/headers/secondary-header";
import { COLORS } from "../../constants/theme";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddLivestockScreen({ navigation }) {
  const toast = useToast();
  
  const [livestockType, setLivestockType] = useState("");
  
  // For mammals (cattle, goats, sheep, rabbit, swine)
  const [mammalFormData, setMammalFormData] = useState({
    idNumber: "",
    breedType: "",
    phenotype: "",
    dateOfBirth: new Date(),
    gender: "",
    sireId: "",
    sireCode: "",
    damId: "",
    damCode: "",
    birthWeight: "",
  });
  
  // For poultry
  const [poultryFormData, setPoultryFormData] = useState({
    flockId: "",
    dateOfStocking: new Date(),
    gender: "Mixed",
    initialQuantity: "",
    breedType: "",
    sourceOfBirds: "",
    initialAverageWeight: "",
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerFor, setDatePickerFor] = useState("mammal"); 
  
  const [showModal, setShowModal] = useState(false);

  const livestockTypes = [
    { label: "Dairy Cattle", value: "dairyCattle" },
    { label: "Beef Cattle", value: "beefCattle" },
    { label: "Dairy Goats", value: "dairyGoats" },
    { label: "Meat Goats", value: "meatGoats" },
    { label: "Sheep", value: "sheep" },
    { label: "Rabbit", value: "rabbit" },
    { label: "Pig (Swine)", value: "swine" },
    { label: "Poultry", value: "poultry" },
  ];
  
  const breedOptions = {
    dairyCattle: ["Holstein", "Jersey", "Guernsey", "Ayrshire", "Brown Swiss"],
    beefCattle: ["Angus", "Hereford", "Simmental", "Charolais", "Brahman"],
    dairyGoats: ["Alpine", "Saanen", "Toggenburg", "LaMancha", "Nubian"],
    meatGoats: ["Boer", "Kiko", "Spanish", "Myotonic", "Savanna"],
    sheep: ["Merino", "Suffolk", "Dorper", "Romney", "Corriedale"],
    rabbit: ["New Zealand White", "Californian", "Flemish Giant", "Rex", "Angora"],
    swine: ["Duroc", "Yorkshire", "Hampshire", "Berkshire", "Landrace"],
    poultry: ["Broiler", "Layer", "Dual Purpose", "Indigenous", "Turkey", "Duck", "Quail"],
  };
  
  const phenotypeOptions = {
    cattle: ["Black", "White", "Brown", "Spotted", "Red", "Mixed"],
    goats: ["White", "Black", "Brown", "Multi-colored", "Grey"],
    sheep: ["White", "Black", "Brown", "Spotted", "Grey"],
    rabbit: ["White", "Black", "Grey", "Brown", "Spotted"],
    swine: ["White", "Black", "Pink", "Spotted", "Red"],
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || (datePickerFor === 'mammal' ? mammalFormData.dateOfBirth : poultryFormData.dateOfStocking);
    setShowDatePicker(false);
    
    if (datePickerFor === 'mammal') {
      setMammalFormData({...mammalFormData, dateOfBirth: currentDate});
    } else {
      setPoultryFormData({...poultryFormData, dateOfStocking: currentDate});
    }
  };
  
  const formatDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  // Show date picker
  const showDatePickerModal = (type) => {
    setDatePickerFor(type);
    setShowDatePicker(true);
  };

  // Reset form based on livestock type
  useEffect(() => {
    setMammalFormData({
      idNumber: "",
      breedType: "",
      phenotype: "",
      dateOfBirth: new Date(),
      gender: "",
      sireId: "",
      sireCode: "",
      damId: "",
      damCode: "",
      birthWeight: "",
    });
    
    setPoultryFormData({
      flockId: "",
      dateOfStocking: new Date(),
      gender: "Mixed",
      initialQuantity: "",
      breedType: "",
      sourceOfBirds: "",
      initialAverageWeight: "",
    });
  }, [livestockType]);



  // Handle submit
  const handleSubmit = () => {
    
      setShowModal(true);
    
  };

  const getPhenotypeOptions = () => {
    if (livestockType.includes("Cattle")) {
      return phenotypeOptions.cattle;
    } else if (livestockType.includes("Goats")) {
      return phenotypeOptions.goats;
    } else if (livestockType === "sheep") {
      return phenotypeOptions.sheep;
    } else if (livestockType === "rabbit") {
      return phenotypeOptions.rabbit;
    } else if (livestockType === "swine") {
      return phenotypeOptions.swine;
    }
    return [];
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Add Livestock" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={4} my={4}>
          <Text style={styles.titleText}>Livestock Registration Form</Text>
          <Divider my={2} />
          
          <FormControl isRequired mb={4}>
            <FormControl.Label _text={styles.label}>Livestock Type</FormControl.Label>
            <Select
              selectedValue={livestockType}
              minWidth="200"
              placeholder="Select Livestock Type"
              _selectedItem={{
                bg: COLORS.lightGreen,
                endIcon: <CheckIcon size="5" />
              }}
              onValueChange={(value) => setLivestockType(value)}
              backgroundColor={COLORS.lightGreen}
            >
              {livestockTypes.map((type) => (
                <Select.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Select>
          </FormControl>

          {livestockType && (
            <Box>
              {/* Mammals Form */}
              {livestockType !== "poultry" && (
                <VStack space={4}>
                  <Text fontSize={16} fontWeight="bold" color={COLORS.darkGray3} mt={2}>
                    Animal Details
                  </Text>
                  
                  <FormControl isRequired>
                    <FormControl.Label _text={styles.label}>ID Number</FormControl.Label>
                    <Input
                      value={mammalFormData.idNumber}
                      onChangeText={(value) =>
                        setMammalFormData((prev) => ({ ...prev, idNumber: value }))
                      }
                      placeholder="Enter ID Number"
                      backgroundColor={COLORS.lightGreen}
                      borderColor="gray.200"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label _text={styles.label}>Breed Type</FormControl.Label>
                    <Select
                      selectedValue={mammalFormData.breedType}
                      placeholder="Select Breed Type"
                      _selectedItem={{
                        bg: COLORS.lightGreen,
                        endIcon: <CheckIcon size="5" />
                      }}
                      onValueChange={(value) =>
                        setMammalFormData((prev) => ({ ...prev, breedType: value }))
                      }
                      backgroundColor={COLORS.lightGreen}
                    >
                      {livestockType && breedOptions[livestockType]?.map((breed) => (
                        <Select.Item key={breed} label={breed} value={breed} />
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label _text={styles.label}>Phenotype</FormControl.Label>
                    <Select
                      selectedValue={mammalFormData.phenotype}
                      placeholder="Select Phenotype"
                      _selectedItem={{
                        bg: COLORS.lightGreen,
                        endIcon: <CheckIcon size="5" />
                      }}
                      onValueChange={(value) =>
                        setMammalFormData((prev) => ({ ...prev, phenotype: value }))
                      }
                      backgroundColor={COLORS.lightGreen}
                    >
                      {getPhenotypeOptions().map((phenotype) => (
                        <Select.Item key={phenotype} label={phenotype} value={phenotype} />
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label _text={styles.label}>Date of Birth</FormControl.Label>
                    <Pressable onPress={() => showDatePickerModal('mammal')}>
                      <Input
                        value={formatDate(mammalFormData.dateOfBirth)}
                        isReadOnly={true}
                       
                        backgroundColor={COLORS.lightGreen}
                        borderColor="gray.200"
                      />
                    </Pressable>
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label _text={styles.label}>Gender</FormControl.Label>
                    <Radio.Group
                      name="gender"
                      value={mammalFormData.gender}
                      onChange={(value) =>
                        setMammalFormData((prev) => ({ ...prev, gender: value }))
                      }
                    >
                      <HStack space={4}>
                        <Radio value="Male">
                          <Text>Male</Text>
                        </Radio>
                        <Radio value="Female">
                          <Text>Female</Text>
                        </Radio>
                      </HStack>
                    </Radio.Group>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label _text={styles.label}>Sire (Male Parent)</FormControl.Label>
                    <HStack space={2}>
                      <Input
                        flex={1}
                        value={mammalFormData.sireId}
                        onChangeText={(value) =>
                          setMammalFormData((prev) => ({ ...prev, sireId: value }))
                        }
                        placeholder="ID"
                        backgroundColor={COLORS.lightGreen}
                        borderColor="gray.200"
                      />
                      <Input
                        flex={1}
                        value={mammalFormData.sireCode}
                        onChangeText={(value) =>
                          setMammalFormData((prev) => ({ ...prev, sireCode: value }))
                        }
                        placeholder="Code"
                        backgroundColor={COLORS.lightGreen}
                        borderColor="gray.200"
                      />
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label _text={styles.label}>Dam (Female Parent)</FormControl.Label>
                    <HStack space={2}>
                      <Input
                        flex={1}
                        value={mammalFormData.damId}
                        onChangeText={(value) =>
                          setMammalFormData((prev) => ({ ...prev, damId: value }))
                        }
                        placeholder="ID"
                        backgroundColor={COLORS.lightGreen}
                        borderColor="gray.200"
                      />
                      <Input
                        flex={1}
                        value={mammalFormData.damCode}
                        onChangeText={(value) =>
                          setMammalFormData((prev) => ({ ...prev, damCode: value }))
                        }
                        placeholder="Code"
                        backgroundColor={COLORS.lightGreen}
                        borderColor="gray.200"
                      />
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label _text={styles.label}>Weight at Birth (kg)</FormControl.Label>
                    <HStack alignItems="center" space={2}>
                      <Button
                        onPress={() =>
                          setMammalFormData((prev) => ({
                            ...prev,
                            birthWeight: Math.max(0, parseFloat(prev.birthWeight || 0) - 0.5).toFixed(1),
                          }))
                        }
                        variant="outline"
                        p={2}
                      >
                        -
                      </Button>
                      <Input
                        flex={1}
                        variant="outline"
                        backgroundColor={COLORS.lightGreen}
                        borderColor="gray.200"
                        placeholder="Enter Weight"
                        keyboardType="numeric"
                        value={mammalFormData.birthWeight.toString()}
                        onChangeText={(text) => {
                          const numericValue = parseFloat(text) || 0;
                          setMammalFormData((prev) => ({
                            ...prev,
                            birthWeight: numericValue.toString(),
                          }));
                        }}
                      />
                      <Button
                        onPress={() =>
                          setMammalFormData((prev) => ({
                            ...prev,
                            birthWeight: (parseFloat(prev.birthWeight || 0) + 0.5).toFixed(1),
                          }))
                        }
                        variant="outline"
                        p={2}
                      >
                        +
                      </Button>
                    </HStack>
                  </FormControl>
                </VStack>
              )}

              {/* Poultry Form */}
              {livestockType === "poultry" && (
                <VStack space={4}>
                  <Text fontSize={16} fontWeight="bold" color={COLORS.darkGray3} mt={2}>
                    Poultry Flock Details
                  </Text>
                  
                  <FormControl isRequired>
                    <FormControl.Label _text={styles.label}>Flock ID</FormControl.Label>
                    <Input
                      value={poultryFormData.flockId}
                      onChangeText={(value) =>
                        setPoultryFormData((prev) => ({ ...prev, flockId: value }))
                      }
                      placeholder="Enter Flock ID"
                      backgroundColor={COLORS.lightGreen}
                      borderColor="gray.200"
                    />
                  </FormControl>

                  <FormControl>
                    <FormControl.Label _text={styles.label}>Date of Stocking</FormControl.Label>
                    <Pressable onPress={() => showDatePickerModal('poultry')}>
                      <Input
                        value={formatDate(poultryFormData.dateOfStocking)}
                        isReadOnly={true}
                       
                        backgroundColor={COLORS.lightGreen}
                        borderColor="gray.200"
                      />
                    </Pressable>
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label _text={styles.label}>Sex of the Birds</FormControl.Label>
                    <Radio.Group
                      name="gender"
                      value={poultryFormData.gender}
                      onChange={(value) =>
                        setPoultryFormData((prev) => ({ ...prev, gender: value }))
                      }
                    >
                      <HStack space={4} flexWrap="wrap">
                        <Radio value="Male">
                          <Text>Male</Text>
                        </Radio>
                        <Radio value="Female">
                          <Text>Female</Text>
                        </Radio>
                        <Radio value="Mixed">
                          <Text>Mixed</Text>
                        </Radio>
                      </HStack>
                    </Radio.Group>
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label _text={styles.label}>Initial Quantity</FormControl.Label>
                    <Input
                      value={poultryFormData.initialQuantity}
                      onChangeText={(value) =>
                        setPoultryFormData((prev) => ({ ...prev, initialQuantity: value }))
                      }
                      placeholder="Enter Number of Birds"
                      keyboardType="numeric"
                      backgroundColor={COLORS.lightGreen}
                      borderColor="gray.200"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label _text={styles.label}>Breed Type</FormControl.Label>
                    <Select
                      selectedValue={poultryFormData.breedType}
                      placeholder="Select Breed Type"
                      _selectedItem={{
                        bg: COLORS.lightGreen,
                        endIcon: <CheckIcon size="5" />
                      }}
                      onValueChange={(value) =>
                        setPoultryFormData((prev) => ({ ...prev, breedType: value }))
                      }
                      backgroundColor={COLORS.lightGreen}
                    >
                      {breedOptions.poultry.map((breed) => (
                        <Select.Item key={breed} label={breed} value={breed} />
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormControl.Label _text={styles.label}>Source of Birds</FormControl.Label>
                    <Input
                      value={poultryFormData.sourceOfBirds}
                      onChangeText={(value) =>
                        setPoultryFormData((prev) => ({ ...prev, sourceOfBirds: value }))
                      }
                      placeholder="Enter Source/Supplier"
                      backgroundColor={COLORS.lightGreen}
                      borderColor="gray.200"
                    />
                  </FormControl>

                  <FormControl>
                    <FormControl.Label _text={styles.label}>Initial Average Weight (g)</FormControl.Label>
                    <HStack alignItems="center" space={2}>
                      <Button
                        onPress={() =>
                          setPoultryFormData((prev) => ({
                            ...prev,
                            initialAverageWeight: Math.max(0, parseInt(prev.initialAverageWeight || 0) - 5).toString(),
                          }))
                        }
                        variant="outline"
                        p={2}
                      >
                        -
                      </Button>
                      <Input
                        flex={1}
                        variant="outline"
                        backgroundColor={COLORS.lightGreen}
                        borderColor="gray.200"
                        placeholder="Enter Weight in grams"
                        keyboardType="numeric"
                        value={poultryFormData.initialAverageWeight.toString()}
                        onChangeText={(text) => {
                          const numericValue = parseInt(text) || 0;
                          setPoultryFormData((prev) => ({
                            ...prev,
                            initialAverageWeight: numericValue.toString(),
                          }));
                        }}
                      />
                      <Button
                        onPress={() =>
                          setPoultryFormData((prev) => ({
                            ...prev,
                            initialAverageWeight: (parseInt(prev.initialAverageWeight || 0) + 5).toString(),
                          }))
                        }
                        variant="outline"
                        p={2}
                      >
                        +
                      </Button>
                    </HStack>
                  </FormControl>
                </VStack>
              )}

              {/* Buttons */}
              <HStack justifyContent="center" mt={6} space={4}>
                <Button
                  variant="outline"
                  borderWidth={1}
                  borderColor={COLORS.green}
                  borderRadius={8}
                  px={6}
                  py={3}
                  onPress={() => navigation.goBack()}
                >
                  Back
                </Button>
                <Button
                  backgroundColor={COLORS.green}
                  borderRadius={8}
                  px={6}
                  py={3}
                  onPress={handleSubmit}
                >
                  Submit
                </Button>
              </HStack>
            </Box>
          )}
        </Box>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={datePickerFor === 'mammal' ? mammalFormData.dateOfBirth : poultryFormData.dateOfStocking}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Success Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content borderRadius={12} p={5}>
          <Modal.Body alignItems="center">
           
            <Text style={styles.modalText}>
              {livestockType === "poultry" 
                ? "Your Poultry Flock has been successfully added!" 
                : "Your Livestock Details have been successfully added!"}
            </Text>
          </Modal.Body>
          <Modal.Footer justifyContent="space-between">
            <Button
              backgroundColor={COLORS.green}
              style={styles.modalButton}
              onPress={() => {
                setShowModal(false);
                navigation.navigate("LivestockModuleScreen");
              }}
            >
              Done
            </Button>
            <Button
              backgroundColor={COLORS.green}
              style={styles.modalButton}
              onPress={() => {
                setShowModal(false);
                if (livestockType === "poultry") {
                  setPoultryFormData({
                    flockId: "",
                    dateOfStocking: new Date(),
                    gender: "Mixed",
                    initialQuantity: "",
                    breedType: "",
                    sourceOfBirds: "",
                    initialAverageWeight: "",
                  });
                } else {
                  setMammalFormData({
                    idNumber: "",
                    breedType: "",
                    phenotype: "",
                    dateOfBirth: new Date(),
                    gender: "",
                    sireId: "",
                    sireCode: "",
                    damId: "",
                    damCode: "",
                    birthWeight: "",
                  });
                }
              }}
            >
              Add Another
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.darkGray3,
    marginBottom: 8,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: COLORS.darkGray3,
    fontWeight: "500",
    marginBottom: 4,
  },
  modalText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.darkGray3,
    marginTop: 10,
  },
  modalButton: {
    width: 130,
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
  },
});