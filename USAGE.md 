# 📖 Uso y Scripts - Compra-Venta App

Este documento describe los scripts disponibles en el proyecto y cómo utilizarlos en desarrollo y test.

---

## 🧩 Scripts en `package.json`

### Servidor (backend)
- `npm run dev` → Inicia el servidor en modo desarrollo (nodemon).
- `npm run start` → Inicia el servidor en producción.
- `npm run test` → Ejecuta los tests con Jest.
- `npm run lint` → Revisa errores de estilo y sintaxis con ESLint.

### Cliente (frontend)
- `npm start` → Lanza el frontend en modo desarrollo.
- `npm run build` → Construye la app optimizada para producción.
- `npm test` → Ejecuta los tests del frontend.

---

## 🐳 Docker

### Entorno de test
```bash
docker-compose -f docker-compose.test.yml up -d
```
Levanta backend, frontend y base de datos en contenedores para testing local.

###Producción
```bash
docker-compose -f docker-compose.yml up --build
```
Levanta todo el stack (Nginx + Backend + Frontend + PostgreSQL) con HTTPS.


🔄 Backups

./mnt_backup.sh → Genera un archivo .tar.gz con proyecto + base de datos.

./mnt_restore.sh archivo.tar.gz → Restaura el proyecto y volumen de base de datos.

---
