import React, { useState } from "react";
import { View, ScrollView as RNScrollView, StyleSheet } from "react-native";
import { Text, Input, Button, Select, CheckIcon, Radio, Modal, VStack, HStack, Pressable, Toast } from "native-base";
import FastImage from 'react-native-fast-image';
import { icons } from '../../constants';
import SecondaryHeader from "../../components/headers/secondary-header";

export default function AddLivestockScreen({ navigation }) {
  const [formData, setFormData] = useState({
    idNumber: "",
    breedType: "",
    phenotype: "",
    dateOfBirth: "",
    gender: "",
    sirePhenotype: "",
    dam: "",
    weight: ""
  });

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    const { idNumber, breedType, phenotype, dateOfBirth, gender, sirePhenotype, dam, weight } = formData;

    if (!idNumber || !breedType || !phenotype || !dateOfBirth || !gender || !sirePhenotype || !dam || !weight) {
      Toast.show({
        title: "Error",
        status: "error",
        description: "Please fill in all fields before submitting.",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsLoading(false);
      setShowModal(true);
    }, 1000);
  };

  const handleAddAnother = () => {
    setFormData({
      idNumber: "",
      breedType: "",
      phenotype: "",
      dateOfBirth: "",
      gender: "",
      sirePhenotype: "",
      dam: "",
      weight: ""
    });
    setShowModal(false);
  };

  const renderFormField = (label, value, onChangeText, keyboardType = "default", placeholder = "") => (
    <View style={styles.formField}>
      <Text style={styles.label}>{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
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
      <SecondaryHeader title="Add Livestock Details" />

      <RNScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Fill in the livestock details</Text>

          {renderFormField("ID Number", formData.idNumber,
            (value) => setFormData(prev => ({ ...prev, idNumber: value })))}

          {renderFormField("Breed Type", formData.breedType,
            (value) => setFormData(prev => ({ ...prev, breedType: value })))}

          {renderFormField("Phenotype", formData.phenotype,
            (value) => setFormData(prev => ({ ...prev, phenotype: value })))}

          {renderFormField("Date of Birth (DD/MM/YYYY)", formData.dateOfBirth,
            (value) => setFormData(prev => ({ ...prev, dateOfBirth: value })), "default", "DD/MM/YYYY")}

          <View style={styles.formField}>
            <Text style={styles.label}>Gender</Text>
            <Radio.Group
              name="gender"
              value={formData.gender}
              onChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
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
          </View>

          {renderFormField("Sire Phenotype", formData.sirePhenotype,
            (value) => setFormData(prev => ({ ...prev, sirePhenotype: value })))}

          {renderFormField("Dam", formData.dam,
            (value) => setFormData(prev => ({ ...prev, dam: value })))}

          {renderFormField("Weight (kg)", formData.weight,
            (value) => setFormData(prev => ({ ...prev, weight: value }), "numeric"))}


          <Button className="bg-emerald-600 border-0 py-3">
            <Text className="font-semibold text-white">Submit</Text>
          </Button>
        </View>
      </RNScrollView>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content style={styles.modalContent}>
          <Modal.Body>
            <VStack space={6} alignItems="center" style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add another livestock</Text>
              <Text style={styles.modalSubtitle}>
                Feel free to add another livestock; the more, the better
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
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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