import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al inicio y verificar token
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');
      
      if (savedUser && accessToken) {
        setUser(JSON.parse(savedUser));
        
        // Verificar si el token es válido
        try {
          const response = await fetch('http://localhost:5000/api/users/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            // Token inválido, intentar refrescar
            await refreshToken();
          }
        } catch (error) {
          console.error('Error verificando token:', error);
          await logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
        console.log('🔐 Intentando login con:', email);
        
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log('📦 Respuesta del login:', data);

        if (response.ok) {
            // ✅ VERIFICAR que los tokens vienen en la respuesta
            console.log('✅ Login exitoso. Tokens recibidos:');
            console.log('Access Token:', data.access_token ? 'SÍ' : 'NO');
            console.log('Refresh Token:', data.refresh_token ? 'SÍ' : 'NO');
            console.log('User:', data.user ? 'SÍ' : 'NO');
            
            // Guardar en localStorage
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Verificar que se guardó
            console.log('💾 Token guardado en localStorage:', 
                localStorage.getItem('access_token') ? 'SÍ' : 'NO');
            
            setUser(data.user);
            return { success: true, user: data.user };
        } else {
            console.log('❌ Error en login:', data.error);
            return { success: false, error: data.error || 'Error en el login' };
        }
    } catch (error) {
        console.log('🌐 Error de conexión:', error);
        return { success: false, error: 'Error de conexión con el servidor' };
    }
};

  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        await logout();
        return false;
      }

      const response = await fetch('http://localhost:5000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        // Actualizar usuario si viene en la respuesta
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return true;
      } else {
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Error refrescando token:', error);
      await logout();
      return false;
    }
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  // Función para hacer requests autenticadas con refresh automático
  const authFetch = async (url, options = {}) => {
    let token = localStorage.getItem('access_token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    };

    let response = await fetch(url, config);

    // Si el token expiró, intentar refrescar y reenviar la request
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        token = localStorage.getItem('access_token');
        config.headers.Authorization = `Bearer ${token}`;
        response = await fetch(url, config);
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      hasPermission, 
      loading,
      authFetch // Exportar la función para requests autenticadas
    }}>
      {children}
    </AuthContext.Provider>
  );
};