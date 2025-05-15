import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development'
    ? "http://localhost:4000"
    : "https://backendsorriaodonto.onrender.com",
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
    
    // Verifica se o erro é 401 (não autorizado) e não é uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tenta renovar o token usando o endpoint /api/refresh-token (corrigido para incluir /api)
        const refreshResponse = await axios.post(
          `${process.env.NODE_ENV === 'development' 
            ? "http://localhost:4000/api" 
            : "https://backendsorriaodonto.onrender.com/api"}/refresh-token`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        
        const newToken = refreshResponse.data.token;
        
        // Atualiza o token no localStorage e no header
        localStorage.setItem("token", newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        // Repete a requisição original com o novo token
        return api(originalRequest);
      } catch (refreshError) {
        // Se não conseguir renovar, faz logout
        localStorage.removeItem("token");
        // Redireciona para login com flag de sessão expirada
        window.location.href = "/login?session_expired=1";
        return Promise.reject(refreshError);
      }
    }
    
    // Para outros erros, apenas rejeita
    return Promise.reject(error);
  }
);

export default api;