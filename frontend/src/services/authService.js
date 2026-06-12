import { apiClient } from './apiClient';

export async function login({ email, password }) {
  const res = await apiClient.post('/api/auth/login', { email, password });
  return res.data;
}

export async function signup({ name, email, password, companyName }) {
  const res = await apiClient.post('/api/auth/signup', { name, email, password, companyName });
  return res.data;
}

