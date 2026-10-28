# ADR-007: Detección de conectividad y sincronización de pendientes (R4 y R9)

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R4 (registro offline pendiente de verificar) y R9 (envío automático, sin duplicados y estado visible de conectividad y pendientes).

## Contexto
El técnico trabaja en lugares con conexión débil o inexistente, como las parroquias rurales de Nono, Lloa, Pacto, Nanegalito y Calacalí, y en sótanos o cámaras de medidor en la ciudad. La app debe permitir guardar lecturas localmente, marcarlas como pendientes de verificar hasta que, al enviarse, se comparan con la lectura anterior vigente en la oficina, y enviarlas automáticamente cuando vuelva la conectividad. En todas las pantallas se debe mostrar el estado de conexión y cuántas lecturas quedan por enviar.

La conectividad reportada por el dispositivo no garantiza que el servicio de oficina responda. Además, un corte de conexión después de que el servidor recibió una petición pero antes de que la app recibiera la respuesta deja incierto el resultado del envío. MockAPI con un `POST` convencional no ofrece por sí solo garantía de idempotencia ni unicidad.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **`expo-network` + cola persistida en Zustand/AsyncStorage — Elegida** | Escucha el estado de red del dispositivo y permite actualizar el indicador y activar intentos de sincronización sin consultas periódicas. Forma parte del conjunto oficial de Expo. | La señal del sistema no asegura acceso al servicio; se requieren reintentos y tratamiento de errores. |
| `@react-native-community/netinfo` | Equivalente funcional a `expo-network` para detectar conectividad. | Añade una dependencia fuera del conjunto oficial de Expo, sin ventaja adicional para este proyecto. |
| Consultas periódicas por temporizador (*polling*) | No requiere escuchar cambios del sistema operativo. | Genera solicitudes repetidas, consume batería y datos, y detecta la reconexión con demora. |

## Decisión
Se decide implementar **`expo-network`** para observar cambios de conectividad y actualizar el indicador global de R9. Al recuperar una red disponible, un sincronizador procesa las lecturas persistidas que aún no se han enviado. La cola usa estados explícitos: pendiente, enviando, error y enviada.

Toda lectura nace sin verificar. Si hay ficha en caché, el consumo se muestra de inmediato como referencia local, pero la lectura sigue pendiente de verificar hasta que, al enviarse, se compara con la lectura anterior de la oficina. Ante un fallo, el reintento usa espera creciente (5 s hasta un máximo de 60 s) y solo mientras haya pendientes; no hay consultas periódicas continuas. También se sincroniza al volver la app a primer plano y tras guardar una lectura.

Cada lectura conserva un identificador estable (`idLocal`, UUID v4 generado al iniciar el borrador) para relacionar los intentos. Antes de reintentar un envío de resultado incierto, la app consulta el recurso remoto por ese identificador (`GET /lecturas?idLocal=...`) y evita repetir un registro que ya exista. Sin embargo, una consulta seguida de un `POST` no es una operación atómica: con MockAPI no se puede prometer ausencia absoluta de duplicados ante peticiones simultáneas o una respuesta perdida. La garantía completa requiere que el servicio de oficina aplique idempotencia o una restricción única por `idLocal` y por medidor/mes.

Los errores se hacen visibles al técnico (`ultimoError`) y no se transforman en confirmaciones de éxito.

## Consecuencias

* El indicador de conexión y el contador de lecturas no enviadas se muestran en todas las pantallas y se derivan de estados locales observables.
* La suscripción de red se libera al desmontar el servicio o componente que la registra.
* Los intentos de sincronización deben tolerar fallos de red y reanudarse sin intervención manual, sin perder la lectura local.
* `idLocal` y la reconciliación remota reducen reenvíos duplicados, pero no sustituyen una garantía de idempotencia implementada por el servidor.
* La app no marca como enviada una lectura hasta que exista confirmación válida del servicio. La foto no se elimina (ADR-005). El último error de envío (`ultimoError`) se guarda y se muestra al técnico.

## Verificación

* El indicador cambia al activar o desactivar el modo avión y el contador muestra las lecturas no enviadas en todas las pantallas.
* En modo avión se puede guardar una lectura y queda marcada como pendiente de verificar hasta que se compara con la lectura anterior de la oficina.
* Al recuperar conectividad, los registros pendientes comienzan a sincronizarse automáticamente; si falla un envío, el registro permanece local y se reintenta sin indicar éxito.
* Si se pierde la respuesta de un envío, la app intenta reconciliar por `idLocal` antes de reenviar; la documentación reconoce la limitación de idempotencia de MockAPI.
* Las lecturas pendientes pueden corregirse; las confirmadas como enviadas no se editan.
* La app rechaza localmente una segunda lectura del mismo medidor en el mismo mes. La garantía remota requiere soporte del servicio.

## Uso de IA
Consulté a la IA sobre cómo detectar cambios de conectividad sin realizar solicitudes repetidas. Elegí `expo-network` porque escucha el estado de red del dispositivo, evita depender de un temporizador de *polling* y forma parte del conjunto oficial de Expo. También precisé que recuperar señal no equivale a recibir confirmación del servidor y que MockAPI no garantiza por sí solo idempotencia: la app debe conservar los registros ante errores y reconciliar los intentos mediante un identificador estable.
