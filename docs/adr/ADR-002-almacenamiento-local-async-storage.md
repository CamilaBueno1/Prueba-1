# ADR-002: Usar AsyncStorage para el almacenamiento local y caché de datos

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R1 (persistencia de sesión del empleado), R3 (caché de medidores consultados para uso sin señal), R4 (lecturas pendientes en modo avión), R7 (conservación de fotos y registros locales), R8 (recuperación de borradores), R9 (cola de sincronización) y R10 (control local de duplicados y edición de pendientes).

## Contexto
Los técnicos de EPMAPS realizan levantamientos en zonas rurales de Quito (como Nono, Lloa o Calacalí) y en sótanos donde la señal celular es débil o nula. La aplicación necesita persistir la sesión del empleado (R1), el borrador del formulario multipantalla (R8) y la cola e historial de lecturas junto con la referencia local de sus fotos (R4, R7, R9 y R10). El volumen de datos de esta prueba es acotado y se maneja con información simulada; se busca una solución ligera de clave-valor que el equipo pueda explicar y mantener, sin añadir un motor relacional que no se ha trabajado en clase.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **AsyncStorage (`@react-native-async-storage/async-storage`)** | Es una solución asíncrona sencilla para almacenar objetos pequeños; evita configurar tablas y sentencias SQL y ya forma parte de las dependencias del proyecto. | Al ser clave-valor, no permite consultas estructuradas ni transacciones. La aplicación debe centralizar las escrituras y validar la unicidad en su lógica. |
| **SQLite (`expo-sqlite`)** | Permite organizar la información en tablas y realizar consultas transaccionales. | Añade un esquema, sentencias SQL y mantenimiento que no se justifican por el volumen acotado ni por los conocimientos requeridos para esta prueba. |
| **Archivos planos (`expo-file-system`)** | Permite guardar archivos JSON directamente en el almacenamiento interno. | Requiere gestionar manualmente lecturas, escrituras y concurrencia del archivo, y no aporta una ventaja suficiente frente a AsyncStorage para estos datos pequeños. |

## Decisión
Se decide utilizar **AsyncStorage** para el estado local de campo, con **Zustand y su middleware `persist`** para serializar los datos seleccionados bajo una clave propia y versionada. Se persiste el código del técnico, nunca su clave; el borrador activo; y la cola e historial de lecturas con estado, identificador estable y mes de registro. Las escrituras se centralizan en acciones para comprobar el estado actual y evitar modificaciones solapadas.

El caché de medidores pertenece a **TanStack Query** y se persiste por separado en AsyncStorage mediante sus adaptadores de persistencia, como se define en ADR-003. No se guarda una segunda copia de las fichas en el store Zustand. Las fotos se guardan como archivos en el directorio privado del dispositivo; el estado local conserva únicamente su URI, no la imagen codificada en Base64.

## Consecuencias
* Se persiste de manera sencilla la cantidad acotada de datos requerida por el flujo de campo.
* **Riesgos y desventajas:** AsyncStorage no ofrece transacciones ni restricciones únicas. La aplicación centraliza y serializa las mutaciones, y comprueba el duplicado de medidor/mes antes de guardar. La comprobación local cubre el uso de un técnico en un dispositivo; la prevención de duplicados remotos y reintentos necesita cooperación del servicio de oficina.
* Las claves de Zustand y del persister de TanStack Query deben ser distintas y versionadas. Al ser asíncrona la hidratación, las pantallas que dependen de sesión, borrador o consultas deben esperar a que finalice. Los errores de lectura o escritura se deben mostrar, no tratar como éxito.

## Verificación
* **Criterio para la implementación:** AsyncStorage debe estar registrado en `package.json`; el código debe conectar Zustand y el persister de TanStack Query usando claves distintas. La persistencia del persister aún requiere agregar las dependencias indicadas en ADR-003.
* Al cerrar y abrir la app, la sesión, el borrador y la cola se restauran; el caché de fichas se restaura desde el QueryClient persistido.
* En modo avión se puede guardar una lectura y, tras reiniciar la aplicación, siguen disponibles sus datos y la foto local.
* Una lectura del mismo medidor en el mismo mes se rechaza localmente tanto si la anterior está pendiente como si ya fue enviada.

## Uso de IA
Consulté a la IA sobre alternativas para persistir datos sin conexión, entre ellas SQLite y AsyncStorage. Elegí **AsyncStorage** porque el volumen de datos de esta prueba es acotado y su modelo clave-valor resulta suficiente para la sesión, el borrador y la cola local. Las fichas consultadas también se conservan en AsyncStorage, pero mediante el persister de TanStack Query y con una clave separada; no se duplican en Zustand. Para este alcance, SQLite añadiría el aprendizaje y mantenimiento de tablas y consultas SQL sin una necesidad que lo justifique.