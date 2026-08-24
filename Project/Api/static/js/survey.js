// ══════════════════════════════════════════════════════════════
    // ENCUESTA DE USABILIDAD — AirSense
    // Fuente en vivo: Hoja de respuestas de Google Forms publicada
    // como CSV (Archivo → Compartir → Publicar en la Web → CSV).
    // Si el link no está disponible, se usan los datos de respaldo
    // (última exportación) para que la sección nunca quede vacía.
    // ══════════════════════════════════════════════════════════════
    const SURVEY_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSs2lTTyK7kXEyvWS-8RjUBVxc-gtc9akUIaHGxRA_vFh1YUDkBLtsO6-A0Pdd_OVhSczUqecbFNVEo/pub?gid=1449413424&single=true&output=csv";

    const SURVEY_FALLBACK_CSV = `"Marca temporal","  1. ¿Cuál fue tu impresión general sobre AirSense?","  2. ¿Te parece que AirSense es un sistema práctico para utilizar en la vida cotidiana?","  3. Luego de comparar el prototipo anterior con el nuevo, ¿considerás que las mejoras implementadas son útiles?  ","  4. ¿Qué tan fácil te resultó comprender el funcionamiento de AirSense?  ","  5. ¿En qué medida considerás que AirSense puede ser útil para mejorar el monitoreo de las condiciones ambientales?  ","  6. ¿En qué lugares creés que AirSense sería más útil? (Podés seleccionar más de una opción.)","  7. Del 1 al 5, ¿qué tan necesario es resolver este problema en tu comunidad?","  8. ¿Utilizarías AirSense si estuviera disponible para su uso?  ","  9. Con tus propias palabras, ¿cómo le explicarías esta propuesta a otra persona?","  10. ¿Qué aspecto de AirSense fue el que más te gustó?  ","  11. ¿Qué crees que podría fallar o por qué una idea así podría no funcionar en la realidad?","  12. Si pudieras cambiarle o agregarle una sola cosa a esta propuesta antes de llevarla a la práctica, ¿qué sería?","  13. ¿Tenés algún comentario o sugerencia adicional para ayudarnos a mejorar AirSense?  "
"2026/08/06 11:05:40 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Hogares;Oficinas;Hospitales;Industrias;Espacios públicos;Otros","","Sí","","Integracion del agente IA","","Mejorar la integracion con IA",""
"2026/08/06 11:09:08 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Hogares;Oficinas;Hospitales;Industrias;Espacios públicos","","Sí","","Que es un proyecto hecho con mucho cariño y dedicación ","","",""
"2026/08/07 12:40:34 a.m. GMT-3","Buena","Práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Hogares;Oficinas;Hospitales;Industrias;Espacios públicos;Otros","5","Sí","Una propuesta con una visión de controlar y mejorar las condiciones ambientales en el futuro","Me gusto el uso de la tecnología para detectar problemas ambientales en nuestra vida diaria","-","Más opciones de accesibilidad","Panel solar para usar energías renovables"
"2026/08/07 3:02:43 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Neutral","Muy útil","Escuelas;Hogares;Oficinas;Hospitales;Industrias;Espacios públicos","5","Sí","Diría que es un sistema que ayuda a medir la temperatura con precisión ","Las mediciones ","Quizás la manera de obtenerlo ","Nada ","Nada "
"2026/08/07 3:05:24 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Hogares;Oficinas","5","Sí","","Que pueda mandar alertas al WhatsApp ","Tal vez porque ya hay apps que miden la temperatura y la humedad ","Una pantalla mas grande para la gente que tenga problemas de la vista ",""
"2026/08/07 3:13:11 p.m. GMT-3","Excelente","Práctico","Muy útiles","Muy fácil","Útil","Hospitales;Industrias;Espacios públicos","3","Tal vez","","","","Cambiaría la batería recargable por unos paneles solares, para que sea más natural y cuidar el medio ambiente ",""
"2026/08/07 3:17:14 p.m. GMT-3","Excelente","Práctico","Muy útiles","Fácil","Útil","Hospitales;Industrias;Espacios públicos","3","Tal vez","","Lo que más me gustó fue que te da un aviso en caso de cualquier alerta ","Por el requerimiento de materiales costosos ","",""
"2026/08/07 3:32:05 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas","3","Sí","Es muy buena propuesta","Todos","No tengo idea","Nada","Todo muy bueno"
"2026/08/07 4:22:49 p.m. GMT-3","Buena","Práctico","Útiles","Muy fácil","Muy útil","Escuelas;Hogares;Oficinas;Hospitales;Industrias;Espacios públicos;Otros","5","Sí","Un sensor de contaminación ambiental con reportes virtuales","Sensor de c02","Costos del producto","Ninguna ","No"
"2026/08/07 5:36:32 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Hogares;Oficinas;Hospitales","5","Sí","AirSense es una propuesta que busca mejorar la calidad del aire y ayudar a las personas a saber cómo está el ambiente que las rodea. La idea es que sea un sistema práctico y fácil de usar, que pueda aplicarse en lugares como hogares, escuelas, oficinas, hospitales y espacios públicos.","Lo que más me gustó de AirSense es que es una propuesta práctica e innovadora que busca mejorar la calidad del aire y cuidar la salud de las personas.","Creo que podría fallar si los sensores no son precisos, si el sistema resulta complicado de usar o si tiene un costo muy alto para instalarlo y mantenerlo. También podría ser difícil que las personas se acostumbren a utilizarlo en su vida cotidiana.","Le agregaría una aplicación o pantalla donde se pueda ver de forma clara y sencilla la calidad del aire en tiempo real, junto con alertas cuando los niveles sean peligrosos.","Me parece una propuesta interesante y útil. Como sugerencia, trataría de que sea fácil de usar y accesible para que pueda implementarse en distintos lugares y que más personas puedan aprovecharla."
"2026/08/07 6:29:00 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Otros","1","Sí","","","","",""
"2026/08/07 6:39:56 p.m. GMT-3","Buena","Práctico","Neutral","Muy fácil","Muy útil","Hogares;Hospitales;Industrias","4","Sí","Un dispositivo recargable que ayuda ver lo saludable que es el ambiente","El resguardo de la informacion de manera online","La saturacion del servidor por muchas conexiones simultaneamente","No se me ocurre nd","Implementacion de websockets en vez de peticiones al servidor cada 2 sg"
"2026/08/07 6:57:32 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Hogares;Hospitales;Espacios públicos","5","Sí","Es un sistema que analiza las condiciones del aire ambiental","Su eficacia de medir todos los patrones","Creo que podria funcionar y ser muy util","Nada","No me parece perfecto"
"2026/08/07 7:02:36 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Fácil","Muy útil","Escuelas;Hogares;Oficinas;Hospitales;Industrias;Espacios públicos","5","Sí","Es un dispositivo q chequea valores d humedad temperatura, nivel d co2 y nivel sonoro, enviandote alertas por wsp o mail","Nivel d co2 y contaminacion sonora","","",""
"2026/08/07 7:04:44 p.m. GMT-3","Excelente","Práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Oficinas;Hospitales;Industrias","4","Sí","","","","","No"
"2026/08/07 7:52:37 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Hogares;Oficinas","5","Sí","útil y muy completo","alerta x Wassap","podría fallar si no hay buena señal","que no sea muy costoso  ","nada"
"2026/08/07 8:38:44 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Hospitales","4","Tal vez","","","","",""
"2026/08/07 8:41:25 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas","1","Sí","","","","",""
"2026/08/07 8:45:26 p.m. GMT-3","Excelente","Práctico","Muy útiles","Fácil","Útil","Hogares","4","Sí","Herramienta de medición para mejorar condiciones de vida","Compromiso joven y ambiental","Todo se puede. A base de prueba y error","No comprendo algunas partes del funcionamiento. Pero si mide el dióxido de carbono que mida por ejemplo en invierno cuando la gente tiene la calefacción prendida y mueren por inhalación ","Lo anteriormente expuesto "
"2026/08/07 8:50:13 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Hogares;Hospitales","5","Sí","","","","",""
"2026/08/07 9:15:40 p.m. GMT-3","Excelente","Práctico","Útiles","Fácil","Útil","Escuelas;Hogares;Oficinas","4","Sí","Que se dirija a hablar con los creadores.","El agente de inteligencia artificial.","Con inteligencia artificial bien creada es imposible que haya fallad.","No sabe, no responde.","Ninguno."
"2026/08/07 9:37:08 p.m. GMT-3","Excelente","Práctico","Muy útiles","Fácil","Muy útil","Escuelas;Hogares;Oficinas;Hospitales;Industrias","5","Sí","Es un aparato que es necesario para el hogar,escuelas y otros lugares,ya que tienes varias funciones en un solo dispositivo.","Que mida el dioxido de carbono","Lo veo muy completo,si algo puede fallar quisas sea en la durabilidad de la bateria","Que envié alertas a celulares de integrantes del hogar o donde sea que se utilice.","Ponerle ""alarma ""en caso de monoxido en el hogar."
"2026/08/07 9:51:21 p.m. GMT-3","Buena","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Hogares;Hospitales","5","Sí","Te proponemos probar un dispositivo que mide variaciones en el ambiente, como ser la temperatura, los niveles de ruidos y los componentes del aire, logrando un monitoreo continuo con aviso de alertas enviadas por Whatsapp o mail.","Que mida alteraciones en el aire detectando Co. .","Creo que puede funcionar, no encuentro fallas ","Que si detecta una alteración que ponga en riesgo la vida, tenga localizador y envié alerta al 911.","Ninguno se vemuy bien"
"2026/08/07 10:25:41 p.m. GMT-3","Excelente","Práctico","Muy útiles","Fácil","Muy útil","Escuelas;Hospitales;Espacios públicos","5","Sí","Se nesecita aportar todos los desarrollos que existan para conseguir solucionar los graves inconvenientes ambientales ","Lo simple del desarrollo","El uso total de la ia la cual en ocasiones puede cometer errores","El doble control de los resultados ","La participación del der humano en los resultados finales "
"2026/08/07 10:47:02 p.m. GMT-3","Excelente","Muy práctico","Muy útiles","Muy fácil","Muy útil","Escuelas;Hogares;Oficinas;Hospitales;Industrias;Espacios públicos","5","Sí","Es un excelente programa para la salud ambiental ","Todos es muy bueno lo que ser proponen realizzar","Fallaría si no la ponen en práctica porque es una gran propuesta ","No le cambiaría nada excelente propuesta ","Que se animen será un gran progreso"
"2026/08/07 10:58:34 p.m. GMT-3","Excelente","Práctico","Muy útiles","Fácil","Muy útil","Escuelas;Hogares;Hospitales","4","Sí","","","","",""
"2026/08/08 12:52:22 a.m. GMT-3","Excelente","Muy práctico","Muy útiles","Fácil","Muy útil","Industrias;Espacios públicos","5","Sí","","la claridad y facilidad de uso","la demanda que haya sobre el proyecto ","",""
"2026/08/08 1:22:27 a.m. GMT-3","Excelente","Muy práctico","Muy útiles","Fácil","Útil","Escuelas;Hospitales;Espacios públicos","5","Sí","Es una herramienta muy útil para combatir la contaminación del medio ambiente ","Sus actualizaciones permanentes y poder de detecvin de los fistintos tipos de contaminacion","Demasiado uso de ia la cual puede fallar en sus diagnósticos precidos","Que tuviese mas supervisando humana en sus diagnóstico final","Solo seguir perfeccionando los sistemas dado que son y serán extremadamente útiles para las generaciones futuras"`;

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    async function loadSurveyData() {
      let text;
      try {
        const res = await fetch(SURVEY_CSV_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("Respuesta no OK: " + res.status);
        text = await res.text();
        if (!text || text.trim().length < 20) throw new Error("CSV vacío");
      } catch (err) {
        console.warn("No se pudo obtener la encuesta en vivo, usando datos de respaldo.", err);
        text = SURVEY_FALLBACK_CSV;
      }
      const parsed = Papa.parse(text.trim(), { skipEmptyLines: true });
      const rows = parsed.data.slice(1); // quitar fila de encabezados
      renderSurvey(rows);
    }

    function renderSurvey(rows) {
      const total = rows.length;
      const countEl = document.getElementById("survey-count");
      if (countEl) countEl.textContent = total;

      const col = (i) => rows.map((r) => (r[i] || "").trim()).filter(Boolean);

      const countSingle = (i) => {
        const c = {};
        col(i).forEach((v) => { c[v] = (c[v] || 0) + 1; });
        return c;
      };
      const countMulti = (i) => {
        const c = {};
        col(i).forEach((v) => v.split(";").forEach((x) => {
          x = x.trim();
          if (x) c[x] = (c[x] || 0) + 1;
        }));
        return c;
      };
      const pct = (count, base) => (base ? Math.round((count / base) * 100) : 0);

      const q1 = countSingle(1);  // impresión general
      const q2 = countSingle(2);  // practicidad
      const q3 = countSingle(3);  // mejoras útiles
      const q4 = countSingle(4);  // facilidad de comprensión
      const q5 = countSingle(5);  // utilidad para monitoreo
      const q6 = countMulti(6);   // lugares (multi-select)
      const q7 = countSingle(7);  // necesidad 1-5
      const q8 = countSingle(8);  // usaría

      /* ── Estadísticas destacadas ── */
      const positivos1 = (q1["Excelente"] || 0) + (q1["Buena"] || 0);
      const usariaSi = q8["Sí"] || 0;
      const usariaTalVez = q8["Tal vez"] || 0;
      const facilFacil = (q4["Muy fácil"] || 0) + (q4["Fácil"] || 0);
      const n7 = col(7).length;
      const necesidadAlta = (q7["5"] || 0) + (q7["4"] || 0);

      const stats = [
        { num: pct(positivos1, total) + "%", label: "calificó la experiencia como Buena o Excelente" },
        { num: pct(usariaSi + usariaTalVez, total) + "%", label: "usaría o consideraría usar AirSense" },
        { num: pct(facilFacil, total) + "%", label: "entendió fácil o muy fácil el funcionamiento" },
        { num: (n7 ? pct(necesidadAlta, n7) : 0) + "%", label: "calificó con 4 o 5 la necesidad de resolver este problema" },
      ];
      const statsEl = document.getElementById("survey-stats");
      if (statsEl) {
        statsEl.innerHTML = stats.map((s) => `
          <div class="survey-stat">
            <span class="survey-stat-num">${s.num}</span>
            <span class="survey-stat-label">${s.label}</span>
          </div>`).join("");
      }

      /* ── Gráficos ── */
      const palette = ["#088395", "#7AB2B2", "#F59E0B", "#EF4444", "#0A4C60", "#6EEAD4"];
      const chartFont = { family: "'DM Sans', sans-serif", size: 11 };
      const charts = [];

      try {

      const impresionCtx = document.getElementById("chartImpresion");
      if (impresionCtx) {
        const chart = new Chart(impresionCtx, {
          type: "doughnut",
          data: {
            labels: Object.keys(q1),
            datasets: [{ data: Object.keys(q1).map(() => 0), backgroundColor: palette, borderWidth: 0 }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: chartFont } } },
          },
        });
        chart.__real = Object.values(q1);
        charts.push(chart);
      }

      const lugaresSorted = Object.entries(q6).sort((a, b) => b[1] - a[1]);
      const lugaresCtx = document.getElementById("chartLugares");
      if (lugaresCtx) {
        const chart = new Chart(lugaresCtx, {
          type: "bar",
          data: {
            labels: lugaresSorted.map((x) => x[0]),
            datasets: [{ data: lugaresSorted.map(() => 0), backgroundColor: "#088395", borderRadius: 6 }],
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { stepSize: 1, font: chartFont } },
              y: { ticks: { font: chartFont } },
            },
          },
        });
        chart.__real = lugaresSorted.map((x) => x[1]);
        charts.push(chart);
      }

      const usariaCtx = document.getElementById("chartUsaria");
      if (usariaCtx) {
        const chart = new Chart(usariaCtx, {
          type: "doughnut",
          data: {
            labels: Object.keys(q8),
            datasets: [{ data: Object.keys(q8).map(() => 0), backgroundColor: palette, borderWidth: 0 }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: chartFont } } },
          },
        });
        chart.__real = Object.values(q8);
        charts.push(chart);
      }

      const necesidadLabels = ["1", "2", "3", "4", "5"];
      const necesidadCtx = document.getElementById("chartNecesidad");
      if (necesidadCtx) {
        const chart = new Chart(necesidadCtx, {
          type: "bar",
          data: {
            labels: necesidadLabels,
            datasets: [{ data: necesidadLabels.map(() => 0), backgroundColor: "#0A4C60", borderRadius: 6 }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            plugins: { legend: { display: false } },
            scales: {
              y: { ticks: { stepSize: 1, font: chartFont } },
              x: { ticks: { font: chartFont } },
            },
          },
        });
        chart.__real = necesidadLabels.map((l) => q7[l] || 0);
        charts.push(chart);
      }
      } catch (err) {
        console.warn("No se pudieron crear los gráficos de la encuesta.", err);
      }

      /* ── Barras tipo "Resultados" para las preguntas de escala ── */
      const likert = [
        { name: "Practicidad", top: "Muy práctico", count: q2["Muy práctico"] || 0 },
        { name: "Mejoras vs. versión anterior", top: "Muy útiles", count: q3["Muy útiles"] || 0 },
        { name: "Facilidad de comprensión", top: "Muy fácil", count: q4["Muy fácil"] || 0 },
        { name: "Utilidad para el monitoreo", top: "Muy útil", count: q5["Muy útil"] || 0 },
      ];
      const likertEl = document.getElementById("survey-likert");
      if (likertEl) {
        likertEl.innerHTML = likert.map((l) => {
          const p = pct(l.count, total);
          return `
            <div class="param-bar">
              <div class="param-name">${l.name}</div>
              <div class="param-track"><div class="param-fill param-fill--ok" style="width:0" data-w="${p}"></div></div>
              <div class="param-pct">${p}% respondió "${l.top}"</div>
            </div>`;
        }).join("");
      }

      /* ── Animar gráficos y barras al entrar en pantalla ── */
      const surveySection = document.getElementById("encuesta");
      const revealSurvey = () => {
        if (surveySection && surveySection.classList.contains("in-view")) return;
        try {
          charts.forEach((chart) => {
            chart.options.animation = { duration: 1100, easing: "easeOutQuart" };
            chart.data.datasets.forEach((ds) => {
              ds.data = (chart.__real || []).slice();
            });
            chart.update();
          });
        } catch (e) {
          console.warn("Error al animar los gráficos de la encuesta.", e);
        }
        document.querySelectorAll(".param-fill[data-w]").forEach((el) => {
          el.style.width = el.getAttribute("data-w") + "%";
        });
        if (surveySection) surveySection.classList.add("in-view");
      };
      if (surveySection && "IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              revealSurvey();
              io.disconnect();
            }
          });
        }, { threshold: 0.2 });
        io.observe(surveySection);
        window.setTimeout(() => {
          const r = surveySection.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            revealSurvey();
          }
        }, 2500);
      } else {
        revealSurvey();
      }

      /* ── Comentarios destacados ── */
      const blacklist = new Set(["no", "nada", "ninguno", "ninguna", "no.", "no sabe, no responde.", "-", "n/a", "todo muy bueno"]);
      const commentCols = [
        { i: 9, label: "Cómo lo explicarían" },
        { i: 10, label: "Lo que más les gustó" },
        { i: 12, label: "Qué le agregarían" },
        { i: 13, label: "Comentario adicional" },
      ];
      let quotes = [];
      commentCols.forEach((c) => {
        col(c.i).forEach((text) => {
          const clean = text.trim();
          if (clean.length >= 12 && !blacklist.has(clean.toLowerCase())) {
            quotes.push({ text: clean, label: c.label });
          }
        });
      });
      quotes = quotes.sort(() => Math.random() - 0.5);

      const trackEl = document.getElementById("quoteTrack");
      if (trackEl) {
        const cardsHtml = quotes.map((q) => `
          <div class="quote-card">
            <span class="quote-mark">&ldquo;</span>
            <div class="quote-head">
              <span class="quote-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
              </span>
              <span class="quote-question">${escapeHtml(q.label)}</span>
            </div>
            <p class="quote-text">${escapeHtml(q.text)}</p>
          </div>`).join("");
        trackEl.innerHTML = cardsHtml + cardsHtml;
      }
    }

    document.addEventListener("DOMContentLoaded", () => {
      loadSurveyData();

      const track = document.getElementById("quoteTrack");
      const prevBtn = document.getElementById("quotePrev");
      const nextBtn = document.getElementById("quoteNext");
      if (track && prevBtn && nextBtn) {
        const step = () => {
          const card = track.querySelector(".quote-card");
          return (card ? card.offsetWidth : 280) + 18;
        };
        const cardCount = () => Math.floor(track.querySelectorAll(".quote-card").length / 2);
        const slide = (i, animated) => {
          track.style.transition = animated ? "transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)" : "none";
          track.style.transform = "translateX(" + (-i * step()) + "px)";
        };
        const goNext = () => {
          let count = cardCount();
          if (!count) return;
          index = index + 1;
          if (index >= count) { index = 0; slide(index, false); }
          else { slide(index, true); }
        };
        const goPrev = () => {
          let count = cardCount();
          if (!count) return;
          index = index - 1;
          if (index < 0) { index = count - 1; slide(index, false); }
          else { slide(index, true); }
        };
        let index = 0;
        prevBtn.addEventListener("click", () => { goPrev(); restartAuto(); });
        nextBtn.addEventListener("click", () => { goNext(); restartAuto(); });

        let autoTimer = null;
        const stopAuto = () => clearInterval(autoTimer);
        const startAuto = () => {
          stopAuto();
          autoTimer = setInterval(goNext, 6000);
        };
        const restartAuto = () => startAuto();
        track.addEventListener("mouseenter", stopAuto);
        track.addEventListener("mouseleave", startAuto);
        startAuto();
      }

      const evoTrack = document.getElementById("evoTrack");
      const evoPrevBtn = document.getElementById("evoPrev");
      const evoNextBtn = document.getElementById("evoNext");
      if (evoTrack && evoPrevBtn && evoNextBtn) {
        evoTrack.innerHTML = evoTrack.innerHTML + evoTrack.innerHTML;
        const evoStep = () => {
          const card = evoTrack.querySelector(".evo-feature");
          return (card ? card.offsetWidth : 160) + 18;
        };
        const evoCardCount = () => Math.floor(evoTrack.querySelectorAll(".evo-feature").length / 2);
        const evoSlide = (i, animated) => {
          evoTrack.style.transition = animated ? "transform 0.8s cubic-bezier(0.33, 1, 0.68, 1)" : "none";
          evoTrack.style.transform = "translateX(" + (-i * evoStep()) + "px)";
        };
        const evoGoNext = () => {
          let count = evoCardCount();
          if (!count) return;
          evoIndex = evoIndex + 1;
          if (evoIndex >= count) { evoIndex = 0; evoSlide(evoIndex, false); }
          else { evoSlide(evoIndex, true); }
        };
        const evoGoPrev = () => {
          let count = evoCardCount();
          if (!count) return;
          evoIndex = evoIndex - 1;
          if (evoIndex < 0) { evoIndex = count - 1; evoSlide(evoIndex, false); }
          else { evoSlide(evoIndex, true); }
        };
        let evoIndex = 0;
        evoPrevBtn.addEventListener("click", () => { evoGoPrev(); evoRestartAuto(); });
        evoNextBtn.addEventListener("click", () => { evoGoNext(); evoRestartAuto(); });

        let evoAutoTimer = null;
        const evoStopAuto = () => clearInterval(evoAutoTimer);
        const evoStartAuto = () => {
          evoStopAuto();
          evoAutoTimer = setInterval(evoGoNext, 6000);
        };
        const evoRestartAuto = () => evoStartAuto();
        evoTrack.addEventListener("mouseenter", evoStopAuto);
        evoTrack.addEventListener("mouseleave", evoStartAuto);
        evoStartAuto();
      }
    });
