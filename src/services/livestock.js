import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createLivestock(data) {
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

    // Transform the payload to match backend expectations
    let payload;

    if (data.livestockType === 'poultry') {
      payload = {
        farmId,
        type: data.livestockType,
        category: 'poultry',
        poultry: {
          flockId: data.flockId,
          dateOfStocking: data.dateOfStocking,
          gender: data.gender,
          initialQuantity: data.initialQuantity,
          breedType: data.breedType,
          sourceOfBirds: data.sourceOfBirds,
          initialAverageWeight: data.initialAverageWeight,
        },
      };
    } else {
      // For all mammals (cattle, goats, sheep, rabbit, swine)
      payload = {
        farmId,
        type: data.livestockType,
        category: 'mammal',
        mammal: {
          idNumber: data.idNumber,
          breedType: data.breedType,
          phenotype: data.phenotype,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          sireId: data.sireId,
          sireCode: data.sireCode,
          damId: data.damId,
          damCode: data.damCode,
          birthWeight: data.birthWeight,
        },
      };
    }

    console.log(
      'Creating livestock with transformed payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.post('/livestock', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[createLivestock] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    // Enhanced error logging
    console.error('[createLivestock] Full Error Object:', error);
    console.error('[createLivestock] Error Response:', error?.response);
    console.error('[createLivestock] Error Status:', error?.response?.status);
    console.error('[createLivestock] Error Data:', error?.response?.data);

    let errorMessage = 'Failed to create livestock';

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

export async function getAllLivestock() {
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

    const response = await api.get('/livestock', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {data: response.data || [], error: null};
  } catch (error) {
    console.error(
      '[getAllLivestock] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve livestock',
    };
  }
}

export async function getLivestockById(id) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication failed: missing token');
    }

    const response = await api.get(`/livestock/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      '[getLivestockById] Error:',
      error?.response?.data || error.message,
    );
    throw (
      error?.response?.data?.message ||
      error.message ||
      'Failed to fetch livestock'
    );
  }
}

export async function updateLivestock(id, data) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    // Transform the payload to match backend expectations (same as create)
    let payload;

    if (data.livestockType === 'poultry') {
      payload = {
        type: data.livestockType,
        category: 'poultry',
        poultry: {
          flockId: data.flockId,
          dateOfStocking: data.dateOfStocking,
          gender: data.gender,
          initialQuantity: data.initialQuantity,
          breedType: data.breedType,
          sourceOfBirds: data.sourceOfBirds,
          initialAverageWeight: data.initialAverageWeight,
        },
      };
    } else {
      // For all mammals (cattle, goats, sheep, rabbit, swine)
      payload = {
        type: data.livestockType,
        category: 'mammal',
        mammal: {
          idNumber: data.idNumber,
          breedType: data.breedType,
          phenotype: data.phenotype,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          sireId: data.sireId,
          sireCode: data.sireCode,
          damId: data.damId,
          damCode: data.damCode,
          birthWeight: data.birthWeight,
        },
      };
    }

    console.log(
      '[updateLivestock] Transformed payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.patch(`/livestock/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[updateLivestock] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateLivestock] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update livestock',
    };
  }
}

export async function deleteLivestock(id) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication failed: missing token');
    }

    await api.delete(`/livestock/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return true;
  } catch (error) {
    console.error(
      '[deleteLivestock] Error:',
      error?.response?.data || error.message,
    );
    throw (
      error?.response?.data?.message ||
      error.message ||
      'Failed to delete livestock'
    );
  }
}

// Update livestock status (sold/deceased)
export async function updateLivestockStatus(livestockId, status, reason) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const payload = {
      status,
      reason,
    };

    const response = await api.patch(
      `/livestock/${livestockId}/status`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('[updateLivestockStatus] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateLivestockStatus] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to update livestock status',
    };
  }
}

// Record livestock mortality
export async function recordLivestockMortality(mortalityData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const userRaw = await AsyncStorage.getItem('user');
    const user = JSON.parse(userRaw || '{}');

    const payload = {
      livestockId: mortalityData.livestockId,
      date: mortalityData.date || new Date().toISOString(),
      cause: mortalityData.cause,
      description: mortalityData.description,
      reportedBy:
        mortalityData.reportedBy ||
        `${user?.firstName || 'Unknown'} ${user?.lastName || 'User'}`,
      attachments: mortalityData.attachments || [],
    };

    const response = await api.post('/livestock/mortality', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[recordLivestockMortality] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[recordLivestockMortality] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to record livestock mortality',
    };
  }
}

// Record livestock health event (vaccination or treatment)
export async function recordHealthEvent(healthEventData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const userRaw = await AsyncStorage.getItem('user');
    const user = JSON.parse(userRaw || '{}');

    const payload = {
      livestockId: healthEventData.livestockId,
      eventType: healthEventData.eventType, // 'vaccination' or 'treatment'
      date: healthEventData.date || new Date().toISOString(),
      description: healthEventData.description,
      performedBy:
        healthEventData.performedBy ||
        `${user?.firstName || 'Unknown'} ${user?.lastName || 'User'}`,
      medications: healthEventData.medications || [],
      dosage: healthEventData.dosage,
      cost: healthEventData.cost || 0,
      nextScheduled: healthEventData.nextScheduled || null,
    };

    const response = await api.post('/livestock/health-event', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[recordHealthEvent] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[recordHealthEvent] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to record health event',
    };
  }
}

// Transfer livestock between farms
export async function transferLivestock(transferData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const payload = {
      livestockId: transferData.livestockId,
      fromFarmId: transferData.fromFarmId,
      toFarmId: transferData.toFarmId,
      transferDate: transferData.transferDate || new Date().toISOString(),
      reason: transferData.reason,
      transportMethod: transferData.transportMethod,
    };

    const response = await api.post('/livestock/transfer', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[transferLivestock] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[transferLivestock] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to transfer livestock',
    };
  }
}

// Record livestock sale
export async function recordLivestockSale(saleData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const payload = {
      livestockId: saleData.livestockId,
      saleDate: saleData.saleDate || new Date().toISOString(),
      buyerName: saleData.buyerName,
      buyerContact: saleData.buyerContact,
      saleAmount: saleData.saleAmount,
      paymentMethod: saleData.paymentMethod,
      receiptNumber: saleData.receiptNumber,
    };

    const response = await api.post('/livestock/sale', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[recordLivestockSale] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[recordLivestockSale] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to record livestock sale',
    };
  }
}

// Get livestock statistics
export async function getLivestockStatistics(livestockId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.get('/livestock/statistics', {
      params: livestockId ? {livestockId} : {},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('[getLivestockStatistics] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[getLivestockStatistics] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to get livestock statistics',
    };
  }
}

export async function getLivestockForActiveFarm() {
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

    const {data: response, error} = await getAllLivestock();

    if (error) {
      return {data: null, error};
    }

    const allLivestock = response?.data || []; // ✅ Extract array

    if (!Array.isArray(allLivestock)) {
      console.error(
        '[getLivestockForActiveFarm] allLivestock is not an array:',
        response,
      );
      return {
        data: [],
        error: 'Invalid livestock data received from server',
      };
    }

    const farmLivestock = allLivestock.filter(
      livestock => livestock && livestock.farmId === farmId,
    );

    return {data: farmLivestock, error: null};
  } catch (error) {
    console.error(
      '[getLivestockForActiveFarm] Error:',
      error?.message || error,
    );
    return {
      data: null,
      error: 'Failed to retrieve livestock for active farm',
    };
  }
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
