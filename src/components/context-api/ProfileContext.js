'use client';

import { createContext, useContext } from 'react';
import { API_BASE_URL } from '@/config/Api';

// Create the Context
export const ProfileContext = createContext({
  currentUser: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  forgotPassword: async () => {},
  updateProfile: async () => {},
  fetchUsers: async () => [],
  deleteUser: async () => {},
  disableUser: async () => {},
  suspendUser: async () => {},
  clearError: () => {},
});

// Custom hook for easier consumption
export const useProfile = () => {
  return useContext(ProfileContext);
};
