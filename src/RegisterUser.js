import React, { useState, useEffect } from "react";
import api from "./api/api";
import "./RegisterUser.css";

// Funções auxiliares
function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function formatDateForDisplay(dateString) {
  if (!dateString) return 'Data não informada';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Data inválida';
  return date.toLocaleDateString('pt-BR');
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
    const errors = {};
    let isValid = true;

    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem!";
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

    const dadosParaEnvio = Object.fromEntries(
      Object.entries(formData).filter(
        ([key, value]) => 
          value !== "" && 
          value !== null && 
          value !== undefined
      )
    );

    try {
      const endpoint = editandoId 
        ? `/api/users/${editandoId}` 
        : "/api/register/user";
      const method = editandoId ? "put" : "post";
      
      await api[method](endpoint, dadosParaEnvio);
      alert(`Usuário ${editandoId ? "atualizado" : "cadastrado"} com sucesso!`);
      resetForm();
      fetchUsuarios();
    } catch (error) {
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
  const handleAddProcedimento = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("token");
  
      const dadosParaEnvio = {
        ...procedimentoData,
        valor: convertValueToFloat(procedimentoData.valor),
        dataProcedimento: formatDateForInput(procedimentoData.dataProcedimento)
      };
  
      await api.put(`/api/users/${editandoId}/procedimento`, dadosParaEnvio, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const novoProcedimento = {
        ...dadosParaEnvio,
        _id: Date.now().toString(),
        isPrincipal: false,
        dataProcedimento: formatDateForInput(dadosParaEnvio.dataProcedimento)
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

  const labels = {
    nomeCompleto: "Nome completo",
    email: "E-mail",
    cpf: "CPF",
    telefone: "Telefone",
    endereco: "Endereço",
    dataNascimento: "Data de nascimento",
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
    dataProcedimento: "Data",
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
            {['nomeCompleto', 'email', 'cpf', 'telefone', 'dataNascimento', 'password', 'confirmPassword'].map((key) => (
              <div key={key} className="form-group">
                <label htmlFor={key}>{labels[key]}</label>
                <input
                  type={key.includes("password") ? "password" : key === "dataNascimento" ? "date" : "text"}
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
                <option value="">Selecione...</option>
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
                <option value="">Selecione...</option>
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
              <label htmlFor="dataProcedimento">{labels.dataProcedimento}</label>
              <input
                type="date"
                id="dataProcedimento"
                name="dataProcedimento"
                value={formatDateForInput(formData.dataProcedimento)}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    dataProcedimento: e.target.value
                  }));
                }}
              />
            </div>

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
                value={formatValueForDisplay(formData.valor)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^\d,]/g, '');
                  const numericValue = rawValue ? parseFloat(rawValue.replace(',', '.')) : 0;

                  setFormData(prev => ({
                    ...prev,
                    valor: numericValue
                  }));
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
                    <label htmlFor="dataProcedimento">Data</label>
                    <input
                      type="date"
                      id="dataProcedimento"
                      name="dataProcedimento"
                      value={procedimentoData.dataProcedimento || ''}
                      onChange={(e) => {
                        setProcedimentoData(prev => ({
                          ...prev,
                          dataProcedimento: e.target.value
                        }));
                      }}
                    />
                  </div>

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
                        dataProcedimento: "",
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