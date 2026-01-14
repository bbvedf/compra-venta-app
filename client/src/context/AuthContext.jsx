//client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export const AuthContext = createContext({
  user: null,
  isLoggedIn: false,
  loading: true,
  error: null,
  setError: () => { },
  login: () => { },
  logout: () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Función para sincronizar el estado de autenticación
  const syncAuthState = (token, userData = null) => {
    console.log('🔄 Sincronizando estado auth - token:', !!token);
    if (token) {
      localStorage.setItem('token', token);
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('🔍 AuthContext verificando token:', token ? 'SÍ' : 'NO');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const { user } = await response.json();
          console.log('✅ Usuario verificado:', user);
          setUser(user);
          setIsLoggedIn(true);

          // Verificar si hay una redirección pendiente en la URL
          const urlParams = new URLSearchParams(window.location.search);
          const from = urlParams.get('from');

          if (from) {
            console.log('⏳ Manteniendo ruta para redirección manual:', from);
            // No hacemos navigate('/dashboard') si hay un 'from'
          } else if (user?.isApproved) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/welcome', { replace: true });
          }
        } else {
          console.log('❌ Token inválido, limpiando...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error al verificar auth:', error);
        setError("Error al verificar autenticación");
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📥 Respuesta login:', data);

      if (!response.ok) {
        if (response.status === 403 && data.requiresApproval) {
          navigate('/welcome', {
            state: { email: data.email || email },
            replace: true
          });
          return { requiresApproval: true };
        }
        throw new Error(data.error || 'Error en login');
      }

      // Sincronizar el estado con el token recibido
      syncAuthState(data.token, data.user);
      navigate(data.user.isApproved ? '/dashboard' : '/welcome', { replace: true });
      return data;

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.warn('Logout falló (pero continuamos):', error);
    } finally {
      syncAuthState(null); // Limpiar estado
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      loading,
      error,
      setError,
      login,
      logout
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};