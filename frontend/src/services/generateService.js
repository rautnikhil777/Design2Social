import { apiClient } from './apiClient';

export async function generateCreative({ prompt, businessType }) {
  const res = await apiClient.post('/api/generate', { prompt, businessType });
  return res.data;
}

