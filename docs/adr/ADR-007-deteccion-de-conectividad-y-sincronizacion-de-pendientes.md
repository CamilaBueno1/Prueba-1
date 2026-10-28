# ADR-007: Detección de conectividad con Expo Network y sincronización de pendientes (R4 y R9)

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R4 (Sincronización de registros diferidos) y R9 (Indicador visual de conectividad y estado de red).

## Contexto
El técnico de EPMAPS opera en entornos dinámicos donde entera constantemente entre zonas rurales o subterráneas sin cobertura móvil y áreas urbanas con conexión estable. Para cumplir con R4 y R9, la aplicación debe conocer el estado de la red en tiempo real a nivel de sistema operativo para:
1. Actualizar inmediatamente la barra o banner superior de la interfaz (Indicador En Línea / Modo Offline).
2. Desencadenar el envío ordenado hacia la API simulada de los registros acumulados en la cola de Zustand/AsyncStorage cuando el dispositivo recupere la red.

Se requiere una estrategia de monitoreo reactiva que evite el consumo innecesario de batería o datos móviles por peticiones constantes y que utilice las librerías oficiales del ecosistema Expo.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **`expo-network` + Zustand (Elegida)** | Módulo oficial del ecosistema Expo que escucha y consulta el estado de red nativo. Se acopla de manera directa con Zustand para actualizar el estado global sin dependencias externas fuera de Expo. | Requiere controlar adecuadamente el ciclo de vida de la suscripción para evitar fugas de memoria. |
| **Consultas periódicas por temporizador (*Polling* con `setInterval`)** | Conceptualmente simple de implementar mediante peticiones HTTP repetitivas hacia el servidor. | Agota rápidamente la batería del celular, consume datos móviles y presenta retardos para detectar la recuperación de red. |

## Decisión
Se decide implementar **`expo-network`** mediante un hook suscriptor ubicado en la raíz de la aplicación. Este detector actualiza de manera reactiva el *store* de **Zustand**, reflejando el cambio en el banner visual superior (R9) e iniciando la sincronización secuencial de las lecturas y fotos pendientes guardadas en **AsyncStorage** (R4) tan pronto se confirme el acceso a internet.

## Consecuencias
*  Se integra de forma transparente en el ecosistema Managed Workflow de Expo sin requerir configuraciones nativas adicionales ni librerías de terceros.
* La red celular puede figurar como conectada a la antena pero carecer de tráfico real a internet, requiriendo un algoritmo de reintentos si la API no responde.
* Exige procesar las lecturas encoladas una por una para asegurar el orden cronológico de los datos e imágenes enviados.
* **Control requerido:** Es obligatorio desinstalar la suscripción al listener de red (`unsubscribe`) cuando el componente raíz se desmonte para evitar consumo residual de memoria RAM.

## Verificación
* La librería `expo-network` consta registrada en el archivo `package.json`.
* Al cambiar el dispositivo a modo avión, el banner superior cambia instantáneamente a "Modo Offline" (R9).
* Al desactivar el modo avión teniendo registros encolados, la aplicación detecta la red e inicia automáticamente la transmisión de las lecturas pendientes hacia la API.

## Uso de IA
Se evaluó el uso de peticiones por temporizador (*polling*) para verificar la red. Se eligió el monitor nativo `expo-network` por eficiencia de batería, respuesta inmediata y acoplamiento limpio con la cola de Zustand dentro del flujo de Expo.