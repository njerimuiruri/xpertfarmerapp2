import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function login(phoneNumber, pin) {
  try {
    console.log('Login request:', {phoneNumber, pin});
    const response = await api.post('/auth/login', {phoneNumber, pin});
    await AsyncStorage.setItem('token', response.data?.token || '');
    await AsyncStorage.setItem(
      'user',
      JSON.stringify(response.data?.user || {}),
    );
    return response.data;
  } catch (error) {
    console.error('Error in login:', error);
    throw error;
  }
}

export async function logout() {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
}

export async function getCurrentUser() {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export async function requestOtp(phoneNumber) {
  try {
    const response = await api.post('/auth/request-reset', {phoneNumber});
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function resetPassword(phoneNumber, otp, newPin) {
  try {
    const response = await api.post('/auth/reset-password', {
      phoneNumber,
      otp,
      newPin,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
