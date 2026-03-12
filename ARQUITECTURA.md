# 📊 Diagrama de Arquitectura y Flujo de Datos

## 1. Estructura del Componente

```
┌─────────────────────────────────────────────────────────────┐
│                   GALLERY SHOWCASE COMPONENT                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─ FEATURED SECTION (3 Destacados) ──────────────────────┐ │
│  │                                                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │          │  │          │  │          │            │ │
│  │  │ Image    │  │ Image    │  │ Image    │            │ │
│  │  │          │  │          │  │          │            │ │
│  │  │ Nombre   │  │ Nombre   │  │ Nombre   │            │ │
│  │  │ Desc     │  │ Desc     │  │ Desc     │            │ │
│  │  │ $Precio  │  │ $Precio  │  │ $Precio  │            │ │
│  │  │ + Button │  │ + Button │  │ + Button │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─ ALL DISHES SECTION (Grid 4 columnas) ──────────────────┐ │
│  │                                                         │ │
│  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │ │
│  │ │ IMG │ │ IMG │ │ IMG │ │ IMG │ │ IMG │ │ IMG │   │ │
│  │ │ NOM │ │ NOM │ │ NOM │ │ NOM │ │ NOM │ │ NOM │   │ │
│  │ │ $PR │ │ $PR │ │ $PR │ │ $PR │ │ $PR │ │ $PR │   │ │
│  │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 2. Flujo de Datos

### Opción 1: Datos Estáticos (Por Defecto)

```
TypeScript Component
    │
    ├─►  Array de Platos (hardcoded)
    │         │
    │         └─► ngFor en HTML
    │              │
    │              └─► Renderiza en Pantalla
    │
    └─► CSS Styles
         │
         └─► Animaciones y efectos
```

### Opción 2: Datos Dinámicos (Con API)

```
┌──────────────┐
│   BACKEND    │ (API REST)
│  /api/platos │
└──────┬───────┘
       │
       │ JSON Response
       │
       ▼
┌─────────────────────────────┐
│  PlatosService              │
│  ├─ getPlatos()             │
│  ├─ getPlatosDestacados()   │
│  └─ getPlatosByCategoria()  │
└──────────┬──────────────────┘
           │
           │ Observable<Plato[]>
           │
           ▼
┌──────────────────────────────┐
│ GalleryShowcaseComponent     │
│ ├─ platos: Plato[]           │
│ ├─ ngOnInit()                │
│ └─ cargarPlatos()            │
└──────────┬───────────────────┘
           │
           │ Property Binding
           │ *ngFor
           │
           ▼
┌──────────────────────────────┐
│   HTML Template              │
│   - Featured Cards           │
│   - Dishes Grid              │
└──────────┬───────────────────┘
           │
           │ CSS Classes
           │
           ▼
┌──────────────────────────────┐
│   Browser Rendering          │
│   - Layout                   │
│   - Animaciones              │
│   - Interactividad           │
└──────────────────────────────┘
```

## 3. Jerarquía de Componentes

```
┌─────────────────────────────────────────┐
│          HomeComponent                   │
├─────────────────────────────────────────┤
│ ├─ HeaderComponent                      │
│ ├─ HeroSectionComponent                 │
│ ├─ GalleryShowcaseComponent   ← NUEVO  │
│ │  └─ *ngFor de Platos                 │
│ │     └─ 6 Cards                       │
│ ├─ ButtonsComponent                     │
│ ├─ MenuPreviewComponent                 │
│ └─ FooterComponent                      │
└─────────────────────────────────────────┘
```

## 4. Ciclo de Vida del Componente

```
┌─────────────────────────────────────────────────┐
│  Angular Lifecycle Hooks                         │
├─────────────────────────────────────────────────┤
│                                                  │
│  Constructor()                                  │
│    │                                            │
│    └─► GalleryShowcaseComponent creado         │
│                                                  │
│  ngOnInit()                                     │
│    │                                            │
│    └─► Cargar datos (estáticos o API)          │
│         this.platos = [...]                    │
│                                                  │
│  ngAfterViewInit()                              │
│    │                                            │
│    └─► DOM completamente renderizado           │
│                                                  │
│  ngOnDestroy()                                  │
│    │                                            │
│    └─► Limpiar recursos                        │
│         (si hay subscriptions)                 │
│                                                  │
└─────────────────────────────────────────────────┘
```

## 5. Data Binding Flow

```
TypeScript (gallery-showcase.ts)
    │
    │  Property: platos[]
    │
    ▼
