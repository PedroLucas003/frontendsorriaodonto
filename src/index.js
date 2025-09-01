// src/index.js (VERSÃO FINAL ATUALIZADA)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Importações dos componentes de página
import MainPage from './components/MainPage/MainPage';
import RegisterUser from './RegisterUser';
import Login from './Login';
import Prontuario from './Prontuario';

// 👇 1. ADICIONE A IMPORTAÇÃO DO NOVO LAYOUT AQUI
import { PanelLayout } from './components/PanelLayout';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          {/* --- Rotas Públicas --- */}
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/prontuario" element={<Prontuario />} />

          {/* --- Rotas Protegidas --- */}
          <Route 
            path="/register" 
            element={
              <PrivateRoute>
                {/* 👇 2. ENVOLVEMOS O REGISTERUSER COM O NOVO LAYOUT 👇 */}
                <PanelLayout pageTitle="Gerenciamento de Pacientes">
                  <RegisterUser />
                </PanelLayout>
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);