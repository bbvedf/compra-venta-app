import { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './ThemeMenu.module.css';
import { FiSun, FiMoon, FiLogOut, FiHome, FiSettings, FiTrendingUp } from 'react-icons/fi';

const ThemeMenu = ({ theme, setTheme }) => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

const handleNavigation = (tab) => {
  navigate('/dashboard', { 
    state: { activeTab: tab },
    replace: true // Esto evita acumular historial de navegación
  });
  setIsOpen(false);
};

    return (
        <div className={styles.menuContainer}>
            <button
                className={styles.hamburgerButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menú"
            >
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
            </button>

            {isOpen && (
                <div className={styles.menuDropdown}>
                    {/* Sección de Navegación */}
                    {user && (
                    <button className={styles.menuItem} onClick={() => handleNavigation('inicio')}>
                        <FiHome size={16} className={styles.icon} />
                        Inicio
                    </button>
                    )}
                    {user?.role === 'admin' && (
                        <button className={styles.menuItem} onClick={() => handleNavigation('configuracion')}>
                            <FiSettings size={16} className={styles.icon} />
                            Configuración
                        </button>
                    )}

                    {user?.role === 'admin' && (
                    <button className={styles.menuItem} onClick={() => handleNavigation('calculadora')}>
                        <FiTrendingUp size={16} className={styles.icon} />
                        Interés Compuesto
                    </button>
                    )}
                  
                    {/* Divisor */}
                    {user && (
                        <div className={styles.menuDivider}></div>
                    )}  

                    {/* Sección de Configuración */}
                    <button
                        className={styles.menuItem}
                        onClick={() => {
                            setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
                            setIsOpen(false);
                        }}
                    >
                        {theme === 'light' ? (
                            <>
                                <FiMoon size={16} className={styles.icon} /> Modo Oscuro
                            </>
                        ) : (
                            <>
                                <FiSun size={16} className={styles.icon} /> Modo Claro
                            </>
                        )}
                    </button>

                    {user && (
                        <button className={styles.menuItem} onClick={() => {
                            logout();
                            setIsOpen(false);
                        }}>
                            <FiLogOut className={styles.icon} />
                            Cerrar Sesión
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ThemeMenu;