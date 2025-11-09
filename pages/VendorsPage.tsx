
import React, { useState, useEffect, useMemo } from 'react';
import { getVendors } from '../services/mockApi';
import { Vendor } from '../types';
import { Icons } from '../components/icons';

const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      const data = await getVendors();
      setVendors(data);
      setIsLoading(false);
    };
    fetchVendors();
  }, []);

  const filteredVendors = useMemo(() => {
    return vendors.filter(
      (vendor) =>
        vendor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.cnpj_cpf.includes(searchTerm)
    );
  }, [vendors, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Fornecedores</h1>
        <button className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow hover:bg-primary/90 transition-colors">
          <Icons.PlusCircle className="w-5 h-5 mr-2" />
          Novo Fornecedor
        </button>
      </div>

      <div className="relative">
        <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ/CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-card"
        />
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <p className="text-center p-8">Carregando fornecedores...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Código</th>
                  <th scope="col" className="px-6 py-3">Nome / Razão Social</th>
                  <th scope="col" className="px-6 py-3">CNPJ / CPF</th>
                  <th scope="col" className="px-6 py-3">Banco</th>
                  <th scope="col" className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{vendor.codigo}</td>
                    <td className="px-6 py-4">{vendor.nome}</td>
                    <td className="px-6 py-4">{vendor.cnpj_cpf}</td>
                    <td className="px-6 py-4">{vendor.banco_codigo}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 text-blue-600 hover:text-blue-800">
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 ml-2 text-red-600 hover:text-red-800">
                        <Icons.Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorsPage;
