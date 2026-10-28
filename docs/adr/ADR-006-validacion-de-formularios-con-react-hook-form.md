# ADR-006: Validación de formularios con React Hook Form (R2, R5, R6, R7 y R10)

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R2 (validación del código del medidor), R5 (reglas según el estado del medidor), R6 y R7 (consumo anómalo, confirmación y foto condicional) y R10 (rechazo de duplicados y edición de lecturas pendientes).

## Contexto
El registro debe validar el código con el formato `MED-` seguido de seis dígitos antes de consultar el sistema de oficina. Además, los campos requeridos dependen del estado: normal exige lectura; inaccesible exige motivo y deshabilita el campo de lectura; dañado exige descripción y admite lectura vacía. La anomalía se determina comparando la lectura actual con la anterior y el promedio mensual mediante funciones puras del dominio. Si el consumo supera tres veces el promedio, se exige confirmación del técnico y foto; un medidor dañado también requiere foto.

El formulario abarca varias pantallas y sus datos deben persistirse como borrador para cumplir R8; esa recuperación corresponde al almacenamiento local (ADR-002, ADR-004) y no a la librería de validación. Asimismo, validar campos no basta para evitar un segundo registro del mismo medidor en el mismo mes ni para impedir editar una lectura ya enviada: esas reglas también necesitan controles de dominio sobre el estado de la cola.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **React Hook Form con validaciones nativas (`register`, `rules`) — Elegida** | Mantiene reglas declarativas con pocos re-renderizados durante la captura, sin agregar una librería de esquemas adicional. | Las reglas condicionales deben manejarse con `watch` o `setValue`/`trigger` cuando el estado del medidor cambia. |
| React Hook Form + Zod | Esquemas tipados y mensajes reutilizables. | Agrega `zod` y `@hookform/resolvers` como dependencias; la lógica de consumo y anomalía es de dominio, no de esquema. |
| Validaciones manuales con `useState` | No agrega dependencias de formularios. | Aumenta el código manual y acopla validaciones, estado y presentación. |

## Decisión
Se decide implementar **React Hook Form** con sus validaciones nativas (`register` + objeto `rules`) para validar el formulario antes de guardar o avanzar entre pasos.

Funciones puras del dominio calculan el consumo y determinan si es anómalo. Los controles de React Hook Form validan el formato del código (R2), las reglas por estado (R5) y las condiciones resultantes de R6 y R7: confirmación del técnico y foto obligatoria.

El estado inaccesible deshabilita el campo de lectura para que no sea posible ingresarla; el estado dañado requiere descripción y admite lectura vacía. Si no existe una lectura anterior o un promedio conocido —por ejemplo, por trabajar offline sin ficha en caché— no se inventa el consumo ni se marca como verificada la anomalía: el registro queda pendiente de verificación.

La validación de unicidad por medidor y mes se realiza en la acción de dominio que guarda la lectura, no únicamente en las reglas del formulario. Las lecturas pendientes pueden editarse; las enviadas se presentan como solo lectura. La persistencia del borrador para R8 se resuelve en Zustand/AsyncStorage (ADR-002 y ADR-004).

## Consecuencias

* Las reglas condicionales se definen junto a cada control y se muestran con mensajes en español junto al campo correspondiente.
* Las reglas de dominio (duplicado por medidor/mes y estado enviado/no editable) se verifican también al cambiar el estado local, no solo al validar el formulario.
* React Hook Form no persiste el formulario ni garantiza por sí solo unicidad remota; la protección remota depende del sistema de oficina.
* Se utiliza `react-hook-form`, ya declarado en `package.json`. No se agregan `zod` ni `@hookform/resolvers`.

## Verificación

* Un código incompleto o distinto de `MED-` seguido de seis dígitos muestra error y no inicia una consulta.
* Normal requiere una lectura; inaccesible requiere motivo y deshabilita el campo de lectura; dañado requiere descripción y permite lectura vacía.
* El consumo lo calcula una función del dominio (lectura actual menos lectura anterior). Si supera tres veces el promedio, se muestra la advertencia y no se guarda hasta confirmar la revisión y adjuntar foto.
* Una foto es obligatoria para estado dañado y consumo anómalo, y opcional en los demás casos.
* Se rechaza una segunda lectura del mismo medidor en el mismo mes; una lectura pendiente puede editarse y una enviada no.
* El borrador y sus datos ingresados se restauran tras reiniciar la app conforme a R8, independientemente de la validación del formulario.

## Uso de IA
Consulté a la IA sobre cómo mantener las validaciones del formulario organizadas y reutilizables. Elegí React Hook Form porque permite definir reglas directamente en cada control y mostrar mensajes claros sin concentrar toda la lógica en los componentes. Aclaré que el cálculo del consumo y la detección de anomalías son responsabilidades del dominio, no de la librería de formularios, y que la recuperación del borrador y la unicidad son controles adicionales que se resuelven en otras capas.

