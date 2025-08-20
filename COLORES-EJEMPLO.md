# 🎨 Guía de Colores Personalizados

## 🌟 Colores Principales

### Fondo Principal - Beige Suave
- **Clase CSS:** `bg-background`
- **Color:** Beige suave con un toque cálido (oklch(0.9735 0.0049 112.7))
- **Uso:** Fondo principal de la página, tarjetas, contenedores

### Verde Botella - Botones y Elementos Principales
- **Clase CSS:** `bg-bottle`
- **Color:** Verde botella personalizado (oklch(0.3309 0.1677 142.94))
- **Variantes:**
  - `bg-bottle` - Verde botella principal
  - `bg-bottle-light` - Verde botella claro (oklch(0.45 0.1677 142.94))
  - `bg-bottle-dark` - Verde botella oscuro (oklch(0.25 0.1677 142.94))
  - `text-bottle-foreground` - Texto blanco sobre verde botella

## 🚀 Cómo Usar

### 1. Botones con Verde Botella
```tsx
import { Button } from "@/components/ui/button"

// Botón verde botella
<Button variant="bottle">
  Mi Botón Verde
</Button>

// Botón verde botella grande
<Button variant="bottle" size="lg">
  Botón Grande
</Button>
```

### 2. Fondos con Blanco Roto
```tsx
// Contenedor principal
<div className="bg-background min-h-screen">
  <div className="bg-card p-6 rounded-lg">
    Contenido de la tarjeta
  </div>
</div>

// Elementos secundarios
<div className="bg-secondary p-4 rounded-md">
  Elemento secundario
</div>
```

### 3. Combinaciones de Colores
```tsx
// Tarjeta con borde verde botella
<div className="bg-card border-2 border-bottle p-6 rounded-lg">
  <h2 className="text-bottle font-bold">Título Verde</h2>
  <p className="text-foreground">Contenido normal</p>
</div>

// Botón outline con verde botella
<Button variant="outline" className="border-bottle text-bottle hover:bg-bottle hover:text-white">
  Botón Outline Verde
</Button>
```

## 🎯 Clases CSS Disponibles

### Fondos
- `bg-background` - Fondo principal (blanco roto)
- `bg-card` - Fondo de tarjetas
- `bg-secondary` - Fondo secundario
- `bg-bottle` - Verde botella principal
- `bg-bottle-light` - Verde botella claro
- `bg-bottle-dark` - Verde botella oscuro

### Texto
- `text-foreground` - Texto principal
- `text-bottle` - Texto verde botella
- `text-bottle-foreground` - Texto blanco para botones verdes

### Bordes
- `border-bottle` - Borde verde botella
- `border-bottle-light` - Borde verde botella claro

### Estados
- `hover:bg-bottle-light` - Hover verde botella claro
- `focus:ring-bottle` - Anillo de foco verde botella

## 🔧 Personalización

Si quieres ajustar los colores, modifica las variables CSS en `src/app/globals.css`:

```css
:root {
  --background: oklch(0.9735 0.0049 112.7); /* Beige suave */
  --primary: oklch(0.3309 0.1677 142.94);    /* Verde botella personalizado */
}
```

Y en `tailwind.config.ts`:

```ts
bottle: {
  DEFAULT: 'oklch(0.3309 0.1677 142.94)',    // Verde botella principal
  light: 'oklch(0.45 0.1677 142.94)',        // Verde botella claro
  dark: 'oklch(0.25 0.1677 142.94)',         // Verde botella oscuro
  foreground: '#FFFFFF'                        // Texto sobre verde botella
}
```

## ✨ Ejemplos de Uso en la Aplicación

### Página Principal
```tsx
export default function HomePage() {
  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card border-b border-secondary p-6">
        <h1 className="text-2xl font-bold text-foreground">
          Gestión de Usuarios
        </h1>
      </header>
      
      <main className="container mx-auto p-6">
        <Button variant="bottle" size="lg">
          Crear Nuevo Usuario
        </Button>
        
        <div className="bg-card mt-6 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Lista de Usuarios
          </h2>
          {/* Contenido de la tabla */}
        </div>
      </main>
    </div>
  )
}
```

¡Ahora tienes una paleta de colores consistente y profesional para tu aplicación!
