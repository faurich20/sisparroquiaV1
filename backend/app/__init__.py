from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS 
from dotenv import load_dotenv 
import os


db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()

def create_app():
    app = Flask(__name__)
    load_dotenv()
    
    # Configuración
    app.config.from_object('app.config.Config')
    
    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    #cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    cors = CORS(app, resources={
    r"/api/*": {
        "origins": app.config['CORS_ORIGINS'],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 3600
    }
    })
    
    # 🔥 MANEJADORES DE ERRORES
    @app.errorhandler(500)
    def internal_server_error(e):
        return jsonify({
            'error': 'Internal Server Error', 
            'message': 'Error interno del servidor',
            'details': str(e) if app.debug else 'Contacte al administrador'
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        if isinstance(e, HTTPException):
            return e
        
        return jsonify({
            'error': 'Internal Server Error', 
            'message': 'Error inesperado en el servidor',
            'details': str(e) if app.debug else 'Contacte al administrador'
        }), 500
    
    # Middleware de debug
    @app.before_request
    def log_request_info():
        if request.path.startswith('/api/'):
            print(f"🌐 Request: {request.method} {request.path}")
            print(f"   Content-Type: {request.content_type}")
            print(f"   Headers: {dict(request.headers)}")
            if request.get_data():
                print(f"   Body: {request.get_data(as_text=True)}")
    
    # Registrar blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp  # ✅ Importar el blueprint de usuarios
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')  # ✅ Registrar blueprint
    
    return app