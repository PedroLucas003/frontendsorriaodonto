import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainPage.module.css';

function MainPage() {
  const navigate = useNavigate();
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 1170);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      window.removeEventListener('scroll', handleScroll);
    };
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

          {isMobile && (
            <button
              className={styles.mobileBtn}
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuActive}
              aria-label="Menu de navegação"
            >
              <i className={`fa-solid ${mobileMenuActive ? 'fa-x' : 'fa-bars'}`}></i>
            </button>
          )}
        </nav>

        {isMobile && (
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
        )}
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
                Nossos especialistas
              </a>

              <a href="https://wa.me/5581998757234" className={styles.phoneButton}>
                <button className={`${styles.btnDefault} ${styles.primaryButton}`}>
                  <i className="fa-solid fa-phone"></i>
                </button>
                (81) 99875-7234
              </a>
            </div>

            <div className={styles.socialMediaButtons}>
              <a
                href="https://wa.me/5581998757234"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
              <a
                href="https://www.instagram.com/sorriaodontofn?igsh=MWFuaGxqd25mNHM3Zw=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>

          <div className={styles.banner}>
            <img
              src="/Gêmeos.png"
              alt="Dentista atendendo paciente"
              className={styles.responsiveImage}
            />
          </div>
        </section>

        <section id="services" className={styles.servicesSection}>
          <h2 className={styles.sectionTitle}>Nossos Especialistas</h2>
          <h3 className={styles.sectionSubtitle}>Conheça nossa equipe de profissionais</h3>

          <div className={styles.servicesGrid}>
            {/* Dra. Dérica Barbosa */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className="fa-solid fa-tooth"></i>
              </div>
              <img src="/derica.jpeg" className={styles.serviceImage} alt="Dra. Dérica Barbosa" />
              <h3 className={styles.serviceTitle}>Dra. Dérica Barbosa</h3>
              <span className={styles.serviceDescription}>
                CRO-PE 13478<br />
                Ortodontia, Cirurgia de Siso, Clínica geral
              </span>
            </div>

            {/* Dra. Lenise Nascimento */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className="fa-solid fa-teeth"></i>
              </div>
              <img src="/dfoto.jpeg" className={styles.serviceImage} alt="Dra. Lenise Nascimento" />
              <h3 className={styles.serviceTitle}>Dra. Lenise Nascimento</h3>
              <span className={styles.serviceDescription}>
                CRO-PE 11455<br />
                Prótese, Cirurgia de siso, Clínica geral
              </span>
            </div>

            {/* Dr. Tiago Silva */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className="fa-solid fa-tooth"></i>
              </div>
              <img src="/tfoto.jpeg" className={styles.serviceImage} alt="Dr. Tiago Silva" />
              <h3 className={styles.serviceTitle}>Dr. Tiago Silva</h3>
              <span className={styles.serviceDescription}>
                CRO-PE 19868<br />
                Clínico geral
              </span>
            </div>

            {/* Dra. Letícia Araújo */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className="fa-solid fa-face-smile"></i>
              </div>
              <img src="/leticia.jpeg" className={styles.serviceImage} alt="Dra. Letícia Araújo" />
              <h3 className={styles.serviceTitle}>Dra. Letícia Araújo</h3>
              <span className={styles.serviceDescription}>
                CRO-PE 17791<br />
                Atendimento infantil, Clínica geral
              </span>
            </div>

            {/* Dra. Rafaela Silva */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className="fa-solid fa-teeth-open"></i>
              </div>
              <img src="/rfoto.jpeg" className={styles.serviceImage} alt="Dra. Rafaela Silva" />
              <h3 className={styles.serviceTitle}>Dra. Rafaela Silva</h3>
              <span className={styles.serviceDescription}>
                CRO-PE 14461<br />
                Prótese, Clínica geral
              </span>
            </div>

            {/* Dr. Marcelo Ferreira */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className="fa-solid fa-teeth"></i>
              </div>
              <img src="/marcelo.jpeg" className={styles.serviceImage} alt="Dr. Marcelo Ferreira" />
              <h3 className={styles.serviceTitle}>Dr. Marcelo Ferreira</h3>
              <span className={styles.serviceDescription}>
                CRO-PE 16077<br />
                Ortodontia e Clínica Geral
              </span>
            </div>

            {/* Dra. Rayane Ketima */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className="fa-solid fa-teeth-open"></i>
              </div>
              <img src="/rayane.jpeg" className={styles.serviceImage} alt="Dra. Rayane Ketima" />
              <h3 className={styles.serviceTitle}>Dra. Rayane Ketima</h3>
              <span className={styles.serviceDescription}>
                CRO-PE 14887<br />
                Cirurgia e Clínica Geral
              </span>
            </div>

            {/* Dra. Samille Patrizzia */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <i className="fa-solid fa-teeth-open"></i>
              </div>
              <img src="/samille.jpeg" className={styles.serviceImage} alt="Dra. Samille Patrizzia" />
              <h3 className={styles.serviceTitle}>Dra. Samille Patrizzia</h3>
              <span className={styles.serviceDescription}>
                CRO-PE 11460<br />
                Endodontia (Canal de Molar)
              </span>
            </div>
          </div>
        </section>

        <section id="testimonials" className={styles.testimonialsSection}>
          <div className={styles.testimonialsContent}>
            <h2 className={styles.sectionTitle}>Depoimentos</h2>
            <h3 className={styles.sectionSubtitle}>O que nossos pacientes dizem</h3>

            <div className={styles.feedbacks}>
              <div className={styles.feedback}>
                <img src="/derica.jpeg" className={styles.feedbackAvatar} alt="Derica" />
                <div className={styles.feedbackContent}>
                  <p>
                    Derica
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
                <img src="/marcelo.jpeg" className={styles.feedbackAvatar} alt="Marcelo" />
                <div className={styles.feedbackContent}>
                  <p>
                    Marcelo
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

              <div className={styles.feedback}>
                <img src="/rayane.jpeg" className={styles.feedbackAvatar} alt="Rayane" />
                <div className={styles.feedbackContent}>
                  <p>
                    Rayane
                    <span>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                    </span>
                  </p>
                  <p>
                    "Adorei o resultado das minhas facetas! O dentista foi super profissional e cuidadoso."
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
    </div>
  );
}

export default MainPage;