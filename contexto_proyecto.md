# Contexto Completo del Proyecto CV-CREATOR-APP


================================================
ðŸ“„ ARCHIVO: .claude\settings.json
================================================

{
  "enabledPlugins": {
    "expo@claude-plugins-official": true
  }
}


================================================
ðŸ“„ ARCHIVO: .env
================================================



================================================
ðŸ“„ ARCHIVO: .env.example
================================================



================================================
ðŸ“„ ARCHIVO: .gitignore
================================================

# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files
.env
# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

example

# generated native folders
/ios
/android


================================================
ðŸ“„ ARCHIVO: AGENTS.md
================================================

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md


================================================
ðŸ“„ ARCHIVO: app.json
================================================

{
  "expo": {
    "name": "Prueba",
    "slug": "Prueba",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "prueba",
    "userInterfaceStyle": "automatic",
    "ios": {
      "icon": "./assets/expo.icon"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#208AEF",
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 76
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
}


================================================
ðŸ“„ ARCHIVO: docs\adr\ADR-001-Implementación de Expo Router.md
================================================

# ADR-001: Usar Expo Router para la navegación y continuidad del flujo

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R1 (Autenticación y persistencia de sesión del técnico), R8 (Estructura multi-pantalla y recuperación de registros interrumpidos) y R9 (Visibilidad transversal del estado de conectividad en toda la jerarquía de vistas).

## Contexto
La aplicación tiene una pantalla de inicio de sesión, una pantalla principal de búsqueda y listado, y un registro de medidores de agua dividido en varios pasos secuenciales. El técnico necesita poder volver atrás entre los pasos sin perder los datos que ya ingresó. Además, según el requisito R8, si la aplicación se cierra inesperadamente a mitad de un registro, al abrirla de nuevo debe ofrecer la posibilidad de llevar al técnico directamente al paso en el que se quedó, sin tener que recorrer las pantallas anteriores. Asimismo, componentes globales como el banner de red del requisito R9 deben mantenerse visibles mientras se transita entre vistas. El proyecto se crea con la plantilla por defecto de Expo SDK 57.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Expo Router (File-based routing)** | Viene incluido de forma nativa en la plantilla de Expo SDK 57, por lo que no agrega dependencias externas. Cada pantalla es un archivo dentro de la carpeta `app`, haciendo visible la estructura de navegación. Su soporte de layouts anidados (`_layout.tsx`) permite mantener el banner global de conectividad (R9) y navegar de forma directa al paso pendiente (R8). | Obliga a seguir una estructura de directorios estricta; cualquier archivo dentro de `app` se convierte en una ruta. Actúa como una capa sobre React Navigation que hay que conocer cuando surge un fallo de enrutamiento. |
| **React Navigation configurado manualmente** | Control total sobre la configuración de cada navegador de forma imperativa. Es la librería base sobre la que se construye Expo Router, con una documentación muy extensa. | Hay que instalarla y configurarla a mano, lo que añade dependencias y código repetitivo (*boilerplate*) que la plantilla de Expo ya resuelve por defecto. Las rutas se declaran en código y no se visualizan directamente en el explorador de archivos. |
| **Renderizado condicional en pantalla única (Monolítico)** | No requiere ninguna librería de navegación adicional para gestionar el flujo de registro de los pasos. | El botón "Atrás" físico o gestual de Android no maneja el historial de pasos por sí solo sin código manual complejo. La pantalla principal crece desmedidamente hasta mezclar toda la lógica en un solo componente, haciendo imposible reanudar el proceso tras un cierre (R8). |

## Decisión
Se decide implementar **Expo Router**, porque ya forma parte de la infraestructura del proyecto generado con Expo SDK 57 y su sistema de enrutamiento basado en archivos (junto con los layouts anidados) permite mantener la visibilidad global de la red (R9) y dirigir al técnico al paso pendiente con una sola instrucción directa (R8).

## Consecuencias
* No se agrega ninguna dependencia adicional en el `package.json` para la navegación.
* Los componentes visuales que no son pantallas o layouts deben guardarse estrictamente fuera de la carpeta `app` (por ejemplo, en carpetas como `components`, `services` o `store`), para que Expo Router no intente convertirlos en rutas de acceso.
* La navegación por sí misma no conserva los datos ingresados; Expo Router decide a qué pantalla se dirige la vista, pero la información del formulario debe almacenarse en otra capa.
* **Obligación técnica / Riesgo:** Si se navega a una sub-ruta del formulario antes de terminar de cargar los datos guardados en el almacenamiento local, la pantalla aparecerá vacía. La redirección al paso pendiente debe ejecutarse únicamente después de hidratar los datos persistidos.

## Verificación
* La carpeta `app` del repositorio contiene exclusivamente archivos de rutas, layouts estructurales y pantallas.
* En el teléfono o emulador con Android, el botón atrás del sistema retrocede de un paso al anterior dentro del flujo de registro.
* En el archivo `package.json` no existen paquetes de React Navigation instalados manualmente de forma adicional a los que trae la plantilla base.

## Uso de IA
Le pregunté a la IA qué opción convenía más para organizar la navegación entre pantallas y mantener el diseño limpio. Me sugirió usar Expo Router porque ya viene listo con Expo, lo cual me pareció perfecto. Sin embargo, lo descarté por completo la idea de guardar el estado de los pasos mandándolo por los parámetros de la URL, porque si la app se cierra por completo, esos datos se borran y no cumpliría con lo que pide el requisito R8. Prefiero usar la ruta solo para cambiar de pantalla y guardar los datos en otro lado de forma segura.

================================================
ðŸ“„ ARCHIVO: docs\adr\ADR-002-almacenamiento-local-async-storage.md
================================================

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

================================================
ðŸ“„ ARCHIVO: docs\adr\ADR-003-Uso de TanStack Query.md
================================================

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

================================================
ðŸ“„ ARCHIVO: docs\adr\ADR-004-Gestiónde-estadoglobalconZustand.md
================================================

# ADR-004: Gestión de estado global con Zustand para borrador (R8) e indicador de pendientes (R9)

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R1 (Persistencia de sesión), R8 (Recuperación transparente de borradores) y R9 (Indicador visual de pendientes).

## Contexto
El aplicativo requiere actualizar en tiempo real el contador de lecturas pendientes en el encabezado global mientras el técnico trabaja sin conexión (R9), conservar la sesión activa (R1) y recuperar automáticamente el borrador si la aplicación se cierra inesperadamente a mitad del registro (R8).

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
* Introduce la librería `zustand` en el archivo `package.json`, aunque con un impacto mínimo en el tamaño final del paquete.
* **Separación de responsabilidades:** Exige mantener delimitado el estado de la interfaz en Zustand respecto al estado del servidor gestionado por TanStack Query.

## Verificación
* En el archivo `package.json` está presente la dependencia `zustand`.
* El encabezado principal utiliza un selector de Zustand para renderizar el número de pendientes sin afectar a las vistas hijas.
* Al ingresar datos en un formulario, cerrar forzosamente la aplicación y reabrirla, Zustand recupera el borrador intacto desde `AsyncStorage`.

## Uso de IA
Se evaluaron Context API y Redux Toolkit para el manejo del estado global. Se eligió Zustand por su ligereza, por evitar re-renderizados innecesarios mediante selectores y por su integración nativa con `AsyncStorage`, resolviendo R1, R8 y R9 de forma directa.

================================================
ðŸ“„ ARCHIVO: docs\adr\ADR-005-captura-de-evidencias-fotograficas-y-gestion-de-archivos.md
================================================

# ADR-005: Captura de evidencias fotográficas y gestión del sistema de archivos local (R4 y R7)

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R4 (Registro de lecturas con foto en modo avión) y R7 (Conservación de fotos en el almacenamiento local).

## Contexto
Los técnicos de EPMAPS deben registrar una fotografía como evidencia visual al tomar la lectura de cada medidor. Dado que las visitas se realizan en zonas rurales o subterráneas sin señal de red, la aplicación debe permitir capturar la imagen con la cámara del dispositivo, almacenarla en el sistema de archivos local de forma segura y asociar su referencia (`URI`) al formulario de lectura para su posterior envío.

Se requiere una solución nativa y ligera que evite guardar binarios de imágenes pesados dentro de bases de datos locales, aprovechando las APIs oficiales de Expo para la gestión de medios y archivos.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **`expo-image-picker` / `expo-camera`** + Sistema de archivos de Expo (`expo-file-system`) (Elegida) | Captura la fotografía utilizando la cámara nativa del sistema operativo y guarda el archivo binario en el directorio de la aplicación, asociando únicamente la ruta local (`URI`) a la cola de Zustand. | Las imágenes almacenadas ocupan espacio en la memoria interna del teléfono hasta que sean sincronizadas y depuradas. |
| Almacenamiento de imágenes en formato Base64 en AsyncStorage*| Permite guardar la imagen codificada directamente dentro de la base de datos de texto clave-valor. | Degrada severamente el rendimiento de AsyncStorage y la memoria RAM del teléfono al procesar cadenas de texto extremadamente largas. |

## Decisión
Se decide implementar **`expo-image-picker` (o `expo-camera`)** para la toma de fotografías y el modulo **`expo-file-system`** para administrar el almacenamiento local de las imágenes. La aplicación guarda la imagen capturada en el directorio interno del teléfono y transfiere únicamente la ruta de archivo (`URI`) hacia la lectura encolada en Zustand.

## Consecuencias
*  Mantiene las lecturas ligeras en AsyncStorage al almacenar únicamente rutas de texto (`URI`) en lugar del archivo binario completo.
*  Permite al técnico tomar fotografías con la cámara del teléfono sin importar la presencia o ausencia de cobertura móvil (R4, R7).
*Exige solicitar y validar los permisos de acceso a la cámara y al almacenamiento del dispositivo antes de desplegar la interfaz de captura.

* **Control requerido:** Es obligatorio ejecutar una función de limpieza para eliminar los archivos de imagen temporales del disco una vez que el servidor confirme la recepción de la lectura encolada.

## Verificación
* Las librerías `expo-image-picker` y `expo-file-system` figuran registradas en el archivo `package.json`.
* Al tomar una fotografía en modo avión, la app genera una ruta local válida (ej. `file://.../Image.jpg`) y la asigna a la estructura del formulario.
* La imagen capturada es accesible y visible en la vista previa del formulario incluso tras cerrar y reabrir la aplicación fuera de línea.

## Uso de IA
Se evaluó guardar la imagen codificada en formato Base64 dentro de AsyncStorage. Se eligió el sistema de archivos de Expo con rutas de URI locales por eficiencia de memoria, rapidez al renderizar la vista previa y prevención de cuelgues en el dispositivo.

================================================
ðŸ“„ ARCHIVO: docs\adr\ADR-006-validacion-de-formularios-con-react-hook-form-y-zod.md
================================================

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

================================================
ðŸ“„ ARCHIVO: docs\adr\ADR-007-deteccion-de-conectividad-y-sincronizacion-de-pendientes.md
================================================

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

================================================
ðŸ“„ ARCHIVO: expo-env.d.ts
================================================

/// <reference types="expo/types" />

// NOTE: This file should not be edited and should be in your git ignore

================================================
ðŸ“„ ARCHIVO: export_content.js
================================================

const fs = require('fs');
const path = require('path');

// Nombre del archivo final que contendrÃ¡ todo tu cÃ³digo
const OUTPUT_FILE = 'contexto_proyecto.md';
const ROOT_DIR = __dirname;

// Carpetas que ignoramos porque son pesadas o no contienen cÃ³digo fuente Ãºtil
const IGNORE_DIRS = ['node_modules', '.expo', '.vscode', '.opencode', '.git', 'assets', '__tests__', '.tamagui'];

// Archivos especÃ­ficos que no queremos incluir
const IGNORE_FILES = ['package-lock.json', 'yarn.lock', OUTPUT_FILE, 'export_context.js'];

// Extensiones permitidas
const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md'];

function buildContext(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(item)) {
                buildContext(itemPath);
            }
        } else {
            const ext = path.extname(item);
            const isAllowedExtension = ALLOWED_EXTENSIONS.includes(ext);
            
            // Permitimos archivos de configuraciÃ³n que empiezan con punto (ej. .gitignore, eslint.config.js)
            const isConfigFile = item.startsWith('.') || item.includes('config'); 

            if (!IGNORE_FILES.includes(item) && (isAllowedExtension || isConfigFile)) {
                try {
                    const content = fs.readFileSync(itemPath, 'utf8');
                    const relativePath = path.relative(ROOT_DIR, itemPath);
                    
                    // Separador visual claro para que la IA distinga entre archivos
                    const separator = `\n\n================================================\n`;
                    const fileHeader = `ðŸ“„ ARCHIVO: ${relativePath}\n================================================\n\n`;
                    
                    fs.appendFileSync(path.join(ROOT_DIR, OUTPUT_FILE), separator + fileHeader + content);
                } catch (error) {
                    console.error(`Error leyendo ${itemPath}:`, error.message);
                }
            }
        }
    }
}

