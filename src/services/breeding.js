import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createBreedingRecord(data) {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Retrieved Token:', token);

    const userRaw = await AsyncStorage.getItem('user');
    const user = JSON.parse(userRaw || '{}');
    const userId = user?.id;

    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    if (!token || !userId) {
      return {
        data: null,
        error: 'Authentication failed: missing token or user ID',
      };
    }

    if (!farmId) {
      return {
        data: null,
        error: 'No active farm selected. Please select a farm first.',
      };
    }

    const payload = {
      damId: data.damId,
      sireId: data.sireId,
      farmId,
      purpose: data.purpose,
      strategy: data.strategy,
      serviceType: data.serviceType,
      serviceDate: data.serviceDate,
      numServices: parseInt(data.numServices) || 1,
      firstHeatDate: data.firstHeatDate,
      sireCode: data.sireCode,
      aiType: data.aiType,
      aiSource: data.aiSource,
      aiCost: parseFloat(data.aiCost) || 0,
      gestationDays: parseInt(data.gestationDays) || 280,
      expectedBirthDate: data.expectedBirthDate,
      // Birth details (if provided)
      ...(data.birthRecorded && {
        birthDate: data.birthDate,
        deliveryMethod: data.deliveryMethod,
        youngOnes: parseInt(data.youngOnes) || 1,
        birthWeight: parseFloat(data.birthWeight) || 0,
        litterWeight: parseFloat(data.litterWeight) || 0,
        offspringSex: data.offspringSex,
        offspringIds: data.offspringIds,
      }),
    };

    console.log(
      'Creating breeding record with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.post('/breeding', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[createBreedingRecord] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error('[createBreedingRecord] Full Error Object:', error);
    console.error('[createBreedingRecord] Error Response:', error?.response);
    console.error(
      '[createBreedingRecord] Error Status:',
      error?.response?.status,
    );
    console.error('[createBreedingRecord] Error Data:', error?.response?.data);

    let errorMessage = 'Failed to create breeding record';

    if (error?.response?.status === 500) {
      errorMessage =
        'Server error occurred. Please check your backend logs and try again.';
    } else if (error?.response?.status === 400) {
      errorMessage = error?.response?.data?.message || 'Invalid data provided';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage = 'Permission denied. You may not have access to this farm.';
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return {
      data: null,
      error: errorMessage,
    };
  }
}

export async function getAllBreedingRecords() {
  try {
    const token = await AsyncStorage.getItem('token');
    const userRaw = await AsyncStorage.getItem('user');
    const user = JSON.parse(userRaw || '{}');
    const userId = user?.id;

    if (!token || !userId) {
      return {
        data: null,
        error: 'Authentication failed: missing token or user ID',
      };
    }

    const response = await api.get('/breeding', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {data: response.data || [], error: null};
  } catch (error) {
    console.error(
      '[getAllBreedingRecords] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve breeding records',
    };
  }
}

export async function getBreedingRecordById(id) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication failed: missing token');
    }

    const response = await api.get(`/breeding/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      '[getBreedingRecordById] Error:',
      error?.response?.data || error.message,
    );
    throw (
      error?.response?.data?.message ||
      error.message ||
      'Failed to fetch breeding record'
    );
  }
}

export async function updateBreedingRecord(id, data) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const payload = {
      damId: data.damId,
      sireId: data.sireId,
      purpose: data.purpose,
      strategy: data.strategy,
      serviceType: data.serviceType,
      serviceDate: data.serviceDate,
      numServices: parseInt(data.numServices) || 1,
      firstHeatDate: data.firstHeatDate,
      sireCode: data.sireCode,
      aiType: data.aiType,
      aiSource: data.aiSource,
      aiCost: parseFloat(data.aiCost) || 0,
      gestationDays: parseInt(data.gestationDays) || 280,
      expectedBirthDate: data.expectedBirthDate,
      // Birth details (if provided)
      ...(data.birthRecorded && {
        birthDate: data.birthDate,
        deliveryMethod: data.deliveryMethod,
        youngOnes: parseInt(data.youngOnes) || 1,
        birthWeight: parseFloat(data.birthWeight) || 0,
        litterWeight: parseFloat(data.litterWeight) || 0,
        offspringSex: data.offspringSex,
        offspringIds: data.offspringIds,
      }),
    };

    console.log(
      '[updateBreedingRecord] Transformed payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.patch(`/breeding/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[updateBreedingRecord] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateBreedingRecord] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update breeding record',
    };
  }
}

