import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Box, Button, HStack, VStack } from 'native-base';
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import { COLORS } from '../../constants/theme';

import SecondaryHeader from "../../components/headers/secondary-header";

export default function DashboardRecord() {
    return (
        <View style={styles.container}>
            <SecondaryHeader title="Dashboard" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Welcome Card */}
                <Box bg={COLORS.lightGreen} p={6} borderRadius={12} mx={6} my={8}>
                    <Text style={styles.welcomeText}>Hello, John!</Text>
                    <Text style={styles.subText}>Welcome to Xpert Farmers</Text>
                    <Text style={styles.descriptionText}>
                        Cultivating Success, Harvesting Excellence, Nurturing Tomorrow
                    </Text>
                    <Button variant="link" colorScheme="blue" style={styles.seeMore}>
                        See more
                    </Button>
                </Box>

                {/* Category Buttons */}
                <HStack justifyContent="space-between" flexWrap="wrap" mx={6} my={4}>
                    <TouchableOpacity style={styles.categoryCard}>
                        <Text style={styles.categoryText}>+ Production</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryCard}>
                        <Text style={styles.categoryText}>+ Feeding</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryCard}>
                        <Text style={styles.categoryText}>+ Health</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryCard}>
                        <Text style={styles.categoryText}>+ Breeding</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryCard}>
                        <Text style={styles.categoryText}>+ Animal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryCard}>
                        <Text style={styles.categoryText}>+ Employee</Text>
                    </TouchableOpacity>
                </HStack>

                {/* Farm Overview */}
                <View style={styles.farmOverviewContainer}>
                    <Text style={styles.farmOverviewText}>Farm Overview</Text>
                    <TouchableOpacity style={styles.monthCard}>
                        <Text style={styles.monthText}>This month</Text>
                    </TouchableOpacity>
                </View>

                {/* Production Analysis */}
                <Box bg="white" p={4} borderRadius={12} shadow={1} mx={6} my={4}>
                    <Text style={styles.sectionTitle}>Production Analysis</Text>
                    <Text>Total Animal: 200</Text>
                    <Text>Cows: 100</Text>
                    <Text>Dairy: 100</Text>
                </Box>

                {/* Sales Data */}
                <Box bg="white" p={4} borderRadius={12} shadow={1} mx={6} my={4}>
                    <Text style={styles.sectionTitle}>Sales Data</Text>
                    <Text>Milk Yield: 200ML</Text>
                    <Text>Animal sold: 100</Text>
                    <Text>Feeds purchased: 10KG</Text>
                </Box>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    subText: {
        fontSize: 18,
        color: '#fff',
    },
    descriptionText: {
        fontSize: 14,
        color: '#fff',
        marginVertical: 8,
    },
    seeMore: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    categoryCard: {
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 4,
        marginVertical: 4,
    },
    categoryText: {
        fontSize: 16,
        color: COLORS.green,
    },
    farmOverviewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginBottom: 10,
    },
    farmOverviewText: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
    },
    monthCard: {
        backgroundColor: COLORS.lightGreen,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    monthText: {
        fontSize: 16,
        color: '#fff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});