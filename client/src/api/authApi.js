import api from './axios';

// Thin wrapper functions around the auth endpoints. Keeping these separate
// from AuthContext means the context focuses on STATE (who's logged in),
// while this file focuses on the actual HTTP calls - easier to test/reuse
// either piece independently.
export const registerUser = async ({ name, email, password }) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

export const loginUser = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const fetchCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const fetchCustomers = async()=>{
  const {data}=await api.get('/auth/customers');
  return data;
}
