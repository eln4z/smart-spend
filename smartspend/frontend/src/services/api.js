// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('smartspend_token');

// Helper to handle responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Auth headers
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// API Service
const api = {
  // ============ AUTH ============
  auth: {
    register: async (name, email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      return handleResponse(response);
    },

    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    getMe: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    changePassword: async (currentPassword, newPassword) => {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return handleResponse(response);
    },
  },

  // ============ USER ============
  user: {
    getProfile: async () => {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    updateProfile: async (data) => {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    updateSettings: async (settings) => {
      const response = await fetch(`${API_BASE_URL}/users/settings`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(settings),
      });
      return handleResponse(response);
    },

    deleteAccount: async () => {
      const response = await fetch(`${API_BASE_URL}/users/account`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return handleResponse(response);
    },
  },

  // ============ TRANSACTIONS ============
  transactions: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_BASE_URL}/transactions${queryString ? `?${queryString}` : ''}`,
        { headers: authHeaders() }
      );
      return handleResponse(response);
    },

    getSummary: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_BASE_URL}/transactions/summary${queryString ? `?${queryString}` : ''}`,
        { headers: authHeaders() }
      );
      return handleResponse(response);
    },

    getOne: async (id) => {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    create: async (transaction) => {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(transaction),
      });
      return handleResponse(response);
    },

    update: async (id, transaction) => {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(transaction),
      });
      return handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return handleResponse(response);
    },
  },

  // ============ CATEGORIES ============
  categories: {
    getAll: async (type = null) => {
      const queryString = type ? `?type=${type}` : '';
      const response = await fetch(`${API_BASE_URL}/categories${queryString}`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    getOne: async (id) => {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    getStats: async (id, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_BASE_URL}/categories/${id}/stats${queryString ? `?${queryString}` : ''}`,
        { headers: authHeaders() }
      );
      return handleResponse(response);
    },

    create: async (category) => {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(category),
      });
      return handleResponse(response);
    },

    update: async (id, category) => {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(category),
      });
      return handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return handleResponse(response);
    },
  },

  // ============ BUDGETS ============
  budgets: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/budgets`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    getAlerts: async () => {
      const response = await fetch(`${API_BASE_URL}/budgets/alerts`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    getOne: async (id) => {
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    create: async (budget) => {
      const response = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(budget),
      });
      return handleResponse(response);
    },

    update: async (id, budget) => {
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(budget),
      });
      return handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return handleResponse(response);
    },
  },

  // ============ SUBSCRIPTIONS ============
  subscriptions: {
    getAll: async (active = null) => {
      const queryString = active !== null ? `?active=${active}` : '';
      const response = await fetch(
        `${API_BASE_URL}/subscriptions${queryString}`,
        {
          headers: authHeaders(),
        }
      );
      return handleResponse(response);
    },

    getSummary: async () => {
      const response = await fetch(`${API_BASE_URL}/subscriptions/summary`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    getOne: async (id) => {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    create: async (subscription) => {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(subscription),
      });
      return handleResponse(response);
    },

    update: async (id, subscription) => {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(subscription),
      });
      return handleResponse(response);
    },

    toggle: async (id) => {
      const response = await fetch(
        `${API_BASE_URL}/subscriptions/${id}/toggle`,
        {
          method: 'PUT',
          headers: authHeaders(),
        }
      );
      return handleResponse(response);
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      return handleResponse(response);
    },
  },

  // ============ PREDICTIONS ============
  predictions: {
    getMonthly: async () => {
      const response = await fetch(`${API_BASE_URL}/predictions/monthly`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    getByCategory: async () => {
      const response = await fetch(`${API_BASE_URL}/predictions/category`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    getTrends: async (months = 6) => {
      const response = await fetch(
        `${API_BASE_URL}/predictions/trends?months=${months}`,
        {
          headers: authHeaders(),
        }
      );
      return handleResponse(response);
    },
  },

  // ============ SMART TIPS ============
  tips: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/tips`, {
        headers: authHeaders(),
      });
      return handleResponse(response);
    },

    getSavingsGoal: async (targetAmount, targetMonths) => {
      const response = await fetch(
        `${API_BASE_URL}/tips/savings-goal?targetAmount=${targetAmount}&targetMonths=${targetMonths}`,
        { headers: authHeaders() }
      );
      return handleResponse(response);
    },
  },
};

export default api;
