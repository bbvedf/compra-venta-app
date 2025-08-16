import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { API_BASE_URL } from '../config';
import ThemeMenu from './ThemeMenu';
import CompoundInterestCalculator from './CompoundInterestCalculator';
import MortgageCalculator from './MortgageCalculator';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // Obtiene el objeto location
  
  // Estado inicial con el valor de location.state o por defecto 'inicio'
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || 'inicio'
  );

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Efecto para actualizar cuando cambia el estado de navegación
  useEffect(() => {
    if (location.state?.activeTab && location.state.activeTab !== activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]); // Se ejecuta cuando location.state cambia

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  }, [theme]);

useEffect(() => {
  if (!user) {
    navigate('/login');
  } else if (!user.isApproved && window.location.pathname !== '/welcome') {
    navigate('/welcome', { 
      state: { 
        email: user.email,
        activeTab: location.state?.activeTab // Preserva el tab activo
      } 
    });
  }
}, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'configuracion' && user?.role === 'admin') {
      fetchUsers();
    }
  }, [activeTab, user?.role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Añade este console.log para debuggear:
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Users data:', data); // Verifica que llegan datos

      if (!response.ok) throw new Error(data.error || 'Error al cargar usuarios');
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Muestra un mensaje de error en la UI si lo prefieres
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action, userId, data = null) => {
    try {
      const fetchOptions = {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };

      // Solo incluye el Content-Type y el body si no es DELETE
      if (action !== 'delete') {
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify(data);
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, fetchOptions);

      if (response.ok) {
        fetchUsers();
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await handleUserAction('delete', userToDelete.id);
        setShowDeleteModal(false);
        setUserToDelete(null);
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Panel de Administración</h2>
        <ThemeMenu
          theme={theme}
          setTheme={setTheme}
          onLogout={logout}
        />
        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirmar Eliminación</h3>
              <p>
                ¿Estás seguro de querer eliminar al usuario
                <strong> {userToDelete?.email}</strong>?
              </p>
              <div className={styles.modalButtons}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className={styles.deleteButton}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      

      <div className={styles.tabContent}>
        {
          {
            'inicio': (
              <div className={styles.welcomeSection}>
                <h3>Bienvenido, {user?.name || user?.email}</h3>
                <div className={styles.userInfo}>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Rol:</strong> {user?.role}</p>
                  <p><strong>Aprobado:</strong> {user?.isApproved ? 'Verificado' : 'Pendiente'}</p>
                </div>
              </div>
            ),
            'configuracion': (
              <div className={styles.adminPanel}>
                {loading ? (
                  <p>Cargando usuarios...</p>
                ) : (
                  <>
                    <h3>Gestión de Usuarios</h3>
                    <div className={styles.userTableContainer}>
                      <table className={styles.userTable}>
                        <thead>
                          <tr>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Aprobado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td>{user.email}</td>
                              <td>
                                <div className={styles.roleSelectContainer}>
                                  <select
                                    value={user.role}
                                    onChange={(e) => handleUserAction('update', user.id, { role: e.target.value })}
                                    className={styles.roleSelect}
                                  >
                                    <option value="admin">Admin</option>
                                    <option value="basic">Básico</option>
                                  </select>
                                </div>
                              </td>
                              <td>
                                <label className={styles.switch}>
                                  <input
                                    type="checkbox"
                                    checked={user.isApproved || false}
                                    onChange={(e) => handleUserAction('update', user.id, {
                                      isApproved: e.target.checked,
                                      role: user.role || 'basic'
                                    })}
                                  />
                                  <span className={styles.slider}></span>
                                </label>
                              </td>
                              <td>
                                <button
                                  onClick={() => handleDeleteClick(user)}
                                  className={styles.deleteButton}
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            ),
            'calculadora': <CompoundInterestCalculator />,
            'mortgage': <MortgageCalculator />,
          }[activeTab]
        }
      </div>
    </div>
  );
}

export default Dashboard;