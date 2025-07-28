import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createEmployee(employeeData) {
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
      ...employeeData,
      farmIds: [activeFarm.id],
    };

    console.log('Employee payload:', JSON.stringify(payload, null, 2));

    const response = await api.post('/employees', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(
      '[createEmployee] Response:',
      JSON.stringify(response.data, null, 2),
    );

    // Return the actual employee data from the response
    return {
      data: response.data?.data || response.data, // Handle both possible response structures
      error: null,
    };
  } catch (error) {
    console.error(
      '[createEmployee] Error:',
      JSON.stringify(error?.response?.data || error.message, null, 2),
    );

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create employee',
    };
  }
}

export async function getFarmEmployees() {
  try {
    const token = await AsyncStorage.getItem('token');
    const activeFarm = JSON.parse(
      (await AsyncStorage.getItem('activeFarm')) || '{}',
    );

    if (!token || !activeFarm?.id) {
      return {
        data: null,
        error: 'Authentication failed or active farm not set',
      };
    }

    console.log(
      '[getFarmEmployees] Fetching employees for farm:',
      activeFarm.id,
    );

    const response = await api.get(`/employees?farmId=${activeFarm.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      '[getFarmEmployees] Response:',
      JSON.stringify(response.data, null, 2),
    );

    // Handle different possible response structures
    let employees = [];
    if (response.data?.data) {
      employees = Array.isArray(response.data.data) ? response.data.data : [];
    } else if (Array.isArray(response.data)) {
      employees = response.data;
    } else if (response.data?.employees) {
      employees = Array.isArray(response.data.employees)
        ? response.data.employees
        : [];
    }

    console.log('[getFarmEmployees] Processed employees:', employees.length);

    return {
      data: employees,
      error: null,
    };
  } catch (error) {
    console.error(
      '[getFarmEmployees] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to retrieve employees',
    };
  }
}

export async function getEmployeeById(employeeId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication failed: missing token');
    }

    const response = await api.get(`/employees/${employeeId}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    return response.data?.data || response.data;
  } catch (error) {
    console.error(
      '[getEmployeeById] Error:',
      error?.response?.data || error.message,
    );
    throw (
      error?.response?.data?.message ||
      error.message ||
      'Failed to fetch employee'
    );
  }
}

export async function updateEmployee(employeeId, updateData) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    const response = await api.patch(`/employees/${employeeId}`, updateData, {
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
      '[updateEmployee] Error:',
      error?.response?.data || error.message,
    );

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update employee',
    };
  }
}

export async function deleteEmployee(employeeId) {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      return {
        data: null,
        error: 'Authentication failed: missing token',
      };
    }

    await api.delete(`/employees/${employeeId}`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    return {data: true, error: null};
  } catch (error) {
    console.error(
      '[deleteEmployee] Error:',
      error?.response?.data || error.message,
    );

    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete employee',
    };
  }
}

async function getActiveFarm() {
  try {
    // First try to get from activeFarm storage
    const activeFarmString = await AsyncStorage.getItem('activeFarm');
    if (activeFarmString) {
      const activeFarm = JSON.parse(activeFarmString);
      if (activeFarm?.id) {
        console.log('[getActiveFarm] Found activeFarm in storage:', activeFarm);
        return {
          id: activeFarm.id,
          name: activeFarm.name,
          location: activeFarm.location || activeFarm.administrativeLocation,
          size: activeFarm.size || `${activeFarm.size} acres`,
          animals: Array.isArray(activeFarm.animals)
            ? activeFarm.animals
            : Array.isArray(activeFarm.farmingTypes)
            ? activeFarm.farmingTypes
            : [],
        };
      }
    }

    // Fallback to user's first farm
    const user = JSON.parse((await AsyncStorage.getItem('user')) || '{}');
    const farms = user?.farms || [];

    if (farms.length === 0) {
      console.log('[getActiveFarm] No farms found');
      return null;
    }

    const farm = farms[0];
    console.log('[getActiveFarm] Using first farm from user:', farm);

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

export function formatEmployeeData(formData, employeeType) {
  const baseData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
    employeeType: employeeType,
    dateOfEmployment: formData.dateOfEmployment,
    // Fixed: Use selectedRole (singular) and handle it as a single value
    role: formData.selectedRole || formData.customRole, // Use role instead of roles array
    paymentSchedule: formData.paymentSchedule,
    salary: parseInt(formData.salary, 10),
  };

  if (formData.middleName) {
    baseData.middleName = formData.middleName;
  }

  if (formData.idNumber) {
    baseData.idNumber = formData.idNumber;
  }

  if (employeeType === 'permanent') {
    if (formData.emergencyContact) {
      baseData.emergencyContact = formData.emergencyContact;
    }

    const benefits = [];
    Object.entries(formData.selectedBenefits).forEach(([key, isSelected]) => {
      if (isSelected && key !== 'customBenefit') {
        const benefitAmounts = {
          paye: 0,
          nssf: 1080,
          nhif: 1400,
          housingLevy: 375,
        };

        if (benefitAmounts[key] !== undefined) {
          benefits.push({
            name: key,
            amount: benefitAmounts[key],
          });
        }
      }
    });

    if (formData.selectedBenefits.customBenefit && formData.customBenefitName) {
      benefits.push({
        name: formData.customBenefitName,
        amount: parseInt(formData.customBenefitAmount, 10) || 0,
      });
    }

    if (benefits.length > 0) {
      baseData.benefits = benefits;
    }
  } else if (employeeType === 'casual') {
    if (formData.endDate) {
      baseData.endDate = formData.endDate;
    }

    if (formData.typeOfEngagement) {
      baseData.typeOfEngagement = formData.typeOfEngagement;
    }

    if (formData.workSchedule) {
      baseData.workSchedule = formData.workSchedule;
    }
  }

  console.log(
    '[formatEmployeeData] Formatted data:',
    JSON.stringify(baseData, null, 2),
  );
  return baseData;
}
