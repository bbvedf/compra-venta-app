#!/bin/bash
# EJECUTAR CON: sudo desde /home/bbvedf/prog/compra-venta-app
# CONFIGURACIÓN
APP_DIR="/home/bbvedf/prog/compra-venta-app"
PG_USER="postgres"
PG_DB="compra_venta"
BACKUP_FILE="$1"  # Ejemplo: backups/backup_total_20250819_0808.tar.gz
TMP_RESTORE_DIR="tmp_restore_$(date +%Y%m%d_%H%M)"

if [ -z "$BACKUP_FILE" ]; then
  echo "❌ Error: Debes especificar el archivo de backup (ejemplo: backups/backup_total_20250819_0808.tar.gz)"
  exit 1
fi

echo "📦 Iniciando restauración desde $BACKUP_FILE..."

# 1. Crear carpeta temporal
mkdir $TMP_RESTORE_DIR

# 2. Descomprimir el backup
echo "📁 Descomprimiendo backup..."
tar -xzvf $BACKUP_FILE -C $TMP_RESTORE_DIR
if [ $? -ne 0 ]; then
  echo "❌ Error al descomprimir el backup"
  exit 1
fi

# 3. Restaurar archivos del proyecto
echo "📁 Restaurando archivos del proyecto..."
rsync -a --delete $TMP_RESTORE_DIR/app/ $APP_DIR/
if [ $? -ne 0 ]; then
  echo "❌ Error al restaurar archivos del proyecto"
  exit 1
fi

# 4. Restaurar base de datos con psql
echo "🗄️ Restaurando base de datos con psql..."
if [ $(docker ps -q -f name=compra-venta-app-postgres-1) ]; then
  echo "Contenedor PostgreSQL ya está levantado"
else
  echo "Levantando contenedor PostgreSQL temporalmente..."
  cd $APP_DIR && docker-compose up -d postgres
  sleep 5
fi
DB_BACKUP_FILE=$(ls $TMP_RESTORE_DIR/backup_db_prod_*.sql)
docker exec -i compra-venta-app-postgres-1 psql -U $PG_USER -d $PG_DB < $DB_BACKUP_FILE
if [ $? -eq 0 ]; then
  echo "Base de datos restaurada desde $DB_BACKUP_FILE"
else
  echo "❌ Error al restaurar base de datos"
  cd $APP_DIR && docker-compose stop postgres
  exit 1
fi

# 5. Limpiar
rm -rf $TMP_RESTORE_DIR
echo "✅ Restauración completada en $APP_DIR"