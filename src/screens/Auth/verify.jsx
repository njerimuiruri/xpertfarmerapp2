import React, { useRef, useState } from "react";
import { Image, Keyboard, Alert } from "react-native";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  useToast,
  FormControl,
} from "native-base";
import { requestOtp, resetPassword } from "../../services/auth";
import { verifyOtp } from "../../services/verify";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";

export default function VerifyOtp({ navigation, route }) {
  const phoneNumber = route?.params?.phoneNumber || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const otpRef = useBlurOnFulfill({ value: otp, cellCount: 6 });
  const [otpProps, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });
  const toast = useToast();

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP sent to your phone.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await verifyOtp(phoneNumber, otp);
      if (error) {
        setOtpError(error);
        toast.show({ description: error, placement: "top", backgroundColor: "red.500" });
        return;
      }
      toast.show({ description: data?.message || "Account verified! Please login.", placement: "top", backgroundColor: "green.500" });
      navigation.navigate("SignInScreen");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to verify OTP. Please try again.";
      setOtpError(msg);
      toast.show({ description: msg, placement: "top", backgroundColor: "red.500" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await requestOtp(phoneNumber);
      toast.show({ description: "OTP resent successfully!", placement: "top", backgroundColor: "green.500" });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to resend OTP.";
      toast.show({ description: msg, placement: "top", backgroundColor: "red.500" });
    } finally {
      setResendLoading(false);
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
      <Text
        fontSize="22"
        fontWeight="bold"
        color="#74c474"
        marginBottom={4}
      >
        OTP
      </Text>
      <Text fontSize="14" marginBottom={4} color="black" textAlign="center">
        Enter the 6-digit OTP sent to your phone number {phoneNumber ? `(+${phoneNumber})` : ""} to verify your account.
      </Text>
      <FormControl isInvalid={!!otpError} width="100%" alignItems="center" mb={2}>
        <CodeField
          ref={otpRef}
          {...otpProps}
          value={otp}
          onChangeText={(val) => {
            setOtp(val);
            setOtpError("");
          }}
          cellCount={6}
          rootStyle={{ marginBottom: 12, width: "100%" }}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <Box
              key={index}
              onLayout={getCellOnLayoutHandler(index)}
              style={{
                width: 50,
                height: 50,
                borderWidth: 1,
                borderColor: otpError ? "#EF4444" : isFocused ? "#10B981" : "#E5E7EB",
                backgroundColor: otpError ? "#FEF2F2" : isFocused ? "#ECFDF5" : "#F9FAFB",
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: 2,
              }}
            >
              <Text fontSize={24}>{symbol ? "•" : isFocused ? <Cursor /> : null}</Text>
            </Box>
          )}
        />
        <FormControl.ErrorMessage>{otpError}</FormControl.ErrorMessage>
      </FormControl>
      <Button
        onPress={handleSubmit}
        width="100%"
        backgroundColor="#74c474"
        padding={3}
        borderRadius={8}
        isLoading={loading}
        mb={2}
      >
        <Text color="white" fontWeight="bold">
          Submit
        </Text>
      </Button>
      <Button
        variant="ghost"
        onPress={handleResend}
        isLoading={resendLoading}
        _text={{ color: "#74c474", fontWeight: "bold" }}
      >
        Resend OTP
      </Button>
    </Box>
  );
}