// 1. Inicializar/Limpiar el archivo de salida
fs.writeFileSync(path.join(ROOT_DIR, OUTPUT_FILE), '# Contexto Completo del Proyecto CV-CREATOR-APP\n');
console.log('â³ Recopilando cÃ³digo...');

// 2. Ejecutar la lectura
buildContext(ROOT_DIR);

console.log(`âœ… Â¡Listo! Todo tu cÃ³digo se ha consolidado en el archivo: ${OUTPUT_FILE}`);

================================================
ðŸ“„ ARCHIVO: package.json
================================================

{
  "name": "prueba",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "dependencies": {
    "@expo/ui": "~57.0.26",
    "@hookform/resolvers": "^6.0.1",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@tanstack/react-query": "^5.105.0",
    "expo": "~57.0.31",
    "expo-constants": "~57.0.22",
    "expo-device": "~57.0.2",
    "expo-file-system": "~57.0.7",
    "expo-font": "~57.0.4",
    "expo-glass-effect": "~57.0.4",
    "expo-image": "~57.0.5",
    "expo-image-picker": "~57.0.20",
    "expo-linking": "~57.0.13",
    "expo-network": "~57.0.3",
    "expo-router": "~57.0.29",
    "expo-splash-screen": "~57.0.10",
    "expo-status-bar": "~57.0.1",
    "expo-symbols": "~57.0.3",
    "expo-system-ui": "~57.0.4",
    "expo-web-browser": "~57.0.3",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.91.0",
    "react-native": "0.86.3",
    "react-native-gesture-handler": "~2.32.0",
    "react-native-reanimated": "4.5.1",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.10.1",
    "zod": "^4.6.7",
    "zustand": "^5.0.16"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "typescript": "~6.0.3"
  },
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "private": true
}