export async function deleteBreedingRecord(id) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication failed: missing token');
    }

    await api.delete(`/breeding/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return true;
  } catch (error) {
    console.error(
      '[deleteBreedingRecord] Error:',
      error?.response?.data || error.message,
    );
    throw (
      error?.response?.data?.message ||
      error.message ||
      'Failed to delete breeding record'
    );
  }
}

export async function getBreedingRecordsByAnimalId(animalId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.get(`/breeding/animal/${animalId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('[getBreedingRecordsByAnimalId] Response:', response.data);
    return {data: response.data || [], error: null};
  } catch (error) {
    console.error(
      '[getBreedingRecordsByAnimalId] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to get breeding records for animal',
    };
  }
}

export async function getBreedingRecordsForActiveFarm() {
  try {
    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    if (!farmId) {
      return {
        data: [],
        error: 'No active farm selected',
      };
    }

    const {data: response, error} = await getAllBreedingRecords();

    if (error) {
      return {data: null, error};
    }

    const allBreedingRecords = response?.data || [];

    if (!Array.isArray(allBreedingRecords)) {
      console.error(
        '[getBreedingRecordsForActiveFarm] allBreedingRecords is not an array:',
        response,
      );
      return {
        data: [],
        error: 'Invalid breeding records data received from server',
      };
    }

    const farmBreedingRecords = allBreedingRecords.filter(
      record => record && record.farmId === farmId,
    );

    return {data: farmBreedingRecords, error: null};
  } catch (error) {
    console.error(
      '[getBreedingRecordsForActiveFarm] Error:',
      error?.message || error,
    );
    return {
      data: null,
      error: 'Failed to retrieve breeding records for active farm',
    };
  }
}

export async function getBreedingStatistics(animalId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.get('/breeding/statistics', {
      params: animalId ? {animalId} : {},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('[getBreedingStatistics] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[getBreedingStatistics] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to get breeding statistics',
    };
  }
}

export async function recordPregnancyCheck(pregnancyData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const payload = {
      breedingId: pregnancyData.breedingId,
      checkDate: pregnancyData.checkDate || new Date().toISOString(),
      result: pregnancyData.result,
      method: pregnancyData.method,
      performedBy: pregnancyData.performedBy,
      notes: pregnancyData.notes,
      cost: parseFloat(pregnancyData.cost) || 0,
    };

    const response = await api.post('/breeding/pregnancy-check', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[recordPregnancyCheck] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[recordPregnancyCheck] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to record pregnancy check',
    };
  }
}

export async function recordBirthDetails(birthData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const payload = {
      breedingId: birthData.breedingId,
      birthDate: birthData.birthDate || new Date().toISOString(),
      deliveryMethod: birthData.deliveryMethod,
      youngOnes: parseInt(birthData.youngOnes) || 1,
      birthWeight: parseFloat(birthData.birthWeight) || 0,
      litterWeight: parseFloat(birthData.litterWeight) || 0,
      offspringSex: birthData.offspringSex,
      offspringIds: birthData.offspringIds,
      complications: birthData.complications,
      assistanceRequired: birthData.assistanceRequired || false,
      veterinarianInvolved: birthData.veterinarianInvolved || false,
      notes: birthData.notes,
    };

    const response = await api.post('/breeding/birth-details', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[recordBirthDetails] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[recordBirthDetails] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to record birth details',
    };
  }
}
