import React, { useState } from "react";
import { Image } from "react-native";
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  Pressable,
} from "native-base";
import CustomIcon from "../../components/CustomIcon";

import { useToast } from "native-base";
import { requestOtp } from "../../services/auth";

export default function ForgotPassword({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");
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

  const handleSubmit = async () => {
    setPhoneError("");
    const sanitizedPhone = sanitizePhoneNumber(phoneNumber);
    if (!sanitizedPhone || sanitizedPhone.length !== 12) {
      setPhoneError("Enter a valid Kenyan phone number");
      return;
    }
    setLoading(true);
    try {
      await requestOtp(sanitizedPhone);
      toast.show({ description: "OTP sent to your phone!", placement: "top", backgroundColor: "green.500" });
      navigation.navigate("OtpSreen", { phoneNumber: sanitizedPhone });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send OTP. Please try again.";
      setPhoneError(msg);
      toast.show({ description: msg, placement: "top", backgroundColor: "red.500" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      paddingX={6}
      backgroundColor="white"
    >
      <Box position="absolute" top={0} left={0}>
        <Image
          source={require("../../assets/images/top-left-decoration.png")}
          style={{ width: 208, height: 144 }}
        />
      </Box>
      {/* <Image
        source={require("../../assets/images/xpertLogo.jpeg")}
        style={{ width: 180, height: 180, marginBottom: 10 }} /> */}
      <Text
        fontSize="22"
        fontWeight="bold"
        color="#74c474"
        mb={5}
      >
        Forgot Password
      </Text>

      <Image
        source={require("../../assets/images/teenyicons_password-outline.png")}
        style={{ width: 40, height: 40, marginBottom: 20 }}
      />

      <Text fontSize="14" mb={5} textAlign="center">
        Please choose your registered email or phone number
      </Text>

      <VStack width="100%" space={2} mb={5}>
        <Text fontSize="16" className="font-semibold" mb={1} color="black">
          Phone Number
        </Text>
        <Input
          variant="filled"
          bg="#e5f3e5"
          width="100%"
          borderRadius={8}
          p={2}
          fontSize={14}
          keyboardType="phone-pad"
          placeholder="07xxxxxxxx"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          InputLeftElement={
            <CustomIcon
              library="AntDesign"
              name="phone"
              size={20}
              color="black"
              style={{ marginLeft: 10 }}
            />
          }
        />
        {phoneError ? (
          <Text color="red.500" fontSize={13} mt={1}>{phoneError}</Text>
        ) : null}
      </VStack>

      <Text marginVertical={2}>OR</Text>

      <Box flexDirection="row" justifyContent="space-around" width="100%">
        <Button
          onPress={() => setIsPhoneSelected(true)}
          variant={isPhoneSelected ? "solid" : "outline"}
          colorScheme="green"
          width="40%"
        >
          Phone
        </Button>
        <Button
          onPress={() => setIsPhoneSelected(false)}
          variant={!isPhoneSelected ? "solid" : "outline"}
          colorScheme="green"
          width="40%"
        >
          Email
        </Button>
      </Box>

      <Button
        onPress={handleSubmit}
        width="100%"
        mt={5}
        backgroundColor="#74c474"

        padding={3}
        borderRadius={8}
        isLoading={loading}
      >
        <Text color="white" fontWeight="bold">
          Next
        </Text>
      </Button>
    </Box>
  );
}