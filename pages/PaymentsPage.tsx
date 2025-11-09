import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPaymentsByControlId, getProjectById, getControlById, updatePayment, addPayment, getVendorById, deletePayment, getSettings } from '../services/mockApi';
import { Payment, Project, MonthlyControl, PaymentStatus, Vendor, Settings } from '../types';
import { Icons } from '../components/icons';
import { formatCurrency } from '../lib/utils';
import { generateSAA, exportToXLSX } from '../lib/docgen';
import Modal from '../components/ui/Modal';
import PaymentForm from '../components/PaymentForm';


const PaymentsPage: React.FC = () => {
  const { projectId, controlId } = useParams<{ projectId: string; controlId: string }>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [control, setControl] = useState<MonthlyControl | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    if (!projectId || !controlId) return;
    setIsLoading(true);
    const pId = parseInt(projectId, 10);
    const cId = parseInt(controlId, 10);
    const [paymentsData, projectData, controlData, settingsData] = await Promise.all([
      getPaymentsByControlId(cId),
      getProjectById(pId),
      getControlById(cId),
      getSettings()
    ]);
    setPayments(paymentsData);
    setProject(projectData || null);
    setControl(controlData || null);
    setSettings(settingsData || null);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [projectId, controlId]);

  const handleAddPaymentClick = () => {
    setEditingPayment(null);
    setIsModalOpen(true);
  };

  const handleEditPaymentClick = (payment: Payment) => {
    setEditingPayment(payment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPayment(null);
  };

  const handleSavePayment = async (paymentData: Omit<Payment, 'id' | 'fornecedor' | 'status_saa'>) => {
    setIsSaving(true);
    try {
      if (editingPayment) {
        const vendor = await getVendorById(paymentData.fornecedor_id);
        if(!vendor) throw new Error("Fornecedor não encontrado");
        const updatedPayment: Payment = { ...editingPayment, ...paymentData, fornecedor: vendor };
        await updatePayment(updatedPayment);
      } else {
        await addPayment(paymentData);
      }
      await fetchData(); // Refetch all data to reflect updates
      handleCloseModal();
    } catch (error) {
        console.error("Failed to save payment:", error);
        alert("Falha ao salvar pagamento.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este pagamento?')) {
        await deletePayment(paymentId);
        await fetchData(); // Refetch to update list and totals
    }
  };

  const handleGenerateSAA = async (paymentId: number) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment || !project || !control || !settings) {
        alert("Erro: Dados necessários não foram carregados.");
        return;
    }

    const templateBase64 = project.template_docx_base64 || settings.template_docx_padrao_base64;
    if (!templateBase64) {
        alert("Nenhum template DOCX configurado. Por favor, adicione um template padrão nas Configurações ou um template específico para este projeto.");
        return;
    }
    
    try {
        generateSAA(payment, project, templateBase64);

        // Optimistically update UI
        const updated = { ...payment, status_saa: PaymentStatus.Gerado };
        await updatePayment(updated);
        setPayments(payments.map(p => p.id === paymentId ? updated : p));
    } catch(error) {
        console.error("Failed to generate SAA:", error);
        alert(`Falha ao gerar SAA: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleExportXLSX = () => {
    if (!payments || !project || !control || !settings) {
        alert("Erro: Dados necessários não foram carregados.");
        return;
    }
    const templateBase64 = project.template_xlsx_base64 || settings.template_xlsx_padrao_base64;
    if (!templateBase64) {
        alert("Nenhum template XLSX configurado. Por favor, adicione um template padrão nas Configurações ou um template específico para este projeto.");
        return;
    }

    try {
        exportToXLSX(payments, project, control, templateBase64);
    } catch(error) {
        console.error("Failed to export to XLSX:", error);
        alert(`Falha ao exportar: ${error instanceof Error ? error.message : String(error)}`);
    }
  }


  const formatMonth = (month: number) => new Date(2000, month - 1, 1).toLocaleString('pt-BR', { month: 'long' });

  const breadcrumb = useMemo(() => {
    if (!project || !control) return null;
    return (
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/projetos" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
              Projetos
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
              <Link to={`/projetos/${project.id}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                {project.nome}
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 capitalize">
                {formatMonth(control.mes)}/{control.ano}
              </span>
            </div>
          </li>
        </ol>
      </nav>
    );
  }, [project, control]);

  if (isLoading) {
    return <p className="text-center p-8">Carregando pagamentos...</p>;
  }

  return (
    <div className="space-y-6">
      {breadcrumb}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Pagamentos</h1>
        <div className="flex space-x-2">
            <button onClick={handleAddPaymentClick} className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow hover:bg-primary/90 transition-colors">
            <Icons.PlusCircle className="w-5 h-5 mr-2" />
            Adicionar Pagamento
            </button>
            <button onClick={handleExportXLSX} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors">
            <Icons.FileDown className="w-5 h-5 mr-2" />
            Exportar para XLSX
            </button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3">Elemento de Despesa</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Nº SAA</th>
                <th className="px-4 py-3 text-center">Status SAA</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center text-muted-foreground py-8">Nenhum pagamento registrado.</td>
                </tr>
              )}
              {payments.map(payment => (
                <tr key={payment.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{payment.fornecedor.nome}</div>
                    <div className="text-xs text-gray-500">{payment.fornecedor.cnpj_cpf}</div>
                  </td>
                  <td className="px-4 py-4">{payment.elemento_despesa}</td>
                  <td className="px-4 py-4 font-mono">{formatCurrency(payment.valor)}</td>
                  <td className="px-4 py-4 font-mono">{payment.numero_saa}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status_saa === PaymentStatus.Gerado
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status_saa}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {payment.status_saa === PaymentStatus.NaoGerado && (
                      <button 
                        onClick={() => handleGenerateSAA(payment.id)}
                        className="p-1 text-green-600 hover:text-green-800" title="Gerar SAA">
                        <Icons.FileText className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleEditPaymentClick(payment)} className="p-1 ml-2 text-blue-600 hover:text-blue-800" title="Editar">
                      <Icons.Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeletePayment(payment.id)} className="p-1 ml-2 text-red-600 hover:text-red-800" title="Excluir">
                      <Icons.Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPayment ? "Editar Pagamento" : "Adicionar Pagamento"}
      >
        <PaymentForm
            onSave={handleSavePayment}
            onCancel={handleCloseModal}
            paymentToEdit={editingPayment}
            controlId={parseInt(controlId!, 10)}
            isSaving={isSaving}
        />
      </Modal>
    </div>
  );
};

export default PaymentsPage;