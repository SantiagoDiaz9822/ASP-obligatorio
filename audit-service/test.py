import json
import logging
import os
import boto3
import requests
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


# Configuración de logs
logging.basicConfig(level=logging.INFO)

# Configuración del cliente para obtener usuarios
user_service_url = os.getenv("USER_SERVICE_URL")

def send_email_notification(user_email, user_name, feature_name, values):
    """Envía notificaciones por correo electrónico."""
    try:
        msg = MIMEMultipart()
        msg['From'] = os.getenv("EMAIL_USER")
        msg['To'] = user_email
        msg['Subject'] = f"Notificación de actualización en feature: {feature_name}"

        body = f"""
        Hola {user_name},\n\n
        La feature "{feature_name}" ha sido actualizada.\n
        Detalles: {values}\n
        Te mantenemos informado.\n\n
        Saludos,\n
        Tu equipo.
        """
        msg.attach(MIMEText(body, 'plain', 'utf-8'))  # Usar UTF-8 para caracteres especiales

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASSWORD"))
            server.send_message(msg)

        logging.info(f"Correo enviado a {user_email}")
    except Exception as e:
        logging.error(f"Error al enviar el correo a {user_email}: {e}")

def get_users_by_company_id(company_id):
    print(user_service_url)
    """Obtiene los usuarios de la empresa desde el servicio de usuarios."""
    try:
        response = requests.get(f"{user_service_url}/{company_id}/users")
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logging.error(f"Error al obtener usuarios de la empresa {company_id}: {e}")
        return []  # Devuelve una lista vacía para evitar errores en el flujo

def lambda_handler(event, context):
    """Procesa los mensajes de la cola SQS."""
    for record in event["Records"]:
        try:
            # Procesa el mensaje de SQS
            message_body = json.loads(record["body"])
            company_id = message_body.get("company_id")
            feature_name = message_body.get("feature_name")
            values = message_body.get("values")
            print(message_body)
            if not company_id or not feature_name or not values:
                logging.warning(f"Mensaje inválido: {message_body}")
                continue

            # Obtener usuarios de la empresa
            users = get_users_by_company_id(company_id)

            print(users)

            if not users:
                logging.warning(f"No se encontraron usuarios para la empresa {company_id}")
                continue

            for user in users:
                user_email = user.get("email")
                user_name = user.get("email")  # Usar el email como nombre temporal
                is_subscribed = user.get("is_subscribed")  # Obtener el estado de suscripción

                # Verificar si el usuario está suscrito (is_subscribed = 1)
                if user_email and is_subscribed == 1:
                    send_email_notification(user_email, user_name, feature_name, values)
                else:
                    if not is_subscribed == 1:
                        logging.info(f"Usuario {user_email} no está suscrito, no se envió correo.")
                    else:
                        logging.warning(f"Usuario inválido: {user}")

        except Exception as e:
            logging.error(f"Error procesando el mensaje: {e}")
