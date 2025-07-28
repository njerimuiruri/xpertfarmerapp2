import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createFeedingProgram(data) {
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

    // Transform feed data structure to match backend expectations
    const feedDetails = [];

    // Add basal feed (always required)
    if (data.basal) {
      feedDetails.push({
        feedType: 'Basal',
        source: data.basal.source || '',
        schedule: data.basal.schedule || '',
        quantity: parseFloat(data.basal.quantity) || 0,
        date: data.basal.date || new Date().toISOString(),
        cost: parseFloat(data.basal.cost) || 0,
        supplier: data.basal.supplier || '',
      });
    }

    // Add concentrate feed (if complete program)
    if (
      data.concentrate &&
      data.feedType === 'Basal Feed + Concentrates + Supplements'
    ) {
      feedDetails.push({
        feedType: 'Concentrate',
        source: data.concentrate.source || '',
        schedule: data.concentrate.schedule || '',
        quantity: parseFloat(data.concentrate.quantity) || 0,
        date: data.concentrate.date || new Date().toISOString(),
        cost: parseFloat(data.concentrate.cost) || 0,
        supplier: data.concentrate.supplier || '',
      });
    }

    // Add supplement feed (if complete program)
    if (
      data.supplement &&
      data.feedType === 'Basal Feed + Concentrates + Supplements'
    ) {
      feedDetails.push({
        feedType: 'Supplement',
        source: data.supplement.source || '',
        schedule: data.supplement.schedule || '',
        quantity: parseFloat(data.supplement.quantity) || 0,
        date: data.supplement.date || new Date().toISOString(),
        cost: parseFloat(data.supplement.cost) || 0,
        supplier: data.supplement.supplier || '',
      });
    }

    const payload = {
      farmId,
      userId,
      programType: data.programType,
      animalId: data.animalId || null,
      animalType: data.animalType || null,
      lifecycleStages: data.lifecycleStages || [],
      groupId: data.groupId || null,
      groupType: data.groupType || null,
      groupLifecycleStages: data.groupLifecycleStages || [],
      feedType: data.feedType,
      feedDetails: feedDetails, // Changed from separate basal/concentrate/supplement
      timeOfDay: data.timeOfDay || [],
      notes: data.notes || '',
    };

    console.log(
      'Creating feeding program with payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.post('/feeding', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[createFeedingProgram] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error('[createFeedingProgram] Full Error Object:', error);
    console.error('[createFeedingProgram] Error Response:', error?.response);
    console.error(
      '[createFeedingProgram] Error Status:',
      error?.response?.status,
    );
    console.error('[createFeedingProgram] Error Data:', error?.response?.data);

    let errorMessage = 'Failed to create feeding program';

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

export async function getAllFeedingPrograms() {
  try {
    const token = await AsyncStorage.getItem('token');
    const userRaw = await AsyncStorage.getItem('user');
    const user = JSON.parse(userRaw || '{}');
    const userId = user?.id;

    if (!token || !userId) {
      return {
        data: [],
        error: 'Authentication failed: missing token or user ID',
      };
    }

    const response = await api.get('/feeding', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const feedingData = response.data?.data || response.data || [];

    return {data: feedingData, error: null};
  } catch (error) {
    console.error(
      '[getAllFeedingPrograms] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: [],
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve feeding programs',
    };
  }
}

export async function getFeedingProgramsForActiveFarm() {
  try {
    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    if (!farmId) {
      return [];
    }

    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication failed: missing token');
    }

    const response = await api.get(`/feeding/${farmId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const farmFeedingPrograms = response.data?.data || response.data || [];

    console.log(
      `[getFeedingProgramsForActiveFarm] Found ${farmFeedingPrograms.length} feeding programs for farm ${farmId}`,
    );
    return farmFeedingPrograms;
  } catch (error) {
    console.error(
      '[getFeedingProgramsForActiveFarm] Error:',
      error?.message || error,
    );
    throw new Error('Failed to retrieve feeding programs for active farm');
  }
}

export async function getFeedingProgramById(id) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication failed: missing token');
    }

    const response = await api.get(`/feeding/program/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      '[getFeedingProgramById] Error:',
      error?.response?.data || error.message,
    );
    throw (
      error?.response?.data?.message ||
      error.message ||
      'Failed to fetch feeding program'
    );
  }
}

export async function updateFeedingProgram(id, data) {
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
    const userId = user?.id;

    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    // Transform feed data structure to match backend expectations
    const feedDetails = [];

    // Add basal feed (always required)
    if (data.basal) {
      const basalFeed = {
        feedType: 'Basal',
        source: data.basal.source || '',
        schedule: data.basal.schedule || '',
        quantity: parseFloat(data.basal.quantity) || 0,
        date: data.basal.date
          ? new Date(data.basal.date).toISOString()
          : new Date().toISOString(),
        cost: parseFloat(data.basal.cost) || 0,
        supplier: data.basal.supplier || '',
      };

      // Include ID if updating existing feed
      if (data.basal.id) {
        basalFeed.id = data.basal.id;
      }

      feedDetails.push(basalFeed);
    }

    // Add concentrate feed (if complete program)
    if (
      data.concentrate &&
      data.feedType === 'Basal Feed + Concentrates + Supplements'
    ) {
      const concentrateFeed = {
        feedType: 'Concentrate',
        source: data.concentrate.source || '',
        schedule: data.concentrate.schedule || '',
        quantity: parseFloat(data.concentrate.quantity) || 0,
        date: data.concentrate.date
          ? new Date(data.concentrate.date).toISOString()
          : new Date().toISOString(),
        cost: parseFloat(data.concentrate.cost) || 0,
        supplier: data.concentrate.supplier || '',
      };

      // Include ID if updating existing feed
      if (data.concentrate.id) {
        concentrateFeed.id = data.concentrate.id;
      }

      feedDetails.push(concentrateFeed);
    }

    // Add supplement feed (if complete program)
    if (
      data.supplement &&
      data.feedType === 'Basal Feed + Concentrates + Supplements'
    ) {
      const supplementFeed = {
        feedType: 'Supplement',
        source: data.supplement.source || '',
        schedule: data.supplement.schedule || '',
        quantity: parseFloat(data.supplement.quantity) || 0,
        date: data.supplement.date
          ? new Date(data.supplement.date).toISOString()
          : new Date().toISOString(),
        cost: parseFloat(data.supplement.cost) || 0,
        supplier: data.supplement.supplier || '',
      };

      // Include ID if updating existing feed
      if (data.supplement.id) {
        supplementFeed.id = data.supplement.id;
      }

      feedDetails.push(supplementFeed);
    }

    const payload = {
      farmId,
      userId,
      programType: data.programType,
      animalId:
        data.programType === 'Single Animal' && data.animalId
          ? data.animalId
          : null,
      animalType: data.programType === 'Single Animal' ? data.animalType : null,
      lifecycleStages:
        data.programType === 'Single Animal' ? data.lifecycleStages || [] : [],
      groupId:
        data.programType === 'Group' && data.groupId ? data.groupId : null,
      groupType: data.programType === 'Group' ? data.groupType : null,
      groupLifecycleStages:
        data.programType === 'Group' ? data.groupLifecycleStages || [] : [],
      feedType: data.feedType,
      feedDetails: feedDetails, // Changed from separate basal/concentrate/supplement
      timeOfDay: Array.isArray(data.timeOfDay) ? data.timeOfDay : [],
      notes: data.notes || '',
    };

    console.log(
      '[updateFeedingProgram] Final payload:',
      JSON.stringify(payload, null, 2),
    );

    const response = await api.patch(`/feeding/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {data: response.data, error: null};
  } catch (error) {
    console.error('[updateFeedingProgram] Error:', {
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update feeding program',
    };
  }
}

export async function deleteFeedingProgram(id) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication failed: missing token');
    }

    console.log(
      `[deleteFeedingProgram] Attempting to delete program with ID: ${id}`,
    );
    console.log(`[deleteFeedingProgram] Token exists: ${!!token}`);
    console.log(
      `[deleteFeedingProgram] Making DELETE request to: /feeding/${id}`,
    );

    const response = await api.delete(`/feeding/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      `[deleteFeedingProgram] Delete successful, response:`,
      response.data,
    );
    return true;
  } catch (error) {
    console.error('[deleteFeedingProgram] Full Error Object:', error);
    console.error('[deleteFeedingProgram] Error Response:', error?.response);
    console.error(
      '[deleteFeedingProgram] Error Status:',
      error?.response?.status,
    );
    console.error('[deleteFeedingProgram] Error Data:', error?.response?.data);
    console.error('[deleteFeedingProgram] Error Message:', error?.message);

    let errorMessage = 'Failed to delete feeding program';

    if (error?.response?.status === 404) {
      errorMessage = 'Feeding program not found or already deleted';
    } else if (error?.response?.status === 403) {
      errorMessage =
        'Permission denied. You may not have access to delete this program.';
    } else if (error?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error?.response?.status === 500) {
      errorMessage =
        'Server error occurred. Please check backend logs and try again.';
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    throw errorMessage;
  }
}

export async function getFeedingStatistics(programId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.get('/feeding/statistics', {
      params: programId ? {programId} : {},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('[getFeedingStatistics] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[getFeedingStatistics] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to get feeding statistics',
    };
  }
}
export async function getFeedingProgramsForLivestock(livestockId) {
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

    // Get all feeding programs for the farm
    const response = await api.get(`/feeding/${farmId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const feedingPrograms = response.data?.data || response.data || [];

    // Filter programs for this specific livestock
    const filteredPrograms = feedingPrograms.filter(program => {
      return (
        program.animalId === livestockId ||
        program.animalId?.toString() === livestockId?.toString()
      );
    });

    console.log(
      `Found ${filteredPrograms.length} feeding programs for livestock ${livestockId}`,
    );
    return {data: filteredPrograms, error: null};
  } catch (error) {
    console.error(
      '[getFeedingProgramsForLivestock] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: [],
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve feeding programs for livestock',
    };
  }
}
export async function recordFeedingEvent(feedingEventData) {
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
      programId: feedingEventData.programId,
      date: feedingEventData.date || new Date().toISOString(),
      timeOfDay: feedingEventData.timeOfDay,
      feedType: feedingEventData.feedType,
      quantityFed: feedingEventData.quantityFed,
      notes: feedingEventData.notes || '',
      recordedBy:
        feedingEventData.recordedBy ||
        `${user?.firstName || 'Unknown'} ${user?.lastName || 'User'}`,
    };

    const response = await api.post('/feeding/event', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[recordFeedingEvent] Response:', response.data);
    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[recordFeedingEvent] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to record feeding event',
    };
  }
}
