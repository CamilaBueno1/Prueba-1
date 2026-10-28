# ADR-001: Usar Expo Router para la navegación y continuidad del flujo

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R1 (Autenticación y persistencia de sesión del técnico), R8 (Estructura multi-pantalla y recuperación de registros interrumpidos) y R9 (Visibilidad transversal del estado de conectividad en toda la jerarquía de vistas).

## Contexto
La aplicación tiene una pantalla de inicio de sesión, una pantalla principal de búsqueda y listado, y un registro de medidores de agua dividido en varios pasos secuenciales. El técnico necesita poder volver atrás entre los pasos sin perder los datos que ya ingresó. Además, según el requisito R8, si la aplicación se cierra inesperadamente a mitad de un registro, al abrirla de nuevo debe ofrecer la posibilidad de llevar al técnico directamente al paso en el que se quedó, sin tener que recorrer las pantallas anteriores. Asimismo, componentes globales como el banner de red del requisito R9 deben mantenerse visibles mientras se transita entre vistas. El proyecto se crea con la plantilla por defecto de Expo SDK 57.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Expo Router (File-based routing)** | Viene incluido de forma nativa en la plantilla de Expo SDK 57, por lo que no agrega dependencias externas. Cada pantalla es un archivo dentro de la carpeta `app`, haciendo visible la estructura de navegación. Su soporte de layouts anidados (`_layout.tsx`) permite mantener el banner global de conectividad (R9) y navegar de forma directa al paso pendiente (R8). | Obliga a seguir una estructura de directorios estricta; cualquier archivo dentro de `app` se convierte en una ruta. Actúa como una capa sobre React Navigation que hay que conocer cuando surge un fallo de enrutamiento. |
| **React Navigation configurado manualmente** | Control total sobre la configuración de cada navegador de forma imperativa. Es la librería base sobre la que se construye Expo Router, con una documentación muy extensa. | Hay que instalarla y configurarla a mano, lo que añade dependencias y código repetitivo (*boilerplate*) que la plantilla de Expo ya resuelve por defecto. Las rutas se declaran en código y no se visualizan directamente en el explorador de archivos. |
| **Renderizado condicional en pantalla única (Monolítico)** | No requiere ninguna librería de navegación adicional para gestionar el flujo de registro de los pasos. | El botón "Atrás" físico o gestual de Android no maneja el historial de pasos por sí solo sin código manual complejo. La pantalla principal crece desmedidamente hasta mezclar toda la lógica en un solo componente, haciendo imposible reanudar el proceso tras un cierre (R8). |

## Decisión
Se decide implementar **Expo Router**, porque ya forma parte de la infraestructura del proyecto generado con Expo SDK 57 y su sistema de enrutamiento basado en archivos (junto con los layouts anidados) permite mantener la visibilidad global de la red (R9) y dirigir al técnico al paso pendiente con una sola instrucción directa (R8).

## Consecuencias
* No se agrega ninguna dependencia adicional en el `package.json` para la navegación.
* Los componentes visuales que no son pantallas o layouts deben guardarse estrictamente fuera de la carpeta `app` (por ejemplo, en carpetas como `components`, `services` o `store`), para que Expo Router no intente convertirlos en rutas de acceso.
* La navegación por sí misma no conserva los datos ingresados; Expo Router decide a qué pantalla se dirige la vista, pero la información del formulario debe almacenarse en otra capa.
* **Obligación técnica / Riesgo:** Si se navega a una sub-ruta del formulario antes de terminar de cargar los datos guardados en el almacenamiento local, la pantalla aparecerá vacía. La redirección al paso pendiente debe ejecutarse únicamente después de hidratar los datos persistidos.

## Verificación
* La carpeta `app` del repositorio contiene exclusivamente archivos de rutas, layouts estructurales y pantallas.
* En el teléfono o emulador con Android, el botón atrás del sistema retrocede de un paso al anterior dentro del flujo de registro.
* En el archivo `package.json` no existen paquetes de React Navigation instalados manualmente de forma adicional a los que trae la plantilla base.

## Uso de IA
Le pregunté a la IA qué opción convenía más para organizar la navegación entre pantallas y mantener el diseño limpio. Me sugirió usar Expo Router porque ya viene listo con Expo, lo cual me pareció perfecto. Sin embargo, lo descarté por completo la idea de guardar el estado de los pasos mandándolo por los parámetros de la URL, porque si la app se cierra por completo, esos datos se borran y no cumpliría con lo que pide el requisito R8. Prefiero usar la ruta solo para cambiar de pantalla y guardar los datos en otro lado de forma segura.