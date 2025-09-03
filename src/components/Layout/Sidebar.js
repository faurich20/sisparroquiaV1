// src/components/Layout/Sidebar.js
import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users, Calendar, DollarSign, ShoppingCart,
  Package, Settings, BarChart3, Shield, Church,
  FileText, Clock, TrendingUp, Archive
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ collapsed, toggleCollapse }) => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const flyoutRef = useRef(null);

  const menuItems = [
    { id: 'personal', title: 'Módulo Personal', icon: Users, path: '/personal', permission: 'personal' },
    {
      id: 'liturgical',
      title: 'Actos Litúrgicos',
      icon: Church,
      permission: 'liturgical',
      children: [
        { title: 'Gestionar Actos', path: '/liturgical/manage', icon: Church },
        { title: 'Horarios', path: '/liturgical/schedules', icon: Clock },
        { title: 'Reservas', path: '/liturgical/reservations', icon: Calendar },
        { title: 'Reportes', path: '/liturgical/reports', icon: FileText }
      ]
    },
    { id: 'sales', title: 'Módulo Ventas', icon: TrendingUp, path: '/sales', permission: 'sales' },
    { id: 'purchases', title: 'Módulo Compras', icon: ShoppingCart, path: '/purchases', permission: 'purchases' },
    { id: 'warehouse', title: 'Módulo Almacén', icon: Package, path: '/warehouse', permission: 'warehouse' },
    { id: 'accounting', title: 'Módulo Contabilidad', icon: DollarSign, path: '/accounting', permission: 'accounting' },
    {
      id: 'reports',
      title: 'Módulo Reportes',
      icon: BarChart3,
      permission: 'reports',
      children: [
        { title: 'Gerenciales', path: '/reports/management', icon: TrendingUp },
        { title: 'Transaccionales', path: '/reports/transactions', icon: Archive }
      ]
    },
    {
      id: 'security',
      title: 'Módulo Seguridad',
      icon: Shield,
      permission: 'security',
      children: [
        { title: 'Usuarios', path: '/security/users', icon: Users },
        { title: 'Roles', path: '/security/roles', icon: Shield },
        { title: 'Permisos', path: '/security/permissions', icon: Settings }
      ]
    },
    { id: 'configuration', title: 'Módulo Configuración', icon: Settings, path: '/configuration', permission: 'configuration' }
  ];

  const getCurrentModule = () => {
    const currentPath = location.pathname;
    const parentModule = menuItems.find(item =>
      item.children?.some(child => currentPath.startsWith(child.path))
    );
    if (parentModule) return parentModule;
    return menuItems.find(item => currentPath.startsWith(item.path));
  };

  const currentModule = getCurrentModule();
  const filteredMenu = currentModule && hasPermission(currentModule.permission) ? currentModule : null;

  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    function handleClickOutside(event) {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target)) {
        // nada por ahora
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside
      className="h-full flex flex-col shrink-0"
      style={{
        width: collapsed ? 80 : 256,
        background: "var(--surface)",
        borderRight: `1px solid var(--border)`
      }}
    >
      {/* Logo y Título (sirve para colapsar/expandir) */}
      <div
        onClick={toggleCollapse}
        className={`flex items-center gap-3 h-16 px-4 border-b cursor-pointer ${collapsed ? 'justify-center' : ''}`}
        style={{ borderColor: "var(--border)" }}
      >
        <Church className="w-8 h-8" style={{ color: "var(--primary)" }} />
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>CHASKIS.DEV</h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Sistema de Parroquia</p>
          </div>
        )}
      </div>

      {/* Menú actual */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-2 relative">
        {filteredMenu && (
          <>
            {filteredMenu.children ? (
              <div>
                {!collapsed && (
                  <p className="text-xs font-semibold px-2 mb-2" style={{ color: "var(--muted)" }}>
                    {filteredMenu.title}
                  </p>
                )}
                {filteredMenu.children.map(child => (
                  <Link
                    key={child.path}
                    to={child.path}
                    className={`flex items-center p-2 rounded-lg font-medium transition-all ${collapsed ? 'justify-center' : 'gap-3'}`}
                    style={{
                      background: isActive(child.path) ? "var(--surface-2)" : "transparent",
                      color: isActive(child.path) ? "var(--primary)" : "var(--text)"
                    }}
                  >
                    <child.icon className="w-5 h-5" />
                    {!collapsed && <span className="text-sm">{child.title}</span>}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                to={filteredMenu.path}
                className={`flex items-center p-2 rounded-lg font-medium transition-all ${collapsed ? 'justify-center' : 'gap-3'}`}
                style={{
                  background: isActive(filteredMenu.path) ? "var(--surface-2)" : "transparent",
                  color: isActive(filteredMenu.path) ? "var(--primary)" : "var(--text)"
                }}
              >
                <filteredMenu.icon className="w-5 h-5" />
                {!collapsed && <span className="text-sm">{filteredMenu.title}</span>}
              </Link>
            )}
          </>
        )}
      </nav>

      {/* Información usuario */}
      <div className="p-2 border-t" style={{ borderColor: "var(--border)" }}>
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--secondary))"
            }}
          >
            <span className="text-white text-sm font-bold">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{user?.name || 'Usuario'}</p>
              <p className="text-xs capitalize" style={{ color: "var(--muted)" }}>{user?.role || 'usuario'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
