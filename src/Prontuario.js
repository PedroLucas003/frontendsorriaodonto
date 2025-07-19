import React, { useState } from "react";
import api from "./api/api";
import styles from "./Prontuario.module.css"; // Importa o CSS ESPECÍFICO para Prontuário
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";

function Prontuario() {
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .substring(0, 14);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cpf || !senha) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const cleanedCPF = cpf.replace(/\D/g, "");

      const response = await api.post("/api/prontuario", {
        cpf: cleanedCPF,
        password: senha,
      });

      setError("");
      setEnviado(true);
      // O backend retorna os dados do prontuário em response.data.data
      gerarPDF(response.data.data);
    } catch (err) {
      setEnviado(false);
      setError(err.response?.data?.message || "Erro ao buscar prontuário.");
    }
  };

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
          valor: dados.dadosPessoais?.nomeCompleto,
        },
        { campo: "CPF", valor: formatarCPF(dados.dadosPessoais?.cpf) },
        { campo: "Telefone", valor: dados.dadosPessoais?.telefone },
        { campo: "Endereço", valor: dados.dadosPessoais?.endereco },
        {
          campo: "Data de Nascimento",
          valor: dados.dadosPessoais?.dataNascimento, // Já vem formatada do backend
        },
      ],
      "Histórico de Saúde": [
        { campo: "Detalhes de Doenças", valor: dados.saude?.detalhesDoencas },
        { campo: "Medicamentos em Uso", valor: dados.saude?.quaisRemedios },
        {
          campo: "Alergia a Medicamentos",
          valor: dados.saude?.quaisMedicamentos,
        },
        { campo: "Alergia a Anestesias", valor: dados.saude?.quaisAnestesias },
        { campo: "Histórico Cirúrgico", valor: dados.saude?.historicoCirurgia },
        { campo: "Respiração", valor: dados.saude?.respiracao },
        { campo: "Peso (kg)", valor: dados.saude?.peso },
      ],
      "Hábitos": [
        {
          campo: "Frequência de Fumo",
          valor: dados.saude?.habitos?.frequenciaFumo,
        },
        {
          campo: "Frequência de Álcool",
          valor: dados.saude?.habitos?.frequenciaAlcool,
        },
      ],
      "Exames": [
        { campo: "Exame de Sangue", valor: dados.exames?.exameSangue },
        { campo: "Coagulação", valor: dados.exames?.coagulacao },
        { campo: "Cicatrização", valor: dados.exames?.cicatrizacao },
        {
          campo: "Sangramento Pós-Procedimento",
          valor: dados.exames?.sangramentoPosProcedimento,
        },
      ],
      "Histórico Odontológico": [
        {
          campo: "Histórico Odontológico",
          valor: dados.odontologico?.historicoOdontologico,
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
    if (y > 200) { // Se a última seção de dados pessoais já estiver alta, adicione nova página
        doc.addPage();
        y = 20;
    } else {
        y += 10; // Adiciona um pequeno espaçamento se estiver na mesma página
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
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(formatarCPF(e.target.value))}
          maxLength={14}
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