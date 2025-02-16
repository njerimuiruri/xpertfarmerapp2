import React, { useState } from "react";
import { View, ScrollView as RNScrollView, StyleSheet } from "react-native";
import { Text, Input, Button, Select, CheckIcon, Modal, VStack, HStack, Pressable } from "native-base";
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import SecondaryHeader from "../../components/headers/secondary-header";

export default function AddLivestockGroupScreen({ navigation }) {
  const [formData, setFormData] = useState({
    groupName: "",
    groupId: "",
    selectedAnimalIds: [],
  });

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = () => {
    console.log('Group submitted:', formData);
    setShowModal(true);
  };

  const handleAddAnother = () => {
    setFormData({
      groupName: "",
      groupId: "",
      selectedAnimalIds: [],
    });
    setShowModal(false);
  };

  const renderFormField = (label, value, onChangeText, placeholder = "") => (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
        backgroundColor="#e8f5e9"
        borderWidth={0}
        fontSize="sm"
        height={10}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <SecondaryHeader title="Add Livestock Group" />
      <RNScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Fill in the group livestock details</Text>

          {renderFormField("Group Name", formData.groupName,
            (value) => setFormData(prev => ({ ...prev, groupName: value })))}

          {renderFormField("Group ID", formData.groupId,
            (value) => setFormData(prev => ({ ...prev, groupId: value })))}

          <View style={styles.formField}>
            <Text style={styles.label}>Select Animal IDs</Text>
            <Select
              selectedValue={formData.selectedAnimalIds}
              onValueChange={(itemValue) => {
                const selectedIds = formData.selectedAnimalIds.includes(itemValue)
                  ? formData.selectedAnimalIds.filter(id => id !== itemValue)
                  : [...formData.selectedAnimalIds, itemValue];
                setFormData(prev => ({ ...prev, selectedAnimalIds: selectedIds }));
              }}
              placeholder="Select Animal IDs"
              backgroundColor="#e8f5e9"
            >
              <Select.Item label="Animal ID 1" value="animal1" />
              <Select.Item label="Animal ID 2" value="animal2" />
              <Select.Item label="Animal ID 3" value="animal3" />
              <Select.Item label="Animal ID 4" value="animal4" />
            </Select>
            {/* <CheckIcon /> */}
          </View>

          <Button className="bg-emerald-600 border-0 py-3">
            <Text className="font-semibold text-white">Submit</Text>
          </Button>
        </View>
      </RNScrollView>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content style={styles.modalContent}>
          <Modal.Body>
            <VStack space={6} alignItems="center" style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add another livestock group</Text>
              <Text style={styles.modalSubtitle}>
                Feel free to add another livestock group, the more the better
              </Text>
              <HStack space={4} width="100%">
                <Button
                  flex={1}
                  variant="outline"
                  onPress={() => navigation.goBack()}
                  style={styles.modalButton}
                >
                  <Text color="#666">No</Text>
                </Button>
                <Button
                  flex={1}
                  onPress={handleAddAnother}
                  style={[styles.modalButton, styles.modalSubmitButton]}
                >
                  <Text color="white">Yes</Text>
                </Button>
              </HStack>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingVertical: 40,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: '#8bc34a',
    textAlign: 'center',
    fontWeight: 'bold',
    flex: 1,
  },
  greenLine: {
    height: 2,
    backgroundColor: '#8bc34a',
    width: '100%',
    alignSelf: 'center',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 24, // Increased padding for height
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 400, // Set a minimum height to ensure it's taller
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    height: 45,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#8bc34a',
    borderWidth: 0,
  },
  modalContent: {
    borderRadius: 16,
    margin: 20,
  },
  modalContainer: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalButton: {
    height: 45,
    borderRadius: 8,
  },
  modalSubmitButton: {
    backgroundColor: '#8bc34a',
    borderWidth: 0,
  }
});