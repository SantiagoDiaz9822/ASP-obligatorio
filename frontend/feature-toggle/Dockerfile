# Usa la imagen oficial de Node.js
FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo package.json y el package-lock.json al contenedor
COPY package*.json ./

# Instala las dependencias
RUN npm install --legacy-peer-deps

# Copia el resto de los archivos de la aplicación
COPY . .

# Construye la aplicación frontend
RUN npm run build

# Exponer el puerto en el que corre el frontend
EXPOSE 3001

# Comando para iniciar el frontend
CMD ["npm", "start"]
