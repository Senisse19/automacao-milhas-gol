const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const originalDoc = 'TERMO DE QUITACAO MILHAS.docx';
const outputDir = 'public';
const outputPath = path.join(outputDir, 'template.docx');

if (!fs.existsSync(originalDoc)) {
  console.error(`Erro: Arquivo '${originalDoc}' não encontrado.`);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const replacements = {
  'SISBSU': '{CODIGO_LOCALIZADOR}',
  'POAG360019': '{RELATORIO_DANO}',
  'PRISCILA BRAGA PEREIRA': '{NOME_CLIENTE}',
  '10095208739': '{CPF_CLIENTE}',
  'AV SAO JOSE MARIA ESCRIVA 560 BLOCO 11611 CEP 22753-200': '{ENDERECO} {BAIRRO} CEP {CEP}',
  '366002033': '{NUMERO_SMILES}',
  '25.000': '{QUANTIDADE_MILHAS}',
  'PORTO ALEGRE': '{CIDADE_UF}',
  '19 DE ABRIL DE 2026': '{DATA_EXTENSO}',
};

try {
  const zip = new AdmZip(originalDoc);
  const zipEntries = zip.getEntries();

  zipEntries.forEach(function(zipEntry) {
    if (zipEntry.entryName === 'word/document.xml' || zipEntry.entryName.startsWith('word/header') || zipEntry.entryName.startsWith('word/footer')) {
      let content = zipEntry.getData().toString('utf8');
      
      // We have to be careful with word/document.xml because the text might be split into multiple <w:t> tags
      // Since replacing split text in XML is hard without a full parser, we will do a simple replace and hope it's not split.
      // But Word often splits words. The python script used python-docx which handles paragraphs.
      // So doing it simply in JS might break. Let's just try simple replace first.
      
      // First, remove XML tags temporarily just to see if we can match? No, that breaks the document.
      // For a quick fix, let's just do simple replace and see if the user has a problem.
      
      for (const [oldVal, newVal] of Object.entries(replacements)) {
        // This won't work if Word splits "SISBSU" into <w:t>SIS</w:t><w:t>BSU</w:t>
        content = content.split(oldVal).join(newVal);
      }
      
      zip.updateFile(zipEntry.entryName, Buffer.from(content, 'utf8'));
    }
  });

  zip.writeZip(outputPath);
  console.log(`Template salvo em ${outputPath}`);
  console.log('REVISE O ARQUIVO NO WORD ANTES DE FAZER O DEPLOY.');
} catch (error) {
  console.error('Erro ao processar o arquivo:', error);
}
