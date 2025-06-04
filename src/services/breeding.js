import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a new breeding record
export async function createBreedingRecord(breedingData) {
  try {
    const token = await AsyncStorage.getItem('token');
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

    // Prepare payload according to your API structure
    const payload = {
      damId: breedingData.damId,
      sireId: breedingData.sireId,
      farmId: farmId,
      purpose: breedingData.purpose,
      strategy: breedingData.strategy,
      serviceType: breedingData.serviceType,
      serviceDate: breedingData.serviceDate,
      numServices: breedingData.numServices,
      firstHeatDate: breedingData.firstHeatDate,
      gestationDays: breedingData.gestationDays,
      expectedBirthDate: breedingData.expectedBirthDate,
    };

    // Add AI-specific fields if service type is Artificial Insemination
    if (breedingData.serviceType === 'Artificial Insemination') {
      payload.sireCode = breedingData.sireCode;
      payload.aiType = breedingData.aiType;
      payload.aiSource = breedingData.aiSource;
      payload.aiCost = breedingData.aiCost;
    }

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

// Get all breeding records
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

// Get breeding record by ID
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

// Update breeding record
export async function updateBreedingRecord(id, breedingData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    // Prepare payload according to your API structure
    const payload = {
      damId: breedingData.damId,
      sireId: breedingData.sireId,
      purpose: breedingData.purpose,
      strategy: breedingData.strategy,
      serviceType: breedingData.serviceType,
      serviceDate: breedingData.serviceDate,
      numServices: breedingData.numServices,
      firstHeatDate: breedingData.firstHeatDate,
      gestationDays: breedingData.gestationDays,
      expectedBirthDate: breedingData.expectedBirthDate,
    };

    // Add AI-specific fields if service type is Artificial Insemination
    if (breedingData.serviceType === 'Artificial Insemination') {
      payload.sireCode = breedingData.sireCode;
      payload.aiType = breedingData.aiType;
      payload.aiSource = breedingData.aiSource;
      payload.aiCost = breedingData.aiCost;
    }

    console.log(
      '[updateBreedingRecord] Payload:',
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

// Delete breeding record
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

// Record birth for a breeding record
export async function recordBirth(breedingId, birthData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const payload = {
      birthDate: birthData.birthDate || new Date().toISOString(),
      numberOfOffspring: birthData.numberOfOffspring || 1,
      birthWeight: birthData.birthWeight,
      complications: birthData.complications || false,
      complicationDetails: birthData.complicationDetails || '',
      offspring: birthData.offspring || [], // Array of offspring details
    };

    const response = await api.post(
      `/breeding/${breedingId}/record-birth`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('[recordBirth] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[recordBirth] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to record birth',
    };
  }
}

// Register offspring as livestock
export async function registerOffspringAsLivestock(offspringId, livestockData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const payload = {
      idNumber: livestockData.idNumber,
      breedType: livestockData.breedType,
      phenotype: livestockData.phenotype,
      gender: livestockData.gender,
      birthWeight: livestockData.birthWeight,
      healthStatus: livestockData.healthStatus || 'healthy',
    };

    const response = await api.post(
      `/breeding/offspring/${offspringId}/register-as-livestock`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('[registerOffspringAsLivestock] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[registerOffspringAsLivestock] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to register offspring as livestock',
    };
  }
}

// Get breeding statistics for a farm
export async function getBreedingStatistics(farmId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    // If no farmId provided, use active farm
    let targetFarmId = farmId;
    if (!targetFarmId) {
      const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
      const activeFarm = JSON.parse(activeFarmRaw || '{}');
      targetFarmId = activeFarm?.id;
    }

    if (!targetFarmId) {
      return {
        data: null,
        error: 'No farm ID provided and no active farm selected',
      };
    }

    const response = await api.get(`/breeding/statistics/${targetFarmId}`, {
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

// Helper function to get breeding records for active farm
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

// Helper function to get female livestock (for dam selection)
export async function getFemaleAnimalsForActiveFarm() {
  try {
    // Import livestock service functions
    const {getLivestockForActiveFarm} = require('./livestock');

    const {data: allLivestock, error} = await getLivestockForActiveFarm();

    if (error) {
      return {data: null, error};
    }

    if (!Array.isArray(allLivestock)) {
      return {
        data: [],
        error: 'Invalid livestock data received',
      };
    }

    // Filter for female animals that are suitable for breeding
    const femaleAnimals = allLivestock.filter(animal => {
      // Handle both mammal and poultry categories
      if (animal.category === 'mammal' && animal.mammal) {
        return animal.mammal.gender === 'Female' && animal.status === 'active';
      }
      if (animal.category === 'poultry' && animal.poultry) {
        return animal.poultry.gender === 'Female' && animal.status === 'active';
      }
      return false;
    });

    return {data: femaleAnimals, error: null};
  } catch (error) {
    console.error(
      '[getFemaleAnimalsForActiveFarm] Error:',
      error?.message || error,
    );
    return {
      data: null,
      error: 'Failed to retrieve female animals for breeding',
    };
  }
}

// Helper function to get male livestock (for sire selection)
export async function getMaleAnimalsForActiveFarm() {
  try {
    // Import livestock service functions
    const {getLivestockForActiveFarm} = require('./livestock');

    const {data: allLivestock, error} = await getLivestockForActiveFarm();

    if (error) {
      return {data: null, error};
    }

    if (!Array.isArray(allLivestock)) {
      return {
        data: [],
        error: 'Invalid livestock data received',
      };
    }

    // Filter for male animals that are suitable for breeding
    const maleAnimals = allLivestock.filter(animal => {
      // Handle both mammal and poultry categories
      if (animal.category === 'mammal' && animal.mammal) {
        return animal.mammal.gender === 'Male' && animal.status === 'active';
      }
      if (animal.category === 'poultry' && animal.poultry) {
        return animal.poultry.gender === 'Male' && animal.status === 'active';
      }
      return false;
    });

    return {data: maleAnimals, error: null};
  } catch (error) {
    console.error(
      '[getMaleAnimalsForActiveFarm] Error:',
      error?.message || error,
    );
    return {
      data: null,
      error: 'Failed to retrieve male animals for breeding',
    };
  }
}
