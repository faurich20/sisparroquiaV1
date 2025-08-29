import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Users, Calendar, DollarSign, ShoppingCart,
  Package, Settings, BarChart3, Shield, Church,
  ChevronDown, ChevronRight, FileText, Clock,
  TrendingUp, Archive, LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ collapsed, toggleCollapse }) => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [openFlyoutMenu, setOpenFlyoutMenu] = useState(null);
  const [flyoutPositionTop, setFlyoutPositionTop] = useState(0);
  const flyoutRef = useRef(null);

  // Función para abrir o cerrar submenú inline (expandido)
  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  // Maneja abrir/cerrar menú flotante en modo colapsado y calcula posición relativa a la ventana
  const handleCollapsedMenuClick = (id, event) => {
    if (openFlyoutMenu === id) {
      setOpenFlyoutMenu(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      // Ajustar para evitar que el menú quede fuera de pantalla verticalmente
      const viewportHeight = window.innerHeight;
      const menuHeight = (menuItems.find(item => item.id === id)?.children?.length || 0) * 40; // aprox 40px por item
      let top = rect.top;
      if (top + menuHeight > viewportHeight) {
        top = viewportHeight - menuHeight - 10; // 10px de margen inferior
      }
      setFlyoutPositionTop(top);
      setOpenFlyoutMenu(id);
    }
  };

  // Lista de menús con permisos y rutas
  const menuItems = [
    { id: 'personal', title: 'Personal', icon: Users, path: '/personal', permission: 'personal' },
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
    { id: 'sales', title: 'Ventas', icon: TrendingUp, path: '/sales', permission: 'sales' },
    { id: 'purchases', title: 'Compras', icon: ShoppingCart, path: '/purchases', permission: 'purchases' },
    { id: 'warehouse', title: 'Almacén', icon: Package, path: '/warehouse', permission: 'warehouse' },
    { id: 'accounting', title: 'Contabilidad', icon: DollarSign, path: '/accounting', permission: 'accounting' },
    {
      id: 'reports',
      title: 'Reportes',
      icon: BarChart3,
      permission: 'reports',
      children: [
        { title: 'Gerenciales', path: '/reports/management', icon: TrendingUp },
        { title: 'Transaccionales', path: '/reports/transactions', icon: Archive }
      ]
    },
    {
      id: 'security',
      title: 'Seguridad',
      icon: Shield,
      permission: 'security',
      children: [
        { title: 'Usuarios', path: '/security/users', icon: Users },
        { title: 'Roles', path: '/security/roles', icon: Shield },
        { title: 'Permisos', path: '/security/permissions', icon: Settings }
      ]
    },
    { id: 'configuration', title: 'Configuración', icon: Settings, path: '/configuration', permission: 'configuration' }
  ];

  // Filtra menús según permisos del usuario
  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));
  
  // Función para saber si ruta está activa
  const isActive = (path) => location.pathname === path;

  // Función para detectar si algún hijo está activo para activar padre
  const isParentActive = (children) => children?.some(child => isActive(child.path));

  // Listener de click fuera para cerrar menú flotante
  useEffect(() => {
    function handleClickOutside(event) {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target)) {
        setOpenFlyoutMenu(null);
      }
    }
    if (openFlyoutMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFlyoutMenu]);

  // Componente para submenú inline (expandido)
  const SubmenuInline = ({ item }) => (
    <>
      <button
        onClick={() => toggleMenu(item.id)}
        className={`w-full flex items-center gap-3 p-2 rounded-lg font-medium transition-all duration-200 ${
          isParentActive(item.children) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
        }`}
        aria-expanded={!!expandedMenus[item.id]}
        aria-controls={`${item.id}-submenu`}
      >
        <item.icon className="w-5 h-5" />
        <span className="text-sm">{item.title}</span>
        {expandedMenus[item.id] ? (
          <ChevronDown className="w-4 h-4 ml-auto" />
        ) : (
          <ChevronRight className="w-4 h-4 ml-auto" />
        )}
      </button>
      {expandedMenus[item.id] && (
        <div id={`${item.id}-submenu`} className="ml-6 space-y-1 mt-1" role="region" aria-label={`${item.title} submenu`}>
          {item.children.map(child => (
            <Link
              key={child.path}
              to={child.path}
              className={`flex items-center gap-2 p-1 rounded text-sm ${
                isActive(child.path) ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <child.icon className="w-4 h-4" />
              <span>{child.title}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );

  // Componente para menú flotante en colapsado
  const FlyoutMenu = ({ item }) => (
    <div
      ref={flyoutRef}
      className="fixed left-[80px] bg-white border border-gray-200 rounded-lg shadow-lg z-50"
      style={{ top: flyoutPositionTop, minWidth: 192 }}
      role="menu"
      aria-label={`${item.title} submenu`}
    >
      {item.children.map(child => (
        <Link
          key={child.path}
          to={child.path}
          className={`flex items-center gap-2 p-2 text-sm rounded hover:bg-blue-50 ${
            isActive(child.path) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          onClick={() => setOpenFlyoutMenu(null)}
          role="menuitem"
        >
          <child.icon className="w-4 h-4" />
          <span>{child.title}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <aside
      className="bg-white border-r border-gray-200 h-full flex flex-col shrink-0 relative"
      style={{ width: collapsed ? 80 : 256 }}
      aria-label="Menú lateral"
    >
      {/* Logo */}
      <Link
        to="/dashboard"
        className={`flex items-center gap-3 px-4 py-4 border-b cursor-pointer ${collapsed ? 'justify-center text-center' : ''}`}
        aria-label="Ir al Dashboard"
      >
        <Church className="w-8 h-8 text-blue-600" />
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-gray-900">SisParroquia</h1>
            <p className="text-xs text-gray-500">Sistema de Gestión</p>
          </div>
        )}
      </Link>

      {/* Botón colapsar/expandir */}
      <div className="p-2 border-b">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
        >
          <LayoutGrid className="w-5 h-5" />
          {!collapsed && <span className="ml-2 text-sm font-medium">Menú</span>}
        </button>
      </div>

      {/* Menú principal */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-2 relative" aria-label="Navegación principal">
        {filteredMenuItems.map(item => {
          const hasChildren = !!item.children?.length;
          const activeParent = isParentActive(item.children);

          if (hasChildren) {
            if (collapsed) {
              // Menú colapsado con submenu flotante
              return (
                <div key={item.id} className="relative flex justify-center">
                  <button
                    onClick={(e) => handleCollapsedMenuClick(item.id, e)}
                    title={item.title}
                    className={`flex items-center p-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 focus:outline-none ${
                      activeParent ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                    aria-haspopup="true"
                    aria-expanded={openFlyoutMenu === item.id}
                    aria-controls={`${item.id}-flyout-menu`}
                  >
                    <item.icon className="w-5 h-5" />
                  </button>

                  {openFlyoutMenu === item.id && <FlyoutMenu item={item} />}
                </div>
              );
            } else {
              // Menú expandido con submenu inline
              return <SubmenuInline key={item.id} item={item} />;
            }
          } else {
            // Menú sin hijos
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 p-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive(item.path) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                } ${collapsed ? 'justify-center' : ''}`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5" />
                {!collapsed && <span className="text-sm">{item.title}</span>}
              </Link>
            );
          }
        })}
      </nav>

      {/* Información usuario */}
      <div className="p-2 border-t">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center" aria-hidden="true">
            <span className="text-white text-sm font-bold">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'usuario'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  

};

export default Sidebar;
