# ADR-004: Gestión de estado global con Zustand para borrador (R8) e indicador de pendientes (R9)

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R1 (Persistencia de sesión), R8 (Recuperación transparente de borradores) y R9 (Indicador visual de pendientes).

## Contexto
El aplicativo requiere actualizar en tiempo real el contador de lecturas pendientes en el encabezado global mientras el técnico trabaja sin conexión (R9), conservar la sesión activa (R1) y recuperar automáticamente el borrador si la aplicación se cierra inesperadamente a mitad del registro (R8).

Usar Context API tradicional provocaría re-renderizados innecesarios en componentes pesados de la interfaz al cambiar el contador del encabezado, además de exigir código manual repetitivo para guardar y leer los datos desde el almacenamiento local. Se necesita una solución ligera que reaccione al instante mediante selectores y persista el estado en disco de forma transparente.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Zustand (`zustand`) + Middleware `persist` (Elegida)** | Actualiza la interfaz mediante selectores reactivos sin re-renderizar pantallas completas. Su middleware de persistencia se acopla directamente con `AsyncStorage`, guardando borradores y pendientes en una sola línea de código. | Añade una librería externa pequeña al archivo de dependencias. |
| **Context API nativo de React** | Integrado nativamente en React sin dependencias adicionales. | Carece de selectores atómicos; cualquier cambio en el borrador o contador re-renderiza toda la jerarquía de componentes suscrita al contexto. |
| **Redux Toolkit** | Control estricto y centralizado de todo el estado de la aplicación. | Introduce una sobreingeniería excesiva (*boilerplate*, *reducers*, *actions*) innecesaria para la escala de este proyecto. |

## Decisión
Se elige **Zustand** como gestor de estado global de la interfaz. Su rendimiento basado en selectores reactivos y su acoplamiento transparente con `AsyncStorage` garantizan la actualización instantánea del contador de pendientes en el encabezado (R9), la conservación de la sesión (R1) y la recuperación automática del borrador ante cierres forzados (R8).

## Consecuencias
*  Sus selectores atómicos permiten actualizar únicamente el componente del encabezado sin causar re-renderizados en la pantalla activa.
*  Exige mantener delimitado el estado de la interfaz en Zustand respecto al estado del servidor gestionado por TanStack Query.
* **Control requerido:** Es necesario definir claves únicas (*storage keys*) dentro del middleware `persist` para evitar conflictos en `AsyncStorage` entre los distintos *stores* de la aplicación.

## Verificación
* En el archivo `package.json` está presente la dependencia `zustand`.
* El encabezado principal utiliza un selector de Zustand para renderizar el número de pendientes sin afectar a las vistas hijas.
* Al ingresar datos en un formulario, cerrar forzosamente la aplicación y reabrirla, Zustand recupera el borrador intacto desde `AsyncStorage`.

## Uso de IA
Se evaluaron Context API y Redux Toolkit para el manejo del estado global. **Se eligió Zustand** por su ligereza, por evitar re-renderizados innecesarios mediante selectores y por su integración nativa con `AsyncStorage`, resolviendo R1, R8 y R9 de forma directa.