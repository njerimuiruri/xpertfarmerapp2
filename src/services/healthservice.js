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

export async function getVaccinationsForLivestock(livestockId = null) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: [],
        error: 'Authentication failed: missing token',
      };
    }

    const params = {};
    if (livestockId) {
      params.livestockId = livestockId;
    }

    const response = await api.get('/health/vaccinations', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const vaccinationData = response.data?.data || response.data || [];

    console.log(
      `[getVaccinationsForLivestock] Found ${
        vaccinationData.length
      } vaccination records${
        livestockId ? ` for livestock ${livestockId}` : ' (all livestock)'
      }`,
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

export async function getAllergiesForLivestock(livestockId = null) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: [],
        error: 'Authentication failed: missing token',
      };
    }

    const params = {};
    if (livestockId) {
      params.livestockId = livestockId;
    }

    const response = await api.get('/health/allergies', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const allergyData = response.data?.data || response.data || [];

    console.log(
      `[getAllergiesForLivestock] Found ${allergyData.length} allergy records${
        livestockId ? ` for livestock ${livestockId}` : ' (all livestock)'
      }`,
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

export async function createBooster(livestockId, boosterData) {
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
      animalIdOrFlockId: boosterData.animalIdOrFlockId || livestockId,
      boostersOrAdditives: boosterData.boostersOrAdditives,
      purpose: boosterData.purpose,
      quantityGiven: boosterData.quantityGiven,
      quantityUnit: boosterData.quantityUnit,
      dateAdministered:
        boosterData.dateAdministered || new Date().toISOString(),
      costOfBooster: boosterData.costOfBooster,
      farmId: farmId,
      livestockId: livestockId,
    };

    console.log(
      '[createBooster] Creating booster with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.post('/health/boosters', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[createBooster] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error('[createBooster] Full Error Object:', error);
    console.error('[createBooster] Error Response:', error?.response);
    console.error('[createBooster] Error Status:', error?.response?.status);
    console.error('[createBooster] Error Data:', error?.response?.data);

    let errorMessage = 'Failed to create booster record';

    if (error?.response?.status === 500) {
      errorMessage =
        'Server error occurred. Please check your backend logs and try again.';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message || 'Invalid booster data provided';
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

export async function getBoostersForActiveFarm() {
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

    const response = await api.get('/health/boosters', {
      params: {farmId},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const boosterData = response.data?.data || response.data || [];

    console.log(
      `[getBoostersForActiveFarm] Found ${boosterData.length} booster records for farm ${farmId}`,
    );

    return {data: boosterData, error: null};
  } catch (error) {
    console.error(
      '[getBoostersForActiveFarm] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: [],
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve booster records',
    };
  }
}

export async function getBoostersForLivestock(livestockId = null) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: [],
        error: 'Authentication failed: missing token',
      };
    }

    const params = {};
    if (livestockId) {
      params.livestockId = livestockId;
    }

    const response = await api.get('/health/boosters', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const boosterData = response.data?.data || response.data || [];

    console.log(
      `[getBoostersForLivestock] Found ${boosterData.length} booster records${
        livestockId ? ` for livestock ${livestockId}` : ' (all livestock)'
      }`,
    );

    return {data: boosterData, error: null};
  } catch (error) {
    console.error(
      '[getBoostersForLivestock] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to retrieve booster records';

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

export async function getBoosterById(boosterId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!boosterId) {
      return {
        data: null,
        error: 'Booster ID is required',
      };
    }

    const response = await api.get(`/health/boosters/${boosterId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      '[getBoosterById] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[getBoosterById] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to fetch booster record';

    if (error?.response?.status === 404) {
      errorMessage = 'Booster record not found';
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

export async function updateBooster(boosterId, boosterData) {
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

    if (!boosterId) {
      return {
        data: null,
        error: 'Booster ID is required',
      };
    }

    if (!farmId) {
      return {
        data: null,
        error: 'No active farm selected',
      };
    }

    const payload = {
      animalIdOrFlockId: boosterData.animalIdOrFlockId,
      boostersOrAdditives: boosterData.boostersOrAdditives,
      purpose: boosterData.purpose,
      quantityGiven: boosterData.quantityGiven,
      quantityUnit: boosterData.quantityUnit,
      dateAdministered: boosterData.dateAdministered,
      costOfBooster: boosterData.costOfBooster,
      farmId: farmId,
      livestockId: boosterData.livestockId,
    };

    console.log(
      '[updateBooster] Updating booster with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.patch(`/health/boosters/${boosterId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[updateBooster] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateBooster] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to update booster record';

    if (error?.response?.status === 404) {
      errorMessage = 'Booster record not found';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message || 'Invalid booster data provided';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to this booster record.';
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

export async function deleteBooster(boosterId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!boosterId) {
      return {
        data: null,
        error: 'Booster ID is required',
      };
    }

    await api.delete(`/health/boosters/${boosterId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`[deleteBooster] Successfully deleted booster ${boosterId}`);

    return {data: true, error: null};
  } catch (error) {
    console.error(
      '[deleteBooster] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to delete booster record';

    if (error?.response?.status === 404) {
      errorMessage = 'Booster record not found';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to delete this booster record.';
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

export function validateBoosterData(data) {
  const errors = [];

  if (!data.boostersOrAdditives?.trim()) {
    errors.push('Booster/additive name is required');
  }

  if (!data.purpose?.trim()) {
    errors.push('Purpose is required');
  }

  if (!data.quantityGiven || data.quantityGiven <= 0) {
    errors.push('Quantity given must be greater than 0');
  }

  if (!data.quantityUnit?.trim()) {
    errors.push('Quantity unit is required');
  }

  if (!data.dateAdministered) {
    errors.push('Date administered is required');
  }

  if (data.costOfBooster !== undefined && data.costOfBooster < 0) {
    errors.push('Cost of booster cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function createDeworming(livestockId, dewormingData) {
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
      animalIdOrFlockId: dewormingData.animalIdOrFlockId || livestockId,
      farmId: farmId,
      livestockId: livestockId,
      dewormingAgainst: dewormingData.dewormingAgainst,
      drugAdministered: dewormingData.drugAdministered,
      dosage: dewormingData.dosage,
      dateAdministered:
        dewormingData.dateAdministered || new Date().toISOString(),
      costOfVaccine: dewormingData.costOfVaccine,
      costOfService: dewormingData.costOfService,
      administeredByType: dewormingData.administeredByType,
      administeredByName: dewormingData.administeredByName,
      practiceId: dewormingData.practiceId,
      technicianId: dewormingData.technicianId,
      farmerWitness: dewormingData.farmerWitness,
      notes: dewormingData.notes,
    };

    console.log(
      '[createDeworming] Creating deworming record with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.post('/health/deworming-records', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[createDeworming] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error('[createDeworming] Full Error Object:', error);
    console.error('[createDeworming] Error Response:', error?.response);
    console.error('[createDeworming] Error Status:', error?.response?.status);
    console.error('[createDeworming] Error Data:', error?.response?.data);

    let errorMessage = 'Failed to create deworming record';

    if (error?.response?.status === 500) {
      errorMessage =
        'Server error occurred. Please check your backend logs and try again.';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message || 'Invalid deworming data provided';
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

export async function getDewormingRecordsForActiveFarm() {
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

    const response = await api.get('/health/deworming-records', {
      params: {farmId},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const dewormingData = response.data?.data || response.data || [];

    console.log(
      `[getDewormingRecordsForActiveFarm] Found ${dewormingData.length} deworming records for farm ${farmId}`,
    );

    return {data: dewormingData, error: null};
  } catch (error) {
    console.error(
      '[getDewormingRecordsForActiveFarm] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: [],
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve deworming records',
    };
  }
}

export async function getDewormingRecordsForLivestock(livestockId = null) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: [],
        error: 'Authentication failed: missing token',
      };
    }

    const params = {};
    if (livestockId) {
      params.livestockId = livestockId;
    }

    const response = await api.get('/health/deworming-records', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const dewormingData = response.data?.data || response.data || [];

    console.log(
      `[getDewormingRecordsForLivestock] Found ${
        dewormingData.length
      } deworming records${
        livestockId ? ` for livestock ${livestockId}` : ' (all livestock)'
      }`,
    );

    return {data: dewormingData, error: null};
  } catch (error) {
    console.error(
      '[getDewormingRecordsForLivestock] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to retrieve deworming records';

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

export async function getDewormingRecordById(dewormingId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!dewormingId) {
      return {
        data: null,
        error: 'Deworming record ID is required',
      };
    }

    const response = await api.get(`/health/deworming-records/${dewormingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      '[getDewormingRecordById] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[getDewormingRecordById] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to fetch deworming record';

    if (error?.response?.status === 404) {
      errorMessage = 'Deworming record not found';
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

export async function updateDewormingRecord(dewormingId, dewormingData) {
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

    if (!dewormingId) {
      return {
        data: null,
        error: 'Deworming record ID is required',
      };
    }

    if (!farmId) {
      return {
        data: null,
        error: 'No active farm selected',
      };
    }

    const payload = {
      animalIdOrFlockId: dewormingData.animalIdOrFlockId,
      farmId: farmId,
      livestockId: dewormingData.livestockId,
      dewormingAgainst: dewormingData.dewormingAgainst,
      drugAdministered: dewormingData.drugAdministered,
      dosage: dewormingData.dosage,
      dateAdministered: dewormingData.dateAdministered,
      costOfVaccine: dewormingData.costOfVaccine,
      costOfService: dewormingData.costOfService,
      administeredByType: dewormingData.administeredByType,
      administeredByName: dewormingData.administeredByName,
      practiceId: dewormingData.practiceId,
      technicianId: dewormingData.technicianId,
      farmerWitness: dewormingData.farmerWitness,
      notes: dewormingData.notes,
    };

    console.log(
      '[updateDewormingRecord] Updating deworming record with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.patch(
      `/health/deworming-records/${dewormingId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(
      '[updateDewormingRecord] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateDewormingRecord] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to update deworming record';

    if (error?.response?.status === 404) {
      errorMessage = 'Deworming record not found';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message || 'Invalid deworming data provided';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to this deworming record.';
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

export async function deleteDewormingRecord(dewormingId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!dewormingId) {
      return {
        data: null,
        error: 'Deworming record ID is required',
      };
    }

    await api.delete(`/health/deworming-records/${dewormingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      `[deleteDewormingRecord] Successfully deleted deworming record ${dewormingId}`,
    );

    return {data: true, error: null};
  } catch (error) {
    console.error(
      '[deleteDewormingRecord] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to delete deworming record';

    if (error?.response?.status === 404) {
      errorMessage = 'Deworming record not found';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to delete this deworming record.';
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

export function validateDewormingData(data) {
  const errors = [];

  if (!data.dewormingAgainst?.trim()) {
    errors.push('Deworming target/against is required');
  }

  if (!data.drugAdministered?.trim()) {
    errors.push('Drug administered is required');
  }

  if (!data.dosage || data.dosage <= 0) {
    errors.push('Valid dosage is required');
  }

  if (!data.dateAdministered) {
    errors.push('Date administered is required');
  }

  if (!data.administeredByType?.trim()) {
    errors.push('Administrator type is required');
  }

  if (!data.administeredByName?.trim()) {
    errors.push('Administrator name is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function createGeneticDisorder(livestockId, geneticDisorderData) {
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
      animalIdOrFlockId: geneticDisorderData.animalIdOrFlockId || livestockId,
      farmId: farmId,
      livestockId: livestockId,
      dateRecorded:
        geneticDisorderData.dateRecorded || new Date().toISOString(),
      nameOfCondition: geneticDisorderData.nameOfCondition,
      remedy: geneticDisorderData.remedy,
      administeredByType: geneticDisorderData.administeredByType,
      administeredByName: geneticDisorderData.administeredByName,
      practiceId: geneticDisorderData.practiceId,
      technicianId: geneticDisorderData.technicianId,
    };

    console.log(
      '[createGeneticDisorder] Creating genetic disorder record with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.post(
      '/health/genetic-disorder-records',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(
      '[createGeneticDisorder] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error('[createGeneticDisorder] Full Error Object:', error);
    console.error('[createGeneticDisorder] Error Response:', error?.response);
    console.error(
      '[createGeneticDisorder] Error Status:',
      error?.response?.status,
    );
    console.error('[createGeneticDisorder] Error Data:', error?.response?.data);

    let errorMessage = 'Failed to create genetic disorder record';

    if (error?.response?.status === 500) {
      errorMessage =
        'Server error occurred. Please check your backend logs and try again.';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message ||
        'Invalid genetic disorder data provided';
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

export async function getGeneticDisorderRecordsForActiveFarm() {
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

    const response = await api.get('/health/genetic-disorder-records', {
      params: {farmId},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const geneticDisorderData = response.data?.data || response.data || [];

    console.log(
      `[getGeneticDisorderRecordsForActiveFarm] Found ${geneticDisorderData.length} genetic disorder records for farm ${farmId}`,
    );

    return {data: geneticDisorderData, error: null};
  } catch (error) {
    console.error(
      '[getGeneticDisorderRecordsForActiveFarm] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: [],
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve genetic disorder records',
    };
  }
}

export async function getGeneticDisorderRecordsForLivestock(
  livestockId = null,
) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: [],
        error: 'Authentication failed: missing token',
      };
    }

    const params = {};
    if (livestockId) {
      params.livestockId = livestockId;
    }

    const response = await api.get('/health/genetic-disorder-records', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const geneticDisorderData = response.data?.data || response.data || [];

    console.log(
      `[getGeneticDisorderRecordsForLivestock] Found ${
        geneticDisorderData.length
      } genetic disorder records${
        livestockId ? ` for livestock ${livestockId}` : ' (all livestock)'
      }`,
    );

    return {data: geneticDisorderData, error: null};
  } catch (error) {
    console.error(
      '[getGeneticDisorderRecordsForLivestock] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to retrieve genetic disorder records';

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

export async function getGeneticDisorderRecordById(geneticDisorderId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!geneticDisorderId) {
      return {
        data: null,
        error: 'Genetic disorder record ID is required',
      };
    }

    const response = await api.get(
      `/health/genetic-disorder-records/${geneticDisorderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log(
      '[getGeneticDisorderRecordById] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[getGeneticDisorderRecordById] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to fetch genetic disorder record';

    if (error?.response?.status === 404) {
      errorMessage = 'Genetic disorder record not found';
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

export async function updateGeneticDisorderRecord(
  geneticDisorderId,
  geneticDisorderData,
) {
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

    if (!geneticDisorderId) {
      return {
        data: null,
        error: 'Genetic disorder record ID is required',
      };
    }

    if (!farmId) {
      return {
        data: null,
        error: 'No active farm selected',
      };
    }

    const payload = {
      animalIdOrFlockId: geneticDisorderData.animalIdOrFlockId,
      farmId: farmId,
      livestockId: geneticDisorderData.livestockId,
      dateRecorded: geneticDisorderData.dateRecorded,
      nameOfCondition: geneticDisorderData.nameOfCondition,
      remedy: geneticDisorderData.remedy,
      administeredByType: geneticDisorderData.administeredByType,
      administeredByName: geneticDisorderData.administeredByName,
      practiceId: geneticDisorderData.practiceId,
      technicianId: geneticDisorderData.technicianId,
    };

    console.log(
      '[updateGeneticDisorderRecord] Updating genetic disorder record with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.patch(
      `/health/genetic-disorder-records/${geneticDisorderId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(
      '[updateGeneticDisorderRecord] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateGeneticDisorderRecord] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to update genetic disorder record';

    if (error?.response?.status === 404) {
      errorMessage = 'Genetic disorder record not found';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message ||
        'Invalid genetic disorder data provided';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to this genetic disorder record.';
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

export async function deleteGeneticDisorderRecord(geneticDisorderId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!geneticDisorderId) {
      return {
        data: null,
        error: 'Genetic disorder record ID is required',
      };
    }

    await api.delete(`/health/genetic-disorder-records/${geneticDisorderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      `[deleteGeneticDisorderRecord] Successfully deleted genetic disorder record ${geneticDisorderId}`,
    );

    return {data: true, error: null};
  } catch (error) {
    console.error(
      '[deleteGeneticDisorderRecord] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to delete genetic disorder record';

    if (error?.response?.status === 404) {
      errorMessage = 'Genetic disorder record not found';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to delete this genetic disorder record.';
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

export function validateGeneticDisorderData(data) {
  const errors = [];

  if (!data.nameOfCondition?.trim()) {
    errors.push('Name of condition is required');
  }

  if (!data.remedy?.trim()) {
    errors.push('Remedy/treatment is required');
  }

  if (!data.dateRecorded) {
    errors.push('Date recorded is required');
  }

  if (!data.administeredByType?.trim()) {
    errors.push('Administrator type is required');
  }

  if (!data.administeredByName?.trim()) {
    errors.push('Administrator name is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function createTreatment(livestockId, treatmentData) {
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
      animalIdOrFlockId: treatmentData.animalIdOrFlockId || livestockId,
      farmId: farmId,
      livestockId: livestockId,
      healthEventDate:
        treatmentData.healthEventDate || new Date().toISOString(),
      healthEventSymptoms: treatmentData.healthEventSymptoms,
      diagnosis: treatmentData.diagnosis,
      treatmentType: treatmentData.treatmentType,
      treatmentDescription: treatmentData.treatmentDescription,
      drugAdministered: treatmentData.drugAdministered,
      dateAdministered:
        treatmentData.dateAdministered || new Date().toISOString(),
      dosageAdministered: treatmentData.dosageAdministered,
      costOfDrugs: treatmentData.costOfDrugs,
      medicalOfficerName: treatmentData.medicalOfficerName,
      licenseId: treatmentData.licenseId,
      costOfService: treatmentData.costOfService,
      farmerWitnessName: treatmentData.farmerWitnessName,
      notes: treatmentData.notes,
    };

    console.log(
      '[createTreatment] Creating treatment record with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.post('/health/treatments', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[createTreatment] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error('[createTreatment] Full Error Object:', error);
    console.error('[createTreatment] Error Response:', error?.response);
    console.error('[createTreatment] Error Status:', error?.response?.status);
    console.error('[createTreatment] Error Data:', error?.response?.data);

    let errorMessage = 'Failed to create treatment record';

    if (error?.response?.status === 500) {
      errorMessage =
        'Server error occurred. Please check your backend logs and try again.';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message || 'Invalid treatment data provided';
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

export async function getTreatmentsForActiveFarm() {
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

    const response = await api.get('/health/treatments', {
      params: {farmId},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const treatmentData = response.data?.data || response.data || [];

    console.log(
      `[getTreatmentsForActiveFarm] Found ${treatmentData.length} treatment records for farm ${farmId}`,
    );

    return {data: treatmentData, error: null};
  } catch (error) {
    console.error(
      '[getTreatmentsForActiveFarm] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: [],
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve treatment records',
    };
  }
}

export async function getTreatmentsForLivestock(livestockId = null) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: [],
        error: 'Authentication failed: missing token',
      };
    }

    const params = {};
    if (livestockId) {
      params.livestockId = livestockId;
    }

    const response = await api.get('/health/treatments', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const treatmentData = response.data?.data || response.data || [];

    console.log(
      `[getTreatmentsForLivestock] Found ${
        treatmentData.length
      } treatment records${
        livestockId ? ` for livestock ${livestockId}` : ' (all livestock)'
      }`,
    );

    return {data: treatmentData, error: null};
  } catch (error) {
    console.error(
      '[getTreatmentsForLivestock] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to retrieve treatment records';

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

export async function getTreatmentById(treatmentId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!treatmentId) {
      return {
        data: null,
        error: 'Treatment record ID is required',
      };
    }

    const response = await api.get(`/health/treatments/${treatmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      '[getTreatmentById] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[getTreatmentById] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to fetch treatment record';

    if (error?.response?.status === 404) {
      errorMessage = 'Treatment record not found';
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

export async function updateTreatment(treatmentId, treatmentData) {
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

    if (!treatmentId) {
      return {
        data: null,
        error: 'Treatment record ID is required',
      };
    }

    if (!farmId) {
      return {
        data: null,
        error: 'No active farm selected',
      };
    }

    const payload = {
      animalIdOrFlockId: treatmentData.animalIdOrFlockId,
      farmId: farmId,
      livestockId: treatmentData.livestockId,
      healthEventDate: treatmentData.healthEventDate,
      healthEventSymptoms: treatmentData.healthEventSymptoms,
      diagnosis: treatmentData.diagnosis,
      treatmentType: treatmentData.treatmentType,
      treatmentDescription: treatmentData.treatmentDescription,
      drugAdministered: treatmentData.drugAdministered,
      dateAdministered: treatmentData.dateAdministered,
      dosageAdministered: treatmentData.dosageAdministered,
      costOfDrugs: treatmentData.costOfDrugs,
      medicalOfficerName: treatmentData.medicalOfficerName,
      licenseId: treatmentData.licenseId,
      costOfService: treatmentData.costOfService,
      farmerWitnessName: treatmentData.farmerWitnessName,
      notes: treatmentData.notes,
    };

    console.log(
      '[updateTreatment] Updating treatment record with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.patch(
      `/health/treatments/${treatmentId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(
      '[updateTreatment] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateTreatment] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to update treatment record';

    if (error?.response?.status === 404) {
      errorMessage = 'Treatment record not found';
    } else if (error?.response?.status === 400) {
      errorMessage =
        error?.response?.data?.message || 'Invalid treatment data provided';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to this treatment record.';
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

export async function deleteTreatment(treatmentId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    if (!treatmentId) {
      return {
        data: null,
        error: 'Treatment record ID is required',
      };
    }

    await api.delete(`/health/treatments/${treatmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      `[deleteTreatment] Successfully deleted treatment record ${treatmentId}`,
    );

    return {data: true, error: null};
  } catch (error) {
    console.error(
      '[deleteTreatment] Error:',
      error?.response?.data || error.message,
    );

    let errorMessage = 'Failed to delete treatment record';

    if (error?.response?.status === 404) {
      errorMessage = 'Treatment record not found';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to delete this treatment record.';
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

export function validateTreatmentData(data) {
  const errors = [];

  if (!data.healthEventSymptoms?.trim()) {
    errors.push('Health event symptoms are required');
  }

  if (!data.diagnosis?.trim()) {
    errors.push('Diagnosis is required');
  }

  if (!data.treatmentType?.trim()) {
    errors.push('Treatment type is required');
  }

  if (!data.treatmentDescription?.trim()) {
    errors.push('Treatment description is required');
  }

  if (!data.drugAdministered?.trim()) {
    errors.push('Drug administered is required');
  }

  if (!data.dosageAdministered || data.dosageAdministered <= 0) {
    errors.push('Valid dosage administered is required');
  }

  if (!data.healthEventDate) {
    errors.push('Health event date is required');
  }

  if (!data.dateAdministered) {
    errors.push('Date administered is required');
  }

  if (!data.medicalOfficerName?.trim()) {
    errors.push('Medical officer name is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
