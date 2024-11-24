from functools import wraps
from flask import request, jsonify

def authorize(roles=None):
    if isinstance(roles, str):
        roles = [roles]
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_role = getattr(request, 'user_role', None)
            if user_role not in roles:
                return jsonify({"message": "Acceso denegado."}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
