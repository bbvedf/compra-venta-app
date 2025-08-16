# 🛒 Compra-Venta App - Sistema de Autenticación  

## 🛠 Stack Tecnológico  
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)  
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js)  
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql&logoColor=white)  
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=json-web-tokens)  
![React Router](https://img.shields.io/badge/React_Router-6.x-CA4245?logo=react-router&logoColor=white)  
![Recharts](https://img.shields.io/badge/Recharts-3.x-FF6384?logo=chart.js&logoColor=white)  
![Docker](https://img.shields.io/badge/Docker-✓-2496ED?logo=docker&logoColor=white)  
![React Icons](https://img.shields.io/badge/React_Icons-5.5.0-F7DF1E?logo=react)  


## 📌 Descripción  
Sistema completo de autenticación con registro, login y rutas protegidas.  

**Características principales**:
- Registro seguro con validación  
- Login persistente con JWT  
- Dashboard protegido  
- Gestión de usuarios aprobados/no aprobados  
- Login con cuenta de Google (OAuth)  
- Menú unificado: Todas las opciones de navegación ahora disponibles en el menú hamburguesa
- Nueva calculadora de interés compuesto
- Nueva calculadora de amortización hipotecaria

---

## 🚀 Tecnologías  

| Frontend               | Backend              |
|------------------------|----------------------|
| React 19               | Node.js 18           |
| React Router 6         | Express 4            |
| Context API            | JWT Authentication   |
| CSS Modules            | PostgreSQL           |
| Google OAuth           | Bcrypt, dotenv       |
| React Icons            |                      |
| React Recharts         |                      |


---

## 🏗️ Estructura del Proyecto  
```
compra-venta-app/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── context/      # Gestión de autenticación
│   │   └── ...
├── server/               # Backend Node.js
│   ├── controllers/
│   ├── routes/
│   └── ...
├── nginx/                # Configuración Nginx + certbot
├── docker-compose.yml    # Entorno Docker local
├── docker-compose.prod.yml # Entorno Docker en producción
```

---

## ⚡ Instalación Rápida

### 1. Clonar y configurar:
```bash
git clone https://github.com/tu-usuario/compra-venta-app.git
cd compra-venta-app
cp .env.example .env  # Configurar variables
```

### 2. Iniciar entorno local:
```bash
docker-compose up --build
```

Acceder:

- Frontend: http://localhost:3000  
- Backend: http://localhost:5000  

---

## 🌐 Despliegue en Producción

Este proyecto puede ejecutarse en entorno productivo con:

- 🔒 HTTPS con certificados Let's Encrypt  
- 🌍 Dominio personalizado: `https://ryzenpc.mooo.com`  
- 🐳 Docker (Nginx + Backend + Frontend)  
- 🔁 Nginx como reverse proxy  
- 📁 Volúmenes persistentes para certificados SSL  

Para iniciar producción:  
```bash
docker-compose -f docker-compose.prod.yml up --build
```

---

## 🧰 Backup y Restore
La aplicación incluye scripts para realizar copias de seguridad completas del proyecto, incluyendo archivos del código y la base de datos Postgres almacenada en volúmenes de Docker.

🔄 Scripts disponibles

mnt_backup.sh → Crea un archivo .tar.gz con:

- Archivos del proyecto (excluyendo node_modules, .git, etc.)

- Volumen de Docker (compra-venta-app_postgres_data) comprimido

mnt_restore.sh → Restaura:

- Todos los archivos del proyecto a su ubicación original

- El volumen de Docker a partir del backup incluido


📦 Backup
```bash
./mnt_backup.sh
````
Esto generará un archivo como:

```text
backup_total_20250807_2130.tar.gz
```

🔁 Restore
```bash
./mnt_restore.sh backup_total_20250807_2130.tar.gz
```
🛑 Advertencia: El restore sobrescribe archivos del proyecto y recrea el volumen de Docker si no existe. Asegúrate de no tener cambios pendientes o contenedores corriendo antes de restaurar.

---


## 🔐 Endpoints Clave

| Método HTTP | Endpoint               | Descripción                           |
|-------------|------------------------|---------------------------------------|
| `POST`      | `/api/auth/register`   | Registro de nuevos usuarios           |
| `POST`      | `/api/auth/login`      | Autenticación con JWT                 |
| `POST`      | `/api/auth/google`     | Login con cuenta de Google            |
| `GET`       | `/api/auth/verify`     | Validación del token JWT              |

---

## 🌟 Funcionalidades Destacadas

✅ **Sistema de Aprobación**  
- Usuarios nuevos van a `/welcome` hasta ser aprobados  
- Integración con lista de emails permitidos  

✅ **Autenticación con Google OAuth**  
- Inicio de sesión con cuenta de Google  
- Redirección automática y almacenamiento de token  

✅ **Seguridad Mejorada**  
- Tokens JWT con expiración  
- Contraseñas hasheadas con bcrypt  
- Middleware de verificación  
- Protección contra CSRF  

✅ **Experiencia de Usuario**  
- Redirecciones inteligentes  
- Mensajes de error descriptivos  
- Indicadores de carga (loading states)  

✅ **Calculadora de Interés Compuesto**  
- Cálculo con capital inicial y aportes periódicos  
- Proyección con ajuste por inflación  
- Visualización gráfica de resultados  
- Exports a PDF, Excel y/o envío por correo electrónico  

✅ **Calculadora de Amortización**  
- Cálculo de pagos periódicos y amortización de capital  
- Generación de tabla de amortización completa  
- Visualización gráfica del saldo y pagos  
- Exports a PDF, Excel y/o envío por correo electrónico  

---

## 🛠️ Desarrollo Local  

### Frontend:
```bash
cd client
npm install
npm start
```

### Backend:
```bash
cd server
npm install
npm run dev
```

---

## 📝 Próximas Mejoras

- Tests E2E con Cypress
- Registro de login/actividad   

---

## 📬 Contribuciones

¡Todas las contribuciones son bienvenidas!  

1. Haz fork del proyecto  
2. Crea una rama:  
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```  
3. Commit de tus cambios:  
   ```bash
   git commit -am 'Add nueva funcionalidad'
   ```  
4. Push a tu rama:  
   ```bash
   git push origin feature/nueva-funcionalidad
   ```  
5. Abre un Pull Request  

---

📌 **Requisitos**  
- Node.js 18+  
- PostgreSQL 12+  

---

🔧 ¿Problemas?  
Revisa los [issues](https://github.com/bbvedf/compra-venta-app/issues) del repositorio.
