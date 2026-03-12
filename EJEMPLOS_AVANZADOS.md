# 🔧 Ejemplos Avanzados - Integración con API

## 📡 Usar Datos Dinámicos de un Backend

### Paso 1: Importar el Servicio en Gallery Showcase

Actualiza `gallery-showcase.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatosService } from '../../services/platos.service';

interface Plato {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  destacado?: boolean;
}

@Component({
  selector: 'app-gallery-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-showcase.html',
  styleUrls: ['./gallery-showcase.css'],
})
export class GalleryShowcaseComponent implements OnInit {
  platos: Plato[] = [];
  cargando: boolean = true;
  error: string | null = null;

  constructor(private platosService: PlatosService) {}

  ngOnInit() {
    this.cargarPlatos();
  }

  // Cargar todos los platos
  cargarPlatos() {
    this.platosService.getPlatos().subscribe({
      next: (data) => {
        this.platos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar platos:', err);
        this.error = 'Error al cargar los platos';
        this.cargando = false;
      }
    });
  }

  // Cargar solo platos destacados
  cargarPlatosDestacados() {
    this.platosService.getPlatosDestacados().subscribe({
      next: (data) => {
        this.platos = data;
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }
}
```

### Paso 2: EstructuraBooleana esperada del Backend

Tu API debe devolver:

```json
[
  {
    "id": 1,
    "nombre": "Mole Poblano",
    "descripcion": "Receta ancestral con pollo tierno",
    "imagen": "https://tu-servidor.com/images/mole.jpg",
    "precio": 120,
    "destacado": true,
    "categoria": "Especialidades"
  },
  {
    "id": 2,
    "nombre": "Enchiladas Verdes",
    "descripcion": "Enchiladas con salsa verde",
    "imagen": "https://tu-servidor.com/images/enchiladas.jpg",
    "precio": 95,
    "destacado": true,
    "categoria": "Platos Principales"
  }
]
```

### Paso 3: Actualizar HTML para mostrar estado de carga

En `gallery-showcase.html`:

```html
<section class="gallery-showcase-section">
  <!-- Loading State -->
  <div *ngIf="cargando" class="loading-state">
    <p>Cargando platos...</p>
  </div>

  <!-- Error State -->
  <div *ngIf="error && !cargando" class="error-state">
    <p>{{ error }}</p>
  </div>

  <!-- Gallery (cuando ya cargó) -->
  <div class="container-fluid" *ngIf="!cargando && !error">
    <!-- ... resto del HTML igual ... -->
  </div>
</section>
```

### Paso 4: Agregar CSS para estados

En `gallery-showcase.css`:

```css
.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: #666;
}

.error-state {
  color: #d30e0e;
  background: #ffe8e8;
  border-radius: 8px;
  padding: 20px;
}
```

## 🔄 Refrescar Datos Periódicamente

Si quieres actualizar los platos cada cierto tiempo:

```typescript
export class GalleryShowcaseComponent implements OnInit, OnDestroy {
  platos: Plato[] = [];
  private subscription: Subscription;

  constructor(private platosService: PlatosService) {}

  ngOnInit() {
    this.cargarPlatos();

    // Recargar cada 5 minutos (300000 ms)
    this.subscription = interval(300000).subscribe(() => {
      this.cargarPlatos();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cargarPlatos() {
    this.platosService.getPlatos().subscribe({
      next: (data) => {
        this.platos = data;
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }
}
```

No olvides importar:

```typescript
import { interval, Subscription } from 'rxjs';
```

## 🎯 Filtrar por Categoría

Agrega el filtro en el componente:

```typescript
export class GalleryShowcaseComponent implements OnInit {
  platos: Plato[] = [];
  categoriaSeleccionada: string = '';
  categorias: string[] = [];

  constructor(private platosService: PlatosService) {}

  ngOnInit() {
    this.cargarPlatos();
  }

  cargarPlatos() {
    this.platosService.getPlatos().subscribe({
      next: (data) => {
        this.platos = data;
        this.categorias = [...new Set(data.map(p => p.categoria))];
      }
    });
  }

  filtrarPorCategoria(categoria: string) {
    if (categoria === '') {
      this.cargarPlatos();
    } else {
      this.platosService.getPlatosByCategoria(categoria).subscribe({
        next: (data) => {
          this.platos = data;
        }
      });
    }
    this.categoriaSeleccionada = categoria;
  }
}
```

Agrega en el HTML:

```html
<div class="categoria-filter">
  <button
    *ngFor="let cat of categorias"
    (click)="filtrarPorCategoria(cat)"
    [class.active]="categoriaSeleccionada === cat"
  >
    {{ cat }}
  </button>
</div>
```

## 💾 Guardar Plato en Carrito

Conecta con tu servicio de carrito:

```typescript
agregarAlCarrito(plato: Plato) {
  this.carritoService.agregar(plato).subscribe({
    next: () => {
      // Mostrar notificación de éxito
      console.log('Plato agregado al carrito');
    },
    error: (err) => {
      console.error('Error al agregar:', err);
    }
  });
}
```

En el HTML:

```html
<button
  class="featured-add-btn"
  (click)="agregarAlCarrito(plato)"
>
  + Agregar al carrito
</button>
```

## 🖼️ Subir Imágenes a Cloudinary (Recomendado)

### Paso 1: Registrarse en Cloudinary
- Ve a https://cloudinary.com/
- Crea una cuenta gratis
- Obtén tu Cloud Name

### Paso 2: Servicio para subir imágenes

```typescript
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudName = 'tu-cloud-name';
  private uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  constructor(private http: HttpClient) {}

  subirImagen(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'tu_preset'); // Crear en Cloudinary

    return this.http.post(this.uploadUrl, formData);
  }
}
```

### Paso 3: Usar en componente

```typescript
subirImagenYCrearPlato(file: File, platoData: Plato) {
  this.cloudinaryService.subirImagen(file).subscribe({
    next: (response) => {
      platoData.imagen = response.secure_url;
      this.platosService.crearPlato(platoData).subscribe({
        next: () => {
          console.log('Plato creado exitosamente');
          this.cargarPlatos();
        }
      });
    }
  });
}
```

## 🔐 Autenticación para Admin

Si solo los admin pueden editar:

```typescript
actualizarPlato(plato: Plato) {
  const token = localStorage.getItem('token');

  this.platosService.actualizarPlato(plato.id, plato).subscribe({
    next: () => {
      console.log('Plato actualizado');
      this.cargarPlatos();
    },
    error: (err) => {
      if (err.status === 401) {
        console.log('No autorizado');
      }
    }
  });
}
```

## 📊 Estadísticas de Platos

Track cuál es el favorito:

```typescript
export class GalleryShowcaseComponent {
  platos: Plato[] = [];

  registrarVisualizacion(plato: Plato) {
    this.platosService.registrarVisualizacion(plato.id).subscribe({
      next: () => {
        console.log('Visualización registrada');
      }
    });
  }

  metodoPrincipal() {
    this.platos.forEach(plato => {
      this.registrarVisualizacion(plato);
    });
  }
}
```

---

**¡Ahora tienes todo listo para integrar datos dinámicos!** 🚀
