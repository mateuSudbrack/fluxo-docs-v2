export interface Vendor {
  id: number;
  codigo: string;
  nome: string;
  cnpj_cpf: string;
  banco_codigo?: string;
  agencia?: string;
  conta_corrente?: string;
  pix?: string;
}

export interface Project {
  id: number;
  nome: string;
  status: 'Ativo' | 'Arquivado';
  banco: string;
  agencia: string;
  conta_corrente: string;
  controlesMensaisCount: number;
  template_docx_base64?: string;
  template_xlsx_base64?: string;
}

export interface MonthlyControl {
  id: number;
  projeto_id: number;
  mes: number;
  ano: number;
  totalPagamentos: number;
  valorTotal: number;
}

export enum PaymentStatus {
  NaoGerado = 'Não Gerado',
  Gerado = 'Gerado',
}

export interface Payment {
  id: number;
  controle_mensal_id: number;
  fornecedor_id: number;
  fornecedor: Vendor;
  elemento_despesa: string;
  tipo_comprovante: string;
  numero_comprovante: string;
  valor: number;
  numero_saa: string;
  status_saa: PaymentStatus;
  data_pagamento: string; // YYYY-MM-DD
}

export interface Settings {
  template_docx_padrao_base64: string;
  template_xlsx_padrao_base64: string;
}