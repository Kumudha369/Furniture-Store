import { create } from 'zustand';
import axios from 'axios';

const API = '/api/auth';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('jothi_user')) || null,
  token: localStorage.getItem('jothi_token') || null,
  loading: false,
  error: null,

  init: () => {
    const token = localStorage.getItem('jothi_token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post(`${API}/login`, { email, password });
      localStorage.setItem('jothi_token', data.token);
      localStorage.setItem('jothi_user', JSON.stringify(data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      set({ user: data.user, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  register: async (name, email, password, phone) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post(`${API}/register`, { name, email, password, phone });
      localStorage.setItem('jothi_token', data.token);
      localStorage.setItem('jothi_user', JSON.stringify(data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      set({ user: data.user, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('jothi_token');
    localStorage.removeItem('jothi_user');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  },

  updateProfile: async (profileData) => {
    set({ loading: true });
    try {
      const { data } = await axios.put(`${API}/profile`, profileData);
      const updatedUser = { ...get().user, ...data.user };
      localStorage.setItem('jothi_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message };
    }
  },

  isAdmin: () => get().user?.role === 'admin',
  isLoggedIn: () => !!get().token,
}));

export default useAuthStore;
