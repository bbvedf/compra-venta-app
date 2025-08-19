#!/bin/bash
# EJECUTAR CON: sudo desde /home/bbvedf/prog/compra-venta-app
# CONFIGURACIÓN
APP_DIR="/home/bbvedf/prog/compra-venta-app"
PG_USER="postgres"
PG_DB="compra_venta"
DATE=$(date +"%Y%m%d_%H%M")
TMP_BACKUP_DIR="tmp_backup_$DATE"
FINAL_BACKUP_FILE="$APP_DIR/backups/backup_total_${DATE}.tar.gz"
DB_BACKUP_FILE="backup_db_prod_${DATE}.sql"
echo "📦 Iniciando backup completo..."

# 1. Crear carpeta temporal
mkdir $TMP_BACKUP_DIR

# 2. Copiar archivos del proyecto (excluye node_modules, .git, postgres-data, backups)
echo "📁 Copiando archivos del proyecto..."
rsync -a --exclude=node_modules --exclude=.git --exclude=$TMP_BACKUP_DIR --exclude=postgres-data --exclude=backups $APP_DIR/ $TMP_BACKUP_DIR/app

# 3. Backup de la base de datos con pg_dump
echo "🗄️ Haciendo backup de la base de datos con pg_dump..."
if [ $(docker ps -q -f name=compra-venta-app-postgres-1) ]; then
  echo "Contenedor PostgreSQL ya está levantado"
  docker exec compra-venta-app-postgres-1 pg_dump -U $PG_USER -d $PG_DB > $TMP_BACKUP_DIR/$DB_BACKUP_FILE
else
  echo "Levantando contenedor PostgreSQL temporalmente..."
  cd $APP_DIR && docker-compose up -d postgres
  sleep 5
  docker exec compra-venta-app-postgres-1 pg_dump -U $PG_USER -d $PG_DB > $TMP_BACKUP_DIR/$DB_BACKUP_FILE
  cd $APP_DIR && docker-compose stop postgres
fi
if [ $? -eq 0 ]; then
  echo "Backup de base de datos creado: $DB_BACKUP_FILE"
else
  echo "Error al crear backup de base de datos"
  exit 1
fi

# 4. Comprimir todo en un único archivo
echo "📦 Empaquetando todo en $FINAL_BACKUP_FILE"
mkdir -p $APP_DIR/backups
tar -czvf $FINAL_BACKUP_FILE $TMP_BACKUP_DIR

# 5. Limpiar
rm -rf $TMP_BACKUP_DIR
echo "✅ Backup completado: $FINAL_BACKUP_FILE"