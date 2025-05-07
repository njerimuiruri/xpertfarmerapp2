import React, { useState } from "react";
import { Image } from "react-native";
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import {
  Box,
  Text,
  Button,
  VStack,
} from "native-base";

export default function EmailOtpScreen({ navigation }) {
  const [otp, setOtp] = useState("");

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
        style={{ width: 180, height: 180, marginBottom: 10 }}
      /> */}

      <Text
        fontSize="22"
        fontWeight="bold"
        color="#74c474"
        marginBottom={4}
      >
        Email OTP
      </Text>

      <Text fontSize="14" marginBottom={4} color="black" textAlign="center">
        Enter the OTP sent to your Email address
      </Text>

      <VStack width="100%" space={2}>
        <CodeField
          value={otp}
          onChangeText={setOtp}
          cellCount={4}
          rootStyle={{
            marginBottom: 20,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 8
          }}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <Box
              key={index}
              width="60px"
              height="60px"
              borderWidth={0}
              borderRadius={8}
              justifyContent="center"
              alignItems="center"
              backgroundColor="#e5f3e5"
            >
              <Text fontSize={24}>{symbol ? '•' : isFocused ? <Cursor /> : null}</Text>
            </Box>
          )}
        />
      </VStack>

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