import { apiClient } from './apiClient';

export async function saveCreative({ prompt, type, quote, template }) {
  const res = await apiClient.post('/api/creative/save', { prompt, type, quote, template });
  return res.data;
}

export async function getCreativeHistory() {
  const res = await apiClient.get('/api/creative/history');
  return res.data;
}

