# ADR-007: Detección de conectividad y sincronización de pendientes (R4 y R9)

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R4 (registro offline pendiente de verificar) y R9 (envío automático, sin duplicados y estado visible de conectividad y pendientes).

## Contexto
El técnico trabaja en lugares con conexión débil o inexistente. La app debe permitir guardar lecturas localmente, marcarlas como pendientes de verificación cuando no se pudo comparar la lectura anterior, y enviarlas automáticamente cuando vuelva la conectividad. En todas las pantallas se debe mostrar el estado de conexión y cuántas lecturas quedan por enviar.

La conectividad reportada por el dispositivo no garantiza que el servicio de oficina responda. Además, un corte de conexión después de que el servidor recibió una petición pero antes de que la app recibiera la respuesta deja incierto el resultado del envío. MockAPI con un `POST` convencional no ofrece por sí solo una garantía atómica de idempotencia ni unicidad.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **`expo-network` + cola persistida en Zustand/AsyncStorage (Elegida)** | Escucha el estado de red del dispositivo y permite actualizar el indicador y activar intentos de sincronización sin consultas periódicas. | La señal del sistema no asegura acceso al servicio; se requieren reintentos y tratamiento de errores. |
| Consultas periódicas por temporizador (*polling*) | No requiere escuchar cambios del sistema operativo. | Genera solicitudes repetidas, consume batería/datos y detecta la reconexión con demora. |

## Decisión
Se decide implementar **`expo-network`** para observar cambios de conectividad y actualizar el indicador global de R9. Al recuperar una red disponible, un sincronizador procesa las lecturas persistidas que aún no se han enviado. La cola usa estados explícitos como pendiente, enviando y enviada; ante un error o resultado incierto, el elemento no se marca como enviado y se reintenta cuando sea apropiado. Los errores se hacen visibles al técnico y no se transforman en confirmaciones de éxito.

Cada lectura conserva un identificador estable (`clientId`) para relacionar los intentos. Antes de reintentar un envío de resultado incierto, la app puede consultar el recurso remoto por ese identificador y evitar repetir un registro que ya exista. Sin embargo, una consulta seguida de un `POST` no es una operación atómica: con MockAPI no se puede prometer ausencia absoluta de duplicados ante peticiones simultáneas o una respuesta perdida. La garantía completa requiere que el servicio de oficina aplique idempotencia o una restricción única por `clientId` y por medidor/mes.

Las lecturas se comparan con la lectura anterior cuando se recupera la información necesaria; hasta entonces permanecen pendientes de verificación. Si no hay datos previos disponibles, la app no inventa la comparación. La URI local de una foto se conserva en el dispositivo y no se envía como si fuera una URL pública: hacer accesible la imagen desde la oficina requiere un servicio de almacenamiento de archivos, una integración opcional separada.

## Consecuencias

* El indicador de conexión y el contador de lecturas no enviadas se muestran en todas las pantallas y se derivan de estados locales observables.
* La suscripción de red se libera al desmontar el servicio o componente que la registra.
* Los intentos de sincronización deben tolerar fallos de red y reanudarse sin intervención manual, sin perder la lectura local.
* `clientId` y la reconciliación remota reducen reenvíos duplicados, pero no sustituyen una garantía de idempotencia implementada por el servidor.
* La app no elimina ni marca como enviada una lectura o foto hasta que exista confirmación válida del servicio.

## Verificación

* El indicador cambia al activar o desactivar el modo avión y el contador muestra las lecturas no enviadas en todas las pantallas.
* En modo avión se puede guardar una lectura y queda marcada como pendiente de verificación cuando no se dispone de la lectura anterior.
* Al recuperar conectividad, los registros pendientes comienzan a sincronizarse automáticamente; si falla un envío, el registro permanece local y se reintenta sin indicar éxito.
* Si se pierde la respuesta de un envío, la app intenta reconciliar por `clientId` antes de reenviar; la documentación reconoce la limitación de idempotencia de MockAPI.
* Las lecturas pendientes pueden corregirse; las confirmadas como enviadas no se editan.
* La app rechaza localmente una segunda lectura del mismo medidor en el mismo mes. La garantía remota requiere soporte del servicio.

## Uso de IA
Consulté a la IA sobre cómo detectar cambios de conectividad sin realizar solicitudes repetidas. Elegí `expo-network` porque escucha el estado de red del dispositivo y evita depender de un temporizador de *polling*. También precisé que recuperar señal no equivale a recibir confirmación del servidor y que MockAPI no garantiza por sí solo idempotencia: la app debe conservar los registros ante errores y reconciliar los intentos mediante un identificador estable.
