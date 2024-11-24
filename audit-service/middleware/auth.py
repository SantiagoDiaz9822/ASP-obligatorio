import jwt
import os
from functools import wraps
from flask import request, jsonify

JWT_SECRET = os.getenv("JWT_SECRET")

def auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"message": "Token no proporcionado."}), 403

        try:
            # El token viene con "Bearer <token>", así que extraemos el token
            token = token.split(" ")[1] if token.startswith("Bearer ") else token
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user_id = decoded["id"]
            request.user_role = decoded["role"]
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expirado."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token inválido."}), 401

        return f(*args, **kwargs)

    return decorated_function
