import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createVaccination(livestockId, vaccinationData) {
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

    if (!livestockId) {
      return {
        data: null,
        error: 'Livestock ID is required',
      };
    }

    const payload = {
      animalIdOrFlockId: vaccinationData.animalIdOrFlockId || livestockId,
      vaccinationAgainst: vaccinationData.vaccinationAgainst,
      drugAdministered: vaccinationData.drugAdministered,
      dateAdministered:
        vaccinationData.dateAdministered || new Date().toISOString(),
      dosage: vaccinationData.dosage,
      costOfVaccine: vaccinationData.costOfVaccine || 0,
      administeredBy:
        vaccinationData.administeredBy ||
        `${user?.firstName || 'Unknown'} ${user?.lastName || 'User'}`,
      practiceId: vaccinationData.practiceId,
      costOfService: vaccinationData.costOfService || 0,
      farmId: farmId,
      livestockId: livestockId,
    };

    console.log(
      '[createVaccination] Creating vaccination with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.post('/health/vaccinations', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[createVaccination] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error('[createVaccination] Full Error Object:', error);
    console.error('[createVaccination] Error Response:', error?.response);
    console.error('[createVaccination] Error Status:', error?.response?.status);
    console.error('[createVaccination] Error Data:', error?.response?.data);

    let errorMessage = 'Failed to create vaccination record';

    if (error?.response?.status === 500) {
      errorMessage =
        'Server error occurred. Please check your backend logs and try again.';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message || 'Invalid vaccination data provided';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to this farm or livestock.';
    } else if (error?.response?.status === 404) {
      errorMessage =
        'Livestock not found or does not belong to the active farm.';
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

export async function getVaccinationsForLivestock(livestockId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: [],
        error: 'Authentication failed: missing token',
      };
    }

    if (!livestockId) {
      return {
        data: [],
        error: 'Livestock ID is required',
      };
    }

    const response = await api.get('/health/vaccinations', {
      params: {livestockId},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const vaccinationData = response.data?.data || response.data || [];

    console.log(
      `[getVaccinationsForLivestock] Found ${vaccinationData.length} vaccination records for livestock ${livestockId}`,
    );

    return {data: vaccinationData, error: null};
  } catch (error) {
    console.error(
      '[getVaccinationsForLivestock] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to retrieve vaccination records';

    if (error?.response?.status === 404) {
      errorMessage = 'Livestock not found';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return {
      data: [],
      error: errorMessage,
    };
  }
}

export async function getVaccinationsForActiveFarm() {
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

    if (!farmId) {
      return {
        data: [],
        error: 'No active farm selected',
      };
    }

    const response = await api.get('/health/vaccinations', {
      params: {farmId},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const vaccinationData = response.data?.data || response.data || [];

    console.log(
      `[getVaccinationsForActiveFarm] Found ${vaccinationData.length} vaccination records for farm ${farmId}`,
    );

    return {data: vaccinationData, error: null};
  } catch (error) {
    console.error(
      '[getVaccinationsForActiveFarm] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: [],
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve vaccination records',
    };
  }
}

export async function getVaccinationById(vaccinationId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!vaccinationId) {
      return {
        data: null,
        error: 'Vaccination ID is required',
      };
    }

    const response = await api.get(`/health/vaccinations/${vaccinationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      '[getVaccinationById] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[getVaccinationById] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to fetch vaccination record';

    if (error?.response?.status === 404) {
      errorMessage = 'Vaccination record not found';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
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

export async function updateVaccination(vaccinationId, vaccinationData) {
  try {
    const token = await AsyncStorage.getItem('token');
    const userRaw = await AsyncStorage.getItem('user');
    const user = JSON.parse(userRaw || '{}');

    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!vaccinationId) {
      return {
        data: null,
        error: 'Vaccination ID is required',
      };
    }

    if (!farmId) {
      return {
        data: null,
        error: 'No active farm selected',
      };
    }

    const payload = {
      animalIdOrFlockId: vaccinationData.animalIdOrFlockId,
      vaccinationAgainst: vaccinationData.vaccinationAgainst,
      drugAdministered: vaccinationData.drugAdministered,
      dateAdministered: vaccinationData.dateAdministered,
      dosage: vaccinationData.dosage,
      costOfVaccine: vaccinationData.costOfVaccine || 0,
      administeredBy:
        vaccinationData.administeredBy ||
        `${user?.firstName || 'Unknown'} ${user?.lastName || 'User'}`,
      practiceId: vaccinationData.practiceId,
      costOfService: vaccinationData.costOfService || 0,
      farmId: farmId,
      livestockId: vaccinationData.livestockId,
    };

    console.log(
      '[updateVaccination] Updating vaccination with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.patch(
      `/health/vaccinations/${vaccinationId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(
      '[updateVaccination] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateVaccination] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to update vaccination record';

    if (error?.response?.status === 404) {
      errorMessage = 'Vaccination record not found';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message || 'Invalid vaccination data provided';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to this vaccination record.';
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

export async function deleteVaccination(vaccinationId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!vaccinationId) {
      return {
        data: null,
        error: 'Vaccination ID is required',
      };
    }

    await api.delete(`/health/vaccinations/${vaccinationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      `[deleteVaccination] Successfully deleted vaccination ${vaccinationId}`,
    );

    return {data: true, error: null};
  } catch (error) {
    console.error(
      '[deleteVaccination] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to delete vaccination record';

    if (error?.response?.status === 404) {
      errorMessage = 'Vaccination record not found';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to delete this vaccination record.';
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

export async function getVaccinationHistory(livestockId, options = {}) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!livestockId) {
      return {
        data: null,
        error: 'Livestock ID is required',
      };
    }

    const params = {
      livestockId,
      ...options,
    };

    const response = await api.get('/health/vaccinations/history', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      '[getVaccinationHistory] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[getVaccinationHistory] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to get vaccination history';

    if (error?.response?.status === 404) {
      errorMessage = 'Livestock not found';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
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

export async function getUpcomingVaccinations(livestockId = null) {
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

    if (!farmId) {
      return {
        data: [],
        error: 'No active farm selected',
      };
    }

    const params = {
      farmId,
      ...(livestockId && {livestockId}),
    };

    const response = await api.get('/health/vaccinations/upcoming', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const upcomingVaccinations = response.data?.data || response.data || [];

    console.log(
      `[getUpcomingVaccinations] Found ${upcomingVaccinations.length} upcoming vaccinations`,
    );

    return {data: upcomingVaccinations, error: null};
  } catch (error) {
    console.error(
      '[getUpcomingVaccinations] Error:',
      error?.response?.data || error.message,
    );

    return {
      data: [],
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to get upcoming vaccinations',
    };
  }
}

export function validateVaccinationData(data) {
  const errors = [];

  if (!data.vaccinationAgainst?.trim()) {
    errors.push('Vaccination against is required');
  }

  if (!data.drugAdministered?.trim()) {
    errors.push('Drug administered is required');
  }

  if (!data.dateAdministered) {
    errors.push('Date administered is required');
  }

  // Updated validation for dosage as number
  if (data.dosage == null || isNaN(data.dosage) || data.dosage <= 0) {
    errors.push('Dosage must be a positive number');
  }

  if (
    data.costOfVaccine &&
    (isNaN(data.costOfVaccine) || data.costOfVaccine < 0)
  ) {
    errors.push('Cost of vaccine must be a non-negative number');
  }

  if (
    data.costOfService &&
    (isNaN(data.costOfService) || data.costOfService < 0)
  ) {
    errors.push('Cost of service must be a non-negative number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
//allergies
// Add these functions to your existing health services file

export async function createAllergy(livestockId, allergyData) {
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

    if (!livestockId) {
      return {
        data: null,
        error: 'Livestock ID is required',
      };
    }

    const payload = {
      animalIdOrFlockId: allergyData.animalIdOrFlockId || livestockId,
      dateRecorded: allergyData.dateRecorded || new Date().toISOString(),
      cause: allergyData.cause,
      remedy: allergyData.remedy,
      farmId: farmId,
      livestockId: livestockId,
    };

    console.log(
      '[createAllergy] Creating allergy with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.post('/health/allergies', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[createAllergy] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error('[createAllergy] Full Error Object:', error);
    console.error('[createAllergy] Error Response:', error?.response);
    console.error('[createAllergy] Error Status:', error?.response?.status);
    console.error('[createAllergy] Error Data:', error?.response?.data);

    let errorMessage = 'Failed to create allergy record';

    if (error?.response?.status === 500) {
      errorMessage =
        'Server error occurred. Please check your backend logs and try again.';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message || 'Invalid allergy data provided';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to this farm or livestock.';
    } else if (error?.response?.status === 404) {
      errorMessage =
        'Livestock not found or does not belong to the active farm.';
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

export async function getAllergiesForActiveFarm() {
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

    if (!farmId) {
      return {
        data: [],
        error: 'No active farm selected',
      };
    }

    const response = await api.get('/health/allergies', {
      params: {farmId},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const allergyData = response.data?.data || response.data || [];

    console.log(
      `[getAllergiesForActiveFarm] Found ${allergyData.length} allergy records for farm ${farmId}`,
    );

    return {data: allergyData, error: null};
  } catch (error) {
    console.error(
      '[getAllergiesForActiveFarm] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: [],
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve allergy records',
    };
  }
}

export async function getAllergiesForLivestock(livestockId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: [],
        error: 'Authentication failed: missing token',
      };
    }

    if (!livestockId) {
      return {
        data: [],
        error: 'Livestock ID is required',
      };
    }

    const response = await api.get('/health/allergies', {
      params: {livestockId},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const allergyData = response.data?.data || response.data || [];

    console.log(
      `[getAllergiesForLivestock] Found ${allergyData.length} allergy records for livestock ${livestockId}`,
    );

    return {data: allergyData, error: null};
  } catch (error) {
    console.error(
      '[getAllergiesForLivestock] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to retrieve allergy records';

    if (error?.response?.status === 404) {
      errorMessage = 'Livestock not found';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return {
      data: [],
      error: errorMessage,
    };
  }
}

export async function getAllergyById(allergyId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!allergyId) {
      return {
        data: null,
        error: 'Allergy ID is required',
      };
    }

    const response = await api.get(`/health/allergies/${allergyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      '[getAllergyById] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[getAllergyById] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to fetch allergy record';

    if (error?.response?.status === 404) {
      errorMessage = 'Allergy record not found';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
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

export async function updateAllergy(allergyId, allergyData) {
  try {
    const token = await AsyncStorage.getItem('token');
    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!allergyId) {
      return {
        data: null,
        error: 'Allergy ID is required',
      };
    }

    if (!farmId) {
      return {
        data: null,
        error: 'No active farm selected',
      };
    }

    const payload = {
      animalIdOrFlockId: allergyData.animalIdOrFlockId,
      dateRecorded: allergyData.dateRecorded,
      cause: allergyData.cause,
      remedy: allergyData.remedy,
      farmId: farmId,
      livestockId: allergyData.livestockId,
    };

    console.log(
      '[updateAllergy] Updating allergy with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.patch(
      `/health/allergies/${allergyId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(
      '[updateAllergy] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateAllergy] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to update allergy record';

    if (error?.response?.status === 404) {
      errorMessage = 'Allergy record not found';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message || 'Invalid allergy data provided';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to this allergy record.';
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

export async function deleteAllergy(allergyId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!allergyId) {
      return {
        data: null,
        error: 'Allergy ID is required',
      };
    }

    await api.delete(`/health/allergies/${allergyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`[deleteAllergy] Successfully deleted allergy ${allergyId}`);

    return {data: true, error: null};
  } catch (error) {
    console.error(
      '[deleteAllergy] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to delete allergy record';

    if (error?.response?.status === 404) {
      errorMessage = 'Allergy record not found';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to delete this allergy record.';
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

export function validateAllergyData(data) {
  const errors = [];

  if (!data.cause?.trim()) {
    errors.push('Cause of allergy is required');
  }

  if (!data.remedy?.trim()) {
    errors.push('Remedy/treatment is required');
  }

  if (!data.dateRecorded) {
    errors.push('Date recorded is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
