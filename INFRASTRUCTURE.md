### 📄 `INFRASTRUCTURE.md`

# 🛠️ Infraestructura y Despliegue  

## 🌐 Producción  
- **Nginx** → Reverse proxy con certificados Let's Encrypt.
- **Docker Compose** → Orquestación de contenedores (frontend, backend, base de datos, Nginx).
- **Dominio configurado** → `https://ryzenpc.mooo.com`.

### Comando principal  
```bash
docker-compose -f docker-compose.yml up --build
````

### 🔒 Seguridad  
- HTTPS automático con certbot.  
- Tokens JWT con expiración.  
- Contraseñas cifradas con bcrypt.  
- Configuración de headers de seguridad con Helmet. Bloquea scripts y estilos externos no autorizados.  
- Protección de endpoints sensibles con Rate Limiting, v/thresholds.  
- Sanitización y validación de inputs con express-validator.  
- Baneos temporales en middleware, con bannedIP.js.  
- Alertas automáticas y actualizaciones de seguridad para dependencias críticas con Snyk.  


### 📜 Logs
- Logs de backend (logs/backend/):  
    - requests.log → registro de todas las peticiones HTTP  
    - Incluye los baneos aplicados con bannedIP.js.  
    - Rotación automática con logrotate (configuración en logrotate.conf)  
    - Se mantienen los últimos 7 archivos comprimidos (.gz)  
- Logs de nginx (logs/nginx/):  
    - access.log y error.log  
    - También rotan automáticamente  


### 📂 Infraestructura  
- nginx/                      # Configuración Nginx + SSL
- docker-compose.yml          # Producción
- docker-compose.test.yml     # Testing local


### 🧰 Backup y Restore  
- Backup: ./mnt_backup.sh  
- Restore: ./mnt_restore.sh archivo.tar.gz  
Incluye proyecto + bd de Postgres.

---
