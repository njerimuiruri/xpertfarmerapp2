import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';
import { Fab } from 'native-base';
import SecondaryHeader from '../../components/headers/secondary-header';


const FarmRecordsScreen = ({ navigation }) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const farmRecords = [
    {
      title: "FARM ONE",
      details: {
        "Farm ID": "SG2728290",
        "Region": "Nyanza Region",
        "Division": "Nyanza",
        "Administrative Location": "Nyanza",
        "Location": "Nyanza",
        "Plot size": "20SQ BY 70SQ",
        "Farm size": "2000",
      },
    },
    {
      title: "FARM TWO",
      details: {
        "Farm ID": "SG2728291",
        "Region": "Nyanza Region",
        "Division": "Nyanza",
        "Administrative Location": "Nyanza",
        "Location": "Nyanza",
        "Plot size": "15SQ BY 50SQ",
        "Farm size": "1500",
      },
    },
    {
      title: "FARM THREE",
      details: {
        "Farm ID": "SG2728292",
        "Region": "Nyanza Region",
        "Division": "Nyanza",
        "Administrative Location": "Nyanza",
        "Location": "Nyanza",
        "Plot size": "25SQ BY 80SQ",
        "Farm size": "2500",
      },
    },
    {
      title: "FARM FOUR",
      details: {
        "Farm ID": "SG2728293",
        "Region": "Nyanza Region",
        "Division": "Nyanza",
        "Administrative Location": "Nyanza",
        "Location": "Nyanza",
        "Plot size": "18SQ BY 60SQ",
        "Farm size": "1800",
      },
    },
    {
      title: "FARM Five",
      details: {
        "Farm ID": "SG2728290",
        "Region": "Nyanza Region",
        "Division": "Nyanza",
        "Administrative Location": "Nyanza",
        "Location": "Nyanza",
        "Plot size": "20SQ BY 70SQ",
        "Farm size": "2000",
      },
    },
    {
      title: "FARM Six",
      details: {
        "Farm ID": "SG2728290",
        "Region": "Nyanza Region",
        "Division": "Nyanza",
        "Administrative Location": "Nyanza",
        "Location": "Nyanza",
        "Plot size": "20SQ BY 70SQ",
        "Farm size": "2000",
      },
    },
    {
      title: "FARM Seven",
      details: {
        "Farm ID": "SG2728290",
        "Region": "Nyanza Region",
        "Division": "Nyanza",
        "Administrative Location": "Nyanza",
        "Location": "Nyanza",
        "Plot size": "20SQ BY 70SQ",
        "Farm size": "2000",
      },
    },
    {
      title: "FARM Eight",
      details: {
        "Farm ID": "SG2728290",
        "Region": "Nyanza Region",
        "Division": "Nyanza",
        "Administrative Location": "Nyanza",
        "Location": "Nyanza",
        "Plot size": "20SQ BY 70SQ",
        "Farm size": "2000",
      },
    },
  ];

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? -1 : index);
  };

  return (

    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Farm  Records" />

      <Fab renderInPortal={false} shadow={2} right={5} bottom={5} size="sm" icon={<FastImage source={icons.plus} className="w-[20px] h-[20px]" tintColor='white' />} colorScheme="emerald" onPress={() => navigation.navigate('AddFarmDetailsScreen')} />

      <ScrollView style={styles.scrollView}>
        {farmRecords.map((farm, index) => (
          <View key={index} style={styles.farmContainer}>
            <TouchableOpacity onPress={() => toggleExpand(index)} style={styles.farmTitleContainer}>
              <Text style={[styles.farmTitle, { color: COLORS.green2 }]}>
                {farm.title}
              </Text>
            </TouchableOpacity>
            {index === expandedIndex && (
              <View style={styles.detailsContainer}>
                {Object.entries(farm.details).map(([key, value], detailIndex) => (
                  <View key={detailIndex} style={[
                    styles.detailRow,
                    detailIndex === Object.keys(farm.details).length - 1 && { borderBottomWidth: 0 }
                  ]}>
                    <Text style={styles.detailKey}>{key}</Text>
                    <Text style={styles.detailValue}>{value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.green2,
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  iconContainer: {
    padding: 5,
  },
  icon: {
    width: 24,
    height: 24,
  },
  headerLeft: {
    flex: 0.3,
    alignItems: 'flex-start',
  },
  headerRight: {
    flex: 0.3,
    alignItems: 'flex-end',
  },
  scrollView: {
    backgroundColor: '#e5f3e5',
    padding: 16,
  },
  farmContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  farmTitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  farmTitle: {
    fontSize: 16,
    fontWeight: 'medium',
    color: COLORS.green2,
  },
  divider: {
    height: 0.5,
    opacity: 0.3,
    marginTop: 8,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 8,
  },
  detailKey: {
    color: 'gray',
    fontSize: 14,
  },
  detailValue: {
    color: 'black',
    fontSize: 14,
  },
  customFont: {
    fontFamily: 'serif',
  },
});

export default FarmRecordsScreen;