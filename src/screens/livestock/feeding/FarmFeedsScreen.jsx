import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Box, Text, VStack, Checkbox, Button, HStack } from 'native-base';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { COLORS } from '../../../constants/theme';

export default function FarmFeedsScreen({ navigation }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedAnimalType, setSelectedAnimalType] = useState(null);
  const [selectedLifecycleStages, setSelectedLifecycleStages] = useState([]);

  const lifecycleStages = {
    single: {
      'Dairy': ['Calf', 'Heifer', 'Lactating cows', 'Dry Cows'],
      'Beef': ['Starter', 'Grower', 'Finisher'],
      'Swine': ['Starter', 'Grower', 'Finisher', 'Breeding herd'],
      'Poultry': ['Starter', 'Grower', 'Finisher', 'Layer'],
      'Sheep & Goats': ['Lambs and Kids', 'Growing', 'Production', 'Maintenance']
    },
    group: {
      'Dairy': ['Calf', 'Heifer', 'Lactating cows', 'Dry Cows'],
      'Beef': ['Starter', 'Grower', 'Finisher'],
      'Swine': ['Starter', 'Grower', 'Finisher', 'Breeding herd'],
      'Poultry': ['Starter', 'Grower', 'Finisher', 'Layer'],
      'Sheep & Goats': ['Lambs and Kids', 'Growing', 'Production', 'Maintenance']
    }
  };

  const handleProgramSelection = (program) => {
    setSelectedProgram(program === selectedProgram ? null : program);
    setSelectedAnimalType(null);
    setSelectedLifecycleStages([]);
  };

  const handleAnimalTypeSelection = (animalType) => {
    setSelectedAnimalType(animalType === selectedAnimalType ? null : animalType);
    setSelectedLifecycleStages([]);
  };

  const handleLifecycleStageSelection = (stage) => {
    setSelectedLifecycleStages((prev) =>
      prev.includes(stage)
        ? prev.filter((s) => s !== stage) 
        : [...prev, stage] 
    );
  };

  const isSelectionComplete = selectedProgram && selectedAnimalType && selectedLifecycleStages.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Farm Feeds Selection" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} width="100%">
          <VStack space={4} mb={4}>
            <Text style={styles.sectionTitle}>Select Feeding Program</Text>
            <VStack space={2}>
              <Checkbox 
                value="single"
                isChecked={selectedProgram === 'single'}
                onChange={() => handleProgramSelection('single')}
                colorScheme="green"
              >
                Single Animal Feeding Program
              </Checkbox>
              <Checkbox 
                value="group"
                isChecked={selectedProgram === 'group'}
                onChange={() => handleProgramSelection('group')}
                colorScheme="green"
              >
                Group Feeding Program
              </Checkbox>
            </VStack>
          </VStack>

          {selectedProgram && (
            <VStack space={4} mb={4}>
              <Text style={styles.sectionTitle}>Select Animal Type</Text>
              <VStack space={2}>
                {Object.keys(lifecycleStages[selectedProgram]).map((type) => (
                  <Checkbox 
                    key={type}
                    value={type}
                    isChecked={selectedAnimalType === type}
                    onChange={() => handleAnimalTypeSelection(type)}
                    colorScheme="green"
                  >
                    {type}
                  </Checkbox>
                ))}
              </VStack>
            </VStack>
          )}

          {selectedAnimalType && (
            <VStack space={4} mb={4}>
              <Text style={styles.sectionTitle}>Select Lifecycle Stage</Text>
              <VStack space={2}>
                {lifecycleStages[selectedProgram][selectedAnimalType].map((stage) => (
                  <Checkbox 
                    key={stage}
                    value={stage}
                    isChecked={selectedLifecycleStages.includes(stage)}
                    onChange={() => handleLifecycleStageSelection(stage)}
                    colorScheme="green"
                  >
                    {stage}
                  </Checkbox>
                ))}
              </VStack>
            </VStack>
          )}

          {isSelectionComplete && (
            <Box bg={COLORS.lightGreen} p={4} borderRadius={8} mt={4} mb={4}>
              <Text style={styles.summaryTitle}>Selection Summary</Text>
              <Text style={styles.summaryText}>Feeding Program: {selectedProgram}</Text>
              <Text style={styles.summaryText}>Animal Type: {selectedAnimalType}</Text>
              <Text style={styles.summaryText}>Lifecycle Stages: {selectedLifecycleStages.join(', ')}</Text>
            </Box>
          )}

          {/* Back & Next Buttons (only appear when all selections are made) */}
          {isSelectionComplete && (
            <HStack justifyContent="space-between" style={styles.buttonContainer}>
              <Button
                variant="outline"
                borderColor={COLORS.green}
                style={styles.button}
                onPress={() => navigation.goBack()}
              >
                Back
              </Button>
              <Button
                backgroundColor={COLORS.green}
                style={styles.button}
                onPress={() => navigation.navigate('AnimalFeedingProgramScreen')}
              >
                Next
              </Button>
            </HStack>
          )}
        </Box>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start', 
    padding: 20,
    backgroundColor: COLORS.lightGreen,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.black,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.green,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.darkGray3,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20, // Add margin to separate from checkboxes
  },
  button: {
    width: 140,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
  },
});

