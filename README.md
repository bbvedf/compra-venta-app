# 🛒 Compra-Venta App - Sistema de Autenticación  

## 🛠 Stack Tecnológico  
### 🚀 Tecnologías principales
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-✓-2496ED?logo=docker&logoColor=white)

### 🔐 Seguridad y autenticación
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=json-web-tokens)
![Google OAuth](https://img.shields.io/badge/Auth-Google_OAuth2-4285F4?logo=google&logoColor=white)

### 🧪 Testing
![Jest](https://img.shields.io/badge/Tests-Jest-99424f?logo=jest)

---

## 📌 Descripción  
Sistema completo de autenticación con registro, login, rutas protegidas y despliegue Docker en producción.

**Características principales**:
- Registro seguro con validación  
- Login persistente con JWT  
- Dashboard protegido  
- Gestión de usuarios aprobados/no aprobados  
- Login con cuenta de Google (OAuth)  
- Menú unificado en frontend  
- Calculadora de interés compuesto y amortización hipotecaria  
- Logging de eventos de usuario (registro, login, logout, fallos, etc.)  
- Tests con mocks de Google OAuth2 y nodemailer  

---


## ⚡ Instalación Rápida

### 1. Clonar y configurar:
```bash
git clone https://github.com/tu-usuario/compra-venta-app.git
cd compra-venta-app
cp .env.example .env.test  # Configurar variables
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Iniciar entorno de test:
```bash
docker-compose -f docker-compose.test.yml up -d
```


---

## 🌐 Despliegue en Producción  

```bash
cp .env.example .env # Configurar variables
docker-compose -f docker-compose.yml up --build
```

Acceso:  

- Frontend: http://localhost:3000  
- Backend: http://localhost:5000  

Dominio configurado: https://ryzenpc.mooo.com

---


## 📚 Documentación extendida  
- [Guía de contribución](CONTRIBUTING.md)  
- [Desarrollo y scripts](USAGE.md)  
- [Testing y mocks](TESTING.md)  
- [Infraestructura y despliegue](INFRASTRUCTURE.md)  
- [Endpoints y funcionalidades](API.md)

---


## 📝 Próximas Mejoras  
- Swagger/OpenAPI + validación con Joi/zod
- E2E con Cypress
- Helmet + Rate limiting
- Monitoring (Grafana/Prometheus) 
- Nuevos componentes  

---

📌 **Requisitos mínimos**  
- Node.js 18+  
- PostgreSQL 12+  


