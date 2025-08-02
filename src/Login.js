import React, { useState, useRef } from 'react';
import api from './api/api';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css'; // Importa o CSS ESPECÍFICO para Login

// Cache de regex para evitar recriação
const NON_DIGIT_REGEX = /\D/g;
const CPF_LENGTH = 11;

// Função auxiliar para formatar o CPF com a máscara (000.000.000-00)
const formatToCpfMask = (cleanedValue) => {
    if (cleanedValue.length <= 3) return cleanedValue;
    if (cleanedValue.length <= 6) return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3)}`;
    if (cleanedValue.length <= 9) return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6)}`;
    return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6, 9)}-${cleanedValue.slice(9, 11)}`;
};

const Login = () => {
    // Refs para acesso direto sem rerender
    const cpfRef = useRef('');
    const passwordRef = useRef('');

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Handler otimizado com early return
    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanedCpf = cpfRef.current;
        const formattedCpf = formatToCpfMask(cleanedCpf);

        if (cleanedCpf.length !== CPF_LENGTH) {
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
                cpf: formattedCpf,
                password: passwordRef.current
            });

            localStorage.setItem('token', response.data.token);
            const navigationPromise = navigate('/register');

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
        <div className={styles.loginContainer}>
            <div className={styles.loginForm}>
                <h2 className={styles.loginFormH2}>Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Digite seu CPF"
                        onChange={(e) => {
                            const value = e.target.value.replace(NON_DIGIT_REGEX, '');
                            cpfRef.current = value;
                            e.target.value = formatToCpfMask(value);
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
                    <button
                        type="submit"
                        className={styles.loginBtn}
                        disabled={isLoading}
                    >
                        <span className={styles.buttonText}>{isLoading ? 'Carregando...' : 'Entrar'}</span>
                    </button>
                </form>
                {error && <p className={styles.error}>{error}</p>}
            </div>
        </div>
    );
};

export default React.memo(Login);