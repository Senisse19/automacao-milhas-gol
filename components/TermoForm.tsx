"use client";

import React, { useState, useEffect } from "react";
import { generateTermo, TermoData } from "@/lib/generateDocx";
import { buildPdfHtml } from "@/lib/buildPdfHtml";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";

registerLocale("pt-BR", ptBR);
function dataAtualPorExtenso(isoDate?: string): string {
  // Se passar isoDate (YYYY-MM-DD), usaremos 12:00:00 para evitar problemas de fuso
  const dateObj = isoDate ? new Date(isoDate + "T12:00:00") : new Date();
  const dia = dateObj.getDate();
  const mes = dateObj.toLocaleString("pt-BR", { month: "long" }).toUpperCase();
  const ano = dateObj.getFullYear();
  return `${dia} DE ${mes} DE ${ano}`;
}

function maskCpf(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

function unmaskCpf(value: string): string {
  return value.replace(/\D/g, "");
}

function maskCep(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
}

function maskMilhas(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  return parseInt(numbers, 10).toLocaleString("pt-BR");
}

export default function TermoForm() {
  const [formData, setFormData] = useState({
    CODIGO_LOCALIZADOR: "",
    RELATORIO_DANO: "",
    NOME_CLIENTE: "",
    CPF_CLIENTE: "",
    ENDERECO: "",
    BAIRRO: "",
    CEP: "",
    CIDADE_UF: "",
    NOME_RECEBEDOR: "",
    NUMERO_SMILES: "",
    QUANTIDADE_MILHAS: "",
    CPF_SMILES: "",
    DATA_RESERVA: "", // mantido apenas por compatibilidade com TermoData
  });

  // Estado separado para o datepicker (Date | null) — evita loop infinito de re-render
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Define a data de hoje no mount (eslint: suppress setState-in-effect poisé necessário para evitar hydration mismatch)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedDate(new Date());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = name !== "DATA_RESERVA" ? value.toUpperCase() : value;

    if (name === "CPF_CLIENTE" || name === "CPF_SMILES") {
      newValue = maskCpf(newValue);
    } else if (name === "CEP") {
      newValue = maskCep(newValue);
    } else if (name === "QUANTIDADE_MILHAS") {
      newValue = maskMilhas(newValue);
    } else if (name === "NUMERO_SMILES") {
      newValue = newValue.replace(/\D/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.CODIGO_LOCALIZADOR) newErrors.CODIGO_LOCALIZADOR = "Obrigatório";
    if (!formData.RELATORIO_DANO) newErrors.RELATORIO_DANO = "Obrigatório";
    if (!formData.NOME_CLIENTE) newErrors.NOME_CLIENTE = "Obrigatório";
    if (!formData.ENDERECO) newErrors.ENDERECO = "Obrigatório";
    if (!formData.BAIRRO) newErrors.BAIRRO = "Obrigatório";
    if (!formData.CIDADE_UF) newErrors.CIDADE_UF = "Obrigatório";
    if (!formData.NOME_RECEBEDOR) newErrors.NOME_RECEBEDOR = "Obrigatório";
    if (!selectedDate) newErrors.DATA_RESERVA = "Obrigatório";

    const cpfClienteLimpo = unmaskCpf(formData.CPF_CLIENTE);
    if (cpfClienteLimpo.length !== 11) newErrors.CPF_CLIENTE = "Deve ter 11 dígitos";

    const cpfSmilesLimpo = unmaskCpf(formData.CPF_SMILES);
    if (cpfSmilesLimpo.length !== 11) newErrors.CPF_SMILES = "Deve ter 11 dígitos";

    const cepLimpo = formData.CEP.replace(/\D/g, "");
    if (cepLimpo.length !== 8) newErrors.CEP = "Deve ter 8 dígitos";

    if (formData.NUMERO_SMILES.length === 0 || formData.NUMERO_SMILES.length > 9) newErrors.NUMERO_SMILES = "Até 9 dígitos";
    if (!formData.QUANTIDADE_MILHAS || formData.QUANTIDADE_MILHAS === "0") newErrors.QUANTIDADE_MILHAS = "Inválido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateDocx = async () => {
    setSuccessMsg("");
    if (!validate()) {
      alert("Por favor, preencha todos os campos corretamente. Verifique os avisos em vermelho no formulário.");
      return;
    }
    setIsGenerating(true);

    try {
      const isoDate = selectedDate
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
        : "";
      const dataToGenerate: TermoData = {
        ...formData,
        CPF_CLIENTE: unmaskCpf(formData.CPF_CLIENTE),
        CPF_SMILES: unmaskCpf(formData.CPF_SMILES),
        DATA_EXTENSO: dataAtualPorExtenso(isoDate),
      };

      await generateTermo(dataToGenerate);
      setSuccessMsg("Documento DOCX gerado com sucesso.");
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Verifique o console.";
      alert(`Ocorreu um erro: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePdf = async () => {
    setSuccessMsg("");
    if (!validate()) {
      alert("Por favor, preencha todos os campos corretamente. Verifique os avisos em vermelho no formulário.");
      return;
    }
    setIsGenerating(true);

    try {
      const isoDate2 = selectedDate
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
        : "";

      // Monta os dados do formulário com formatação final
      const dataToGenerate: TermoData = {
        ...formData,
        CPF_CLIENTE: unmaskCpf(formData.CPF_CLIENTE),
        CPF_SMILES: unmaskCpf(formData.CPF_SMILES),
        DATA_EXTENSO: dataAtualPorExtenso(isoDate2),
      };

      // Carrega a logo GOL como base64 para embed no HTML (sem dependência de servidor)
      const logoResp = await fetch("/logo.png");
      const logoBlob = await logoResp.blob();
      const logoBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(logoBlob);
      });

      // Gera o HTML do documento idêntico ao layout do DOCX
      const htmlContent = buildPdfHtml(dataToGenerate, logoBase64);

      // Insere o HTML renderizado no DOM principal para impressão
      // (position:absolute abaixo do viewport = layout calculado, mas invisível ao usuário)
      const printDiv = document.createElement("div");
      printDiv.id = "__pdf_target__";
      printDiv.style.cssText = "position:absolute;top:9999px;left:0;width:100%;background:white;";
      printDiv.innerHTML = htmlContent;
      document.body.appendChild(printDiv);

      // Injeta estilo de impressão: esconde TUDO exceto o documento
      const printStyle = document.createElement("style");
      printStyle.id = "__pdf_style__";
      printStyle.textContent = `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body > *:not(#__pdf_target__) { display: none !important; }
          #__pdf_target__ {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background: white !important;
            display: block !important;
          }
        }
      `;
      document.head.appendChild(printStyle);

      // Pequena espera para garantir que a logo carregou antes de imprimir
      await new Promise<void>((resolve) => setTimeout(resolve, 400));
      window.print();

      // Limpeza após o diálogo de impressão fechar
      const cleanup = () => {
        document.getElementById("__pdf_target__")?.remove();
        document.getElementById("__pdf_style__")?.remove();
      };
      window.addEventListener("afterprint", cleanup, { once: true });
      setTimeout(cleanup, 15000); // safety fallback

      setSuccessMsg("Janela de impressão aberta. Salve como PDF no diálogo do browser.");
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
      alert(`Ocorreu um erro: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setFormData({
      CODIGO_LOCALIZADOR: "",
      RELATORIO_DANO: "",
      NOME_CLIENTE: "",
      CPF_CLIENTE: "",
      ENDERECO: "",
      BAIRRO: "",
      CEP: "",
      CIDADE_UF: "",
      NOME_RECEBEDOR: "",
      NUMERO_SMILES: "",
      QUANTIDADE_MILHAS: "",
      CPF_SMILES: "",
      DATA_RESERVA: "",
    });
    setSelectedDate(new Date());
    setErrors({});
    setSuccessMsg("");
  };

  const renderInputField = (label: string, name: keyof typeof formData, placeholder = "", helperText = "", type = "text") => (
    <div className="flex flex-col gap-1.5 mb-6 relative group">
      <label htmlFor={name} className="text-xs font-bold text-gol-dark uppercase tracking-wide group-focus-within:text-gol-orange transition-colors">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        style={type === "text" ? { textTransform: "uppercase" } : undefined}
        className={`bg-white border ${errors[name] ? 'border-red-500 ring-1 ring-red-500' : 'border-gol-border'} rounded-lg text-gol-dark px-4 py-3 outline-none focus:border-gol-orange focus:ring-1 focus:ring-gol-orange transition-all font-medium placeholder:text-gol-gray/50 shadow-sm`}
      />
      {helperText && <span className="text-xs text-gol-gray mt-1">{helperText}</span>}
      {errors[name] && <span className="text-xs text-red-500 mt-1 font-bold absolute -bottom-5 left-0">{errors[name]}</span>}
    </div>
  );

  return (
    <form className="w-full">
      
      {/* SECTION 1 */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gol-border">
          <div className="bg-gol-orange text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="text-xl text-gol-dark font-bold">Signatário e Caso</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {renderInputField("Código Localizador", "CODIGO_LOCALIZADOR", "Ex: SISBSU")}
          {renderInputField("Relatório de Dano de Bagagem", "RELATORIO_DANO", "Ex: POAG360019")}
          {renderInputField("Nome do Cliente (Signatário)", "NOME_CLIENTE", "")}
          {renderInputField("CPF do Cliente", "CPF_CLIENTE", "000.000.000-00")}
          <div className="md:col-span-2">
            {renderInputField("Endereço", "ENDERECO", "")}
          </div>
          {renderInputField("Bairro", "BAIRRO", "")}
          {renderInputField("CEP", "CEP", "")}
          {renderInputField("Cidade/UF", "CIDADE_UF", "")}
        </div>
      </div>

      {/* SECTION 2 */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gol-border">
          <div className="bg-gol-orange text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="text-xl text-gol-dark font-bold">Beneficiário (Smiles)</h3>
        </div>
        
        <div className="bg-gol-light p-5 rounded-xl mb-6 border border-gol-border text-sm text-gol-dark flex items-start gap-4">
          <div className="text-gol-orange text-xl shrink-0 mt-0.5">ℹ️</div>
          <p>
            <strong>Atenção:</strong> A pessoa que recebe as milhas pode ser diferente de quem assina o termo. O CPF abaixo deve estar vinculado à conta smiles do beneficiário.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {renderInputField("Nome do Beneficiário", "NOME_RECEBEDOR", "", "Titular da conta Smiles.")}
          {renderInputField("Número Smiles", "NUMERO_SMILES", "")}
          {renderInputField("Valor (Milhas)", "QUANTIDADE_MILHAS", "25.000")}
          {renderInputField("CPF", "CPF_SMILES", "000.000.000-00")}
        </div>
      </div>

      {/* SECTION 3 */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gol-border">
          <div className="bg-gol-gray text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="text-xl text-gol-dark font-bold">Data do Documento</h3>
        </div>
        
        <div className="max-w-md">
          <div className="flex flex-col gap-1.5 mb-6 relative group">
            <label className="text-xs font-bold text-gol-dark uppercase tracking-wide group-focus-within:text-gol-orange transition-colors">
              Data da Quitação
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              locale="pt-BR"
              placeholderText="Selecione uma data"
              isClearable
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              className={`w-full bg-white border ${errors.DATA_RESERVA ? 'border-red-500 ring-1 ring-red-500' : 'border-gol-border'} rounded-lg text-gol-dark px-4 py-3 outline-none focus:border-gol-orange focus:ring-1 focus:ring-gol-orange transition-all font-medium placeholder:text-gol-gray/50 shadow-sm`}
            />
            {errors.DATA_RESERVA && (
              <span className="text-xs text-red-500 mt-1 font-bold absolute -bottom-5 left-0">
                {errors.DATA_RESERVA}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between pt-8 border-t border-gol-border">
        <button
          type="button"
          onClick={handleClear}
          className="text-gol-gray hover:text-gol-dark font-semibold transition-colors text-sm uppercase tracking-wide cursor-pointer py-3 px-6 rounded-full hover:bg-gol-light"
        >
          Limpar Formulário
        </button>
        
        <div className="w-full sm:w-auto flex flex-col items-center sm:items-end">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="button"
              onClick={handleGenerateDocx}
              disabled={isGenerating}
              className={`
                ${isGenerating ? 'bg-gol-gray cursor-not-allowed' : 'bg-gol-orange hover:bg-orange-600 shadow-md hover:shadow-lg cursor-pointer'}
                text-white px-8 py-4 rounded-full font-bold transition-all text-sm uppercase tracking-wide w-full sm:w-auto
              `}
            >
              Gerar DOCX
            </button>
            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className={`
                ${isGenerating ? 'bg-gol-gray cursor-not-allowed' : 'bg-gol-dark hover:bg-gray-800 shadow-md hover:shadow-lg cursor-pointer'}
                text-white px-8 py-4 rounded-full font-bold transition-all text-sm uppercase tracking-wide w-full sm:w-auto
              `}
            >
              Baixar PDF
            </button>
          </div>
          
          {successMsg && (
            <div className="text-green-600 text-sm font-bold mt-4 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              ✓ {successMsg}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
