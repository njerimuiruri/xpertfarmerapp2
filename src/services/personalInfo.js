import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function fetchUserProfile() {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log(token);
    const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');

    if (!user?.id) throw new Error('User not found in storage');
    const response = await api.get(`/users/${user.id}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    await AsyncStorage.setItem('user', JSON.stringify(response.data));

    return {data: response.data, error: null};
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch user profile',
    };
  }
}

export async function updateUserProfile(updates) {
  try {
    const token = await AsyncStorage.getItem('token');
    const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');

    if (!user?.id) throw new Error('User not found in storage');
    const response = await api.patch(`/users/${user.id}`, updates, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const updatedUser = {...user, ...response.data};
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

    return {data: response.data, error: null};
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to update user profile',
    };
  }
}
