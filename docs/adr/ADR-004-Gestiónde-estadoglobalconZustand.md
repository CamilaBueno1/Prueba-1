# ADR-004: Gestión de estado global con Zustand para sesión, borradores y pendientes

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R1 (persistencia de sesión), R4 (lecturas pendientes), R8 (recuperación del borrador) y R9 (indicador de conectividad y lecturas pendientes).

## Contexto
El aplicativo requiere actualizar en tiempo real el contador de lecturas pendientes y el estado de conectividad en el encabezado global (R9), conservar la sesión activa (R1) y recuperar el borrador si la aplicación se cierra a mitad del registro (R8). También necesita reflejar la cola offline del requisito R4.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Zustand (`zustand`) + Middleware `persist` (Elegida)** | Actualiza la interfaz mediante selectores reactivos. Su middleware `persist` permite conservar en `AsyncStorage` sesión, borrador y cola local. | Añade una librería externa pequeña y requiere delimitar qué parte del estado se persiste. |
| **Context API nativo de React** | Integrado nativamente en React sin dependencias adicionales. | Carece de selectores atómicos; cualquier cambio en el borrador o contador re-renderiza toda la jerarquía de componentes suscrita al contexto. |
| **Redux Toolkit** | Control estricto y centralizado de todo el estado de la aplicación. | Introduce una sobreingeniería excesiva (*boilerplate*, *reducers*, *actions*) innecesaria para la escala de este proyecto. |

## Decisión
Se elige **Zustand** como gestor de estado global de la interfaz y del flujo de campo. Sus selectores reactivos actualizan el contador de pendientes y la conexión (R9); el middleware `persist`, conectado a AsyncStorage, conserva la sesión, el borrador y la cola offline (R1, R4 y R8). TanStack Query administra por separado las consultas y el caché persistido de medidores (R3), como se explica en ADR-003.

## Consecuencias
* Sus selectores permiten actualizar únicamente los componentes suscritos al dato que cambió, como el contador del encabezado.
* Introduce la librería `zustand` en el archivo `package.json`, aunque con un impacto mínimo en el tamaño final del paquete.
* **Separación de responsabilidades:** Zustand conserva los datos de campo; TanStack Query mantiene las fichas del servidor. El middleware de Zustand y el persister de TanStack Query deben usar claves distintas y versionadas en AsyncStorage.

## Verificación
* En el archivo `package.json` está presente la dependencia `zustand`.
* El encabezado principal utiliza un selector de Zustand para renderizar el número de pendientes sin afectar a las vistas hijas.
* Al ingresar datos en un formulario, cerrar forzosamente la aplicación y reabrirla, Zustand recupera el borrador y la cola local desde `AsyncStorage`.
* El caché de medidores se restaura desde el QueryClient persistido y no desde una segunda copia en Zustand.

## Uso de IA
Consulté a la IA sobre alternativas para compartir el estado entre pantallas. Elegí **Zustand** por su API ligera y sus selectores, que permiten actualizar componentes concretos, como el indicador de pendientes. Con AsyncStorage persistirá la sesión, el borrador y la cola; TanStack Query gestionará por separado las consultas y el caché de medidores.