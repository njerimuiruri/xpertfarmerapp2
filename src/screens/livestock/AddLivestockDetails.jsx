import React, { useState } from "react";
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
} from "native-base";
import { View, StyleSheet } from "react-native";
import SecondaryHeader from "../../components/headers/secondary-header";
import { COLORS } from "../../constants/theme";

export default function AddLivestockScreen({ navigation }) {
  const [formData, setFormData] = useState({
    idNumber: "",
    breedType: "",
    phenotype: "",
    dateOfBirth: "",
    gender: "",
    sirePhenotype: "",
    dam: "",
    weight: 0, 
  });

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = () => {
    setShowModal(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.lightGreen }}>
      <SecondaryHeader title="Add Livestock" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Box bg="white" p={6} borderRadius={8} shadow={1} mx={6} my={8}>
          <Text style={styles.titleText}>Fill in the Livestock Details</Text>

          <VStack space={5}>
            <Box>
              <Text style={styles.label}>ID Number</Text>
              <Input
                value={formData.idNumber}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, idNumber: value }))
                }
                placeholder="Enter ID Number"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Breed Type</Text>
              <Input
                value={formData.breedType}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, breedType: value }))
                }
                placeholder="Enter Breed Type"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Phenotype</Text>
              <Input
                value={formData.phenotype}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, phenotype: value }))
                }
                placeholder="Enter Phenotype"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Date of Birth</Text>
              <Input
                value={formData.dateOfBirth}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, dateOfBirth: value }))
                }
                placeholder="DD/MM/YYYY"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Gender</Text>
              <Radio.Group
                name="gender"
                value={formData.gender}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, gender: value }))
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
            </Box>

            <Box>
              <Text style={styles.label}>Male Parent</Text>
              <Input
                value={formData.sirePhenotype}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, sirePhenotype: value }))
                }
                placeholder="Enter Male Parent's Phenotype"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Female Parent</Text>
              <Input
                value={formData.dam}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, dam: value }))
                }
                placeholder="Enter Female Parent Information"
                backgroundColor={COLORS.lightGreen}
                borderColor="gray.200"
              />
            </Box>

            <Box>
              <Text style={styles.label}>Weight (kg)</Text>
              <HStack alignItems="center" space={2}>
                <Button
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      weight: Math.max(0, prev.weight - 1),
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
                  value={formData.weight.toString()}
                  onChangeText={(text) => {
                    const numericValue = parseInt(text) || 0;
                    setFormData((prev) => ({
                      ...prev,
                      weight: Math.max(0, numericValue),
                    }));
                  }}
                />
                <Button
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      weight: prev.weight + 1,
                    }))
                  }
                  variant="outline"
                  p={2}
                >
                  +
                </Button>
              </HStack>
            </Box>

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
          </VStack>
        </Box>
      </ScrollView>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content borderRadius={12} p={5}>
          <Modal.Body alignItems="center">
            <Text style={styles.modalText}>
              Your Livestock Details have been successfully added!
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
              Cancel
            </Button>
            <Button
              backgroundColor={COLORS.green}
              style={styles.modalButton}
              onPress={() => {
                setShowModal(false);
                // Optionally clear form data here if needed
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
    marginTop: 5,
  },
  titleText: {
    fontSize: 16,
    color: "black",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
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