### 📄 `TESTING.md`

# 🧪 Testing - Compra-Venta App

Este documento cubre cómo se ejecutan y estructuran los tests del proyecto.



## ⚡ Tecnologías
- **Jest** → Framework principal de testing.
- **Supertest** → Para simular peticiones HTTP en los tests de integración.
- **Mocks personalizados**:
  - `google-auth-library` → Simula OAuth2Client.verifyIdToken().
  - `nodemailer` → Simula envío de emails.



## 📂 Estructura
server/tests/  
├── authFlow.test.js # Flujo de registro y login  
├── mocks/ # Mocks de librerías externas  
│ ├── google-auth-library.js  
│ └── nodemailer.js  



## 🚀 Ejecución
```bash
npm run test
```

La base de datos se inicializa y limpia automáticamente.  
Los logs de usuario se validan con consultas a users_logs.  




✅ Cobertura
- Registro de usuario
- Login JWT
- Login con Google OAuth2 (mockeado)
- Validación de tokens
- Logging de eventos de usuario

---
