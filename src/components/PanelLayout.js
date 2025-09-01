// src/components/PanelLayout.js

import React from 'react';
// Vamos importar os estilos que você acabou de atualizar
import '../RegisterUser.css'; 

// Um componente simples de ícone para a barra lateral
const NavIcon = ({ children }) => (
  <div className="panel-nav-icon">{children}</div>
);

export const PanelLayout = ({ children, pageTitle }) => {
  return (
    <div className="panel-container">
      {/* ===== BARRA LATERAL (SIDEBAR) ===== */}
      <aside className="panel-sidebar">
        <div className="panel-sidebar-header">
          <div className="panel-sidebar-logo">S</div>
          <h1 className="panel-sidebar-title">Sorria Odonto</h1>
        </div>
        <nav className="panel-sidebar-nav">
          <a href="#" className="panel-nav-item active">
            <NavIcon>👤</NavIcon>
            <span>Cadastro de Pacientes</span>
          </a>
          <a href="#" className="panel-nav-item">
            <NavIcon>📅</NavIcon>
            <span>Agenda</span>
          </a>
          <a href="#" className="panel-nav-item">
            <NavIcon>📊</NavIcon>
            <span>Relatórios</span>
          </a>
        </nav>
      </aside>

      {/* ===== CONTEÚDO PRINCIPAL DA PÁGINA ===== */}
      <main className="panel-main">
        <header className="panel-header">
          <h2 className="panel-header-title">{pageTitle}</h2>
          <div className="panel-header-actions">
            {/* Aqui você pode adicionar botões no futuro, como "Sair" ou "Perfil" */}
          </div>
        </header>
        <div className="panel-content">
          {children} {/* É aqui que sua página RegisterUser vai aparecer */}
        </div>
      </main>
    </div>
  );
};