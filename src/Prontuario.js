import React, { useState } from "react";
import api from "./api/api";
import styles from "./Prontuario.module.css";
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
      gerarPDF(response.data);
    } catch (err) {
      setEnviado(false);
      setError(err.response?.data?.message || "Erro ao buscar prontuário.");
    }
  };

  const formatarValor = (valor) => {
    if (valor === undefined || valor === null) return "-";
    const num = typeof valor === 'string' ? 
      parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) : 
      valor;
    return isNaN(num) ? valor : num.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const gerarPDF = (dados) => {
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(18);
    doc.text("Clínica Sorria Odonto", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text("CNPJ: 37.115.451/0001-84", 105, 22, { align: "center" });
    doc.setFontSize(14);
    doc.text("Prontuário do Paciente", 105, 30, { align: "center" });

    // Seções do prontuário
    const secoes = {
      "Dados Pessoais": [
        { campo: "Nome Completo", valor: dados.nomeCompleto },
        { campo: "E-mail", valor: dados.email },
        { campo: "CPF", valor: formatarCPF(dados.cpf) },
        { campo: "Telefone", valor: dados.telefone },
        { campo: "Endereço", valor: dados.endereco },
        { campo: "Data de Nascimento", valor: dados.dataNascimento ? new Date(dados.dataNascimento).toLocaleDateString("pt-BR") : "-" }
      ],
      "Histórico de Saúde": [
        { campo: "Detalhes de Doenças", valor: dados.detalhesDoencas },
        { campo: "Medicamentos em Uso", valor: dados.quaisRemedios },
        { campo: "Alergia a Medicamentos", valor: dados.quaisMedicamentos },
        { campo: "Alergia a Anestesias", valor: dados.quaisAnestesias }
      ],
      "Hábitos": [
        { campo: "Frequência de Fumo", valor: dados.habitos?.frequenciaFumo || "-" },
        { campo: "Frequência de Álcool", valor: dados.habitos?.frequenciaAlcool || "-" }
      ],
      "Exames": [
        { campo: "Exame de Sangue", valor: dados.exames?.exameSangue || "-" },
        { campo: "Coagulação", valor: dados.exames?.coagulacao || "-" },
        { campo: "Cicatrização", valor: dados.exames?.cicatrizacao || "-" }
      ],
      "Histórico Médico": [
        { campo: "Histórico Cirúrgico", valor: dados.historicoCirurgia },
        { campo: "Histórico Odontológico", valor: dados.historicoOdontologico || "-" },
        { campo: "Sangramento Pós-Procedimento", valor: dados.sangramentoPosProcedimento || "-" },
        { campo: "Respiração", valor: dados.respiracao || "-" },
        { campo: "Peso (kg)", valor: dados.peso || "-" }
      ]
    };

    let y = 40;

    // Adiciona as seções principais
    for (const secao in secoes) {
      doc.setFontSize(12);
      doc.text(secao, 14, y);
      
      const linhas = secoes[secao].map(item => [item.campo, item.valor || "-"]);
      
      autoTable(doc, {
        startY: y + 5,
        head: [["Campo", "Valor"]],
        body: linhas,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      });
      
      y = doc.lastAutoTable.finalY + 10;
    }

    // Adiciona seção de Procedimentos
    doc.addPage();
    y = 20;
    doc.setFontSize(14);
    doc.text("Histórico de Procedimentos", 105, y, { align: "center" });
    y += 10;

    if (dados.procedimentos && dados.procedimentos.length > 0) {
      dados.procedimentos.forEach((proc, index) => {
        const dataFormatada = proc.dataProcedimento ? 
          new Date(proc.dataProcedimento).toLocaleDateString("pt-BR") : "-";
        
        const procedimentoData = [
          ["Tipo", proc.isPrincipal ? "Procedimento Principal" : `Procedimento #${index + 1}`],
          ["Data", dataFormatada],
          ["Procedimento", proc.procedimento || "-"],
          ["Dente/Face", proc.denteFace || "-"],
          ["Valor", formatarValor(proc.valor)],
          ["Modalidade", proc.modalidadePagamento || "-"],
          ["Profissional", proc.profissional || "-"]
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
        
        // Adiciona nova página se necessário
        if (y > 250 && index < dados.procedimentos.length - 1) {
          doc.addPage();
          y = 20;
        }
      });
    } else {
      doc.text("Nenhum procedimento registrado", 14, y);
    }

    // Gera o PDF
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Buscar Prontuário</h2>
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(formatarCPF(e.target.value))}
          maxLength={14}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button type="submit" className={styles.btnDownload}>
          <span className={styles.buttonText}>Buscar</span>
          <FaFilePdf className={styles.pdfIcon} />
        </button>
        {error && <p className={styles.error}>{error}</p>}
        {enviado && !error && <p className={styles.sucesso}>Prontuário gerado com sucesso!</p>}
      </form>
    </div>
  );
}

export default Prontuario;