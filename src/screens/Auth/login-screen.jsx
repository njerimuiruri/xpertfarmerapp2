import { useState, useEffect } from "react"
import {
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native"
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field"
import { Box, Text, Input, Button, VStack, HStack, Pressable, FormControl, Checkbox, useToast } from "native-base"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { login } from "../../services/auth"
import { COLORS } from "../../constants/theme";

const { width } = Dimensions.get("window")
const CELL_COUNT = 4

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [formattedPhone, setFormattedPhone] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [pinError, setPinError] = useState("")

  const toast = useToast()

  const pinRef = useBlurOnFulfill({ value: pin, cellCount: CELL_COUNT })
  const [pinProps, getCellOnLayoutHandler] = useClearByFocusCell({
    value: pin,
    setValue: setPin,
  })

  useEffect(() => {
    checkSavedCredentials()
  }, [])

  const checkSavedCredentials = async () => {
    try {
      const savedPhone = await AsyncStorage.getItem("savedPhone")
      if (savedPhone) {
        setPhoneNumber(savedPhone)
        setFormattedPhone(formatPhoneForDisplay(savedPhone))
        setRememberMe(true)
      }
    } catch (error) {
      console.log("Error retrieving saved credentials:", error)
    }
  }

  const sanitizePhoneNumber = (input) => {
    let phone = input.replace(/[^\d]/g, "")
    if (phone.startsWith("0")) phone = "254" + phone.slice(1)
    if (phone.startsWith("7") && phone.length === 9) phone = "254" + phone
    if (!phone.startsWith("254")) phone = "254" + phone
    return phone
  }

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return ""

    const sanitized = sanitizePhoneNumber(phone)
    if (sanitized.startsWith("254") && sanitized.length >= 12) {
      return `+${sanitized.slice(0, 3)} ${sanitized.slice(3, 6)} ${sanitized.slice(6, 9)} ${sanitized.slice(9)}`
    }
    return phone
  }

  const handlePhoneChange = (text) => {
    setPhoneNumber(text)
    setFormattedPhone(formatPhoneForDisplay(text))
    setPhoneError("")
  }

  const validateForm = () => {
    let isValid = true
    const sanitizedPhone = sanitizePhoneNumber(phoneNumber)

    if (!sanitizedPhone || sanitizedPhone.length !== 12) {
      setPhoneError("Please enter a valid Kenyan phone number")
      isValid = false
    } else {
      setPhoneError("")
    }

    if (!pin) {
      setPinError("Please enter your PIN")
      isValid = false
    } else if (pin.length !== 4) {
      setPinError("PIN must be 4 digits")
      isValid = false
    } else {
      setPinError("")
    }

    return isValid
  }

  const handleLogin = async () => {
    Keyboard.dismiss()

    if (!validateForm()) {
      return
    }

    const sanitizedPhone = sanitizePhoneNumber(phoneNumber)

    setLoading(true)
    try {
      const response = await login(sanitizedPhone, pin)
      if (response) {
        if (rememberMe) {
          await AsyncStorage.setItem("savedPhone", sanitizedPhone)
        } else {
          await AsyncStorage.removeItem("savedPhone")
        }

        if (response.user && response.user.isVerified === false) {
          toast.show({
            description: "Account not verified. OTP has been sent to your phone.",
            placement: "top",
            duration: 3000,
            backgroundColor: "amber.500",
          }),
            navigation.navigate("VerifyOtp", { phoneNumber: sanitizedPhone });
        } else {
          toast.show({
            description: "Login successful!",
            placement: "top",
            duration: 2000,
            backgroundColor: "green.500",
          })

          navigation.navigate("DrawerNav")
        }
      } else {
        toast.show({
          description: response.message || "Login failed. Please check your credentials.",
          placement: "top",
          duration: 3000,
          backgroundColor: "red.500",
        })
      }
    } catch (error) {
      console.log(error.message)
      const msg = error.response?.data?.message || "Something went wrong. Please try again."
      toast.show({
        description: msg,
        placement: "top",
        duration: 3000,
        backgroundColor: "red.500",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="white">
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

          <Box
            position="absolute"
            bottom={0}
            right={0}
            width="30%"
            height="15%"
            bg="green.50"
            borderTopLeftRadius="full"
          />

          <View
            style={[
              styles.contentContainer
            ]}
          >
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
                <Icon name="account-circle-outline" size={40} color="#059669" />
              </Box>
              <Text fontSize="24" fontWeight="bold" color="green.600">
                Welcome Back
              </Text>
              <Text fontSize="14" color="gray.500">
                Sign in to continue
              </Text>
            </Box>

            <VStack width="100%" space={4}>
              {/* Phone Number Input */}
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

              <FormControl isInvalid={!!pinError}>
                <FormControl.Label>
                  <Text fontSize="16" fontWeight="500" color="gray.700">
                    4-digit PIN
                  </Text>
                </FormControl.Label>
                <CodeField
                  ref={pinRef}
                  {...pinProps}
                  value={pin}
                  onChangeText={(text) => {
                    setPin(text)
                    setPinError("")
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

                      style={[styles.cell, isFocused && styles.focusCell, !!pinError && styles.errorCell]}
                    >
                      <Text fontSize={24}>{symbol ? "•" : isFocused ? <Cursor /> : null}</Text>
                    </Box>
                  )}
                />
                <FormControl.ErrorMessage
                  leftIcon={<Icon name="alert-circle-outline" size={20} color="#EF4444" />}
                >
                  {pinError}
                </FormControl.ErrorMessage>
              </FormControl>

              <HStack justifyContent="space-between" alignItems="center" mt={1}>
                <Checkbox
                  value="rememberMe"
                  isChecked={rememberMe}
                  onChange={setRememberMe}
                  colorScheme="green"
                  accessibilityLabel="Remember me"
                >
                  <Text fontSize="14" color="gray.600">
                    Remember me
                  </Text>
                </Checkbox>
                <Pressable onPress={() => navigation.navigate("ForgotPasswordScreen")}>
                  <Text fontSize="14" color="green.600" fontWeight="500">
                    Forgot PIN?
                  </Text>
                </Pressable>
              </HStack>

              <Button
                onPress={handleLogin}
                width="100%"
                mt={4}
                backgroundColor="green.500"
                _pressed={{ backgroundColor: "green.600" }}
                padding={4}
                borderRadius={8}
                isLoading={loading}
                isLoadingText="Logging in"
                shadow={3}
              >
                <Text color="white" fontSize="16" fontWeight="bold">
                  LOGIN
                </Text>
              </Button>

              {/* Register Link */}
              <HStack mt={6} justifyContent="center" space={1}>
                <Text fontSize="15" color="gray.600">
                  Don't have an account?
                </Text>
                <Pressable onPress={() => navigation.navigate("SignupScreen")}>
                  <Text fontSize="15" color="green.600" fontWeight="bold">
                    Register
                  </Text>
                </Pressable>
              </HStack>
            </VStack>
          </View>
        </Box>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
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
  codeFieldRoot: {
    marginTop: 8,
    marginBottom: 12,
    width: "100%",
  },
  cell: {
    width: 60,
    height: 60,
    lineHeight: 55,
    fontSize: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: COLORS.lightGreen,
    textAlign: "center",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  focusCell: {
    borderColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  errorCell: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
})
