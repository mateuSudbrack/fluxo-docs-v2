
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icons } from './icons';

const navItems = [
  { name: 'Projetos', href: '/projetos', icon: Icons.Briefcase },
  { name: 'Fornecedores', href: '/fornecedores', icon: Icons.Users },
  { name: 'Configurações', href: '/configuracoes', icon: Icons.Settings },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-secondary">
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Gestão Contábil
        </div>
        <nav className="flex-1 p-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