================================================
ðŸ“„ ARCHIVO: README.md
================================================

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
#   P r u e b a - 1  
 

================================================
ðŸ“„ ARCHIVO: scripts\reset-project.js
================================================

#!/usr/bin/env node

/**
 * This script is used to reset the project to a blank state.
 * It deletes or moves the /src and /scripts directories to /example based on user input and creates a new /src/app directory with an index.tsx and _layout.tsx file.
 * You can remove the `reset-project` script from package.json and safely delete this file after running it.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const oldDirs = ["src", "scripts"];
const exampleDir = "example";
const newAppDir = "src/app";
const exampleDirPath = path.join(root, exampleDir);

const indexContent = `import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const moveDirectories = async (userInput) => {
  try {
    if (userInput === "y") {
      // Create the app-example directory
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`📁 /${exampleDir} directory created.`);
    }

    // Move old directories to new app-example directory or delete them
    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);
      if (fs.existsSync(oldDirPath)) {
        if (userInput === "y") {
          const newDirPath = path.join(root, exampleDir, dir);
          await fs.promises.rename(oldDirPath, newDirPath);
          console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
        } else {
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          console.log(`❌ /${dir} deleted.`);
        }
      } else {
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

    // Create new /src/app directory
    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log("\n📁 New /src/app directory created.");

    // Create index.tsx
    const indexPath = path.join(newAppDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("📄 src/app/index.tsx created.");

    // Create _layout.tsx
    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("📄 src/app/_layout.tsx created.");

    console.log("\n✅ Project reset complete. Next steps:");
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit src/app/index.tsx to edit the main screen.\n3. Put all your application code in /src, only screens and layout files should be in /src/app.${
        userInput === "y"
          ? `\n4. Delete the /${exampleDir} directory when you're done referencing it.`
          : ""
      }`
    );
  } catch (error) {
    console.error(`❌ Error during script execution: ${error.message}`);
  }
};

rl.question(
  "Do you want to move existing files to /example instead of deleting them? (Y/n): ",
  (answer) => {
    const userInput = answer.trim().toLowerCase() || "y";
    if (userInput === "y" || userInput === "n") {
      moveDirectories(userInput).finally(() => rl.close());
    } else {
      console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
      rl.close();
    }
  }
);


================================================
ðŸ“„ ARCHIVO: src\app\explore.tsx
================================================

import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Explore</ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            This starter app includes example{'\n'}code to help you get started.
          </ThemedText>

          <ExternalLink href="https://docs.expo.dev" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.linkButton}>
                <ThemedText type="link">Expo documentation</ThemedText>
                <SymbolView
                  tintColor={theme.text}
                  name={{ ios: 'arrow.up.right.square', android: 'link', web: 'link' }}
                  size={12}
                />
              </ThemedView>
            </Pressable>
          </ExternalLink>
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          <Collapsible title="File-based routing">
            <ThemedText type="small">
              This app has two screens: <ThemedText type="code">src/app/index.tsx</ThemedText> and{' '}
              <ThemedText type="code">src/app/explore.tsx</ThemedText>
            </ThemedText>
            <ThemedText type="small">
              The layout file in <ThemedText type="code">src/app/_layout.tsx</ThemedText> sets up
              the tab navigator.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Android, iOS, and web support">
            <ThemedView type="backgroundElement" style={styles.collapsibleContent}>
              <ThemedText type="small">
                You can open this project on Android, iOS, and the web. To open the web version,
                press <ThemedText type="smallBold">w</ThemedText> in the terminal running this
                project.
              </ThemedText>
              <Image
                source={require('@/assets/images/tutorial-web.png')}
                style={styles.imageTutorial}
              />
            </ThemedView>
          </Collapsible>

          <Collapsible title="Images">
            <ThemedText type="small">
              For static images, you can use the <ThemedText type="code">@2x</ThemedText> and{' '}
              <ThemedText type="code">@3x</ThemedText> suffixes to provide files for different
              screen densities.
            </ThemedText>
            <Image source={require('@/assets/images/react-logo.png')} style={styles.imageReact} />
            <ExternalLink href="https://reactnative.dev/docs/images">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Light and dark mode components">
            <ThemedText type="small">
              This template has light and dark mode support. The{' '}
              <ThemedText type="code">useColorScheme()</ThemedText> hook lets you inspect what the
              user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Animations">
            <ThemedText type="small">
              This template includes an example of an animated component. The{' '}
              <ThemedText type="code">src/components/ui/collapsible.tsx</ThemedText> component uses
              the powerful <ThemedText type="code">react-native-reanimated</ThemedText> library to
              animate opening this hint.
            </ThemedText>
          </Collapsible>
        </ThemedView>
        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: 'center',
  },
  imageTutorial: {
    width: '100%',
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
});


================================================
ðŸ“„ ARCHIVO: src\app\index.tsx
================================================

import * as Device from 'expo-device';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Welcome to&nbsp;Expo
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          get started
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Try editing"
            hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
          />
          <HintRow title="Dev tools" hint={getDevMenuHint()} />
          <HintRow
            title="Fresh start"
            hint={<ThemedText type="code">npm run reset-project</ThemedText>}
          />
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});


================================================
ðŸ“„ ARCHIVO: src\app\_layout.tsx
================================================

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\animated-icon.tsx
================================================

import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1 }],
      easing: Easing.elastic(0.7),
    },
  });

  const image = <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />;

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      {image}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}>
      {image}
    </View>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 76,
    height: 71,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\animated-icon.web.tsx
================================================

import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated, { Keyframe, Easing } from 'react-native-reanimated';

import classes from './animated-icon.module.css';
const DURATION = 300;

export function AnimatedSplashOverlay() {
  return null;
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: 0 }],
  },
  60: {
    transform: [{ scale: 1.2 }],
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(1.2),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
  },
  60: {
    transform: [{ scale: 1.2 }],
    opacity: 0,
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(1.2),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '-180deg' }, { scale: 0.8 }],
    opacity: 0,
  },
  [DURATION / 1000]: {
    transform: [{ rotateZ: '0deg' }, { scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(0.7),
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View style={styles.background} entering={keyframe.duration(DURATION)}>
        <div className={classes.expoLogoBackground} />
      </Animated.View>

      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    zIndex: 1000,
    position: 'absolute',
    top: 128 / 2 + 138,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
  },
  image: {
    position: 'absolute',
    width: 76,
    height: 71,
  },
  background: {
    width: 128,
    height: 128,
    position: 'absolute',
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\app-tabs.tsx
================================================

import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\app-tabs.web.tsx
================================================

import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

import { ExternalLink } from './external-link';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Explore</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          Expo Starter
        </ThemedText>

        {props.children}

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={styles.externalPressable}>
            <ThemedText type="link">Docs</ThemedText>
            <SymbolView
              tintColor={colors.text}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\external-link.tsx
================================================

import { Href, Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (process.env.EXPO_OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}


================================================
ðŸ“„ ARCHIVO: src\components\hint-row.tsx
================================================

import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

type HintRowProps = {
  title?: string;
  hint?: ReactNode;
};

export function HintRow({ title = 'Try editing', hint = 'app/index.tsx' }: HintRowProps) {
  return (
    <View style={styles.stepRow}>
      <ThemedText type="small">{title}</ThemedText>
      <ThemedView type="backgroundSelected" style={styles.codeSnippet}>
        <ThemedText themeColor="textSecondary">{hint}</ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeSnippet: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\themed-text.tsx
================================================

import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\themed-view.tsx
================================================

import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return <View style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps} />;
}


================================================
ðŸ“„ ARCHIVO: src\components\ui\collapsible.tsx
================================================

import { SymbolView } from 'expo-symbols';
import { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <ThemedView>
      <Pressable
        style={({ pressed }) => [styles.heading, pressed && styles.pressedHeading]}
        onPress={() => setIsOpen((value) => !value)}>
        <ThemedView type="backgroundElement" style={styles.button}>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={14}
            weight="bold"
            tintColor={theme.text}
            style={{ transform: [{ rotate: isOpen ? '-90deg' : '90deg' }] }}
          />
        </ThemedView>

        <ThemedText type="small">{title}</ThemedText>
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <ThemedView type="backgroundElement" style={styles.content}>
            {children}
          </ThemedView>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pressedHeading: {
    opacity: 0.7,
  },
  button: {
    width: Spacing.four,
    height: Spacing.four,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: Spacing.three,
    borderRadius: Spacing.three,
    marginLeft: Spacing.four,
    padding: Spacing.four,
  },
});


================================================
ðŸ“„ ARCHIVO: src\components\web-badge.tsx
================================================

import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import { useColorScheme, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="code" themeColor="textSecondary" style={styles.versionText}>
        v{version}
      </ThemedText>
      <Image
        source={
          scheme === 'dark'
            ? require('@/assets/images/expo-badge-white.png')
            : require('@/assets/images/expo-badge.png')
        }
        style={styles.badgeImage}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
  },
  versionText: {
    textAlign: 'center',
  },
  badgeImage: {
    width: 123,
    aspectRatio: 123 / 24,
  },
});


================================================
ðŸ“„ ARCHIVO: src\constants\theme.ts
================================================

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;


================================================
ðŸ“„ ARCHIVO: src\hooks\use-color-scheme.ts
================================================

export { useColorScheme } from 'react-native';


================================================
ðŸ“„ ARCHIVO: src\hooks\use-color-scheme.web.ts
================================================

import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}


================================================
ðŸ“„ ARCHIVO: src\hooks\use-theme.ts
================================================

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return Colors[theme];
}


================================================
ðŸ“„ ARCHIVO: tsconfig.json
================================================

{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@/assets/*": [
        "./assets/*"
      ]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
