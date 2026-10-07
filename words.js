'use strict';

/* =========================================================================
   ¿Quién es el Impostor? — banco de palabras
   Cada palabra va con una pista ("palabra|pista") que se usa en el modo
   «Con pista»: el impostor recibe la pista en vez de la palabra.
   `pairs` son parejas de palabras parecidas para el modo «Infiltrado»:
   el grupo recibe una y el infiltrado la otra, sin saber que es distinta.
   Contenido original.
   ========================================================================= */

const CATEGORIES = {
  comida: {
    label: 'Comida', emoji: '🍕',
    words: [
      'pizza|horno', 'hamburguesa|pan', 'sushi|arroz', 'tacos|México', 'paella|domingo',
      'ensalada|verde', 'sopa|cuchara', 'espaguetis|tenedor', 'queso|ratón', 'jamón|pata',
      'chocolate|cacao', 'helado|verano', 'tarta|velas', 'galleta|leche', 'tortilla|huevo',
      'croquetas|bechamel', 'lentejas|cuchara', 'patatas fritas|sal', 'palomitas|cine', 'sandía|pepitas',
      'plátano|mono', 'fresa|rojo', 'piña|tropical', 'aguacate|guacamole', 'cebolla|lágrimas',
      'zanahoria|conejo', 'miel|abeja', 'yogur|nevera', 'churros|desayuno', 'gazpacho|frío',
      'flan|caramelo', 'kebab|noche', 'lasaña|capas', 'cruasán|mantequilla', 'nachos|queso',
      'pulpo a la gallega|pimentón', 'fabada|Asturias', 'empanada|relleno', 'roscón|regalo', 'turrón|almendra',
      'pimientos de padrón|unos pican', 'burrito|envuelto', 'donut|agujero', 'macarrones|tomate', 'calamares|bocadillo',
      'mejillones|concha', 'magdalena|bizcocho', 'sándwich|merienda', 'cereales|bol', 'perrito caliente|salchicha'
    ],
    pairs: [
      ['pizza', 'empanada'], ['café', 'té'], ['helado', 'granizado'], ['croissant', 'magdalena'],
      ['hamburguesa', 'bocadillo'], ['churros', 'porras'], ['tortilla', 'revuelto'], ['sushi', 'ceviche'],
      ['ketchup', 'mostaza'], ['naranja', 'mandarina'], ['donut', 'rosquilla'], ['lasaña', 'canelones']
    ]
  },
  animales: {
    label: 'Animales', emoji: '🐾',
    words: [
      'perro|ladrar', 'gato|bigotes', 'elefante|trompa', 'león|melena', 'jirafa|cuello',
      'mono|plátano', 'oso|miel', 'lobo|luna', 'zorro|astuto', 'conejo|orejas',
      'caballo|herradura', 'vaca|leche', 'cerdo|barro', 'oveja|lana', 'gallina|huevo',
      'pato|charca', 'búho|noche', 'loro|hablar', 'pingüino|hielo', 'delfín|listo',
      'ballena|enorme', 'tiburón|aleta', 'pulpo|tinta', 'tortuga|lenta', 'serpiente|veneno',
      'rana|charca', 'mariposa|colores', 'abeja|panal', 'hormiga|fila', 'araña|telaraña',
      'murciélago|cueva', 'canguro|bolsa', 'koala|eucalipto', 'panda|bambú', 'cebra|rayas',
      'cocodrilo|dientes', 'camello|joroba', 'erizo|pinchos', 'caracol|baba', 'flamenco|rosa',
      'mosquito|picor', 'gorila|pecho', 'castor|presa', 'medusa|playa', 'ardilla|bellota'
    ],
    pairs: [
      ['perro', 'lobo'], ['gato', 'tigre'], ['caballo', 'burro'], ['delfín', 'tiburón'],
      ['cocodrilo', 'lagarto'], ['abeja', 'avispa'], ['rana', 'sapo'], ['conejo', 'liebre'],
      ['búho', 'águila'], ['oveja', 'cabra'], ['foca', 'morsa'], ['mariposa', 'polilla']
    ]
  },
  profesiones: {
    label: 'Profesiones', emoji: '👩‍🔧',
    words: [
      'médico|bata', 'enfermero|turno', 'profesor|pizarra', 'bombero|manguera', 'policía|placa',
      'cocinero|fogones', 'camarero|bandeja', 'panadero|madrugar', 'carpintero|madera', 'electricista|cables',
      'fontanero|tuberías', 'mecánico|grasa', 'abogado|juicio', 'juez|martillo', 'arquitecto|planos',
      'veterinario|mascota', 'dentista|caries', 'peluquero|tijeras', 'pintor|brocha', 'músico|escenario',
      'actor|guion', 'periodista|noticia', 'fotógrafo|flash', 'piloto|cabina', 'taxista|bajada de bandera',
      'agricultor|cosecha', 'pescador|red', 'jardinero|césped', 'albañil|ladrillo', 'astronauta|gravedad',
      'socorrista|silbato', 'cartero|buzón', 'payaso|nariz', 'cerrajero|cerradura', 'detective|pistas',
      'youtuber|suscriptores', 'árbitro|tarjeta', 'farmacéutico|receta', 'basurero|contenedor', 'azafata|chaleco',
      'científico|laboratorio', 'carnicero|cuchillo', 'informático|código', 'influencer|seguidores', 'cura|misa'
    ],
    pairs: [
      ['médico', 'enfermero'], ['policía', 'guardia de seguridad'], ['profesor', 'monitor'], ['cocinero', 'panadero'],
      ['fontanero', 'electricista'], ['pintor', 'escultor'], ['actor', 'cantante'], ['piloto', 'azafata'],
      ['abogado', 'juez'], ['dentista', 'veterinario'], ['taxista', 'conductor de autobús'], ['mago', 'payaso']
    ]
  },
  lugares: {
    label: 'Lugares', emoji: '📍',
    words: [
      'playa|toalla', 'montaña|cima', 'bosque|árboles', 'desierto|arena', 'aeropuerto|maleta',
      'estación de tren|andén', 'hospital|camilla', 'colegio|recreo', 'biblioteca|silencio', 'museo|cuadros',
      'cine|butaca', 'teatro|telón', 'parque|columpios', 'zoológico|jaulas', 'acuario|peces',
      'restaurante|carta', 'supermercado|carrito', 'mercado|puestos', 'gimnasio|pesas', 'piscina|cloro',
      'estadio|grada', 'castillo|torre', 'granja|establo', 'isla|náufrago', 'cueva|eco',
      'volcán|lava', 'faro|barcos', 'parque de atracciones|montaña rusa', 'hotel|recepción', 'camping|tienda',
      'discoteca|DJ', 'cementerio|lápida', 'cárcel|barrotes', 'iglesia|campanas', 'peluquería|espejo',
      'ascensor|botones', 'gasolinera|surtidor', 'farmacia|cruz verde', 'banco|cajero', 'lavandería|tambor',
      'circo|carpa', 'nave espacial|astronautas', 'quirófano|cirujano', 'autoescuela|examen', 'bar|tapas'
    ],
    pairs: [
      ['playa', 'piscina'], ['cine', 'teatro'], ['hospital', 'farmacia'], ['biblioteca', 'librería'],
      ['supermercado', 'mercado'], ['colegio', 'universidad'], ['hotel', 'camping'], ['bar', 'discoteca'],
      ['montaña', 'volcán'], ['aeropuerto', 'estación de tren'], ['zoológico', 'acuario'], ['castillo', 'palacio']
    ]
  },
  objetos: {
    label: 'Objetos', emoji: '🧸',
    words: [
      'móvil|pantalla', 'mochila|espalda', 'paraguas|lluvia', 'reloj|hora', 'gafas|ver',
      'cartera|dinero', 'llaves|puerta', 'espejo|reflejo', 'cepillo de dientes|pasta', 'toalla|secar',
      'almohada|dormir', 'silla|sentarse', 'lámpara|luz', 'taza|café', 'tenedor|pinchar',
      'tijeras|cortar', 'martillo|clavo', 'escoba|barrer', 'esponja|fregar', 'secador|pelo',
      'plancha|arrugas', 'aspiradora|polvo', 'lavadora|ropa', 'nevera|frío', 'microondas|calentar',
      'mando a distancia|sofá', 'cargador|batería', 'auriculares|música', 'teclado|letras', 'bolígrafo|tinta',
      'maleta|viaje', 'vela|cumpleaños', 'globo|aire', 'peine|púas', 'pinza|tender',
      'sacacorchos|vino', 'linterna|oscuridad', 'cinta adhesiva|pegar', 'calcetín|pie', 'mechero|fuego',
      'dado|azar', 'imán|nevera', 'cuerda|nudo', 'cubo|agua', 'sartén|freír'
    ],
    pairs: [
      ['bolígrafo', 'lápiz'], ['tenedor', 'cuchara'], ['silla', 'taburete'], ['mochila', 'maleta'],
      ['almohada', 'cojín'], ['vela', 'linterna'], ['taza', 'vaso'], ['secador', 'plancha del pelo'],
      ['reloj', 'pulsera'], ['escoba', 'fregona'], ['nevera', 'congelador'], ['sartén', 'cazuela']
    ]
  },
  deportes: {
    label: 'Deportes', emoji: '⚽',
    words: [
      'fútbol|portería', 'baloncesto|canasta', 'tenis|raqueta', 'voleibol|red', 'natación|piscina',
      'atletismo|pista', 'ciclismo|pedales', 'boxeo|guantes', 'judo|kimono', 'kárate|cinturón',
      'esgrima|espada', 'golf|hoyo', 'béisbol|bate', 'rugby|melé', 'balonmano|siete metros',
      'hockey|stick', 'patinaje|ruedas', 'esquí|nieve', 'surf|olas', 'remo|barca',
      'escalada|cuerda', 'gimnasia|piruetas', 'halterofilia|pesas', 'bádminton|volante', 'billar|taco',
      'bolos|pleno', 'ajedrez|jaque', 'tiro con arco|diana', 'equitación|caballo', 'maratón|kilómetros',
      'buceo|bombona', 'pádel|cristal', 'ping-pong|mesa', 'paracaidismo|avión', 'yoga|postura',
      'dardos|bar', 'fórmula 1|boxes', 'petanca|jubilados', 'waterpolo|gorro', 'curling|escoba'
    ],
    pairs: [
      ['tenis', 'pádel'], ['fútbol', 'rugby'], ['baloncesto', 'balonmano'], ['esquí', 'snowboard'],
      ['surf', 'windsurf'], ['boxeo', 'kárate'], ['ping-pong', 'bádminton'], ['billar', 'bolos'],
      ['natación', 'waterpolo'], ['golf', 'minigolf'], ['ciclismo', 'motociclismo'], ['dardos', 'tiro con arco']
    ]
  },
  superpoderes: {
    label: 'Superpoderes', emoji: '⚡',
    words: [
      'volar|capa', 'invisibilidad|desaparecer', 'superfuerza|músculos', 'teletransportación|instantáneo', 'telepatía|mente',
      'supervelocidad|rayo', 'control del fuego|llamas', 'control del agua|olas', 'congelar|hielo', 'curación|heridas',
      'visión de rayos X|huesos', 'viajar en el tiempo|reloj', 'leer mentes|secretos', 'inmortalidad|siglos', 'respirar bajo el agua|branquias',
      'hablar con animales|zoológico', 'transformarse|disfraz', 'clonarse|copias', 'encogerse|hormiga', 'hacerse gigante|rascacielos',
      'campo de fuerza|escudo', 'control de plantas|raíces', 'magnetismo|metal', 'predecir el futuro|bola de cristal', 'suerte infinita|lotería',
      'trepar paredes|araña', 'súper oído|susurros', 'atravesar paredes|fantasma', 'controlar el clima|tormenta', 'parar el tiempo|pausa'
    ],
    pairs: [
      ['volar', 'saltar muy alto'], ['invisibilidad', 'camuflaje'], ['telepatía', 'leer mentes'], ['supervelocidad', 'teletransportación'],
      ['control del fuego', 'control del rayo'], ['inmortalidad', 'curación'], ['encogerse', 'hacerse gigante'], ['parar el tiempo', 'viajar en el tiempo']
    ]
  },
  paises: {
    label: 'Países y ciudades', emoji: '🌍',
    words: [
      'Francia|torre', 'Italia|bota', 'Japón|sol naciente', 'México|mariachi', 'Brasil|samba',
      'Egipto|pirámides', 'China|muralla', 'Estados Unidos|hamburguesa', 'Argentina|tango', 'Alemania|cerveza',
      'Reino Unido|té', 'Australia|canguros', 'India|especias', 'Rusia|frío', 'Grecia|dioses',
      'Portugal|bacalao', 'Canadá|arce', 'Suiza|relojes', 'Holanda|bicicletas', 'Noruega|fiordos',
      'Marruecos|zoco', 'Cuba|puros', 'Perú|Machu Picchu', 'Irlanda|trébol', 'Turquía|kebab',
      'París|amor', 'Nueva York|rascacielos', 'Londres|niebla', 'Roma|coliseo', 'Venecia|góndola',
      'Tokio|neón', 'Barcelona|Gaudí', 'Madrid|capital', 'Las Vegas|casino', 'Hawái|surf',
      'Polo Norte|Papá Noel', 'Laponia|auroras', 'Islandia|géiseres', 'Amazonas|selva', 'Sáhara|dunas'
    ],
    pairs: [
      ['Francia', 'Bélgica'], ['España', 'Portugal'], ['Italia', 'Grecia'], ['Japón', 'China'],
      ['México', 'Colombia'], ['Noruega', 'Suecia'], ['Londres', 'Dublín'], ['París', 'Roma'],
      ['Nueva York', 'Chicago'], ['Brasil', 'Argentina'], ['Madrid', 'Barcelona'], ['Australia', 'Nueva Zelanda']
    ]
  },
  cuerpo: {
    label: 'Cuerpo humano', emoji: '🫀',
    words: [
      'corazón|latido', 'cerebro|pensar', 'pulmones|respirar', 'estómago|hambre', 'nariz|oler',
      'ojo|parpadear', 'oreja|oír', 'boca|hablar', 'diente|sonrisa', 'lengua|sabor',
      'mano|dedos', 'pie|zapato', 'rodilla|arrodillarse', 'codo|doblar', 'hombro|mochila',
      'ombligo|barriga', 'uña|cortaúñas', 'pelo|peine', 'ceja|expresión', 'pestaña|deseo',
      'esqueleto|huesos', 'sangre|rojo', 'piel|tacto', 'cuello|bufanda', 'espalda|columna',
      'tobillo|esguince', 'muñeca|reloj', 'hígado|alcohol', 'riñón|trasplante', 'bigote|afeitar',
      'barba|hipster', 'pulgar|me gusta', 'cosquillas|risa', 'hipo|susto', 'estornudo|¡Jesús!'
    ],
    pairs: [
      ['codo', 'rodilla'], ['mano', 'pie'], ['oreja', 'nariz'], ['ceja', 'pestaña'],
      ['muñeca', 'tobillo'], ['barba', 'bigote'], ['hipo', 'tos'], ['diente', 'muela']
    ]
  },
  musica: {
    label: 'Música', emoji: '🎸',
    words: [
      'guitarra|cuerdas', 'piano|teclas', 'batería|baquetas', 'violín|arco', 'flauta|soplar',
      'trompeta|jazz', 'saxofón|dorado', 'arpa|ángel', 'acordeón|fuelle', 'gaita|Galicia',
      'micrófono|voz', 'concierto|entradas', 'karaoke|desafinar', 'orquesta|director', 'rap|rimas',
      'reguetón|perreo', 'flamenco|palmas', 'ópera|soprano', 'rock|melenas', 'jazz|improvisar',
      'disco de vinilo|tocadiscos', 'altavoz|volumen', 'coro|voces', 'pandereta|villancico', 'castañuelas|baile',
      'festival|pulsera', 'himno|bandera', 'banda sonora|película', 'metrónomo|ritmo', 'serenata|ventana',
      'Eurovisión|puntos', 'DJ|mesa de mezclas', 'nana|bebé', 'ukelele|Hawái', 'tambor|desfile'
    ],
    pairs: [
      ['guitarra', 'ukelele'], ['violín', 'violonchelo'], ['trompeta', 'saxofón'], ['piano', 'órgano'],
      ['rap', 'reguetón'], ['concierto', 'festival'], ['flauta', 'armónica'], ['tambor', 'batería']
    ]
  },
  ropa: {
    label: 'Ropa y moda', emoji: '👗',
    words: [
      'camiseta|manga', 'pantalón|piernas', 'falda|vuelo', 'vestido|boda', 'chaqueta|frío',
      'abrigo|invierno', 'bufanda|cuello', 'guantes|manos', 'gorro|lana', 'gorra|visera',
      'sombrero|vaquero', 'zapatillas|correr', 'sandalias|verano', 'botas|lluvia', 'tacones|altura',
      'calcetines|pares', 'pijama|cama', 'bañador|piscina', 'bikini|playa', 'corbata|nudo',
      'cinturón|hebilla', 'chándal|gimnasio', 'sudadera|capucha', 'vaqueros|azul', 'traje|oficina',
      'uniforme|colegio', 'disfraz|carnaval', 'pendientes|orejas', 'collar|perlas', 'anillo|compromiso',
      'riñonera|cintura', 'bolso|cartera', 'chanclas|ducha', 'jersey|abuela', 'pajarita|elegante'
    ],
    pairs: [
      ['gorra', 'sombrero'], ['bufanda', 'pañuelo'], ['zapatillas', 'botas'], ['sandalias', 'chanclas'],
      ['falda', 'vestido'], ['corbata', 'pajarita'], ['jersey', 'sudadera'], ['bañador', 'bikini'],
      ['pendientes', 'collar'], ['abrigo', 'chaqueta']
    ]
  },
  transporte: {
    label: 'Transporte', emoji: '🚀',
    words: [
      'coche|volante', 'moto|casco', 'bicicleta|pedales', 'autobús|parada', 'tren|vías',
      'metro|subterráneo', 'avión|alas', 'helicóptero|hélice', 'barco|puerto', 'submarino|profundidad',
      'cohete|espacio', 'globo aerostático|cesta', 'tranvía|catenaria', 'taxi|taxímetro', 'ambulancia|sirena',
      'camión de bomberos|escalera', 'tractor|campo', 'patinete|eléctrico', 'monopatín|trucos', 'teleférico|cabina',
      'velero|viento', 'canoa|remo', 'caravana|vacaciones', 'limusina|famosos', 'grúa|multa',
      'carruaje|princesa', 'trineo|nieve', 'ovni|extraterrestre', 'yate|millonario', 'excavadora|obras'
    ],
    pairs: [
      ['coche', 'taxi'], ['autobús', 'tranvía'], ['avión', 'helicóptero'], ['bicicleta', 'patinete'],
      ['barco', 'velero'], ['tren', 'metro'], ['moto', 'vespa'], ['cohete', 'ovni'],
      ['ambulancia', 'coche de policía'], ['canoa', 'kayak']
    ]
  },
  fantasia: {
    label: 'Fantasía y terror', emoji: '🐉',
    words: [
      'dragón|fuego', 'unicornio|cuerno', 'sirena|cola', 'vampiro|colmillos', 'zombi|cerebros',
      'fantasma|sábana', 'bruja|escoba', 'mago|varita', 'hada|alas', 'duende|travieso',
      'gigante|habichuelas', 'ogro|pantano', 'momia|vendas', 'hombre lobo|luna llena', 'gnomo|jardín',
      'extraterrestre|ovni', 'robot|metal', 'pirata|parche', 'caballero|armadura', 'princesa|corona',
      'genio de la lámpara|deseos', 'fénix|cenizas', 'cíclope|un ojo', 'centauro|mitad', 'troll|puente',
      'Papá Noel|chimenea', 'ratoncito Pérez|diente', 'Reyes Magos|camellos', 'calabaza de Halloween|vela', 'casa encantada|crujidos'
    ],
    pairs: [
      ['vampiro', 'hombre lobo'], ['bruja', 'mago'], ['hada', 'duende'], ['fantasma', 'zombi'],
      ['dragón', 'dinosaurio'], ['sirena', 'tritón'], ['robot', 'cíborg'], ['Papá Noel', 'Reyes Magos'],
      ['momia', 'esqueleto'], ['unicornio', 'pegaso']
    ]
  },
  tecnologia: {
    label: 'Tecnología', emoji: '💻',
    words: [
      'ordenador|teclado', 'tablet|pantalla táctil', 'consola|mando', 'wifi|contraseña', 'selfi|móvil',
      'emoji|cara', 'contraseña|secreto', 'impresora|tinta', 'robot aspirador|suelo', 'dron|vuelo',
      'realidad virtual|gafas', 'videollamada|cámara', 'reloj inteligente|muñeca', 'pendrive|USB', 'powerbank|enchufe',
      'nube|guardar', 'virus|antivirus', 'podcast|escuchar', 'streaming|directo', 'meme|risa',
      'grupo de WhatsApp|notificaciones', 'GPS|ruta', 'código QR|escanear', 'altavoz inteligente|voz', 'videojuego|partida',
      'inteligencia artificial|preguntas', 'hashtag|almohadilla', 'captura de pantalla|guardar', 'modo avión|desconectar', 'auriculares inalámbricos|bluetooth'
    ],
    pairs: [
      ['tablet', 'móvil'], ['consola', 'ordenador'], ['wifi', 'bluetooth'], ['selfi', 'foto'],
      ['emoji', 'pegatina'], ['podcast', 'radio'], ['dron', 'helicóptero teledirigido'], ['meme', 'GIF'],
      ['pendrive', 'disco duro']
    ]
  },
  fiesta: {
    label: 'Fiestas y ocio', emoji: '🎉',
    words: [
      'cumpleaños|tarta', 'boda|anillos', 'Nochevieja|uvas', 'Navidad|árbol', 'Halloween|disfraz',
      'carnaval|máscara', 'San Fermín|toros', 'Feria de Abril|sevillanas', 'Fallas|fuego', 'Tomatina|tomates',
      'barbacoa|carbón', 'pícnic|mantel', 'fiesta de pijamas|almohadas', 'despedida de soltero|banda', 'discomóvil|pueblo',
      'escape room|candados', 'parque acuático|toboganes', 'feria|algodón de azúcar', 'piñata|palo', 'fuegos artificiales|cielo',
      'botellón|plaza', 'vacaciones|maleta', 'crucero|barco', 'acampada|hoguera', 'juego de mesa|dados',
      'verbena|orquesta', 'San Valentín|corazones', 'cabalgata|caramelos', 'graduación|birrete', 'baby shower|bebé'
    ],
    pairs: [
      ['cumpleaños', 'aniversario'], ['Navidad', 'Nochevieja'], ['Halloween', 'carnaval'], ['boda', 'bautizo'],
      ['barbacoa', 'pícnic'], ['crucero', 'vuelo'], ['Fallas', 'San Juan'], ['feria', 'circo'],
      ['escape room', 'yincana']
    ]
  },
  naturaleza: {
    label: 'Naturaleza', emoji: '🌿',
    words: [
      'sol|calor', 'luna|noche', 'estrella|brillar', 'huracán|viento', 'lluvia|charcos',
      'nieve|muñeco', 'rayo|trueno', 'arcoíris|colores', 'tornado|remolino', 'terremoto|temblor',
      'río|corriente', 'lago|orilla', 'cascada|caída', 'mar|sal', 'ola|surf',
      'árbol|hojas', 'flor|pétalos', 'cactus|pinchos', 'seta|bosque', 'rosa|espinas',
      'girasol|pipas', 'palmera|cocos', 'roca|dura', 'arena|reloj', 'barro|botas',
      'niebla|ver poco', 'eclipse|sombra', 'aurora boreal|norte', 'glaciar|hielo', 'otoño|hojas caídas'
    ],
    pairs: [
      ['sol', 'luna'], ['lluvia', 'granizo'], ['río', 'lago'], ['mar', 'océano'],
      ['flor', 'planta'], ['nube', 'niebla'], ['tornado', 'huracán'], ['rosa', 'tulipán'],
      ['montaña', 'colina'], ['cactus', 'palmera']
    ]
  },
  espana: {
    label: 'Cosas de España', emoji: '🇪🇸',
    words: [
      'siesta|sofá', 'tapas|bar', 'sangría|jarra', 'cocido madrileño|garbanzos', 'toros|plaza',
      'Camino de Santiago|peregrino', 'Sagrada Familia|obras', 'Alhambra|Granada', 'botijo|agua fresca', 'abanico|calor',
      'chotis|Madrid', 'sardana|corro', 'jota|Aragón', 'Rastro|domingo', 'lotería de Navidad|bombo',
      'Rey|Zarzuela', 'mus|cartas', 'ventilador|verano', 'chiringuito|playa', 'tinto de verano|terraza',
      'Puerta del Sol|campanadas', 'castellers|torres humanas', 'Semana Santa|pasos', 'tortilla de patatas|cebolla', 'bocadillo de calamares|plaza mayor',
      'mercadillo|puestos', 'pantano|sequía', 'aceite de oliva|oro líquido', 'chorizo|pimentón', 'puente de diciembre|vacaciones'
    ],
    pairs: [
      ['siesta', 'descanso'], ['tapas', 'pinchos'], ['sangría', 'tinto de verano'], ['chotis', 'sardana'],
      ['jamón', 'chorizo'], ['flamenco', 'sevillanas'], ['mus', 'tute'], ['abanico', 'ventilador']
    ]
  },
  personajes: {
    label: 'Personajes', emoji: '🦸',
    words: [
      'Drácula|Transilvania', 'Sherlock Holmes|lupa', 'Robin Hood|arco', 'Cleopatra|Egipto', 'Napoleón|bajito',
      'Cristóbal Colón|carabelas', 'Don Quijote|molinos', 'Caperucita Roja|lobo', 'Pinocho|nariz', 'Cenicienta|zapato',
      'Blancanieves|manzana', 'Peter Pan|Nunca Jamás', 'Tarzán|liana', 'Frankenstein|tornillos', 'Rey Arturo|espada',
      'Hércules|fuerza', 'Aladino|alfombra', 'Julio César|imperio', 'Einstein|relatividad', 'Mozart|piano',
      'Picasso|cubismo', 'Shakespeare|teatro', 'Alicia|País de las Maravillas', 'Rapunzel|trenza', 'el Zorro|antifaz',
      'Superman|kriptonita', 'Spider-Man|telaraña', 'Batman|murciélago', 'Mickey Mouse|orejas', 'Mario Bros|seta'
    ],
    pairs: [
      ['Batman', 'Superman'], ['Cenicienta', 'Blancanieves'], ['Drácula', 'Frankenstein'], ['Robin Hood', 'el Zorro'],
      ['Mozart', 'Beethoven'], ['Picasso', 'Dalí'], ['Peter Pan', 'Pinocho'], ['Cleopatra', 'Nefertiti'],
      ['Sherlock Holmes', 'Hércules Poirot']
    ]
  },
  acciones: {
    label: 'Acciones', emoji: '🏃',
    words: [
      'bailar|música', 'nadar|agua', 'roncar|dormir', 'estornudar|alergia', 'bostezar|sueño',
      'cocinar|receta', 'conducir|carné', 'cantar en la ducha|jabón', 'hacer la compra|lista', 'fregar los platos|grifo',
      'hacer la maleta|viaje', 'montar en bici|equilibrio', 'tender la ropa|pinzas', 'hacer un selfi|sonrisa', 'escribir un mensaje|teclear',
      'pedir perdón|lo siento', 'hacer pompas|jabón', 'silbar|labios', 'guiñar un ojo|complicidad', 'aplaudir|manos',
      'hacer yoga|esterilla', 'pintarse las uñas|esmalte', 'peinarse|espejo', 'saltar a la comba|cuerda', 'hacer una barbacoa|carbón',
      'meditar|calma', 'hacer surf|tabla', 'jugar al escondite|contar', 'ver una película|palomitas', 'llegar tarde|excusas'
    ],
    pairs: [
      ['bailar', 'cantar'], ['nadar', 'bucear'], ['roncar', 'bostezar'], ['correr', 'caminar'],
      ['cocinar', 'hornear'], ['silbar', 'tararear'], ['aplaudir', 'chasquear los dedos'], ['reír', 'llorar'],
      ['meditar', 'dormir la siesta']
    ]
  }
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);
