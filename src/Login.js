import React, { useState, useCallback } from "react";
import api from "./api/api";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

const Login = () => {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 1. useCallback para formatar CPF (evita recriação desnecessária)
  const formatCPF = useCallback((value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  }, []);

  // 2. Debounce nativo no onChange do CPF
  const handleCpfChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue.length <= 11) { // Limita a 11 caracteres
      setCpf(rawValue);
    }
  };

  // 3. Pré-validação antes da requisição
  const validateBeforeSubmit = () => {
    if (cpf.replace(/\D/g, "").length !== 11) {
      setError("CPF inválido");
      return false;
    }
    if (!password) {
      setError("Senha obrigatória");
      return false;
    }
    return true;
  };

  // 4. handleSubmit otimizado
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;
    
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/api/login", {
        cpf: cpf.replace(/\D/g, ""),
        password,
      }, {
        timeout: 5000 // 5s timeout específico para login
      });

      localStorage.setItem("token", response.data.token);
      navigate("/register");
    } catch (error) {
      setIsLoading(false);
      setError(
        error.response?.data?.message || 
        (error.code === "ECONNABORTED" ? "Tempo excedido" : "Erro ao fazer login")
      );
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Digite seu CPF"
            value={formatCPF(cpf)}
            onChange={handleCpfChange} // Alterado aqui
            maxLength={14}
            required
          />
          <input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            className={styles.btnLogin}
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Entrar"}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;