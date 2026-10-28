# ADR-006: Validación de formularios con React Hook Form y esquemas Zod (R2, R5, R6, R7 y R10)

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R2 (validación del código del medidor), R5 (reglas según el estado del medidor), R6 y R7 (consumo anómalo, confirmación y foto condicional) y R10 (rechazo de duplicados y edición de lecturas pendientes).

## Contexto
El registro debe validar el código con el formato `MED-` seguido de seis dígitos antes de consultar el sistema de oficina. Además, los campos requeridos dependen del estado: normal exige lectura; inaccesible exige motivo y prohíbe registrar lectura; dañado exige descripción y admite lectura vacía. La anomalía se determina comparando la lectura actual con la anterior y el promedio mensual mediante funciones puras del dominio. Si el consumo supera tres veces el promedio, se exige confirmación del técnico y foto; un medidor dañado también requiere foto.

El formulario abarca varias pantallas y sus datos deben persistirse como borrador para cumplir R8; esa recuperación corresponde al almacenamiento local (ADR-002, ADR-004) y no a la librería de validación. Asimismo, validar campos no basta para evitar un segundo registro del mismo medidor en el mismo mes ni para impedir editar una lectura ya enviada: esas reglas también necesitan controles de dominio sobre el estado de la cola.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **React Hook Form + Zod (`@hookform/resolvers/zod`) — Elegida** | Permite expresar las tres variantes de R5 con `z.discriminatedUnion('estadoMedidor', ...)`, validar que la lectura no sea inferior a la anterior con `.refine(...)` y validar las condiciones de revisión de R6 y R7 en esquemas puros y probables sin abrir la interfaz. | Añade `zod` y `@hookform/resolvers` al proyecto, que deben mantenerse sincronizados con los tipos del dominio. |
| React Hook Form con validaciones manuales en cada control | No agrega librería de esquemas. | Dispersa las reglas condicionales entre componentes de vista y dificulta probar las tres ramas de R5 fuera de las pantallas. |
| Validaciones manuales con `useState` | No agrega dependencias de formularios. | Aumenta el código manual y acopla validaciones, estado y presentación. |

## Decisión
Se decide implementar **React Hook Form** integrado con **Zod** mediante `zodResolver` para validar los formularios antes de consultar, avanzar entre pasos o guardar:

1. **`esquemaCodigo` (R2):** Valida que el código recortado de espacios laterales cumpla `/^MED-\d{6}$/` antes de habilitar la consulta en TanStack Query.
2. **`crearEsquemaPaso1(referencia)` (R5):** Usa `z.discriminatedUnion('estadoMedidor', ...)` para aplicar las reglas exactas de cada estado (`normal` exige número válido; `inaccesible` exige motivo y rechaza cualquier lectura con `.max(0)`; `danado` exige descripción de daño y admite lectura vacía o numérica) y un `.refine` que impide registrar una lectura menor que la lectura anterior conocida.
3. **`esquemaRevision` (R6 y R7):** Valida las condiciones resultantes del cálculo puro del dominio (`anomalo` exige `revisionConfirmada === true`, y `fotoObligatoria` exige `fotoNombre != null`).

Funciones puras del dominio (`calcularConsumo`, `esAnomalo`, `fotoObligatoria`, `calcular`) calculan el consumo y determinan si es anómalo. Si no existe una lectura anterior o un promedio conocido —por ejemplo, por trabajar offline sin ficha en caché— no se inventa el consumo ni se marca como verificada la anomalía: el registro queda pendiente de verificación (R4).

La validación de unicidad por medidor y mes (R10) se realiza en la acción del store de lecturas (`agregar` y `corregir`), no únicamente en las reglas del formulario. Las lecturas pendientes pueden editarse; las enviadas se presentan como solo lectura.

## Consecuencias

* Los esquemas viven en `src/domain/esquemas.ts` con mensajes en español claros junto a cada control.
* Las reglas de dominio (duplicado por medidor/mes y estado enviado/no editable) se verifican en `useLecturasStore` al guardar o corregir.
* Se utilizan `react-hook-form`, `zod` y `@hookform/resolvers`, declarados en `package.json`.

## Verificación

* Un código incompleto o distinto de `MED-` seguido de seis dígitos muestra error y no inicia una consulta.
* Normal requiere una lectura; inaccesible requiere motivo y rechaza lectura; dañado requiere descripción y permite lectura vacía.
* El consumo lo calcula una función pura del dominio. Si supera tres veces el promedio, se muestra la advertencia y `esquemaRevision` impide guardar hasta confirmar la revisión y adjuntar foto.
* Una foto es obligatoria para estado dañado y consumo anómalo, y opcional en los demás casos.
* Se rechaza una segunda lectura del mismo medidor en el mismo mes; una lectura pendiente puede editarse y una enviada no.
* El borrador y sus datos ingresados se restauran tras reiniciar la app conforme a R8.

## Uso de IA
Consulté a la IA sobre cómo organizar las reglas condicionales de los tres estados del medidor (R5) sin llenar las pantallas de condicionales. Elegí combinar **React Hook Form** con **Zod** (`discriminatedUnion`) porque concentra las reglas de R2, R5, R6 y R7 en `src/domain/esquemas.ts` y permite probarlas como funciones puras, manteniendo el cálculo de consumo en `src/domain/reglas.ts` y la unicidad por mes en el store de lecturas.
