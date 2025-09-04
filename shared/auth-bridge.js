class AuthBridge {
    constructor() {
        this.tokenKey = 'jwt_token';
        this.userKey = 'user_data';
        this.refreshKey = 'refresh_token';
    }

    // Guardar token en localStorage
    setToken(token, refreshToken = null, userData = null) {
        if (token) {
            localStorage.setItem(this.tokenKey, token);
        }
        if (refreshToken) {
            localStorage.setItem(this.refreshKey, refreshToken);
        }
        if (userData) {
            localStorage.setItem(this.userKey, JSON.stringify(userData));
        }
        
        // Disparar evento personalizado para sincronización
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { token, userData, refreshToken }
        }));
    }

    // Obtener token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Obtener datos del usuario
    getUserData() {
        const data = localStorage.getItem(this.userKey);
        return data ? JSON.parse(data) : null;
    }

    // Obtener refresh token
    getRefreshToken() {
        return localStorage.getItem(this.refreshKey);
    }

    // Verificar si está autenticado
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    // Limpiar autenticación
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.refreshKey);
        
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { token: null, userData: null, refreshToken: null }
        }));
    }

    // Navegar entre aplicaciones
    navigateTo(app, path = '') {
        const routes = {
            'compra-venta': '/',
            'finanzas': '/finanzas/'
        };
        
        if (routes[app]) {
            window.location.href = routes[app] + path;
        }
    }

    // Escuchar cambios de autenticación
    onAuthStateChanged(callback) {
        window.addEventListener('authStateChanged', (event) => {
            callback(event.detail);
        });
    }
}

// Instancia global
window.AuthBridge = new AuthBridge();