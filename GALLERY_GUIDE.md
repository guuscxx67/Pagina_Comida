# Guía de Uso - Galería de Platos

## 📋 Descripción

Se ha agregado un nuevo componente `GalleryShowcase` a tu página principal que permite mostrar tus platos con imágenes reales de manera profesional.

## 🎯 Características

✅ **Galería de Platos Destacados** - Los primeros 3 platos se muestran en formato grande con efectos hover
✅ **Grid Responsive** - Se adapta a todos los tamaños de pantalla
✅ **Efectos Visuales** - Animaciones suaves al pasar el mouse
✅ **Fácil de Personalizar** - Solo necesitas cambiar las imágenes y datos

## 📍 Ubicación

```
frontend/src/app/components/gallery-showcase/
├── gallery-showcase.ts      (Lógica del componente)
├── gallery-showcase.html    (Estructura HTML)
└── gallery-showcase.css     (Estilos)
```

## 🖼️ Cómo Agregar o Cambiar Imágenes

### Opción 1: Usar URLs remotas (Rápido)

En `gallery-showcase.ts`, busca el array `platos` y cambia la propiedad `imagen`:

```typescript
platos: Plato[] = [
  {
    id: 1,
    nombre: 'Mole Poblano',
    descripcion: 'Receta ancestral con pollo tierno...',
    imagen: 'https://tu-servidor.com/mole.jpg', // ← Cambia aquí
    precio: 120,
    destacado: true,
  },
  // ... más platos
];
```

### Opción 2: Usar imágenes locales

1. Coloca tus imágenes en: `frontend/src/assets/images/platos/`

2. Actualiza las rutas en `gallery-showcase.ts`:

```typescript
imagen: '/assets/images/platos/mole.jpg',
```

3. Asegúrate de que `assets` esté configurado en `angular.json`

### Opción 3: Conectar con Base de Datos/API

Si tienes una API que devuelve los platos, puedes inyectar un servicio:

```typescript
import { Component, OnInit } from '@angular/core';
import { PlatosService } from '../../services/platos.service';

export class GalleryShowcaseComponent implements OnInit {
  platos: Plato[] = [];

  constructor(private platosService: PlatosService) {}

  ngOnInit() {
    this.platosService.getPlatos().subscribe(
      (data) => {
        this.platos = data;
      }
    );
  }
}
```

## 🎨 Personalizar Platos

### Agregar un Nuevo Plato

```typescript
{
  id: 7,
  nombre: 'Pozole Rojo',
  descripcion: 'Caldo tradicional con hominy rojo, toppings y tortillas',
  imagen: 'https://images.unsplash.com/photo-1...?w=500&h=500&fit=crop',
  precio: 110,
  destacado: false, // true si quieres que aparezca en los 3 principales
}
```

### Propiedades Disponibles

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID único del plato |
| `nombre` | string | Nombre del plato |
| `descripcion` | string | Descripción breve |
| `imagen` | string | URL de la imagen |
| `precio` | number | Precio en pesos |
| `destacado` | boolean | Si aparece en los primeros 3 (opcional) |

## 🎯 Cómo la Galería Aparece en el Home

El componente ya está integrado en tu home. La estructura es:

```
Home
├── Header
├── Hero Section (Sección principal con bienvenida)
├── Gallery Showcase ← NUEVO (Tus platos con imágenes)
├── Buttons (Opciones de compra)
├── Menu Preview (Categorías del menú)
└── Footer
```

## 🖼️ Recomendaciones para Imágenes

1. **Tamaño recomendado**: 500x500px (mínimo)
2. **Formato**: JPG o PNG
3. **Compresión**: Comprime las imágenes para carga rápida
4. **Calidad**: Usa imágenes profesionales de alta calidad
5. **Proporciones**: Mantén proporciones cuadradas para los mejores resultados

### URLs de Ejemplo (Unsplash - Comida Gratis)

```
Mole: https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop
Enchiladas: https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=500&fit=crop
Sopa: https://images.unsplash.com/photo-1618103897929-4d7a5c662c5f?w=500&h=500&fit=crop
```

## 🎨 Personalizar Estilos

### Cambiar Colores Principales

En `gallery-showcase.css`:

```css
/* Colores principales */
.gallery-title { color: #6b4226; } /* Marrón oscuro */
.featured-price { color: #d4a574; } /* Dorado */
```

### Cambiar Efectos Hover

```css
.featured-card:hover {
  transform: translateY(-8px); /* Cambiar altura del movimiento */
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
}
```

### Ajustar Número de Columnas

```css
.dishes-grid {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  /* Cambia 240px para más/menos columnas */
}
```

## 📱 Responsive

La galería se adaptará automáticamente a:
- 📱 Móviles (480px)
- 📱 Tablets (768px)
- 💻 Laptops (1024px+)

## ✨ Tips Pro

1. **Precarga de imágenes**: Si tienes muchas imágenes, considera usar lazy loading
2. **Banco de imágenes**: Usa Unsplash, Pexels o Shutterstock para fotos profesionales
3. **Filtros**: Puedes agregar categorías y filtros para filtrar platos
4. **Modal**: Ag

rega un modal para ver el plato en detalle al hacer click

## 🔧 Solución de Problemas

### Las imágenes no cargan
- Verifica la URL
- Comprueba la conexión a internet
- Asegúrate que el servidor de imágenes esté disponible

### Las imágenes se ven distorsionadas
- Usa `object-fit: cover` en el CSS
- Cambia el tamaño a 1:1 (cuadrado)

### El componente no aparece
- Verifica que `GalleryShowcaseComponent` esté importado en `home.ts`
- Revisa la consola del navegador para errores

## 📝 Ejemplo Completo

```typescript
// gallery-showcase.ts
export class GalleryShowcaseComponent {
  platos: Plato[] = [
    {
      id: 1,
      nombre: 'Mole Poblano',
      descripcion: 'El mole más auténtico de la región',
      imagen: 'https://tu-servidor.com/mole.jpg',
      precio: 120,
      destacado: true,
    },
    {
      id: 2,
      nombre: 'Enchiladas Verdes',
      descripcion: 'Receta de la abuela',
      imagen: 'https://tu-servidor.com/enchiladas.jpg',
      precio: 95,
      destacado: true,
    },
  ];
}
```

¡Eso es todo! Tu galería está lista. Ahora solo personaliza los datos y disfruta viéndola en acción. 🎉
