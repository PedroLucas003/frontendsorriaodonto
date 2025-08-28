// src/components/MainPage/MainPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainPage.css"; // Certifique-se que o CSS está neste arquivo

const MainPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ==> DADOS REAIS INTEGRADOS DO SEU CÓDIGO ANTIGO <==
  const specialists = [
    { name: "Dra. Dérica Barbosa", cro: "CRO-PE 13478", specialties: ["Ortodontia", "Cirurgia de Siso", "Clínica geral"], image: "/derica.jpeg" },
    { name: "Dra. Lenise Nascimento", cro: "CRO-PE 11455", specialties: ["Prótese", "Cirurgia de siso", "Clínica geral"], image: "/dfoto.jpeg" },
    { name: "Dr. Tiago Silva", cro: "CRO-PE 19868", specialties: ["Clínico geral"], image: "/tfoto.jpeg" },
    { name: "Dra. Letícia Araújo", cro: "CRO-PE 17791", specialties: ["Atendimento infantil", "Clínica geral"], image: "/leticia.jpeg" },
    { name: "Dra. Rafaela Silva", cro: "CRO-PE 14461", specialties: ["Prótese", "Clínica geral"], image: "/rfoto.jpeg" },
    { name: "Dr. Marcelo Ferreira", cro: "CRO-PE 16077", specialties: ["Ortodontia", "Clínica Geral"], image: "/marcelo.jpeg" },
    { name: "Dra. Rayane Ketima", cro: "CRO-PE 14887", specialties: ["Cirurgia", "Clínica Geral"], image: "/rayane.jpeg" },
    { name: "Dra. Samille Patrizzia", cro: "CRO-PE 11460", specialties: ["Endodontia (Canal de Molar)"], image: "/samille.jpeg" },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  // Ícones como componentes para não precisar de bibliotecas externas
  const MenuIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" /></svg> );
  const XIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 6-12 12" /><path d="m6 6 12 12" /></svg> );
  const ClockIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg> );
  const MapPinIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg> );
  const PhoneIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg> );
  const MessageCircleIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg> );
  const InstagramIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg> );

  return (
    <div className="app">
      <div className="background-elements">
        <div className="abstract-shape-1"></div>
        <div className="abstract-shape-2"></div>
        <div className="abstract-shape-3"></div>
        <div className="abstract-shape-4"></div>
      </div>

      <header className={`header ${isScrolled ? "header-scrolled" : ""}`}>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <img src="/logo.png" alt="Logo Sorria Odonto" className="logo-image" style={{height: "40px"}}/>
              <span className="logo-text">Sorria Odonto</span>
            </div>
            <nav className="nav-desktop">
              <button className="btn btn-ghost" onClick={() => navigate("/prontuario")}>Prontuário</button>
              <button className="btn btn-primary" onClick={() => navigate("/login")}>Login</button>
            </nav>
            <button className="btn btn-icon nav-mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
          {isMenuOpen && (
            <div className="nav-mobile">
              <button className="btn btn-ghost btn-full" onClick={() => {navigate("/prontuario"); setIsMenuOpen(false);}}>Prontuário</button>
              <button className="btn btn-ghost btn-full" onClick={() => {navigate("/login"); setIsMenuOpen(false);}}>Login</button>
            </div>
          )}
        </div>
      </header>
      
      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">Seu sorriso perfeito <span>começa aqui</span></h1>
                <p className="hero-subtitle">Cuidamos da sua saúde bucal com tratamentos personalizados e tecnologia de ponta.</p>
                <div className="hero-buttons">
                  <button className="btn btn-primary btn-large" onClick={() => scrollToSection("especialistas")}>Nossos Especialistas</button>
                  <a href="https://wa.me/5581998757234" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-large">
                    <MessageCircleIcon /> Agende uma consulta
                  </a>
                </div>
              </div>
              <div className="hero-image">
                <div className="hero-image-bg"></div>
                <div className="hero-image-glow"></div>
                <img src="/Gêmeos.png" alt="Dentistas da Sorria Odonto" className="hero-img"/>
              </div>
            </div>
          </div>
        </section>

        <section id="especialistas" className="specialists">
          <div className="specialists-bg"></div>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Nossa Equipe de Especialistas</h2>
              <p className="section-subtitle">Conheça nossa equipe de profissionais.</p>
            </div>
            <div className="specialists-grid">
              {specialists.map((specialist, index) => (
                <div key={index} className="specialist-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="specialist-image">
                    <img src={specialist.image} alt={specialist.name} />
                  </div>
                  <h3 className="specialist-name">{specialist.name}</h3>
                  <p className="specialist-cro">{specialist.cro}</p>
                  <div className="specialties-tags">
                    {specialist.specialties.map((tag, idx) => <span key={idx} className="specialty-tag">{tag}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="localizacao" className="location">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Nossa Localização</h2>
              <p className="section-subtitle">Venha nos visitar!</p>
            </div>
            <div className="location-content">
              <div className="location-info">
                <div className="info-item"><div className="info-icon"><MapPinIcon /></div><div className="info-text"><h3>Endereço</h3><p>Rua da Aurora, 66, Centro<br/>Feira Nova, Pernambuco, Brazil</p></div></div>
                <div className="info-item"><div className="info-icon"><PhoneIcon /></div><div className="info-text"><h3>Contato</h3><p>(81) 99875-7234</p></div></div>
                <div className="info-item"><div className="info-icon"><ClockIcon /></div><div className="info-text"><h3>Horário</h3><p>Segunda a Sexta: 8h às 18h<br/>Sábado: 8h às 12h</p></div></div>
              </div>
              <div className="location-map">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.992892975988!2d-35.39380568522384!3d-7.465997994615372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab0e0a3f6a2b8b%3A0x4a4a1c5d0b9a3f9a!2sR.%20da%20Aurora%2C%2066%20-%20Centro%2C%20Feira%20Nova%20-%20PE%2C%2055715-000!5e0!3m2!1spt-BR!2sbr" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Localização Sorria Odonto"></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                 <img src="/logo.png" alt="Logo Sorria Odonto" className="logo-image" style={{height: "50px"}}/>
              </div>
              <p>Cuidando do seu sorriso com excelência.</p>
              <p>EPAO 1334</p>
            </div>
            <div className="footer-section">
              <h3>Nossos Dentistas</h3>
              <ul><li>Dr. Eronildo</li><li>Dr. Eronilson</li></ul>
            </div>
            <div className="footer-section">
              <h3>Destaques</h3>
              <ul><li>🏆 7x Prêmio destaque de melhor clínica</li><li>⭐ Prêmio destaque REGIONAL</li></ul>
            </div>
            <div className="footer-section">
              <h3>Contato</h3>
              <div className="contact-links">
                <a href="https://wa.me/5581998757234" className="contact-link" target="_blank" rel="noopener noreferrer"><MessageCircleIcon /><span>WhatsApp</span></a>
                <a href="https://www.instagram.com/sorriaodontofn?igsh=MWFuaGxqd25mNHM3Zw==" className="contact-link" target="_blank" rel="noopener noreferrer"><InstagramIcon /><span>Instagram</span></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Sorria Odonto. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;