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
    // Se já estiver no formato DD/MM/AAAA, retorna diretamente
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }

    // Cria a data no fuso horário local para exibição
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';

    // Usa métodos locais para exibição
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

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
  const [editandoProcedimentoId, setEditandoProcedimentoId] = useState(null);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
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

  const handleDeleteProcedimento = async (procedimentoId) => {
    if (!window.confirm("Tem certeza que deseja excluir este procedimento?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await api.delete(
        `/api/users/${editandoId}/procedimento/${procedimentoId}`, // Corrigido para singular
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        setFormData(prev => ({
          ...prev,
          procedimentos: prev.procedimentos.filter(p => p._id !== procedimentoId)
        }));
        alert("Procedimento excluído com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao excluir procedimento:", error);
      setError(error.response?.data?.message || "Erro ao excluir procedimento. Tente novamente.");
    }
  };

  const handleEditProcedimento = (procedimentoId) => {
    const procedimento = formData.procedimentos.find(p => p._id === procedimentoId);
    if (!procedimento) return;
    setEditandoProcedimentoId(procedimentoId);

    // Converte a data do banco (ISO) para o formato DD/MM/AAAA
    const dataOriginal = procedimento.dataProcedimento;
    const formattedDate = dataOriginal ? new Date(dataOriginal).toLocaleDateString('pt-BR') : '';

    // Converte o valor numérico para o formato de exibição
    const valorDisplay = formatValueForDisplay(procedimento.valor);

    setProcedimentoData({
        procedimento: procedimento.procedimento || "",
        denteFace: procedimento.denteFace || "",
        valor: procedimento.valor || 0, // Passa o valor numérico original
        modalidadePagamento: procedimento.modalidadePagamento || "",
        profissional: procedimento.profissional || "",
        dataProcedimento: formattedDate, // Usa a data formatada para exibir no input
        valorFormatado: valorDisplay || "" // Usa o valor formatado para exibir no input
    });
    setShowProcedimentoForm(true);
};

   const handleProcedimentoChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Tratamento para valor monetário (campo "valor")
    if (name === "valor") {
        // Remove tudo que não é dígito, exceto a vírgula para lidar com a formatação
        const cleanedValue = value.replace(/[^0-9,]/g, '');

        // Trata o valor como uma string de números (sem vírgula, ex: '1000' para 10,00)
        // Isso previne o travamento no R$ 1,00
        const numericString = cleanedValue.replace(',', '');

        let numericValue = 0;
        if (numericString) {
          numericValue = parseInt(numericString, 10) / 100;
        }

        // Formata o número para o padrão monetário brasileiro (R$ 0,00)
        formattedValue = numericValue.toLocaleString('pt-BR', {
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
        return;
    }

    // Tratamento para a data do procedimento
    if (name === "dataProcedimento") {
      formattedValue = formatDateInput(value);
      if (formattedValue.length === 10) {
        const [day, month, year] = formattedValue.split('/');
        const dateObj = new Date(`${year}-${month}-${day}T12:00:00Z`);
        if (isNaN(dateObj.getTime())) {
          setFieldErrors(prev => ({ ...prev, [name]: "Data inválida" }));
        } else {
          const errors = { ...fieldErrors };
          delete errors[name];
          setFieldErrors(errors);
        }
      }
      setProcedimentoData(prev => ({ ...prev, [name]: formattedValue }));
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
      formattedValue = formatDateInput(value);

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
      return;
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));

    if (name !== "email") {
      validateField(name, formattedValue);
    }

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

    if (editandoId) {
      // Lógica de atualização
      const updatedFields = {};
      const originalUser = usuarios.find(u => u._id === editandoId);

      // Prepara os campos a serem enviados para a API
      const fieldsToUpdate = [
        'nomeCompleto', 'cpf', 'telefone', 'endereco', 'detalhesDoencas',
        'quaisRemedios', 'quaisMedicamentos', 'quaisAnestesias',
        'historicoCirurgia', 'historicoOdontologico', 'sangramentoPosProcedimento',
        'respiracao', 'peso', 'frequenciaFumo', 'frequenciaAlcool',
        'exameSangue', 'coagulacao', 'cicatrizacao', 'dataNascimento'
      ];

      fieldsToUpdate.forEach(key => {
        // Apenas adiciona o campo se ele tiver um valor no formulário
        if (formData[key]) {
          updatedFields[key] = formData[key];
        }
      });
      
      // Lida com campos aninhados como 'habitos' e 'exames'
      updatedFields.habitos = {
        frequenciaFumo: formData.frequenciaFumo,
        frequenciaAlcool: formData.frequenciaAlcool,
      };
      updatedFields.exames = {
        exameSangue: formData.exameSangue,
        coagulacao: formData.coagulacao,
        cicatrizacao: formData.cicatrizacao,
      };

      // Se a senha foi preenchida, adiciona ao objeto de atualização
      if (formData.password && formData.password.length >= 6) {
        updatedFields.password = formData.password;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await api.put(`/api/users/${editandoId}`, updatedFields, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data?.errors) {
          setFieldErrors(response.data.errors);
          setError(response.data.message || "Erro de validação");
          return;
        }

        alert("Usuário atualizado com sucesso!");

        // ----------------------------------------------------
        // ALTERAÇÃO IMPORTANTE: MANTÉM NA PÁGINA DE EDIÇÃO
        // ----------------------------------------------------
        // Em vez de recarregar todos os usuários, você pode simplesmente
        // chamar a função de edição novamente com o usuário atualizado da resposta
        // da API, ou atualizar apenas o estado daquele usuário específico.
        // A forma mais fácil é recarregar a lista e manter o modo de visualização.

        // Encontra o usuário atualizado na resposta da API
        const updatedUser = response.data.user;

        // Atualiza a lista de usuários localmente
        setUsuarios(prevUsuarios =>
          prevUsuarios.map(u => (u._id === editandoId ? { ...u, ...updatedUser } : u))
        );

        // Atualiza o formulário com os novos dados
        handleEdit(updatedUser);

        // Não chame resetForm() aqui para manter o estado de edição
        // Você pode voltar para a lista de usuários com o botão "Voltar"
        
      } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        if (error.response?.data?.errors) {
          setFieldErrors(error.response.data.errors);
          setError(error.response.data.message || "Corrija os erros no formulário");
        } else {
          setError(error.message || "Erro ao conectar com o servidor");
        }
      }
    } else {
      // --- Lógica de cadastro (mantida do seu código original) ---
      if (!validateForm()) {
        return;
      }
      
      let formIsValid = true;
      const requiredFields = [
        'nomeCompleto', 'cpf', 'telefone', 'endereco',
        'dataNascimento', 'detalhesDoencas', 'quaisRemedios', 'quaisMedicamentos',
        'quaisAnestesias', 'historicoCirurgia', 'historicoOdontologico',
        'sangramentoPosProcedimento', 'respiracao', 'peso'
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
          const dateObj = new Date(`${year}-${month}-${day}T12:00:00`);
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

      const dataNascimentoISO = convertDateToISO(formData.dataNascimento, "dataNascimento");
      const dataProcedimentoISO = convertDateToISO(formData.dataProcedimento, "dataProcedimento");

      if (!dataNascimentoISO) {
        return;
      }
      
      const dadosParaEnvio = {
        nomeCompleto: formData.nomeCompleto.trim(),
        cpf: formatCPF(formData.cpf.replace(/\D/g, '')),
        telefone: formatFone(formData.telefone.replace(/\D/g, '')),
        endereco: formData.endereco.trim(),
        dataNascimento: dataNascimentoISO,
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
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      if (dataProcedimentoISO && formData.procedimento) {
        dadosParaEnvio.historicoProcedimentos = [{
          procedimento: formData.procedimento?.trim() || null,
          denteFace: formData.denteFace?.trim() || null,
          valor: formData.valor ? convertValueToFloat(formData.valor) : null,
          modalidadePagamento: formData.modalidadePagamento || null,
          profissional: formData.profissional?.trim() || null,
          dataProcedimento: dataProcedimentoISO
        }];
      }

      try {
        const response = await api.post("/api/register/user", dadosParaEnvio);

        if (response.data?.errors) {
          setFieldErrors(response.data.errors);
          setError(response.data.message || "Erro de validação");
          return;
        }

        alert("Usuário cadastrado com sucesso!");
        resetForm(); // Chama resetForm para limpar o formulário de cadastro
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
    }
  };

  const resetForm = () => {
    setFormData({
      nomeCompleto: "",
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
    e.stopPropagation();

    try {
        const token = localStorage.getItem("token");

        // Validação da data do procedimento
        const dataProcedimentoInput = procedimentoData.dataProcedimento;

        if (!dataProcedimentoInput || !/^\d{2}\/\d{2}\/\d{4}$/.test(dataProcedimentoInput)) {
            setFieldErrors({ ...fieldErrors, dataProcedimento: "Formato de data inválido (DD/MM/AAAA) ou campo vazio" });
            return;
        }
        
        // Converte a data do formato DD/MM/AAAA para um objeto Date LOCAL
        const [day, month, year] = dataProcedimentoInput.split('/');
        const dataProcedimentoObjeto = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));

        if (isNaN(dataProcedimentoObjeto.getTime())) {
            setFieldErrors({ ...fieldErrors, dataProcedimento: "Data inválida" });
            return;
        }

        // Converte o valor monetário
        let valorNumerico = 0;
        if (procedimentoData.valorFormatado) {
            try {
                valorNumerico = convertValueToFloat(procedimentoData.valorFormatado);
                if (isNaN(valorNumerico)) {
                    throw new Error("Valor inválido");
                }
            } catch (error) {
                setFieldErrors({ ...fieldErrors, valor: "Valor monetário inválido" });
                return;
            }
        }

        const dadosParaEnvio = {
            procedimento: procedimentoData.procedimento?.trim() || null,
            denteFace: procedimentoData.denteFace?.trim() || null,
            valor: valorNumerico || null,
            modalidadePagamento: procedimentoData.modalidadePagamento || null,
            profissional: procedimentoData.profissional?.trim() || null,
            dataProcedimento: dataProcedimentoObjeto
        };

        let response;
        if (editandoProcedimentoId) {
            // Requisição PUT para ATUALIZAR um procedimento específico
            response = await api.put(
                `/api/users/${editandoId}/procedimento/${editandoProcedimentoId}`,
                dadosParaEnvio,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // --- INÍCIO DA CORREÇÃO ---
            // A resposta do backend já contém o procedimento completo e atualizado.
            const procedimentoRetornadoDoBackend = response.data.procedimento;

            // Apenas adicione o valor formatado para exibição no frontend.
            const procedimentoAtualizadoParaState = {
                ...procedimentoRetornadoDoBackend,
                valorFormatado: formatValueForDisplay(procedimentoRetornadoDoBackend.valor),
            };
            
            setFormData(prev => ({
                ...prev,
                procedimentos: prev.procedimentos.map(p =>
                    // Garanta que a comparação de IDs seja segura
                    String(p._id) === String(editandoProcedimentoId) 
                        ? procedimentoAtualizadoParaState 
                        : p
                )
            }));
            // --- FIM DA CORREÇÃO ---

        } else {
            // Requisição PUT para ADICIONAR um NOVO procedimento
            response = await api.put(
                `/api/users/${editandoId}/procedimento`,
                dadosParaEnvio,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // AQUI VOCÊ TAMBÉM PRECISA CORRIGIR O USO DA DATA DE RETORNO
            const novoProcedimento = {
                ...dadosParaEnvio,
                _id: response.data.procedimento._id,
                valorFormatado: formatValueForDisplay(valorNumerico),
                dataProcedimento: response.data.procedimento.dataProcedimento // Usa a data formatada pelo backend
            };
            
            setFormData(prev => ({
                ...prev,
                procedimentos: [...prev.procedimentos, novoProcedimento]
            }));
        }

        setProcedimentoData({
            procedimento: "", denteFace: "", valor: "", valorFormatado: "",
            modalidadePagamento: "", profissional: "", dataProcedimento: ""
        });
        setEditandoProcedimentoId(null);
        setShowProcedimentoForm(false);
        setError("");
        setFieldErrors({});
        alert(`Procedimento ${editandoProcedimentoId ? 'atualizado' : 'adicionado'} com sucesso!`);

        // Opcional: recarrega todos os usuários. Pode ser removido para uma UI mais rápida.
        fetchUsuarios(); 
    } catch (error) {
        console.error("Erro ao adicionar/editar procedimento:", error);
        const errorMessage = error.response?.data?.message || error.message || "Erro ao adicionar/editar procedimento. Tente novamente.";
        setError(errorMessage);
        if (error.response?.data?.errors) {
            setFieldErrors({ ...fieldErrors, ...error.response.data.errors });
        }
    }
};

  const filteredUsuarios = usuarios.filter(usuario => {
    if (!searchTerm.trim()) return true;

    // Normaliza o termo de busca (remove acentos e coloca em minúsculas)
    const normalize = (str) => {
      return str
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    };

    const searchLower = normalize(searchTerm);

    // Verifica em vários campos do usuário
    const fieldsToCheck = [
      usuario.nomeCompleto,
      usuario.cpf?.replace(/\D/g, ''), // Remove formatação do CPF
      usuario.telefone?.replace(/\D/g, ''), // Remove formatação do telefone
      usuario.procedimento,
      usuario.profissional
    ];

    // Retorna true se o termo de busca for encontrado em qualquer campo
    return fieldsToCheck.some(field =>
      field && normalize(field).includes(searchLower)
    );
  });

  const labels = {
    nomeCompleto: "Nome completo",
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
            {['nomeCompleto', 'cpf', 'telefone', 'password', 'confirmPassword'].map((key) => (
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
            onClick={() => setShowProcedimentoSection(!showProcedimentoSection)}
            style={{ cursor: 'pointer' }}
          >
            <h2>Dados do Procedimento</h2>
            <span className="toggle-arrow">
              {showProcedimentoSection ? '▼' : '►'}
            </span>
          </div>

          {showProcedimentoSection && (
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
              onClick={() => {
                // Ao clicar para ADICIONAR NOVO, limpa os campos antes de mostrar o formulário.
                setProcedimentoData({
                  procedimento: "",
                  denteFace: "",
                  valor: "",
                  modalidadePagamento: "",
                  profissional: "",
                  dataProcedimento: ""
                });
                setEditandoProcedimentoId(null);
                setShowProcedimentoForm(!showProcedimentoForm);
              }}
              className="btn-add-procedimento"
            >
              {showProcedimentoForm ? 'Cancelar' : 'Adicionar Novo Procedimento'}
            </button>

            {showProcedimentoForm && (
              <div className="procedimento-form">
                <h3>{editandoProcedimentoId ? 'Editar Procedimento' : 'Adicionar Novo Procedimento'}</h3>

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
                      onChange={handleProcedimentoChange}
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
                  <label htmlFor="novo-dataProcedimento">Data do Procedimento</label>
                  <input
                    type="text"
                    id="novo-dataProcedimento"
                    name="dataProcedimento"
                    value={procedimentoData.dataProcedimento}
                    onChange={handleProcedimentoChange}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className={fieldErrors.dataProcedimento ? 'error-field' : ''}
                  />
                  {fieldErrors.dataProcedimento && (
                    <span className="field-error">{fieldErrors.dataProcedimento}</span>
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
                      setEditandoProcedimentoId(null);
                    }}
                    className="btn btn-cancel"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleAddProcedimento}
                    className="btn btn-primary"
                  >
                    {editandoProcedimentoId ? 'Salvar Alterações' : 'Adicionar Procedimento'}
                  </button>
                </div>
              </div>
            )}

            <div className="procedimentos-list">
              {Array.isArray(formData.procedimentos) && formData.procedimentos.length > 0 ? (
                formData.procedimentos
                  .sort((a, b) => {
                    return new Date(b.dataProcedimento) - new Date(a.dataProcedimento);
                  })
                  .map((proc, index) => (
                    <div key={proc._id || `proc-${index}`} className="procedimento-item">
                      <div className="procedimento-details single-line">
                        {proc.dataProcedimento && (
                          <span><strong>Data:</strong> {formatDateForDisplay(proc.dataProcedimento)}</span>
                        )}
                        <span><strong>Procedimento:</strong> {proc.procedimento || "Não especificado"}</span>
                        <span><strong>Dente/Face:</strong> {proc.denteFace || "Não especificado"}</span>
                        <span><strong>Valor:</strong> {formatValueForDisplay(proc.valor)}</span>
                        <span><strong>Pagamento:</strong> {proc.modalidadePagamento || "Não especificado"}</span>
                        <span><strong>Profissional:</strong> {proc.profissional || "Não especificado"}</span>
                        <div className="procedimento-actions">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditProcedimento(proc._id);
                            }}
                            className="btn-tabela btn-edit-procedimento"
                            title="Editar procedimento"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteProcedimento(proc._id);
                            }}
                            className="btn-tabela btn-delete-procedimento"
                            title="Excluir procedimento"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="no-procedimentos">
                  <i className="bi bi-clipboard-x"></i>
                  <p>Nenhum procedimento cadastrado ainda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary">
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
              placeholder="Pesquisar por nome ou CPF..."
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