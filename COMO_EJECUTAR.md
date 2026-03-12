# 🚀 Guía para Ejecutar la Aplicación

Para que todo funcione correctamente, necesitas ejecutar **2 servidores en paralelo**:

## 1️⃣ BACKEND (Puerto 5000)

### Opción A: Ejecutar desde Windows
1. **Abre:** `INICIAR_BACKEND.bat` (archivo en la carpeta raíz)
   - Se abrirá una terminal con el servidor Flask
   - Deberías ver: `Running on http://127.0.0.1:5000`

### Opción B: Ejecutar desde terminal manual
```bash
cd backend
.venv\Scripts\activate
python app.py
```

⚠️ **El backend DEBE estar corriendo** para que el admin pueda:
- Crear/Editar/Eliminar recetas
- Guardar URLs de imágenes
- Cambiar estado de pedidos

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

## 📋 Resumen de Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Frontend (Angular)** | 4200 | http://localhost:4200 |
| **Backend (Flask)** | 5000 | http://localhost:5000/api |

---

## ✅ Verificación

- ✓ Backend running: Debería haber terminal con "Running on http://127.0.0.1:5000"
- ✓ Frontend running: Debería ver "Application bundle generation complete"
- ✓ Puedes guardar recetas desde Admin
- ✓ Las recetas aparecen automáticamente en Home

---

## ⚠️ Si No Funciona

**Error: No se pueden guardar recetas**
- [ ] Verifica que el backend esté ejecutándose (terminal abierta)
- [ ] Verifica que veas "Running on http://127.0.0.1:5000"
- [ ] Prueba en otra pestaña: http://localhost:5000/api/recetas

**Error: CORS**
- [ ] El backend debe estar ejecutándose en http://localhost:5000
- [ ] El frontend debe estar en http://localhost:4200

**Error: Puerto en uso**
```bash
# Busca qué proceso usa el puerto 5000:
netstat -ano | findstr :5000

# Mata el proceso (reemplaza PID):
taskkill /PID [PID] /F
```

---

**¡Ya puedes empezar a guardar recetas! 🎉**
