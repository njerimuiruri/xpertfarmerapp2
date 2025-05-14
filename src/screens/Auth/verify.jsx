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
  Button,
  VStack,
  HStack,
  useToast,
  FormControl,
  Pressable,
} from "native-base";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from "../../constants/theme";
import { requestOtp } from "../../services/auth";
import { verifyOtp } from "../../services/verify";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";

const { width } = Dimensions.get("window");
const CELL_COUNT = 6;

export default function VerifyOtp({ navigation, route }) {
  const phoneNumber = route?.params?.phoneNumber || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const otpRef = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });
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
        toast.show({
          description: error,
          placement: "top",
          duration: 3000,
          backgroundColor: "red.500"
        });
        return;
      }
      toast.show({
        description: data?.message || "Account verified! Please login.",
        placement: "top",
        duration: 3000,
        backgroundColor: "green.500"
      });
      navigation.navigate("SignInScreen");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to verify OTP. Please try again.";
      setOtpError(msg);
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

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await requestOtp(phoneNumber);
      toast.show({
        description: "OTP resent successfully!",
        placement: "top",
        duration: 3000,
        backgroundColor: "green.500"
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to resend OTP.";
      toast.show({
        description: msg,
        placement: "top",
        duration: 3000,
        backgroundColor: "red.500"
      });
    } finally {
      setResendLoading(false);
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
                <Icon name="account-check-outline" size={40} color="#059669" />
              </Box>
              <Text fontSize="24" fontWeight="bold" color="green.600">
                Account Verification
              </Text>
              <Text fontSize="14" color="gray.500" textAlign="center" mt={1}>
                Enter the 6-digit code sent to
              </Text>
              <Text fontSize="14" fontWeight="medium" color="gray.700" textAlign="center">
                {phoneNumber ? `+${phoneNumber}` : "your phone"}
              </Text>
            </Box>

            <VStack width="100%" space={4}>
              <FormControl isInvalid={!!otpError}>
                <FormControl.Label>
                  <Text fontSize="16" fontWeight="500" color="gray.700">
                    Verification Code
                  </Text>
                </FormControl.Label>
                <CodeField
                  ref={otpRef}
                  {...otpProps}
                  value={otp}
                  onChangeText={(val) => {
                    setOtp(val);
                    setOtpError("");
                  }}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFieldRoot}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  renderCell={({ index, symbol, isFocused }) => (
                    <Box
                      key={index}
                      onLayout={getCellOnLayoutHandler(index)}
                      backgroundColor={COLORS.lightGreen}
                      style={[styles.cell, isFocused && styles.focusCell, !!otpError && styles.errorCell]}
                    >
                      <Text fontSize={24}>{symbol ? "•" : isFocused ? <Cursor /> : null}</Text>
                    </Box>
                  )}
                />
                <FormControl.ErrorMessage
                  leftIcon={<Icon name="alert-circle-outline" size={20} color="#EF4444" />}
                >
                  {otpError}
                </FormControl.ErrorMessage>
              </FormControl>

              <Button
                onPress={handleSubmit}
                width="100%"
                mt={4}
                backgroundColor="green.500"
                _pressed={{ backgroundColor: "green.600" }}
                padding={4}
                borderRadius={8}
                isLoading={loading}
                isLoadingText="Verifying"
                shadow={3}
              >
                <Text color="white" fontSize="16" fontWeight="bold">
                  VERIFY ACCOUNT
                </Text>
              </Button>

              <HStack mt={6} justifyContent="center" space={1}>
                <Text fontSize="15" color="gray.600">
                  Didn't receive the code?
                </Text>
                <Pressable
                  onPress={handleResend}
                  disabled={resendLoading}
                >
                  <Text fontSize="15" color="green.600" fontWeight="bold">
                    {resendLoading ? "Sending..." : "Resend"}
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

// Shared styles for both components
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
  codeFieldRoot: {
    marginTop: 8,
    marginBottom: 12,
    width: "100%",
    justifyContent: "space-between",
  },
  cell: {
    width: 45,
    height: 55,
    lineHeight: 50,
    fontSize: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: COLORS.lightGreen,
    textAlign: "center",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  focusCell: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  errorCell: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
});