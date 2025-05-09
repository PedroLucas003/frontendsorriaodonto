import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development'
    ? "http://localhost:4000"  // Note que adicionei /api para seguir seu padrão de rotas
    : "https://backendsorriaodonto.onrender.com",  // URL do seu backend no Render
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
        // Tenta renovar o token usando o endpoint /refresh-token
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
        
        // Atualiza o token no localStorage e no header
        localStorage.setItem("token", newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        // Repete a requisição original com o novo token
        return api(originalRequest);
      } catch (refreshError) {
        // Se não conseguir renovar, faz logout
        localStorage.removeItem("token");
        alert("Sua sessão expirou. Por favor, faça login novamente.");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    
    // Para outros erros, apenas rejeita
    return Promise.reject(error);
  }
);

export default api;