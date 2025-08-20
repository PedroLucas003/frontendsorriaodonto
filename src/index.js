import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import MainPage from './components/MainPage/MainPage';
import RegisterUser from './RegisterUser';
import Login from './Login';
import Prontuario from './Prontuario';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          {/* --- Rotas Públicas --- */}
          {/* Qualquer pessoa pode acessar estas rotas, mesmo sem login */}
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/prontuario" element={<Prontuario />} /> {/* MOVEMOS O PRONTUÁRIO PARA CÁ */}

          {/* --- Rotas Protegidas --- */}
          {/* Apenas usuários logados podem acessar esta rota */}
          <Route 
            path="/register" 
            element={
              <PrivateRoute>
                <RegisterUser />
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);