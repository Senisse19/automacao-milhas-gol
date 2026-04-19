"use client";

import React, { useState, useEffect } from "react";
import { generateTermo, TermoData } from "@/lib/generateDocx";

function dataAtualPorExtenso(): string {
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.toLocaleString("pt-BR", { month: "long" }).toUpperCase();
  const ano = hoje.getFullYear();
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
    DATA_EXTENSO: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => ({ ...prev, DATA_EXTENSO: dataAtualPorExtenso() }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value.toUpperCase();

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
    if (!formData.DATA_EXTENSO) newErrors.DATA_EXTENSO = "Obrigatório";

    const cpfClienteLimpo = unmaskCpf(formData.CPF_CLIENTE);
    if (cpfClienteLimpo.length !== 11) newErrors.CPF_CLIENTE = "Deve ter 11 dígitos";

    const cpfSmilesLimpo = unmaskCpf(formData.CPF_SMILES);
    if (cpfSmilesLimpo.length !== 11) newErrors.CPF_SMILES = "Deve ter 11 dígitos";

    const cepLimpo = formData.CEP.replace(/\D/g, "");
    if (cepLimpo.length !== 8) newErrors.CEP = "Deve ter 8 dígitos";

    if (formData.NUMERO_SMILES.length < 8) newErrors.NUMERO_SMILES = "Mínimo 8 dígitos";
    if (!formData.QUANTIDADE_MILHAS || formData.QUANTIDADE_MILHAS === "0") newErrors.QUANTIDADE_MILHAS = "Inválido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");

    if (!validate()) {
      alert("Por favor, preencha todos os campos corretamente. Verifique os avisos em vermelho no formulário.");
      return;
    }

    setIsGenerating(true);

    try {
      const dataToGenerate: TermoData = {
        ...formData,
        CPF_CLIENTE: unmaskCpf(formData.CPF_CLIENTE),
        CPF_SMILES: unmaskCpf(formData.CPF_SMILES),
      };

      await generateTermo(dataToGenerate);
      setSuccessMsg("Documento gerado com sucesso.");
    } catch (error: any) {
      console.error(error);
      alert(`Ocorreu um erro: ${error.message || "Verifique o console."}`);
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
      DATA_EXTENSO: dataAtualPorExtenso(),
    });
    setErrors({});
    setSuccessMsg("");
  };

  const renderInputField = (label: string, name: keyof typeof formData, placeholder = "", helperText = "") => (
    <div className="flex flex-col gap-1 mb-8 relative group">
      <label htmlFor={name} className="text-[10px] font-bold text-gol-gray tracking-widest uppercase transition-colors group-focus-within:text-gol-orange">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ textTransform: "uppercase" }}
        className={`bg-transparent border-b-2 ${errors[name] ? 'border-red-500' : 'border-gol-dark/20'} text-gol-dark py-2 outline-none focus:border-gol-orange transition-all font-medium placeholder:text-gol-dark/20`}
      />
      {helperText && <span className="text-[11px] text-gol-gray mt-2 leading-tight">{helperText}</span>}
      {errors[name] && <span className="text-[11px] text-red-500 mt-1 font-bold absolute -bottom-5 left-0">{errors[name]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      
      {/* CARD 1 */}
      <div className="mb-16">
        <h3 className="text-2xl text-gol-dark font-normal mb-8 pb-4 border-b-2 border-gol-dark flex items-baseline gap-4">
          <span className="text-gol-orange font-bold text-lg">01</span>
          Signatário e Caso
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {renderInputField("Código Localizador", "CODIGO_LOCALIZADOR", "Ex: SISBSU")}
          {renderInputField("Relatório de Dano de Bagagem", "RELATORIO_DANO", "Ex: POAG360019")}
          {renderInputField("Nome do Cliente (Signatário)", "NOME_CLIENTE", "", "Pessoa que irá assinar o documento.")}
          {renderInputField("CPF do Cliente", "CPF_CLIENTE", "000.000.000-00")}
          <div className="md:col-span-2">
            {renderInputField("Endereço", "ENDERECO", "RUA PADRE CHAGAS, 100")}
          </div>
          {renderInputField("Bairro", "BAIRRO", "MOINHOS DE VENTO")}
          {renderInputField("CEP", "CEP", "90570-080")}
          {renderInputField("Cidade/UF", "CIDADE_UF", "PORTO ALEGRE/RS")}
        </div>
      </div>

      {/* CARD 2 */}
      <div className="mb-16">
        <h3 className="text-2xl text-gol-dark font-normal mb-8 pb-4 border-b-2 border-gol-dark flex items-baseline gap-4">
          <span className="text-gol-orange font-bold text-lg">02</span>
          Beneficiário (Smiles)
        </h3>
        
        <div className="bg-gol-light p-6 mb-8 border-l-4 border-gol-orange text-sm text-gol-dark">
          <strong>Atenção:</strong> A pessoa que recebe as milhas pode ser diferente de quem assina o termo. O CPF abaixo deve ser o vinculado à conta Smiles.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {renderInputField("Nome do Recebedor de Milhas", "NOME_RECEBEDOR", "", "Titular da conta Smiles.")}
          {renderInputField("Número Smiles", "NUMERO_SMILES", "123456789")}
          {renderInputField("Valor (Milhas)", "QUANTIDADE_MILHAS", "25.000")}
          {renderInputField("CPF (Vinculado ao Smiles)", "CPF_SMILES", "000.000.000-00")}
        </div>
      </div>

      {/* CARD 3 - DATA */}
      <div className="mb-16">
        <h3 className="text-2xl text-gol-dark font-normal mb-8 pb-4 border-b-2 border-gol-dark flex items-baseline gap-4">
          <span className="text-gol-gray font-bold text-lg">03</span>
          Data do Documento
        </h3>
        
        <div className="max-w-xs">
          {renderInputField("Data por Extenso", "DATA_EXTENSO")}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between pt-8 border-t border-gol-dark/10">
        <button
          type="button"
          onClick={handleClear}
          className="text-gol-gray hover:text-gol-dark font-bold transition-colors text-xs uppercase tracking-widest cursor-pointer"
        >
          Limpar Formulário
        </button>
        
        <div className="w-full sm:w-auto flex flex-col items-end">
          <button
            type="submit"
            disabled={isGenerating}
            className={`
              ${isGenerating ? 'bg-gol-gray cursor-not-allowed' : 'bg-gol-orange hover:bg-gol-dark cursor-pointer'}
              text-white px-12 py-5 font-bold transition-all text-sm uppercase tracking-widest w-full sm:w-auto
            `}
          >
            {isGenerating ? "Gerando..." : "Gerar Documento"}
          </button>
          
          {successMsg && (
            <div className="text-green-600 text-xs font-bold uppercase tracking-widest mt-4">
              {successMsg}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
