import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createInventoryItem(inventoryData) {
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
      '[createInventoryItem] Response:',
      JSON.stringify(response.data, null, 2),
    );

    return {
      data: response.data?.data || response.data,
      error: null,
    };
  } catch (error) {
    console.error(
      '[createInventoryItem] Error:',
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

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const activeFarm = await getActiveFarm();
    if (!activeFarm?.id) {
      return {
        data: null,
        error: 'No active farm selected. Please select a farm first.',
      };
    }

    console.log(
      '[getFarmInventory] Fetching inventory for farm:',
      activeFarm.id,
    );

    const response = await api.get(`/inventory?farmId=${activeFarm.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      '[getFarmInventory] Raw API Response:',
      JSON.stringify(response.data, null, 2),
    );

    // Handle different possible response structures
    let inventory = [];
    if (response.data?.data) {
      inventory = Array.isArray(response.data.data) ? response.data.data : [];
    } else if (Array.isArray(response.data)) {
      inventory = response.data;
    } else if (response.data?.inventory) {
      inventory = Array.isArray(response.data.inventory)
        ? response.data.inventory
        : [];
    }

    console.log(
      '[getFarmInventory] Extracted inventory array:',
      inventory.length,
      'items',
    );

    // Transform the inventory data to flatten the structure
    const transformedInventory = transformInventoryData(inventory);
    console.log(
      '[getFarmInventory] Transformed inventory:',
      transformedInventory.length,
      'items',
    );

    return {
      data: transformedInventory,
      error: null,
    };
  } catch (error) {
    console.error(
      '[getFarmInventory] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve inventory',
    };
  }
}

// Transform nested inventory structure to flat array
function transformInventoryData(inventoryArray) {
  if (!Array.isArray(inventoryArray)) {
    console.warn(
      '[transformInventoryData] Input is not an array:',
      inventoryArray,
    );
    return [];
  }

  const transformedItems = [];

  inventoryArray.forEach((inventoryRecord, index) => {
    console.log(
      `[transformInventoryData] Processing inventory record ${index}:`,
      {
        id: inventoryRecord.id,
        goodsCount: inventoryRecord.goodsInStock?.length || 0,
        machineryCount: inventoryRecord.machinery?.length || 0,
        utilitiesCount: inventoryRecord.utilities?.length || 0,
      },
    );

    // Add goods in stock
    if (Array.isArray(inventoryRecord.goodsInStock)) {
      inventoryRecord.goodsInStock.forEach(item => {
        transformedItems.push({
          ...item,
          type: 'goodsInStock',
          inventoryId: inventoryRecord.id,
          farmId: inventoryRecord.farmId,
        });
      });
    }

    // Add machinery
    if (Array.isArray(inventoryRecord.machinery)) {
      inventoryRecord.machinery.forEach(item => {
        transformedItems.push({
          ...item,
          type: 'machinery',
          inventoryId: inventoryRecord.id,
          farmId: inventoryRecord.farmId,
        });
      });
    }

    // Add utilities
    if (Array.isArray(inventoryRecord.utilities)) {
      inventoryRecord.utilities.forEach(item => {
        transformedItems.push({
          ...item,
          type: 'utility',
          inventoryId: inventoryRecord.id,
          farmId: inventoryRecord.farmId,
        });
      });
    }
  });

  console.log(
    '[transformInventoryData] Final transformed items:',
    transformedItems.length,
  );
  return transformedItems;
}

// Get inventory counts by type
export function getInventoryCounts(inventoryData) {
  if (!Array.isArray(inventoryData)) {
    console.warn('[getInventoryCounts] Input is not an array:', inventoryData);
    return {
      goodsInStock: 0,
      machinery: 0,
      utilities: 0,
      total: 0,
    };
  }

  const counts = inventoryData.reduce(
    (acc, item) => {
      switch (item.type) {
        case 'goodsInStock':
          acc.goodsInStock++;
          break;
        case 'machinery':
          acc.machinery++;
          break;
        case 'utility':
          acc.utilities++;
          break;
      }
      acc.total++;
      return acc;
    },
    {
      goodsInStock: 0,
      machinery: 0,
      utilities: 0,
      total: 0,
    },
  );

  console.log('[getInventoryCounts] Processed counts:', counts);
  return counts;
}
export async function getInventoryItemDetails(item) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication failed: missing token');
    }

    // Use the main inventory record ID, not the sub-item ID
    const inventoryRecordId = item.inventoryId || item.id;

    if (!inventoryRecordId) {
      throw new Error('No inventory record ID found');
    }

    console.log(
      `[getInventoryItemDetails] Fetching inventory record: ${inventoryRecordId} for item type: ${item.type}`,
    );

    // Get the complete inventory record
    const response = await api.get(`/inventory/${inventoryRecordId}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    const inventoryRecord = response.data?.data || response.data;
    console.log(
      '[getInventoryItemDetails] Full inventory record:',
      JSON.stringify(inventoryRecord, null, 2),
    );

    // Extract the specific item details based on type and ID
    let itemDetails = null;

    switch (item.type) {
      case 'goodsInStock':
        if (inventoryRecord.goodsInStock) {
          // If it's an array, find the specific item
          if (Array.isArray(inventoryRecord.goodsInStock)) {
            itemDetails = inventoryRecord.goodsInStock.find(
              goods => goods.id === item.id,
            );
          } else if (inventoryRecord.goodsInStock.id === item.id) {
            // If it's a single object
            itemDetails = inventoryRecord.goodsInStock;
          }
        }
        break;

      case 'machinery':
        if (inventoryRecord.machinery) {
          if (Array.isArray(inventoryRecord.machinery)) {
            itemDetails = inventoryRecord.machinery.find(
              machine => machine.id === item.id,
            );
          } else if (inventoryRecord.machinery.id === item.id) {
            itemDetails = inventoryRecord.machinery;
          }
        }
        break;

      case 'utility':
        if (inventoryRecord.utilities || inventoryRecord.utility) {
          const utilities =
            inventoryRecord.utilities || inventoryRecord.utility;
          if (Array.isArray(utilities)) {
            itemDetails = utilities.find(utility => utility.id === item.id);
          } else if (utilities.id === item.id) {
            itemDetails = utilities;
          }
        }
        break;

      default:
        throw new Error(`Unknown item type: ${item.type}`);
    }

    if (!itemDetails) {
      console.warn(
        `[getInventoryItemDetails] Item not found in inventory record. Item ID: ${item.id}, Type: ${item.type}`,
      );
      // Return the original item data as fallback
      return item;
    }

    // Merge with original item data and add inventory record context
    const enrichedItemDetails = {
      ...item,
      ...itemDetails,
      inventoryRecordId: inventoryRecordId,
      farmId: inventoryRecord.farmId || item.farmId,
      createdAt: inventoryRecord.createdAt || itemDetails.createdAt,
      updatedAt: inventoryRecord.updatedAt || itemDetails.updatedAt,
    };

    console.log(
      '[getInventoryItemDetails] Enriched item details:',
      JSON.stringify(enrichedItemDetails, null, 2),
    );
    return enrichedItemDetails;
  } catch (error) {
    console.error(
      '[getInventoryItemDetails] Error:',
      error?.response?.data || error.message,
    );

    console.log('[getInventoryItemDetails] Falling back to original item data');
    return item;
  }
}
export async function getInventoryItemById(itemId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication failed: missing token');
    }

    const response = await api.get(`/inventory/${itemId}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    return response.data?.data || response.data;
  } catch (error) {
    console.error(
      '[getInventoryItemById] Error:',
      error?.response?.data || error.message,
    );
    throw (
      error?.response?.data?.message ||
      error.message ||
      'Failed to fetch inventory item'
    );
  }
}

// Update goods in stock item
export async function updateGoodsInStock(itemId, updateData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.patch(`/inventory/goods/${itemId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      data: response.data?.data || response.data,
      error: null,
    };
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

// Delete goods in stock item
export async function deleteGoodsInStock(itemId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    await api.delete(`/inventory/goods/${itemId}`, {
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

// Update machinery item
export async function updateMachinery(itemId, updateData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.patch(
      `/inventory/machinery/${itemId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      data: response.data?.data || response.data,
      error: null,
    };
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

// Delete machinery item
export async function deleteMachinery(itemId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    await api.delete(`/inventory/machinery/${itemId}`, {
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

// Update utility item
export async function updateUtility(itemId, updateData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.patch(
      `/inventory/utility/${itemId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      data: response.data?.data || response.data,
      error: null,
    };
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

// Delete utility item
export async function deleteUtility(itemId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    await api.delete(`/inventory/utility/${itemId}`, {
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

// Consistent getActiveFarm function that matches your livestock service pattern
async function getActiveFarm() {
  try {
    // First try to get from activeFarm storage (same as livestock service)
    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');
    if (activeFarmRaw) {
      const activeFarm = JSON.parse(activeFarmRaw);
      if (activeFarm?.id) {
        console.log('[getActiveFarm] Found activeFarm in storage:', {
          id: activeFarm.id,
          name: activeFarm.name,
        });
        return activeFarm;
      }
    }

    // Fallback to user's first farm (same as your farm service pattern)
    const userRaw = await AsyncStorage.getItem('user');
    const user = JSON.parse(userRaw || '{}');
    const farms = user?.farms || [];

    if (farms.length === 0) {
      console.log('[getActiveFarm] No farms found');
      return null;
    }

    const farm = farms[0];
    console.log('[getActiveFarm] Using first farm from user:', {
      id: farm.id,
      name: farm.name,
    });

    // Return in consistent format
    return {
      id: farm.id,
      name: farm.name,
      location: farm.location || farm.administrativeLocation,
      size: farm.size ? `${farm.size} acres` : undefined,
      animals: Array.isArray(farm.animals)
        ? farm.animals
        : Array.isArray(farm.farmingTypes)
        ? farm.farmingTypes
        : [],
    };
  } catch (error) {
    console.error('[getActiveFarm] Error:', error);
    return null;
  }
}

// Export the getActiveFarm function so it can be used elsewhere if needed
export {getActiveFarm};

// Format inventory data based on type
export function formatInventoryData(formData, inventoryType) {
  let formattedData = {};

  switch (inventoryType) {
    case 'goodsInStock':
      formattedData = {
        goodsInStock: {
          itemName: formData.itemName,
          sku: formData.sku,
          quantity: parseInt(formData.quantity, 10) || 0,
          currentLocation: formData.currentLocation,
          condition: formData.condition,
          expirationDate: formData.expirationDate,
        },
      };
      break;

    case 'machinery':
      formattedData = {
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
      break;

    case 'utility':
      formattedData = {
        utility: {
          utilityType: formData.utilityType || 'water',
          waterLevel: parseInt(formData.waterLevel, 10) || 0,
          waterSource: formData.waterSource,
          waterStorage: parseInt(formData.waterStorage, 10) || 0,
          entryDate: formData.entryDate,
          powerSource: formData.powerSource,
          powerCapacity: formData.powerCapacity,
          installationCost: parseFloat(formData.installationCost) || 0,
          consumptionRate: parseFloat(formData.consumptionRate) || 0,
          consumptionCost: parseFloat(formData.consumptionCost) || 0,
          structureType: formData.structureType,
          structureCapacity: formData.structureCapacity,
          constructionCost: parseFloat(formData.constructionCost) || 0,
          facilityCondition: formData.facilityCondition,
          lastMaintenanceDate: formData.lastMaintenanceDate,
          maintenanceCost: parseFloat(formData.maintenanceCost) || 0,
        },
      };
      break;

    default:
      console.error(
        '[formatInventoryData] Unknown inventory type:',
        inventoryType,
      );
      return null;
  }

  console.log(
    '[formatInventoryData] Formatted data:',
    JSON.stringify(formattedData, null, 2),
  );
  return formattedData;
}
