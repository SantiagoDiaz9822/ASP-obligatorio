# Usamos una imagen base de Node.js
FROM node:16-alpine

# Establecemos el directorio de trabajo
WORKDIR /usr/src/app

# Copiamos los archivos del proyecto
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos
COPY . .

# Exponemos el puerto en el que correrá el microservicio
EXPOSE 3002

# Definimos el comando para iniciar el servidor
CMD ["node", "app.js"]
