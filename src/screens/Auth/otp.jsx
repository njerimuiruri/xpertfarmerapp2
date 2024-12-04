import React, { useRef } from "react";
import { Image } from "react-native";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Input,
} from "native-base";

export default function Otp({ navigation }) {
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleInputChange = (index, value) => {
    if (value) {
      if (index < inputRefs.length - 1) {
        inputRefs[index + 1].current.focus();
      }
    } else {
      if (index > 0) {
        inputRefs[index - 1].current.focus();
      }
    }
  };

  return (
    <Box
      flex={1}
      justifyContent="center"
      alignItems="center"
      paddingX={5}
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
        marginBottom={4}
      >
        OTP
      </Text>

      <Text fontSize="14" marginBottom={4} color="black" textAlign="center">
        Enter OTP sent to your Phone number
      </Text>

      <HStack space={2} marginBottom={6}>
        {[...Array(4)].map((_, index) => (
          <Input
            key={index}
            ref={inputRefs[index]}
            variant="filled"
            width={50}
            height={50}
            backgroundColor="#e5f3e5"
            textAlign="center"
            borderRadius={8}
            fontSize={18}
            maxLength={1}
            keyboardType="numeric"
            onChangeText={(value) => {
              handleInputChange(index, value);
            }}
          />
        ))}
      </HStack>

      <Button
        onPress={() => navigation.navigate('ResetPasswordScreen')}
        width="100%"
        backgroundColor="#74c474"
        padding={3}
        borderRadius={8}
      >
        <Text color="white" fontWeight="bold">
          Submit
        </Text>
      </Button>
    </Box>
  );
}