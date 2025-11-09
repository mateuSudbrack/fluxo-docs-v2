
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, addProject, updateProject } from '../services/mockApi';
import { Project } from '../types';
import { Icons } from '../components/icons';
import Modal from '../components/ui/Modal';
import ProjectForm from '../components/ProjectForm';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    const data = await getProjects();
    setProjects(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  }

  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'controlesMensaisCount'>) => {
    setIsSaving(true);
    try {
      if (editingProject) {
        await updateProject({ ...editingProject, ...projectData });
      } else {
        await addProject(projectData);
      }
      await fetchProjects();
      handleCloseModal();
    } catch(error) {
      console.error("Failed to save project:", error);
      alert("Falha ao salvar projeto.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Projetos</h1>
        <button onClick={handleAddProject} className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow hover:bg-primary/90 transition-colors">
          <Icons.PlusCircle className="w-5 h-5 mr-2" />
          Novo Projeto
        </button>
      </div>
      
      {isLoading ? (
        <p className="text-center p-8">Carregando projetos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link to={`/projetos/${project.id}`} key={project.id} className="block group">
              <div className="bg-card p-6 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-primary mb-2 pr-2">{project.nome}</h2>
                    <span className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full ${
                        project.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-4">
                    <p className="text-muted-foreground">
                    {project.controlesMensaisCount} Controles Mensais
                    </p>
                    <button 
                        onClick={(e) => handleEditProject(project, e)} 
                        className="p-2 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Editar Projeto"
                    >
                        <Icons.Edit className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? "Editar Projeto" : "Novo Projeto"}
      >
        <ProjectForm
            onSave={handleSaveProject}
            onCancel={handleCloseModal}
            projectToEdit={editingProject}
            isSaving={isSaving}
        />
      </Modal>
    </div>
  );
};

export default ProjectsPage;
