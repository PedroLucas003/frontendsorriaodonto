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
          <div className={styles.logoContainer}>
            <img src="/logo.png" alt="Logo Sorria Odonto" className={styles.logoImage} />
            <span className={styles.logoText}>Sorria Odonto</span>
          </div>

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

        <section id="location" className={styles.locationSection}>
          <h2 className={styles.sectionTitle}>Nossa Localização</h2>
          <h3 className={styles.sectionSubtitle}>Venha nos visitar</h3>

          <div className={styles.locationContent}>
            <div className={styles.locationInfo}>
              <i className="fa-solid fa-location-dot"></i>
              <p>Rua da Aurora, 66, Centro Feira Nova, Pernambuco, Brazil</p>
            </div>

            <div className={styles.mapContainer}>
              <iframe
                title="Localização da Clínica Odontológica Sorria Odonto"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.4818532590134!2d-35.389067988542614!3d-7.949054492042189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7aba5546a95cb79%3A0x1ceedea9b0820f29!2sR.%20da%20Aurora%2C%2066%2C%20Feira%20Nova%20-%20PE%2C%2055715-000!5e0!3m2!1spt-BR!2sbr!4v1752873896726!5m2!1spt-BR!2sbr"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <div className={styles.footerLogoContainer}>
              <img src="/logo.png" alt="Logo Sorria Odonto" className={styles.footerLogoImage} />
              <span className={styles.footerLogoText}>Sorria Odonto</span>
            </div>
            <p>Cuidando do seu sorriso com excelência</p>
          </div>

          <div className={styles.footerInfo}>
            <div className={styles.footerSection}>
              <h4>Desde 2020</h4>
              <p>7x Prêmio destaque de melhor clínica</p>
              <p>Prêmio destaque REGIONAL</p>
              <p>EPAO 1334</p>
            </div>

            <div className={styles.footerSection}>
              <h4>Nossos Dentistas</h4>
              <p>Dr. Eronildo</p>
              <p>Dr. Eronilson</p>
            </div>

            <div className={styles.footerSection}>
              <h4>Contato</h4>
              <p><i className="fa-solid fa-phone"></i> (81) 99875-7234</p>
              <div className={styles.footerSocial}>
                <a href="https://wa.me/5581998757234" target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp"></i>
                </a>
                <a href="https://www.instagram.com/sorriaodontofn?igsh=MWFuaGxqd25mNHM3Zw==" target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerCopyright}>
          <p>&copy; {new Date().getFullYear()} Sorria Odonto. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default MainPage;