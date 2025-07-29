import React, { useState } from "react";
import api from "./api/api"; // Certifique-se de que 'api' está configurado corretamente com a baseURL do seu backend
import styles from "./Prontuario.module.css"; // Importa o CSS ESPECÍFICO para Prontuário
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";

function Prontuario() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  // Função para formatar o CPF no input (Ex: 123.456.789-00)
  const formatarCPF = (valor) => {
    // Remove tudo que não for dígito
    const apenasDigitos = valor.replace(/\D/g, "");

    // Aplica a formatação dinamicamente
    let cpfFormatado = apenasDigitos;
    if (apenasDigitos.length > 3) {
      cpfFormatado = apenasDigitos.substring(0, 3) + "." + apenasDigitos.substring(3);
    }
    if (apenasDigitos.length > 6) {
      cpfFormatado = cpfFormatado.substring(0, 7) + "." + apenasDigitos.substring(6);
    }
    if (apenasDigitos.length > 9) {
      cpfFormatado = cpfFormatado.substring(0, 11) + "-" + apenasDigitos.substring(9);
    }
    
    // Limita ao tamanho máximo do CPF formatado (14 caracteres)
    return cpfFormatado.substring(0, 14);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cpf || !senha) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    // Validação extra: verifica se o CPF tem 14 caracteres (formato completo)
    // ou 11 dígitos se remover a formatação, para evitar submissões parciais
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        setError("CPF inválido. Por favor, digite 11 dígitos.");
        return;
    }


    try {
      // O CPF já está formatado com pontos e traços devido ao onChange
      // Não precisamos de cleanedCPF aqui, enviamos 'cpf' direto.
      const response = await api.post("/api/prontuario", {
        cpf: cpf, // Envia o CPF formatado (ex: "122.061.544-71")
        password: senha,
      });

      setError("");
      setEnviado(true);
      // O backend retorna os dados do prontuário em response.data.data
      gerarPDF(response.data.data);
    } catch (err) {
      setEnviado(false);
      // Melhora a exibição de erros do backend
      setError(err.response?.data?.message || "Erro ao buscar prontuário. Verifique CPF e senha.");
      console.error("Erro na busca do prontuário:", err.response?.data || err);
    }
  };

  // Mantido igual - apenas para formatar valores monetários no PDF
  const formatarValor = (valor) => {
    if (valor === undefined || valor === null) return "-";
    const num =
      typeof valor === "string"
        ? parseFloat(valor.replace(/[^\d,]/g, "").replace(",", "."))
        : valor;
    return isNaN(num)
      ? valor
      : num.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
  };

  const gerarPDF = (dados) => {
    const doc = new jsPDF();

    // Cabeçalho do PDF
    doc.setFontSize(18);
    doc.text("Clínica Sorria Odonto", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text("CNPJ: 37.115.451/0001-84", 105, 22, { align: "center" });
    doc.setFontSize(14);
    doc.text("Prontuário do Paciente", 105, 30, { align: "center" });

    // Definindo as seções e seus campos com base na estrutura do backend
    const secoes = {
      "Dados Pessoais": [
        {
          campo: "Nome Completo",
          valor: dados.dadosPessoais?.nomeCompleto || "-",
        },
        { campo: "CPF", valor: dados.dadosPessoais?.cpf || "-" }, // CPF já virá formatado do backend
        { campo: "Telefone", valor: dados.dadosPessoais?.telefone || "-" },
        { campo: "Endereço", valor: dados.dadosPessoais?.endereco || "-" },
        {
          campo: "Data de Nascimento",
          valor: dados.dadosPessoais?.dataNascimento || "-", // Já vem formatada do backend (string)
        },
      ],
      "Histórico de Saúde": [
        { campo: "Detalhes de Doenças", valor: dados.saude?.detalhesDoencas || "-" },
        { campo: "Medicamentos em Uso", valor: dados.saude?.quaisRemedios || "-" },
        {
          campo: "Alergia a Medicamentos",
          valor: dados.saude?.quaisMedicamentos || "-",
        },
        { campo: "Alergia a Anestesias", valor: dados.saude?.quaisAnestesias || "-" },
        { campo: "Histórico Cirúrgico", valor: dados.saude?.historicoCirurgia || "-" },
        { campo: "Respiração", valor: dados.saude?.respiracao || "-" },
        { campo: "Peso (kg)", valor: dados.saude?.peso !== undefined && dados.saude?.peso !== null ? dados.saude.peso.toString() + " kg" : "-" },
      ],
      "Hábitos": [
        {
          campo: "Frequência de Fumo",
          valor: dados.saude?.habitos?.frequenciaFumo || "-",
        },
        {
          campo: "Frequência de Álcool",
          valor: dados.saude?.habitos?.frequenciaAlcool || "-",
        },
      ],
      "Exames": [
        { campo: "Exame de Sangue", valor: dados.exames?.exameSangue || "-" },
        { campo: "Coagulação", valor: dados.exames?.coagulacao || "-" },
        { campo: "Cicatrização", valor: dados.exames?.cicatrizacao || "-" },
        {
          campo: "Sangramento Pós-Procedimento",
          valor: dados.exames?.sangramentoPosProcedimento || "-",
        },
      ],
      "Histórico Odontológico": [
        {
          campo: "Histórico Odontológico",
          valor: dados.odontologico?.historicoOdontologico || "-",
        },
      ],
    };

    let y = 40; // Posição Y inicial para as tabelas

    for (const secao in secoes) {
      doc.setFontSize(12);
      doc.text(secao, 14, y);

      autoTable(doc, {
        startY: y + 5,
        head: [["Campo", "Valor"]],
        body: secoes[secao].map((item) => [item.campo, item.valor || "-"]),
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      });

      y = doc.lastAutoTable.finalY + 10;

      // Adiciona uma nova página se a próxima seção exceder o limite
      if (y > 270) {
        doc.addPage();
        y = 20; // Reset Y para a nova página
      }
    }

    // Histórico de Procedimentos (em uma nova página se necessário)
    if (y > 200) {
        doc.addPage();
        y = 20;
    } else {
        y += 10;
    }
    
    doc.setFontSize(14);
    doc.text("Histórico de Procedimentos", 105, y, { align: "center" });
    y += 10;

    if (dados.procedimentos && dados.procedimentos.length > 0) {
      dados.procedimentos.forEach((proc, index) => {
        const procedimentoData = [
          [
            "Tipo",
            proc.isPrincipal ? "Procedimento Principal" : `Procedimento #${index + 1}`,
          ],
          ["Data", proc.dataProcedimento || proc.dataNovoProcedimento || "-"], // Prioriza dataProcedimento, senão dataNovoProcedimento
          ["Procedimento", proc.procedimento || "-"],
          ["Dente/Face", proc.denteFace || "-"],
          ["Valor", formatarValor(proc.valor)],
          ["Modalidade", proc.modalidadePagamento || "-"],
          ["Profissional", proc.profissional || "-"],
        ];

        autoTable(doc, {
          startY: y,
          head: [["Campo", "Valor"]],
          body: procedimentoData,
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        });

        y = doc.lastAutoTable.finalY + 10;

        // Adiciona nova página se o próximo procedimento não couber
        if (y > 250 && index < dados.procedimentos.length - 1) {
          doc.addPage();
          y = 20;
        }
      });
    } else {
      doc.text("Nenhum procedimento registrado", 14, y);
    }

    // Abre o PDF em uma nova aba
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.formH2}>Buscar Prontuário</h2>
        <input
          type="text"
          placeholder="CPF (ex: 000.000.000-00)"
          value={cpf}
          onChange={(e) => setCpf(formatarCPF(e.target.value))}
          maxLength={14} // Limita o input ao tamanho do CPF formatado
          className={styles.formInput}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className={styles.formInput}
        />
        <button type="submit" className={styles.btnDownload}>
          <span className={styles.buttonText}>Buscar</span>
          <FaFilePdf className={styles.pdfIcon} />
        </button>
        {error && <p className={styles.error}>{error}</p>}
        {enviado && !error && (
          <p className={styles.sucesso}>Prontuário gerado com sucesso!</p>
        )}
      </form>
    </div>
  );
}

export default Prontuario;