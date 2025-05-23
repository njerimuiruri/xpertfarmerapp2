import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createFarm(payload) {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    console.log('Creating farm with payload:', payload);

    const response = await api.post('/farms', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Farm creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating farm:', error);
    throw (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to create farm'
    );
  }
}

export async function getFarms() {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await api.get('/farms', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching farms:', error);
    throw (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to fetch farms'
    );
  }
}
