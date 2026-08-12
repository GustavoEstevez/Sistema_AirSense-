/**
 * AirSense — Agente virtual para preguntas frecuentes del sitio.
 */
(function () {
  'use strict';

  var FAQ = [
    {
      keywords: ['que es', 'qué es', 'airsense', 'proyecto', 'para que sirve', 'para qué sirve'],
      answer: 'AirSense es un sistema de monitoreo ambiental desarrollado por estudiantes de la E.E.S.T. N°1 para la Feria ACTE 2026. Mide temperatura, humedad, ruido y calidad del aire (CO₂) y muestra los datos en un dashboard en tiempo real con un agente de IA que interpreta las mediciones.'
    },
    {
      keywords: ['mide', 'mide', 'sensor', 'sensores', 'variables', 'parametros', 'parámetros', 'que datos', 'qué datos'],
      answer: 'AirSense mide cuatro variables ambientales: <strong>temperatura</strong>, <strong>humedad</strong>, <strong>ruido</strong> y <strong>calidad del aire (CO₂)</strong>. En la versión AI usa sensores SHT30 (temperatura/humedad), MAX4466 (ruido) y MQ135 (calidad del aire).'
    },
    {
      keywords: ['classic', 'clasico', 'clásico', 'diferencia', 'version', 'versión', 'evolucion', 'evolución', 'comparar'],
      answer: '<strong>AirSense Classic</strong> (v1) usaba Arduino UNO, DHT11, KY-038 y pantalla LCD, sin WiFi ni medición de CO₂. <strong>AirSense AI</strong> (v2) incorpora ESP32 con WiFi/Bluetooth, sensores de mayor precisión, pantalla OLED, batería 18650, dashboard web, agente de IA, reportes por Gmail y alertas por WhatsApp.'
    },
    {
      keywords: ['dashboard', 'vivo', 'tiempo real', 'ver datos', 'grafico', 'gráfico', 'monitoreo'],
      answer: 'Podés ver las mediciones en vivo en el <a href="/dashboard/">Dashboard</a>. Recibe los datos del ESP32 por WiFi y los muestra actualizados sin necesidad de cable serial. También podés usar el botón <strong>Ver en vivo</strong> del menú superior.'
    },
    {
      keywords: ['ia', 'inteligencia artificial', 'agente', 'ai', 'reporte', 'reportes', 'alerta', 'alertas', 'whatsapp', 'gmail', 'correo'],
      answer: 'El agente de IA analiza temperatura, humedad, ruido y calidad del aire comparándolos con referencias de la OMS, ASHRAE y Resolución 295/03 SRT. Genera <strong>reportes automáticos por Gmail</strong> y envía <strong>alertas por WhatsApp</strong> cuando detecta condiciones fuera de rango saludable.'
    },
    {
      keywords: ['hardware', 'componente', 'componentes', 'esp32', 'arduino', 'bateria', 'batería', 'oled', 'carcasa'],
      answer: 'Los componentes principales de AirSense AI son: <strong>ESP32</strong> (WiFi/Bluetooth), <strong>SHT30</strong> (temperatura/humedad), <strong>MQ135</strong> (CO₂), <strong>MAX4466</strong> (micrófono), pantalla <strong>OLED</strong>, batería <strong>18650</strong> recargable y carcasa impresa en <strong>3D</strong>.'
    },
    {
      keywords: ['documentacion', 'documentación', 'informe', 'carpeta', 'pdf', 'campo'],
      answer: 'La documentación oficial está en la sección <a href="/documentacion/">Documentación</a>: incluye la <strong>Carpeta de Campo</strong> (proceso de investigación) y el <strong>Informe Técnico</strong> (resultados y conclusiones).'
    },
    {
      keywords: ['equipo', 'creador', 'creadores', 'estudiante', 'estudiantes', 'quien', 'quién', 'autor', 'contacto', 'hablar'],
      answer: 'AirSense fue desarrollado por estudiantes de 7°1 de la E.E.S.T. N°1: <strong>Martín Clemente</strong> (Desarrollo Web), <strong>Gustavo Estévez</strong> (Diseño del Dispositivo), <strong>Benjamín Novel</strong> (Documentación Técnica) y <strong>Nicolás Gutiérrez</strong> (Presentación del Stand). Docentes orientadores: Gareis Pablo, Lautaro Aragon y Marcos Correia.'
    },
    {
      keywords: ['escuela', 'institucion', 'institución', 'acte', 'feria', 'eest', 'curso'],
      answer: 'AirSense es un proyecto de <strong>Ingeniería y Tecnología — Categoría B</strong> presentado en la Feria ACTE 2026 (Provincia de Buenos Aires) por la <strong>E.E.S.T. N°1</strong>, curso 7°1, área Informática.'
    },
    {
      keywords: ['ruido', '72', '72.7', 'estadistica', 'estadística', 'dato', 'datos', 'resultado'],
      answer: 'Durante las pruebas del prototipo original, el <strong>72,7%</strong> de las mediciones de ruido estuvieron fuera del rango saludable y el <strong>54,5%</strong> de las de temperatura superaron el límite recomendado. AirSense AI transforma estos datos en análisis y recomendaciones inteligentes.'
    },
    {
      keywords: ['salud', 'saludable', 'rango', 'limite', 'límite', 'oms', 'referencia'],
      answer: 'El agente de IA compara las mediciones con valores de referencia de la <strong>OMS</strong>, <strong>ASHRAE</strong> y la <strong>Resolución 295/03 SRT</strong> para determinar si el ambiente es saludable y avisar cuando algo está fuera de rango.'
    },
    {
      keywords: ['wifi', 'bluetooth', 'conexion', 'conexión', 'conectividad', 'inalambrico', 'inalámbrico'],
      answer: 'AirSense AI se conecta por <strong>WiFi</strong> y <strong>Bluetooth</strong> gracias al ESP32, que reemplazó al Arduino UNO. Esto permite enviar datos al dashboard en tiempo real y funcionar de forma portátil con batería.'
    },
    {
      keywords: ['hola', 'buenas', 'buen dia', 'buen día', 'buenas tardes', 'buenas noches', 'hey', 'saludos'],
      answer: '¡Hola! Soy el asistente virtual de AirSense. Puedo ayudarte con información sobre el proyecto, sensores, dashboard, IA y documentación. ¿Qué te gustaría saber?'
    },
    {
      keywords: ['gracias', 'thank', 'genial', 'perfecto', 'ok', 'listo'],
      answer: '¡De nada! Si tenés otra consulta sobre AirSense, escribime. También podés explorar el <a href="/ai/">sitio de AirSense AI</a> o el <a href="/dashboard/">dashboard en vivo</a>.'
    }
  ];

  var SUGGESTIONS = [
    '¿Qué es AirSense?',
    '¿Qué mide?',
    'Ver dashboard',
    'AirSense AI vs Classic',
    'Equipo del proyecto'
  ];

  function normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function findAnswer(question) {
    var q = normalize(question);
    if (!q) return null;

    var best = { score: 0, answer: null };

    FAQ.forEach(function (entry) {
      var score = 0;
      entry.keywords.forEach(function (kw) {
        var nkw = normalize(kw);
        if (q.indexOf(nkw) !== -1) {
          score += nkw.length > 4 ? 3 : 2;
        }
        var words = nkw.split(' ');
        words.forEach(function (w) {
          if (w.length > 3 && q.indexOf(w) !== -1) score += 1;
        });
      });
      if (score > best.score) {
        best.score = score;
        best.answer = entry.answer;
      }
    });

    if (best.score >= 2) return best.answer;

    return 'No tengo información específica sobre eso. Te recomiendo revisar la <a href="/documentacion/">documentación</a>, el <a href="/ai/">sitio de AirSense AI</a> o consultar directamente al equipo en la Feria ACTE 2026.';
  }

  function init() {
    var root = document.getElementById('airsenseChat');
    if (!root) return;

    var toggle = root.querySelector('.airsense-chat__toggle');
    var panel = root.querySelector('.airsense-chat__panel');
    var messages = root.querySelector('.airsense-chat__messages');
    var suggestions = root.querySelector('.airsense-chat__suggestions');
    var form = root.querySelector('.airsense-chat__form');
    var input = root.querySelector('.airsense-chat__input');
    var sendBtn = root.querySelector('.airsense-chat__send');

    function scrollToBottom() {
      messages.scrollTop = messages.scrollHeight;
    }

    function addMessage(text, type) {
      var el = document.createElement('div');
      el.className = 'airsense-chat__msg airsense-chat__msg--' + type;
      el.innerHTML = text;
      messages.appendChild(el);
      scrollToBottom();
      return el;
    }

    function showTyping() {
      var el = document.createElement('div');
      el.className = 'airsense-chat__typing';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(el);
      scrollToBottom();
      return el;
    }

    function respond(question) {
      sendBtn.disabled = true;
      var typing = showTyping();
      var delay = 400 + Math.min(question.length * 15, 800);

      setTimeout(function () {
        typing.remove();
        addMessage(findAnswer(question), 'bot');
        sendBtn.disabled = false;
        input.focus();
      }, delay);
    }

    function handleQuestion(text) {
      var q = text.trim();
      if (!q) return;
      addMessage(q, 'user');
      input.value = '';
      respond(q);
    }

    toggle.addEventListener('click', function () {
      var open = root.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (open) {
        input.focus();
        if (messages.children.length === 0) {
          addMessage(
            '¡Hola! Soy el asistente virtual de <strong>AirSense</strong>. Puedo responder preguntas básicas sobre el proyecto, sensores, dashboard e inteligencia artificial. ¿En qué te ayudo?',
            'bot'
          );
        }
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleQuestion(input.value);
    });

    SUGGESTIONS.forEach(function (label) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'airsense-chat__chip';
      chip.textContent = label;
      chip.addEventListener('click', function () {
        if (!root.classList.contains('is-open')) {
          root.classList.add('is-open');
          toggle.setAttribute('aria-expanded', 'true');
        }
        handleQuestion(label.replace(/^\¿|\?$/g, ''));
      });
      suggestions.appendChild(chip);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('is-open')) {
        root.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
