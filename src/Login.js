import React, { useState, useEffect } from "react";
import api from "./api/api";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

const Login = () => {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Cache do token para login instantâneo
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/register");
    }
  }, [navigate]);

  // Função para formatar o CPF (otimizada)
  const formatCPF = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const cleanedCPF = cpf.replace(/\D/g, "");

      // Verificação local rápida antes da API
      if (cleanedCPF.length !== 11) {
        setIsLoading(false);
        return setError("CPF inválido");
      }

      const response = await api.post("/api/login", {
        cpf: cleanedCPF,
        password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/register");
    } catch (error) {
      setIsLoading(false);
      if (error.response?.status === 403) {
        setError("Acesso restrito. Seu CPF não está autorizado.");
      } else {
        setError(
          error.response?.data?.message ||
          "Erro ao fazer login! Verifique os dados e tente novamente."
        );
      }
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
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
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
            {isLoading ? (
              "Carregando..."
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