# ADR-003: Uso de TanStack Query para consultar los medidores

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R2 (no consultar códigos inválidos) y R3 (consultar la ficha del medidor y conservarla en caché para uso sin señal).

## Contexto
El técnico consulta los datos del medidor en el sistema simulado de la oficina. La conexión puede ser lenta o intermitente, por lo que la app necesita presentar estados claros de carga y error y reutilizar los datos consultados. El código debe validarse antes de enviar una petición.

TanStack Query mantiene una caché en memoria, pero esta por sí sola se pierde cuando se cierra el proceso. R3 requiere que el dato siga disponible después de perder conexión y al volver a consultar el mismo medidor, así que también se debe persistir la caché.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **TanStack Query con persistencia en AsyncStorage (Elegida)** | Gestiona consultas, estados de carga/error y caché por código; persiste los datos del medidor para uso offline. | Requiere configurar el persister y esperar a que el caché se restaure antes de habilitar la búsqueda. |
| `fetch` con caché manual | No agrega una biblioteca de consultas. | Obliga a implementar estados, deduplicación, expiración y persistencia de cada petición manualmente. |
| Guardar también los medidores en Zustand | Reutiliza el estado global del proyecto. | Duplica la fuente del caché remoto y mezcla los datos de consulta con el borrador y la cola local. |

## Decisión
Se elige **TanStack Query** para consultar el recurso `medidores`, usando el código validado y normalizado como parte de la clave de consulta, por ejemplo `['meter', 'MED-123456']`. Para persistir el QueryClient en AsyncStorage se usarán `@tanstack/react-query-persist-client` y `@tanstack/query-async-storage-persister`.

La app debe completar la restauración del QueryClient antes de habilitar las búsquedas. El caché persistido se limita a las consultas de medidores y usa una clave propia, una versión y un tiempo de vida definidos. Así se muestran los siete datos de la ficha y se pueden consultar de nuevo sin conexión. Si hay una ficha en caché, se presenta sin esperar una nueva respuesta; la pérdida de conexión no debe ocultarla ni convertirla en un error sin datos. Si no hay caché y no hay señal, se informa que la ficha no está disponible y se puede continuar con el registro offline pendiente de verificación, según R4.

La cola, el borrador y la sesión pertenecen al estado persistido de Zustand/AsyncStorage, según ADR-002 y ADR-004; no se guardan por duplicado en el caché de TanStack Query.

## Consecuencias

* TanStack Query administra las peticiones y la caché de medidores; no sustituye la cola de lecturas offline.
* AsyncStorage es el almacenamiento, pero la persistencia del QueryClient y la del store Zustand deben usar claves distintas.
* Para configurar la persistencia requerida por R3, deben agregarse `@tanstack/react-query-persist-client` y `@tanstack/query-async-storage-persister`; actualmente no constan en `package.json`.
* Un fallo de red no debe borrar una ficha válida del caché ni presentarse como una respuesta exitosa del servidor.

## Verificación

* Con un código que no cumple `MED-` seguido de seis dígitos, no se realiza ninguna petición.
* Una búsqueda válida muestra dirección, sector, número de cuenta, estado, última lectura, fecha y promedio mensual.
* Tras consultar una ficha con conexión, activar modo avión y volver a consultarla, se muestran los datos persistidos, incluso después de reiniciar la app.
* La búsqueda permanece bloqueada hasta completar la restauración del QueryClient; si ya hay una ficha cacheada y falla la red, la ficha se sigue mostrando.
* Los errores HTTP y de conexión se informan y no se convierten en resultados vacíos presentados como válidos.

## Uso de IA
Consulté a la IA sobre cómo gestionar las consultas a la API, sus estados de carga y error y el caché. Elegí **TanStack Query** porque centraliza ese comportamiento. También consideré el requisito de consultar sin conexión tras reiniciar; por eso el QueryClient persistirá su caché en AsyncStorage. La cola y el borrador se mantienen separados en Zustand.