HTML Template (gallery-showcase.html)
    │
    │  <div *ngFor="let plato of platos">
    │
    ├─► Property Binding: [src]="plato.imagen"
    ├─► Interpolation: {{ plato.nombre }}
    ├─► Property Binding: [alt]="plato.nombre"
    │
    ▼
DOM Elements Renderizados
    │
    │  <img src="...">
    │  <h3>Mole Poblano</h3>
    │  <p>$120</p>
    │
    ▼
CSS Aplicado (gallery-showcase.css)
    │
    └─► Estilos, animaciones, hover effects
```

## 6. Event Flow

```
User Interactions
    │
    ├─► Mouse Hover
    │   └─► CSS :hover
    │       └─► Show overlay + buttons
    │
    ├─► Click "Ver detalles"
    │   └─► (Click) event
    │       └─► Call component method
    │           └─► Navigate / Modal
    │
    └─► Click "+ Agregar"
        └─► (Click) event
            └─► Call agregarAlCarrito()
                └─► HTTP POST to API
                    └─► Show success/error
```

## 7. Responsive Breakpoints

```
Desktop (1024px+)
  ├─ Featured: 3 columnas (290px cada una)
  ├─ All Dishes: 4 columnas (240px mínimo)
  └─ Fuentes: Grandes


Tablet (768px - 1023px)
  ├─ Featured: 1-2 columnas
  ├─ All Dishes: 2-3 columnas
  └─ Fuentes: Medianas


Mobile (480px - 767px)
  ├─ Featured: 1 columna
  ├─ All Dishes: 1-2 columnas
  └─ Fuentes: Pequeñas


Extra Small (<480px)
  ├─ Featured: 1 columna (100% width)
  ├─ All Dishes: 1 columna
  └─ Fuentes: Muy pequeñas
```

## 8. CSS Cascade

```
Global Styles (styles.css)
    │
    ▼
Component Styles (gallery-showcase.css)
    │
    ├─► .gallery-showcase-section
    │   ├─► .featured-section
    │   │   ├─► .featured-grid
    │   │   └─► .featured-card
    │   │
    │   └─► .dishes-section
    │       ├─► .dishes-grid
    │       └─► .dish-card
    │
    └─► @media queries (Responsive)
```

## 9. Estructura de datos - Objeto Plato

```typescript
interface Plato {
  id: number;              // ID único
  nombre: string;          // Nombre del plato
  descripcion: string;     // Descripción breve
  imagen: string;          // URL de imagen
  precio: number;          // Precio en pesos
  destacado?: boolean;     // Optional - si aparece en destacados
  categoria?: string;      // Optional - categoría
  ingredientes?: string[]; // Optional - lista de ingredientes
}

// Ejemplo:
{
  id: 1,
  nombre: "Mole Poblano",
  descripcion: "Receta ancestral...",
  imagen: "https://...",
  precio: 120,
  destacado: true,
  categoria: "Especialidades",
  ingredientes: ["pollo", "mole", "arroz"]
}
```

## 10. Performance Metrics

```
Componente Optimizado:
├─ Load Time: <2s
├─ Image Loading: Lazy (opcionalmente)
├─ CSS: ~5KB
├─ TypeScript: ~6KB
├─ HTML: ~2KB
├─ Total: <15KB
└─ Lighthouse Score: 85+
```

## 11. Integration Points

```
┌─────────────────────────────────────────┐
│       GalleryShowcaseComponent          │
├─────────────────────────────────────────┤
│                                         │
│  ├─► PlatosService                      │
│  │   └─► Backend API                   │
│  │       └─► Database (platos table)   │
│  │                                     │
│  ├─► CarritoService (cuando se implemente)
│  │   └─► Agregar al carrito           │
│  │                                     │
│  ├─► AuthService (si es admin)        │
│  │   └─► Editar/Eliminar platos       │
│  │                                     │
│  └─► NotificacionService              │
│      └─► Mostrar mensajes             │
│                                        │
└─────────────────────────────────────────┘
```

Esta es la arquitectura que permite que tu galería sea flexible, escalable y fácil de mantener. 🏗️
