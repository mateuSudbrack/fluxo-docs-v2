import React, { useState, useEffect, useRef } from 'react';
import { getSettings, updateSettings } from '../services/mockApi';
import { Settings } from '../types';
import { Icons } from '../components/icons';
import { fileToBase64 } from '../lib/utils';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const docxInputRef = useRef<HTMLInputElement>(null);
  const xlsxInputRef = useRef<HTMLInputElement>(null);

  const [fileNames, setFileNames] = useState({ docx: 'Nenhum arquivo selecionado', xlsx: 'Nenhum arquivo selecionado' });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const data = await getSettings();
      setSettings(data);
      if (data.template_docx_padrao_base64) {
        setFileNames(prev => ({ ...prev, docx: 'Template DOCX Padrão.docx' }));
      }
      if (data.template_xlsx_padrao_base64) {
        setFileNames(prev => ({ ...prev, xlsx: 'Template XLSX Padrão.xlsx' }));
      }
      setIsLoading(false);
    };
    fetchSettings();
  }, []);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const name = e.target.name as keyof Settings;
    const base64 = await fileToBase64(file);
    setSettings({ ...settings, [name]: base64 });
    
    if (name === 'template_docx_padrao_base64') setFileNames(prev => ({...prev, docx: file.name}));
    if (name === 'template_xlsx_padrao_base64') setFileNames(prev => ({...prev, xlsx: file.name}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    await updateSettings(settings);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (isLoading) {
    return <p className="text-center p-8">Carregando configurações...</p>;
  }

  if (!settings) {
    return <p className="text-center p-8 text-red-500">Não foi possível carregar as configurações.</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary">Configurações do Sistema</h1>

      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow space-y-8">
        <div>
            <h2 className="text-xl font-semibold text-primary mb-4">Templates Padrão</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Padrão SAA (DOCX)
                    </label>
                    <div className="flex items-center space-x-4">
                        <button type="button" onClick={() => docxInputRef.current?.click()} className="flex items-center bg-secondary text-secondary-foreground px-4 py-2 rounded-lg shadow-sm hover:bg-secondary/80 transition-colors">
                           <Icons.Upload className="w-4 h-4 mr-2" />
                           Carregar Arquivo
                        </button>
                        <span className="text-sm text-muted-foreground truncate">{fileNames.docx}</span>
                    </div>
                    <input
                        type="file"
                        ref={docxInputRef}
                        name="template_docx_padrao_base64"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".docx"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Este template será usado se um projeto não tiver um template específico.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Padrão de Exportação (XLSX)
                    </label>
                     <div className="flex items-center space-x-4">
                        <button type="button" onClick={() => xlsxInputRef.current?.click()} className="flex items-center bg-secondary text-secondary-foreground px-4 py-2 rounded-lg shadow-sm hover:bg-secondary/80 transition-colors">
                           <Icons.Upload className="w-4 h-4 mr-2" />
                           Carregar Arquivo
                        </button>
                        <span className="text-sm text-muted-foreground truncate">{fileNames.xlsx}</span>
                    </div>
                    <input
                        type="file"
                        ref={xlsxInputRef}
                        name="template_xlsx_padrao_base64"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".xlsx"
                    />
                     <p className="text-xs text-muted-foreground mt-1">Este template será usado para exportar os controles mensais. A aba de destino deve se chamar "Controle de Pagamentos".</p>
                </div>
            </div>
        </div>
        
        <div className="flex items-center justify-end space-x-4">
            {showSuccess && (
                <div className="flex items-center text-green-600">
                    <Icons.CheckCircle className="w-5 h-5 mr-2" />
                    <span>Salvo com sucesso!</span>
                </div>
            )}
            <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;