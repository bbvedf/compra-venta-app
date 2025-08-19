### 📄 `INFRASTRUCTURE.md`
```md
# 🛠️ Infraestructura y Despliegue - Compra-Venta App

---

## 🌐 Producción
- **Nginx** → Reverse proxy con certificados Let's Encrypt.
- **Docker Compose** → Orquestación de contenedores (frontend, backend, base de datos, Nginx).
- **Dominio configurado** → `https://ryzenpc.mooo.com`.

### Comando principal
```bash
docker-compose -f docker-compose.yml up --build
````

🔒 Seguridad

HTTPS automático con certbot.

Tokens JWT con expiración.

Contraseñas cifradas con bcrypt.


📂 Infraestructura
nginx/                      # Configuración Nginx + SSL
docker-compose.yml          # Producción
docker-compose.test.yml     # Testing local


🧰 Backup y Restore

Backup: ./mnt_backup.sh

Restore: ./mnt_restore.sh archivo.tar.gz

Incluye proyecto + volumen de Postgres.

---