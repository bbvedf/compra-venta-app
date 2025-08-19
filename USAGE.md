### 📄 `USAGE.md`

# 📖 Uso y Scripts - Compra-Venta App

Este documento describe los scripts disponibles en el proyecto y cómo utilizarlos en desarrollo y test.



## 🧩 Scripts en `package.json`

### Servidor (backend)
- `npm run start` → Inicia el servidor en producción.
- `npm run test:ci` → Corre GitHub Actions: coverage + sin levantar nada manualmente (ya lo maneja el workflow).
- `npm run test:unit` → Tests rápidos, sin BD (usa mock). Para trabajar en local sin levantar contenedores.
- `npm run test:integration` → Tests que sí dependen de BD real, pero la levanta y tumba automáticamente.
- `npm run test:db` → Levanta BD, corre todo, útil en local si quieres simular como en CI.

### Cliente (frontend)
- `npm start` → Lanza el frontend en modo desarrollo.
- `npm run build` → Construye la app optimizada para producción.
- `npm test` → Ejecuta los tests del frontend.



## 🐳 Docker

### Entorno de test
```bash
docker-compose -f docker-compose.test.yml up -d
```
Levanta backend, frontend y base de datos en contenedores para testing local.

### Producción
```bash
docker-compose -f docker-compose.yml up --build
```
Levanta todo el stack (Nginx + Backend + Frontend + PostgreSQL) con HTTPS.



## 🔄 Backups

./mnt_backup.sh → Genera un archivo .tar.gz con proyecto + base de datos.

./mnt_restore.sh archivo.tar.gz → Restaura el proyecto y volumen de base de datos.

---
