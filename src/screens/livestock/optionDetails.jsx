import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, FlatList, ActivityIndicator, TextInput } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Papa from 'papaparse';
import FastImage from 'react-native-fast-image';
import { RadioButton } from 'react-native-paper';
import { icons } from '../../constants';
import SecondaryHeader from '../../components/headers/secondary-header';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button, Input } from 'native-base';
import { COLORS } from '../../constants/theme';

export default function OptionDetailsScreen({ navigation }) {
    const [option, setOption] = useState('oneByOne');
    const [fileName, setFileName] = useState('');
    const [fileData, setFileData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAllRows, setShowAllRows] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const INITIAL_ROWS_TO_SHOW = 6;

    const handleFilePicker = async () => {
        try {
            setLoading(true);
            const file = await DocumentPicker.pick({
                type: [DocumentPicker.types.csv],
            });

            setFileName(file[0].name);
            Alert.alert('File Selected', `You have chosen: ${file[0].name}`);

            // Read and parse the file
            const response = await fetch(file[0].uri);
            const fileText = await response.text();

            // Parse CSV
            Papa.parse(fileText, {
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    setFileData(result.data);
                    setLoading(false);
                },
                error: (error) => {
                    Alert.alert('Error', `Failed to parse file: ${error.message}`);
                    setLoading(false);
                },
            });
        } catch (err) {
            setLoading(false);
            if (DocumentPicker.isCancel(err)) {
                Alert.alert('Cancelled', 'File selection was cancelled');
            } else {
                console.error('Unknown error: ', err);
                Alert.alert('Error', 'Could not open file picker.');
            }
        }
    };

    const renderFileData = () => {
        if (!fileData) return null;
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Processing file...</Text>
                </View>
            );
        }

        const headers = Object.keys(fileData[0]);
        const filteredData = fileData.filter(row =>
            headers.some(header =>
                row[header]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
        );

        const displayData = showAllRows ? filteredData : filteredData.slice(0, INITIAL_ROWS_TO_SHOW);

        const renderHeader = () => (
            <View style={styles.headerRow}>
                {headers.map((header, index) => (
                    <Text key={index} style={styles.headerCell}>{header}</Text>
                ))}
            </View>
        );

        const renderItem = ({ item, index }) => (
            <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                {headers.map((header, colIndex) => (
                    <Text
                        key={colIndex}
                        style={styles.cell}
                        numberOfLines={2}
                    >
                        {item[header] || '-'}
                    </Text>
                ))}
            </View>
        );

        return (
            <Animated.View
                entering={FadeIn}
                style={styles.tableContainer}
            >
                <Text style={styles.tableTitle}>CSV File Contents</Text>

                <View className='w-full bg-white mb-2'>
                    <Input InputLeftElement={<FastImage source={icons.search} className='h-[20px] w-[20px] ml-2' />} placeholder="Search in table..."
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.tableWrapper}>
                    {renderHeader()}

                    <FlatList
                        data={displayData}
                        renderItem={renderItem}
                        keyExtractor={(_, index) => index.toString()}
                        showsVerticalScrollIndicator={true}
                        showsHorizontalScrollIndicator={true}
                        horizontal={false}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No matching records found</Text>
                        }
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        getItemLayout={(data, index) => ({
                            length: 50,
                            offset: 50 * index,
                            index,
                        })}
                        style={styles.flatList}
                        ListFooterComponent={
                            filteredData.length > INITIAL_ROWS_TO_SHOW && (
                                <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAllRows(!showAllRows)}>
                                    <Text style={styles.showMoreText}>{showAllRows ? 'Show Less' : `Show All (${filteredData.length} rows)`}</Text>
                                </TouchableOpacity>
                            )
                        }
                    />
                </View>

            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <SecondaryHeader title="Livestock Profile" />
            <View style={styles.optionsContainer}>
                <Text style={styles.optionsTitle}>Options</Text>

                <TouchableOpacity
                    style={[styles.option, option === 'oneByOne' && styles.selectedOption]}
                    onPress={() => navigation.navigate('AddLivestockScreen')}
                >
                    <RadioButton
                        value="oneByOne"
                        status={option === 'oneByOne' ? 'checked' : 'unchecked'}
                        onPress={() => { setOption('oneByOne') }}
                        color="#4CAF50"
                    />
                    <Text style={styles.optionText}>Key in livestock profile one by one</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.option, option === 'uploadFile' && styles.selectedOption]}
                    onPress={() => {
                        setOption('uploadFile');
                        handleFilePicker();
                    }}
                >
                    <RadioButton
                        value="uploadFile"
                        status={option === 'uploadFile' ? 'checked' : 'unchecked'}
                        onPress={() => {
                            setOption('uploadFile');
                            handleFilePicker();
                        }}
                        color="#4CAF50"
                    />
                    <View style={styles.uploadContainer}>
                        <FastImage
                            source={icons.cloud}
                            style={styles.icon}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                        <Text style={styles.optionText}>
                            {fileName ? fileName : 'Upload file from storage'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <Button className=' mt-2' style={{ backgroundColor: COLORS.green }}>
                    <View className='flex-row items-center'>
                        <FastImage source={icons.cloud2} tintColor='white' className='h-[25px] w-[25px] mr-2' />
                        <Text className='text-white text-lg font-semibold'>Upload</Text>
                    </View>
                </Button>
            </View>

            {renderFileData()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },
    optionsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 15,
        marginHorizontal: 10,
        marginTop: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    optionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 10,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginVertical: 5,
    },
    selectedOption: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    optionText: {
        fontSize: 16,
        color: '#333333',
        marginLeft: 10,
    },
    uploadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    tableContainer: {
        flex: 1,
        marginTop: 20,
        paddingHorizontal: 10,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4CAF50',
        marginBottom: 10,
    },
    tableWrapper: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#4CAF50',
        borderBottomWidth: 2,
        borderBottomColor: '#E0E0E0',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        minHeight: 50,
        alignItems: 'center',
    },
    headerCell: {
        width: 150,
        padding: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontSize: 14,
    },
    cell: {
        width: 150,
        padding: 12,
        color: '#333333',
        fontSize: 14,
    },
    flatList: {
        maxHeight: 400,
    },
    evenRow: {
        backgroundColor: '#FFFFFF',
    },
    oddRow: {
        backgroundColor: '#F5F5F5',
    },
    emptyText: {
        padding: 20,
        textAlign: 'center',
        color: '#666666',
    },
    searchInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
    },
    showMoreButton: {
        padding: 12,
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
    },
    showMoreText: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666666',
    },
});
