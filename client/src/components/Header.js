// client/src/components/Header.js
import React from 'react';
// Importa ambos logos
import logoLight from '../assets/logo_light.png';
import logoDark from '../assets/logo_dark.png';

const Header = ({ theme }) => {
  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    padding: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1000,
    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F8F9FA',
    color: theme === 'dark' ? '#fff' : '#000',
  };

  // Selecciona el logo según el tema
  const logoSrc = theme === 'dark' ? logoDark : logoLight;

  return (
    <header style={headerStyle}>
      <img 
        src={logoSrc} 
        alt="Logo" 
        style={{ 
          height: '40px', 
          width: '40px', 
          marginLeft: '10px', 
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F8F9FA',
          padding: '5px',
          borderRadius: '50%',          
          objectFit: 'cover',
        }} 
      />
      {/* Opcional: Nombre de la app */}
    </header>
  );
};

export default Header;