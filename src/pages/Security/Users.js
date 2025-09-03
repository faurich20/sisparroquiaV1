// src/pages/security/UsersPage.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Edit, Trash2, Shield } from 'lucide-react';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import ActionButton from '../../components/Common/ActionButton';

const UsersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const users = [
        { id: 1, name: 'Padre Miguel', email: 'padre.miguel@parroquia.com', role: 'admin', status: 'activo', lastLogin: '2025-01-15 10:30' },
        { id: 2, name: 'María González', email: 'maria.gonzalez@parroquia.com', role: 'secretaria', status: 'activo', lastLogin: '2025-01-15 09:15' },
        { id: 3, name: 'Juan Pérez', email: 'juan.perez@parroquia.com', role: 'tesorero', status: 'inactivo', lastLogin: '2025-01-10 16:45' },
        { id: 4, name: 'Ana López', email: 'ana.lopez@parroquia.com', role: 'colaborador', status: 'activo', lastLogin: '2025-01-12 11:20' },
        { id: 5, name: 'Carlos Ruiz', email: 'carlos.ruiz@parroquia.com', role: 'tesorero', status: 'activo', lastLogin: '2025-01-09 08:50' },
        { id: 6, name: 'Lucía Fernández', email: 'lucia.fernandez@parroquia.com', role: 'secretaria', status: 'inactivo', lastLogin: '2025-01-05 14:10' },
    ];

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

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
                {/* 🔎 Buscador */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
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

                {/* 📋 Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-4 font-semibold text-gray-900">Usuario</th>
                                <th className="text-center py-2 px-4 font-semibold text-gray-900">Rol</th>
                                <th className="text-center py-2 px-4 font-semibold text-gray-900">Estado</th>
                                <th className="text-left py-2 px-4 font-semibold text-gray-900">Último Acceso</th>
                                <th className="text-left py-2 px-4 font-semibold text-gray-900">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user, index) => (
                                    <motion.tr
                                        key={user.id}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td className="py-2 px-4">
                                            <div className="flex items-center gap-3">
                                                {/* 🎨 Avatar que cambia con el tema */}
                                                <div
                                                    className="w-9 h-9 rounded-full flex items-center justify-center"
                                                    style={{
                                                        background: "linear-gradient(135deg, var(--primary), var(--secondary))"
                                                    }}
                                                >
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
                                        <td className="py-2 px-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${
                                                user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                user.role === 'secretaria' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                <Shield className="w-3 h-3" />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                                                user.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 text-sm text-gray-600">
                                            {user.lastLogin}
                                        </td>
                                        <td className="py-2 px-4">
                                            <div className="flex items-center gap-2">
                                                <ActionButton color="blue" icon={Edit} onClick={() => console.log("Editar", user.id)}>
                                                    Editar
                                                </ActionButton>
                                                <ActionButton color="red" icon={Trash2} onClick={() => console.log("Eliminar", user.id)}>
                                                    Eliminar
                                                </ActionButton>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">
                                        No hay más usuarios en esta página
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 📌 Paginación con input */}
                <div className="flex justify-between items-center mt-4 px-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Página</span>
                        <input
                            type="number"
                            value={currentPage}
                            min={1}
                            max={totalPages}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 1 && value <= totalPages) {
                                    setCurrentPage(value);
                                } else if (e.target.value === "") {
                                    setCurrentPage("");
                                }
                            }}
                            onBlur={(e) => {
                                let value = Number(e.target.value);
                                if (!value || value < 1) value = 1;
                                if (value > totalPages) value = totalPages;
                                setCurrentPage(value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    let value = Number(e.currentTarget.value);
                                    if (!value || value < 1) value = 1;
                                    if (value > totalPages) value = totalPages;
                                    setCurrentPage(value);
                                }
                            }}
                            className="w-14 px-2 py-1 border rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span>de {totalPages || 1}</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
                        >
                            Anterior
                        </button>

                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                                    currentPage === i + 1
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default UsersPage;
