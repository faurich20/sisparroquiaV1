import os
import sys
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Agregar el directorio padre al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import User

class DatabaseManager:
    def __init__(self):
        self.db_config = {
            'host': 'localhost',
            'port': 5432,
            'user': 'postgres',
            'password': '982619321'
        }
    
    def check_postgres_connection(self):
        """Verifica que PostgreSQL esté disponible"""
        try:
            conn = psycopg2.connect(**self.db_config, database='postgres')
            conn.close()
            print("✅ Conexión a PostgreSQL exitosa")
            return True
        except Exception as e:
            print(f"❌ No se puede conectar a PostgreSQL: {e}")
            print("   Asegúrate de que PostgreSQL esté ejecutándose")
            return False
    
    def create_database_if_not_exists(self):
        """Crea la base de datos si no existe con codificación correcta"""
        try:
            conn = psycopg2.connect(**self.db_config, database='postgres')
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = conn.cursor()
            
            # Verificar si la BD existe
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'parroquia_db'")
            exists = cursor.fetchone()
            
            if not exists:
                print("🗄️ Creando base de datos 'parroquia_db'...")
                # Crear con configuración COMPATIBLE con UTF-8
                cursor.execute("""
                    CREATE DATABASE parroquia_db
                    WITH 
                    ENCODING 'UTF8'
                    LC_COLLATE 'C'
                    LC_CTYPE 'C'
                    TEMPLATE template0
                    OWNER postgres
                """)
                print("✅ Base de datos creada con configuración UTF-8 compatible")
            else:
                print("✅ Base de datos 'parroquia_db' ya existe")
                
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            print(f"❌ Error creando base de datos: {e}")
            return False
    
    def verify_database_connection(self):
        """Verifica que se pueda conectar a la base de datos específica"""
        try:
            conn = psycopg2.connect(
                host='localhost',
                port=5432,
                user='postgres',
                password='982619321',
                database='parroquia_db'
            )
            
            cursor = conn.cursor()
            # Forzar UTF-8 en la conexión actual
            cursor.execute("SET client_encoding TO 'UTF8'")
            cursor.execute("SHOW client_encoding")
            encoding = cursor.fetchone()[0]
            print(f"✅ Conexión a BD establecida. Encoding: {encoding}")
            
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            print(f"❌ Error conectando a la base de datos: {e}")
            return False
    
    def initialize_tables_and_data(self):
        """Crea tablas e inserta datos iniciales"""
        app = create_app()
        
        with app.app_context():
            try:
                print("📊 Creando tablas...")
                db.create_all()
                print("✅ Tablas creadas correctamente")
                
                # Crear usuario administrador
                if not User.query.filter_by(email='admin@parroquia.com').first():
                    admin = User(
                        name='Administrador Principal',
                        email='admin@parroquia.com',
                        role='admin',
                        permissions=[
                            'dashboard', 'security', 'personal', 'liturgical',
                            'accounting', 'sales', 'purchases', 'warehouse',
                            'configuration', 'reports'
                        ]
                    )
                    admin.set_password('Admin123!')
                    db.session.add(admin)
                    db.session.commit()
                    print("✅ Usuario admin creado: admin@parroquia.com / Admin123!")
                else:
                    print("✅ Usuario admin ya existe")
                
                return True
                
            except Exception as e:
                print(f"❌ Error inicializando tablas: {e}")
                import traceback
                traceback.print_exc()
                return False

def main():
    print("=" * 60)
    print("🚀 INICIALIZACIÓN AUTOMÁTICA DE BASE DE DATOS PARROQUIAL")
    print("=" * 60)
    
    manager = DatabaseManager()
    
    # Paso 1: Verificar conexión a PostgreSQL
    print("\n1. 🔌 Verificando conexión a PostgreSQL...")
    if not manager.check_postgres_connection():
        return False
    
    # Paso 2: Crear base de datos si no existe
    print("\n2. 🗄️ Verificando base de datos...")
    if not manager.create_database_if_not_exists():
        return False
    
    # Paso 3: Verificar conexión a la base de datos específica
    print("\n3. 🔗 Verificando conexión a la base de datos...")
    if not manager.verify_database_connection():
        return False
    
    # Paso 4: Inicializar tablas y datos
    print("\n4. 📊 Inicializando tablas y datos...")
    if not manager.initialize_tables_and_data():
        return False
    
    print("\n" + "=" * 60)
    print("🎉 ¡INICIALIZACIÓN COMPLETADA EXITOSAMENTE!")
    print("💡 Ahora puedes ejecutar: python run.py")
    print("=" * 60)
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)