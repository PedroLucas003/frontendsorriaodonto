import React, { useState } from "react";
import api from "./api/api";
import styles from "./Prontuario.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa"; // Importando o ícone de PDF

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
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
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
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erro ao buscar prontuário.");
      }
    }
  };

  const gerarPDF = (dados) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Clínica Sorria Odonto", 105, 15, { align: "center" });

    doc.setFontSize(10);
    doc.text("CNPJ: 37.115.451/0001-84", 105, 22, { align: "center" });

    doc.setFontSize(14);
    doc.text("Prontuário do Paciente", 105, 30, { align: "center" });

    const secoes = {
      "Dados Pessoais": [
        "nomeCompleto", "email", "cpf", "telefone", "endereco", "dataNascimento", "image"
      ],
      "Saúde": [
        "detalhesDoencas", "quaisRemedios", "quaisAnestesias", "alergiaMedicamento"
      ],
      "Hábitos": [
        "habitos.frequenciaFumo", "habitos.frequenciaAlcool"
      ],
      "Exames": [
        "exames.exameSangue", "exames.coagulacao", "exames.cicatrizacao"
      ],
      "Histórico Médico e Odontológico": [
        "historicoCirurgia", "historicoOdontologico", "sangramentoPosProcedimento", "respiracao", "peso"
      ],
      "Procedimento": [
        "procedimento", "denteFace", "profissional", "dataProcedimento", "modalidadePagamento", "valor"
      ]
    };

    let y = 40;

    for (const secao in secoes) {
      const campos = secoes[secao];
      const linhas = [];

      campos.forEach((campo) => {
        if (campo === "password") return;

        let valor;
        if (campo.includes(".")) {
          const [grupo, subcampo] = campo.split(".");
          valor = dados[grupo]?.[subcampo];
        } else {
          valor = dados[campo];
        }

        if (campo === "cpf" && valor) {
          valor = formatarCPF(valor);
        }

        if (campo.toLowerCase().includes("data") && valor) {
          valor = new Date(valor).toLocaleDateString("pt-BR");
        }

        if (campo === "valor" && valor) {
          valor = `R$ ${valor.toFixed(2).replace(".", ",")}`;
        }

        linhas.push([formatarCampo(campo), valor || "-"]);
      });

      if (linhas.length > 0) {
        doc.setFontSize(12);
        doc.text(secao, 14, y);
        autoTable(doc, {
          startY: y + 2,
          head: [["Campo", "Valor"]],
          body: linhas,
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
        });
        y = doc.lastAutoTable.finalY + 10;
      }
    }

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  const formatarCampo = (campo) => {
    return campo
      .replace(/\./g, " > ")
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();
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