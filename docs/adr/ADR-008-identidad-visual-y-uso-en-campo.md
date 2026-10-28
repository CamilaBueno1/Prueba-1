# ADR-008: Identidad visual y experiencia de uso en campo

## Estado
Aceptado.

## Fecha
27 de octubre de 2026.

## Requisitos relacionados
R2–R9 y la rúbrica de diseño, que penaliza una interfaz genérica. La experiencia debe facilitar la lectura correcta y el trabajo con una sola mano, a plena luz o con conexión intermitente.

## Contexto
La aplicación resuelve un caso de uso planteado para EPMAPS, la Empresa Pública Metropolitana de Agua Potable y Saneamiento del Distrito Metropolitano de Quito. La usaría personal técnico durante recorridos urbanos y por parroquias rurales. La tarea principal es inequívoca: identificar un medidor, capturar su estado y lectura, respaldar los casos necesarios y saber si el registro quedó guardado o enviado.

La interfaz debe comunicar el contexto institucional y local sin confundirse con un producto oficial ya publicado por EPMAPS. Una plantilla genérica no comunica el trabajo de campo; inventar una versión del logotipo o atribuir colores no verificados a la marca también sería inadecuado. La prueba no proporciona un manual de marca, por lo que cualquier recurso institucional debe provenir de materiales oficiales autorizados.

No se justifica una dependencia de diseño adicional para esta prueba: React Native permite componer controles accesibles y consistentes.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **Sistema visual propio con componentes nativos (elegida)** | Controla jerarquía, identidad, contraste y estados de la tarea sin agregar un kit de UI. | Requiere definir tokens y componentes reutilizables para conservar consistencia. |
| Plantilla visual genérica | Permite iniciar rápido. | No refleja el contexto de agua/campo y arriesga la sanción explícita de la rúbrica. |
| Biblioteca de componentes visuales externa | Acelera la creación de controles. | Añade dependencia sin requisito que la justifique y puede imponer una estética genérica. |

## Decisión
Se diseña una interfaz de campo propia, situada explícitamente en el contexto de EPMAPS y Quito. Si se usan el logotipo, nombre gráfico o colores institucionales, se obtienen de material oficial y se respetan sin alterarlos; no se inventa ni se recrea el logotipo. Si no se dispone de una guía o recursos oficiales, se utiliza una paleta original inspirada en agua y paisaje andino, sin presentarla como paleta oficial de EPMAPS. La aplicación y la demostración se identifican como prototipo académico, no como una app oficial de la empresa.

La interfaz se redacta en español claro y sitúa en primer plano el código del medidor, el estado, la lectura y la condición de sincronización. El registro se divide en pasos cortos con avance visible, valores grandes y controles táctiles cómodos. Cada estado usa texto además de color: sin conexión, pendiente de verificar, pendiente de envío, error, enviado y anomalía. Se priorizan contraste legible, campos numéricos con teclado decimal, etiquetas persistentes y errores junto al campo. La cámara y el permiso se explican justo cuando se necesita la evidencia.

## Consecuencias

* Los componentes de interfaz reutilizables viven fuera de `src/app/` y toman colores/espaciados de tokens centralizados.
* No se agrega un kit visual o de iconos sin una necesidad demostrable.
* El estilo visual no sustituye los estados accesibles ni la validación de dominio.
* El uso del nombre o los recursos gráficos de EPMAPS se limita al contexto de la prueba; no debe sugerir aprobación, publicación ni afiliación oficial que no exista.
* La comprobación final debe hacerse en un dispositivo o emulador Android de tamaño real; una captura del navegador no demuestra ergonomía móvil.

## Verificación

* Las pantallas principales no conservan textos, gráficos ni branding de la plantilla Expo.
* La interfaz comunica que el caso de uso corresponde a EPMAPS/Quito y, si incluye recursos institucionales, estos provienen de fuentes oficiales y no están alterados.
* La app se presenta como prototipo académico y no como aplicación oficial de EPMAPS.
* La acción primaria y el estado de la visita se identifican a simple vista.
* En pantallas móviles pequeñas, los campos y acciones no requieren desplazamiento horizontal y los controles son cómodos al tacto.
* La información de estado no depende exclusivamente del color.
* La revisión con el docente/usuarios confirma que el flujo de registro se puede seguir sin instrucciones externas.

## Uso de IA
La IA apoyó la elaboración de criterios visuales; la identidad, los textos y la demo deben revisarse personalmente en el dispositivo.
