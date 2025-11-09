import { Vendor, Project, MonthlyControl, Payment, PaymentStatus, Settings } from '../types';

const LS_KEYS = {
    VENDORS: 'contabil_vendors',
    PROJECTS: 'contabil_projects',
    CONTROLS: 'contabil_controls',
    PAYMENTS: 'contabil_payments',
    SETTINGS: 'contabil_settings',
};

const getFromLS = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToLS = <T,>(key: string, value: T): void => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

// Initial default data
const initialVendors: Vendor[] = [
  { id: 1, codigo: 'FORN001', nome: 'Tech Solutions Ltda.', cnpj_cpf: '12.345.678/0001-99', banco_codigo: '001 - Banco do Brasil', agencia: '1234', conta_corrente: '56789-0', pix: 'pix@tech.com' },
  { id: 2, codigo: 'FORN002', nome: 'Marketing Criativo S.A.', cnpj_cpf: '98.765.432/0001-11', banco_codigo: '237 - Bradesco', agencia: '4321', conta_corrente: '09876-5', pix: 'financeiro@marketing.com' },
  { id: 3, codigo: 'FORN003', nome: 'João da Silva MEI', cnpj_cpf: '123.456.789-00', banco_codigo: '341 - Itaú', agencia: '5678', conta_corrente: '12345-6', pix: 'joao.silva@email.com' },
];

const initialProjects: Project[] = [
  { id: 1, nome: 'Cliente Alpha', status: 'Ativo', banco: '001', agencia: '1111', conta_corrente: '11111-1', controlesMensaisCount: 3 },
  { id: 2, nome: 'Cliente Beta', status: 'Ativo', banco: '237', agencia: '2222', conta_corrente: '22222-2', controlesMensaisCount: 2 },
  { id: 3, nome: 'Cliente Gamma (Antigo)', status: 'Arquivado', banco: '341', agencia: '3333', conta_corrente: '33333-3', controlesMensaisCount: 12 },
];

const initialMonthlyControls: MonthlyControl[] = [
  { id: 1, projeto_id: 1, mes: 1, ano: 2025, totalPagamentos: 2, valorTotal: 7500.00 },
  { id: 2, projeto_id: 1, mes: 2, ano: 2025, totalPagamentos: 1, valorTotal: 3000.00 },
  { id: 3, projeto_id: 1, mes: 3, ano: 2025, totalPagamentos: 0, valorTotal: 0.00 },
  { id: 4, projeto_id: 2, mes: 1, ano: 2025, totalPagamentos: 1, valorTotal: 1250.50 },
  { id: 5, projeto_id: 2, mes: 2, ano: 2025, totalPagamentos: 1, valorTotal: 4000.00 },
];

// FIX: Changed Payment[] to Omit<Payment, 'fornecedor'>[] and removed the 'fornecedor' property
// to align with the storage strategy of not persisting hydrated vendor data.
const initialPayments: Omit<Payment, 'fornecedor'>[] = [
  { id: 1, controle_mensal_id: 1, fornecedor_id: 1, elemento_despesa: 'Serviços de TI', tipo_comprovante: 'NF-e', numero_comprovante: '12345', valor: 5000.00, numero_saa: 'SAA001', status_saa: PaymentStatus.NaoGerado, data_pagamento: '2025-01-15' },
  { id: 2, controle_mensal_id: 1, fornecedor_id: 2, elemento_despesa: 'Marketing Digital', tipo_comprovante: 'NF-e', numero_comprovante: '67890', valor: 2500.00, numero_saa: 'SAA002', status_saa: PaymentStatus.Gerado, data_pagamento: '2025-01-20' },
  { id: 3, controle_mensal_id: 2, fornecedor_id: 1, elemento_despesa: 'Manutenção de Sistema', tipo_comprovante: 'NF-e', numero_comprovante: '12350', valor: 3000.00, numero_saa: 'SAA003', status_saa: PaymentStatus.NaoGerado, data_pagamento: '2025-02-10' },
  { id: 4, controle_mensal_id: 4, fornecedor_id: 3, elemento_despesa: 'Consultoria', tipo_comprovante: 'RPA', numero_comprovante: '001', valor: 1250.50, numero_saa: 'SAA004', status_saa: PaymentStatus.NaoGerado, data_pagamento: '2025-01-25' },
  { id: 5, controle_mensal_id: 5, fornecedor_id: 2, elemento_despesa: 'Campanha Publicitária', tipo_comprovante: 'NF-e', numero_comprovante: '67900', valor: 4000.00, numero_saa: 'SAA005', status_saa: PaymentStatus.Gerado, data_pagamento: '2025-02-18' },
];

const initialSettings: Settings = {
    template_docx_padrao_base64: '',
    template_xlsx_padrao_base64: '',
};

const simulateDelay = <T,>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), 200));

// Settings
export const getSettings = () => simulateDelay(getFromLS(LS_KEYS.SETTINGS, initialSettings));
export const updateSettings = (newSettings: Settings) => {
    saveToLS(LS_KEYS.SETTINGS, newSettings);
    return simulateDelay(newSettings);
}

