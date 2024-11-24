# ASP-obligatorio

## Descripción

Este proyecto es el Obligatorio 2 para la materia Arquitectura de Software en la Practica. En esta entrega se implementaron todos los requerimientos funcionales y no funcionales, tanto los requerimientos anteriores del Obligatorio 1, como los nuevos, utilizando Microservicios.

## Instrucciones para configurar un nuevo ambiente de desarrollo

### 1. Clonar el repositorio

Primero, clona el repositorio en tu máquina local:

```git clone https://github.com/SantiagoDiaz9822/ASP-obligatorio.git ```

```cd ASP-obligatorio```

### 2. Instalar dependencias

#### Para cada servicio excepto audit-service:

```cd <nombre>-service```

```npm install```

#### Para audit-service:

```cd audit-service```

```pip install --no-cache-dir -r requirements.txt```

#### Para el frontend:

```cd frontend```

```cd feature-toggle```

```npm install```

### 3. Configurar variables de entorno para cada microservicio

Copia el archivo .env.tex a .env y ajusta las configuraciones según sea necesario, tanto en los microservicios como en el forntend.

### 4. Ejecutar la aplicación

#### Para iniciar los microservicios excepto audit-service:

```cd <nombre>-service```

```node app.js```

#### Para iniciar los audit-service:

```cd audit-service```

```python app.py```

#### Para iniciar el frontend:

```cd frontend```

```cd feature-toggle```

```npm start```

### 5. Ejecutar la aplicación con Docker

```docker-compose up --build```

### 6. Acceder a la aplicación

Abre tu navegador y ve a http://localhost:3000/login para ver la aplicación en acción.
