import React, { useState } from 'react';
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

    const toggleMenu = (menuId) => {
        setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
    };

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

    const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));
    const isActive = (path) => location.pathname === path;
    const isParentActive = (children) => children?.some(child => isActive(child.path));

    return (
        <div
            className="bg-white border-r border-gray-200 h-full flex flex-col shrink-0"
            style={{ width: collapsed ? 80 : 256 }}
        >
            {/* Logo clickeable */}
            <Link
                to="/dashboard"
                className={`flex items-center gap-3 px-4 py-4 border-b cursor-pointer ${collapsed ? 'justify-center text-center' : ''}`}
            >
                <Church className="w-8 h-8 text-blue-600" />
                {!collapsed && (
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">SisParroquia</h1>
                        <p className="text-xs text-gray-500">Sistema de Gestión</p>
                    </div>
                )}
            </Link>

            {/* Botón de colapso con LayoutGrid y texto "Menú" */}
            <div className="p-2 border-b">
                <button
                    onClick={toggleCollapse}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
                    title={collapsed ? 'Expandir menú' : 'Contraer menú'}
                >
                    <LayoutGrid className="w-5 h-5" />
                    {!collapsed && <span className="ml-2 text-sm font-medium">Menú</span>}
                </button>
            </div>

            {/* Menú centrado cuando está contraído */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredMenuItems.map((item) => (
                    <div key={item.id}>
                        {item.children ? (
                            <div>
                                <button
                                    onClick={() => toggleMenu(item.id)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg font-medium transition-all duration-200 ${isParentActive(item.children) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'} ${collapsed ? 'justify-center' : ''}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {!collapsed && <span className="text-sm">{item.title}</span>}
                                    {!collapsed && (expandedMenus[item.id] ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />)}
                                </button>
                                {!collapsed && expandedMenus[item.id] && (
                                    <div className="ml-6 space-y-1 mt-1">
                                        {item.children.map(child => (
                                            <Link
                                                key={child.path}
                                                to={child.path}
                                                className={`flex items-center gap-2 p-1 rounded text-sm ${isActive(child.path) ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                <child.icon className="w-4 h-4" />
                                                <span>{child.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to={item.path}
                                className={`flex items-center gap-3 p-2 rounded-lg font-medium transition-all duration-200 ${isActive(item.path) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'} ${collapsed ? 'justify-center' : ''}`}
                            >
                                <item.icon className="w-5 h-5" />
                                {!collapsed && <span className="text-sm">{item.title}</span>}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            {/* Usuario centrado cuando está contraído */}
            <div className="p-2 border-t">
                <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
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
        </div>
    );
};

export default Sidebar;