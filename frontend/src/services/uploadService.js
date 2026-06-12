import { apiClient } from './apiClient';

export async function uploadLogo(file) {
  const form = new FormData();
  form.append('logo', file);
  const res = await apiClient.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

