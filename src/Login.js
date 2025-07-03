import React, { useState, useCallback, useRef } from 'react';
import api from './api/api';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css'; // Importa o CSS ESPECÍFICO para Login

// Cache de regex para evitar recriação
const NON_DIGIT_REGEX = /\D/g;
const CPF_LENGTH = 11;

const Login = () => {
  // Refs para acesso direto sem rerender
  const cpfRef = useRef('');
  const passwordRef = useRef('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Formatação memoizada com cache
  const formatCPF = useCallback((value) => {
    const cleaned = value.replace(NON_DIGIT_REGEX, '');
    cpfRef.current = cleaned; // Atualiza ref
    
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  }, []);

  // Handler otimizado com early return
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Early validation
    if (cpfRef.current.length !== CPF_LENGTH) {
      setError('CPF inválido');
      return;
    }
    
    if (!passwordRef.current) {
      setError('Senha obrigatória');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const startTime = performance.now();
      
      const response = await api.post('/api/login', {
        cpf: cpfRef.current,
        password: passwordRef.current
      });

      localStorage.setItem('token', response.data.token);
      
      const navigationPromise = navigate('/register'); // Verifique esta rota
      
      console.log(`Login completed in ${performance.now() - startTime}ms`);
      
      await navigationPromise;
    } catch (error) {
      setIsLoading(false);
      
      const errorMap = {
        ECONNABORTED: 'A requisição demorou muito, mas você pode tentar novamente',
        'Network Error': 'Sem conexão com o servidor',
        default: error.response?.data?.message || 'Erro ao fazer login'
      };
      
      setError(errorMap[error.code] || errorMap.default);
      
      console.error('Erro completo no login:', {
        code: error.code,
        message: error.message,
        response: error.response?.data
      });
    }
  };

  return (
    <div className={styles.loginContainer}> {/* Classe específica para o container de Login */}
      <div className={styles.loginForm}> {/* Classe específica para o formulário de Login */}
        <h2 className={styles.loginFormH2}>Login</h2> {/* Usando h2 no CSS e referenciando aqui */}
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
            className={styles.loginFormInput} /* Classe específica para inputs do Login */
          />
          <input
            type="password"
            placeholder="Digite sua senha"
            onChange={(e) => (passwordRef.current = e.target.value)}
            required
            className={styles.loginFormInput} /* Classe específica para inputs do Login */
          />
          <button 
            type="submit" 
            className={styles.loginBtn} /* Classe específica para o botão de Login */
            disabled={isLoading}
          >
            <span className={styles.buttonText}>{isLoading ? 'Carregando...' : 'Entrar'}</span>
            {/* O ícone FaFilePdf NÃO vai aqui, pois é do Prontuário */}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        {/* Você pode adicionar a mensagem de sucesso se necessário para o login */}
        {/* {!error && !isLoading && !cpfRef.current && <p className={styles.sucesso}>Login efetuado com sucesso!</p>} */}
      </div>
    </div>
  );
};

export default React.memo(Login);