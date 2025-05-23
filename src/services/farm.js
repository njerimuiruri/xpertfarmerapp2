import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createFarm(data) {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log(' Retrieved Token:', token);
    const userRaw = await AsyncStorage.getItem('user');
    const user = JSON.parse(userRaw || '{}');
    const userId = user?.id;

    if (!token || !userId) {
      return {
        data: null,
        error: 'Authentication failed: missing token or user ID',
      };
    }

    const payload = {...data, userId};

    const response = await api.post('/farms', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      ' [createFarm] Response:',
      JSON.stringify(response.data, null, 2),
    );
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      ' [createFarm] Error Full:',
      JSON.stringify(error?.response?.data || error.message, null, 2),
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create farm',
    };
  }
}

export async function getUserFarms() {
  const token = await AsyncStorage.getItem('token');
  const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');

  try {
    const response = await api.get(`/users/${user.id}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    return {data: response.data.farms || [], error: null};
  } catch (error) {
    return {
      data: null,
      error: error.message || 'Failed to retrieve farms',
    };
  }
}

export async function getFarmById(id) {
  const token = await AsyncStorage.getItem('token');
  try {
    const response = await api.get(`/farms/${id}`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    return response.data;
  } catch (error) {
    throw (
      error?.response?.data?.message || error.message || 'Failed to fetch farm'
    );
  }
}

export async function updateFarm(id, data) {
  const token = await AsyncStorage.getItem('token');

  try {
    const response = await api.patch(`/farms/${id}`, data, {
      headers: {Authorization: `Bearer ${token}`},
    });

    const userId = JSON.parse((await AsyncStorage.getItem('user')) || '{}')?.id;
    const freshUser = await api.get(`/users/${userId}`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    await AsyncStorage.setItem('user', JSON.stringify(freshUser.data));

    return response.data;
  } catch (error) {
    console.error(
      ' Update Farm Error:',
      error?.response?.data || error.message,
    );
    throw (
      error?.response?.data?.message || error.message || 'Failed to update farm'
    );
  }
}

export async function deleteFarm(id) {
  const token = await AsyncStorage.getItem('token');
  const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');

  try {
    await api.delete(`/farms/${id}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    const freshUser = await api.get(`/users/${user.id}`, {
      headers: {Authorization: `Bearer ${token}`},
    });
    await AsyncStorage.setItem('user', JSON.stringify(freshUser.data));

    return true;
  } catch (error) {
    throw (
      error?.response?.data?.message || error.message || 'Failed to delete farm'
    );
  }
}

export async function getActiveFarm() {
  const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');
  const farms = user?.farms || [];

  if (farms.length === 0) return null;

  const farm = farms[0];

  return {
    id: farm.id,
    name: farm.name,
    location: farm.administrativeLocation,
    size: `${farm.size} acres`,
    animals: Array.isArray(farm.farmingTypes) ? farm.farmingTypes : [],
  };
}
