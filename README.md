# Comida Casera - Frontend & Backend

Un sitio web moderno para una plataforma de comida casera mexicana, desarrollado con Angular, Bootstrap y Flask.

## Estructura del Proyecto

```
Pagina_Comida/
├── frontend/                 # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Componentes reutilizables
│   │   │   │   ├── header/
│   │   │   │   ├── hero-section/
│   │   │   │   ├── buttons/
│   │   │   │   └── footer/
│   │   │   ├── pages/        # Páginas principales
│   │   │   │   ├── home/
│   │   │   │   └── profile/
│   │   │   └── assets/       # Recursos estáticos
│   │   └── styles.scss       # Estilos globales
│   └── package.json
│
├── backend/                  # Aplicación Flask
│   ├── app.py               # Aplicación principal
│   ├── requirements.txt      # Dependencias Python
│   ├── .env                 # Variables de entorno
│   └── config/              # Configuración
│
└── README.md
```

## Frontend - Angular

### Requisitos
- Node.js 24.x+
- npm 11.x+
- Angular CLI 19.x+

### Instalación y Ejecución

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar el servidor de desarrollo
ng serve --open

# Construir para producción
ng build --configuration production
```

El frontend estará disponible en `http://localhost:4200`

## Backend - Flask

### Requisitos
- Python 3.8+
- pip (gestor de paquetes de Python)

### Instalación y Ejecución

```bash
cd backend

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor Flask
python app.py
```

El backend estará disponible en `http://localhost:5000`

### Endpoints Disponibles

#### Health Check
- `GET /api/health` - Verificar estado del servidor

#### Menú
- `GET /api/menu` - Obtener menú completo
- `GET /api/menu/<id>` - Obtener item específico
- `GET /api/menu/category/<category>` - Obtener items por categoría

#### Usuarios
- `GET /api/user/<user_id>` - Obtener datos del usuario
- `GET /api/user/<user_id>/profile` - Obtener perfil
- `PUT /api/user/<user_id>/profile` - Actualizar perfil

#### Órdenes
- `GET /api/user/<user_id>/orders` - Obtener órdenes
- `POST /api/user/<user_id>/orders` - Crear nueva orden

#### Reservas
- `POST /api/reservations` - Crear reserva

#### Contacto
- `POST /api/contact` - Enviar mensaje de contacto

## Componentes del Frontend

### Header
- Logo personalizado "Comida Casera" (cucharón y olla)
- Saludo al usuario: "HOLA, CLIENTE"
- Carrito de compras con contador

### Hero Section
- Banner principal con degradado marrón cálido y terroso
- Patrón de utensilios de cocina minimalistas
- Texto: "¿ANTOJOS DE VERDADERO SABOR HOGAREÑO?"
- Precio del día: $110 COMIDA COMPLETA DEL DÍA
- Ilustración de chef tradicional mexicano
- Imagen SVG del plato con Mole Poblano
- Texto: "COMIDA CASERA" y "HECHO CON AMOR"

### Buttons Section
- Botón "RESERVA TU PLATILLO" (verde oscuro #2d5016)
- Botón "RECOGER" (verde oscuro #3d6b1f)
- Base decorativa molcajete tradicional

### Footer
- Banner de cookies con botones "Ver más" y "Aceptar"
- Sección sobre nosotros
- Enlaces rápidos
- Redes sociales
- Información de contacto

## Desarrollo

### Ejecutar Ambos Servidores

Terminal 1 - Frontend:
```bash
cd frontend
ng serve
```

Terminal 2 - Backend:
```bash
cd backend
python app.py
```

## Features

✅ Diseño responsivo con Bootstrap 5
✅ Componentes Angular standalone
✅ API RESTful con Flask
✅ CORS configurado para desarrollo
✅ Estilos SCSS
✅ Animaciones suaves (float, slideRight)
✅ Design inspirado en Little Caesars México
✅ Colores temáticos: tonos cálidos y tierra (#8B6F47, #A0826D)
✅ Componentes modulares y reutilizables

## Tecnologías Utilizadas

### Frontend
- Angular 19
- Bootstrap 5
- SCSS
- TypeScript

### Backend
- Flask 3.1
- Flask-CORS 4.0
- Python 3.14

---

**¡Bienvenido a Comida Casera - Comida hecha con amor!**
