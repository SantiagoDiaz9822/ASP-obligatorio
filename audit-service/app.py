from flask import Flask, request, jsonify
from controllers.auditController import log_audit_action, get_audit_logs
from middleware.auth import auth
from middleware.authorize import authorize

app = Flask(__name__)

# Ruta para registrar una acción de auditoría
@app.route('/log', methods=['POST'])
def log_action():
    data = request.get_json()
    
    action = data.get("action")
    entity = data.get("entity")
    entityId = data.get("entityId")
    details = data.get("details")
    userId = data.get("userId")

    if not all([action, entity, entityId, details, userId]):
        return jsonify({"error": "Faltan parámetros requeridos"}), 400

    try:
        log_audit_action(action, entity, entityId, details, userId)
        return jsonify({"message": "Acción de auditoría registrada con éxito"}), 200
    except Exception as e:
        print(f"Error al registrar la acción de auditoría: {e}")
        return jsonify({"error": "Error al registrar la acción de auditoría"}), 500

# Ruta para obtener registros de auditoría filtrados
@app.route('/logs', methods=['GET'])
@auth  # Middleware de autenticación
@authorize('admin')  # Middleware de autorización, solo permite a admin acceder
def get_logs():
    filters = {}

    # Recoger filtros opcionales de la query string
    if 'startDate' in request.args and 'endDate' in request.args:
        filters['startDate'] = request.args['startDate']
        filters['endDate'] = request.args['endDate']

    if 'action' in request.args:
        filters['action'] = request.args['action']

    if 'userId' in request.args:
        filters['userId'] = request.args['userId']

    try:
        logs = get_audit_logs(filters)
        return jsonify({"logs": logs}), 200
    except Exception as e:
        print(f"Error al obtener los logs de auditoría: {e}")
        return jsonify({"error": "Error al obtener los registros de auditoría"}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3005)  
