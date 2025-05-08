import api from './api';

export const register = async (data) => {
    try {
        console.log(data)
        const response = await api.post('/auth/register', data);
        console.log('Registration response:', response.data);
        return { data: response.data, error: null };
    } catch (error) {
        console.error('Error in registration:', error?.response?.data?.message);
        let msg = error?.response?.data?.message || error.message || 'Registration failed';
        return { data: null, error: msg };
    }
};

