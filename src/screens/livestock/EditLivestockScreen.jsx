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
    Pressable,
    useToast,
    Spinner,
    Center
} from "native-base";
import { View, StyleSheet } from "react-native";
import SecondaryHeader from "../../components/headers/secondary-header";
import { COLORS } from "../../constants/theme";
import DateTimePicker from "@react-native-community/datetimepicker";
import { updateLivestock } from "../../services/livestock";

export default function EditLivestockScreen({ route, navigation }) {
    const { livestockData, isEditing } = route.params || {};
    const toast = useToast();

    const [livestockType, setLivestockType] = useState(livestockData?.type || livestockData?.livestockType || "");
    const [loading, setLoading] = useState(false);

    const mammal = livestockData.rawData?.mammal || {};

    const [mammalFormData, setMammalFormData] = useState({
        idNumber: mammal.idNumber || livestockData.id || "",
        breedType: mammal.breedType || livestockData.breed || "",
        phenotype: mammal.phenotype || livestockData.phenotype || "",
        dateOfBirth: mammal.dateOfBirth ? new Date(mammal.dateOfBirth) : new Date(),
        gender: mammal.gender || livestockData.sex || "",
        sireId: mammal.sireId || "",
        sireCode: mammal.sireCode || "",
        damId: mammal.damId || "",
        damCode: mammal.damCode || "",
        birthWeight:
            mammal.birthWeight !== undefined
                ? mammal.birthWeight.toString()
                : "",
    });




    const [poultryFormData, setPoultryFormData] = useState({
        flockId: livestockData?.poultry?.flockId || "",
        dateOfStocking: livestockData?.poultry?.dateOfStocking ? new Date(livestockData.poultry.dateOfStocking) : new Date(),
        gender: livestockData?.gender || livestockData?.sex || "Mixed",
        initialQuantity: livestockData?.poultry?.initialQuantity?.toString() || "",
        breedType: livestockData?.breedType || livestockData?.breed || "",
        sourceOfBirds: livestockData?.poultry?.sourceOfBirds || "",
        initialAverageWeight: livestockData?.poultry?.initialAverageWeight?.toString() || "",
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
            setMammalFormData({ ...mammalFormData, dateOfBirth: currentDate });
        } else {
            setPoultryFormData({ ...poultryFormData, dateOfStocking: currentDate });
        }
    };

    const formatDate = (date) => {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const showDatePickerModal = (type) => {
        setDatePickerFor(type);
        setShowDatePicker(true);
    };

    const validateForm = () => {
        if (!livestockType) {
            toast.show({
                description: "Please select a livestock type",
                placement: "top",
                duration: 3000,
                backgroundColor: "red.500",
            });
            return false;
        }

        if (livestockType === "poultry") {
            if (!poultryFormData.flockId || !poultryFormData.initialQuantity || !poultryFormData.breedType) {
                toast.show({
                    description: "Please fill in all required fields for poultry",
                    placement: "top",
                    duration: 3000,
                    backgroundColor: "red.500",
                });
                return false;
            }
        } else {
            if (!mammalFormData.idNumber || !mammalFormData.breedType || !mammalFormData.gender) {
                toast.show({
                    description: "Please fill in all required fields for livestock",
                    placement: "top",
                    duration: 3000,
                    backgroundColor: "red.500",
                });
                return false;
            }
        }

        return true;
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            let payload = {
                livestockType: livestockType,
            };

            if (livestockType === "poultry") {
                payload = {
                    ...payload,
                    flockId: poultryFormData.flockId,
                    dateOfStocking: poultryFormData.dateOfStocking.toISOString(),
                    gender: poultryFormData.gender,
                    initialQuantity: parseInt(poultryFormData.initialQuantity),
                    breedType: poultryFormData.breedType,
                    sourceOfBirds: poultryFormData.sourceOfBirds,
                    initialAverageWeight: poultryFormData.initialAverageWeight ? parseFloat(poultryFormData.initialAverageWeight) : null,
                };
            } else {
                payload = {
                    ...payload,
                    idNumber: mammalFormData.idNumber,
                    breedType: mammalFormData.breedType,
                    phenotype: mammalFormData.phenotype,
                    dateOfBirth: mammalFormData.dateOfBirth.toISOString(),
                    gender: mammalFormData.gender,
                    sireId: mammalFormData.sireId,
                    sireCode: mammalFormData.sireCode,
                    damId: mammalFormData.damId,
                    damCode: mammalFormData.damCode,
                    birthWeight: mammalFormData.birthWeight ? parseFloat(mammalFormData.birthWeight) : null,
                };
            }

            console.log('Payload being sent for update:', payload);



            const livestockId = livestockData.rawData?.id || livestockData.id;
            const { data, error } = await updateLivestock(livestockId, payload);



            if (error) {
                toast.show({
                    description: error,
                    placement: "top",
                    duration: 3000,
                    backgroundColor: "red.500",
                });
                return;
            }

            console.log('Livestock updated successfully:', data);

            toast.show({
                description: `${livestockType === "poultry" ? "Poultry flock" : "Livestock"} updated successfully!`,
                placement: "top",
                duration: 2000,
                backgroundColor: "green.500",
            });

            setShowModal(true);

        } catch (error) {
            console.error('Error updating livestock:', error);
            toast.show({
                description: "Failed to update livestock. Please try again.",
                placement: "top",
                duration: 3000,
                backgroundColor: "red.500",
            });
        } finally {
            setLoading(false);
        }
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

    const adjustWeight = (increment = true, step = 0.5) => {
        setMammalFormData((prev) => {
            const currentWeight = parseFloat(prev.birthWeight) || 0;
            const newWeight = increment
                ? currentWeight + step
                : Math.max(0, currentWeight - step);
            return {
                ...prev,
                birthWeight: newWeight.toFixed(1),
            };
        });
    };

    const adjustPoultryWeight = (increment = true, step = 1) => {
        setPoultryFormData((prev) => {
            const currentWeight = parseFloat(prev.initialAverageWeight) || 0;
            const newWeight = increment
                ? currentWeight + step
                : Math.max(0, currentWeight - step);
            return {
                ...prev,
                initialAverageWeight: newWeight.toString(),
            };
        });
    };

    const adjustQuantity = (increment = true, step = 1) => {
        setPoultryFormData((prev) => {
            const currentQuantity = parseInt(prev.initialQuantity) || 0;
            const newQuantity = increment
                ? currentQuantity + step
                : Math.max(0, currentQuantity - step);
            return {
                ...prev,
                initialQuantity: newQuantity.toString(),
            };
        });
    };

    if (!livestockData) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
                <SecondaryHeader title="Edit Livestock" />
                <Center flex={1}>
                    <Text fontSize="lg" color={COLORS.darkGray3}>
                        No livestock data found
                    </Text>
                </Center>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
            <SecondaryHeader title="Edit Livestock" />
            <ScrollView contentContainerStyle={styles.scrollView}>



                <Box bg="white" p={6} borderRadius={8} shadow={1} mx={4} my={2}>
                    <Text style={styles.titleText}>Edit Livestock Information</Text>
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
                                                onPress={() => adjustWeight(false)}
                                                variant="outline"
                                                p={2}
                                                size="sm"
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
                                                value={mammalFormData.birthWeight}
                                                onChangeText={(text) => {
                                                    const numericValue = text.replace(/[^0-9.]/g, '');
                                                    setMammalFormData((prev) => ({
                                                        ...prev,
                                                        birthWeight: numericValue,
                                                    }));
                                                }}
                                            />
                                            <Button
                                                onPress={() => adjustWeight(true)}
                                                variant="outline"
                                                p={2}
                                                size="sm"
                                            >
                                                +
                                            </Button>
                                        </HStack>
                                    </FormControl>
                                </VStack>
                            )}

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
                                        <HStack alignItems="center" space={2}>
                                            <Button
                                                onPress={() => adjustQuantity(false)}
                                                variant="outline"
                                                p={2}
                                                size="sm"
                                            >
                                                -
                                            </Button>
                                            <Input
                                                flex={1}
                                                value={poultryFormData.initialQuantity}
                                                onChangeText={(value) => {
                                                    const numericValue = value.replace(/[^0-9]/g, '');
                                                    setPoultryFormData((prev) => ({ ...prev, initialQuantity: numericValue }));
                                                }}
                                                placeholder="Enter Number of Birds"
                                                keyboardType="numeric"
                                                backgroundColor={COLORS.lightGreen}
                                                borderColor="gray.200"
                                            />
                                            <Button
                                                onPress={() => adjustQuantity(true)}
                                                variant="outline"
                                                p={2}
                                                size="sm"
                                            >
                                                +
                                            </Button>
                                        </HStack>
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
                                            {breedOptions.poultry?.map((breed) => (
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
                                            placeholder="Enter Source (e.g., Hatchery, Farm)"
                                            backgroundColor={COLORS.lightGreen}
                                            borderColor="gray.200"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormControl.Label _text={styles.label}>Initial Average Weight (g)</FormControl.Label>
                                        <HStack alignItems="center" space={2}>
                                            <Button
                                                onPress={() => adjustPoultryWeight(false)}
                                                variant="outline"
                                                p={2}
                                                size="sm"
                                            >
                                                -
                                            </Button>
                                            <Input
                                                flex={1}
                                                value={poultryFormData.initialAverageWeight}
                                                onChangeText={(value) => {
                                                    const numericValue = value.replace(/[^0-9.]/g, '');
                                                    setPoultryFormData((prev) => ({ ...prev, initialAverageWeight: numericValue }));
                                                }}
                                                placeholder="Enter Average Weight"
                                                keyboardType="numeric"
                                                backgroundColor={COLORS.lightGreen}
                                                borderColor="gray.200"
                                            />
                                            <Button
                                                onPress={() => adjustPoultryWeight(true)}
                                                variant="outline"
                                                p={2}
                                                size="sm"
                                            >
                                                +
                                            </Button>
                                        </HStack>
                                    </FormControl>
                                </VStack>
                            )}

                            <Divider my={4} />

                            <HStack space={3} justifyContent="space-between" mt={6}>
                                <Button
                                    flex={1}
                                    variant="outline"
                                    borderColor={COLORS.red}
                                    onPress={() => navigation.goBack()}
                                    _text={{ color: COLORS.red }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    flex={1}
                                    backgroundColor={COLORS.green}
                                    onPress={handleSubmit}
                                    isLoading={loading}
                                    isDisabled={loading}
                                    _loading={{
                                        bg: COLORS.green,
                                        _text: { color: "white" }
                                    }}
                                >
                                    {loading ? (
                                        <HStack space={2} alignItems="center">
                                            <Spinner color="white" size="sm" />
                                            <Text color="white">Updating...</Text>
                                        </HStack>
                                    ) : (
                                        "Update Livestock"
                                    )}
                                </Button>
                            </HStack>
                        </Box>
                    )}
                </Box>

                {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={datePickerFor === 'mammal' ? mammalFormData.dateOfBirth : poultryFormData.dateOfStocking}
                        mode="date"
                        is24Hour={true}
                        display="default"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}

                <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
                    <Modal.Content maxWidth="400px">
                        <Modal.CloseButton />
                        <Modal.Header>
                            <HStack space={2} alignItems="center">
                                <Text fontSize="lg" fontWeight="bold">Update Successful!</Text>
                            </HStack>
                        </Modal.Header>
                        <Modal.Body>
                            <VStack space={3} alignItems="center">
                                <Text textAlign="center" fontSize="md">
                                    {livestockType === "poultry"
                                        ? `Poultry flock "${poultryFormData.flockId}" has been successfully updated.`
                                        : `Livestock "${mammalFormData.idNumber}" has been successfully updated.`
                                    }
                                </Text>
                                <Box bg={COLORS.lightGreen} p={3} borderRadius={8} width="100%">
                                    <Text fontSize="sm" color={COLORS.darkGray3} textAlign="center">
                                        The changes have been saved and are now reflected in your livestock records.
                                    </Text>
                                </Box>
                            </VStack>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                flex={1}
                                backgroundColor={COLORS.green}
                                onPress={() => {
                                    setShowModal(false);
                                    navigation.goBack();
                                }}
                            >
                                Done
                            </Button>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    titleText: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.darkGray3,
        textAlign: "center",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.darkGray3,
    },
});