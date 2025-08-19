# 🔐 API - Compra-Venta App

Este documento describe los endpoints principales del sistema de autenticación.

---

## 📌 Endpoints Clave

| Método HTTP | Endpoint               | Descripción                           |
|-------------|------------------------|---------------------------------------|
| `POST`      | `/api/auth/register`   | Registro de nuevos usuarios           |
| `POST`      | `/api/auth/login`      | Autenticación con JWT                 |
| `POST`      | `/api/auth/google`     | Login con cuenta de Google (OAuth2)   |
| `GET`       | `/api/auth/verify`     | Validación del token JWT              |

---

## 🌟 Funcionalidades Destacadas

### ✅ Sistema de Aprobación
- Usuarios nuevos van a `/welcome` hasta ser aprobados.  
- Integración con lista de emails permitidos.  

### ✅ Autenticación con Google OAuth
- Inicio de sesión con cuenta de Google.  
- Redirección automática y almacenamiento de token.  

### ✅ Seguridad Mejorada
- Tokens JWT con expiración.  
- Contraseñas hasheadas con bcrypt.  
- Middleware de verificación.  
- Protección contra CSRF.  

### ✅ Experiencia de Usuario
- Redirecciones inteligentes.  
- Mensajes de error descriptivos.  
- Indicadores de carga (loading states).  

---

## 📈 Calculadoras Integradas

### 📊 Interés Compuesto
- Capital inicial + aportes periódicos.  
- Proyección con ajuste por inflación.  
- Gráfica de resultados.  
- Export a PDF, Excel o envío por correo electrónico.  

### 🏡 Amortización Hipotecaria
- Cálculo de pagos periódicos.  
- Tabla completa de amortización.  
- Gráfica del saldo y pagos.  
- Export a PDF, Excel o correo electrónico.  

---

## 📋 Logging y Auditoría
- Cada acción relevante del usuario (registro, login, logout, login fallido, login pendiente de aprobación) se almacena en `users_logs`.  
- `userLogger` gestiona la creación de estos eventos.  
- Útil para auditorías y alertas de seguridad.  

---

## 🧪 Tests y Mocks
- Tests de Google Login usan mocks de `google-auth-library` y `nodemailer`.  
- La base de datos se inicializa y limpia automáticamente durante los tests de integración (`authFlow.test.js`).  
- Los eventos de usuario se validan con consultas a `users_logs`.  
