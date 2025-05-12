import React, { useState } from "react";
import api from "./api/api";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

// Helper para debounce
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

const Login = () => {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Função para formatar o CPF com debounce
  const formatCPF = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    if (cleanedValue.length <= 3) return cleanedValue;
    if (cleanedValue.length <= 6) return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3)}`;
    if (cleanedValue.length <= 9) return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6)}`;
    return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6, 9)}-${cleanedValue.slice(9, 11)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação rápida no client-side
    if (!cpf || !password) {
      setError("CPF e senha são obrigatórios");
      return;
    }
    
    if (cpf.replace(/\D/g, '').length !== 11) {
      setError("CPF deve ter 11 dígitos");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const cleanedCPF = cpf.replace(/\D/g, "");
      const response = await api.post("/api/login", {
        cpf: cleanedCPF,
        password,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);
      navigate("/register");
    } catch (error) {
      if (error.response?.status === 403) {
        setError("Acesso restrito. Seu CPF não está autorizado.");
      } else if (error.response?.status === 429) {
        setError("Muitas tentativas. Tente novamente mais tarde.");
      } else {
        setError(
          error.response?.data?.message ||
          "Erro ao fazer login! Verifique os dados e tente novamente."
        );
      }
    } finally {
      setIsLoading(false);
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
            onChange={debounce((e) => setCpf(e.target.value.replace(/\D/g, "")), 300)}
            maxLength={14}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={styles.btnLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.spinner}></div>
            ) : (
              <>
                <span className={styles.btnText}>Entrar</span>
                <i className="bi bi-box-arrow-in-right"></i>
              </>
            )}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;