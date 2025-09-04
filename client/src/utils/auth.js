// client/src/utils/auth.js
// Cargar el script compartido si no existe
if (!window.AuthBridge) {
  const script = document.createElement('script');
  script.src = '/shared/auth-bridge.js';
  script.async = true;
  document.head.appendChild(script);
  console.log('📦 Script AuthBridge cargado');
}

class AuthService {
  constructor() {
    this.authBridge = null;
    this.initialize();
  }

  async initialize() {
    console.log('🔄 Inicializando AuthService...');
    
    // Esperar a que AuthBridge esté disponible
    await this.waitForAuthBridge();
    
    if (window.AuthBridge) {
      this.authBridge = window.AuthBridge;
      console.log('✅ AuthBridge disponible:', this.authBridge);
    } else {
      console.warn('⚠️ AuthBridge no disponible después de esperar');
    }
  }

  waitForAuthBridge() {
    return new Promise((resolve) => {
      if (window.AuthBridge) {
        console.log('✅ AuthBridge ya está disponible');
        resolve();
        return;
      }

      console.log('⏳ Esperando AuthBridge...');
      const checkInterval = setInterval(() => {
        if (window.AuthBridge) {
          clearInterval(checkInterval);
          console.log('✅ AuthBridge cargado después de espera');
          resolve();
        }
      }, 100);

      // Timeout después de 5 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log('⏰ Timeout esperando AuthBridge');
        resolve();
      }, 5000);
    });
  }

  async login(token, refreshToken = null, user = null) {
    console.log('🔐 AuthService.login llamado con token:', token ? 'SÍ' : 'NO');
    
    try {
      // Asegurar que AuthBridge esté inicializado
      if (!this.authBridge) {
        await this.initialize();
      }

      // 1. Guardar en localStorage para React
      if (token) {
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        console.log('✅ Token guardado en localStorage');
      }

      // 2. Pasar a AuthBridge si está disponible
      if (this.authBridge && typeof this.authBridge.setToken === 'function') {
        console.log('🔄 Pasando token a AuthBridge');
        this.authBridge.setToken(token, refreshToken, user);
        console.log('✅ Token pasado a AuthBridge');
      } else {
        console.warn('⚠️ AuthBridge no disponible para setToken');
      }

      return true;

    } catch (error) {
      console.error('❌ Error en AuthService.login:', error);
      throw error;
    }
  }

  setToken(token, refreshToken = null, user = null) {
    console.log('🔐 AuthService.setToken llamado');
    if (this.authBridge && typeof this.authBridge.setToken === 'function') {
      this.authBridge.setToken(token, refreshToken, user);
    } else {
      console.warn('AuthBridge no disponible para setToken');
    }
  }

  logout() {
    console.log('🔓 AuthService.logout llamado');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (this.authBridge && typeof this.authBridge.clearAuth === 'function') {
      this.authBridge.clearAuth();
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  goToFinanzas() {
    if (this.authBridge && typeof this.authBridge.navigateTo === 'function') {
      this.authBridge.navigateTo('finanzas');
    }
  }
}

// Crear y exportar instancia singleton
const authService = new AuthService();
export default authService;