### 📄 `INFRASTRUCTURE.md`

# 🛠️ Infraestructura y Despliegue  

## 🌐 Producción  
- **Nginx** → Reverse proxy con certificados Let's Encrypt.
- **Docker Compose** → Orquestación de contenedores (frontend, backend, base de datos, Nginx, ...).
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
- Backend:  
  - Logging estructurado JSON con `Pino`  
  - Incluye request logging y errores 5xx  
  - Rotación automática con `pino-rotating-file`  
  - Salida a stdout para Docker/Kubernetes  
- Nginx:  
  - access.log y error.log  
  - Rotación automática  


### 📊 Observabilidad
- **Prometheus** → Scrapea métricas del backend Node.js  
  - `/metrics` expone: Uptime, requests HTTP, errores 5xx, latencias p95  
- **Grafana** → Dashboard principal `Compra-Venta App`  
  - Paneles: Uptime, Contador de requests HTTP, Errores 5xx, Latencia p95  
  - Backup de dashboards en JSON en `/grafana-backups`  
- **Docker / Compose**  
  - Servicios nuevos: `grafana`, `prometheus`  
  - Red `monitoring_net` para comunicación entre servicios  
  - Volúmenes persistentes: `grafana-data`, `postgres-data`  


### 📂 Infraestructura  
- nginx/                      # Configuración Nginx + SSL
- docker-compose.yml          # Producción
- docker-compose.test.yml     # Testing local


### 🧰 Backup y Restore  
- Backup: ./mnt_backup.sh  
- Restore: ./mnt_restore.sh archivo.tar.gz  
Incluye proyecto + bd de Postgres.

---
