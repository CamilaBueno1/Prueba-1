# ADR-006: Validación de formularios con React Hook Form y Zod (R2 y R8)

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R2 (Captura de lectura con datos obligatorios) y R8 (Validación en tiempo real y prevención de errores).

## Contexto
El registro de lecturas de medidores por parte del técnico de EPMAPS exige validar campos obligatorios (código de medidor, lectura numéricamente coherente y evidencia fotográfica) antes de permitir el guardado local en la cola de pendientes o su envío a la API. 

Manejar las validaciones directamente con estados de React (`useState`) genera código extenso, re-renderizados innecesarios por cada pulsación de tecla y acoplamiento entre la lógica de validación y la interfaz. Se requiere un esquema de validación declarativo, con tipado estático estricto y alto rendimiento visual.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **React Hook Form + Zod (`@hookform/resolvers/zod`) (Elegida)** | Minimiza los re-renderizados al capturar valores de forma no controlada. Zod separa las reglas de negocio en un esquema tipado reutilizable que infiere los tipos de TypeScript automáticamente. | Requiere integrar la librería de esquemas Zod y el conector de resolvers al proyecto. |
| **Validación interna de React Hook Form (sin Zod)** | No requiere librerías de esquemas adicionales. | Acopla los mensajes y reglas de validación directamente dentro del código JSX de la pantalla, dificultando su reutilización y tipado dinámico. |
| **Validaciones manuales con `useState`** | Totalmente nativo en React sin dependencias externas. | Re-renderiza la pantalla entera con cada carácter escrito, generando ralentizaciones en dispositivos móviles de gama media. |

## Decisión
Se decide implementar **React Hook Form en conjunto con Zod** para la gestión de formularios y validaciones. Zod centraliza las reglas de negocio (ej. campos requeridos, valores numéricos mayores a cero) mediante un esquema tipado, mientras que React Hook Form gestiona el estado y ciclo de vida del formulario en la interfaz con el mínimo impacto en la memoria RAM.

## Consecuencias

* Garantiza que los datos validados coincidan exactamente con la estructura de tipos esperada por la cola de Zustand sin acoplar lógica en las vistas.
* Requiere definir formalmente el esquema de Zod (`z.object({...})`) antes de vincular los componentes de entrada (*inputs*).
*Introduce `react-hook-form`, `zod` y `@hookform/resolvers` en el archivo de configuración `package.json`.

* **Control requerido:** Es indispensable personalizar los mensajes de validación de Zod en español para que los errores mostrados en pantalla sean claros para el técnico de campo.

## Verificación
* Las librerías `react-hook-form`, `zod` y `@hookform/resolvers` constan en el archivo `package.json`.
* Al intentar guardar una lectura sin código o con valor negativo, el formulario bloquea el evento de guardado y resalta los campos con error.
* El objeto con la lectura solo se transfiere al *store* de Zustand cuando el esquema de Zod retorna una validación limpia.

## Uso de IA
Se evaluó usar validaciones nativas de React Hook Form o estados locales. Se eligió React Hook Form + Zod por la solidez del tipado estático automático con TypeScript, la reutilización de esquemas de validación y la prevención de renderizados innecesarios.