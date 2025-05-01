import React, { useState, useEffect } from "react";
import api from "./api/api";
import "./RegisterUser.css";

// Funções auxiliares
function formatDateForInput(dateString) {
  if (!dateString) return '';

  // Para datas no formato ISO (vindas do backend)
  if (dateString.includes('T')) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  }

  // Para datas no formato dd/mm/yyyy (input do usuário)
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  }

  return '';
}

function formatDateForDisplay(dateString) {
  if (!dateString) return 'Data não informada';
  
  // Extrai apenas a parte da data (ignora o tempo se existir)
  const dateOnly = dateString.split('T')[0];
  
  // Verifica o formato yyyy-mm-dd
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return 'Data inválida';
  
  // Divide em partes
  const [year, month, day] = dateOnly.split('-');
  
  // Formata diretamente como dd/mm/yyyy SEM usar Date object
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

function convertValueToFloat(valor) {
  if (!valor) return 0;
  if (typeof valor === 'number') return valor;
  return parseFloat(valor.toString().replace(/[^\d,]/g, '').replace(',', '.'));
}

function formatValueForDisplay(valor) {
  if (valor === null || valor === undefined || valor === '') return 'Valor não informado';
  const numericValue = typeof valor === 'string' ?
    parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) :
    Number(valor);
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
    dataNascimento: "",
    password: "",
    confirmPassword: "",
    detalhesDoencas: "",
    quaisRemedios: "",
    quaisMedicamentos: "",
    quaisAnestesias: "",
    frequenciaFumo: "",
    frequenciaAlcool: "",
    historicoCirurgia: "",
    exameSangue: "",
    coagulacao: "",
    cicatrizacao: "",
    historicoOdontologico: "",
    sangramentoPosProcedimento: "",
    respiracao: "",
    peso: "",
    dataProcedimento: "",
    procedimento: "",
    denteFace: "",
    valor: "",
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
    dataProcedimento: "",
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
    "Boleto",
    "Convênio"
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
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setError("Erro ao carregar usuários. Tente novamente.");
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

    if (name === "dataNascimento") {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        if (birthDate >= today) {
          errors.dataNascimento = "A data de nascimento deve ser no passado";
        } else {
          delete errors.dataNascimento;
        }
      }
    }

    if (name === "dataProcedimento") {
      if (value) {
        const procedureDate = new Date(value);
        if (isNaN(procedureDate.getTime())) {
          errors.dataProcedimento = "Data inválida";
        } else {
          delete errors.dataProcedimento;
        }
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
      const rawValue = value.replace(/[^\d,]/g, '');
      const numericValue = rawValue ? parseInt(rawValue) / 100 : 0;
      formattedValue = numericValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
        valorFormatado: formattedValue
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    validateField(name, formattedValue);
    setError("");
  };

  const validateForm = () => {
    const requiredFields = {
      nomeCompleto: "O nome completo é obrigatório!",
      email: "O email é obrigatório!",
      cpf: "O CPF é obrigatório!",
      telefone: "O telefone é obrigatório!",
      endereco: "O endereço é obrigatório!",
      dataNascimento: "A data de nascimento é obrigatória!",
      detalhesDoencas: "Os detalhes sobre doenças são obrigatórios!",
      quaisRemedios: "Informação sobre medicamentos é obrigatória!",
      quaisMedicamentos: "Informação sobre medicamentos é obrigatória!",
      historicoCirurgia: "O histórico cirúrgico é obrigatório!",
      dataProcedimento: "A data do procedimento é obrigatória!",
      procedimento: "O procedimento é obrigatório!",
      denteFace: "Dente/Face é obrigatório!",
      valor: "O valor é obrigatório!",
      modalidadePagamento: "A modalidade de pagamento é obrigatória!",
      profissional: "O profissional é obrigatório!"
    };

    const errors = {};
    let isValid = true;

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        errors[field] = message;
        isValid = false;
      }
    }

    if (!editandoId && (!formData.password || !formData.confirmPassword)) {
      errors.password = "A senha e confirmação são obrigatórias para novo cadastro!";
      isValid = false;
    }

    if (!editandoId && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem!";
      isValid = false;
    }

    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      errors.cpf = "CPF inválido! Use o formato 000.000.000-00";
      isValid = false;
    }

    if (!modalidadesPagamento.includes(formData.modalidadePagamento)) {
      errors.modalidadePagamento = "Modalidade de pagamento inválida!";
      isValid = false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Por favor, insira um e-mail válido";
      isValid = false;
    }

    if (formData.dataNascimento) {
      const birthDate = new Date(formData.dataNascimento);
      const today = new Date();
      if (birthDate >= today) {
        errors.dataNascimento = "A data de nascimento deve ser no passado";
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleAddProcedimento = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!procedimentoData.dataProcedimento) errors.dataProcedimento = "Data é obrigatória";
    if (!procedimentoData.procedimento) errors.procedimento = "Procedimento é obrigatório";
    if (!procedimentoData.valor) errors.valor = "Valor é obrigatório";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const dadosParaEnvio = {
        ...procedimentoData,
        valor: convertValueToFloat(procedimentoData.valor),
        dataProcedimento: procedimentoData.dataProcedimento
      };

      await api.put(`/api/users/${editandoId}/procedimento`, dadosParaEnvio, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const novoProcedimento = {
        ...dadosParaEnvio,
        _id: Date.now().toString(),
        isPrincipal: false
      };

      setFormData(prev => ({
        ...prev,
        procedimentos: [...prev.procedimentos, novoProcedimento]
      }));

      setProcedimentoData({
        dataProcedimento: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      const dadosParaEnvio = {
        ...formData,
        valor: convertValueToFloat(formData.valor),
        dataProcedimento: formData.dataProcedimento,
        procedimentos: undefined,
        image: undefined
      };

      if (editandoId) {
        await api.put(`/api/users/${editandoId}`, dadosParaEnvio, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Usuário atualizado com sucesso!");
      } else {
        await api.post("/api/register/user", dadosParaEnvio, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Usuário cadastrado com sucesso!");
      }

      resetForm();
      fetchUsuarios();

    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      setError(error.response?.data?.message || "Erro ao salvar usuário");
    }
  };

  const resetForm = () => {
    setFormData({
      nomeCompleto: "",
      email: "",
      cpf: "",
      telefone: "",
      endereco: "",
      dataNascimento: "",
      password: "",
      confirmPassword: "",
      detalhesDoencas: "",
      quaisRemedios: "",
      quaisMedicamentos: "",
      quaisAnestesias: "",
      frequenciaFumo: "",
      frequenciaAlcool: "",
      historicoCirurgia: "",
      exameSangue: "",
      coagulacao: "",
      cicatrizacao: "",
      historicoOdontologico: "",
      sangramentoPosProcedimento: "",
      respiracao: "",
      peso: "",
      dataProcedimento: "",
      procedimento: "",
      denteFace: "",
      valor: "",
      modalidadePagamento: "",
      profissional: "",
      image: null,
      procedimentos: []
    });
    setEditandoId(null);
    setModoVisualizacao(false);
    setError("");
    setFieldErrors({});
    setShowProcedimentoForm(false);
    setProcedimentoData({
      dataProcedimento: "",
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

    const procedimentosCompletos = [
      {
        dataProcedimento: usuario.dataProcedimento,
        procedimento: usuario.procedimento,
        denteFace: usuario.denteFace,
        valor: usuario.valor,
        modalidadePagamento: usuario.modalidadePagamento,
        profissional: usuario.profissional,
        isPrincipal: true
      },
      ...(usuario.historicoProcedimentos || []).map(p => ({
        ...p,
        isPrincipal: false
      }))
    ];

    setFormData({
      ...usuario,
      cpf: formatCPF(usuario.cpf),
      telefone: formatFone(usuario.telefone),
      dataNascimento: formatDateForInput(usuario.dataNascimento),
      dataProcedimento: formatDateForInput(usuario.dataProcedimento),
      valor: usuario.valor,
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

  const filteredUsuarios = usuarios.filter(usuario => {
    const searchLower = searchTerm.toLowerCase();
    return (
      usuario.nomeCompleto.toLowerCase().includes(searchLower) ||
      usuario.cpf.includes(searchTerm.replace(/\D/g, ""))
    );
  });

  const labels = {
    nomeCompleto: "Nome completo *",
    email: "E-mail *",
    cpf: "CPF *",
    telefone: "Telefone *",
    endereco: "Endereço *",
    dataNascimento: "Data de nascimento *",
    password: "Senha" + (editandoId ? "" : " *"),
    confirmPassword: "Confirmar senha" + (editandoId ? "" : " *"),
    detalhesDoencas: "Detalhes de doenças *",
    quaisRemedios: "Quais remédios *",
    quaisMedicamentos: "Alergia a medicamentos *",
    quaisAnestesias: "Alergia a anestesias",
    frequenciaFumo: "Frequência de fumo",
    frequenciaAlcool: "Frequência de álcool",
    historicoCirurgia: "Histórico de cirurgia *",
    exameSangue: "Exame de sangue",
    coagulacao: "Coagulação",
    cicatrizacao: "Cicatrização",
    historicoOdontologico: "Histórico odontológico",
    sangramentoPosProcedimento: "Sangramento pós-procedimento",
    respiracao: "Respiração",
    peso: "Peso (kg)",
    dataProcedimento: "Data *",
    procedimento: "Procedimento *",
    denteFace: "Dente/Face *",
    valor: "Valor *",
    modalidadePagamento: "Modalidade de pagamento *",
    profissional: "Profissional *"
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
            {['nomeCompleto', 'email', 'cpf', 'telefone', 'dataNascimento', 'password', 'confirmPassword'].map((key) => (
              <div key={key} className="form-group">
                <label htmlFor={key}>{labels[key]}</label>
                <input
                  type={key.includes("password") ? "password" : key === "dataNascimento" ? "date" : "text"}
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required={(key !== 'password' && key !== 'confirmPassword') || !editandoId}
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
                required
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
                required
                className={`resizable-textarea ${fieldErrors.detalhesDoencas ? 'error-field' : ''}`}
                rows={3}
              />
              {fieldErrors.detalhesDoencas && <span className="field-error">{fieldErrors.detalhesDoencas}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="quaisRemedios">{labels.quaisRemedios}</label>
              <textarea
                id="quaisRemedios"
                name="quaisRemedios"
                value={formData.quaisRemedios}
                onChange={handleChange}
                required
                className={`resizable-textarea ${fieldErrors.quaisRemedios ? 'error-field' : ''}`}
                rows={3}
              />
              {fieldErrors.quaisRemedios && <span className="field-error">{fieldErrors.quaisRemedios}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="quaisMedicamentos">{labels.quaisMedicamentos}</label>
              <textarea
                id="quaisMedicamentos"
                name="quaisMedicamentos"
                value={formData.quaisMedicamentos}
                onChange={handleChange}
                required
                className={`resizable-textarea ${fieldErrors.quaisMedicamentos ? 'error-field' : ''}`}
                rows={3}
              />
              {fieldErrors.quaisMedicamentos && <span className="field-error">{fieldErrors.quaisMedicamentos}</span>}
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
              {fieldErrors.quaisAnestesias && <span className="field-error">{fieldErrors.quaisAnestesias}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="frequenciaFumo">{labels.frequenciaFumo}</label>
              <select
                id="frequenciaFumo"
                name="frequenciaFumo"
                value={formData.frequenciaFumo}
                onChange={handleChange}
                className={fieldErrors.frequenciaFumo ? 'error-field' : ''}
              >
                <option value="">Selecione...</option>
                {frequencias.map((opcao) => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
              {fieldErrors.frequenciaFumo && <span className="field-error">{fieldErrors.frequenciaFumo}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="frequenciaAlcool">{labels.frequenciaAlcool}</label>
              <select
                id="frequenciaAlcool"
                name="frequenciaAlcool"
                value={formData.frequenciaAlcool}
                onChange={handleChange}
                className={fieldErrors.frequenciaAlcool ? 'error-field' : ''}
              >
                <option value="">Selecione...</option>
                {frequencias.map((opcao) => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
              {fieldErrors.frequenciaAlcool && <span className="field-error">{fieldErrors.frequenciaAlcool}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="respiracao">{labels.respiracao}</label>
              <input
                type="text"
                id="respiracao"
                name="respiracao"
                value={formData.respiracao}
                onChange={handleChange}
                className={fieldErrors.respiracao ? 'error-field' : ''}
              />
              {fieldErrors.respiracao && <span className="field-error">{fieldErrors.respiracao}</span>}
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
                className={fieldErrors.peso ? 'error-field' : ''}
              />
              {fieldErrors.peso && <span className="field-error">{fieldErrors.peso}</span>}
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
                required
                className={`medium-text-area ${fieldErrors.historicoCirurgia ? 'error-field' : ''}`}
              />
              {fieldErrors.historicoCirurgia && <span className="field-error">{fieldErrors.historicoCirurgia}</span>}
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
              <label htmlFor="dataProcedimento">{labels.dataProcedimento}</label>
              <input
                type="date"
                id="dataProcedimento"
                name="dataProcedimento"
                value={formatDateForInput(formData.dataProcedimento)}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    setFormData(prev => ({
                      ...prev,
                      dataProcedimento: date.toISOString()
                    }));
                  }
                }}
                required
                className={fieldErrors.dataProcedimento ? 'error-field' : ''}
              />
              {fieldErrors.dataProcedimento && <span className="field-error">{fieldErrors.dataProcedimento}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="procedimento">{labels.procedimento}</label>
              <input
                type="text"
                id="procedimento"
                name="procedimento"
                value={formData.procedimento}
                onChange={handleChange}
                required
                className={fieldErrors.procedimento ? 'error-field' : ''}
                placeholder="Digite o procedimento realizado"
              />
              {fieldErrors.procedimento && <span className="field-error">{fieldErrors.procedimento}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="denteFace">{labels.denteFace}</label>
              <input
                type="text"
                id="denteFace"
                name="denteFace"
                value={formData.denteFace}
                onChange={handleChange}
                required
                className={fieldErrors.denteFace ? 'error-field' : ''}
                placeholder="Ex: 11, 22, Face Lingual, etc."
              />
              {fieldErrors.denteFace && <span className="field-error">{fieldErrors.denteFace}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="valor">{labels.valor}</label>
              <input
                type="text"
                id="valor"
                name="valor"
                value={formatValueForDisplay(formData.valor)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^\d,]/g, '');
                  const numericValue = rawValue ? parseFloat(rawValue.replace(',', '.')) : 0;

                  setFormData(prev => ({
                    ...prev,
                    valor: numericValue
                  }));
                }}
                required
                className={fieldErrors.valor ? 'error-field' : ''}
                placeholder="R$ 0,00"
              />
              {fieldErrors.valor && <span className="field-error">{fieldErrors.valor}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="modalidadePagamento">{labels.modalidadePagamento}</label>
              <select
                id="modalidadePagamento"
                name="modalidadePagamento"
                value={formData.modalidadePagamento}
                onChange={handleChange}
                required
                className={fieldErrors.modalidadePagamento ? 'error-field' : ''}
              >
                <option value="">Selecione...</option>
                {modalidadesPagamento.map((opcao) => (
                  <option key={opcao} value={opcao}>{opcao}</option>
                ))}
              </select>
              {fieldErrors.modalidadePagamento && <span className="field-error">{fieldErrors.modalidadePagamento}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="profissional">{labels.profissional}</label>
              <input
                type="text"
                id="profissional"
                name="profissional"
                value={formData.profissional}
                onChange={handleChange}
                required
                className={fieldErrors.profissional ? 'error-field' : ''}
              />
              {fieldErrors.profissional && <span className="field-error">{fieldErrors.profissional}</span>}
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
                    <label htmlFor="dataProcedimento">Data *</label>
                    <input
                      type="date"
                      id="dataProcedimento"
                      name="dataProcedimento"
                      value={procedimentoData.dataProcedimento || ''}
                      onChange={(e) => {
                        setProcedimentoData(prev => ({
                          ...prev,
                          dataProcedimento: e.target.value // Formato yyyy-mm-dd
                        }));
                      }}
                      required
                    />
                    {fieldErrors.dataProcedimento && <span className="field-error">{fieldErrors.dataProcedimento}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="procedimento">Procedimento *</label>
                    <input
                      type="text"
                      id="procedimento"
                      name="procedimento"
                      value={procedimentoData.procedimento}
                      onChange={handleProcedimentoChange}
                      className={fieldErrors.procedimento ? 'error-field' : ''}
                      placeholder="Digite o procedimento realizado"
                      required
                    />
                    {fieldErrors.procedimento && <span className="field-error">{fieldErrors.procedimento}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="denteFace">Dente/Face *</label>
                    <input
                      type="text"
                      id="denteFace"
                      name="denteFace"
                      value={procedimentoData.denteFace}
                      onChange={handleProcedimentoChange}
                      className={fieldErrors.denteFace ? 'error-field' : ''}
                      placeholder="Ex: 11, 22, Face Lingual, etc."
                      required
                    />
                    {fieldErrors.denteFace && <span className="field-error">{fieldErrors.denteFace}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="valor">Valor *</label>
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
                      required
                      className={fieldErrors.valor ? 'error-field' : ''}
                      placeholder="R$ 0,00"
                    />
                    {fieldErrors.valor && <span className="field-error">{fieldErrors.valor}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="modalidadePagamento">Modalidade de Pagamento *</label>
                    <select
                      id="modalidadePagamento"
                      name="modalidadePagamento"
                      value={procedimentoData.modalidadePagamento}
                      onChange={handleProcedimentoChange}
                      className={fieldErrors.modalidadePagamento ? 'error-field' : ''}
                      required
                    >
                      <option value="">Selecione...</option>
                      {modalidadesPagamento.map((opcao) => (
                        <option key={opcao} value={opcao}>{opcao}</option>
                      ))}
                    </select>
                    {fieldErrors.modalidadePagamento && <span className="field-error">{fieldErrors.modalidadePagamento}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="profissional">Profissional *</label>
                    <input
                      type="text"
                      id="profissional"
                      name="profissional"
                      value={procedimentoData.profissional}
                      onChange={handleProcedimentoChange}
                      className={fieldErrors.profissional ? 'error-field' : ''}
                      required
                    />
                    {fieldErrors.profissional && <span className="field-error">{fieldErrors.profissional}</span>}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setProcedimentoData({
                        dataProcedimento: "",
                        procedimento: "",
                        denteFace: "",
                        valor: "",
                        modalidadePagamento: "",
                        profissional: ""
                      });
                      setShowProcedimentoForm(false);
                      setFieldErrors({});
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
              {formData.procedimentos?.length > 0 ? (
                [...formData.procedimentos]
                  .sort((a, b) => new Date(b.dataProcedimento) - new Date(a.dataProcedimento))
                  .map((proc, index) => (
                    <div key={proc._id || index} className="procedimento-item">
                      <div className="procedimento-header">
                        <h4>Procedimento #{index + 1}</h4>
                        <span>{formatDateForDisplay(proc.dataProcedimento)}</span>
                      </div>
                      <div className="procedimento-details">
                        <p><strong>Procedimento:</strong> {proc.procedimento || 'Não informado'}</p>
                        <p><strong>Dente/Face:</strong> {proc.denteFace || 'Não informado'}</p>
                        <p><strong>Valor:</strong> {formatValueForDisplay(proc.valor)}</p>
                        <p><strong>Modalidade:</strong> {proc.modalidadePagamento || 'Não informada'}</p>
                        <p><strong>Profissional:</strong> {proc.profissional || 'Não informado'}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="no-procedimentos">
                  <p>Nenhum procedimento cadastrado ainda.</p>
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
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Imagem</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario._id}>
                    <td>{usuario.nomeCompleto}</td>
                    <td>{formatCPF(usuario.cpf)}</td>
                    <td>{formatFone(usuario.telefone)}</td>
                    <td>
                      {usuario.image && (
                        <button
                          onClick={() => handleViewImage(usuario.image)}
                          className="btn-view"
                        >
                          Imagem
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="btn-edit"
                        >
                          <span className="btnText">Editar</span>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(usuario._id)}
                          className="btn-delete"
                        >
                          <span className="btnText">Excluir</span>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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