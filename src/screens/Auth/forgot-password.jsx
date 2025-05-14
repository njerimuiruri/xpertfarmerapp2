import React, { useState } from "react";
import {
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Pressable,
  FormControl,
  useToast,
} from "native-base";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { requestOtp } from "../../services/auth";

const { width } = Dimensions.get("window");

export default function ForgotPassword({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [isPhoneSelected, setIsPhoneSelected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const toast = useToast();

  const sanitizePhoneNumber = (input) => {
    let phone = input.replace(/[^\d]/g, "");
    if (phone.startsWith("0")) phone = "254" + phone.slice(1);
    if (phone.startsWith("7") && phone.length === 9) phone = "254" + phone;
    if (!phone.startsWith("254")) phone = "254" + phone;
    return phone;
  };

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return "";

    const sanitized = sanitizePhoneNumber(phone);
    if (sanitized.startsWith("254") && sanitized.length >= 12) {
      return `+${sanitized.slice(0, 3)} ${sanitized.slice(3, 6)} ${sanitized.slice(6, 9)} ${sanitized.slice(9)}`;
    }
    return phone;
  };

  const handlePhoneChange = (text) => {
    setPhoneNumber(text);
    setFormattedPhone(formatPhoneForDisplay(text));
    setPhoneError("");
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setPhoneError("");
    const sanitizedPhone = sanitizePhoneNumber(phoneNumber);

    if (!sanitizedPhone || sanitizedPhone.length !== 12) {
      setPhoneError("Please enter a valid Kenyan phone number");
      return;
    }

    setLoading(true);
    try {
      await requestOtp(sanitizedPhone);
      toast.show({
        description: "OTP sent to your phone!",
        placement: "top",
        duration: 3000,
        backgroundColor: "green.500"
      });
      navigation.navigate("OtpSreen", { phoneNumber: sanitizedPhone });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send OTP. Please try again.";
      setPhoneError(msg);
      toast.show({
        description: msg,
        placement: "top",
        duration: 3000,
        backgroundColor: "red.500"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="white">
          {/* Top left decoration */}
          <Box
            position="absolute"
            top={0}
            left={0}
            width="50%"
            height="20%"
            bg="green.100"
            borderBottomRightRadius="full"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              width="80%"
              height="80%"
              bg="green.200"
              borderBottomRightRadius="full"
            />
          </Box>

          {/* Bottom right decoration */}
          <Box
            position="absolute"
            bottom={0}
            right={0}
            width="30%"
            height="15%"
            bg="green.50"
            borderTopLeftRadius="full"
          />

          <View style={styles.contentContainer}>
            <Box alignItems="center" mb={8}>
              <Box
                width="80px"
                height="80px"
                borderRadius="full"
                bg="green.100"
                justifyContent="center"
                alignItems="center"
                mb={2}
              >
                <Icon name="lock-reset" size={40} color="#059669" />
              </Box>
              <Text fontSize="24" fontWeight="bold" color="green.600">
                Forgot PIN?
              </Text>
              <Text fontSize="14" color="gray.500">
                We'll help you reset it
              </Text>
            </Box>

            <VStack width="100%" space={4}>
              {/* Option Selector */}
              <HStack justifyContent="space-between" width="100%" mb={2}>
                <Button
                  onPress={() => setIsPhoneSelected(true)}
                  flex={1}
                  mr={2}
                  variant={isPhoneSelected ? "solid" : "outline"}
                  backgroundColor={isPhoneSelected ? "green.500" : "white"}
                  borderColor="green.500"
                  _pressed={{ backgroundColor: isPhoneSelected ? "green.600" : "green.50" }}
                >
                  <Text color={isPhoneSelected ? "white" : "green.500"} fontWeight="bold">
                    Phone
                  </Text>
                </Button>
                <Button
                  onPress={() => setIsPhoneSelected(false)}
                  flex={1}
                  ml={2}
                  variant={!isPhoneSelected ? "solid" : "outline"}
                  backgroundColor={!isPhoneSelected ? "green.500" : "white"}
                  borderColor="green.500"
                  _pressed={{ backgroundColor: !isPhoneSelected ? "green.600" : "green.50" }}
                >
                  <Text color={!isPhoneSelected ? "white" : "green.500"} fontWeight="bold">
                    Email
                  </Text>
                </Button>
              </HStack>

              {isPhoneSelected ? (
                <FormControl isInvalid={!!phoneError}>
                  <FormControl.Label>
                    <Text fontSize="16" fontWeight="500" color="gray.700">
                      Phone Number
                    </Text>
                  </FormControl.Label>
                  <Input
                    variant="filled"
                    width="100%"
                    height={12}
                    backgroundColor="green.50"
                    borderColor="green.100"
                    borderWidth={1}
                    paddingLeft={4}
                    borderRadius={8}
                    value={formattedPhone || phoneNumber}
                    onChangeText={handlePhoneChange}
                    placeholder="Enter phone number"
                    fontSize="16"
                    InputLeftElement={<Icon name="phone-outline" size={24} style={{ marginLeft: 8 }} color="green" />}
                  />
                  <FormControl.ErrorMessage
                    leftIcon={<Icon name="alert-circle-outline" size={20} color="#EF4444" />}
                  >
                    {phoneError}
                  </FormControl.ErrorMessage>
                  <FormControl.HelperText>Format: 07XX XXX XXX or 254 7XX XXX XXX</FormControl.HelperText>
                </FormControl>
              ) : (
                <FormControl>
                  <FormControl.Label>
                    <Text fontSize="16" fontWeight="500" color="gray.700">
                      Email Address
                    </Text>
                  </FormControl.Label>
                  <Input
                    variant="filled"
                    width="100%"
                    height={12}
                    backgroundColor="green.50"
                    borderColor="green.100"
                    borderWidth={1}
                    paddingLeft={4}
                    borderRadius={8}
                    placeholder="Enter email address"
                    fontSize="16"
                    InputLeftElement={<Icon name="email-outline" size={24} style={{ marginLeft: 8 }} color="green" />}
                  />
                  <FormControl.HelperText>Enter your registered email address</FormControl.HelperText>
                </FormControl>
              )}

              <Button
                onPress={handleSubmit}
                width="100%"
                mt={4}
                backgroundColor="green.500"
                _pressed={{ backgroundColor: "green.600" }}
                padding={4}
                borderRadius={8}
                isLoading={loading}
                isLoadingText="Sending OTP"
                shadow={3}
              >
                <Text color="white" fontSize="16" fontWeight="bold">
                  SEND OTP
                </Text>
              </Button>

              <HStack mt={6} justifyContent="center" space={1}>
                <Text fontSize="15" color="gray.600">
                  Remember your PIN?
                </Text>
                <Pressable onPress={() => navigation.navigate("SignInScreen")}>
                  <Text fontSize="15" color="green.600" fontWeight="bold">
                    Login
                  </Text>
                </Pressable>
              </HStack>
            </VStack>
          </View>
        </Box>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    width: width * 0.9,
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});