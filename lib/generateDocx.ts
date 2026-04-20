import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export interface TermoData {
  // Grupo 1 — Dados do caso e do cliente signatário
  CODIGO_LOCALIZADOR: string;
  RELATORIO_DANO: string;
  NOME_CLIENTE: string;
  CPF_CLIENTE: string;
  ENDERECO: string;
  BAIRRO: string;
  CEP: string;
  CIDADE_UF: string;
  // Grupo 2 — Dados do recebedor das milhas
  NOME_RECEBEDOR: string;
  NUMERO_SMILES: string;
  QUANTIDADE_MILHAS: string;
  CPF_SMILES: string;
  // Gerado automaticamente
  DATA_EXTENSO: string;
}

/**
 * Preenche o template.docx com os dados e retorna o Blob resultante.
 * Usado tanto para download do DOCX quanto para geração do PDF.
 */
export async function buildTermoBlob(data: TermoData): Promise<Blob> {
  const response = await fetch("/template.docx");
  if (!response.ok) throw new Error("Falha ao carregar o template do documento.");

  const arrayBuffer = await response.arrayBuffer();
  const zip = new PizZip(arrayBuffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Cria uma cópia dos dados para normalização de tags
  // Isso garante que {NOME_CLIENTE}, {nome_cliente} e {nomecliente} funcionem
  const normalizedData: Record<string, string> = { ...data };
  (Object.keys(data) as Array<keyof TermoData>).forEach((key) => {
    const val = data[key];
    normalizedData[key.toLowerCase()] = val;
    normalizedData[key.replace(/_/g, "")] = val;
    normalizedData[key.toLowerCase().replace(/_/g, "")] = val;
  });

  console.log("Dados normalizados enviados para o DOCX:", normalizedData);
  
  try {
    doc.render(normalizedData);
  } catch (error) {
    console.error("Erro ao renderizar DOCX:", error);
    throw error;
  }

  return doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });
}

/** 
 * Remove acentos e caracteres especiais para evitar problemas no Word/Windows 
 */
function sanitizeFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-zA-Z0-9._-]/g, "_"); // Substitui o que não for seguro por underscore
}

/** Gera e faz o download do DOCX preenchido. */
export async function generateTermo(data: TermoData): Promise<void> {
  const blob = await buildTermoBlob(data);

  const nomeLimpo = sanitizeFilename(data.NOME_CLIENTE);
  const nomeArquivo = `Termo_${nomeLimpo}_${data.CODIGO_LOCALIZADOR}.docx`;
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
