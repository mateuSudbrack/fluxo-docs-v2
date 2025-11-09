import React, { useState, useRef } from 'react';
import { Project } from '../types';
import { Icons } from './icons';
import { fileToBase64 } from '../lib/utils';

interface ProjectFormProps {
  onSave: (project: Omit<Project, 'id' | 'controlesMensaisCount'>) => Promise<void>;
  onCancel: () => void;
  projectToEdit?: Project | null;
  isSaving: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSave, onCancel, projectToEdit, isSaving }) => {
  const [formData, setFormData] = useState({
    nome: projectToEdit?.nome || '',
    status: projectToEdit?.status || 'Ativo',
    banco: projectToEdit?.banco || '',
    agencia: projectToEdit?.agencia || '',
    conta_corrente: projectToEdit?.conta_corrente || '',
    template_docx_base64: projectToEdit?.template_docx_base64 || '',
    template_xlsx_base64: projectToEdit?.template_xlsx_base64 || '',
  });

  const docxInputRef = useRef<HTMLInputElement>(null);
  const xlsxInputRef = useRef<HTMLInputElement>(null);

  const [fileNames, setFileNames] = useState({ 
    docx: projectToEdit?.template_docx_base64 ? 'Template customizado.docx' : 'Nenhum arquivo', 
    xlsx: projectToEdit?.template_xlsx_base64 ? 'Template customizado.xlsx' : 'Nenhum arquivo' 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = e.target.name;
    const base64 = await fileToBase64(file);
    setFormData(prev => ({ ...prev, [name]: base64 }));
    
    if (name === 'template_docx_base64') setFileNames(prev => ({...prev, docx: file.name}));
    if (name === 'template_xlsx_base64') setFileNames(prev => ({...prev, xlsx: file.name}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.banco || !formData.agencia || !formData.conta_corrente) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    await onSave(formData as Omit<Project, 'id' | 'controlesMensaisCount'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome do Projeto *</label>
        <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-lg" required />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <label htmlFor="banco" className="block text-sm font-medium text-gray-700 mb-1">Banco *</label>
            <input type="text" name="banco" value={formData.banco} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-lg" required />
        </div>
        <div>
            <label htmlFor="agencia" className="block text-sm font-medium text-gray-700 mb-1">Agência *</label>
            <input type="text" name="agencia" value={formData.agencia} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-lg" required />
        </div>
        <div>
            <label htmlFor="conta_corrente" className="block text-sm font-medium text-gray-700 mb-1">Conta Corrente *</label>
            <input type="text" name="conta_corrente" value={formData.conta_corrente} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-lg" required />
        </div>
      </div>
      
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-input rounded-lg bg-white">
          <option value="Ativo">Ativo</option>
          <option value="Arquivado">Arquivado</option>
        </select>
      </div>

      <div className="pt-4 mt-4 border-t">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Templates Customizados (Opcional)</h3>
        <p className="text-sm text-muted-foreground mb-4">Deixe em branco para usar os templates padrão do sistema.</p>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template SAA (DOCX)</label>
                <div className="flex items-center space-x-4">
                    <button type="button" onClick={() => docxInputRef.current?.click()} className="flex items-center bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md shadow-sm hover:bg-secondary/80 text-sm">
                        <Icons.Upload className="w-4 h-4 mr-2" />
                        Carregar
                    </button>
                    <span className="text-sm text-muted-foreground truncate">{fileNames.docx}</span>
                </div>
                <input type="file" ref={docxInputRef} name="template_docx_base64" onChange={handleFileChange} className="hidden" accept=".docx" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template de Exportação (XLSX)</label>
                <div className="flex items-center space-x-4">
                    <button type="button" onClick={() => xlsxInputRef.current?.click()} className="flex items-center bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md shadow-sm hover:bg-secondary/80 text-sm">
                        <Icons.Upload className="w-4 h-4 mr-2" />
                        Carregar
                    </button>
                    <span className="text-sm text-muted-foreground truncate">{fileNames.xlsx}</span>
                </div>
                <input type="file" ref={xlsxInputRef} name="template_xlsx_base64" onChange={handleFileChange} className="hidden" accept=".xlsx" />
            </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border hover:bg-secondary transition-colors">Cancelar</button>
        <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isSaving ? 'Salvando...' : 'Salvar Projeto'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;