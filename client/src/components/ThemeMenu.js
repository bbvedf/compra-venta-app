import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './ThemeMenu.module.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ThemeMenu = ({ theme, setTheme, setShowLogoutModal }) => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [openSubmenus, setOpenSubmenus] = useState({ finanzas: false, geo: false });
    const navigate = useNavigate();

    const toggleSubmenu = (menu, e) => {
        e.stopPropagation();
        setOpenSubmenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

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
                    {user && user.isApproved !== false ? (
                        <>
                            {/* --- SECCIÓN: NAVEGACIÓN --- */}
                            <div className={styles.sectionHeader}>Navegación</div>
                            <button className={styles.menuItem} onClick={() => handleNavigation('inicio')}>
                                <i className="bi bi-house-fill"></i>
                                Dashboard Principal
                            </button>
                            {user?.role === 'admin' && (
                                <button className={styles.menuItem} onClick={() => handleNavigation('configuracion')}>
                                    <i className="bi bi-people-fill"></i>
                                    Gestión de Usuarios
                                </button>
                            )}

                            <div className={styles.menuDivider}></div>

                            {/* --- SECCIÓN: APLICACIONES --- */}
                            <div className={styles.sectionHeader}>Aplicaciones</div>

                            {/* Finanzas (Colapsable) */}
                            <div className={styles.submenu}>
                                <div className={styles.menuItemContainer}>
                                    <div className={styles.menuItemHeader} onClick={(e) => toggleSubmenu('finanzas', e)}>
                                        <i className="bi bi-wallet2 text-primary"></i>
                                        <span>Finanzas Personales</span>
                                    </div>
                                    <button className={styles.submenuToggle} onClick={(e) => toggleSubmenu('finanzas', e)}>
                                        <i className={`bi bi-chevron-${openSubmenus.finanzas ? 'up' : 'down'}`}></i>
                                    </button>
                                </div>
                                {openSubmenus.finanzas && (
                                    <div className={styles.submenuContent}>
                                        <button className={styles.menuSubItem} onClick={() => window.location.href = '/finanzas/categories'}>
                                            <i className="bi bi-folder2-open"></i> Categorías
                                        </button>
                                        <button className={styles.menuSubItem} onClick={() => window.location.href = '/finanzas/transactions'}>
                                            <i className="bi bi-cash-stack"></i> Transacciones
                                        </button>
                                        <button className={styles.menuSubItem} onClick={() => window.location.href = '/finanzas/stats'}>
                                            <i className="bi bi-graph-up-arrow"></i> Estadísticas
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Geo-Data (Colapsable) */}
                            <div className={styles.submenu}>
                                <div className={styles.menuItemContainer}>
                                    <div className={styles.menuItemHeader} onClick={(e) => toggleSubmenu('geo', e)}>
                                        <i className="bi bi-geo-alt-fill text-primary"></i>
                                        <span>Geo-Data Analytics</span>
                                    </div>
                                    <button className={styles.submenuToggle} onClick={(e) => toggleSubmenu('geo', e)}>
                                        <i className={`bi bi-chevron-${openSubmenus.geo ? 'up' : 'down'}`}></i>
                                    </button>
                                </div>
                                {openSubmenus.geo && (
                                    <div className={styles.submenuContent}>
                                        <button className={styles.menuSubItem} onClick={() => window.location.href = '/geo/'}>
                                            <i className="bi bi-speedometer2"></i> Inicio
                                        </button>
                                        <button className={styles.menuSubItem} onClick={() => window.location.href = '/geo/dataset/covid'}>
                                            <i className="bi bi-virus"></i> COVID España
                                        </button>
                                        <button className={styles.menuSubItem} onClick={() => window.location.href = '/geo/dataset/weather'}>
                                            <i className="bi bi-cloud-sun-fill"></i> Clima España
                                        </button>
                                        <button className={styles.menuSubItem} onClick={() => window.location.href = '/geo/dataset/elections'}>
                                            <i className="bi bi-bar-chart-fill"></i> Resultados Electorales
                                        </button>
                                        <button className={styles.menuSubItem} onClick={() => window.location.href = '/geo/dataset/airquality'}>
                                            <i className="bi bi-wind"></i> Calidad del Aire
                                        </button>
                                        <button className={styles.menuSubItem} onClick={() => window.location.href = '/geo/dataset/housing'}>
                                            <i className="bi bi-house-door-fill"></i> Precios Vivienda
                                        </button>
                                    </div>
                                )}
                            </div>

                            {user?.role === 'admin' && (
                                <button className={styles.menuItem} onClick={() => window.location.href = '/tickets/'}>
                                    <i className="bi bi-ticket-perforated-fill"></i> Sistema de Tickets
                                </button>
                            )}

                            <button className={styles.menuItem} onClick={() => window.location.href = '/contactos/'}>
                                <i className="bi bi-person-lines-fill"></i> Agenda de Contactos
                            </button>

                            <div className={styles.menuDivider}></div>

                            {/* --- SECCIÓN: HERRAMIENTAS --- */}
                            <div className={styles.sectionHeader}>Herramientas</div>
                            <button className={styles.menuItem} onClick={() => handleNavigation('calculadora')}>
                                <i className="bi bi-calculator-fill"></i> Interés Compuesto
                            </button>
                            <button className={styles.menuItem} onClick={() => handleNavigation('mortgage')}>
                                <i className="bi bi-house-door-fill"></i> Hipoteca
                            </button>
                            <button className={styles.menuItem} onClick={() => handleNavigation('basic-calculator')}>
                                <i className="bi bi-percent"></i> Calculadora Básica
                            </button>

                            <div className={styles.menuDivider}></div>
                        </>
                    ) : (
                        <div className={styles.sectionHeader}>Sistema</div>
                    )}

                    {/* --- SECCIÓN: SISTEMA --- */}
                    <button
                        className={styles.menuItem}
                        onClick={() => {
                            setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
                            setIsOpen(false);
                        }}
                    >
                        {theme === 'light' ? (
                            <>
                                <i className="bi bi-moon-stars-fill"></i> Modo Oscuro
                            </>
                        ) : (
                            <>
                                <i className="bi bi-sun-fill"></i> Modo Claro
                            </>
                        )}
                    </button>

                    {user && (
                        <button className={`${styles.menuItem} ${styles.logoutItem}`} onClick={() => {
                            if (setShowLogoutModal) {
                                setShowLogoutModal(true);
                            } else {
                                if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                                    logout();
                                }
                            }
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