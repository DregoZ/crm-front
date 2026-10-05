# 🍸 CRM Coctelería & Eventos — Frontend (Angular 17 SPA)

[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge&logo=git)](https://github.com/DregoZ/crm-front)
[![Angular](https://img.shields.io/badge/Angular-17.3-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular Material](https://img.shields.io/badge/Angular%20Material-17.3-3F51B5?style=for-the-badge&logo=angular&logoColor=white)](https://material.angular.io/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)](https://rxjs.dev/)

> **Single Page Application (SPA) para la gestión comercial, operativa y logística de catering de coctelería y barras móviles para eventos.**  
> Diseñada e implementada utilizando la versión más reciente de **Angular 17**, con arquitectura basada en **Standalone Components**, reactividad con **Angular Signals** y `ChangeDetectionStrategy.OnPush`.
>
> 🔌 **Backend REST API:** [Repositorio Node.js / Express (`crm-back`)](https://github.com/DregoZ/crm-back)

---

## 🚀 Puntos Técnicos Destacados (Frontend Architecture)

- **Standalone Components:** Aplicación 100% libre de `NgModules`, optimizando el tree-shaking y la carga modular.
- **Angular Signals:** Adopción de la nueva API reactiva de Angular (`signal`, `computed`, `input()`, `output()`) para un flujo de datos unidireccional y predecible.
- **OnPush Change Detection:** Implementación sistemática de `ChangeDetectionStrategy.OnPush` en todos los componentes para un rendimiento óptimo en aplicaciones de gran densidad de datos.
- **Componentes Reutilizables Desacoplados:**
  - `DataTableComponent`: Tabla dinámica tipada con paginación en servidor, ordenación multicriterio, barra de búsqueda con operador `debounceTime` y acciones contextuales.
  - `ModalFormComponent`: Renderizador dinámico de formularios emergentes a partir de metadatos de configuración (`FormFieldConfig`), facilitando la creación y edición de entidades sin duplicar lógica de modales.
  - `ButtonComponent`: Sistema de botones con soporte de iconos Material y estilos homogéneos.
- **Enrutamiento y Carga Perezosa (Lazy Loading):** Todas las características de negocio (`clientes`, `eventos`, `catalogo`, etc.) se cargan bajo demanda mediante `loadComponent` dinámico.
- **Seguridad en Cliente:**
  - `AuthGuard` funcional para proteger rutas autenticadas.
  - `JwtInterceptor` para inyectar automáticamente cabeceras `Authorization: Bearer <token>` y gestionar expiraciones de sesión.

---

## 📂 Organización de Carpetas

```text
src/app/
├── core/                  # Singleton services, Guards, Interceptors, Modelos globales
│   ├── guards/            # authGuard
│   ├── interceptors/      # jwtInterceptor
│   ├── models/            # Interfaces de usuario y autenticación
│   └── services/          # AuthService
├── features/              # Módulos funcionales de negocio (Lazy Loaded)
│   ├── auth/login         # Vista y lógica de inicio de sesión
│   ├── catalogo/          # Cócteles, tipos de barra e insumos
│   ├── clientes/          # Listado, filtrado y ficha de clientes
│   ├── dashboard/         # Métricas y resumen operativo
│   └── eventos/           # Planificación de eventos, estados y presupuestos
├── layout/                # Shell general de la aplicación (Sidebar, navegación, header)
└── shared/                # Componentes y modelos compartidos
    └── models/components/
        ├── data-table/    # Tabla dinámica reutilizable
        ├── modal-form/    # Formularios modales configurables
        └── button/        # Botón genérico estilizado
```

---

## 🛠️ Puesta en Marcha en Local

### Prerrequisitos
- Node.js 18+ y npm
- Angular CLI (`npm install -g @angular/cli@17`)
- Backend `crm-back` en ejecución en `http://localhost:3000`

### Instrucciones

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm start
   ```

3. **Acceder a la aplicación:**
   Abre [http://localhost:4200](http://localhost:4200) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 👤 Autor

Desarrollado por **[DregoZ](https://github.com/DregoZ)**  
Parte del portfolio personal de proyectos Full-Stack.
