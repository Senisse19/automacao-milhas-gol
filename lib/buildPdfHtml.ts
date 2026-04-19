import { TermoData } from "./generateDocx";

/**
 * Gera o HTML completo do Termo de Quitação replicando fielmente o layout do DOCX.
 * Usa os dados do formulário diretamente — sem dependência de docx-preview.
 * O HTML resultante é inserido no DOM e impresso via window.print().
 */
export function buildPdfHtml(data: TermoData, logoUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="color-scheme" content="only light">
  <style>
    /* Reset e fonte base — Arial como no DOCX */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html {
      color-scheme: only light;
      background: white;
    }

    body {
      font-family: Arial, 'Helvetica Neue', sans-serif;
      font-size: 9.5pt; /* Ajustado para melhor legibilidade */
      color: #000;
      background: white;
      width: 100%;
      -webkit-print-color-adjust: exact;
    }

    /* Container principal para controlar as margens reais do DOCX */
    .page-container {
      width: 210mm;
      min-height: 297mm;
      padding: 1.2cm 1.8cm 1.5cm 1.8cm; /* Margens levemente reduzidas */
      margin: 0 auto;
      position: relative;
      background: white;
      overflow: visible;
    }

    /* ─── CABEÇALHO ─────────────────────────────────────────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20pt;
      padding-bottom: 5pt;
      border-bottom: 0.8pt solid #333;
    }

    .header-logo img {
      width: 100pt;   
      height: auto;
      display: block;
    }

    .header-info {
      text-align: right;
      font-size: 8.5pt;
      color: #000;
      line-height: 1.3;
    }

    .header-info .company-name {
      font-weight: bold;
      margin-bottom: 2pt;
    }

    .header-locator {
      margin-top: 8pt;
      font-size: 9pt;
      font-weight: bold;
      line-height: 1.4;
    }

    /* ─── CORPO DO DOCUMENTO ─────────────────────────────────────────── */
    .body-text {
      font-size: 9.5pt;
      line-height: 1.25; /* Ajustado para caber em 1 página */
      text-align: justify;
      margin-bottom: 8pt;
      color: #000;
    }

    .body-text ul {
      padding-left: 25pt;
      margin: 0 0 8pt 0;
    }

    .body-text li {
      margin-bottom: 2pt;
    }

    /* ─── ASSINATURAS ────────────────────────────────────────────────── */
    .signatures {
      margin-top: 25pt; /* Reduzido para subir as assinaturas */
      display: flex;
      justify-content: space-between;
      gap: 40pt;
    }

    .signature-block {
      flex: 1;
      text-align: center;
    }

    .signature-block .line {
      border-top: 0.8pt solid #000;
      padding-top: 6pt;
      font-size: 8.5pt;
      font-weight: bold;
      text-transform: uppercase;
    }

    /* ─── CONFIGURAÇÃO DE IMPRESSÃO A4 ──────────────────────────────── */
    @media print {
      html, body {
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 0;
      }
      .page-container {
        margin: 0;
        border: none;
        box-shadow: none;
      }
      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="page-container">

  <!-- CABEÇALHO: logo esquerda + endereço direita -->
  <div class="header">
    <div class="header-logo">
      <img src="${logoUrl}" alt="GOL Logo">
    </div>
    <div class="header-info">
      <div class="company-name">GOL Linhas Aéreas S.A.</div>
      <div>Praça Cmte. Linneu Gomes, s/n&ordm; Portaria 3</div>
      <div>Jardim Aeroporto CEP 04626-020</div>
      <div>São Paulo/SP</div>
      <div class="header-locator">
        Código Localizador: ${data.CODIGO_LOCALIZADOR}<br>
        Relatório de Dano de Bagagem: ${data.RELATORIO_DANO}
      </div>
    </div>
  </div>

  <!-- PARÁGRAFO 1 — Identificação das partes -->
  <p class="body-text">
    De um lado <strong>GOL LINHAS AÉREAS S.A.</strong>, empresa com sede na Avenida Vinte de Janeiro,
    terminal de passageiros n°. 1 do Aeroporto Internacional do Rio de Janeiro / Galeão /,
    Antônio Carlos Jobim, 2&ordm;andar, nível 15,55 entre os eixos 10-12/E-G, sala 2011-A,
    Embarque, CEP 91720-160, inscrita no NPJ/MF sob o n°. 07.575.651/0001-59, e, de outro
    o Sr. ou Sra. <strong>${data.NOME_CLIENTE}</strong> portador do CPF n&ordm;
    ${data.CPF_CLIENTE} residente à ${data.ENDERECO} CEP ${data.CEP} bairro
    ${data.BAIRRO} cidade ${data.CIDADE_UF} infra-assinados, acordam entre si, o quanto segue:
  </p>

  <!-- PARÁGRAFO 2 — Concessão das milhas -->
  <p class="body-text">
    A GOL Linhas Aéreas S.A., concederá ao Sr. ou Sra. <strong>${data.NOME_RECEBEDOR}</strong>
    portador do número Smiles <strong>${data.NUMERO_SMILES}</strong> a quantia de
    <strong>${data.QUANTIDADE_MILHAS} (MILHAS)</strong> para utilização no programa Smiles;
    O crédito em milhas será realizado na conta Smiles vinculada ao CPF
    <strong>${data.CPF_SMILES}</strong> informado pela cliente, sendo de uso pessoal,
    intransferível e exclusivo e terá validade de 05 anos a contar de sua concessão,
    expirando após este período;
  </p>

  <!-- PARÁGRAFO 3 — Utilização das milhas -->
  <p class="body-text">As milhas recebidas poderão ser utilizadas pelo cliente, dentro do prazo de validade, para:</p>
  <div class="body-text">
    <ul>
      <li>Emissão de passagens aéreas GOL ou companhias parceiras disponíveis no Programa Smiles;</li>
      <li>Pagamento parcial ou total de passagens através do recurso Smiles &amp; Money;</li>
      <li>Aquisição de produtos, serviços e experiências ofertados no site/aplicativo Smiles;</li>
      <li>Transferência para parceiros autorizados pelo Programa Smiles, respeitando as regras vigentes.</li>
    </ul>
  </div>

  <!-- PARÁGRAFO 4 — Restrições das milhas -->
  <p class="body-text">As milhas recebidas:</p>
  <div class="body-text">
    <ul>
      <li>Não podem ser convertidas em dinheiro, total ou parcialmente;</li>
      <li>Não podem ser revendidas ou comercializadas, sob pena de cancelamento;</li>
      <li>Não podem ser transferidas a terceiros;</li>
      <li>Não garantem disponibilidade de assentos ou produtos, estando sujeitas às condições
          e tabelas de resgate vigentes no momento da utilização;</li>
      <li>Não isentam o cliente de taxas adicionais, como taxas de embarque, serviços opcionais
          e diferenças tarifárias, quando aplicável.</li>
    </ul>
  </div>

  <!-- PARÁGRAFO 5 — Irrevogabilidade do crédito -->
  <p class="body-text">
    Após adesão de produtos ou serviços GOL com o crédito não será permitido alteração e, em caso
    de desistência ou não utilização do produto ou serviço, o valor não será reembolsado.
  </p>

  <!-- PARÁGRAFO 6 — Proibição de comercialização -->
  <p class="body-text">
    As partes declaram estar cientes da proibição expressa de comercialização das reservas oriundas
    do presente acordo, sob pena de caracterização de descumprimento do acordo, sem direito a nenhum
    tipo de compensação ou conversão em perdas e danos. Caso seja constatada a tentativa ou a
    comercialização, as reservas serão canceladas sem prévio aviso, além da perda irrestrita das
    demais reservas oriundas do presente acordo (emitidas ou pendentes de emissão), sem prejuízo
    do arbitramento da multa de litigância de má-fé
  </p>

  <!-- PARÁGRAFO 7 — Prazo para crédito -->
  <p class="body-text">
    Após a assinatura deste termo de quitação, o crédito será disponibilizado em até 07 dias úteis
    na conta cadastrada no site Smiles.
  </p>

  <!-- PARÁGRAFO 8 — Quitação plena -->
  <p class="body-text">
    Com o presente acordo o Sr. ou Sra. <strong>${data.NOME_CLIENTE}</strong> outorga à GOL Linhas
    Aéreas S.A., a mais plena, ampla, irrevogável e irretratável quitação do objeto do presente
    acordo, bem como para todos os danos materiais e morais, lucros cessantes e/ou emergentes e
    quaisquer outros decorrentes do(s) transtorno(s) ocorrido(s), que deu causa ao presente acordo,
    para mais nada reclamarem as partes, a qualquer título, em Juízo ou fora dele, abrangendo todos
    os passageiros envolvidos na reserva indicada.
  </p>

  <!-- LOCAL E DATA -->
  <p class="body-text">${data.CIDADE_UF}, ${data.DATA_EXTENSO}</p>

  <!-- ASSINATURAS -->
  <div class="signatures">
    <div class="signature-block">
      <div class="line">GOL LINHAS AEREAS S.A.</div>
    </div>
    <div class="signature-block">
      <div class="line">ASSINATURA DO CLIENTE</div>
    </div>
  </div>

  </div>
</body>
</html>
  `.trim();
}
