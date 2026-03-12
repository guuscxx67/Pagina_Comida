# 🚀 Guía para Ejecutar la Aplicación

⚠️ **IMPORTANTE**: Esta aplicación ahora usa **MongoDB** en lugar de SQLite.

---

## ✅ Requisitos Previos

### 1️⃣ MongoDB Instalado
- Descargar: https://www.mongodb.com/try/download/community
- Instalar con las opciones por defecto
- Windows: Debería ejecutarse automáticamente en `localhost:27017`

**Verificar que MongoDB está corriendo:**
```bash
# En PowerShell
Get-Service MongoDB
# Debería mostrar: Running
```

### 2️⃣ PyMongo Instalado
Ejecuta el archivo de instalación:
```bash
INSTALAR_PYMONGO.bat
```

O manualmente:
```bash
cd backend
.venv\Scripts\pip install pymongo
```

---

## 1️⃣ BACKEND (Puerto 5000)

### Opción A: Ejecutar desde Windows
1. **Abre:** `INICIAR_BACKEND.bat`
   - Se abrirá una terminal con el servidor Flask
   - Deberías ver:
     ```
     ✓ Conectado a MongoDB: pagina_comida
     ```

### Opción B: Ejecutar desde terminal manual
```bash
cd backend
.venv\Scripts\activate
python app.py
```

**Esperado:**
```
✓ Conectado a MongoDB: pagina_comida
✓ Insertadas 8 recetas iniciales
✓ Admin por defecto creado: admin@test.com / 123456
🚀 Backend ejecutándose en http://localhost:5000
```

---

## 2️⃣ FRONTEND (Puerto 4200)

En **otra terminal** (mantén el backend ejecutándose):

```bash
cd frontend
npm start
```

Debería ver: `Application bundle generation complete`

---

## 3️⃣ Acceder a la Aplicación

### Página Principal
```
http://localhost:4200/home
```

### Panel de Admin
```
http://localhost:4200/admin
```

**Credenciales por defecto:**
- Email: `admin@test.com`
- Contraseña: `123456`

---

## 📋 Resumen de Servicios

| Servicio | Puerto | URL | Estado |
|----------|--------|-----|--------|
| **MongoDB** | 27017 | mongodb://localhost:27017 | Debe estar corriendo |
| **Backend (Flask)** | 5000 | http://localhost:5000/api | Inicia automáticamente |
| **Frontend (Angular)** | 4200 | http://localhost:4200 | Inicia automáticamente |

---

## 📊 Base de Datos MongoDB

- **Servidor**: `mongodb://localhost:27017`
- **Base de datos**: `pagina_comida`
- **Colecciones**:
  - `usuarios` - Usuarios registrados y admins
  - `pedidos` - Pedidos de comida
  - `recetas` - Recetas de platos

---

## ✅ Verificación

- ✓ MongoDB corriendo: Terminal de MongoDB abierta
- ✓ Backend running: "✓ Conectado a MongoDB: pagina_comida"
- ✓ Frontend running: "Application bundle generation complete"
- ✓ Puedes guardar recetas desde Admin
- ✓ Las recetas aparecen automáticamente en Home

---

## ⚠️ Si No Funciona

**Error: "Error conectando a MongoDB"**
- [ ] MongoDB debe estar corriendo
- [ ] Verifica: `Get-Service MongoDB` en PowerShell
- [ ] Si no está corriendo: Abre MongoDB Compass o reinicia el servicio
- [ ] Por defecto: `mongodb://localhost:27017`

**Error: "ModuleNotFoundError: No module named 'pymongo'"**
- [ ] Ejecuta: `INSTALAR_PYMONGO.bat`
- [ ] O: `pip install pymongo`

**Error: Puerto 5000 en uso**
```bash
# Busca qué proceso usa el puerto 5000:
netstat -ano | findstr :5000
# Mata el proceso (reemplaza PID):
taskkill /PID [PID] /F
```

**Error: Puerto 4200 en uso**
```bash
# Similar al anterior
netstat -ano | findstr :4200
taskkill /PID [PID] /F
```

---

## 🚀 Opción Rápida: Ejecutar TODO Junto

```bash
START_ALL.bat
```

Esto abre automáticamente:
- 2 terminales (Backend + Frontend)
- Navegador en la página principal

---

**¡Listo! Ahora puedes usar MongoDB para guardar todo. 🎉**
