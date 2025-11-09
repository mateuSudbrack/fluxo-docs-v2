import { Payment, Project, MonthlyControl } from '../types';
import { formatCurrency } from './utils';

// These libraries are loaded from index.html
declare const PizZip: any;
declare const docxtemplater: any;
declare const saveAs: any;
declare const XLSX: any;

function base64ToArrayBuffer(base64: string) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Generates a real SAA .docx file using a template.
 */
export const generateSAA = (
  payment: Payment,
  project: Project,
  templateBase64: string
): void => {
  try {
    const content = base64ToArrayBuffer(templateBase64);
    
    const zip = new PizZip(content);
    const doc = new docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    const data = {
        SAA: payment.numero_saa,
        tituloProjeto: project.nome,
        tipoDespesa: payment.elemento_despesa,
        bancoPROJ: project.banco,
        agenciaPROJ: project.agencia,
        contaCorrentePROJ: project.conta_corrente,
        Nomefornecedor: payment.fornecedor.nome,
        'CNPJ/CPF_FORNECEDOR': payment.fornecedor.cnpj_cpf,
        'Banco_/_Codigo': payment.fornecedor.banco_codigo,
        'Agência': payment.fornecedor.agencia,
        'Conta_Corrente': payment.fornecedor.conta_corrente,
        PIX: payment.fornecedor.pix,
        'Tipo_de_Comprovante': payment.tipo_comprovante,
        'Nº_do_Comprovante': payment.numero_comprovante,
        ValorPagar: formatCurrency(payment.valor),
        dataAtual: new Date().toLocaleDateString('pt-BR'),
    };

    doc.setData(data);
    doc.render();

    const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    
    const fileName = `SAA_${payment.numero_saa}_${payment.fornecedor.nome.split(' ')[0]}_${new Date().toISOString().slice(0, 10)}.docx`;
    saveAs(out, fileName);
  } catch(error: any) {
      console.error("Docxtemplater error:", error);
      throw new Error("Erro ao gerar o documento DOCX. Verifique o template e os placeholders.");
  }
};

/**
 * Exports payments to a real .xlsx file using a template.
 */
export const exportToXLSX = (
    payments: Payment[],
    project: Project,
    control: MonthlyControl,
    templateBase64: string
): void => {
    try {
        const content = base64ToArrayBuffer(templateBase64);
        const workbook = XLSX.read(content, { type: 'array' });

        const targetSheetName = "Controle de Pagamentos"; 
        const worksheet = workbook.Sheets[targetSheetName];

        if (!worksheet) {
            throw new Error(`A aba "${targetSheetName}" não foi encontrada no template XLSX.`);
        }

        const dataToInsert = payments.map(p => [
            p.fornecedor.codigo,
            p.fornecedor.nome,
            p.fornecedor.cnpj_cpf,
            p.elemento_despesa,
            p.tipo_comprovante,
            p.numero_comprovante,
            p.valor,
            p.data_pagamento,
            p.numero_saa,
            p.status_saa,
            // You can add more vendor details if your template requires it
            p.fornecedor.banco_codigo,
            p.fornecedor.agencia,
            p.fornecedor.conta_corrente,
            p.fornecedor.pix,
        ]);
        
        // Assuming data starts at row 2 (A2) of the template
        XLSX.utils.sheet_add_aoa(worksheet, dataToInsert, { origin: 'A2' });

        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        
        const fileName = `Pagamentos_${project.nome}_${control.mes}-${control.ano}.xlsx`;
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
    } catch(error: any) {
        console.error("XLSX generation error:", error);
        throw new Error("Erro ao gerar a planilha XLSX. Verifique se o template é válido e contém a aba 'Controle de Pagamentos'.");
    }
}