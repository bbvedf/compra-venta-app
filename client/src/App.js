//Importaciones
import { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
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
      <ThemeMenu theme={theme} setTheme={setTheme} />
      
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
    </>
  );
}

export default App;