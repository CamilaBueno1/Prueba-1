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