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
- Alertas automáticas y actualizaciones de seguridad para dependencias críticas con Snyk.  


### 📂 Infraestructura  
- nginx/                      # Configuración Nginx + SSL
- docker-compose.yml          # Producción
- docker-compose.test.yml     # Testing local


### 🧰 Backup y Restore  
- Backup: ./mnt_backup.sh  
- Restore: ./mnt_restore.sh archivo.tar.gz  
Incluye proyecto + bd de Postgres.

---
