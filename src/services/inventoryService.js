import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to get active farm
async function getActiveFarm() {
  try {
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
  } catch (error) {
    console.error('[getActiveFarm] Error:', error);
    return null;
  }
}

// Create a new inventory item
export async function createInventory(inventoryData) {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('Retrieved Token:', token);

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const activeFarm = await getActiveFarm();
    if (!activeFarm) {
      return {
        data: null,
        error: 'No active farm found. Please select a farm first.',
      };
    }

    const payload = {
      farmId: activeFarm.id,
      ...inventoryData,
    };

    console.log('Inventory payload:', JSON.stringify(payload, null, 2));

    const response = await api.post('/inventory', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[createInventory] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[createInventory] Error:',
      JSON.stringify(error?.response?.data || error.message, null, 2),
    );

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create inventory item',
    };
  }
}

export async function getFarmInventory() {
  try {
    const token = await AsyncStorage.getItem('token');
    const activeFarm = await getActiveFarm();

    if (!token || !activeFarm?.id) {
      return {
        data: null,
        error: 'Authentication failed or active farm not set',
      };
    }

    const response = await api.get(`/inventory?farmId=${activeFarm.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Inventory fetched:', JSON.stringify(response.data, null, 2)); // Debug log

    return {data: response.data?.data || [], error: null};
  } catch (error) {
    console.error('[getFarmInventory] Error:', error);
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to retrieve inventory items',
    };
  }
}

export async function getInventoryById(inventoryId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication failed: missing token');
    }

    const response = await api.get(`/inventory/${inventoryId}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    return response.data;
  } catch (error) {
    console.error(
      '[getInventoryById] Error:',
      error?.response?.data || error.message,
    );
    throw (
      error?.response?.data?.message ||
      error.message ||
      'Failed to fetch inventory item'
    );
  }
}

export async function updateMachinery(inventoryId, machineryData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.patch(
      `/inventory/machinery/${inventoryId}`,
      machineryData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateMachinery] Error:',
      error?.response?.data || error.message,
    );

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update machinery item',
    };
  }
}

export async function updateGoodsInStock(inventoryId, goodsData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.patch(
      `/inventory/goods/${inventoryId}`,
      goodsData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateGoodsInStock] Error:',
      error?.response?.data || error.message,
    );

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update goods in stock item',
    };
  }
}

// Update a utility item
export async function updateUtility(inventoryId, utilityData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.patch(
      `/inventory/utility/${inventoryId}`,
      utilityData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[updateUtility] Error:',
      error?.response?.data || error.message,
    );

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update utility item',
    };
  }
}

// Delete a machinery item
export async function deleteMachinery(inventoryId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    await api.delete(`/inventory/machinery/${inventoryId}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    return {data: true, error: null};
  } catch (error) {
    console.error(
      '[deleteMachinery] Error:',
      error?.response?.data || error.message,
    );

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete machinery item',
    };
  }
}

export async function deleteGoodsInStock(inventoryId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    await api.delete(`/inventory/goods/${inventoryId}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    return {data: true, error: null};
  } catch (error) {
    console.error(
      '[deleteGoodsInStock] Error:',
      error?.response?.data || error.message,
    );

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete goods in stock item',
    };
  }
}

// Delete a utility item
export async function deleteUtility(inventoryId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    await api.delete(`/inventory/utility/${inventoryId}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    return {data: true, error: null};
  } catch (error) {
    console.error(
      '[deleteUtility] Error:',
      error?.response?.data || error.message,
    );

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete utility item',
    };
  }
}

// Generic delete function that works with any inventory item
export async function deleteInventory(inventoryId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    await api.delete(`/inventory/${inventoryId}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    return {data: true, error: null};
  } catch (error) {
    console.error(
      '[deleteInventory] Error:',
      error?.response?.data || error.message,
    );

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete inventory item',
    };
  }
}

// Helper functions to format data for creation

export function formatMachineryData(formData) {
  return {
    machinery: {
      equipmentName: formData.equipmentName,
      equipmentId: formData.equipmentId,
      purchaseDate: formData.purchaseDate,
      currentLocation: formData.currentLocation,
      condition: formData.condition,
      lastServiceDate: formData.lastServiceDate,
      nextServiceDate: formData.nextServiceDate,
    },
  };
}

export function formatGoodsInStockData(formData) {
  return {
    goodsInStock: {
      itemName: formData.itemName,
      sku: formData.sku,
      quantity: parseInt(formData.quantity, 10),
      currentLocation: formData.currentLocation,
      condition: formData.condition,
      expirationDate: formData.expirationDate,
    },
  };
}

export function formatUtilityData(formData) {
  const utilityData = {
    utilityType: formData.utilityType,
    entryDate: formData.entryDate,
    facilityCondition: formData.facilityCondition,
  };

  // Add water-specific fields
  if (formData.utilityType === 'water') {
    utilityData.waterLevel = parseInt(formData.waterLevel, 10);
    utilityData.waterSource = formData.waterSource;
    utilityData.waterStorage = parseInt(formData.waterStorage, 10);
  }

  // Add power-specific fields
  if (
    formData.utilityType === 'power' ||
    formData.utilityType === 'electricity'
  ) {
    utilityData.powerSource = formData.powerSource;
    utilityData.powerCapacity = formData.powerCapacity;
    utilityData.installationCost = parseInt(formData.installationCost, 10);
    utilityData.consumptionRate = parseInt(formData.consumptionRate, 10);
    utilityData.consumptionCost = parseInt(formData.consumptionCost, 10);
  }

  // Add structure-specific fields
  if (
    formData.utilityType === 'structure' ||
    formData.utilityType === 'building'
  ) {
    utilityData.structureType = formData.structureType;
    utilityData.structureCapacity = formData.structureCapacity;
    utilityData.constructionCost = parseInt(formData.constructionCost, 10);
  }

  // Add maintenance fields if provided
  if (formData.lastMaintenanceDate) {
    utilityData.lastMaintenanceDate = formData.lastMaintenanceDate;
  }
  if (formData.maintenanceCost) {
    utilityData.maintenanceCost = parseInt(formData.maintenanceCost, 10);
  }

  return {
    utility: utilityData,
  };
}

// Helper function to get inventory statistics
export function getInventoryStats(inventoryData) {
  const stats = {
    total: 0,
    machinery: 0,
    goodsInStock: 0,
    utilities: 0,
    alerts: {
      servicesDue: 0,
      expiringSoon: 0,
    },
  };

  if (!inventoryData || !Array.isArray(inventoryData)) {
    return stats;
  }

  const today = new Date();

  inventoryData.forEach(item => {
    stats.total++;

    if (item.machinery) {
      stats.machinery++;
      // Check for service alerts
      const nextServiceDate = new Date(item.machinery.nextServiceDate);
      const daysUntilService = Math.floor(
        (nextServiceDate - today) / (1000 * 60 * 60 * 24),
      );
      if (daysUntilService <= 14) {
        stats.alerts.servicesDue++;
      }
    }

    if (item.goodsInStock) {
      stats.goodsInStock++;
      // Check for expiration alerts
      const expirationDate = new Date(item.goodsInStock.expirationDate);
      const daysUntilExpiry = Math.floor(
        (expirationDate - today) / (1000 * 60 * 60 * 24),
      );
      if (daysUntilExpiry <= 30) {
        stats.alerts.expiringSoon++;
      }
    }

    if (item.utility) {
      stats.utilities++;
    }
  });

  return stats;
}
