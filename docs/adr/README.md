# Registro de Decisiones de Arquitectura (ADR)

## Proyecto: App de registro de lecturas de medidores de agua — EPMAPS

**Empresa:** Empresa Pública Metropolitana de Agua Potable y Saneamiento, Quito  
**Plataforma:** React Native con Expo SDK 57, TypeScript, Expo Router  
**Última actualización:** 27 de octubre de 2026

---

## ¿Qué es un ADR?

Un ADR (*Architecture Decision Record*) documenta una decisión de diseño o tecnológica significativa: el contexto que la motivó, las alternativas evaluadas, la opción elegida y las consecuencias que implica. El objetivo es que cualquier miembro del equipo pueda entender *por qué* el proyecto está construido como está.

---

## Índice de decisiones

| # | Archivo | Decisión principal | Estado | Fecha |
|:---:|:---|:---|:---:|:---:|
| 001 | [ADR-001-navegacion-expo-router.md](./ADR-001-navegacion-expo-router.md) | Usar **Expo Router** para la navegación y continuidad del flujo | Aceptado | 27/10/2026 |
| 002 | [ADR-002-almacenamiento-local-async-storage.md](./ADR-002-almacenamiento-local-async-storage.md) | Usar **AsyncStorage** para el almacenamiento local y caché de datos | Aceptado | 27/10/2026 |
| 003 | [ADR-003-consulta-de-medidores-tanstack-query.md](./ADR-003-consulta-de-medidores-tanstack-query.md) | Usar **TanStack Query** para consultar los medidores | Aceptado | 27/10/2026 |
| 004 | [ADR-004-estado-global-zustand.md](./ADR-004-estado-global-zustand.md) | Gestión de estado global con **Zustand** para sesión, borradores y pendientes | Aceptado | 27/10/2026 |
| 005 | [ADR-005-captura-de-evidencias-fotograficas-y-gestion-de-archivos.md](./ADR-005-captura-de-evidencias-fotograficas-y-gestion-de-archivos.md) | Captura de evidencias fotográficas con **expo-image-picker** y **expo-file-system** | Aceptado | 27/10/2026 |
| 006 | [ADR-006-validacion-de-formularios-con-react-hook-form.md](./ADR-006-validacion-de-formularios-con-react-hook-form.md) | Validación de formularios con **React Hook Form** (sin Zod) | Aceptado | 27/10/2026 |
| 007 | [ADR-007-deteccion-de-conectividad-y-sincronizacion-de-pendientes.md](./ADR-007-deteccion-de-conectividad-y-sincronizacion-de-pendientes.md) | Detección de conectividad con **expo-network** y cola persistida en Zustand | Aceptado | 27/10/2026 |
| 008 | [ADR-008-identidad-visual-y-uso-en-campo.md](./ADR-008-identidad-visual-y-uso-en-campo.md) | Sistema visual propio con componentes nativos para uso en campo | Aceptado | 27/10/2026 |

---

## Mapa de dependencias entre ADR

```
ADR-001 (Expo Router)
    └── depende del contexto de │
        ├── ADR-004 (Zustand)   │  — decide a qué pantalla navegar tras hidratar
        └── ADR-002 (AsyncStorage) — los datos del formulario se guardan aquí, no en la ruta

ADR-002 (AsyncStorage)  ←── es el motor de almacenamiento de:
    ├── ADR-004 (Zustand persist)   — sesión, borrador, cola offline
    └── ADR-003 (TanStack persister) — caché de fichas de medidores

ADR-003 (TanStack Query)
    └── depende de ADR-002 (AsyncStorage) para persistir el QueryClient

ADR-004 (Zustand)
    ├── provee estado a ADR-006 (borrador del formulario)
    ├── provee cola a ADR-007 (sincronización)
    └── depende de ADR-002 (AsyncStorage)

ADR-005 (Fotos)
    └── guarda fotoNombre en el store de ADR-004 (Zustand)

ADR-006 (React Hook Form)
    ├── lee ficha de ADR-003 (TanStack Query)
    └── guarda borrador en ADR-004 (Zustand)

ADR-007 (Conectividad y sincronización)
    ├── lee cola de ADR-004 (Zustand)
    └── fotos no se eliminan al enviar → ADR-005

ADR-008 (Identidad visual)
    └── consume estados de ADR-007 y ADR-004 para mostrar indicadores
```

---

## Tecnologías clave y sus responsabilidades

| Tecnología | Versión / Paquete | Responsabilidad |
|:---|:---|:---|
| Expo SDK | 57 | Plataforma base |
| Expo Router | Incluido en SDK 57 | Navegación por archivos, layouts anidados |
| AsyncStorage | `@react-native-async-storage/async-storage` | Motor de persistencia local (clave-valor) |
| Zustand | `zustand` | Estado global reactivo + persist de sesión/borrador/cola |
| TanStack Query | `@tanstack/react-query` | Consultas, caché y estado de carga de medidores |
| TanStack Persisters | `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister` | Persistencia del QueryClient en AsyncStorage |
| React Hook Form | `react-hook-form` | Validación declarativa de formularios (sin Zod) |
| expo-image-picker | `expo-image-picker` | Captura de fotos desde la cámara |
| expo-file-system | `expo-file-system` | Copia de fotos al directorio persistente de la app |
| expo-network | `expo-network` | Detección de cambios de conectividad |

---

> **Nota:** Este archivo se genera y mantiene manualmente. Actualízalo cada vez que se agregue, modifique o deprece un ADR.

