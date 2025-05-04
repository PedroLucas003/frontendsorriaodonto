import React, { useState, useEffect } from "react";
import api from "./api/api";
import "./RegisterUser.css";

// Funções auxiliares - ATUALIZADAS

function formatDateForDisplay(dateString) {
  if (!dateString) return 'Data não informada';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    console.error("Erro ao formatar data para exibição:", e);
    return 'Data inválida';
  }
}

function convertValueToFloat(valor) {
  if (!valor) return 0;
  if (typeof valor === 'number') return valor;
  return parseFloat(valor.toString().replace(/[^\d,]/g, '').replace(',', '.'));
}

function formatValueForDisplay(valor) {
  if (valor === null || valor === undefined || valor === '') return 'Valor não informado';
  const numericValue = convertValueToFloat(valor);
  return isNaN(numericValue) ? 'Valor inválido' :
    numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
}

const RegisterUser = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    cpf: "",
    telefone: "",
    endereco: "",
    password: "",
    confirmPassword: "",
    detalhesDoencas: "",
    quaisRemedios: "",
    quaisMedicamentos: "",
    quaisAnestesias: "",
    frequenciaFumo: "Nunca",
    frequenciaAlcool: "Nunca",
    historicoCirurgia: "",
    exameSangue: "",
    coagulacao: "",
    cicatrizacao: "",
    historicoOdontologico: "",
    sangramentoPosProcedimento: "",
    respiracao: "",
    peso: "",
    procedimento: "",
    denteFace: "",
    valor: "",
    valorNumerico: 0,
    modalidadePagamento: "",
    profissional: "",
    procedimentos: []
  });

  const [usuarios, setUsuarios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [imagemModal, setImagemModal] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [modoVisualizacao, setModoVisualizacao] = useState(false);
  const [showProcedimentoForm, setShowProcedimentoForm] = useState(false);
  const [procedimentoData, setProcedimentoData] = useState({
    procedimento: "",
    denteFace: "",
    valor: "",
    modalidadePagamento: "",
    profissional: ""
  });

  const modalidadesPagamento = [
    "Dinheiro",
    "Cartão de Crédito",
    "Cartão de Débito",
    "PIX",
    "Convênio",
    "Boleto"
  ];

  const frequencias = [
    "Nunca",
    "Ocasionalmente",
    "Frequentemente",
    "Diariamente"
  ];

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Verificação profunda da resposta da API
      if (!response || !response.data) {
        throw new Error("Resposta da API inválida");
      }

      // Converter a resposta para array, se necessário
      const dadosUsuarios = Array.isArray(response.data)
        ? response.data
        : response.data.users || response.data.itens || [];

      // Garantir que cada usuário tenha a estrutura correta
      const usuariosFormatados = dadosUsuarios.map(usuario => ({
        ...usuario,
        procedimentos: Array.isArray(usuario.procedimentos) ? usuario.procedimentos : [],
        historicoProcedimentos: Array.isArray(usuario.historicoProcedimentos)
          ? usuario.historicoProcedimentos
          : [],
        _id: usuario._id || Date.now().toString(), // Fallback para ID
        nomeCompleto: usuario.nomeCompleto || "Nome não informado"
      }));

      setUsuarios(usuariosFormatados);
      setError("");

    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setError("Erro ao carregar usuários. Tente novamente.");
      setUsuarios([]); // Garante que o estado seja sempre um array
    }
  };

  const formatCPF = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    if (cleanedValue.length <= 3) return cleanedValue;
    if (cleanedValue.length <= 6) return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3)}`;
    if (cleanedValue.length <= 9) return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6)}`;
    return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6, 9)}-${cleanedValue.slice(9, 11)}`;
  };

  const formatFone = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    if (cleanedValue.length <= 2) return cleanedValue;
    if (cleanedValue.length <= 7) return `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(2)}`;
    return `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(2, 7)}-${cleanedValue.slice(7)}`;
  };

  const handleProcedimentoChange = (e) => {
    const { name, value } = e.target;
    setProcedimentoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };

    if (name === "peso") {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        errors.peso = "O peso deve conter apenas números (ex: 70.5)";
      } else {
        delete errors.peso;
      }
    }

    if (name === "email") {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.email = "Por favor, insira um e-mail válido";
      } else {
        delete errors.email;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === "peso") {
      formattedValue = value.replace(/[^0-9.]/g, "");
      if ((formattedValue.match(/\./g) || []).length > 1) {
        formattedValue = formattedValue.substring(0, formattedValue.lastIndexOf('.'));
      }
    }
    else if (name === "cpf") {
      formattedValue = formatCPF(value);
    } else if (name === "telefone") {
      formattedValue = formatFone(value);
    } else if (name === "valor") {
      // Remove todos os caracteres não numéricos
      const rawValue = value.replace(/[^\d]/g, '');

      // Converte para número (considerando centavos)
      const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0;

      // Formata para exibição
      formattedValue = numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      setFormData(prev => ({
        ...prev,
        [name]: numericValue, // Armazena o valor numérico
        valorFormatado: formattedValue // Armazena o valor formatado para exibição
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    validateField(name, formattedValue);
    setError("");
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Verifica se as senhas coincidem apenas se ambas estiverem preenchidas
    if (formData.password && formData.confirmPassword &&
      formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem!";
      isValid = false;
    }

    // Verifica se a senha tem pelo menos 6 caracteres
    if (formData.password && formData.password.length < 6) {
      errors.password = "A senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Formatando os campos corretamente antes de enviar
    const dadosParaEnvio = {
      nomeCompleto: formData.nomeCompleto,
      email: formData.email.toLowerCase(),
      cpf: formData.cpf.replace(/\D/g, ''), // APENAS NÚMEROS
      telefone: formData.telefone.replace(/\D/g, ''), // APENAS NÚMEROS
      endereco: formData.endereco,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      detalhesDoencas: formData.detalhesDoencas,
      quaisRemedios: formData.quaisRemedios,
      quaisMedicamentos: formData.quaisMedicamentos,
      quaisAnestesias: formData.quaisAnestesias,
      habitos: {
        frequenciaFumo: formData.frequenciaFumo,
        frequenciaAlcool: formData.frequenciaAlcool
      },
      exames: {
        exameSangue: formData.exameSangue,
        coagulacao: formData.coagulacao,
        cicatrizacao: formData.cicatrizacao
      },
      historicoCirurgia: formData.historicoCirurgia,
      historicoOdontologico: formData.historicoOdontologico,
      sangramentoPosProcedimento: formData.sangramentoPosProcedimento,
      respiracao: formData.respiracao,
      peso: Number(formData.peso) || 0, // Garante número com fallback para 0
      procedimento: formData.procedimento,
      denteFace: formData.denteFace,
      valor: Number(formData.valor) || 0, // Usa o valor numérico já convertido
      modalidadePagamento: formData.modalidadePagamento,
      profissional: formData.profissional
    };

    // Validação adicional do e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dadosParaEnvio.email)) {
      setFieldErrors({ ...fieldErrors, email: "E-mail inválido" });
      return;
    }

    try {
      const endpoint = editandoId
        ? `/api/users/${editandoId}`
        : "/api/register/user";
      const method = editandoId ? "put" : "post";

      console.log("Dados enviados:", dadosParaEnvio); // Para debug

      const response = await api[method](endpoint, dadosParaEnvio);

      if (response.data && response.data.errors) {
        setFieldErrors(response.data.errors);
        setError(response.data.message || "Erro de validação");
        return;
      }

      alert(`Usuário ${editandoId ? "atualizado" : "cadastrado"} com sucesso!`);
      resetForm();
      fetchUsuarios();
    } catch (error) {
      console.error("Erro completo:", error.response?.data || error.message);

      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        setError("Corrija os erros no formulário");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Erro ao conectar com o servidor");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nomeCompleto: "",
      email: "",
      cpf: "",
      telefone: "",
      endereco: "",
      password: "",
      confirmPassword: "",
      detalhesDoencas: "",
      quaisRemedios: "",
      quaisMedicamentos: "",
      quaisAnestesias: "",
      frequenciaFumo: "Nunca",
      frequenciaAlcool: "Nunca",
      historicoCirurgia: "",
      exameSangue: "",
      coagulacao: "",
      cicatrizacao: "",
      historicoOdontologico: "",
      sangramentoPosProcedimento: "",
      respiracao: "",
      peso: "",
      procedimento: "",
      denteFace: "",
      valor: "",
      modalidadePagamento: "",
      profissional: "",
      procedimentos: []
    });
    setEditandoId(null);
    setModoVisualizacao(false);
    setError("");
    setFieldErrors({});
    setShowProcedimentoForm(false);
    setProcedimentoData({
      procedimento: "",
      denteFace: "",
      valor: "",
      modalidadePagamento: "",
      profissional: ""
    });
  };

  const handleEdit = (usuario) => {
    setEditandoId(usuario._id);
    setModoVisualizacao(true);

    const historicoProcedimentos = Array.isArray(usuario.historicoProcedimentos)
      ? usuario.historicoProcedimentos
      : [];

    const procedimentosCompletos = [
      {
        procedimento: usuario.procedimento || "",
        denteFace: usuario.denteFace || "",
        valor: usuario.valor || 0,
        modalidadePagamento: usuario.modalidadePagamento || "",
        profissional: usuario.profissional || "",
        isPrincipal: true,
        createdAt: usuario.createdAt || new Date().toISOString()
      },
      ...historicoProcedimentos.map(p => ({
        ...p,
        isPrincipal: false,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
      }))
    ];

    setFormData({
      ...usuario,
      cpf: formatCPF(usuario.cpf),
      telefone: formatFone(usuario.telefone),
      frequenciaFumo: usuario.habitos?.frequenciaFumo || "Nunca",
      frequenciaAlcool: usuario.habitos?.frequenciaAlcool || "Nunca",
      exameSangue: usuario.exames?.exameSangue || "",
      coagulacao: usuario.exames?.coagulacao || "",
      cicatrizacao: usuario.exames?.cicatrizacao || "",
      procedimentos: procedimentosCompletos,
      password: "",
      confirmPassword: ""
    });
  };

  const handleVoltar = () => {
    setEditandoId(null);
    setModoVisualizacao(false);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Usuário excluído com sucesso!");
        fetchUsuarios();
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        setError("Erro ao excluir usuário. Tente novamente.");
      }
    }
  };

  const handleViewImage = (image) => {
    setImagemModal(image);
  };

  const closeModal = () => {
    setImagemModal(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAddProcedimento = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const dadosParaEnvio = {
        ...procedimentoData,
        valor: convertValueToFloat(procedimentoData.valor)
      };

      await api.put(`/api/users/${editandoId}/procedimento`, dadosParaEnvio, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const novoProcedimento = {
        ...dadosParaEnvio,
        _id: Date.now().toString(),
        isPrincipal: false,
        createdAt: new Date().toISOString()
      };

      setFormData(prev => ({
        ...prev,
        procedimentos: [...prev.procedimentos, novoProcedimento]
      }));

      setProcedimentoData({
        procedimento: "",
        denteFace: "",
        valor: "",
        modalidadePagamento: "",
        profissional: ""
      });

      setShowProcedimentoForm(false);
      setError("");
      fetchUsuarios();

    } catch (error) {
      console.error("Erro ao adicionar procedimento:", error);
      setError(error.response?.data?.message || "Erro ao adicionar procedimento");
    }
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    const searchLower = searchTerm.toLowerCase();
    return (
      usuario.nomeCompleto.toLowerCase().includes(searchLower) ||
      usuario.cpf.includes(searchTerm.replace(/\D/g, ""))
    );
  });

  const labels = {
    nomeCompleto: "Nome completo",
    email: "E-mail",
    cpf: "CPF",
    telefone: "Telefone",
    endereco: "Endereço",
    password: "Senha",
    confirmPassword: "Confirmar senha",
    detalhesDoencas: "Detalhes de doenças",
    quaisRemedios: "Quais remédios",
    quaisMedicamentos: "Alergia a medicamentos",
    quaisAnestesias: "Alergia a anestesias",
    frequenciaFumo: "Frequência de fumo",
    frequenciaAlcool: "Frequência de álcool",
    historicoCirurgia: "Histórico de cirurgia",
    exameSangue: "Exame de sangue",
    coagulacao: "Coagulação",
    cicatrizacao: "Cicatrização",
    historicoOdontologico: "Histórico odontológico",
    sangramentoPosProcedimento: "Sangramento pós-procedimento",
    respiracao: "Respiração",
    peso: "Peso (kg)",
    procedimento: "Procedimento",
    denteFace: "Dente/Face",
    valor: "Valor",
    modalidadePagamento: "Modalidade de pagamento",
    profissional: "Profissional"
  };

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="theme-toggle">
        <button onClick={toggleDarkMode} className="theme-btn">
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {modoVisualizacao && (
        <button onClick={handleVoltar} className="btn-voltar">
          <i className="bi bi-arrow-left"></i> Voltar
        </button>
      )}

      <h1>Cadastro de Usuário</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-section">
          <h2>Dados Pessoais</h2>
          <div className="form-grid">
            {['nomeCompleto', 'email', 'cpf', 'telefone', 'password', 'confirmPassword'].map((key) => (
              <div key={key} className="form-group">
                <label htmlFor={key}>{labels[key]}</label>
                <input
                  type={key.includes("password") ? "password" : "text"}
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className={fieldErrors[key] ? 'error-field' : ''}
                />
                {fieldErrors[key] && <span className="field-error">{fieldErrors[key]}</span>}
              </div>
            ))}

            <div className="form-group">
              <label htmlFor="endereco">{labels.endereco}</label>
              <textarea
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                className={`resizable-textarea ${fieldErrors.endereco ? 'error-field' : ''}`}
                rows={3}
              />
              {fieldErrors.endereco && <span className="field-error">{fieldErrors.endereco}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Histórico de Saúde</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="detalhesDoencas">{labels.detalhesDoencas}</label>
              <textarea
                id="detalhesDoencas"
                name="detalhesDoencas"
                value={formData.detalhesDoencas}
                onChange={handleChange}
                className={`resizable-textarea ${fieldErrors.detalhesDoencas ? 'error-field' : ''}`}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="quaisRemedios">{labels.quaisRemedios}</label>
              <textarea
                id="quaisRemedios"
                name="quaisRemedios"
                value={formData.quaisRemedios}
                onChange={handleChange}
                className={`resizable-textarea ${fieldErrors.quaisRemedios ? 'error-field' : ''}`}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="quaisMedicamentos">{labels.quaisMedicamentos}</label>
              <textarea
                id="quaisMedicamentos"
                name="quaisMedicamentos"
                value={formData.quaisMedicamentos}
                onChange={handleChange}
                className={`resizable-textarea ${fieldErrors.quaisMedicamentos ? 'error-field' : ''}`}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="quaisAnestesias">{labels.quaisAnestesias}</label>
              <textarea
                id="quaisAnestesias"
                name="quaisAnestesias"
                value={formData.quaisAnestesias}
                onChange={handleChange}
                className={`resizable-textarea ${fieldErrors.quaisAnestesias ? 'error-field' : ''}`}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="frequenciaFumo">{labels.frequenciaFumo}</label>
              <select
                id="frequenciaFumo"
                name="frequenciaFumo"
                value={formData.frequenciaFumo}
                onChange={handleChange}
              >
                {frequencias.map((opcao) => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="frequenciaAlcool">{labels.frequenciaAlcool}</label>
              <select
                id="frequenciaAlcool"
                name="frequenciaAlcool"
                value={formData.frequenciaAlcool}
                onChange={handleChange}
              >
                {frequencias.map((opcao) => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="respiracao">{labels.respiracao}</label>
              <input
                type="text"
                id="respiracao"
                name="respiracao"
                value={formData.respiracao}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="peso">{labels.peso}</label>
              <input
                type="number"
                id="peso"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Exames e Sangramento</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="exameSangue">Exame de Sangue</label>
              <textarea
                id="exameSangue"
                name="exameSangue"
                className="large-text-area"
                rows={5}
                value={formData.exameSangue}
                onChange={handleChange}
              />
            </div>

            <div className="small-fields-container">
              <div className="form-group">
                <label htmlFor="coagulacao">Coagulação</label>
                <textarea
                  id="coagulacao"
                  name="coagulacao"
                  className="small-text-field"
                  value={formData.coagulacao}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cicatrizacao">Cicatrização</label>
                <textarea
                  id="cicatrizacao"
                  name="cicatrizacao"
                  className="small-text-field"
                  value={formData.cicatrizacao}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sangramentoPosProcedimento">Sangramento Pós-Procedimento</label>
                <textarea
                  id="sangramentoPosProcedimento"
                  name="sangramentoPosProcedimento"
                  className="small-text-field"
                  value={formData.sangramentoPosProcedimento}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Histórico Médico e Odontológico</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="historicoCirurgia">{labels.historicoCirurgia}</label>
              <textarea
                id="historicoCirurgia"
                name="historicoCirurgia"
                value={formData.historicoCirurgia}
                onChange={handleChange}
                rows={2}
                className="medium-text-area"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="historicoOdontologico">{labels.historicoOdontologico}</label>
              <textarea
                id="historicoOdontologico"
                name="historicoOdontologico"
                value={formData.historicoOdontologico}
                onChange={handleChange}
                rows={3}
                className="large-text-area"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Dados do Procedimento</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="procedimento">{labels.procedimento}</label>
              <input
                type="text"
                id="procedimento"
                name="procedimento"
                value={formData.procedimento}
                onChange={handleChange}
                placeholder="Digite o procedimento realizado"
              />
            </div>

            <div className="form-group">
              <label htmlFor="denteFace">{labels.denteFace}</label>
              <input
                type="text"
                id="denteFace"
                name="denteFace"
                value={formData.denteFace}
                onChange={handleChange}
                placeholder="Ex: 11, 22, Face Lingual, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="valor">{labels.valor}</label>
              <input
                type="text"
                id="valor"
                name="valor"
                value={formData.valorFormatado || ''}
                onChange={(e) => {
                  // Remove tudo exceto números
                  const rawValue = e.target.value.replace(/\D/g, '');

                  // Converte para valor decimal (divide por 100 para centavos)
                  const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0;

                  // Formata para exibição
                  const formattedValue = numericValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });

                  setFormData(prev => ({
                    ...prev,
                    valor: numericValue, // Armazena como número
                    valorFormatado: formattedValue // Armazena versão formatada
                  }));
                }}
                onBlur={() => {
                  // Garante formatação correta ao sair do campo
                  if (!formData.valorFormatado) {
                    setFormData(prev => ({
                      ...prev,
                      valor: 0,
                      valorFormatado: 'R$ 0,00'
                    }));
                  }
                }}
                placeholder="R$ 0,00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="modalidadePagamento">{labels.modalidadePagamento}</label>
              <select
                id="modalidadePagamento"
                name="modalidadePagamento"
                value={formData.modalidadePagamento}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                {modalidadesPagamento.map((opcao) => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="profissional">{labels.profissional}</label>
              <input
                type="text"
                id="profissional"
                name="profissional"
                value={formData.profissional}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {editandoId && (
          <div className="form-section">
            <h2>Histórico de Procedimentos</h2>

            <button
              type="button"
              onClick={() => setShowProcedimentoForm(!showProcedimentoForm)}
              className="btn-add-procedimento"
            >
              {showProcedimentoForm ? 'Cancelar' : 'Adicionar Novo Procedimento'}
            </button>

            {showProcedimentoForm && (
              <div className="procedimento-form">
                <h3>Adicionar Novo Procedimento</h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="procedimento">Procedimento</label>
                    <input
                      type="text"
                      id="procedimento"
                      name="procedimento"
                      value={procedimentoData.procedimento}
                      onChange={handleProcedimentoChange}
                      placeholder="Digite o procedimento realizado"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="denteFace">Dente/Face</label>
                    <input
                      type="text"
                      id="denteFace"
                      name="denteFace"
                      value={procedimentoData.denteFace}
                      onChange={handleProcedimentoChange}
                      placeholder="Ex: 11, 22, Face Lingual, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="valor">Valor</label>
                    <input
                      type="text"
                      id="valor"
                      name="valor"
                      value={formatValueForDisplay(procedimentoData.valor)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^\d,]/g, '');
                        const numericValue = rawValue ? parseFloat(rawValue.replace(',', '.')) : 0;

                        setProcedimentoData(prev => ({
                          ...prev,
                          valor: numericValue
                        }));
                      }}
                      placeholder="R$ 0,00"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modalidadePagamento">Modalidade de Pagamento</label>
                    <select
                      id="modalidadePagamento"
                      name="modalidadePagamento"
                      value={procedimentoData.modalidadePagamento}
                      onChange={handleProcedimentoChange}
                    >
                      <option value="">Selecione...</option>
                      {modalidadesPagamento.map((opcao) => (
                        <option key={opcao} value={opcao}>{opcao}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="profissional">Profissional</label>
                    <input
                      type="text"
                      id="profissional"
                      name="profissional"
                      value={procedimentoData.profissional}
                      onChange={handleProcedimentoChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setProcedimentoData({
                        procedimento: "",
                        denteFace: "",
                        valor: "",
                        modalidadePagamento: "",
                        profissional: ""
                      });
                      setShowProcedimentoForm(false);
                    }}
                    className="btn-cancel"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleAddProcedimento}
                    className="btn-submit"
                  >
                    Adicionar Procedimento
                  </button>
                </div>
              </div>
            )}

            <div className="procedimentos-list">
              {Array.isArray(formData.procedimentos) ? (
                formData.procedimentos.length > 0 ? (
                  [...formData.procedimentos]
                    .sort((a, b) => {
                      try {
                        const dateA = new Date(a.createdAt || new Date());
                        const dateB = new Date(b.createdAt || new Date());
                        return dateB - dateA;
                      } catch {
                        return 0;
                      }
                    })
                    .map((proc, index) => {
                      // Objeto seguro com fallbacks para todos os campos
                      const procedimento = {
                        _id: proc._id || `temp-${index}`,
                        procedimento: proc.procedimento || "Não especificado",
                        denteFace: proc.denteFace || "Não especificado",
                        valor: typeof proc.valor === 'number' ? proc.valor : 0,
                        modalidadePagamento: proc.modalidadePagamento || "Não especificado",
                        profissional: proc.profissional || "Não especificado",
                        isPrincipal: !!proc.isPrincipal,
                        createdAt: proc.createdAt || new Date().toISOString()
                      };

                      return (
                        <div
                          key={procedimento._id}
                          className={`procedimento-item ${procedimento.isPrincipal ? 'principal' : ''}`}
                        >
                          <div className="procedimento-header">
                            <h4>
                              Procedimento #{index + 1}
                              {procedimento.isPrincipal && (
                                <span className="badge-principal">Principal</span>
                              )}
                            </h4>
                            <span>{formatDateForDisplay(procedimento.createdAt)}</span>
                          </div>

                          <div className="procedimento-details">
                            <p><strong>Procedimento:</strong> {procedimento.procedimento}</p>
                            <p><strong>Dente/Face:</strong> {procedimento.denteFace}</p>
                            <p><strong>Valor:</strong> {formatValueForDisplay(procedimento.valor)}</p>
                            <p><strong>Forma de Pagamento:</strong> {procedimento.modalidadePagamento}</p>
                            <p><strong>Profissional:</strong> {procedimento.profissional}</p>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="no-procedimentos">
                    <i className="bi bi-clipboard-x"></i>
                    <p>Nenhum procedimento cadastrado ainda.</p>
                  </div>
                )
              ) : (
                <div className="no-procedimentos error">
                  <i className="bi bi-exclamation-triangle"></i>
                  <p>Dados de procedimentos inválidos.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <button type="submit" className="btn">
          <span className="btnText">{editandoId ? "Atualizar" : "Cadastrar"}</span>
          <i className="bi bi-cloud-upload"></i>
        </button>
      </form>

      {!modoVisualizacao && (
        <>
          <h2>Usuários Cadastrados</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Pesquisar por CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th><i className="bi bi-person"></i> Nome</th>
                  <th><i className="bi bi-credit-card"></i> CPF</th>
                  <th><i className="bi bi-telephone"></i> Telefone</th>
                  <th><i className="bi bi-image"></i> Imagem</th>
                  <th><i className="bi bi-gear"></i> Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.length > 0 ? (
                  filteredUsuarios.map((usuario) => (
                    <tr key={usuario._id}>
                      <td>{usuario.nomeCompleto || 'N/A'}</td>
                      <td>{usuario.cpf ? formatCPF(usuario.cpf) : 'N/A'}</td>
                      <td>{usuario.telefone ? formatFone(usuario.telefone) : 'N/A'}</td>
                      <td>
                        {usuario.image && (
                          <button
                            onClick={() => handleViewImage(usuario.image)}
                            className="btn-view"
                            aria-label="Visualizar imagem"
                          >
                            Imagem
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="btn btn-edit"
                            aria-label="Editar usuário"
                          >
                            <span className="btnText">Editar</span>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(usuario._id)}
                            className="btn btn-delete"
                            aria-label="Excluir usuário"
                          >
                            <span className="btnText">Excluir</span>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      {usuarios.length === 0 ? "Nenhum paciente cadastrado" : "Nenhum resultado encontrado"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {imagemModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>×</span>
            <img
              src={`${api.defaults.baseURL}/uploads/${imagemModal}`}
              alt="Imagem do usuário"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterUser;