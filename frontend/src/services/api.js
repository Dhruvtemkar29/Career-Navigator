
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

export const getPredictionHistory = async () => {
  const response = await api.get('/history/');
  return response.data;
};

export const getPredictionDetails = async (recordId) => {
  const response = await api.get(`/history/${recordId}`);
  return response.data;
};

export default api;
