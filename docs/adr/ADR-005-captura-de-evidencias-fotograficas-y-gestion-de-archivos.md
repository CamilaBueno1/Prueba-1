# ADR-005: Captura de evidencias fotográficas y gestión de archivos locales (R6 y R7)

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R6 (foto obligatoria y confirmación ante consumo anómalo) y R7 (foto obligatoria cuando el medidor está dañado, conservación local y manejo del permiso de cámara).

## Contexto
La foto no es obligatoria para todas las lecturas. Debe solicitarse obligatoriamente cuando el consumo supera el triple del promedio mensual o cuando el medidor está dañado; en los demás casos es opcional. Si el consumo es anómalo, también se exige que el técnico confirme que revisó el medidor. El registro puede quedar varios días sin conexión, por lo que la foto debe continuar disponible después de cerrar y volver a abrir la aplicación.

Guardar imágenes como cadenas Base64 en AsyncStorage aumentaría considerablemente el tamaño de los datos y el uso de memoria. Una URI local identifica un archivo en el dispositivo del técnico, pero no es una dirección que el sistema de oficina pueda abrir directamente.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **`expo-image-picker` y `expo-file-system` — Elegida** | Permite capturar con la cámara del dispositivo, conservar el archivo en el almacenamiento privado de la app y guardar solo el nombre relativo del archivo (`fotoNombre`) en la lectura. | Requiere gestionar permisos y conservar el archivo persistido en el directorio privado de la app. |
| **`expo-camera` y `expo-file-system`** | Permite construir una vista de cámara integrada y controlar la captura. | Requiere una interfaz de cámara propia, innecesaria para el flujo acotado de esta prueba. |
| Almacenar imágenes en Base64 dentro de AsyncStorage | Mantiene los datos en un único valor serializado. | Aumenta considerablemente el tamaño de AsyncStorage y el uso de memoria al leer y escribir imágenes. |

## Decisión
Se decide utilizar **`expo-image-picker`** para tomar la foto y **`expo-file-system`** para copiarla al directorio persistente privado de la aplicación (`FileSystem.documentDirectory`), evitando depender de una ubicación temporal de captura que el sistema operativo puede limpiar. La lectura persistida en Zustand guarda solo el **nombre relativo** del archivo (`fotoNombre`) y la URI se reconstruye desde el directorio de documentos de la app. La foto **no se elimina** al enviar la lectura: permanece en el dispositivo como evidencia, porque no se sube a ningún servicio (ver ADR-009).

La foto es obligatoria solo si el medidor está dañado o si el consumo calculado supera el triple del promedio; es opcional en los demás casos. Cuando se detecta consumo anómalo, el técnico debe confirmar que revisó el medidor y adjuntar la foto antes de guardar el registro. Si el permiso de cámara se deniega, la app explica por qué lo solicita. Puede continuarse sin foto cuando es opcional; si es obligatoria, no se permite completar el registro sin adjuntarla.

La URI local no proporciona acceso remoto. Si se requiere que el personal de oficina abra la foto, se necesita cargarla a un servicio de almacenamiento accesible y enviar esa URL con la lectura; ese servicio es una mejora opcional y no está incluida en esta versión.

## Consecuencias

* AsyncStorage conserva solo el nombre del archivo (`fotoNombre`), no el binario ni la URI completa.
* La app mantiene el archivo y la lectura vinculados durante reinicios y reintentos. El archivo se conserva tras el envío; su limpieza queda para una futura integración con almacenamiento remoto.
* La app debe manejar el permiso denegado con un mensaje claro y respetar la diferencia entre foto opcional y obligatoria.
* Una `file://` URI solo sirve en el dispositivo donde existe el archivo; no proporciona acceso remoto a la oficina.

## Verificación

* Una lectura normal sin consumo anómalo puede guardarse sin foto; la foto puede adjuntarse como opcional.
* Un medidor dañado requiere descripción y foto; permite dejar la lectura vacía.
* Un consumo superior al triple del promedio muestra advertencia, exige confirmación y requiere foto.
* Con el permiso denegado, se explica el motivo; se permite continuar sin foto cuando es opcional y se impide completar cuando es obligatoria.
* Después de reiniciar la aplicación, la foto de una lectura pendiente continúa disponible y se puede previsualizar desde el archivo copiado al directorio persistente de la app.
* Tras enviarse la lectura, la foto sigue visible en "Mis lecturas" como evidencia local.

## Uso de IA
Consulté a la IA sobre cómo conservar las fotos sin aumentar innecesariamente el tamaño de los datos guardados. Elegí el sistema de archivos de Expo y persistir el nombre relativo del archivo en el registro, en lugar de guardar la imagen en Base64 dentro de AsyncStorage. También precisé que la foto solo es obligatoria en los casos indicados por R6 y R7, y que una URI local no reemplaza una URL accesible para la oficina.
