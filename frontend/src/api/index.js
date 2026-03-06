import axios from "axios";

// ✅ AXIOS CONFIGURATION WITH PROPER BASE URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 20 second timeout
});

// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR WITH DETAILED ERROR HANDLING
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = "An error occurred. Please try again.";

    if (error.response) {
      // Server responded with error status code
      const status = error.response.status;
      const data = error.response.data;

      if (status === 400) {
        errorMessage =
          data?.error || data?.message || "Bad request. Please check your input.";
      } else if (status === 401) {
        errorMessage = "Unauthorized. Please login again.";
        localStorage.removeItem("token");
      } else if (status === 403) {
        errorMessage = "Access forbidden.";
      } else if (status === 404) {
        errorMessage = "Resource not found.";
      } else if (status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (status >= 500) {
        errorMessage = "Server error. Please contact support.";
      }
    } else if (error.request) {
      // Request made but no response received
      if (error.code === "ECONNABORTED") {
        errorMessage = "❌ Request timeout. Backend server may be down or slow.";
      } else if (!window.navigator.onLine) {
        errorMessage = "❌ No internet connection. Please check your network.";
      } else {
        errorMessage =
          "❌ Cannot connect to server. Is the backend running on http://localhost:8000?";
      }
      console.error("No response from server:", error.message);
    } else {
      // Error in request setup
      errorMessage = error.message || "Unknown error occurred.";
    }

    console.error("API Error:", errorMessage);

    // Create custom error object with message
    const customError = new Error(errorMessage);
    customError.response = error.response;
    customError.originalError = error;

    return Promise.reject(customError);
  }
);

// ✅ APPOINTMENT API FUNCTIONS
export const appointmentAPI = {
  // ✅ Book a new appointment
  bookAppointment: async (appointmentData) => {
    try {
      const response = await api.post("book-appointment/", appointmentData);
      return response;
    } catch (error) {
      console.error("Error booking appointment:", error);
      throw error;
    }
  },

  // ✅ Get all appointments (Admin dashboard)
  getAppointments: async () => {
    try {
      const response = await api.get("appointments/");
      return response;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },

  // ✅ Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get("dashboard-stats/");
      return response;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // ✅ Update appointment status (Admin dashboard)
  updateAppointmentStatus: async (id, status) => {
    try {
      const response = await api.patch(`appointments/${id}/status/`, {
        status: status,
      });
      return response;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw error;
    }
  },

  // ✅ Upload Minutes of Meeting PDF (Admin dashboard)
  uploadMinutesOfMeeting: async (id, formData) => {
    try {
      const response = await api.post(
        `appointments/${id}/upload-mom/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Error uploading MoM PDF:", error);
      throw error;
    }
  },

  // ✅ Get client by phone number (Auto-fill)
  getClientByPhone: async (phone) => {
    try {
      const response = await api.get(`client-by-phone/?phone=${phone}`);
      return response;
    } catch (error) {
      console.error("Error fetching client by phone:", error);
      throw error;
    }
  },

  // ✅ Search clients by name (used for autocomplete)
  searchClients: async (name) => {
    try {
      const response = await api.get(`clients/?name=${encodeURIComponent(name)}`);
      return response;
    } catch (error) {
      console.error("Error searching clients by name:", error);
      throw error;
    }
  },

  // ✅ Test MongoDB connection (Optional)
  testMongoDB: async () => {
    try {
      const response = await api.get("test-mongodb/");
      return response;
    } catch (error) {
      console.error("Error testing MongoDB:", error);
      throw error;
    }
  },
};

export default api;
