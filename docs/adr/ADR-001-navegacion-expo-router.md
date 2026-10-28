# ADR-001: Usar Expo Router para la navegación y continuidad del flujo

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R1 (autenticación y persistencia de sesión del técnico), R8 (estructura multi-pantalla y recuperación de registros interrumpidos) y R9 (visibilidad transversal del estado de conectividad en toda la jerarquía de vistas).

## Contexto
La aplicación tiene una pantalla de inicio de sesión, una pantalla principal de búsqueda de medidores y un registro de lecturas dividido en varios pasos secuenciales. El técnico debe poder volver atrás entre pasos sin perder los datos ingresados. Según R8, si la aplicación se cierra durante un registro, al abrirla de nuevo debe ofrecer continuar la captura pendiente o descartarla. Además, el estado de conectividad y la cantidad de lecturas pendientes de R9 deben mantenerse visibles al cambiar de pantalla. El proyecto se crea con la plantilla por defecto de Expo SDK 57.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Expo Router (File-based routing) — Elegida** | Viene incluido en la plantilla de Expo SDK 57, sin agregar dependencias. Cada pantalla es un archivo dentro de `app/`, lo que hace visible la estructura de navegación. Sus layouts anidados (`_layout.tsx`) permiten mantener el banner global de conectividad (R9) y navegar directamente al paso pendiente (R8). | Obliga a seguir una estructura de directorios estricta; cualquier archivo dentro de `app/` se convierte en ruta. Actúa como capa sobre React Navigation, lo que hay que entender cuando ocurre un fallo de enrutamiento. |
| **React Navigation configurado manualmente** | Control total sobre cada navegador de forma imperativa. Es la librería base sobre la que se construye Expo Router, con documentación extensa. | Requiere configurar manualmente rutas y navegadores, añadiendo código repetitivo que la plantilla de Expo ya resuelve. Las rutas se declaran en código y no se ven en el explorador de archivos. |
| **Renderizado condicional en pantalla única (Monolítico)** | No requiere librería de navegación adicional para el flujo de registro. | El botón "Atrás" de Android no maneja el historial de pasos sin código manual complejo. La pantalla crece hasta mezclar toda la lógica de los pasos en un solo componente, imposibilitando reanudar el proceso tras un cierre (R8). |

## Decisión
Se decide implementar **Expo Router**, porque ya forma parte del proyecto generado con Expo SDK 57. Su sistema basado en archivos y layouts anidados permite mantener elementos comunes como el indicador de conectividad (R9) y navegar al paso de captura correspondiente. Expo Router no persiste el formulario: la recuperación de R8 se resuelve en conjunto con el almacenamiento local descrito en los otros ADR.

## Consecuencias
* No se agrega ninguna dependencia adicional en `package.json` para la navegación.
* Los componentes que no son pantallas ni layouts deben guardarse fuera de `app/` (en `components/`, `services/` o `store/`), para que Expo Router no los convierta en rutas.
* La navegación por sí misma no conserva los datos ingresados; Expo Router decide a qué pantalla se dirige, pero los datos del formulario se almacenan en otra capa (ADR-004).
* **Riesgo técnico:** si se navega al paso pendiente antes de terminar de leer los datos guardados en el almacenamiento local, la pantalla aparecerá vacía. La redirección debe ocurrir solo después de hidratar los datos persistidos.

## Verificación
* La carpeta `app/` contiene exclusivamente archivos de rutas, layouts y pantallas.
* En el teléfono o emulador Android, el botón atrás retrocede al paso anterior sin perder los datos del borrador.
* Al reabrir la app con un borrador persistido, se ofrece continuar o descartarlo, después de hidratar el almacenamiento.
* En `package.json` no hay paquetes de React Navigation instalados manualmente además de los que trae la plantilla.

## Uso de IA
Consulté a la IA sobre las alternativas para organizar la navegación entre pantallas. Me recomendó Expo Router porque ya forma parte del proyecto Expo. También consideré cómo recuperar el registro si la app se cierra: no guardo los datos del formulario en los parámetros de la ruta, porque la navegación no garantiza su persistencia. Uso las rutas para cambiar de pantalla y guardo el borrador en el almacenamiento local para cumplir R8.

