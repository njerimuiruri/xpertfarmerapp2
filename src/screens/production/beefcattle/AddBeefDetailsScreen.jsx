import React, { useState } from 'react';
import {
    Box,
    Text,
    Input,
    Button,
    VStack,
    ScrollView,
    HStack,
    Checkbox,
    Tooltip,
    Icon,
    Modal,
} from 'native-base';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { format, addDays } from 'date-fns';

export default function AddBeefDetailsScreen({ navigation }) {
    const [animalIdOrFlockId, setAnimalIdOrFlockId] = useState('');
    const [weightGain, setWeightGain] = useState('');
    const [saleWeight, setSaleWeight] = useState('');
    const [saleDate, setSaleDate] = useState(new Date());
    const [marketPrice, setMarketPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [buyerName, setBuyerName] = useState('');
    const [buyerType, setBuyerType] = useState('');
    const [showSaleDatePicker, setShowSaleDatePicker] = useState(false);
    const [availableIds] = useState(['ID 1', 'ID 2', 'ID 3', 'ID 4']);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

    const handleDateChange = (setter) => (event, selectedDate) => {
        setter(selectedDate || new Date());
    };

    const handleSelect = (id) => {
        setAnimalIdOrFlockId(id);
        setDropdownVisible(false);
    };

    const toggleBuyerType = (type) => {
        setBuyerType(prevType => prevType === type ? '' : type);
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
            <SecondaryHeader title="Beef Cattle" />
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', marginTop: 5 }}>
                <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>

                    <VStack space={5}>
                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={1}>
                                Animal ID or Flock ID
                            </Text>
                            <HStack alignItems="center" borderWidth={1} borderRadius={8} borderColor="gray.200">
                                <Input
                                    flex={1}
                                    variant="unstyled"
                                    placeholder="Type or select ID"
                                    value={animalIdOrFlockId}
                                    onChangeText={setAnimalIdOrFlockId}
                                    backgroundColor="transparent"
                                    borderColor="transparent"
                                />
                                <TouchableOpacity style={{ padding: 10 }} onPress={() => setDropdownVisible(prev => !prev)}>
                                    <Text style={{ fontSize: 16, color: COLORS.green }}>▼</Text>
                                </TouchableOpacity>
                            </HStack>
                            {dropdownVisible && (
                                <Box bg="white" mt={1} borderWidth={1} borderColor="gray.200" borderRadius={8}>
                                    {availableIds.map((id, index) => (
                                        <TouchableOpacity key={index} style={styles.dropdownItem} onPress={() => handleSelect(id)}>
                                            <Text style={styles.dropdownText}>{id}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                                Weight Gain
                            </Text>
                            <HStack alignItems="center" space={3}>
                                <Button
                                    onPress={() => setWeightGain((parseFloat(weightGain) || 0) - 1)}
                                    variant="outline"
                                    style={styles.incrementButton}>
                                    -
                                </Button>
                                <Input
                                    flex={1}
                                    variant="outline"
                                    backgroundColor={COLORS.lightGreen}
                                    borderColor="gray.200"
                                    placeholder="Enter weight gain"
                                    keyboardType="numeric"
                                    value={weightGain.toString()}
                                    onChangeText={text => {
                                        const numericText = text.replace(/[^0-9.]/g, '');
                                        setWeightGain(numericText);
                                    }}
                                />
                                <Button
                                    onPress={() => setWeightGain((parseFloat(weightGain) || 0) + 1)}
                                    variant="outline"
                                    style={styles.incrementButton}>
                                    +
                                </Button>
                            </HStack>
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={2}>
                                Sale Information
                            </Text>
                            <HStack alignItems="center" justifyContent="space-between">
                                <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3}>
                                    Sale Weight
                                </Text>
                            </HStack>
                            <HStack alignItems="center" space={3}>
                                <Button
                                    onPress={() => setSaleWeight((parseFloat(saleWeight) || 0) - 1)}
                                    variant="outline"
                                    style={styles.incrementButton}>
                                    -
                                </Button>
                                <Input
                                    flex={1}
                                    variant="outline"
                                    backgroundColor={COLORS.lightGreen}
                                    borderColor="gray.200"
                                    placeholder="Enter sale weight"
                                    keyboardType="numeric"
                                    value={saleWeight.toString()}
                                    onChangeText={text => {
                                        const numericText = text.replace(/[^0-9.]/g, '');
                                        setSaleWeight(numericText);
                                    }}
                                />
                                <Button
                                    onPress={() => setSaleWeight((parseFloat(saleWeight) || 0) + 1)}
                                    variant="outline"
                                    style={styles.incrementButton}>
                                    +
                                </Button>
                            </HStack>

                            <Box mt={4}>
                                <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={2}>
                                    Sale Date
                                </Text>
                                <HStack alignItems="center" space={3}>
                                    <Input
                                        w="85%"
                                        backgroundColor={COLORS.lightGreen}
                                        value={format(saleDate, 'dd/MM/yyyy')}
                                        placeholder="DD/MM/YYYY"
                                        isReadOnly
                                    />
                                    <TouchableOpacity onPress={() => setShowSaleDatePicker(true)}>
                                        <Image source={icons.calendar} resizeMode="contain" style={styles.calendarIcon} />
                                    </TouchableOpacity>
                                </HStack>
                                {showSaleDatePicker && (
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={saleDate}
                                        mode="date"
                                        is24Hour={true}
                                        maximumDate={addDays(new Date(), 1)}
                                        onChange={handleDateChange(setSaleDate)}
                                    />
                                )}
                            </Box>

                            <Box mt={4}>
                                <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={2}>
                                    Market Price
                                </Text>
                                <HStack alignItems="center" space={3}>
                                    <Button
                                        onPress={() => setMarketPrice((parseFloat(marketPrice) || 0) - 1)}
                                        variant="outline"
                                        style={styles.incrementButton}>
                                        -
                                    </Button>
                                    <Input
                                        flex={1}
                                        variant="outline"
                                        backgroundColor={COLORS.lightGreen}
                                        borderColor="gray.200"
                                        placeholder="Enter market price"
                                        keyboardType="numeric"
                                        value={marketPrice.toString()}
                                        onChangeText={text => {
                                            const numericText = text.replace(/[^0-9.]/g, '');
                                            setMarketPrice(numericText);
                                        }}
                                    />
                                    <Button
                                        onPress={() => setMarketPrice((parseFloat(marketPrice) || 0) + 1)}
                                        variant="outline"
                                        style={styles.incrementButton}>
                                        +
                                    </Button>
                                </HStack>
                            </Box>

                            <Box mt={4}>
                                <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={2}>
                                    Sale Price
                                </Text>
                                <HStack alignItems="center" space={3}>
                                    <Button
                                        onPress={() => setSalePrice((parseFloat(salePrice) || 0) - 1)}
                                        variant="outline"
                                        style={styles.incrementButton}>
                                        -
                                    </Button>
                                    <Input
                                        flex={1}
                                        variant="outline"
                                        backgroundColor={COLORS.lightGreen}
                                        borderColor="gray.200"
                                        placeholder="Enter sale price"
                                        keyboardType="numeric"
                                        value={salePrice.toString()}
                                        onChangeText={text => {
                                            const numericText = text.replace(/[^0-9.]/g, '');
                                            setSalePrice(numericText);
                                        }}
                                    />
                                    <Button
                                        onPress={() => setSalePrice((parseFloat(salePrice) || 0) + 1)}
                                        variant="outline"
                                        style={styles.incrementButton}>
                                        +
                                    </Button>
                                </HStack>
                            </Box>
                        </Box>

                        {/* Buyer's Name */}
                        <Box mt={4}>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={2}>
                                Buyer's Name
                            </Text>
                            <Input
                                variant="outline"
                                backgroundColor={COLORS.lightGreen}
                                borderColor="gray.200"
                                placeholder="Enter buyer's name"
                                value={buyerName}
                                onChangeText={setBuyerName}
                            />
                        </Box>

                        <Box mt={4}>
                            <Text fontSize="sm" fontWeight="500" color={COLORS.darkGray3} mb={2}>
                                Buyer Type
                            </Text>
                            <HStack space={4}>
                                <Checkbox isChecked={buyerType === 'company'} onChange={() => toggleBuyerType('company')}>
                                    Company
                                </Checkbox>
                                <Checkbox isChecked={buyerType === 'individual'} onChange={() => toggleBuyerType('individual')}>
                                    Individual
                                </Checkbox>
                            </HStack>
                        </Box>

                        <HStack justifyContent="center" mt={6} space={4}>
                            <Button
                                variant="outline"
                                borderColor={COLORS.green}
                                borderRadius={8}
                                px={6}
                                py={3}
                                onPress={() => navigation.goBack()}>
                                Cancel
                            </Button>
                            <Button
                                backgroundColor={COLORS.green}
                                borderRadius={8}
                                px={6}
                                py={3}
                                _pressed={{ bg: 'emerald.700' }}
                                onPress={() => setShowSaveModal(true)}>
                                Save
                            </Button>
                        </HStack>
                    </VStack>
                </Box>
            </ScrollView>

            <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)}>
                <Modal.Content maxWidth="85%" borderRadius={12} p={5}>
                    <Modal.Body alignItems="center">
                        <FastImage source={icons.tick} style={styles.modalIcon} resizeMode="contain" />
                        <Text style={styles.modalText}>
                            Beef record has been saved successfully!
                        </Text>
                    </Modal.Body>
                    <Modal.Footer justifyContent="center">
                        <Button
                            backgroundColor={COLORS.green}
                            style={styles.modalButton}
                            onPress={() => {
                                setShowSaveModal(false);
                                navigation.navigate('BeefCattleProductionListing');
                            }}>
                            OK
                        </Button>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    calendarIcon: {
        width: 40,
        height: 40,
        tintColor: COLORS.green,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    dropdownText: {
        fontSize: 14,
        color: 'black',
    },
    incrementButton: {
        width: 45,
        height: 45,
        borderRadius: 8,
    },
    modalIcon: {
        width: 50,
        height: 50,
        tintColor: COLORS.green,
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: COLORS.darkGray3,
    },
    modalButton: {
        width: 120,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
    },
});