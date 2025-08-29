import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Edit, Trash2, Shield } from 'lucide-react';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const UsersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const users = [
        {
            id: 1,
            name: 'Padre Miguel',
            email: 'padre.miguel@parroquia.com',
            role: 'admin',
            status: 'activo',
            lastLogin: '2025-01-15 10:30'
        },
        {
            id: 2,
            name: 'María González',
            email: 'maria.gonzalez@parroquia.com',
            role: 'secretaria',
            status: 'activo',
            lastLogin: '2025-01-15 09:15'
        },
        {
            id: 3,
            name: 'Juan Pérez',
            email: 'juan.perez@parroquia.com',
            role: 'tesorero',
            status: 'inactivo',
            lastLogin: '2025-01-10 16:45'
        }
    ];

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de Usuarios"
                subtitle="Administra los usuarios del sistema"
                icon={Users}
            >
                <motion.button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Usuario
                </motion.button>
            </PageHeader>

            <Card>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar usuarios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Usuario</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Rol</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Último Acceso</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <motion.tr
                                    key={user.id}
                                    className="border-b border-gray-100 hover:bg-gray-50"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-medium">
                                                    {user.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                            user.role === 'secretaria' ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            <Shield className="w-3 h-3" />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                            user.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-600">
                                        {user.lastLogin}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default UsersPage;