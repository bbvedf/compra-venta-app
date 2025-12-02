import { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Header from './components/Header';
import Login from './components/Login';
import WelcomePage from './components/WelcomePage';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ResetPassword from './components/ResetPassword';
import NewPassword from './components/NewPassword';
import ThemeMenu from './components/ThemeMenu';
import './index.css';
import { Toaster } from 'react-hot-toast';
import styles from './components/Dashboard.module.css';

function App() {
  const { isLoggedIn, logout } = useContext(AuthContext); // ← Añadir logout aquí
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ← NUEVO ESTADO

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <Header theme={theme} />
      
      {/* Modal de logout a nivel de app */}
      {showLogoutModal && (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3>
                    <i className="bi bi-box-arrow-right text-primary me-2"></i>
                    <span>  Confirmar Cierre de Sesión</span>
                </h3>
                <p>¿Estás seguro de que quieres cerrar sesión?</p>
                <div className={styles.modalButtons}>
                    <button 
                        onClick={() => setShowLogoutModal(false)} 
                        className={styles.cancelButton}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirmLogout} 
                        className={styles.deleteButton}
                    >
                        <i className="bi bi-box-arrow-right me-1"></i>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    )}
      
      <div style={{ marginTop: '60px' }}>
        {/* Pasar setShowLogoutModal a ThemeMenu */}
        <ThemeMenu 
          theme={theme} 
          setTheme={setTheme}
          setShowLogoutModal={setShowLogoutModal}  // ← ESTA LÍNEA ES CLAVE
        />
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/new-password/:token" element={<NewPassword />} />
          <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to="/dashboard" />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={['approved']}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} />} />
          <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
        </Routes>
      </div>
    </>
  );
}

export default App;