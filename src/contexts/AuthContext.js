import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from './api/api'; // Certifique-se que o caminho para sua api.js está correto

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenExp = localStorage.getItem('token_exp');

    // Se o token existe E a data de expiração é maior que a data atual
    if (token && tokenExp && (new Date(Number(tokenExp)) > new Date())) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      // Se não há token ou ele está expirado, limpa o localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('token_exp');
    }
    setIsLoading(false);
  }, []);

  const login = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const expirationTime = decodedToken.exp * 1000; // Converte segundos para milissegundos

      localStorage.setItem('token', token);
      localStorage.setItem('token_exp', expirationTime);

      api.defaults.headers.Authorization = `Bearer ${token}`;
      setIsAuthenticated(true);
      navigate('/register'); // Redireciona para a página principal após o login
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      // Lidar com um token inválido, se necessário
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_exp');
    delete api.defaults.headers.Authorization;
    setIsAuthenticated(false);
    navigate('/login');
  };
  
  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
  
  if (isLoading) {
    return <div>Carregando aplicação...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
  return useContext(AuthContext);
};