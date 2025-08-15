// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000/api' 
  : 'https://travelplanner-41r3aw9w8-chiu0322s-projects.vercel.app/api'; // Your deployed backend URL

class TravelPlannerAPI {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Helper method to get headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  }

  // Authentication methods
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });
      
      const data = await this.handleResponse(response);
      
      if (data.success) {
        this.setToken(data.data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials)
      });
      
      const data = await this.handleResponse(response);
      
      if (data.success) {
        this.setToken(data.data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Travel plan methods
  async getTravelPlans(params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/travel-plans?${queryParams}`, {
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get travel plans error:', error);
      throw error;
    }
  }

  async getTravelPlan(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/travel-plans/${id}`, {
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get travel plan error:', error);
      throw error;
    }
  }

  async createTravelPlan(planData) {
    try {
      const response = await fetch(`${API_BASE_URL}/travel-plans`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(planData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Create travel plan error:', error);
      throw error;
    }
  }

  async updateTravelPlan(id, planData) {
    try {
      const response = await fetch(`${API_BASE_URL}/travel-plans/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(planData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update travel plan error:', error);
      throw error;
    }
  }

  async deleteTravelPlan(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/travel-plans/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Delete travel plan error:', error);
      throw error;
    }
  }

  async addDayToPlan(planId, dayData) {
    try {
      const response = await fetch(`${API_BASE_URL}/travel-plans/${planId}/days`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dayData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Add day error:', error);
      throw error;
    }
  }

  // Token management
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    // Redirect to login or reload page
    window.location.reload();
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Auto-save functionality
  async autoSaveTravelPlan(planData) {
    if (!this.isAuthenticated()) {
      // Save to localStorage if not authenticated
      localStorage.setItem('travelPlanBackup', JSON.stringify(planData));
      return;
    }

    try {
      // Try to update existing plan or create new one
      if (planData.id) {
        await this.updateTravelPlan(planData.id, planData);
      } else {
        const result = await this.createTravelPlan(planData);
        return result.data.travelPlan._id; // Return the new ID
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      // Fallback to localStorage
      localStorage.setItem('travelPlanBackup', JSON.stringify(planData));
    }
  }

  // Sync local data with server
  async syncLocalData() {
    if (!this.isAuthenticated()) return;

    try {
      const backupData = localStorage.getItem('travelPlanBackup');
      if (backupData) {
        const planData = JSON.parse(backupData);
        const result = await this.createTravelPlan(planData);
        localStorage.removeItem('travelPlanBackup');
        return result;
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }
}

// Create global API instance
window.travelAPI = new TravelPlannerAPI(); 