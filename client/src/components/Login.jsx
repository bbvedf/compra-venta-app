// client/src/components/Login.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { GoogleLogin } from '@react-oauth/google';
import googleLogo from '../assets/google-icon.svg';
import { API_BASE_URL } from '../config';
import authService from '../utils/auth';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const query = new URLSearchParams(window.location.search);
  const from = query.get('from') || '/dashboard';
  const { isLoggedIn, user } = useContext(AuthContext);

  // Redirección automática si ya está logueado (caso verifyAuth exitoso con 'from')
  useEffect(() => {
    if (isLoggedIn && user?.isApproved && from !== '/dashboard') {
      const externalApps = ['/tickets', '/geo', '/finanzas', '/contactos'];
      const isExternal = externalApps.some(app => from.startsWith(app));

      if (isExternal) {
        // Evitar bucles: si acabamos de intentar redirigir a esta misma URL, paramos
        const lastRedirect = sessionStorage.getItem('last_redirect');
        if (lastRedirect === from) {
          console.warn('🛑 Bucle de redirección detectado para:', from);
          return;
        }

        console.log('🚀 Redirigiendo a app externa:', from);
        sessionStorage.setItem('last_redirect', from);
        window.location.href = from;
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isLoggedIn, user, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 Enviando datos de login:', form);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      console.log('📥 Respuesta recibida, status:', response.status);

      if (response.status === 403) {
        const data = await response.json();
        console.log('🟡 Requiere aprobación:', data);
        if (data.requiresApproval) {
          navigate('/welcome', {
            state: { email: data.email, username: data.userData?.username },
            replace: true,
          });
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Credenciales inválidas');
      }

      const data = await response.json();
      console.log('✅ Login exitoso, token recibido:', data.token ? 'SÍ' : 'NO');

      // Verificar que authService.login existe
      if (typeof authService.login !== 'function') {
        console.error('❌ authService.login no es una función');
        throw new Error('Error de configuración del servicio de autenticación');
      }

      // Llamar a authService.login
      console.log('🔄 Llamando a authService.login...');
      await authService.login(data.token, null, data.user);
      console.log('✅ authService.login completado');

      // Redirigir según el estado de aprobación
      if (data.user?.isApproved) {
        // Si el 'from' es una app externa, usamos window.location.href
        const externalApps = ['/tickets', '/geo', '/finanzas', '/contactos'];
        const isExternal = externalApps.some(app => from.startsWith(app));

        if (isExternal) {
          console.log('🚀 Redirigiendo a app externa:', from);
          window.location.href = from;
        } else {
          console.log('🏠 Redirigiendo a ruta interna:', from);
          navigate(from, { replace: true });
        }
      } else {
        navigate('/welcome', { replace: true });
      }

    } catch (err) {
      console.error('❌ Error en login:', err.message);
      setError(err.message);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      console.log('🔵 Iniciando login con Google...');
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();
      console.log('📥 Respuesta Google login:', data);

      if (response.status === 403 && data.requiresApproval) {
        navigate('/welcome', {
          state: { email: data.email, username: data.userData?.username },
          replace: true,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error al autenticar con Google');
      }

      // Usar AuthService para Google login
      await authService.login(data.token, null, data.user);

      // Redirigir
      if (data.user?.isApproved) {
        const externalApps = ['/tickets', '/geo', '/finanzas', '/contactos'];
        const isExternal = externalApps.some(app => from.startsWith(app));

        if (isExternal) {
          window.location.href = from;
        } else {
          navigate(from, { replace: true });
        }
      } else {
        navigate('/welcome', { replace: true });
      }

    } catch (err) {
      console.error('❌ Error en Google login:', err);
      setError('Error al autenticar con Google: ' + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <form onSubmit={handleSubmit}>
          <h2>Iniciar Sesión</h2>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Contraseña"
              required
            />
          </div>
          <button type="submit" className={styles.button}>Entrar</button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.separator}><span>o continúa con</span></div>

        <div className={styles.googleButton}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError('Error al autenticar con Google')}
            useOneTap={false}
            render={({ onClick }) => (
              <button onClick={onClick} className={styles.googleCustomButton}>
                <img src={googleLogo} alt="Google" className={styles.googleIcon} />
                <span className={styles.googleText}>Iniciar sesión con Google</span>
              </button>
            )}
          />
        </div>

        <p className={styles.footer}>
          ¿No tienes cuenta? <a href="/register">Regístrate</a>
        </p>
        <p className={styles.footer}>
          ¿Olvidaste tu contraseña? Recupérala <a href="/reset-password">aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;