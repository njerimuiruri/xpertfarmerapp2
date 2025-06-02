import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    Box, Text, VStack, HStack, ScrollView, Pressable,
    IconButton, Heading, Button, FlatList, Spinner, Center,
    Input, Select, CheckIcon, AlertDialog, useToast, Modal,
    Divider, Badge
} from 'native-base';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import FastImage from 'react-native-fast-image';
import SecondaryHeader from '../../components/headers/secondary-header';
import { getUserFarms, deleteFarm } from '../../services/farm';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FarmDetailsModal = ({
    isOpen,
    onClose,
    farm,
    onEdit,
    onDelete,
    onSetActive
}) => {
    if (!farm) return null;

    const farmDetails = [
        {
            label: 'Farm Name',
            value: farm.name,
            icon: icons.agriculture
        },
        {
            label: 'Location',
            value: farm.location,
            icon: icons.location || icons.agriculture
        },
        {
            label: 'County',
            value: farm.county || 'Not specified',
            icon: icons.location || icons.agriculture
        },
        {
            label: 'Size',
            value: farm.size,
            icon: icons.resize || icons.agriculture
        },
        {
            label: 'Ownership',
            value: farm.ownership || 'Not specified',
            icon: icons.document || icons.agriculture
        },
        {
            label: 'Status',
            value: farm.isActive ? 'Active' : 'Inactive',
            icon: icons.status || icons.agriculture,
            isStatus: true
        }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <Modal.Content
                maxWidth="95%"
                maxHeight="90%"
                borderRadius={16}
                bg="white"
            >
                <Modal.CloseButton
                    _icon={{ color: COLORS.gray, size: "4" }}
                    borderRadius="full"
                    bg="gray.100"
                    _pressed={{ bg: "gray.200" }}
                />

                <Modal.Header
                    borderBottomWidth={0}
                    pb={2}
                    bg={COLORS.lightGreen}
                    borderTopRadius={16}
                >
                    <HStack alignItems="center" space={3} pr={8}>
                        <Box bg={COLORS.green} p={2} borderRadius="full">
                            <FastImage
                                source={icons.agriculture}
                                style={styles.headerIcon}
                                resizeMode="contain"
                                tintColor="white"
                            />
                        </Box>
                        <VStack flex={1}>
                            <Text fontSize="lg" fontWeight="bold" color="black">
                                Farm Details
                            </Text>
                            <Text fontSize="sm" color={COLORS.darkGray3}>
                                Complete farm information
                            </Text>
                        </VStack>
                    </HStack>
                </Modal.Header>

                <Modal.Body px={0} py={0}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {farm.isActive && (
                            <Box bg={COLORS.green} mx={4} mt={4} p={3} borderRadius={8}>
                                <HStack alignItems="center" space={2} justifyContent="center">
                                    <FastImage
                                        source={icons.check || icons.agriculture}
                                        style={styles.smallIcon}
                                        resizeMode="contain"
                                        tintColor="white"
                                    />
                                    <Text color="white" fontWeight="bold" fontSize="sm">
                                        This is your active farm
                                    </Text>
                                </HStack>
                            </Box>
                        )}

                        <Box mx={4} mt={4} mb={4}>
                            <VStack space={4}>
                                {farmDetails.map((detail, index) => (
                                    <Box key={index}>
                                        <HStack alignItems="center" space={3} py={3}>
                                            <Box bg={COLORS.lightGreen} p={2} borderRadius={8}>
                                                <FastImage
                                                    source={detail.icon}
                                                    style={styles.detailIcon}
                                                    resizeMode="contain"
                                                    tintColor={COLORS.green}
                                                />
                                            </Box>
                                            <VStack flex={1} space={1}>
                                                <Text fontSize="xs" color={COLORS.darkGray3} fontWeight="500">
                                                    {detail.label}
                                                </Text>
                                                {detail.isStatus ? (
                                                    <Badge
                                                        colorScheme={farm.isActive ? "green" : "gray"}
                                                        variant="solid"
                                                        borderRadius={4}
                                                        alignSelf="flex-start"
                                                        px={2}
                                                        py={1}
                                                    >
                                                        <Text fontSize="xs" color="white" fontWeight="bold">
                                                            {detail.value}
                                                        </Text>
                                                    </Badge>
                                                ) : (
                                                    <Text fontSize="md" fontWeight="500" color="black">
                                                        {detail.value}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </HStack>
                                        {index < farmDetails.length - 1 && (
                                            <Divider bg={COLORS.gray3} />
                                        )}
                                    </Box>
                                ))}
                            </VStack>
                        </Box>

                        <Box mx={4} mb={4}>
                            <Divider bg={COLORS.gray3} mb={4} />
                            <Heading size="sm" mb={3} color={COLORS.green}>
                                Types of Farming
                            </Heading>
                            {Array.isArray(farm.animals) && farm.animals.length > 0 ? (
                                <VStack space={2}>
                                    {farm.animals.map((animal, index) => (
                                        <HStack key={index} alignItems="center" space={3} py={2}>
                                            <Box bg={COLORS.green} p={1} borderRadius="full">
                                                <FastImage
                                                    source={icons.livestock || icons.agriculture}
                                                    style={styles.smallIcon}
                                                    resizeMode="contain"
                                                    tintColor="white"
                                                />
                                            </Box>
                                            <Text fontSize="md" color="black" flex={1}>
                                                {animal}
                                            </Text>
                                        </HStack>
                                    ))}
                                </VStack>
                            ) : (
                                <Box bg="gray.50" p={4} borderRadius={8}>
                                    <Text color={COLORS.darkGray3} textAlign="center" fontSize="sm">
                                        No farming types specified
                                    </Text>
                                </Box>
                            )}
                        </Box>


                    </ScrollView>
                </Modal.Body>

                <Modal.Footer
                    borderTopWidth={1}
                    borderColor={COLORS.gray3}
                    bg="white"
                    borderBottomRadius={16}
                >
                    <VStack space={3} width="100%">
                        <HStack space={3} width="100%">
                            <Button
                                flex={1}
                                variant="outline"
                                borderColor={COLORS.green}
                                onPress={() => {
                                    onClose();
                                    onEdit(farm);
                                }}
                                leftIcon={
                                    <FastImage
                                        source={icons.edit}
                                        style={styles.buttonIcon}
                                        resizeMode="contain"
                                        tintColor={COLORS.green}
                                    />
                                }
                                _text={{ color: COLORS.green, fontWeight: "500" }}
                                borderRadius={8}
                                height={10}
                            >
                                Edit
                            </Button>

                            <Button
                                flex={1}
                                variant="outline"
                                borderColor="#FF4444"
                                onPress={() => {
                                    onClose();
                                    onDelete(farm);
                                }}
                                leftIcon={
                                    <FastImage
                                        source={icons.remove || icons.trash}
                                        style={styles.buttonIcon}
                                        resizeMode="contain"
                                        tintColor="#FF4444"
                                    />
                                }
                                _text={{ color: "#FF4444", fontWeight: "500" }}
                                borderRadius={8}
                                height={10}
                            >
                                Delete
                            </Button>
                        </HStack>

                        <HStack space={3} width="100%">
                            {!farm.isActive && (
                                <Button
                                    flex={1}
                                    bg={COLORS.green}
                                    onPress={() => {
                                        onClose();
                                        onSetActive(farm);
                                    }}
                                    leftIcon={
                                        <FastImage
                                            source={icons.check || icons.agriculture}
                                            style={styles.buttonIcon}
                                            resizeMode="contain"
                                            tintColor="white"
                                        />
                                    }
                                    _text={{ color: "white", fontWeight: "500" }}
                                    borderRadius={8}
                                    height={10}
                                    _pressed={{ bg: "green.600" }}
                                >
                                    Set as Active
                                </Button>
                            )}

                            <Button
                                flex={farm.isActive ? 1 : 1}
                                variant="ghost"
                                onPress={onClose}
                                _text={{ color: COLORS.darkGray3, fontWeight: "500" }}
                                borderRadius={8}
                                height={10}
                            >
                                Close
                            </Button>
                        </HStack>
                    </VStack>
                </Modal.Footer>
            </Modal.Content>
        </Modal>
    );
};

const styles = StyleSheet.create({
    headerIcon: {
        width: 20,
        height: 20,
    },
    detailIcon: {
        width: 16,
        height: 16,
    },
    smallIcon: {
        width: 12,
        height: 12,
    },
    buttonIcon: {
        width: 14,
        height: 14,
    },
});

export default FarmDetailsModal;