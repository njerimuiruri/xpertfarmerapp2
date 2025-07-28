import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLivestockForActiveFarm} from './livestock';

export async function createBreedingRecord(data) {
  try {
    const token = await AsyncStorage.getItem('token');
    const userRaw = await AsyncStorage.getItem('user');
    const user = JSON.parse(userRaw || '{}');
    const userId = user?.id;

    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    console.log('=== BREEDING SERVICE DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('User ID:', userId);
    console.log('Farm ID:', farmId);

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

    // Build payload that EXACTLY matches your working backend example
    const payload = {
      damId: data.damId,
      sireId: data.sireId,
      farmId: farmId,
      purpose: data.purpose,
      strategy: data.strategy,
      serviceType: data.serviceType,
      serviceDate: data.serviceDate,
      numServices: parseInt(data.numServices) || 1,
      firstHeatDate: data.firstHeatDate,
      gestationDays: parseInt(data.gestationDays) || 280,
      expectedBirthDate: data.expectedBirthDate,
      sireCode: data.sireCode,
    };

    // CRITICAL: Only add AI fields if serviceType is "Artificial Insemination"
    // Your working example has AI fields even with "Natural Mating" - this might be the issue!
    if (data.serviceType === 'Artificial Insemination') {
      payload.aiType = data.aiType;
      payload.aiSource = data.aiSource;
      payload.aiCost = parseFloat(data.aiCost) || 0;
    }

    // DON'T send damCode - your working example doesn't have it
    // Remove this line that was in your original code:
    // payload.damCode = data.damCode;

    // Validate required fields
    const requiredFields = [
      'damId',
      'sireId',
      'purpose',
      'strategy',
      'serviceType',
    ];
    const missingFields = requiredFields.filter(field => !payload[field]);

    if (missingFields.length > 0) {
      return {
        data: null,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      };
    }

    // Enhanced date validation and formatting
    try {
      // Ensure dates are properly formatted as ISO strings
      if (payload.serviceDate instanceof Date) {
        payload.serviceDate = payload.serviceDate.toISOString();
      }
      if (payload.firstHeatDate instanceof Date) {
        payload.firstHeatDate = payload.firstHeatDate.toISOString();
      }
      if (payload.expectedBirthDate instanceof Date) {
        payload.expectedBirthDate = payload.expectedBirthDate.toISOString();
      }

      // Validate date format
      new Date(payload.serviceDate).toISOString();
      new Date(payload.firstHeatDate).toISOString();
      new Date(payload.expectedBirthDate).toISOString();
    } catch (dateError) {
      return {
        data: null,
        error: 'Invalid date format provided',
      };
    }

    console.log('=== FINAL PAYLOAD (matching backend format) ===');
    console.log(JSON.stringify(payload, null, 2));

    const response = await api.post('/breeding', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log('SUCCESS - Breeding record created:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error('=== BREEDING SERVICE ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error(
        'Response data:',
        JSON.stringify(error.response.data, null, 2),
      );

      // More specific error handling
      if (error.response.status === 500) {
        const serverError =
          error.response.data?.message || error.response.data?.error;

        // Check for common 500 error causes
        if (
          serverError?.includes('foreign key') ||
          serverError?.includes('constraint')
        ) {
          return {
            data: null,
            error:
              'Invalid dam or sire selected. Please ensure the animals exist and try again.',
          };
        }

        if (
          serverError?.includes('duplicate') ||
          serverError?.includes('unique')
        ) {
          return {
            data: null,
            error: 'A breeding record with these details already exists.',
          };
        }

        return {
          data: null,
          error: `Server error: ${
            serverError || 'Please check your backend logs for details'
          }`,
        };
      }

      if (error.response.status === 400) {
        return {
          data: null,
          error: error.response.data?.message || 'Invalid data provided',
        };
      }
    }

    return {
      data: null,
      error: error.message || 'Failed to create breeding record',
    };
  }
}

export async function getAllBreedingRecords(farmId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token || !farmId) {
      return {
        data: null,
        error: 'Authentication failed or no farm selected',
      };
    }

    const response = await api.get(`/breeding?farmId=${farmId}`, {
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
export async function getBreedingRecordsForLivestock(livestockId) {
  try {
    const token = await AsyncStorage.getItem('token');
    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    if (!token) {
      return {
        data: [],
        error: 'Authentication failed: missing token',
      };
    }

    if (!livestockId || !farmId) {
      return {
        data: [],
        error: 'Livestock ID and Farm ID are required',
      };
    }

    // Get all breeding records for the farm
    const response = await getAllBreedingRecords(farmId);

    if (response.error) {
      return response;
    }

    // Filter records for this specific livestock
    const breedingRecords = response.data || [];
    const filteredRecords = breedingRecords.filter(record => {
      const damMatches =
        record.damId === livestockId ||
        record.damId?.toString() === livestockId?.toString();
      const sireMatches =
        record.sireId === livestockId ||
        record.sireId?.toString() === livestockId?.toString();

      return damMatches || sireMatches;
    });

    console.log(
      `Found ${filteredRecords.length} breeding records for livestock ${livestockId}`,
    );
    return {data: filteredRecords, error: null};
  } catch (error) {
    console.error(
      '[getBreedingRecordsForLivestock] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: [],
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve breeding records for livestock',
    };
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

    console.log(
      '[updateBreedingRecord] Payload:',
      JSON.stringify(data, null, 2),
    );

    const response = await api.patch(`/breeding/${id}`, data, {
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

export async function recordBirth(breedingId, birthData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const breedingRecord = await getBreedingRecordById(breedingId);

    const enhancedBirthData = {
      ...birthData,
      offspring:
        birthData.offspring?.map(offspring => ({
          ...offspring,
          damId: breedingRecord?.damId,
          damInfo: breedingRecord?.damInfo,
          sireId: breedingRecord?.sireId,
          sireInfo: breedingRecord?.sireInfo,
          sireCode: breedingRecord?.sireCode,
          serviceType: breedingRecord?.serviceType,
          breedingDate: breedingRecord?.breedingDate,

          deliveryMethod: birthData.deliveryMethod,
          birthDate: birthData.birthDate,
          litterWeight: birthData.litterWeight,
        })) || [],
    };

    console.log(
      '[recordBirth] Enhanced Payload:',
      JSON.stringify(enhancedBirthData, null, 2),
    );

    const response = await api.post(
      `/breeding/${breedingId}/record-birth`,
      enhancedBirthData,
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

export async function registerOffspringAsLivestock(
  breedingId,
  offspringId,
  livestockData,
) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const breedingRecord = await getBreedingRecordById(breedingId);

    if (!breedingRecord) {
      return {
        data: null,
        error: 'Failed to fetch breeding record information',
      };
    }

    const enhancedPayload = {
      ...livestockData,
      damId: breedingRecord.damId,
      damInfo: breedingRecord.damInfo || null,
      sireId: breedingRecord.sireId || null,
      sireInfo: breedingRecord.sireInfo || null,
      sireCode: breedingRecord.sireCode || null,
      serviceType: breedingRecord.serviceType,

      birthDate:
        breedingRecord.birthInfo?.birthDate || breedingRecord.birthDate,
      deliveryMethod:
        breedingRecord.birthInfo?.deliveryMethod || 'Natural Birth',
      litterWeight: breedingRecord.birthInfo?.litterWeight || null,

      breedingRecordId: breedingId,

      breedingDate: breedingRecord.breedingDate,
      expectedDueDate: breedingRecord.expectedDueDate,
    };

    console.log(
      '[registerOffspringAsLivestock] Enhanced Payload:',
      JSON.stringify(enhancedPayload, null, 2),
    );

    const response = await api.post(
      `/breeding/offspring/${offspringId}/register-as-livestock`,
      enhancedPayload,
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

export async function getBreedingStatistics(farmId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.get(`/breeding/statistics/${farmId}`, {
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

export async function getDetailedBreedingRecords() {
  const {data: breedingRecords, error: breedingError} =
    await getBreedingRecordsForActiveFarm();

  const {data: livestock, error: livestockError} =
    await getLivestockForActiveFarm();

  if (breedingError || livestockError) {
    return {
      data: null,
      error: breedingError || livestockError,
    };
  }

  const livestockMap = {};
  for (const animal of livestock) {
    livestockMap[animal.id] = {
      idNumber: animal?.mammal?.idNumber || animal?.poultry?.idNumber || 'N/A',
      breedType: animal?.mammal?.breedType || animal?.poultry?.breedType || '',
      type: animal.type || '',
    };
  }

  const enrichedRecords = breedingRecords.map(record => {
    const damInfo = livestockMap[record.damId];
    const sireInfo = livestockMap[record.sireId];

    return {
      ...record,
      damDisplay: damInfo
        ? `${damInfo.idNumber} (${damInfo.breedType})`
        : record.damId,
      sireDisplay: sireInfo
        ? `${sireInfo.idNumber} (${sireInfo.breedType})`
        : record.sireId,
    };
  });

  return {
    data: enrichedRecords,
    error: null,
  };
}
export async function getBreedsFromBreedingRecords() {
  const {data, error} = await getBreedingRecordsForActiveFarm();

  if (error) return {data: null, error};

  const breedSet = new Set();

  data.forEach(record => {
    const dam = record?.damId || '';
    const sire = record?.sireId || '';
    if (dam) breedSet.add(dam);
    if (sire) breedSet.add(sire);
  });

  return {data: Array.from(breedSet), error: null};
}

export async function getActiveFarmInfo() {
  try {
    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');

    if (!activeFarm?.id) {
      return {
        data: null,
        error: 'No active farm selected',
      };
    }

    return {
      data: activeFarm,
      error: null,
    };
  } catch (error) {
    console.error('[getActiveFarmInfo] Error:', error?.message || error);
    return {
      data: null,
      error: 'Failed to get active farm information',
    };
  }
}

export async function getBreedsForActiveFarm() {
  try {
    const token = await AsyncStorage.getItem('token');
    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    if (!token || !farmId) {
      return {
        data: [],
        error: 'Missing authentication token or active farm',
      };
    }

    const response = await api.get('/livestock', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const livestock = response.data?.data || response.data || [];

    const breedMap = new Map();

    livestock.forEach(animal => {
      if (animal.farmId !== farmId) return;

      const type = animal.type || 'Unknown';
      const breed = animal?.mammal?.breedType || animal?.poultry?.breedType;

      if (breed) {
        const key = `${type}-${breed}`;
        if (!breedMap.has(key)) {
          breedMap.set(key, {
            id: key,
            name: breed,
            type,
            description: `${type} breed`,
            farmId,
          });
        }
      }
    });

    const breeds = Array.from(breedMap.values());

    return {
      data: breeds,
      error: null,
    };
  } catch (error) {
    console.error(
      '[getBreedsForActiveFarm] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: [],
      error: 'Failed to fetch breeds',
    };
  }
}

async function extractBreedsFromLivestock() {
  try {
    const token = await AsyncStorage.getItem('token');
    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    if (!token || !farmId) {
      return {
        data: null,
        error: 'Missing authentication token or active farm',
      };
    }

    const response = await api.get(`/livestock?farmId=${farmId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const livestock = response.data || [];
    const breedMap = new Map();

    livestock.forEach(animal => {
      const animalData = animal.mammal || animal.poultry;
      const breedType = animalData?.breedType;
      const type = animal?.type || animalData?.type || 'Unknown';

      if (breedType) {
        const breedKey = `${type}-${breedType}`;
        if (!breedMap.has(breedKey)) {
          breedMap.set(breedKey, {
            id: breedKey,
            name: breedType,
            type: type,
            description: `${type} breed`,
            farmId: farmId,
          });
        }
      }
    });

    return {
      data: Array.from(breedMap.values()),
      error: null,
    };
  } catch (error) {
    console.error(
      '[extractBreedsFromLivestock] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error: 'Failed to extract breeds from livestock data',
    };
  }
}

export async function getBreedsFromBreedingRecordsForActiveFarm() {
  try {
    const token = await AsyncStorage.getItem('token');
    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    if (!token || !farmId) {
      return {
        data: null,
        error: 'Missing authentication token or active farm',
      };
    }

    const response = await api.get(`/breeding?farmId=${farmId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const breedingRecords = response.data || [];
    const breedSet = new Set();

    breedingRecords.forEach(record => {
      if (record.damBreed) breedSet.add(record.damBreed);
      if (record.sireBreed) breedSet.add(record.sireBreed);
    });

    const breeds = Array.from(breedSet).map((breedName, index) => ({
      id: `breed-${index}-${breedName.replace(/\s+/g, '-').toLowerCase()}`,
      name: breedName,
      type: 'Mixed',
      description: `Breed used in breeding programs`,
      farmId: farmId,
    }));

    return {data: breeds, error: null};
  } catch (error) {
    console.error(
      '[getBreedsFromBreedingRecordsForActiveFarm] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error: 'Failed to fetch breeds from breeding records',
    };
  }
}
export async function getOffspringWithParentInfo(breedingId, offspringId) {
  try {
    const breedingRecord = await getBreedingRecordById(breedingId);

    if (!breedingRecord) {
      throw new Error('Breeding record not found');
    }

    const offspring = breedingRecord.offspring?.find(
      o => o.offspringId === offspringId,
    );

    if (!offspring) {
      throw new Error('Offspring not found in breeding record');
    }

    return {
      ...offspring,
      damId: breedingRecord.damId,
      damInfo: breedingRecord.damInfo,
      sireId: breedingRecord.sireId,
      sireInfo: breedingRecord.sireInfo,
      sireCode: breedingRecord.sireCode,
      serviceType: breedingRecord.serviceType,

      birthDate:
        breedingRecord.birthInfo?.birthDate || breedingRecord.birthDate,
      deliveryMethod: breedingRecord.birthInfo?.deliveryMethod,
      litterWeight: breedingRecord.birthInfo?.litterWeight,

      breedingRecordId: breedingId,
      breedingDate: breedingRecord.breedingDate,
      expectedDueDate: breedingRecord.expectedDueDate,
    };
  } catch (error) {
    console.error('[getOffspringWithParentInfo] Error:', error);
    throw error;
  }
}
export async function validateBreedingData(data) {
  try {
    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    console.log('=== VALIDATION TEST ===');
    console.log('Farm ID:', farmId);
    console.log('Dam ID:', data.damId);
    console.log('Sire ID:', data.sireId);

    // Get livestock to validate IDs exist
    const livestock = await getLivestockForActiveFarm();
    const dam = livestock.find(animal => animal.id === data.damId);
    const sire = livestock.find(animal => animal.id === data.sireId);

    console.log('Dam found:', !!dam);
    console.log('Sire found:', !!sire);

    if (!dam) {
      return {valid: false, error: 'Dam not found in farm livestock'};
    }

    if (!sire) {
      return {valid: false, error: 'Sire not found in farm livestock'};
    }

    return {valid: true, error: null};
  } catch (error) {
    return {valid: false, error: error.message};
  }
}
