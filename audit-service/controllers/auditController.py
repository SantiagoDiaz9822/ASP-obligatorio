import os
import json
import logging
import boto3
from flask import jsonify
from datetime import datetime
import pymysql
import requests
from dotenv import load_dotenv
load_dotenv()

# Configuración del cliente SQS
sqs = boto3.client(
    "sqs",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token = os.getenv("AWS_SESSION_TOKEN")
)

# Configuración de la conexión a la base de datos
db_connection = pymysql.connect(
    host=os.getenv("RDS_HOSTNAME"),
    user=os.getenv("RDS_USERNAME"),
    password=os.getenv("RDS_PASSWORD"),
    database=os.getenv("RDS_DATABASE"),
    cursorclass=pymysql.cursors.DictCursor,
)

# Función para obtener el companyId de un usuario
def get_company_id_for_user(user_id):
    try:
        response = requests.get(f"{os.getenv('USER_SERVICE_URL')}/{user_id}/company")
        response.raise_for_status()
        company_id = response.json().get("company_id")
        return company_id
    except requests.RequestException as e:
        logging.error(f"Error obteniendo el companyId: {e}")
        return None

# Función para obtener los usuarios por company_id
def get_users_by_company_id(company_id):
    """Obtiene los usuarios de la empresa desde el servicio de usuarios."""
    try:
        response = requests.get(f"{os.getenv('USER_SERVICE_URL')}/{company_id}/users")
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logging.error(f"Error al obtener usuarios de la empresa {company_id}: {e}")
        return []  # Devuelve una lista vacía para evitar errores en el flujo

# Función para registrar una acción de auditoría
def log_audit_action(action, entity, entity_id, details, user_id):
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    query = """
        INSERT INTO audit_log (action, entity, entity_id, details, user_id, timestamp)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    values = (action, entity, entity_id, json.dumps(details), user_id, timestamp)

    try:
        with db_connection.cursor() as cursor:
            cursor.execute(query, values)
            db_connection.commit()
    except Exception as e:
        logging.error(f"Error al registrar la auditoría: {e}")
        db_connection.rollback()  # Hacer rollback en caso de error
        raise  # Re-lanzar la excepción para gestionarla arriba

    # Enviar mensaje a la cola de SQS si la entidad es "feature"
    if entity == "feature":
        company_id = get_company_id_for_user(user_id)
        if company_id:
            # Obtener los usuarios de la empresa
            users = get_users_by_company_id(company_id)
            if users:
                # Crear el mensaje para enviar a la cola SQS
                message_body = {
                    "company_id": company_id,
                    "feature_name": entity_id,
                    "values": details,
                    "users": users,  # Incluir usuarios en el mensaje
                }
                try:
                    sqs.send_message(
                        QueueUrl=os.getenv("SQS_QUEUE_URL"),
                        MessageBody=json.dumps(message_body),
                    )
                    print("Mensaje enviado a la cola de SQS.")
                    logging.info("Mensaje enviado a la cola de SQS.")
                except Exception as sqs_error:
                    logging.error(f"Error al enviar el mensaje a la cola de SQS: {sqs_error}")

# Función para obtener registros de auditoría con filtros
def get_audit_logs(filters):
    query_base = "SELECT * FROM audit_log WHERE 1=1"
    query_values = []

    if "startDate" in filters and "endDate" in filters:
        query_base += " AND timestamp BETWEEN %s AND %s"
        query_values.extend([filters["startDate"], filters["endDate"]])

    if "action" in filters:
        query_base += " AND action = %s"
        query_values.append(filters["action"])

    if "userId" in filters:
        query_base += " AND user_id = %s"
        query_values.append(filters["userId"])

    try:
        with db_connection.cursor() as cursor:
            cursor.execute(query_base, tuple(query_values))
            return cursor.fetchall()  # Devuelve los registros encontrados
    except Exception as e:
        logging.error(f"Error al obtener los registros de auditoría: {e}")
        raise ValueError("Error al obtener los registros de auditoría")