// Vendors
export const getVendors = () => simulateDelay(getFromLS(LS_KEYS.VENDORS, initialVendors));
export const getVendorById = async (id: number) => {
    const vendors = await getVendors();
    return simulateDelay(vendors.find(v => v.id === id));
};

// Projects
export const getProjects = () => simulateDelay(getFromLS(LS_KEYS.PROJECTS, initialProjects));
export const getProjectById = async (id: number) => {
    const projects = await getProjects();
    return simulateDelay(projects.find(p => p.id === id));
};

export const addProject = async (project: Omit<Project, 'id' | 'controlesMensaisCount'>) => {
    const projects = await getProjects();
    const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    const newProject: Project = { ...project, id: newId, controlesMensaisCount: 0 };
    const updatedProjects = [...projects, newProject];
    saveToLS(LS_KEYS.PROJECTS, updatedProjects);
    return simulateDelay(newProject);
}

export const updateProject = async (updatedProject: Omit<Project, 'controlesMensaisCount'>) => {
    const projects = await getProjects();
    const index = projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
        const newProjects = [...projects];
        newProjects[index] = { ...newProjects[index], ...updatedProject };
        saveToLS(LS_KEYS.PROJECTS, newProjects);
        return simulateDelay(newProjects[index]);
    }
    return Promise.reject("Projeto não encontrado");
}


// Controls
export const getControlsByProjectId = async (projectId: number) => {
    const controls = getFromLS(LS_KEYS.CONTROLS, initialMonthlyControls);
    return simulateDelay(controls.filter(c => c.projeto_id === projectId));
}
export const getControlById = async (id: number) => {
    const controls = getFromLS(LS_KEYS.CONTROLS, initialMonthlyControls);
    return simulateDelay(controls.find(c => c.id === id));
};

// Payments
export const getPaymentsByControlId = async (controlId: number) => {
    const payments = getFromLS(LS_KEYS.PAYMENTS, initialPayments);
    const vendors = await getVendors();
    // Re-hydrate vendor data
    const paymentsWithVendors = payments
      .filter(p => p.controle_mensal_id === controlId)
      .map(p => ({...p, fornecedor: vendors.find(v => v.id === p.fornecedor_id)! }));
    return simulateDelay(paymentsWithVendors);
};

export const addPayment = async (payment: Omit<Payment, 'id' | 'fornecedor' | 'status_saa'>) => {
    const payments = getFromLS(LS_KEYS.PAYMENTS, initialPayments);
    const newId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
    
    const newPayment: Omit<Payment, 'fornecedor'> = { 
        ...payment, 
        id: newId, 
        status_saa: PaymentStatus.NaoGerado
    };
    
    saveToLS(LS_KEYS.PAYMENTS, [...payments, newPayment]);

    const controls = getFromLS(LS_KEYS.CONTROLS, initialMonthlyControls);
    const controlIndex = controls.findIndex(c => c.id === payment.controle_mensal_id);
    if(controlIndex > -1) {
        controls[controlIndex].totalPagamentos += 1;
        controls[controlIndex].valorTotal += payment.valor;
        saveToLS(LS_KEYS.CONTROLS, controls);
    }
    const vendor = await getVendorById(payment.fornecedor_id);
    return simulateDelay({...newPayment, fornecedor: vendor!} as Payment);
}

export const updatePayment = async (updatedPayment: Payment) => {
    const payments = getFromLS(LS_KEYS.PAYMENTS, initialPayments);
    const index = payments.findIndex(p => p.id === updatedPayment.id);
    if (index !== -1) {
        const originalPayment = payments[index];
        const newPayments = [...payments];
        // FIX: Destructure to remove 'fornecedor' property for storage, ensuring type consistency.
        const { fornecedor, ...paymentToSave } = updatedPayment;
        newPayments[index] = paymentToSave;
        saveToLS(LS_KEYS.PAYMENTS, newPayments);

        const controls = getFromLS(LS_KEYS.CONTROLS, initialMonthlyControls);
        const controlIndex = controls.findIndex(c => c.id === updatedPayment.controle_mensal_id);
        if(controlIndex > -1) {
            controls[controlIndex].valorTotal = controls[controlIndex].valorTotal - originalPayment.valor + updatedPayment.valor;
            saveToLS(LS_KEYS.CONTROLS, controls);
        }

        return simulateDelay(updatedPayment);
    }
    return Promise.reject("Pagamento não encontrado");
}

export const deletePayment = async (paymentId: number) => {
    const payments = getFromLS(LS_KEYS.PAYMENTS, initialPayments);
    const index = payments.findIndex(p => p.id === paymentId);
    if (index !== -1) {
        const deletedPayment = payments[index];
        const updatedPayments = payments.filter(p => p.id !== paymentId);
        saveToLS(LS_KEYS.PAYMENTS, updatedPayments);

        const controls = getFromLS(LS_KEYS.CONTROLS, initialMonthlyControls);
        const controlIndex = controls.findIndex(c => c.id === deletedPayment.controle_mensal_id);
        if(controlIndex > -1) {
            controls[controlIndex].totalPagamentos -= 1;
            controls[controlIndex].valorTotal -= deletedPayment.valor;
            saveToLS(LS_KEYS.CONTROLS, controls);
        }
        return simulateDelay({ success: true });
    }
    return Promise.reject("Pagamento não encontrado");
}