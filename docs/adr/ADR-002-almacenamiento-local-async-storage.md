# ADR-002: Usar AsyncStorage para el almacenamiento local y caché de datos

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R1 (Persistencia de sesión del empleado), R3 (Caché de medidores consultados para uso sin señal), R4 (Lecturas pendientes en modo avión), R7 (Conservación de fotos y registros locales) y R8 (Recuperación de borradores ante cierres imprevistos).

## Contexto
Los técnicos de EPMAPS realizan levantamientos en zonas rurales de Quito (como Nono, Lloa o Calacalí) y en sótanos donde la señal celular es débil o nula. Para cumplir con los requisitos, la aplicación necesita guardar de forma local información clave: la sesión activa del empleado (R1), la caché de los medidores consultados con sus datos para no requerir internet en una segunda visita (R3), el borrador del formulario multi-pantalla por si la app se cierra a mitad de un registro (R8), y la cola de lecturas pendientes junto con sus fotos (R4, R7). Dado que el volumen de datos del aplicativo es acotado y se maneja con información simulada/quemada para el alcance de la prueba, se requiere una solución ligera, rápida y directa que permita persistir esta información en formato clave-valor sin incurrir en sobreingeniería ni en la complejidad innecesaria de un motor de base de datos relacional.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **AsyncStorage (`@react-native-async-storage/async-storage`)** | Es una solución nativa asíncrona muy sencilla y directa para almacenar objetos eNo requiere configuración nativa ni compilaciones binarias complejas en Expo SDK 57, garantizando compatibilidad total inmediata con Expo Go y compilaciones de APK, acelera el tiempo de desarrollo, evita recargar el código con sentencias SQL complejas y se integra de inmediato. | Al ser un almacenamiento plano de tipo clave-valor, no permite hacer consultas estructuradas avanzadas (como `JOINs`). Si la lista de datos creciera a escala industrial, requeriría lógica manual en JavaScript para filtrar o actualizar bloques completos. |
| **SQLite (`expo-sqlite`)** | Permite organizar la información en tablas relacionales y realizar consultas estructuradas. | Introduce una capa de complejidad innecesaria (sobreingeniería) para el volumen de datos y el alcance actual de la aplicación, obligando a configurar tablas y sentencias SQL incrementando una complejidad innecesaria. |
| **Archivos planos (`expo-file-system`)** | Permite guardar archivos JSON directamente en el almacenamiento interno. | Requiere gestionar manualmente la lectura y escritura de archivos del sistema, lo que resulta más propenso a errores y código repetitivo. |

## Decisión
Se decide utilizar **AsyncStorage**, porque para el alcance actual del aplicativo (que maneja un volumen de datos acotado y controlado). Su modelo clave-valor cubre el 100% de los requerimientos del proyecto mediante claves estructuradas:
- `@auth_session`: credenciales y datos del técnico logueado.
- `@medidores_cache`: diccionario de medidores consultados indexados por su código (`MED-XXXXXX`).
- `@pending_readings`: cola de lecturas pendientes de verificación y envío.
- `@sent_readings`: registro histórico de lecturas enviadas para control de duplicidad en el mes.
- `@draft_reading`: estado y paso actual del formulario en progreso para recuperación de R8.

## Consecuencias
* Se logra implementar la persistencia de forma ágil y eficiente utilizando una librería conocida y compatibilidad comprobada.
* **Riesgos y desventajas:** Dado que todas las operaciones son asíncronas (`Promise<T>`), cualquier lectura de almacenamiento debe controlarse con estados de carga (`loading`) para evitar condiciones de carrera donde la interfaz intente acceder a datos antes de que se completen las lecturas del disco.
* Exige estructurar correctamente las llaves (*keys*) de almacenamiento (por ejemplo, separando la sesión, la caché y los borradores) para evitar colisiones de datos, ademas de que deben serializarse/deserializarse mediante `JSON.stringify` y `JSON.parse` con manejo de errores `try/catch`.

## Verificación
* En el archivo `package.json` se encuentra registrada la dependencia de AsyncStorage.
* En el código fuente existen servicios o funciones dedicadas a guardar y recuperar la sesión, los medidores y las lecturas usando `getItem` y `setItem`.
* En el dispositivo o emulador, al activar el modo avión, registrar una lectura, cerrar la app y volver a abrirla, los datos persisten correctamente sin perderse.

## Uso de IA
Se evaluaron diferentes alternativas de persistencia offline (como SQLite y AsyncStorage). **Se eligió AsyncStorage** descartando SQLite porque, dado que el aplicativo es pequeño y contiene datos acotados, utilizar un motor de base de datos relacional habría representado una sobreingeniería innecesaria, recargando el código con sentencias SQL que no se justifican para este nivel de datos.