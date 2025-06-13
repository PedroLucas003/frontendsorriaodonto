import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainPage.module.css';

function MainPage() {
  const navigate = useNavigate();
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuActive(!mobileMenuActive);
  };

  return (
    <div className={styles.container}>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <nav className={styles.navbar}>
          <i className={`fa fa-tooth ${styles.navLogo}`}> Sorria Odonto</i>

          <div className={styles.navButtonsContainer}>
            <div className={styles.navButtons}>
              <button
                onClick={() => navigate('/prontuario')}
                className={`${styles.navButton} ${styles.primaryButton}`}
              >
                Prontuário
              </button>
              <button
                onClick={() => navigate('/login')}
                className={`${styles.navButton} ${styles.secondaryButton}`}
              >
                Login
              </button>
            </div>
          </div>

          <button className={styles.mobileBtn} onClick={toggleMobileMenu}>
            <i className={`fa-solid ${mobileMenuActive ? 'fa-x' : 'fa-bars'}`}></i>
          </button>
        </nav>

        <div className={`${styles.mobileMenu} ${mobileMenuActive ? styles.active : ''}`}>
          <div className={styles.mobileButtons}>
            <button
              onClick={() => {
                navigate('/prontuario');
                setMobileMenuActive(false);
              }}
              className={`${styles.navButton} ${styles.primaryButton}`}
            >
              Prontuário
            </button>
            <button
              onClick={() => {
                navigate('/login');
                setMobileMenuActive(false);
              }}
              className={`${styles.navButton} ${styles.secondaryButton}`}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <section id="home" className={styles.homeSection}>
          <div className={styles.shape}></div>
          <div className={styles.cta}>
            <h1 className={styles.title}>
              Seu sorriso perfeito
              <span> começa aqui</span>
            </h1>

            <p className={styles.description}>
              Cuidamos da sua saúde bucal com tratamentos personalizados e tecnologia de ponta
            </p>

            <div className={styles.ctaButtons}>
              <a href="#services" className={`${styles.btnDefault} ${styles.primaryButton}`}>
                Nossos serviços
              </a>

              <a href="tel:+55555555555" className={styles.phoneButton}>
                <button className={`${styles.btnDefault} ${styles.primaryButton}`}>
                  <i className="fa-solid fa-phone"></i>
                </button>
                (51) 92342-3243
              </a>
            </div>

            <div className={styles.socialMediaButtons}>
              <a href="https://wa.me/SEUNUMERO" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-whatsapp"></i>
              </a>
              <a href="https://instagram.com/suaconta" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://facebook.com/suapagina" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-facebook"></i>
              </a>
            </div>
          </div>

          <div className={styles.banner}>
            <img src="https://placehold.co/600x800/518dfc/white?text=Sorria+Odonto" alt="Dentista atendendo paciente" />
          </div>
        </section>

        <section id="services" className={styles.servicesSection}>
          <h2 className={styles.sectionTitle}>Serviços</h2>
          <h3 className={styles.sectionSubtitle}>Nossos tratamentos especializados</h3>

          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className="fa-solid fa-tooth"></i>
              </div>
              <img src="https://placehold.co/300x200/f5f5f5/518dfc?text=Clareamento" className={styles.serviceImage} alt="Clareamento Dental" />
              <h3 className={styles.serviceTitle}>Clareamento Dental</h3>
              <span className={styles.serviceDescription}>
                Tratamento para deixar seus dentes mais brancos e brilhantes
              </span>
              <div className={styles.servicePrice}>
                <h4>Consultar valores</h4>
                <button className={`${styles.btnDefault} ${styles.primaryButton}`}>
                  <i className="fa-solid fa-calendar-check"></i>
                </button>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className="fa-solid fa-teeth"></i>
              </div>
              <img src="https://placehold.co/300x200/f5f5f5/518dfc?text=Ortodontia" className={styles.serviceImage} alt="Ortodontia" />
              <h3 className={styles.serviceTitle}>Ortodontia</h3>
              <span className={styles.serviceDescription}>
                Aparelhos fixos e móveis para corrigir o alinhamento dos dentes
              </span>
              <div className={styles.servicePrice}>
                <h4>Consultar valores</h4>
                <button className={`${styles.btnDefault} ${styles.primaryButton}`}>
                  <i className="fa-solid fa-calendar-check"></i>
                </button>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className="fa-solid fa-toothbrush"></i>
              </div>
              <img src="https://placehold.co/300x200/f5f5f5/518dfc?text=Limpeza" className={styles.serviceImage} alt="Limpeza Profissional" />
              <h3 className={styles.serviceTitle}>Limpeza Profissional</h3>
              <span className={styles.serviceDescription}>
                Remoção de tártaro e placa bacteriana para manter sua saúde bucal
              </span>
              <div className={styles.servicePrice}>
                <h4>Consultar valores</h4>
                <button className={`${styles.btnDefault} ${styles.primaryButton}`}>
                  <i className="fa-solid fa-calendar-check"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className={styles.testimonialsSection}>
          <div className={styles.testimonialsContent}>
            <h2 className={styles.sectionTitle}>Depoimentos</h2>
            <h3 className={styles.sectionSubtitle}>O que nossos pacientes dizem</h3>

            <div className={styles.feedbacks}>
              <div className={styles.feedback}>
                <img src="https://placehold.co/100x100/f5f5f5/518dfc?text=AV" className={styles.feedbackAvatar} alt="Avatar" />
                <div className={styles.feedbackContent}>
                  <p>
                    Ana Silva
                    <span>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                    </span>
                  </p>
                  <p>
                    "Excelente atendimento! Fiz um clareamento e estou muito satisfeita com o resultado."
                  </p>
                </div>
              </div>

              <div className={styles.feedback}>
                <img src="https://placehold.co/100x100/f5f5f5/518dfc?text=AV" className={styles.feedbackAvatar} alt="Avatar" />
                <div className={styles.feedbackContent}>
                  <p>
                    Carlos Oliveira
                    <span>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                    </span>
                  </p>
                  <p>
                    "O ortodontista foi muito atencioso. Meu tratamento está evoluindo muito bem."
                  </p>
                </div>
              </div>
            </div>

            <button className={`${styles.btnDefault} ${styles.primaryButton}`}>
              Ver mais avaliações
            </button>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerItems}>
          <span className={styles.copyright}>
            &copy; {new Date().getFullYear()} Sorria Odonto
          </span>

          <div className={styles.socialMediaButtons}>
            <a href="https://wa.me/SEUNUMERO" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp"></i>
            </a>
            <a href="https://instagram.com/suaconta" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://facebook.com/suapagina" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-facebook"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainPage;