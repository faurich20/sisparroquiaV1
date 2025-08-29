import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <motion.header
            className="bg-white border-b border-gray-200 px-6 py-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Buscador */}
                    <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2 w-96">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar en el sistema..."
                            className="bg-transparent border-none outline-none flex-1 text-gray-700 placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <motion.button
                        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Bell className="w-6 h-6 text-gray-600" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </motion.button>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <motion.button
                                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <User className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                                onClick={logout}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;