import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createEmployee(employeeData) {
  try {
    const token = await AsyncStorage.getItem('token');
    const userRaw = await AsyncStorage.getItem('user');
    const activeFarmRaw = await AsyncStorage.getItem('activeFarm');

    const user = JSON.parse(userRaw || '{}');
    const activeFarm = JSON.parse(activeFarmRaw || '{}');
    const farmId = activeFarm?.id;

    if (!token || !user?.id) {
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

    let payload = {
      ...employeeData,
      farmIds: [farmId],
    };

    if (
      employeeData.employeeType === 'permanent' &&
      employeeData.selectedBenefits
    ) {
      const benefits = [];

      if (employeeData.selectedBenefits.nssf) {
        benefits.push({name: 'nssf', amount: 1080});
      }
      if (employeeData.selectedBenefits.nhif) {
        benefits.push({name: 'nhif', amount: 1400});
      }
      if (employeeData.selectedBenefits.housingLevy) {
        benefits.push({name: 'housingLevy', amount: 375});
      }
      if (
        employeeData.selectedBenefits.customBenefit &&
        employeeData.customBenefitName &&
        employeeData.customBenefitAmount
      ) {
        benefits.push({
          name: employeeData.customBenefitName,
          amount: Number(employeeData.customBenefitAmount),
        });
      }

      payload.benefits = benefits;
    }

    // Clean up unwanted keys
    delete payload.selectedBenefits;
    delete payload.customBenefitName;
    delete payload.customBenefitAmount;

    const response = await api.post('/employees', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return {data: response.data, error: null};
  } catch (error) {
    console.error(
      '[createEmployee] Error:',
      error?.response?.data || error.message,
    );
    return {
      data: null,
      error:
        error?.response?.data?.message ||
        error.message ||
        'Failed to create employee',
    };
  }
}
