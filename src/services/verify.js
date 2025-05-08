import api from './api';

/**
 * Verify OTP for user registration or login.
 * @param {string} phoneNumber - E.164 formatted phone number (e.g., 2547xxxxxxx)
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{data: any, error: string|null}>}
 */
export const verifyOtp = async (phoneNumber, otp) => {
  try {
    const response = await api.post('/auth/verify-otp', { phoneNumber, otp });
    return {data: response.data, error: null};
  } catch (error) {
    let msg =
      error?.response?.data?.message ||
      error.message ||
      'OTP verification failed';
    return {data: null, error: msg};
  }
};
