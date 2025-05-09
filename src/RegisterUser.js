import React, { useState, useEffect } from "react";
import api from "./api/api";
import "./RegisterUser.css";

// Funções auxiliares - ATUALIZADAS

function formatDateInput(value) {
  // Remove tudo que não é dígito
  let cleanedValue = value.replace(/\D/g, '');

  // Limita o dia para 0-31
  if (cleanedValue.length > 2) {
    const day = parseInt(cleanedValue.substring(0, 2), 10);
    if (day > 31) {
      cleanedValue = '31' + cleanedValue.substring(2);
    }
  }

  // Limita o mês para 0-12
  if (cleanedValue.length > 4) {
    const month = parseInt(cleanedValue.substring(2, 4), 10);
    if (month > 12) {
      cleanedValue = cleanedValue.substring(0, 2) + '12' + cleanedValue.substring(4);
    }
  }

  // Aplica a máscara: DD/MM/AAAA
  if (cleanedValue.length > 2) {
    cleanedValue = cleanedValue.substring(0, 2) + '/' + cleanedValue.substring(2);
  }
  if (cleanedValue.length > 5) {
    cleanedValue = cleanedValue.substring(0, 5) + '/' + cleanedValue.substring(5, 9);
  }

  return cleanedValue;
}

function formatDateForDisplay(dateString) {
  if (!dateString) return 'Data não informada';

  try {
    // Cria a data a partir da string ISO
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';

    // Extrai os componentes da data em UTC para evitar problemas de timezone
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
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
  const [showProcedimentoSection, setShowProcedimentoSection] = useState(true);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    cpf: "",
    telefone: "",
    endereco: "",
    dataNascimento: "",
    dataProcedimento: "",
    dataNovoProcedimento: "",
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
    valor: 0,
    modalidadePagamento: "",
    profissional: "",
    dataNovoProcedimento: ""
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
        headers: { Authorization: `Bearer ${token}` }
      });

      // Verificação mais robusta da resposta
      if (!response?.data) {
        throw new Error("Resposta da API não contém dados");
      }

      // Converter para array garantidamente
      const dadosUsuarios = Array.isArray(response.data)
        ? response.data
        : [];

      // Formatação segura dos usuários
      const usuariosFormatados = dadosUsuarios.map(usuario => {
        // Garante que procedimentos sejam arrays
        const procedimentos = Array.isArray(usuario.procedimentos)
          ? usuario.procedimentos
          : [];

        const historicoProcedimentos = Array.isArray(usuario.historicoProcedimentos)
          ? usuario.historicoProcedimentos
          : [];

        // Formata datas para exibição
        const formatDate = (date) => {
          try {
            return date ? new Date(date).toLocaleDateString('pt-BR') : 'Não informado';
          } catch {
            return 'Data inválida';
          }
        };

        return {
          ...usuario,
          procedimentos,
          historicoProcedimentos,
          _id: usuario._id || Date.now().toString(),
          nomeCompleto: usuario.nomeCompleto || "Nome não informado",
          // Adiciona datas formatadas para exibição
          dataNascimentoFormatada: formatDate(usuario.dataNascimento),
          dataProcedimentoFormatada: formatDate(usuario.dataProcedimento),
          dataNovoProcedimentoFormatada: formatDate(usuario.dataNovoProcedimento),
          // Mantém as datas originais para edição
          dataNascimento: usuario.dataNascimento,
          dataProcedimento: usuario.dataProcedimento,
          dataNovoProcedimento: usuario.dataNovoProcedimento
        };
      });

      // Ordena por data de criação (mais recentes primeiro)
      usuariosFormatados.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setUsuarios(usuariosFormatados);
      setError("");

    } catch (error) {
      console.error("Erro ao buscar usuários:", error);

      // Mensagem mais específica de erro
      const errorMessage = error.response?.data?.message
        ? `Erro ao carregar usuários: ${error.response.data.message}`
        : "Erro ao conectar com o servidor. Tente novamente.";

      setError(errorMessage);
      setUsuarios([]);

      // Opcional: Mostrar notificação mais visível
      // alert(errorMessage); 
      // ou usar um toast notification se disponível
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
    return `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(2, 7)}-${cleanedValue.slice(7, 11)}`;
  };

  const handleProcedimentoChange = (e) => {
    const { name, value } = e.target;
  
    // Tratamento para valor monetário
    if (name === "valor") {
      // Remove tudo exceto números e vírgula
      const rawValue = value.replace(/[^\d,]/g, '');
      
      // Converte para número (substitui vírgula por ponto para parseFloat)
      const numericValue = rawValue ? parseFloat(rawValue.replace(',', '.')) : 0;
      
      // Formata para exibição
      const valorFormatado = numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
  
      setProcedimentoData(prev => ({
        ...prev,
        valor: numericValue,
        valorFormatado
      }));
      return;
    }
  
    // Tratamento para data do procedimento
      if (name === "dataNovoProcedimento") {
    // Aplica a máscara de data
    const formattedDate = formatDateInput(value);
    
    // Validação quando o campo estiver completo
    if (formattedDate.length === 10) {
      const [day, month, year] = formattedDate.split('/');
      
      // Cria a data em UTC (usando meio-dia para evitar problemas)
      const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      
      if (isNaN(dateObj.getTime())) {
        setFieldErrors(prev => ({ ...prev, [name]: "Data inválida" }));
      } else {
        const errors = { ...fieldErrors };
        delete errors[name];
        setFieldErrors(errors);
      }
    }

    setProcedimentoData(prev => ({ ...prev, [name]: formattedDate }));
    return;
  }
  
    // Para todos os outros campos
    setProcedimentoData(prev => ({ ...prev, [name]: value }));
  };

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };

    // Função auxiliar para validar datas
    const validateDate = (dateValue, fieldName) => {
      if (!dateValue) {
        delete errors[fieldName];
        return true;
      }

      // Verifica formato básico
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
        errors[fieldName] = "Formato inválido (DD/MM/AAAA)";
        return false;
      }

      // Verifica se está completo
      if (dateValue.length !== 10) {
        return true;
      }

      // Validação completa da data
      const [day, month, year] = dateValue.split('/');
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10) - 1;
      const yearNum = parseInt(year, 10);

      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
        errors[fieldName] = "Data contém valores inválidos";
        return false;
      }

      const dateObj = new Date(yearNum, monthNum, dayNum);
      if (
        dateObj.getFullYear() !== yearNum ||
        dateObj.getMonth() !== monthNum ||
        dateObj.getDate() !== dayNum
      ) {
        errors[fieldName] = "Data inválida";
        return false;
      }

      // Validações específicas por tipo de data
      if (fieldName === "dataNascimento" && dateObj > new Date()) {
        errors[fieldName] = "Data deve ser no passado";
        return false;
      }


      delete errors[fieldName];
      return true;
    };

    // Validações específicas por campo
    switch (name) {
      case "nomeCompleto":
        if (!value || value.trim().length < 3) {
          errors.nomeCompleto = "Nome completo deve ter pelo menos 3 caracteres";
        } else {
          delete errors.nomeCompleto;
        }
        break;

      case "email":
        if (!value) {
          errors.email = "E-mail é obrigatório";
        } else {
          delete errors.email;
        }
        break;

      case "cpf":
        if (!value) {
          errors.cpf = "CPF é obrigatório";
        } else if (value.replace(/\D/g, '').length !== 11) {
          errors.cpf = "CPF deve ter 11 dígitos";
        } else {
          delete errors.cpf;
        }
        break;

      case "telefone":
        if (!value) {
          errors.telefone = "Telefone é obrigatório";
        } else if (value.replace(/\D/g, '').length < 10) {
          errors.telefone = "Telefone inválido (mínimo 10 dígitos)";
        } else {
          delete errors.telefone;
        }
        break;

      case "dataNascimento":
      case "dataProcedimento":
        validateDate(value, name);
        break;

      case "endereco":
        if (!value || value.trim().length < 5) {
          errors.endereco = "Endereço deve ter pelo menos 5 caracteres";
        } else {
          delete errors.endereco;
        }
        break;

      case "password":
        if (!editandoId && (!value || value.length < 6)) {
          errors.password = "A senha deve ter pelo menos 6 caracteres";
        } else {
          delete errors.password;
        }
        break;

      case "confirmPassword":
        if (!editandoId && formData.password && value !== formData.password) {
          errors.confirmPassword = "As senhas não coincidem";
        } else {
          delete errors.confirmPassword;
        }
        break;

      case "peso":
        if (value && !/^\d*\.?\d*$/.test(value)) {
          errors.peso = "O peso deve conter apenas números (ex: 70.5)";
        } else {
          delete errors.peso;
        }
        break;

      case "valor":
        const numericValue = value ? Number(value.toString().replace(/[^\d,]/g, '').replace(',', '.')) : 0;
        if (value && isNaN(numericValue)) {
          errors.valor = "Valor monetário inválido";
        } else if (numericValue < 0) {
          errors.valor = "O valor não pode ser negativo";
        } else {
          delete errors.valor;
        }
        break;

      default:
        if (errors[name]) {
          delete errors[name];
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
    }
    else if (name === "telefone") {
      formattedValue = formatFone(value);
    }
    else if (name === "dataNascimento" || name === "dataProcedimento") {
      // Aplica a máscara de data e validação em tempo real
      formattedValue = formatDateInput(value);

      // Validação imediata quando o campo estiver completo
      if (formattedValue.length === 10) {
        const [day, month, year] = formattedValue.split('/');
        const dateObj = new Date(`${year}-${month}-${day}`);

        if (isNaN(dateObj.getTime())) {
          setFieldErrors(prev => ({ ...prev, [name]: "Data inválida" }));
        } else if (name === "dataNascimento" && dateObj > new Date()) {
          setFieldErrors(prev => ({ ...prev, [name]: "Data deve ser no passado" }));
        } else if (name === "dataProcedimento" && dateObj < new Date()) {
          setFieldErrors(prev => ({ ...prev, [name]: "Data do procedimento não pode ser no passado" }));
        } else {
          const errors = { ...fieldErrors };
          delete errors[name];
          setFieldErrors(errors);
        }
      }
    }
    else if (name === "valor") {
      // ... (código existente para o campo valor)
      return;
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    validateField(name, formattedValue);
    setError("");
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Só valida senha se estiver cadastrando novo usuário ou se a senha foi preenchida
    if (!editandoId || (formData.password || formData.confirmPassword)) {
      if (formData.password && formData.confirmPassword &&
        formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "As senhas não coincidem!";
        isValid = false;
      }

      if (formData.password && formData.password.length < 6) {
        errors.password = "A senha deve ter pelo menos 6 caracteres";
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação inicial do formulário
    if (!validateForm()) {
      return;
    }

    // Validar todos os campos obrigatórios
    let formIsValid = true;
    const requiredFields = [
      'nomeCompleto', 'email', 'cpf', 'telefone', 'endereco',
      'dataNascimento', 'dataProcedimento', 'procedimento',
      'denteFace', 'valor', 'modalidadePagamento', 'profissional'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: `${labels[field]} é obrigatório`
        }));
        formIsValid = false;
      }
    });

    if (!formIsValid) {
      return;
    }

    // Converter datas para formato ISO
    const convertDateToISO = (dateString, fieldName) => {
  if (!dateString || dateString.length !== 10) {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: `Data ${fieldName} inválida ou incompleta`
    }));
    return null;
  }

  try {
    const [day, month, year] = dateString.split('/');
    
    // Cria a data em UTC (usando Date.UTC e new Date())
    const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

    if (isNaN(dateObj.getTime())) {
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: `Data ${fieldName} inválida`
      }));
      return null;
    }

    return dateObj.toISOString();
  } catch (error) {
    console.error(`Erro ao converter ${fieldName}:`, error);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: `Erro ao processar data ${fieldName}`
    }));
    return null;
  }
};

    // Converter datas
    const dataNascimentoISO = convertDateToISO(formData.dataNascimento, "dataNascimento");
    const dataProcedimentoISO = convertDateToISO(formData.dataProcedimento, "dataProcedimento");

    // Se alguma conversão falhou, retornar
    if (!dataNascimentoISO || !dataProcedimentoISO) {
      return;
    }

    // Preparar dados para envio
    const dadosParaEnvio = {
      nomeCompleto: formData.nomeCompleto.trim(),
      email: formData.email.toLowerCase().trim(),
      cpf: formatCPF(formData.cpf.replace(/\D/g, '')),
      telefone: formatFone(formData.telefone.replace(/\D/g, '')),
      endereco: formData.endereco.trim(),
      dataNascimento: dataNascimentoISO,
      dataProcedimento: dataProcedimentoISO,
      ...(!editandoId && { dataNovoProcedimento: dataProcedimentoISO }),
      detalhesDoencas: formData.detalhesDoencas.trim(),
      quaisRemedios: formData.quaisRemedios.trim(),
      quaisMedicamentos: formData.quaisMedicamentos.trim(),
      quaisAnestesias: formData.quaisAnestesias.trim(),
      habitos: {
        frequenciaFumo: formData.frequenciaFumo,
        frequenciaAlcool: formData.frequenciaAlcool
      },
      exames: {
        exameSangue: formData.exameSangue.trim(),
        coagulacao: formData.coagulacao.trim(),
        cicatrizacao: formData.cicatrizacao.trim()
      },
      historicoCirurgia: formData.historicoCirurgia.trim(),
      historicoOdontologico: formData.historicoOdontologico.trim(),
      sangramentoPosProcedimento: formData.sangramentoPosProcedimento.trim(),
      respiracao: formData.respiracao.trim(),
      peso: Number(formData.peso) || 0,
      procedimento: formData.procedimento.trim(),
      denteFace: formData.denteFace.trim(),
      valor: convertValueToFloat(formData.valor),
      modalidadePagamento: formData.modalidadePagamento,
      profissional: formData.profissional.trim()
    };

    // Adicionar senha apenas para novo cadastro
    if (!editandoId) {
      if (!formData.password || formData.password.length < 6) {
        setFieldErrors(prev => ({
          ...prev,
          password: "A senha deve ter pelo menos 6 caracteres"
        }));
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: "As senhas não coincidem"
        }));
        return;
      }
      dadosParaEnvio.password = formData.password;
      dadosParaEnvio.confirmPassword = formData.confirmPassword;
    }

    try {
      const endpoint = editandoId ? `/api/users/${editandoId}` : "/api/register/user";
      const method = editandoId ? "put" : "post";

      const response = await api[method](endpoint, dadosParaEnvio);

      if (response.data?.errors) {
        setFieldErrors(response.data.errors);
        setError(response.data.message || "Erro de validação");
        return;
      }

      alert(`Usuário ${editandoId ? "atualizado" : "cadastrado"} com sucesso!`);
      resetForm();
      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);

      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        setError(error.response.data.message || "Corrija os erros no formulário");
      } else {
        setError(error.message || "Erro ao conectar com o servidor");
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
      dataNascimento: "",
      dataProcedimento: "",
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
      profissional: "",
      dataProcedimento: ""
    });
  };

  const handleEdit = (usuario) => {
    setEditandoId(usuario._id);
    setModoVisualizacao(true);
    setShowProcedimentoSection(false);

    // Função corrigida para formatar datas sem problemas de timezone
    const formatDateWithoutTimezone = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        // Ajuste para evitar problemas de timezone
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();

        return `${day}/${month}/${year}`;
      } catch (e) {
        console.error("Erro ao formatar data:", e);
        return '';
      }
    };

    // Formatação das datas usando a nova função
    let dataNascimentoFormatada = formatDateWithoutTimezone(usuario.dataNascimento);
    let dataProcedimentoFormatada = formatDateWithoutTimezone(usuario.dataProcedimento);
    let dataNovoProcedimentoFormatada = formatDateWithoutTimezone(usuario.dataNovoProcedimento);

    // Formatação do valor monetário
    let valorFormatado = '';
    if (usuario.valor !== undefined && usuario.valor !== null) {
      const numericValue = typeof usuario.valor === 'number' ? usuario.valor : parseFloat(usuario.valor);
      if (!isNaN(numericValue)) {
        valorFormatado = numericValue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      }
    }

    const historicoProcedimentos = Array.isArray(usuario.historicoProcedimentos)
      ? usuario.historicoProcedimentos
      : [];

    // Cria o procedimento principal
    const procedimentoPrincipal = {
      procedimento: usuario.procedimento || "",
      denteFace: usuario.denteFace || "",
      valor: usuario.valor || 0,
      valorFormatado: valorFormatado,
      modalidadePagamento: usuario.modalidadePagamento || "",
      profissional: usuario.profissional || "",
      dataProcedimento: usuario.dataProcedimento || "",
      dataNovoProcedimento: usuario.dataNovoProcedimento || "",
      isPrincipal: true,
      createdAt: usuario.createdAt || new Date().toISOString()
    };

    // Processa e ordena os procedimentos secundários (do mais recente para o mais antigo)
    const procedimentosSecundarios = historicoProcedimentos
      .map(p => {
        let valorProcFormatado = '';
        if (p.valor !== undefined && p.valor !== null) {
          const numericValue = typeof p.valor === 'number' ? p.valor : parseFloat(p.valor);
          if (!isNaN(numericValue)) {
            valorProcFormatado = numericValue.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
          }
        }

        return {
          ...p,
          valorFormatado: valorProcFormatado,
          dataProcedimento: p.dataProcedimento || p.createdAt,
          isPrincipal: false,
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
        };
      })
      .sort((a, b) => {
        // Ordena por data de criação (mais recente primeiro)
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

    // Combina o procedimento principal com os secundários ordenados
    const procedimentosCompletos = [procedimentoPrincipal, ...procedimentosSecundarios];

    setFormData({
      ...usuario,
      cpf: formatCPF(usuario.cpf),
      telefone: formatFone(usuario.telefone),
      dataNascimento: dataNascimentoFormatada,
      dataProcedimento: dataProcedimentoFormatada,
      dataNovoProcedimento: dataNovoProcedimentoFormatada,
      valor: usuario.valor || 0,
      valorFormatado: valorFormatado,
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
    setShowProcedimentoSection(true);
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

      // 1. Validação dos campos obrigatórios
      const errors = {};
      if (!procedimentoData.procedimento?.trim()) errors.procedimento = "Procedimento é obrigatório";
      if (!procedimentoData.denteFace?.trim()) errors.denteFace = "Dente/Face é obrigatório";
      if (!procedimentoData.valor) errors.valor = "Valor é obrigatório";
      if (!procedimentoData.modalidadePagamento) errors.modalidadePagamento = "Modalidade de pagamento é obrigatória";
      if (!procedimentoData.profissional?.trim()) errors.profissional = "Profissional é obrigatório";
      if (!procedimentoData.dataNovoProcedimento) errors.dataNovoProcedimento = "Data do procedimento é obrigatória";

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      // 2. Validação e conversão da data
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(procedimentoData.dataNovoProcedimento)) {
        setFieldErrors({ ...fieldErrors, dataNovoProcedimento: "Formato inválido (DD/MM/AAAA)" });
        return;
      }

      const [day, month, year] = procedimentoData.dataNovoProcedimento.split('/');

      // Cria a data no meio do dia para evitar problemas de timezone
      const dateObj = new Date(`${year}-${month}-${day}T12:00:00`); // Usar meio-dia para evitar problemas de timezone

      if (isNaN(dateObj.getTime())) {
        setFieldErrors({ ...fieldErrors, dataNovoProcedimento: "Data inválida" });
        return;
      }

      // 3. Conversão e validação do valor
      let valorNumerico;
      try {
        valorNumerico = convertValueToFloat(procedimentoData.valor);
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
          throw new Error("Valor deve ser positivo");
        }
      } catch (error) {
        setFieldErrors({ ...fieldErrors, valor: "Valor monetário inválido" });
        return;
      }

      // 4. Preparação dos dados para envio
      const dadosParaEnvio = {
        procedimento: procedimentoData.procedimento.trim(),
        denteFace: procedimentoData.denteFace.trim(),
        valor: valorNumerico,
        modalidadePagamento: procedimentoData.modalidadePagamento,
        profissional: procedimentoData.profissional.trim(),
        dataNovoProcedimento: dateObj.toISOString()
      };

      // 5. Envio para a API
      const response = await api.put(
        `/api/users/${editandoId}/procedimento`,
        dadosParaEnvio,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 6. Cria objeto do novo procedimento para atualização local
      const novoProcedimento = {
        ...response.data.procedimento,
        _id: response.data.procedimento._id || Date.now().toString(),
        isPrincipal: false,
        valorFormatado: formatValueForDisplay(valorNumerico),
        dataProcedimento: dateObj.toISOString(),
        dataNovoProcedimento: dateObj.toISOString()
      };

      // 7. Atualização do estado local
      setFormData(prev => {
        const novosProcedimentos = [
          ...prev.procedimentos.filter(p => p.isPrincipal), // Mantém o principal primeiro
          ...prev.procedimentos.filter(p => !p.isPrincipal), // Procedimentos existentes
          novoProcedimento // Novo procedimento no final
        ];

        return {
          ...prev,
          procedimentos: novosProcedimentos
        };
      });

      // 8. Reset do formulário e estado
      setProcedimentoData({
        procedimento: "",
        denteFace: "",
        valor: 0,
        valorFormatado: "",
        modalidadePagamento: "",
        profissional: "",
        dataNovoProcedimento: ""
      });

      setShowProcedimentoForm(false);
      setError("");
      setFieldErrors({});

      // Feedback visual para o usuário
      alert("Procedimento adicionado com sucesso!");

    } catch (error) {
      console.error("Erro ao adicionar procedimento:", error);

      // Tratamento de erros mais detalhado
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Erro ao adicionar procedimento. Tente novamente.";

      setError(errorMessage);

      if (error.response?.data?.errors) {
        setFieldErrors({ ...fieldErrors, ...error.response.data.errors });
      }
    }
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    const searchLower = searchTerm.toLowerCase().trim();  // Remove espaços e padroniza
    const cpfSearch = searchTerm.replace(/\D/g, '');      // Remove formatação do CPF

    return (
      !searchLower ||  // Se vazio, retorna todos
      usuario.nomeCompleto?.toLowerCase().includes(searchLower) ||
      usuario.cpf?.includes(cpfSearch) ||
      usuario.email?.toLowerCase().includes(searchLower)
      // usuario.telefone?.replace(/\D/g, '').includes(cpfSearch)  // (Opcional)
    );
  });

  const labels = {
    nomeCompleto: "Nome completo",
    email: "E-mail",
    cpf: "CPF",
    telefone: "Telefone",
    endereco: "Endereço",
    dataNascimento: "Data de Nascimento",
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
                  disabled={modoVisualizacao && !key.includes("password")}
                />
                {fieldErrors[key] && <span className="field-error">{fieldErrors[key]}</span>}
              </div>
            ))}

            {/* Campo dataNascimento separado com tratamento especial */}
            <div className="form-group">
              <label htmlFor="dataNascimento">{labels.dataNascimento}</label>
              <input
                type="text"
                id="dataNascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                onKeyDown={(e) => {
                  // Permite apenas números e teclas de controle
                  if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                className={fieldErrors.dataNascimento ? 'error-field' : ''}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                disabled={modoVisualizacao}
              />
              {fieldErrors.dataNascimento && (
                <span className="field-error">{fieldErrors.dataNascimento}</span>
              )}
            </div>


            <div className="form-group">
              <label htmlFor="endereco">{labels.endereco}</label>
              <textarea
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                className={`resizable-textarea ${fieldErrors.endereco ? 'error-field' : ''}`}
                rows={3}
                disabled={modoVisualizacao}
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
          <div
            className="section-header"
            onClick={() => !modoVisualizacao && setShowProcedimentoSection(!showProcedimentoSection)}
            style={{ cursor: modoVisualizacao ? 'default' : 'pointer' }}
          >
            <h2>Dados do Procedimento</h2>
            {!modoVisualizacao && (
              <span className="toggle-arrow">
                {showProcedimentoSection ? '▼' : '►'}
              </span>
            )}
          </div>

          {(!modoVisualizacao || showProcedimentoSection) && (
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
                  className={fieldErrors.procedimento ? 'error-field' : ''}
                />
                {fieldErrors.procedimento && (
                  <span className="field-error">{fieldErrors.procedimento}</span>
                )}
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
                  className={fieldErrors.denteFace ? 'error-field' : ''}
                />
                {fieldErrors.denteFace && (
                  <span className="field-error">{fieldErrors.denteFace}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="dataProcedimento">Data do Procedimento</label>
                <input
                  type="text"
                  id="dataProcedimento"
                  name="dataProcedimento"
                  value={formData.dataProcedimento}
                  onChange={handleChange}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className={fieldErrors.dataProcedimento ? 'error-field' : ''}
                  disabled={modoVisualizacao}
                  onKeyDown={(e) => {
                    if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                {fieldErrors.dataProcedimento && (
                  <span className="field-error">{fieldErrors.dataProcedimento}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="valor">{labels.valor}</label>
                <input
                  type="text"
                  id="valor"
                  name="valor"
                  value={formData.valorFormatado || ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, '');
                    const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0;
                    const formattedValue = numericValue.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });

                    setFormData(prev => ({
                      ...prev,
                      valor: numericValue,
                      valorFormatado: formattedValue
                    }));
                  }}
                  onBlur={() => {
                    if (!formData.valorFormatado) {
                      setFormData(prev => ({
                        ...prev,
                        valor: 0,
                        valorFormatado: 'R$ 0,00'
                      }));
                    }
                  }}
                  placeholder="R$ 0,00"
                  className={fieldErrors.valor ? 'error-field' : ''}
                />
                {fieldErrors.valor && (
                  <span className="field-error">{fieldErrors.valor}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="modalidadePagamento">{labels.modalidadePagamento}</label>
                <select
                  id="modalidadePagamento"
                  name="modalidadePagamento"
                  value={formData.modalidadePagamento}
                  onChange={handleChange}
                  className={fieldErrors.modalidadePagamento ? 'error-field' : ''}
                >
                  <option value="">Selecione...</option>
                  {modalidadesPagamento.map((opcao) => (
                    <option key={opcao} value={opcao}>{opcao}</option>
                  ))}
                </select>
                {fieldErrors.modalidadePagamento && (
                  <span className="field-error">{fieldErrors.modalidadePagamento}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="profissional">{labels.profissional}</label>
                <input
                  type="text"
                  id="profissional"
                  name="profissional"
                  value={formData.profissional}
                  onChange={handleChange}
                  className={fieldErrors.profissional ? 'error-field' : ''}
                />
                {fieldErrors.profissional && (
                  <span className="field-error">{fieldErrors.profissional}</span>
                )}
              </div>
            </div>
          )}
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
                    <label htmlFor="novo-procedimento">Procedimento</label>
                    <input
                      type="text"
                      id="novo-procedimento"
                      name="procedimento"
                      value={procedimentoData.procedimento}
                      onChange={handleProcedimentoChange}
                      placeholder="Digite o procedimento realizado"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="novo-denteFace">Dente/Face</label>
                    <input
                      type="text"
                      id="novo-denteFace"
                      name="denteFace"
                      value={procedimentoData.denteFace}
                      onChange={handleProcedimentoChange}
                      placeholder="Ex: 11, 22, Face Lingual, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="novo-valor">Valor</label>
                    <input
                      type="text"
                      id="novo-valor"
                      name="valor"
                      value={procedimentoData.valorFormatado || ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0;
                        const formattedValue = numericValue.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        });

                        setProcedimentoData(prev => ({
                          ...prev,
                          valor: numericValue,
                          valorFormatado: formattedValue
                        }));
                      }}
                      onBlur={() => {
                        if (!procedimentoData.valorFormatado) {
                          setProcedimentoData(prev => ({
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
                    <label htmlFor="novo-modalidadePagamento">Modalidade de Pagamento</label>
                    <select
                      id="novo-modalidadePagamento"
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
                    <label htmlFor="novo-profissional">Profissional</label>
                    <input
                      type="text"
                      id="novo-profissional"
                      name="profissional"
                      value={procedimentoData.profissional}
                      onChange={handleProcedimentoChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="novo-dataNovoProcedimento">Data do Novo Procedimento</label>
                  <input
                    type="text"
                    id="novo-dataNovoProcedimento"
                    name="dataNovoProcedimento"
                    value={procedimentoData.dataNovoProcedimento}
                    onChange={handleProcedimentoChange}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    onKeyDown={(e) => {
                      if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className={fieldErrors.dataNovoProcedimento ? 'error-field' : ''}
                  />
                  {fieldErrors.dataNovoProcedimento && (
                    <span className="field-error">{fieldErrors.dataNovoProcedimento}</span>
                  )}
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
                        profissional: "",
                        dataProcedimento: ""
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
                  formData.procedimentos
                    .sort((a, b) => {
                      // Ordena: principal primeiro, depois os mais antigos primeiro
                      if (a.isPrincipal) return -1;
                      if (b.isPrincipal) return 1;
                      return new Date(a.dataProcedimento) - new Date(b.dataProcedimento);
                    })
                    .map((proc, index) => {
                      const procedimento = {
                        _id: proc._id || `proc-${index}`,
                        procedimento: proc.procedimento || "Não especificado",
                        denteFace: proc.denteFace || "Não especificado",
                        valor: typeof proc.valor === 'number' ? proc.valor : 0,
                        modalidadePagamento: proc.modalidadePagamento || "Não especificado",
                        profissional: proc.profissional || "Não especificado",
                        dataProcedimento: proc.dataProcedimento
                      };

                      return (
                        <div key={procedimento._id} className="procedimento-item">
                          <div className="procedimento-header">
                            <h4>Procedimento #{index + 1}</h4>
                          </div>

                          <div className="procedimento-details">
                            <p><strong>Procedimento:</strong> {procedimento.procedimento}</p>
                            <p><strong>Dente/Face:</strong> {procedimento.denteFace}</p>
                            {procedimento.dataProcedimento && (
                              <p><strong>Data:</strong> {formatDateForDisplay(procedimento.dataProcedimento)}</p>
                            )}
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

