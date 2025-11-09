
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProjectsPage from './pages/ProjectsPage';
import VendorsPage from './pages/VendorsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import PaymentsPage from './pages/PaymentsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/projetos" replace />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/projetos/:projectId" element={<ProjectDetailPage />} />
        <Route path="/projetos/:projectId/controles/:controlId" element={<PaymentsPage />} />
        <Route path="/fornecedores" element={<VendorsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
