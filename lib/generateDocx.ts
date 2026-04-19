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

  doc.render(data);

  return doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/** Gera e faz o download do DOCX preenchido. */
export async function generateTermo(data: TermoData): Promise<void> {
  const blob = await buildTermoBlob(data);

  const nomeArquivo = `Termo_${data.NOME_CLIENTE.replace(/\s+/g, "_")}_${data.CODIGO_LOCALIZADOR}.docx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
