import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById, getControlsByProjectId } from '../services/mockApi';
import { Project, MonthlyControl } from '../types';
import { Icons } from '../components/icons';
import { formatCurrency } from '../lib/utils';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [controls, setControls] = useState<MonthlyControl[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      setIsLoading(true);
      const id = parseInt(projectId, 10);
      const [projectData, controlsData] = await Promise.all([
        getProjectById(id),
        getControlsByProjectId(id),
      ]);
      setProject(projectData || null);
      setControls(controlsData);
      setIsLoading(false);
    };
    fetchData();
  }, [projectId]);

  const groupedControls = controls.reduce((acc, control) => {
    (acc[control.ano] = acc[control.ano] || []).push(control);
    return acc;
  }, {} as Record<number, MonthlyControl[]>);

  if (isLoading) {
    return <p className="text-center p-8">Carregando detalhes do projeto...</p>;
  }

  if (!project) {
    return <p className="text-center p-8 text-red-500">Projeto não encontrado.</p>;
  }

  const formatMonth = (month: number) => new Date(2000, month - 1, 1).toLocaleString('pt-BR', { month: 'long' });

  return (
    <div className="space-y-8">
      <div>
        <Link to="/projetos" className="flex items-center text-sm text-primary hover:underline mb-4">
          <Icons.ChevronLeft className="w-4 h-4 mr-1" />
          Voltar para Projetos
        </Link>
        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">{project.nome}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                project.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {project.status}
            </span>
          </div>
          <div className="mt-4 text-muted-foreground grid grid-cols-3 gap-4">
            <p><strong>Banco:</strong> {project.banco}</p>
            <p><strong>Agência:</strong> {project.agencia}</p>
            <p><strong>Conta:</strong> {project.conta_corrente}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">Controles Mensais</h2>
        <button className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow hover:bg-primary/90 transition-colors">
          <Icons.PlusCircle className="w-5 h-5 mr-2" />
          Novo Controle Mensal
        </button>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedControls).length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground py-8">Nenhum controle mensal encontrado.</p>
        )}
        {Object.keys(groupedControls).sort((a, b) => Number(b) - Number(a)).map(year => (
          <div key={year}>
            <h3 className="text-xl font-semibold mb-4 text-gray-600">{year}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {groupedControls[Number(year)].sort((a, b) => a.mes - b.mes).map(control => (
                <Link to={`/projetos/${projectId}/controles/${control.id}`} key={control.id} className="block">
                  <div className="bg-card p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-lg capitalize">{formatMonth(control.mes)}</h4>
                    <p className="text-sm text-muted-foreground">{control.totalPagamentos} pagamentos</p>
                    <p className="text-lg font-semibold mt-2">
                      {formatCurrency(control.valorTotal)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetailPage;