import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/api';
import { useAuth } from './contexts/AuthContext'; // Importe o hook useAuth
import styles from './Login.module.css';

const NON_DIGIT_REGEX = /\D/g;
const CPF_LENGTH = 11;

const Login = () => {
  const cpfRef = useRef('');
  const passwordRef = useRef('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth(); // Obtenha a função login e o estado

  // Redireciona se o usuário já estiver logado e tentar acessar a página de login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/register'); // Ou sua página principal
    }
  }, [isAuthenticated, navigate]);

  const formatCPF = useCallback((value) => {
    const cleaned = value.replace(NON_DIGIT_REGEX, '');
    cpfRef.current = cleaned;
    
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cpfRef.current.length !== CPF_LENGTH) {
      setError('CPF inválido');
      return;
    }
    if (!passwordRef.current) {
      setError('Senha obrigatória');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post('/api/login', {
        cpf: cpfRef.current,
        password: passwordRef.current
      });

      // A mágica acontece aqui! Apenas chame a função de login do contexto.
      login(response.data.token);

    } catch (err) {
      setIsSubmitting(false);
      const defaultError = err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(defaultError);
      console.error('Erro no login:', err);
    }
  };
  
  // O JSX (return) pode continuar exatamente como estava.
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
        <h2 className={styles.loginFormH2}>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Digite seu CPF"
            onChange={(e) => {
              const value = e.target.value.replace(NON_DIGIT_REGEX, '');
              e.target.value = formatCPF(value);
            }}
            maxLength={14}
            required
            className={styles.loginFormInput}
          />
          <input
            type="password"
            placeholder="Digite sua senha"
            onChange={(e) => (passwordRef.current = e.target.value)}
            required
            className={styles.loginFormInput}
          />
          <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>
            <span className={styles.buttonText}>{isSubmitting ? 'Carregando...' : 'Entrar'}</span>
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default React.memo(Login);