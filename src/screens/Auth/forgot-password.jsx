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

export default function ForgotPassword({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isPhoneSelected, setIsPhoneSelected] = useState(true);

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

      {isPhoneSelected ? (
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
        </VStack>
      ) : (
        <VStack width="100%" space={2} mb={5}>
          <Text fontSize="16" className="font-semibold" mb={1} color="black">
            Email
          </Text>
          <Input
            variant="filled"
            bg="#e5f3e5"
            width="100%"
            borderRadius={8}
            p={2}
            fontSize={14}
            keyboardType="email-address"
            placeholder="support@xcapital.com"
            value={email}
            onChangeText={setEmail}
            InputLeftElement={
              <CustomIcon
                library="AntDesign"
                name="mail"
                size={20}
                color="black"
                style={{ marginLeft: 10 }}
              />
            }
          />
        </VStack>
      )}

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
        onPress={() => {
          if (isPhoneSelected) {
            navigation.navigate("OtpSreen");
          } else {
            navigation.navigate("EmailOtpScreen");
          }
        }}
        width="100%"
        mt={5}
        backgroundColor="#74c474"
        padding={3}
        borderRadius={8}
      >
        <Text color="white" fontWeight="bold">
          Next
        </Text>
      </Button>
    </Box>
  );
}