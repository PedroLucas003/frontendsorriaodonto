import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development'
    ? "http://localhost:4000"  // Mantém sem /api
    : "https://backendsorriaodonto.onrender.com", // Mantém sem /api
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros e renovação de token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Remove o /api do endpoint de refresh-token para compatibilidade
        const refreshResponse = await axios.post(
          `${process.env.NODE_ENV === 'development' 
            ? "http://localhost:4000" 
            : "https://backendsorriaodonto.onrender.com"}/refresh-token`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        
        const newToken = refreshResponse.data.token;
        localStorage.setItem("token", newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        window.location.href = "/login?session_expired=1";
        return Promise.reject(refreshError);
      }
    }
    
    // Tratamento específico para erro 500
    if (error.response?.status === 500) {
      console.error("Erro 500 do servidor:", {
        url: originalRequest.url,
        response: error.response.data
      });
      error.message = "Erro interno do servidor. Tente novamente mais tarde.";
    }
    
    return Promise.reject(error);
  }
);

export default api;