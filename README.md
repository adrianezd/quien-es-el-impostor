# ¿Quién es el Impostor?

Juego de fiesta gratuito para grupos, pensado para jugarse en **un solo móvil compartido** que se va pasando entre los jugadores. Sin cuentas, sin descargas y sin internet (tras la primera visita queda guardado en el móvil).

🔗 **Jugar ahora:** https://adrianezd.github.io/quien-es-el-impostor/

## Modos de juego

| Modo | Qué pasa |
| --- | --- |
| 🕵️ **Clásico** | El impostor solo sabe que es el impostor y tiene que deducir la palabra. |
| 💡 **Con pista** | El impostor recibe una pista relacionada con la palabra. |
| 🥸 **Infiltrado** | El impostor recibe una palabra parecida (café / té) y no sabe que es el impostor. |
| 🌀 **Caos** | Número de impostores secreto: uno, varios, ninguno… o todos. |

## Funcionalidades

- Más de 650 palabras en 18 categorías (cada una con pista) y casi 200 parejas para el modo Infiltrado.
- Selección de varias categorías a la vez y **tus propias palabras** (también parejas `palabra / parecida`).
- Nombres de jugadores (se recuerdan, y se comparten con Dibujo Impostor y El Dato Falso).
- Carta que se gira manteniendo pulsado: el rol solo se ve mientras el dedo está en la pantalla.
- Jugador inicial y sentido al azar, cronómetro con anillo, sonido y vibración.
- Votación a mano alzada o **votación secreta** pasando el móvil.
- Última oportunidad del impostor para adivinar la palabra y **marcador** entre rondas.
- Pantalla siempre encendida durante la partida y funcionamiento sin conexión (service worker).

## Puntuación

- El grupo expulsa a todos los impostores y estos no adivinan la palabra → **+1** a cada jugador del grupo.
- Algún impostor se libra (o adivina la palabra) → **+2** a cada impostor.

## Privacidad

Cada ronda (palabra y roles) vive solo en memoria: recargar la página la borra. En `localStorage` solo se guardan ajustes, nombres y tus palabras personalizadas.

## Aviso

Juego de fiesta **original**, basado en el concepto genérico de "deducción social con una palabra secreta". No está afiliado a ninguna marca, producto o juego comercial.

## Stack técnico

Sitio estático sin dependencias ni build: HTML, CSS y JavaScript vanilla servidos por GitHub Pages.

- `kit.js` — piezas compartidas con los otros juegos (nombres, cronómetro, votación, marcador, sonido…).
- `words.js` — banco de palabras, pistas y parejas.
- `script.js` — lógica del juego.
- `sw.js` — caché para jugar sin conexión.
