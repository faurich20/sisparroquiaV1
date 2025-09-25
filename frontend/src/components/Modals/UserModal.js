// parroquia-frontend/src/components/Modals/UserModal.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader, Eye, EyeOff, User } from 'lucide-react';

const UserModal = ({ isOpen, mode, user, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        permissions: ['dashboard'],
        status: 'activo'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Roles y permisos válidos (igual que backend)
    const validRoles = ['admin', 'secretaria', 'tesorero', 'colaborador', 'user'];
    const validPermissions = [
        'dashboard', 'security', 'personal', 'liturgical',
        'accounting', 'sales', 'purchases', 'warehouse',
        'configuration', 'reports'
    ];

    // Función para obtener nombre legible del rol
    const getRoleName = (role) => {
        const roleNames = {
            'admin': 'Administrador',
            'secretaria': 'Secretaria',
            'tesorero': 'Tesorero',
            'colaborador': 'Colaborador',
            'user': 'Usuario'
        };
        return roleNames[role] || role;
    };

    // Función para obtener nombre legible del estado
    const getStatusName = (status) => {
        return status === 'activo' ? 'Activo' : 'Inactivo';
    };

    // Función para obtener clase CSS del estado
    const getStatusClass = (status) => {
        return status === 'activo' 
            ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm'
            : 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm';
    };

    // Función para verificar si el email ya existe (movida fuera de validate)
    const checkEmailExists = async (email) => {
        try {
            console.log('🔍 Verificando email existente:', email);
            // Cambiar 'token' por 'access_token'
            const token = localStorage.getItem('access_token');
            console.log('🔐 Token presente:', !!token);
            console.log('🔐 Token valor:', token?.substring(0, 50) + '...');
            
            if (!token) {
                console.error('❌ No hay token disponible');
                throw new Error('Token de autenticación no encontrado');
            }
            
            const url = `http://localhost:5000/api/users/check-email?email=${encodeURIComponent(email)}`;
            console.log('🌐 URL completa:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Status respuesta:', response.status);
            console.log('📡 Status OK:', response.ok);
            console.log('📡 Content-Type:', response.headers.get('content-type'));
            
            // Verificar el tipo de contenido antes de parsear JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Si no es JSON, obtener el texto para ver qué está devolviendo
                const textResponse = await response.text();
                console.error('❌ Respuesta no es JSON:', textResponse.substring(0, 200));
                throw new Error('El servidor no está respondiendo correctamente. Verifique que el endpoint /api/users/check-email exista.');
            }
            
            if (response.ok) {
                const data = await response.json();
                console.log('📊 Datos recibidos del check-email:', data);
                console.log('🔍 Email existe según backend:', data.exists);
                return data.exists; // true o false
            } else if (response.status === 401) {
                console.error('❌ Token inválido o expirado');
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            } else {
                console.error('❌ Error en respuesta check-email:', response.status, response.statusText);
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Error data check-email:', errorData);
                throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
            }
        } catch (err) {
            console.error('💥 Error en checkEmailExists:', err);
            // Re-lanzamos el error para que se maneje en handleSubmit
            throw err;
        }
    };

    // Llenar formulario cuando se abre en cualquier modo
    useEffect(() => {
        if ((mode === 'edit' || mode === 'view') && user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                confirmPassword: '',
                role: user.role || 'user',
                permissions: user.permissions || ['dashboard'],
                status: user.status || 'activo'
            });
        } else {
            // Resetear formulario para modo agregar
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'user',
                permissions: ['dashboard'],
                status: 'activo'
            });
        }
        setError('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    }, [mode, user, isOpen]);

    // Validaciones frontend (sin verificación de email duplicado)
    const validate = () => {
        // Nombre
        if (!formData.name.trim()) {
            return 'El nombre es requerido';
        }
        if (formData.name.length < 3) {
            return 'El nombre debe tener al menos 3 caracteres';
        }
        if (formData.name.length > 100) {
            return 'El nombre no puede superar 100 caracteres';
        }

        // Email
        if (!formData.email.trim()) {
            return 'El email es requerido';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return 'Formato de email inválido';
        }

        // Password solo si es creación o si se cambia
        if (mode === 'add' || formData.password) {
            if (!formData.password) {
                return 'La contraseña es requerida';
            }
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial';
            }
            if (formData.password !== formData.confirmPassword) {
                return 'Las contraseñas no coinciden';
            }
        }

        // Rol
        if (!validRoles.includes(formData.role)) {
            return 'Rol inválido';
        }

        // Permisos
        if (!formData.permissions.every(p => validPermissions.includes(p))) {
            return 'Permisos inválidos';
        }

        // Estado
        if (!['activo', 'inactivo'].includes(formData.status)) {
            return 'Estado inválido';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('🔄 Iniciando envío de formulario...');
        console.log('📋 Modo:', mode);
        console.log('📧 Email actual:', formData.email);
        console.log('📧 Email usuario original:', user?.email);

        try {
            // Ejecutar validaciones básicas PRIMERO
            const validationError = validate();
            if (validationError) {
                console.log('❌ Error de validación:', validationError);
                setError(validationError);
                setLoading(false);
                return;
            }

            // Verificar email duplicado ANTES de enviar
            const emailToCheck = formData.email.trim().toLowerCase();
            const originalEmail = user?.email?.toLowerCase() || '';
            
            if (mode === 'add' || (mode === 'edit' && emailToCheck !== originalEmail)) {
                console.log('🔍 Verificando email duplicado...');
                console.log('📧 Email a verificar:', emailToCheck);
                console.log('📧 Email original:', originalEmail);
                console.log('🔄 Necesita verificación:', true);
                
                try {
                    const exists = await checkEmailExists(emailToCheck);
                    console.log('🔍 Resultado verificación:', exists);
                    
                    if (exists) {
                        console.log('❌ Email ya existe - DETENIENDO ENVÍO');
                        setError('El email ya está registrado');
                        setLoading(false);
                        return;
                    }
                    console.log('✅ Email disponible - CONTINUANDO');
                } catch (err) {
                    console.error('❌ Error verificando email:', err);
                    setError(err.message || 'Error verificando email');
                    setLoading(false);
                    return;
                }
            } else {
                console.log('ℹ️ No necesita verificar email (sin cambios)');
            }

            const userData = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                role: formData.role,
                permissions: formData.permissions,
                status: formData.status
            };

            // Solo incluir password si se está creando o cambiando
            if (mode === 'add') {
                userData.password = formData.password;
            } else if (formData.password) {
                userData.password = formData.password;
            }

            console.log('📤 Datos a enviar:', userData);

            console.log('📤 Enviando al backend...');
            const result = await onSubmit(userData, mode === 'add' ? 'create' : 'edit');

            console.log('📨 Resultado del backend:', result);

            if (result && result.success) {
                console.log('✅ Éxito - Cerrando modal');
                onClose();
            } else {
                console.log('❌ Error del backend:', result?.error || 'Error desconocido');
                setError(result?.error || 'Error al procesar la solicitud');
            }
        } catch (err) {
            console.error('💥 Error en handleSubmit:', err);
            setError('Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = (permission) => {
        if (mode === 'view') return; // No permitir cambios en modo vista
        
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    // Función para obtener el título del modal
    const getModalTitle = () => {
        switch (mode) {
            case 'add': return 'Nuevo Usuario';
            case 'edit': return 'Editar Usuario';
            case 'view': return 'Información del Usuario';
            default: return 'Usuario';
        }
    };

    if (!isOpen) return null;

    const isReadOnly = mode === 'view';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <motion.div
                    className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div className="flex items-center gap-3">
                            {mode === 'view' && <User className="w-6 h-6 text-blue-600" />}
                            <h2 className="text-xl font-semibold">
                                {getModalTitle()}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    {mode === 'view' ? (
                        // Modo visualización - Solo lectura
                        <div className="p-6 space-y-6">
                            {/* Avatar e información principal */}
                            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {user?.name || 'Usuario sin nombre'}
                                    </h3>
                                    <p className="text-gray-600">
                                        {user?.email || 'Sin email'}
                                    </p>
                                </div>
                            </div>

                            {/* Información detallada */}
                            <div className="grid grid-cols-1 gap-6">
                                {/* Rol y Estado */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 border rounded-lg">
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            Rol del usuario
                                        </label>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                            <span className="text-lg font-medium text-gray-900">
                                                {getRoleName(user?.role)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 border rounded-lg">
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            Estado actual
                                        </label>
                                        <span className={getStatusClass(user?.status || 'inactivo')}>
                                            {getStatusName(user?.status || 'inactivo')}
                                        </span>
                                    </div>
                                </div>

                                {/* Permisos asignados */}
                                <div className="bg-white p-4 border rounded-lg">
                                    <label className="block text-sm font-medium text-gray-500 mb-3">
                                        Permisos asignados ({user?.permissions?.length || 0})
                                    </label>
                                    {user?.permissions && user.permissions.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {user.permissions.map((permission, index) => (
                                                <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                    <span className="text-sm text-blue-800 font-medium capitalize">
                                                        {permission}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                                            <span className="text-gray-500 italic">No hay permisos asignados</span>
                                        </div>
                                    )}
                                </div>

                                {/* Información adicional */}
                                <div className="bg-white p-4 border rounded-lg">
                                    <label className="block text-sm font-medium text-gray-500 mb-3">
                                        Información adicional
                                    </label>
                                    <div className="space-y-3 text-sm">
                                        {user?.created_at && (
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-gray-600">Fecha de registro:</span>
                                                <span className="font-medium text-gray-900">
                                                    {new Date(user.created_at).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {user?.updated_at && (
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-gray-600">Última modificación:</span>
                                                <span className="font-medium text-gray-900">
                                                    {new Date(user.updated_at).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {user?.last_login ? (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600">Último acceso:</span>
                                                <span className="font-medium text-gray-900">
                                                    {new Date(user.last_login).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600">Último acceso:</span>
                                                <span className="text-gray-500 italic">Nunca</span>
                                            </div>
                                        )}
                                        
                                        {/* ID del usuario si está disponible */}
                                        {user?.id && (
                                            <div className="flex justify-between items-center py-2 border-t border-gray-100 pt-3">
                                                <span className="text-gray-600">ID del usuario:</span>
                                                <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                                    {user.id}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer solo con botón cerrar */}
                            <div className="pt-4">
                                <button
                                    onClick={onClose}
                                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Modo formulario (add/edit)
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nombre completo *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    readOnly={isReadOnly}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                    readOnly={isReadOnly}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                />
                            </div>

                            {/* Contraseña - Solo mostrar en modos add/edit */}
                            {!isReadOnly && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Contraseña {mode === 'add' ? '*' : '(dejar vacío para no cambiar)'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                                required={mode === 'add'}
                                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirmar Contraseña */}
                                    {(mode === 'add' || formData.password) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Confirmar contraseña *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                    required
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Rol */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Rol *
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                    required
                                    disabled={isReadOnly}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                >
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                    <option value="secretaria">Secretaria</option>
                                    <option value="tesorero">Tesorero</option>
                                    <option value="colaborador">Colaborador</option>
                                </select>
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Estado
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    disabled={isReadOnly}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                >
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>

                            {/* Permisos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Permisos
                                </label>
                                <div className="grid grid-cols-2 gap-2 p-3 border border-gray-300 rounded-lg">
                                    {validPermissions.map(permission => (
                                        <label key={permission} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.includes(permission)}
                                                onChange={() => handlePermissionChange(permission)}
                                                disabled={isReadOnly}
                                                className="mr-2 rounded focus:ring-blue-500 disabled:opacity-50"
                                            />
                                            <span className="text-sm text-gray-700 capitalize">{permission}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                                >
                                    {loading ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {mode === 'add' ? 'Crear' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UserModal;