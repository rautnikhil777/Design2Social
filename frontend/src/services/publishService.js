import { apiClient } from './apiClient';

export async function publishCreative({ creativeId }) {
  const res = await apiClient.post('/api/publish', { creativeId });
  return res.data;
}

export async function getPublishHistory() {
  const res = await apiClient.get('/api/publish/history');
  return res.data;
}

