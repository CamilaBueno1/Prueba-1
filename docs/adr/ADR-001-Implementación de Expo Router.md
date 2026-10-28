# ADR-001: Usar Expo Router para la navegación y continuidad del flujo

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R1 (Autenticación y persistencia de sesión del técnico), R8 (Estructura multi-pantalla y recuperación de registros interrumpidos) y R9 (Visibilidad transversal del estado de conectividad en toda la jerarquía de vistas).

## Contexto
La aplicación tiene una pantalla de inicio de sesión, una pantalla principal de búsqueda y un registro de medidores de agua dividido en varios pasos secuenciales. El técnico necesita volver atrás entre pasos sin perder los datos ingresados. Según R8, si la aplicación se cierra durante un registro, al abrirla de nuevo debe ofrecer continuar la captura pendiente o descartarla. Además, el estado de conectividad y la cantidad de lecturas pendientes de R9 deben mantenerse visibles al cambiar de pantalla. El proyecto se crea con la plantilla por defecto de Expo SDK 57.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Expo Router (File-based routing)** | Viene incluido de forma nativa en la plantilla de Expo SDK 57, por lo que no agrega dependencias externas. Cada pantalla es un archivo dentro de la carpeta `app`, haciendo visible la estructura de navegación. Su soporte de layouts anidados (`_layout.tsx`) permite mantener el banner global de conectividad (R9) y navegar de forma directa al paso pendiente (R8). | Obliga a seguir una estructura de directorios estricta; cualquier archivo dentro de `app` se convierte en una ruta. Actúa como una capa sobre React Navigation que hay que conocer cuando surge un fallo de enrutamiento. |
| **React Navigation configurado manualmente** | Control total sobre la configuración de cada navegador de forma imperativa. Es la librería base sobre la que se construye Expo Router, con una documentación muy extensa. | Hay que configurar manualmente las rutas y navegadores, lo que añade código repetitivo (*boilerplate*) que la plantilla de Expo ya resuelve. Las rutas se declaran en código y no se visualizan directamente en el explorador de archivos. |
| **Renderizado condicional en pantalla única (Monolítico)** | No requiere ninguna librería de navegación adicional para gestionar el flujo de registro de los pasos. | El botón "Atrás" físico o gestual de Android no maneja el historial de pasos por sí solo sin código manual complejo. La pantalla principal crece desmedidamente hasta mezclar toda la lógica en un solo componente, haciendo imposible reanudar el proceso tras un cierre (R8). |

## Decisión
Se decide implementar **Expo Router**, porque ya forma parte de la infraestructura del proyecto generado con Expo SDK 57. Su sistema basado en archivos y layouts anidados permite mantener elementos comunes, como el indicador de conectividad (R9), y navegar al paso de captura correspondiente. Expo Router no persiste el formulario: la recuperación de R8 se resuelve en conjunto con el almacenamiento local de los otros ADR.

## Consecuencias
* No se agrega ninguna dependencia adicional en el `package.json` para la navegación.
* Los componentes visuales que no son pantallas o layouts deben guardarse estrictamente fuera de la carpeta `app` (por ejemplo, en carpetas como `components`, `services` o `store`), para que Expo Router no intente convertirlos en rutas de acceso.
* La navegación por sí misma no conserva los datos ingresados; Expo Router decide a qué pantalla se dirige la vista, pero la información del formulario debe almacenarse en otra capa.
* **Obligación técnica / Riesgo:** Si se navega a una sub-ruta del formulario antes de terminar de cargar los datos guardados en el almacenamiento local, la pantalla aparecerá vacía. La redirección al paso pendiente debe ejecutarse únicamente después de hidratar los datos persistidos.

## Verificación
* La carpeta `app` del repositorio contiene exclusivamente archivos de rutas, layouts estructurales y pantallas.
* En el teléfono o emulador Android, el botón atrás del sistema retrocede al paso anterior sin perder los datos guardados en el borrador.
* Al reabrir la app con un borrador persistido, se ofrece continuar o descartarlo, después de hidratar el almacenamiento.
* En el archivo `package.json` no existen paquetes de React Navigation instalados manualmente de forma adicional a los que trae la plantilla base.

## Uso de IA
Consulté a la IA sobre las alternativas para organizar la navegación entre pantallas. Me recomendó Expo Router porque ya forma parte del proyecto Expo. También consideré cómo recuperar el registro si la app se cierra: no guardaré los datos del formulario en los parámetros de la ruta, porque la navegación no garantiza su persistencia. Usaré las rutas para cambiar de pantalla y guardaré el borrador en el almacenamiento local para cumplir R8.