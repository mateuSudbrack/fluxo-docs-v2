import React, { useState, useEffect, useRef } from 'react';
import { Payment, Vendor } from '../types';
import { getVendors } from '../services/mockApi';

interface PaymentFormProps {
  onSave: (payment: Omit<Payment, 'id' | 'fornecedor' | 'status_saa'>) => Promise<void>;
  onCancel: () => void;
  paymentToEdit?: Payment | null;
  controlId: number;
  isSaving: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSave, onCancel, paymentToEdit, controlId, isSaving }) => {
  const [formData, setFormData] = useState({
    fornecedor_id: paymentToEdit?.fornecedor_id || 0,
    elemento_despesa: paymentToEdit?.elemento_despesa || '',
    tipo_comprovante: paymentToEdit?.tipo_comprovante || '',
    numero_comprovante: paymentToEdit?.numero_comprovante || '',
    valor: paymentToEdit?.valor || 0,
    numero_saa: paymentToEdit?.numero_saa || `SAA${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`, // Mock SAA
    data_pagamento: paymentToEdit?.data_pagamento || new Date().toISOString().split('T')[0],
    controle_mensal_id: controlId,
  });

  const [vendorSearch, setVendorSearch] = useState('');
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isVendorListVisible, setIsVendorListVisible] = useState(false);
  const vendorInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getVendors().then(setAllVendors);
    if (paymentToEdit && paymentToEdit.fornecedor) {
      setVendorSearch(`${paymentToEdit.fornecedor.codigo} - ${paymentToEdit.fornecedor.nome}`);
    }
  }, [paymentToEdit]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (vendorInputRef.current && !vendorInputRef.current.contains(event.target as Node)) {
        setIsVendorListVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVendorSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setVendorSearch(query);
    if (query) {
      setFilteredVendors(
        allVendors.filter(v => 
          v.nome.toLowerCase().includes(query.toLowerCase()) ||
          v.codigo.toLowerCase().includes(query.toLowerCase())
        )
      );
      setIsVendorListVisible(true);
    } else {
      setFilteredVendors([]);
      setIsVendorListVisible(false);
      setFormData(prev => ({ ...prev, fornecedor_id: 0 }));
    }
  };
  
  const handleSelectVendor = (vendor: Vendor) => {
    setFormData(prev => ({ ...prev, fornecedor_id: vendor.id }));
    setVendorSearch(`${vendor.codigo} - ${vendor.nome}`);
    setIsVendorListVisible(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fornecedor_id) {
        alert('Por favor, selecione um fornecedor.');
        return;
    }
    if (formData.valor <= 0) {
        alert('O valor a pagar deve ser maior que zero.');
        return;
    }
    await onSave(formData);
  };
  
  const selectedVendor = allVendors.find(v => v.id === formData.fornecedor_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fornecedor Autocomplete */}
        <div className="relative col-span-2" ref={vendorInputRef}>
          <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">Fornecedor *</label>
          <input
            id="vendor"
            type="text"
            value={vendorSearch}
            onChange={handleVendorSearchChange}
            onFocus={() => setIsVendorListVisible(true)}
            placeholder="Digite o código ou nome do fornecedor"
            className="w-full px-3 py-2 border border-input rounded-lg bg-white"
            autoComplete="off"
            required
          />
          {isVendorListVisible && filteredVendors.length > 0 && (
            <ul className="absolute z-10 w-full bg-card border rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
              {filteredVendors.map(v => (
                <li 
                  key={v.id} 
                  className="px-3 py-2 hover:bg-secondary cursor-pointer"
                  onClick={() => handleSelectVendor(v)}
                >
                  <div className="font-semibold">{v.codigo} - {v.nome}</div>
                  <div className="text-sm text-muted-foreground">{v.cnpj_cpf}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Fornecedor Details */}
        {selectedVendor && (
          <div className="col-span-2 bg-secondary p-4 rounded-lg text-sm grid grid-cols-2 gap-x-4 gap-y-2">
            <div><strong>CNPJ/CPF:</strong> {selectedVendor.cnpj_cpf}</div>
            <div><strong>Banco:</strong> {selectedVendor.banco_codigo}</div>
            <div><strong>Agência:</strong> {selectedVendor.agencia}</div>
            <div><strong>Conta:</strong> {selectedVendor.conta_corrente}</div>
            <div className="col-span-2"><strong>PIX:</strong> {selectedVendor.pix}</div>
          </div>
        )}
        
        {/* Other fields */}
        <div>
          <label htmlFor="elemento_despesa" className="block text-sm font-medium text-gray-700 mb-1">Elemento de Despesa</label>
          <input type="text" name="elemento_despesa" value={formData.elemento_despesa} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-lg" />
        </div>
        <div>
          <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">Valor a Pagar *</label>
          <input type="number" name="valor" step="0.01" value={formData.valor} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-lg" required />
        </div>
        <div>
          <label htmlFor="tipo_comprovante" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Comprovante</label>
          <input type="text" name="tipo_comprovante" value={formData.tipo_comprovante} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-lg" />
        </div>
        <div>
          <label htmlFor="numero_comprovante" className="block text-sm font-medium text-gray-700 mb-1">Nº do Comprovante</label>
          <input type="text" name="numero_comprovante" value={formData.numero_comprovante} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-lg" />
        </div>
         <div>
          <label htmlFor="data_pagamento" className="block text-sm font-medium text-gray-700 mb-1">Data do Pagamento *</label>
          <input type="date" name="data_pagamento" value={formData.data_pagamento} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-lg" required />
        </div>
         <div>
          <label htmlFor="numero_saa" className="block text-sm font-medium text-gray-700 mb-1">Nº do SAA</label>
          <input type="text" name="numero_saa" value={formData.numero_saa} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-lg bg-gray-100" readOnly />
        </div>

      </div>
      <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border hover:bg-secondary transition-colors">Cancelar</button>
        <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSaving ? 'Salvando...' : 'Salvar Pagamento'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
