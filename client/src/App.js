//Importaciones
import { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Header from './components/Header';
//Componenetes
import Login from './components/Login';
import WelcomePage from './components/WelcomePage';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ResetPassword from './components/ResetPassword';
import NewPassword from './components/NewPassword';
//Estilos
import ThemeMenu from './components/ThemeMenu';
import './index.css';
import { Toaster } from 'react-hot-toast';


function App() {
  const { isLoggedIn } = useContext(AuthContext);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <>
      <Header theme={theme} />
      <div style={{ marginTop: '60px' }}>
        <ThemeMenu theme={theme} setTheme={setTheme} />
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