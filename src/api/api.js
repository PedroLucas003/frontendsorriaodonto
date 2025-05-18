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
  (response) => {
    // Log para depuração
    console.log("Resposta recebida:", {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    // Padroniza a resposta para sempre ter a propriedade 'data'
    if (Array.isArray(response.data)) {
      return { ...response, data: { data: response.data } };
    }
    return response;
  },
  async (error) => {
    console.error("Erro na resposta:", {
      message: error.message,
      config: error.config,
      response: error.response
    });

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login?session_expired=1";
    }
    
    return Promise.reject(error);
  }
);

export default api;