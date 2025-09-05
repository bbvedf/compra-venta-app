import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './ThemeMenu.module.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ThemeMenu = ({ theme, setTheme }) => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigation = (tab) => {
        navigate('/dashboard', {
            state: { activeTab: tab },
            replace: true
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
                            <i className="bi bi-house-fill"></i>
                            Inicio
                        </button>
                    )}
                    {user?.role === 'admin' && (
                        <button className={styles.menuItem} onClick={() => handleNavigation('configuracion')}>
                            <i className="bi bi-people-fill"></i>
                            Gestión de Usuarios
                        </button>
                    )}

                    {user?.role === 'admin' && (
                        <>
                            <div className={styles.menuDivider}></div>

                            {/* Submenú Finanzas */}
                            <div className={styles.submenu}>
                                <div className={styles.submenuHeader}>
                                    <i className="bi bi-wallet2"></i>
                                    Finanzas
                                </div>

                                <button className={styles.menuItem} onClick={() => window.location.href = '/finanzas/categories'}>
                                    <i className="bi bi-folder-fill"></i>
                                    Categorías
                                </button>

                                <button className={styles.menuItem} onClick={() => window.location.href = '/finanzas/transactions'}>
                                    <i className="bi bi-credit-card-fill"></i>
                                    Transacciones
                                </button>

                                <button className={styles.menuItem} onClick={() => window.location.href = '/finanzas/stats'}>
                                    <i className="bi bi-bar-chart-fill"></i>
                                    Estadísticas
                                </button>
                            </div>
                        </>
                    )}

                    {user?.role === 'admin' && (
                        <button className={styles.menuItem} onClick={() => handleNavigation('calculadora')}>
                            <i className="bi bi-calculator-fill"></i>
                            Interés Compuesto
                        </button>
                    )}

                    {user?.role === 'admin' && (
                        <button className={styles.menuItem} onClick={() => handleNavigation('mortgage')}>
                            <i className="bi bi-graph-up"></i>
                            Amortización Hipoteca
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
                                <i className="bi bi-moon-fill"></i> Modo Oscuro
                            </>
                        ) : (
                            <>
                                <i className="bi bi-sun-fill"></i> Modo Claro
                            </>
                        )}
                    </button>

                    {user && (
                        <button className={styles.menuItem} onClick={() => {
                            logout();
                            setIsOpen(false);
                        }}>
                            <i className="bi bi-box-arrow-right"></i>
                            Cerrar Sesión
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ThemeMenu;