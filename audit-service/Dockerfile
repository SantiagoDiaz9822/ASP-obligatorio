# Usamos una imagen base de Python para aplicaciones web
FROM python:3.9-slim

# Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de la aplicación al contenedor
COPY . /app/

# Instalamos las dependencias de la aplicación desde requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Exponemos el puerto que usará el servicio (por ejemplo, si la app corre en el puerto 5000)
EXPOSE 5000

# Establecemos las variables de entorno necesarias para la aplicación
# (puedes agregar más dependiendo de tu configuración)
ENV AWS_ACCESS_KEY_ID=your_aws_access_key_id
ENV AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
ENV AWS_DEFAULT_REGION=us-east-1
ENV SQS_QUEUE_URL=your_sqs_queue_url
ENV USER_SERVICE_URL=your_user_service_url

# Comando para ejecutar el servicio
CMD ["python", "app.py"]
