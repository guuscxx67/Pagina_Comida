# 🚀 Guía Rápida de Inicio

## 1️⃣ Ver los Cambios en Tu Navegador

### Opción A: Run Dev Server

```bash
cd frontend
ng serve
```

Luego abre: **http://localhost:4200**

### Opción B: Build y Serve

```bash
cd frontend
npm run build
# Los archivos estarán en: frontend/dist/frontend/
```

## 2️⃣ ¿Qué Verás?

Cuando abras la página principal (home), verás:

```
═════════════════════════════════════════════
        1. HEADER (Navigation)
═════════════════════════════════════════════

═════════════════════════════════════════════
        2. HERO SECTION (Welcome)
═════════════════════════════════════════════

╔═════════════════════════════════════════════╗
║  NUESTROS PLATOS ESTRELLA                  ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║                                             ║
║  [Image]  [Image]  [Image]                  ║
║  Mole     Enchiladas  Sopa                  ║
║  $120     $95          $65                  ║
║                                             ║
║ TODO NUESTRO MENÚ                           ║
║ [6 platos más en grid]                      ║
╚═════════════════════════════════════════════╝

═════════════════════════════════════════════
        3. BUTTONS (Call to Action)
═════════════════════════════════════════════

═════════════════════════════════════════════
        4. MENU PREVIEW (Categorías)
═════════════════════════════════════════════

═════════════════════════════════════════════
        5. FOOTER
═════════════════════════════════════════════
```

## 3️⃣ Personalizar con Tus Datos

### Cambiar Imágenes Fácilmente

Opción 1: URLs remotas (más rápido)
```typescript
// En: frontend/src/app/components/gallery-showcase/gallery-showcase.ts

imagen: 'https://tu-servidor.com/fotos/mole.jpg'
```

Opción 2: Imágenes locales
```typescript
// Coloca la imagen en: frontend/src/assets/images/platos/mole.jpg

imagen: '/assets/images/platos/mole.jpg'
```

### Cambiar Datos de Platos

```typescript
platos: Plato[] = [
  {
    id: 1,
    nombre: 'NOMBRE DE TU PLATO',      // ← Cambiar
    descripcion: 'Tu descripción',     // ← Cambiar
    imagen: 'https://tu-imagen.jpg',   // ← Cambiar
    precio: 120,                        // ← Cambiar
    destacado: true,                    // true para primeros 3
  },
  // Agrega más platos aquí...
];
```

## 4️⃣ Estructura de Archivos Creados

```
frontend/
├── src/
│   └── app/
│       ├── components/
│       │   └── gallery-showcase/              ← NUEVO
│       │       ├── gallery-showcase.ts        (Component)
│       │       ├── gallery-showcase.html      (Template)
│       │       └── gallery-showcase.css       (Styles)
│       ├── services/
│       │   └── platos.service.ts              ← NUEVO (Opcional)
│       └── pages/
│           └── home/
│               ├── home.ts                    (Actualizado)
│               └── home.html                  (Actualizado)
│
├── RESUMEN_MEJORAS.md          ← Descripción técnica
├── GALLERY_GUIDE.md             ← Guía de uso
└── EJEMPLOS_AVANZADOS.md        ← Integraciones API
```

## 5️⃣ Pruebas Rápidas

### Ver si todo compiló correctamente
```bash
cd frontend
ng build
```

Deberías ver:
```
✔ Building...
Application bundle generation complete.
```

### Buscar errores
```bash
cd frontend
ng serve --strict
```

## 6️⃣ Próximos Pasos

### Corto Plazo (Hoy)
- [ ] Abre el proyecto en tu IDE
- [ ] Navega a `gallery-showcase.ts`
- [ ] Reemplaza imágenes con tus fotos
- [ ] Actualiza nombres y precios
- [ ] Guarda y recarga el navegador

### Mediano Plazo (Esta Semana)
- [ ] Toma fotos profesionales de tus platos
- [ ] Crea cuenta en Cloudinary (gratuito)
- [ ] Sube tus imágenes
- [ ] Actualiza URLs en el componente
- [ ] Personaliza colores y estilos

### Largo Plazo (Próximas Semanas)
- [ ] Conecta con tu backend/API
- [ ] Implementa filtros por categoría
- [ ] Agrega modo admin para editar platos
- [ ] Automatiza carga de datos desde BD

## 7️⃣ Dónde Buscar si Algo Falla

| Problema | Solución |
|----------|----------|
| Las imágenes no cargan | Verifica la URL y conexión a internet |
| El componente no aparece | Revisa que esté importado en `home.ts` |
| Errores de compilación | Ejecuta `ng build` para ver detalles |
| CSS no se aplica | Limpia caché del navegador (Ctrl+Shift+R) |
| Precios mal formateados | Verifica que sean números en TypeScript |

## 8️⃣ Comandos Útiles

```bash
# Instalar dependencias
cd frontend && npm install

# Modo desarrollo
ng serve

# Build producción
ng build --configuration production

# Limpiar build
rm -rf dist

# Ver tamaño del bundle
ng build --stats-json
webpack-bundle-analyzer dist/frontend/stats.json

# Tests
ng test

# Lint
ng lint
```

## 9️⃣ Recursos Útiles

- **Bancos de Imágenes Gratis:**
  - https://unsplash.com (Comida)
  - https://pexels.com (Fotos)

- **Herramientas:**
  - https://cloudinary.com (Almacenar imágenes)
  - https://tinypng.com (Comprimir imágenes)

- **Documentación:**
  - Angular: https://angular.io/docs
  - TypeScript: https://www.typescriptlang.org/docs

## 🔟 Soporte

Si necesitas ayuda:

1. **Lee GALLERY_GUIDE.md** para funciones básicas
2. **Lee EJEMPLOS_AVANZADOS.md** para integración API
3. **Revisa los comentarios en el código**
4. **Busca el error en la consola del navegador** (F12)

---

## ✅ Checklist Final

- [x] Componente creado
- [x] HTML estructurado
- [x] CSS aplicado
- [x] Integrado en Home
- [x] Build exitoso
- [x] Documentación completa
- [x] Ejemplos proporcionados
- [x] Datos de ejemplo listos

**¡Todo listo para que disfrutes tu nuevo design! 🎉**
