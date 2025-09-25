from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from datetime import datetime, timedelta
import traceback

from app import db
from app.models import User, RefreshToken
from app.utils.security import is_valid_email, is_strong_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        print("🔍 Solicitud de login recibida")
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validar email
        if not is_valid_email(email):
            return jsonify({'error': 'Formato de email inválido'}), 400
        
        # Buscar usuario
        user = User.query.filter_by(email=email, is_active=True).first()
        print(f"🔍 Usuario encontrado: {user is not None}")
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        print("✅ Credenciales válidas")
        
        # Actualizar último login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # ✅ CREAR TOKENS CORRECTAMENTE - asegurar que identity sea string
        access_token = create_access_token(identity=str(user.id))  # ← ¡IMPORTANTE!
        refresh_token = create_refresh_token(identity=str(user.id))  # ← ¡IMPORTANTE!
        
        print("✅ Tokens creados correctamente")
        
        # Guardar refresh token en la base de datos
        expires_at = datetime.utcnow() + timedelta(days=30)
        new_refresh_token = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=expires_at
        )
        db.session.add(new_refresh_token)
        db.session.commit()
        
        print("✅ Login exitoso - Tokens creados")
        return jsonify({
            'message': 'Login exitoso',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"❌ Error en login: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'Error interno del servidor'}), 500
    
    

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Usuario no válido'}), 401
        
        # Crear nuevo access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"❌ Error en refresh: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'Error al refrescar token'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        jti = get_jwt()['jti']
        user_id = get_jwt_identity()
        
        # Revocar todos los refresh tokens del usuario
        RefreshToken.query.filter_by(user_id=user_id).update({'revoked': True})
        db.session.commit()
        
        return jsonify({'message': 'Logout exitoso'}), 200
        
    except Exception as e:
        print(f"❌ Error en logout: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'Error al hacer logout'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data or 'name' not in data:
            return jsonify({'error': 'Nombre, email y contraseña son requeridos'}), 400
        
        name = data['name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validaciones
        if not is_valid_email(email):
            return jsonify({'error': 'Formato de email inválido'}), 400
        
        is_strong, message = is_strong_password(password)
        if not is_strong:
            return jsonify({'error': message}), 400
        
        # Verificar si el usuario ya existe
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'El usuario ya existe'}), 409
        
        # Crear nuevo usuario
        new_user = User(
            name=name,
            email=email,
            role='user',
            permissions=['dashboard']
        )
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        print(f"❌ Error en registro: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'Error al registrar usuario'}), 500