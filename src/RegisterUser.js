import React, { useState, useEffect } from "react";
import api from "./api/api";
import "./RegisterUser.css";

// Funções auxiliares - ATUALIZADAS (sem alteração nestas funções auxiliares)
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
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';

    // Remova o ajuste de fuso horário
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
  // const [showProcedimentoSection, setShowProcedimentoSection] = useState(true); // REMOVIDO
  const [editandoProcedimentoId, setEditandoProcedimentoId] = useState(null);
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    cpf: "",
    telefone: "",
    endereco: "",
    dataNascimento: "",
    // dataProcedimento: "", // REMOVIDO - referente ao primeiro procedimento
    // dataNovoProcedimento: "", // REMOVIDO - referente ao primeiro procedimento (ou redundante)
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
    // procedimento: "", // REMOVIDO
    // denteFace: "", // REMOVIDO
    // valor: "", // REMOVIDO (usar valorFormatado para UI se necessário, mas este é do principal)
    // valorNumerico: 0, // REMOVIDO
    // modalidadePagamento: "", // REMOVIDO
    // profissional: "", // REMOVIDO
    procedimentos: [] // Mantido para o histórico de procedimentos na edição
  });

  const [usuarios, setUsuarios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [imagemModal, setImagemModal] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [modoVisualizacao, setModoVisualizacao] = useState(false);
  const [showProcedimentoForm, setShowProcedimentoForm] = useState(false);
  const [procedimentoData, setProcedimentoData] = useState({ // Para o form de "Adicionar Novo Procedimento"
    procedimento: "",
    denteFace: "",
    valor: 0, // Armazena o valor numérico
    valorFormatado: "", // Armazena o valor formatado para exibição
    modalidadePagamento: "",
    profissional: "",
    dataNovoProcedimento: "" // Data específica para este novo procedimento
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

      if (!response?.data) {
        throw new Error("Resposta da API não contém dados");
      }

      const dadosUsuarios = Array.isArray(response.data)
        ? response.data
        : [];

      const usuariosFormatados = dadosUsuarios.map(usuario => {
        const procedimentos = Array.isArray(usuario.procedimentos)
          ? usuario.procedimentos
          : [];

        const historicoProcedimentos = Array.isArray(usuario.historicoProcedimentos)
          ? usuario.historicoProcedimentos
          : [];

        const formatDate = (date) => {
          try {
            return date ? new Date(date).toLocaleDateString('pt-BR') : 'Não informado';
          } catch {
            return 'Data inválida';
          }
        };

        return {
          ...usuario,
          procedimentos, // Este 'procedimentos' no usuario pode ser o histórico ou precisa de clarificação
          historicoProcedimentos,
          _id: usuario._id || Date.now().toString(),
          nomeCompleto: usuario.nomeCompleto || "Nome não informado",
          dataNascimentoFormatada: formatDate(usuario.dataNascimento),
          // Removido formatação de dataProcedimento e dataNovoProcedimento da raiz aqui,
          // pois eles estão sendo desassociados do cadastro principal.
          // Se ainda existirem no backend, podem ser formatados se necessário para visualização.
          dataNascimento: usuario.dataNascimento,
          // dataProcedimento: usuario.dataProcedimento, // Campo da raiz
          // dataNovoProcedimento: usuario.dataNovoProcedimento // Campo da raiz
        };
      });

      usuariosFormatados.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setUsuarios(usuariosFormatados);
      setError("");

    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      const errorMessage = error.response?.data?.message
        ? `Erro ao carregar usuários: ${error.response.data.message}`
        : "Erro ao conectar com o servidor. Tente novamente.";
      setError(errorMessage);
      setUsuarios([]);
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
        `/api/users/${editandoId}/procedimento/${procedimentoId}`,
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
    
    // A data do procedimento para edição vem de 'dataProcedimento' ou 'createdAt' do item do histórico.
    // 'dataNovoProcedimento' é o nome do campo no formulário de edição/adição.
    const dataParaFormulario = procedimento.dataProcedimento || procedimento.dataNovoProcedimento || procedimento.createdAt;

    setProcedimentoData({
      procedimento: procedimento.procedimento || "",
      denteFace: procedimento.denteFace || "",
      valor: procedimento.valor || 0,
      modalidadePagamento: procedimento.modalidadePagamento || "",
      profissional: procedimento.profissional || "",
      dataNovoProcedimento: formatDateForDisplay(dataParaFormulario) || "", // Usar a data correta
      valorFormatado: formatValueForDisplay(procedimento.valor) || ""
    });
    setShowProcedimentoForm(true);
  };

  const handleProcedimentoChange = (e) => {
    const { name, value } = e.target;

    if (name === "valor") {
      const rawValue = value.replace(/[^\d,]/g, '');
      const numericValue = rawValue ? parseFloat(rawValue.replace(',', '.')) : 0;
      const valorFormatado = numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      setProcedimentoData(prev => ({
        ...prev,
        valor: numericValue, // Armazena o número
        valorFormatado // Armazena o string formatado
      }));
      return;
    }

    if (name === "dataNovoProcedimento") {
      const formattedDate = formatDateInput(value);
      if (formattedDate.length === 10) {
        const [day, month, year] = formattedDate.split('/');
        const dateObj = new Date(`${year}-${month}-${day}T12:00:00`);
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
    setProcedimentoData(prev => ({ ...prev, [name]: value }));
  };


  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    const validateDate = (dateValue, fieldName) => {
      if (!dateValue) {
        delete errors[fieldName];
        return true;
      }
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
        errors[fieldName] = "Formato inválido (DD/MM/AAAA)";
        return false;
      }
      if (dateValue.length !== 10) {
        return true;
      }
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
      if (fieldName === "dataNascimento" && dateObj > new Date()) {
        errors[fieldName] = "Data deve ser no passado";
        return false;
      }
      // Validação para dataProcedimento removida daqui, pois não existe mais no formulário principal
      delete errors[fieldName];
      return true;
    };

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
        // case "dataProcedimento": // Removido
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
      // Validação de 'valor' (do procedimento principal) removida daqui
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
    } else if (name === "cpf") {
      formattedValue = formatCPF(value);
    } else if (name === "telefone") {
      formattedValue = formatFone(value);
    } else if (name === "dataNascimento" /*|| name === "dataProcedimento" -- REMOVIDO */) {
      formattedValue = formatDateInput(value);
      if (formattedValue.length === 10) {
        const [day, month, year] = formattedValue.split('/');
        const dateObj = new Date(`${year}-${month}-${day}T12:00:00`); // Adicionado T12:00:00 para evitar timezone issues
        if (isNaN(dateObj.getTime())) {
          setFieldErrors(prev => ({ ...prev, [name]: "Data inválida" }));
        } else if (name === "dataNascimento" && dateObj > new Date()) {
          setFieldErrors(prev => ({ ...prev, [name]: "Data deve ser no passado" }));
        } 
        // else if (name === "dataProcedimento" && dateObj < new Date()) { // REMOVIDO
        //   setFieldErrors(prev => ({ ...prev, [name]: "Data do procedimento não pode ser no passado" }));
        // } 
        else {
          const errors = { ...fieldErrors };
          delete errors[name];
          setFieldErrors(errors);
        }
      }
    }
    // else if (name === "valor") { // Tratamento do campo 'valor' principal removido
    //   return; 
    // }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (name !== "email") { // assumindo que email não é um campo aqui, mas mantendo a lógica
      validateField(name, formattedValue);
    }
    setError("");
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
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
    setFieldErrors(prev => ({...prev, ...errors})); // Mescla com erros existentes
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) { // Validação de senha
      return;
    }

    let formIsValid = true;
    // Campos obrigatórios para cadastro de usuário (sem os campos de procedimento inicial)
    const requiredFieldsBase = ['nomeCompleto', 'cpf', 'telefone', 'endereco', 'dataNascimento'];
    // Adiciona campos de procedimento apenas se eles fossem obrigatórios no cadastro, o que não é mais o caso.
    // const requiredFieldsProcedimento = ['procedimento', 'denteFace', 'valor', 'modalidadePagamento', 'profissional', 'dataProcedimento'];
    
    // Se não estiver editando, valida campos base. Para edição, a validação de campos específicos do usuário é mais complexa
    // e pode depender de quais campos o usuário está tentando alterar.
    // Aqui, vamos manter a validação simples para os campos base no cadastro.
    if (!editandoId) {
        requiredFieldsBase.forEach(field => {
            if (!formData[field]) {
            setFieldErrors(prev => ({
                ...prev,
                [field]: `${labels[field] || field} é obrigatório`
            }));
            formIsValid = false;
            }
        });
    }
    // Adicionar validação de senha para novo cadastro
    if (!editandoId && (!formData.password || !formData.confirmPassword)) {
        if (!formData.password) {
            setFieldErrors(prev => ({ ...prev, password: "Senha é obrigatória" }));
            formIsValid = false;
        }
        if (!formData.confirmPassword) {
            setFieldErrors(prev => ({ ...prev, confirmPassword: "Confirmação de senha é obrigatória" }));
            formIsValid = false;
        }
    }


    if (!formIsValid) {
      setError("Por favor, preencha todos os campos obrigatórios destacados.");
      return;
    }

    const convertDateToISO = (dateString, fieldName) => {
      if (!dateString || dateString.length !== 10) {
        // Não define erro aqui se o campo não for obrigatório ou já validado
        if(dateString) { // Se houver valor mas estiver incompleto
            setFieldErrors(prev => ({
                ...prev,
                [fieldName]: `Data ${labels[fieldName] || fieldName} inválida ou incompleta`
            }));
        }
        return null;
      }
      try {
        const [day, month, year] = dateString.split('/');
        const dateObj = new Date(`${year}-${month}-${day}T12:00:00`);
        if (isNaN(dateObj.getTime())) {
          setFieldErrors(prev => ({
            ...prev,
            [fieldName]: `Data ${labels[fieldName] || fieldName} inválida`
          }));
          return null;
        }
        return dateObj.toISOString();
      } catch (error) {
        console.error(`Erro ao converter ${fieldName}:`, error);
        setFieldErrors(prev => ({
          ...prev,
          [fieldName]: `Erro ao processar data ${labels[fieldName] || fieldName}`
        }));
        return null;
      }
    };

    const dataNascimentoISO = convertDateToISO(formData.dataNascimento, "dataNascimento");
    // const dataProcedimentoISO = convertDateToISO(formData.dataProcedimento, "dataProcedimento"); // REMOVIDO para cadastro inicial

    if (!dataNascimentoISO && formData.dataNascimento) { // Se a data de nascimento foi preenchida mas é inválida
        return;
    }
    // if (!editandoId && (!dataProcedimentoISO && formData.dataProcedimento)) return; // REMOVIDO

    const dadosParaEnvio = {
      nomeCompleto: formData.nomeCompleto.trim(),
      cpf: formatCPF(formData.cpf.replace(/\D/g, '')),
      telefone: formatFone(formData.telefone.replace(/\D/g, '')),
      endereco: formData.endereco.trim(),
      dataNascimento: dataNascimentoISO,
      // dataProcedimento: dataProcedimentoISO, // REMOVIDO para cadastro inicial
      // ...(!editandoId && { dataNovoProcedimento: dataProcedimentoISO }), // REMOVIDO
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
      // Campos de procedimento principal removidos do envio para cadastro inicial
      // procedimento: formData.procedimento?.trim() || "",
      // denteFace: formData.denteFace?.trim() || "",
      // valor: convertValueToFloat(formData.valor),
      // modalidadePagamento: formData.modalidadePagamento || "",
      // profissional: formData.profissional?.trim() || ""
    };
    
    // Se estiver editando, envie todos os campos do formData (que já foi populado em handleEdit)
    // A API de update deve lidar com quais campos podem ser atualizados.
    if (editandoId) {
        // Para atualização, envie todos os dados relevantes que podem ter sido alterados.
        // A API de PUT /api/users/:id deve ser robusta para lidar com os campos enviados.
        // Os procedimentos são atualizados separadamente via handleAddProcedimento.
        // Portanto, aqui enviamos apenas os dados do usuário, não os campos de procedimento principal
        // que foram removidos da gestão direta pelo formulário principal.
    }


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
      // O backend não precisa de confirmPassword, mas o frontend usa para validação.
      // dadosParaEnvio.confirmPassword = formData.confirmPassword; // Opcional enviar
    } else {
        // Se estiver editando e uma nova senha foi fornecida
        if (formData.password) {
            if (formData.password.length < 6) {
                 setFieldErrors(prev => ({ ...prev, password: "A senha deve ter pelo menos 6 caracteres" }));
                 return;
            }
            if (formData.password !== formData.confirmPassword) {
                setFieldErrors(prev => ({ ...prev, confirmPassword: "As senhas não coincidem" }));
                return;
            }
            dadosParaEnvio.password = formData.password;
        }
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
        setError(error.response?.data?.message || error.message || "Erro ao conectar com o servidor");
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
      // dataProcedimento: "", // REMOVIDO
      // dataNovoProcedimento: "", // REMOVIDO
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
      // Campos de procedimento principal removidos
      // procedimento: "",
      // denteFace: "",
      // valor: "",
      // valorNumerico: 0,
      // modalidadePagamento: "",
      // profissional: "",
      procedimentos: [] // Mantido para o histórico de procedimentos na edição
    });
    setEditandoId(null);
    setModoVisualizacao(false);
    setError("");
    setFieldErrors({});
    setShowProcedimentoForm(false);
    setProcedimentoData({
      procedimento: "",
      denteFace: "",
      valor: 0,
      valorFormatado: "",
      modalidadePagamento: "",
      profissional: "",
      dataNovoProcedimento: "" // Reset da data para o form de Adicionar Procedimento
    });
    // setShowProcedimentoSection(true); // REMOVIDO
  };

  const handleEdit = (usuario) => {
    setEditandoId(usuario._id);
    setModoVisualizacao(true);
    // setShowProcedimentoSection(false); // REMOVIDO, pois a seção não existe mais no modo de cadastro

    const formatDateWithoutTimezone = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
      } catch (e) {
        console.error("Erro ao formatar data:", e);
        return '';
      }
    };

    let dataNascimentoFormatada = formatDateWithoutTimezone(usuario.dataNascimento);
    // let dataProcedimentoFormatada = formatDateWithoutTimezone(usuario.dataProcedimento); // Referente ao campo principal removido
    // let dataNovoProcedimentoFormatada = formatDateWithoutTimezone(usuario.dataNovoProcedimento); // Referente ao campo principal removido

    // // Formatação do valor monetário do procedimento principal (se existir no backend)
    // let valorFormatado = '';
    // if (usuario.valor !== undefined && usuario.valor !== null) {
    //   const numericValue = typeof usuario.valor === 'number' ? usuario.valor : parseFloat(String(usuario.valor).replace(',', '.'));
    //   if (!isNaN(numericValue)) {
    //     valorFormatado = numericValue.toLocaleString('pt-BR', {
    //       style: 'currency',
    //       currency: 'BRL'
    //     });
    //   }
    // }

    const historicoProcedimentos = Array.isArray(usuario.historicoProcedimentos)
      ? usuario.historicoProcedimentos
      : [];

    // Lógica do "procedimentoPrincipal" é mantida, mas os dados virão de `usuario.procedimento` etc.
    // Se esses campos não existirem mais ou forem null no backend para novos usuários,
    // este "procedimentoPrincipal" será "vazio".
    const procedimentoPrincipal = {
      _id: `principal_${usuario._id}`, // ID sintético para o principal
      procedimento: usuario.procedimento || "", // Virá da raiz do User (se existir)
      denteFace: usuario.denteFace || "",       // Virá da raiz do User (se existir)
      valor: usuario.valor || 0,                // Virá da raiz do User (se existir)
      valorFormatado: formatValueForDisplay(usuario.valor), // Formata o valor da raiz
      modalidadePagamento: usuario.modalidadePagamento || "", // Virá da raiz do User (se existir)
      profissional: usuario.profissional || "", // Virá da raiz do User (se existir)
      dataProcedimento: usuario.dataProcedimento || usuario.dataNovoProcedimento || usuario.createdAt, // Prioriza datas específicas da raiz, fallback para createdAt
      isPrincipal: true,
      createdAt: usuario.createdAt || new Date().toISOString()
    };
    
    // Formata os procedimentos do histórico (secundários)
    const procedimentosSecundarios = historicoProcedimentos
      .map(p => ({
        ...p,
        _id: p._id || `hist_${Date.now()}_${Math.random()}`, // Garante um _id
        valorFormatado: formatValueForDisplay(p.valor),
        // A data para exibição/edição deve ser 'dataNovoProcedimento' do item do histórico
        dataProcedimento: p.dataNovoProcedimento || p.dataProcedimento || p.createdAt,
        isPrincipal: false,
        createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Mais recentes primeiro

    // Se houver campos de procedimento principal no usuário (legado ou ainda no backend),
    // E não houver nenhum procedimento no histórico com exatamente os mesmos dados e data,
    // adicione o "procedimentoPrincipal" à lista.
    // Caso contrário, apenas use o histórico.
    // Para simplificar, vamos sempre incluir o "procedimentoPrincipal" (mesmo que vazio)
    // e o usuário pode adicionar/editar via "Adicionar Novo Procedimento".
    // Ou, melhor: se o procedimento principal (da raiz) não tiver dados significativos, não o adicione.
    
    let procedimentosCompletos = [];
    if (procedimentoPrincipal.procedimento || procedimentoPrincipal.valor > 0) { // Se o principal tiver dados
        procedimentosCompletos.push(procedimentoPrincipal);
    }
    procedimentosCompletos = [...procedimentosCompletos, ...procedimentosSecundarios];

    // Remove duplicatas baseadas em conteúdo e data (uma heurística)
    // Esta parte pode ser complexa e depende de como você define um "duplicado"
    // Por agora, vamos simplificar e assumir que os _ids são únicos ou a lógica de backend previne duplicatas exatas.


    setFormData({
      ...usuario,
      cpf: formatCPF(usuario.cpf),
      telefone: formatFone(usuario.telefone),
      dataNascimento: dataNascimentoFormatada,
      // dataProcedimento: dataProcedimentoFormatada, // Campo da raiz
      // dataNovoProcedimento: dataNovoProcedimentoFormatada, // Campo da raiz
      // valor: usuario.valor || 0, // Campo da raiz
      // valorFormatado: valorFormatado, // Campo da raiz
      frequenciaFumo: usuario.habitos?.frequenciaFumo || "Nunca",
      frequenciaAlcool: usuario.habitos?.frequenciaAlcool || "Nunca",
      exameSangue: usuario.exames?.exameSangue || "",
      coagulacao: usuario.exames?.coagulacao || "",
      cicatrizacao: usuario.exames?.cicatrizacao || "",
      procedimentos: procedimentosCompletos, // Lista combinada para exibição
      password: "", // Limpa senhas ao editar
      confirmPassword: ""
    });
  };

  const handleVoltar = () => {
    setEditandoId(null);
    setModoVisualizacao(false);
    // setShowProcedimentoSection(true); // REMOVIDO
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
      const errors = {};
      if (!procedimentoData.procedimento?.trim()) errors.procedimento = "Procedimento é obrigatório";
      if (!procedimentoData.denteFace?.trim()) errors.denteFace = "Dente/Face é obrigatório";
      // 'valor' em procedimentoData é numérico, valorFormatado é para UI.
      if (procedimentoData.valor === undefined || procedimentoData.valor === null || isNaN(parseFloat(procedimentoData.valor)) || parseFloat(procedimentoData.valor) <= 0) {
        errors.valor = "Valor é obrigatório e deve ser maior que zero";
      }
      if (!procedimentoData.modalidadePagamento) errors.modalidadePagamento = "Modalidade de pagamento é obrigatória";
      if (!procedimentoData.profissional?.trim()) errors.profissional = "Profissional é obrigatório";
      if (!procedimentoData.dataNovoProcedimento) errors.dataNovoProcedimento = "Data do procedimento é obrigatória";

      if (Object.keys(errors).length > 0) {
        setFieldErrors(prev => ({...prev, ...errors})); // Usa os fieldErrors do form principal
        return;
      }

      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(procedimentoData.dataNovoProcedimento)) {
        setFieldErrors({ ...fieldErrors, dataNovoProcedimento: "Formato inválido (DD/MM/AAAA)" });
        return;
      }

      const [day, month, year] = procedimentoData.dataNovoProcedimento.split('/');
      const dateObj = new Date(`${year}-${month}-${day}T12:00:00`);
      if (isNaN(dateObj.getTime())) {
        setFieldErrors({ ...fieldErrors, dataNovoProcedimento: "Data inválida" });
        return;
      }

      let valorNumerico = convertValueToFloat(procedimentoData.valor); // procedimentoData.valor já deve ser numérico
       if (isNaN(valorNumerico)) {
           setFieldErrors({ ...fieldErrors, valor: "Valor monetário inválido" });
           return;
       }


      const dadosParaEnvio = {
        procedimento: procedimentoData.procedimento.trim(),
        denteFace: procedimentoData.denteFace.trim(),
        valor: valorNumerico,
        modalidadePagamento: procedimentoData.modalidadePagamento,
        profissional: procedimentoData.profissional.trim(),
        dataNovoProcedimento: dateObj.toISOString() // Este é o campo correto para o backend
      };

      let response;
      const endpointPath = editandoProcedimentoId
        ? `/api/users/${editandoId}/procedimento/${editandoProcedimentoId}`
        : `/api/users/${editandoId}/procedimento`; // Endpoint para adicionar novo
      const method = editandoProcedimentoId ? "put" : "put"; // Pode ser POST para novo, mas PUT para adicionar ao subdocumento é comum. Seu backend usa PUT.

      response = await api[method](
        endpointPath,
        dadosParaEnvio,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // O backend deve retornar o procedimento atualizado/adicionado
      const procedimentoRetornado = response.data.procedimento || 
                                 (response.data.user?.historicoProcedimentos?.find(p => p._id === editandoProcedimentoId || p.procedimento === dadosParaEnvio.procedimento) || 
                                 {...dadosParaEnvio, _id: editandoProcedimentoId || Date.now().toString() });


      const procedimentoAtualizadoParaEstado = {
        ...dadosParaEnvio, // Contém todos os dados enviados
        _id: editandoProcedimentoId || procedimentoRetornado._id || Date.now().toString(), // Garante um ID
        valorFormatado: formatValueForDisplay(valorNumerico),
        dataProcedimento: dateObj.toISOString(), // Para consistência na exibição, usamos dataProcedimento
        isPrincipal: false // Novos procedimentos adicionados via este form não são "principais" na raiz
      };
      
      setFormData(prev => {
        let novosProcedimentos;
        if (editandoProcedimentoId) {
          novosProcedimentos = prev.procedimentos.map(p =>
            p._id === editandoProcedimentoId ? procedimentoAtualizadoParaEstado : p
          );
        } else {
          // Adiciona o novo procedimento, garantindo que não haja duplicatas conceituais
          // e mantendo a ordem (ex: principal primeiro, depois por data)
          // Filtra o procedimento principal (se existir e tiver dados)
          const principal = prev.procedimentos.find(p => p.isPrincipal && p.procedimento);
          const historico = prev.procedimentos.filter(p => !(p.isPrincipal && p.procedimento) && p._id !== procedimentoAtualizadoParaEstado._id);
          
          novosProcedimentos = principal ? [principal, ...historico, procedimentoAtualizadoParaEstado] : [...historico, procedimentoAtualizadoParaEstado];
        }
         // Reordena: principal primeiro (se existir), depois por data (mais recentes primeiro)
        novosProcedimentos.sort((a, b) => {
            if (a.isPrincipal && !b.isPrincipal) return -1;
            if (!a.isPrincipal && b.isPrincipal) return 1;
            return new Date(b.dataProcedimento || b.createdAt) - new Date(a.dataProcedimento || a.createdAt);
        });

        return { ...prev, procedimentos: novosProcedimentos };
      });

      setProcedimentoData({
        procedimento: "", denteFace: "", valor: 0, valorFormatado: "",
        modalidadePagamento: "", profissional: "", dataNovoProcedimento: ""
      });
      setEditandoProcedimentoId(null);
      setShowProcedimentoForm(false);
      setError("");
      setFieldErrors({});
      alert(`Procedimento ${editandoProcedimentoId ? 'atualizado' : 'adicionado'} com sucesso!`);

    } catch (error) {
      console.error("Erro ao adicionar/editar procedimento:", error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Erro ao adicionar/editar procedimento. Tente novamente.";
      setError(errorMessage);
      if (error.response?.data?.errors) {
        setFieldErrors(prev => ({ ...prev, ...error.response.data.errors }));
      }
    }
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    if (!searchTerm?.trim()) return true;
    const normalizeForSearch = (str) => {
      if (!str) return '';
      return str
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    };
    const searchNormalized = normalizeForSearch(searchTerm);
    const cpfDigits = searchTerm.replace(/\D/g, '');
    const nomeMatch = normalizeForSearch(usuario.nomeCompleto).includes(searchNormalized);
    const cpfMatch = usuario.cpf?.replace(/\D/g, '').includes(cpfDigits);
    const startsWithMatch = normalizeForSearch(usuario.nomeCompleto).startsWith(searchNormalized);
    return nomeMatch || cpfMatch || startsWithMatch;
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
    // Labels dos campos de procedimento principal removidas pois os campos foram removidos do form de cadastro
    // procedimento: "Procedimento",
    // denteFace: "Dente/Face",
    // valor: "Valor",
    // modalidadePagamento: "Modalidade de pagamento",
    // profissional: "Profissional"
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

      <h1>{editandoId ? 'Editar Usuário' : 'Cadastro de Usuário'}</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-section">
          <h2>Dados Pessoais</h2>
          <div className="form-grid">
            {['nomeCompleto', 'cpf', 'telefone', 'password', 'confirmPassword'].map((key) => (
              (editandoId && (key === 'password' || key === 'confirmPassword') && !formData[key]) ? null : // Não mostra campos de senha vazios na edição a menos que preenchidos
              <div key={key} className="form-group">
                <label htmlFor={key}>{labels[key]}</label>
                <input
                  type={key.includes("password") ? "password" : "text"}
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className={fieldErrors[key] ? 'error-field' : ''}
                  placeholder={(key === 'password' && editandoId) ? 'Deixe em branco para não alterar' : ''}
                />
                {fieldErrors[key] && <span className="field-error">{fieldErrors[key]}</span>}
              </div>
            ))}
            <div className="form-group">
              <label htmlFor="dataNascimento">{labels.dataNascimento}</label>
              <input
                type="text"
                id="dataNascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                onKeyDown={(e) => {
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
              <textarea id="detalhesDoencas" name="detalhesDoencas" value={formData.detalhesDoencas} onChange={handleChange} className={`resizable-textarea ${fieldErrors.detalhesDoencas ? 'error-field' : ''}`} rows={3}/>
            </div>
            <div className="form-group">
              <label htmlFor="quaisRemedios">{labels.quaisRemedios}</label>
              <textarea id="quaisRemedios" name="quaisRemedios" value={formData.quaisRemedios} onChange={handleChange} className={`resizable-textarea ${fieldErrors.quaisRemedios ? 'error-field' : ''}`} rows={3}/>
            </div>
            <div className="form-group">
              <label htmlFor="quaisMedicamentos">{labels.quaisMedicamentos}</label>
              <textarea id="quaisMedicamentos" name="quaisMedicamentos" value={formData.quaisMedicamentos} onChange={handleChange} className={`resizable-textarea ${fieldErrors.quaisMedicamentos ? 'error-field' : ''}`} rows={3}/>
            </div>
            <div className="form-group">
              <label htmlFor="quaisAnestesias">{labels.quaisAnestesias}</label>
              <textarea id="quaisAnestesias" name="quaisAnestesias" value={formData.quaisAnestesias} onChange={handleChange} className={`resizable-textarea ${fieldErrors.quaisAnestesias ? 'error-field' : ''}`} rows={3}/>
            </div>
            <div className="form-group">
              <label htmlFor="frequenciaFumo">{labels.frequenciaFumo}</label>
              <select id="frequenciaFumo" name="frequenciaFumo" value={formData.frequenciaFumo} onChange={handleChange}>
                {frequencias.map((opcao) => (<option key={opcao} value={opcao}>{opcao}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="frequenciaAlcool">{labels.frequenciaAlcool}</label>
              <select id="frequenciaAlcool" name="frequenciaAlcool" value={formData.frequenciaAlcool} onChange={handleChange}>
                {frequencias.map((opcao) => (<option key={opcao} value={opcao}>{opcao}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="respiracao">{labels.respiracao}</label>
              <input type="text" id="respiracao" name="respiracao" value={formData.respiracao} onChange={handleChange}/>
            </div>
            <div className="form-group">
              <label htmlFor="peso">{labels.peso}</label>
              <input type="number" id="peso" name="peso" value={formData.peso} onChange={handleChange} step="0.1"/>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Exames e Sangramento</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="exameSangue">Exame de Sangue</label>
              <textarea id="exameSangue" name="exameSangue" className="large-text-area" rows={5} value={formData.exameSangue} onChange={handleChange}/>
            </div>
            <div className="small-fields-container">
              <div className="form-group">
                <label htmlFor="coagulacao">Coagulação</label>
                <textarea id="coagulacao" name="coagulacao" className="small-text-field" value={formData.coagulacao} onChange={handleChange}/>
              </div>
              <div className="form-group">
                <label htmlFor="cicatrizacao">Cicatrização</label>
                <textarea id="cicatrizacao" name="cicatrizacao" className="small-text-field" value={formData.cicatrizacao} onChange={handleChange}/>
              </div>
              <div className="form-group">
                <label htmlFor="sangramentoPosProcedimento">Sangramento Pós-Procedimento</label>
                <textarea id="sangramentoPosProcedimento" name="sangramentoPosProcedimento" className="small-text-field" value={formData.sangramentoPosProcedimento} onChange={handleChange}/>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Histórico Médico e Odontológico</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="historicoCirurgia">{labels.historicoCirurgia}</label>
              <textarea id="historicoCirurgia" name="historicoCirurgia" value={formData.historicoCirurgia} onChange={handleChange} rows={2} className="medium-text-area"/>
            </div>
            <div className="form-group full-width">
              <label htmlFor="historicoOdontologico">{labels.historicoOdontologico}</label>
              <textarea id="historicoOdontologico" name="historicoOdontologico" value={formData.historicoOdontologico} onChange={handleChange} rows={3} className="large-text-area"/>
            </div>
          </div>
        </div>

        {/* SEÇÃO "DADOS DO PROCEDIMENTO" REMOVIDA DAQUI */}
        {/* Os campos de procedimento (procedimento, denteFace, dataProcedimento, valor, etc.) foram removidos do cadastro inicial */}

        {editandoId && (
          <div className="form-section">
            <h2>Histórico de Procedimentos</h2>
            <button
              type="button"
              onClick={() => {
                setShowProcedimentoForm(!showProcedimentoForm);
                if (showProcedimentoForm) { // Se estava aberto e vai fechar, limpa o form de procedimento
                    setProcedimentoData({ procedimento: "", denteFace: "", valor: 0, valorFormatado: "", modalidadePagamento: "", profissional: "", dataNovoProcedimento: "" });
                    setEditandoProcedimentoId(null);
                    setFieldErrors(prev => ({...prev, procedimento: null, denteFace: null, valor: null, modalidadePagamento: null, profissional: null, dataNovoProcedimento: null})); // Limpa erros específicos
                }
              }}
              className="btn-add-procedimento"
            >
              {showProcedimentoForm ? 'Cancelar Novo Procedimento' : 'Adicionar Novo Procedimento'}
            </button>

            {showProcedimentoForm && (
              <div className="procedimento-form">
                <h3>{editandoProcedimentoId ? "Editar Procedimento" : "Adicionar Novo Procedimento"}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="novo-procedimento">Procedimento</label>
                    <input type="text" id="novo-procedimento" name="procedimento" value={procedimentoData.procedimento} onChange={handleProcedimentoChange} placeholder="Digite o procedimento" className={fieldErrors.procedimento ? 'error-field' : ''}/>
                    {fieldErrors.procedimento && <span className="field-error">{fieldErrors.procedimento}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="novo-denteFace">Dente/Face</label>
                    <input type="text" id="novo-denteFace" name="denteFace" value={procedimentoData.denteFace} onChange={handleProcedimentoChange} placeholder="Ex: 11, Face Lingual" className={fieldErrors.denteFace ? 'error-field' : ''}/>
                    {fieldErrors.denteFace && <span className="field-error">{fieldErrors.denteFace}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="novo-valor">Valor</label>
                    <input type="text" id="novo-valor" name="valor" value={procedimentoData.valorFormatado || ''} onChange={handleProcedimentoChange} 
                           onBlur={() => {
                             if (!procedimentoData.valorFormatado && procedimentoData.valor === 0) {
                               setProcedimentoData(prev => ({...prev, valorFormatado: 'R$ 0,00'}));
                             }
                           }}
                           placeholder="R$ 0,00" className={fieldErrors.valor ? 'error-field' : ''}
                    />
                    {fieldErrors.valor && <span className="field-error">{fieldErrors.valor}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="novo-modalidadePagamento">Modalidade de Pagamento</label>
                    <select id="novo-modalidadePagamento" name="modalidadePagamento" value={procedimentoData.modalidadePagamento} onChange={handleProcedimentoChange} className={fieldErrors.modalidadePagamento ? 'error-field' : ''}>
                      <option value="">Selecione...</option>
                      {modalidadesPagamento.map((opcao) => (<option key={opcao} value={opcao}>{opcao}</option>))}
                    </select>
                    {fieldErrors.modalidadePagamento && <span className="field-error">{fieldErrors.modalidadePagamento}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="novo-profissional">Profissional</label>
                    <input type="text" id="novo-profissional" name="profissional" value={procedimentoData.profissional} onChange={handleProcedimentoChange} className={fieldErrors.profissional ? 'error-field' : ''}/>
                    {fieldErrors.profissional && <span className="field-error">{fieldErrors.profissional}</span>}
                  </div>
                   <div className="form-group"> {/* Movido para dentro do grid se for um campo só */}
                    <label htmlFor="novo-dataNovoProcedimento">Data do Procedimento</label>
                    <input
                      type="text" id="novo-dataNovoProcedimento" name="dataNovoProcedimento"
                      value={procedimentoData.dataNovoProcedimento} onChange={handleProcedimentoChange}
                      placeholder="DD/MM/AAAA" maxLength={10}
                      onKeyDown={(e) => { if (!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) e.preventDefault();}}
                      className={fieldErrors.dataNovoProcedimento ? 'error-field' : ''}
                    />
                    {fieldErrors.dataNovoProcedimento && <span className="field-error">{fieldErrors.dataNovoProcedimento}</span>}
                  </div>
                </div>
               
                <div className="form-actions">
                  <button type="button" onClick={() => { 
                        setShowProcedimentoForm(false); 
                        setEditandoProcedimentoId(null); 
                        setProcedimentoData({ procedimento: "", denteFace: "", valor: 0, valorFormatado: "", modalidadePagamento: "", profissional: "", dataNovoProcedimento: "" });
                        setFieldErrors(prev => ({...prev, procedimento: null, denteFace: null, valor: null, modalidadePagamento: null, profissional: null, dataNovoProcedimento: null})); // Limpa erros específicos
                    }} className="btn-cancel">
                    Cancelar
                  </button>
                  <button type="button" onClick={handleAddProcedimento} className="btn-submit">
                    {editandoProcedimentoId ? 'Atualizar Procedimento' : 'Adicionar Procedimento'}
                  </button>
                </div>
              </div>
            )}

            <div className="procedimentos-list">
              {Array.isArray(formData.procedimentos) && formData.procedimentos.length > 0 ? (
                formData.procedimentos
                  .sort((a, b) => { // Garante ordenação: principal primeiro, depois mais recentes
                    if (a.isPrincipal && !b.isPrincipal) return -1;
                    if (!a.isPrincipal && b.isPrincipal) return 1;
                    // Usar dataProcedimento para ordenação, que deve ser a data efetiva do procedimento
                    const dateA = new Date(a.dataProcedimento || a.createdAt || 0);
                    const dateB = new Date(b.dataProcedimento || b.createdAt || 0);
                    return dateB - dateA;
                  })
                  .map((proc) => {
                    // Garante que proc seja um objeto e tenha _id
                    if (typeof proc !== 'object' || proc === null) return null; 
                    const procedimentoItem = {
                      _id: proc._id || `proc-${Math.random().toString(36).substr(2, 9)}`,
                      procedimento: proc.procedimento || "N/A",
                      denteFace: proc.denteFace || "N/A",
                      valor: proc.valor, // valor já deve ser numérico
                      modalidadePagamento: proc.modalidadePagamento || "N/A",
                      profissional: proc.profissional || "N/A",
                      // Usa dataProcedimento que foi padronizada em handleEdit/handleAddProcedimento
                      dataProcedimento: proc.dataProcedimento 
                    };
                    return (
                      <div key={procedimentoItem._id} className={`procedimento-item ${proc.isPrincipal ? 'principal-procedimento' : ''}`}>
                        <div className="procedimento-details single-line">
                          {procedimentoItem.dataProcedimento && (
                            <span><strong>Data:</strong> {formatDateForDisplay(procedimentoItem.dataProcedimento)}</span>
                          )}
                          <span><strong>Procedimento:</strong> {procedimentoItem.procedimento} {proc.isPrincipal ? "(Principal)" : ""}</span>
                          <span><strong>Dente/Face:</strong> {procedimentoItem.denteFace}</span>
                          <span><strong>Valor:</strong> {formatValueForDisplay(procedimentoItem.valor)}</span>
                          <span><strong>Pagamento:</strong> {procedimentoItem.modalidadePagamento}</span>
                          <span><strong>Profissional:</strong> {procedimentoItem.profissional}</span>
                          {!proc.isPrincipal && ( // Ações apenas para não principais
                            <div className="procedimento-actions">
                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditProcedimento(procedimentoItem._id);}} className="btn-edit-procedimento" title="Editar procedimento">
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteProcedimento(procedimentoItem._id);}} className="btn-delete-procedimento" title="Excluir procedimento">
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-procedimentos">
                  <i className="bi bi-clipboard-x"></i>
                  <p>Nenhum procedimento cadastrado ainda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <button type="submit" className="btn">
          <span className="btnText">{editandoId ? "Atualizar Usuário" : "Cadastrar Usuário"}</span>
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
                          <button onClick={() => handleViewImage(usuario.image)} className="btn-view" aria-label="Visualizar imagem">
                            Imagem
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="actions">
                          <button onClick={() => handleEdit(usuario)} className="btn btn-edit" aria-label="Editar usuário">
                            <span className="btnText">Editar</span>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button onClick={() => handleDelete(usuario._id)} className="btn btn-delete" aria-label="Excluir usuário">
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