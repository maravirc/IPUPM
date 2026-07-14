// ==========================
// HIMNARIO IPU MOYOBAMBA
// script.js - VERSIÓN COMPLETA OPTIMIZADA
// ==========================

// ==========================
// CACHE EN MEMORIA - PARA VELOCIDAD
// ==========================

let himnos = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

// Cache de datos para no recargar cada vez
let datosHimnosCache = [];
let datosCorosCache = [];
let datosActuales = [];
let tipoActual = 'himnos';

// ==========================
// VARIABLES DE PAGINACIÓN
// ==========================

let mostrandoTodos = false;
const MAX_INICIAL = 30;

const lista = document.getElementById("lista");
const buscar = document.getElementById("buscar");
const tituloSeccion = document.getElementById("tituloSeccion");
const subtitulo = document.getElementById("subtitulo");

// ==========================
// FUNCIÓN PARA ACTUALIZAR TÍTULO
// ==========================

function actualizarTitulo(tipo, cantidad = 0) {
    const iconos = {
        'himnos': '📖',
        'coros': '🎵',
        'favoritos': '⭐'
    };
    
    const textos = {
        'himnos': 'Himnos',
        'coros': 'Adoración y Alabanzas',
        'favoritos': 'Favoritos'
    };
    
    const subtitulos = {
        'himnos': 'Iglesia Pentecostal Unida - Moyobamba - Himnos',
        'coros': 'Iglesia Pentecostal Unida - Moyobamba - Adoración y Alabanzas',
        'favoritos': 'Tus himnos y coros favoritos'
    };
    
    const icono = iconos[tipo] || '📖';
    const texto = textos[tipo] || 'Himnos';
    const subTexto = subtitulos[tipo] || 'Iglesia Pentecostal Unida - Moyobamba';
    
    if (tipo === 'favoritos') {
        tituloSeccion.innerHTML = `<h2>⭐ Favoritos <span class="contador">(${cantidad})</span></h2>`;
    } else {
        tituloSeccion.innerHTML = `<h2>${icono} ${texto} <span class="contador">(${cantidad})</span></h2>`;
    }
    
    subtitulo.textContent = subTexto;
}

// ==========================
// RESETEAR PAGINACIÓN
// ==========================

function resetearPaginacion() {
    mostrandoTodos = false;
}

// ==========================
// CARGAR HIMNOS - UNA SOLA VEZ
// ==========================

async function cargarHimnos() {
    try {
        const respuesta = await fetch("data/himnos.json");
        const data = await respuesta.json();
        datosHimnosCache = data.map(h => ({ ...h, tipo: 'himno' }));
        console.log('✅ Himnos cargados:', datosHimnosCache.length);
        
        try {
            const respCoros = await fetch("data/coros.json");
            const dataCoros = await respCoros.json();
            datosCorosCache = dataCoros.map(h => ({ ...h, tipo: 'coro' }));
            console.log('✅ Coros cargados:', datosCorosCache.length);
        } catch (e) {
            console.log('⚠️ No se pudieron cargar coros');
            datosCorosCache = [];
        }
        
        datosActuales = datosHimnosCache;
        tipoActual = 'himnos';
        mostrarHimnos(datosHimnosCache);
        actualizarTitulo('himnos', datosHimnosCache.length);
        
    } catch (error) {
        console.error('❌ Error al cargar:', error);
        lista.innerHTML = "<h2>⚠️ No se pudieron cargar los himnos.</h2><p>Verifica tu conexión a internet.</p>";
    }
}

// ==========================
// MOSTRAR HIMNOS - CON "VER MÁS"
// ==========================

function mostrarHimnos(datos) {
    // Guardar referencia
    datosActuales = datos;
    
    if (!datos || datos.length === 0) {
        lista.innerHTML = `<div class="sin-resultados">
            <h3>📭 No hay elementos</h3>
            <p>No se encontraron himnos o coros.</p>
        </div>`;
        return;
    }
    
    // Decidir cuántos mostrar
    let datosMostrar;
    let mostrarBoton = false;
    
    if (datos.length > MAX_INICIAL && !mostrandoTodos) {
        datosMostrar = datos.slice(0, MAX_INICIAL);
        mostrarBoton = true;
    } else {
        datosMostrar = datos;
        mostrarBoton = false;
    }
    
    // Construir HTML
    let html = '';
    
    for (let i = 0; i < datosMostrar.length; i++) {
        const himno = datosMostrar[i];
        
        const prefijo = himno.tipo === 'coro' ? 'C' : 'H';
        const esFavorito = favoritos.includes(`${prefijo}${himno.numero}`);
        
        let icono = '📖';
        let tipoTexto = 'Himno';
        let tipo = 'himno';
        
        if (himno.tipo === 'coro') {
            icono = '🎵';
            tipoTexto = 'Adoración y Alabanza';
            tipo = 'coro';
        }
        
        // Dentro del for donde se crean las tarjetas
const btnFav = esFavorito ? '⭐ Quitar' : '🤍 Favorito';

html += `
    <div class="card" data-numero="${himno.numero}">
        <div class="cabecera-himno">
            <div>
                <div class="numero">${icono} ${tipoTexto} ${himno.numero}</div>
                <div class="titulo">${himno.titulo}</div>
            </div>
            <div class="acciones">
                <button class="btnPantalla" onclick="pantallaCompleta(${himno.numero})">⛶</button>
                <button class="btnSalir" onclick="salirPantallaCompleta(event)">✕</button>
            </div>
        </div>
        <div class="letra">${himno.letra}</div>
        <div class="botones">
            <button onclick="favorito(${himno.numero}, '${tipo}')">${btnFav}</button>
            <button onclick="compartir(${himno.numero})">📤 Compartir</button>
            <button onclick="compartirApp()" class="btn-compartir-app" style="
                background: linear-gradient(135deg, #e65100, #f57c00);
                box-shadow: 0 3px 12px rgba(230, 81, 0, 0.3);
            ">📱 Compartir App</button>
        </div>
    </div>
`;
    }
    
    // Botón "Ver más"
    if (mostrarBoton) {
        const restantes = datos.length - MAX_INICIAL;
        html += `
            <div class="ver-mas" style="text-align: center; padding: 25px 0; width: 100%;">
                <button class="btn-ver-mas" id="btnVerMas" style="
                    background: linear-gradient(135deg, #0d47a1, #1565c0);
                    color: white;
                    border: none;
                    padding: 14px 35px;
                    border-radius: 50px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(13, 71, 161, 0.35);
                    transition: all 0.3s ease;
                    letter-spacing: 0.5px;
                    min-width: 200px;
                "
                onmouseover="this.style.transform='translateY(-3px) scale(1.03)'; this.style.boxShadow='0 8px 35px rgba(13, 71, 161, 0.5)'; this.style.background='linear-gradient(135deg, #1565c0, #0d47a1)'"
                onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 20px rgba(13, 71, 161, 0.35)'; this.style.background='linear-gradient(135deg, #0d47a1, #1565c0)'"
                onmousedown="this.style.transform='scale(0.95)'"
                onmouseup="this.style.transform='translateY(-3px) scale(1.03)'"
                >
                    📖 Ver más (${restantes} restantes)
                </button>
            </div>
        `;
    }
    
    lista.innerHTML = html;
    
    // Event listener para el botón "Ver más"
    const btnVerMas = document.getElementById('btnVerMas');
    if (btnVerMas) {
        btnVerMas.addEventListener('click', function() {
            mostrandoTodos = true;
            mostrarHimnos(datosActuales);
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 300);
        });
    }
}

// ==========================
// BOTÓN ADORACIÓN Y ALABANZAS - CON RESET
// ==========================

document.getElementById("btnCoros").addEventListener("click", () => {
    if (datosCorosCache.length > 0) {
        tipoActual = 'coros';
        datosActuales = datosCorosCache;
        resetearPaginacion();
        mostrarHimnos(datosCorosCache);
        actualizarTitulo('coros', datosCorosCache.length);
        buscar.value = '';
    } else {
        lista.innerHTML = "<h2>⚠️ No se pudieron cargar los coros.</h2>";
    }
});

// ==========================
// BOTÓN HIMNOS - CON RESET
// ==========================

document.getElementById("btnHimnos").addEventListener("click", () => {
    if (datosHimnosCache.length > 0) {
        tipoActual = 'himnos';
        datosActuales = datosHimnosCache;
        resetearPaginacion();
        mostrarHimnos(datosHimnosCache);
        actualizarTitulo('himnos', datosHimnosCache.length);
        buscar.value = '';
    }
});

// ==========================
// BOTÓN FAVORITOS - CON RESET
// ==========================

document.getElementById("btnFavoritos").addEventListener("click", () => {
    const todosLosDatos = [...datosHimnosCache, ...datosCorosCache];
    const listaFavoritos = todosLosDatos.filter(h => {
        const prefijo = h.tipo === 'coro' ? 'C' : 'H';
        return favoritos.includes(`${prefijo}${h.numero}`);
    });
    
    tipoActual = 'favoritos';
    datosActuales = listaFavoritos;
    resetearPaginacion();
    mostrarHimnos(listaFavoritos);
    actualizarTitulo('favoritos', listaFavoritos.length);
    buscar.value = '';
    
    if (listaFavoritos.length === 0) {
        lista.innerHTML = `<div class="sin-resultados">
            <h3>⭐ Sin favoritos</h3>
            <p>Agrega himnos o coros a tus favoritos presionando el corazón ❤️</p>
        </div>`;
    }
});

// ==========================
// BUSCAR - CORREGIDO (BUSCA POR TÍTULO)
// ==========================

let timeoutBusqueda;

// 🔥 FUNCIÓN PARA QUITAR ACENTOS
function quitarAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// 🔥 FUNCIÓN PARA LIMPIAR TEXTO (quita signos, comas, puntos, espacios extras)
function limpiarTexto(texto) {
    return quitarAcentos(texto)
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// 🔥 BUSCADOR EN TIEMPO REAL - SOLO POR TÍTULO
buscar.addEventListener("input", function() {
    clearTimeout(timeoutBusqueda);
    
    const textoOriginal = this.value.trim();
    
    // Si se borró todo, mostrar todos los datos
    if (textoOriginal === '') {
        resetearPaginacion();
        if (tipoActual === 'himnos') {
            mostrarHimnos(datosHimnosCache);
            actualizarTitulo('himnos', datosHimnosCache.length);
        } else if (tipoActual === 'coros') {
            mostrarHimnos(datosCorosCache);
            actualizarTitulo('coros', datosCorosCache.length);
        } else if (tipoActual === 'favoritos') {
            const todosLosDatos = [...datosHimnosCache, ...datosCorosCache];
            const favs = todosLosDatos.filter(h => {
                const prefijo = h.tipo === 'coro' ? 'C' : 'H';
                return favoritos.includes(`${prefijo}${h.numero}`);
            });
            datosActuales = favs;
            mostrarHimnos(favs);
            actualizarTitulo('favoritos', favs.length);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    
    // 🔥 IMPORTANTE: Usar los datos correctos según la sección
    let datosABuscar = [];
    if (tipoActual === 'himnos') {
        datosABuscar = datosHimnosCache;
    } else if (tipoActual === 'coros') {
        datosABuscar = datosCorosCache;
    } else if (tipoActual === 'favoritos') {
        const todosLosDatos = [...datosHimnosCache, ...datosCorosCache];
        datosABuscar = todosLosDatos.filter(h => {
            const prefijo = h.tipo === 'coro' ? 'C' : 'H';
            return favoritos.includes(`${prefijo}${h.numero}`);
        });
    }
    
    // Limpiar el texto de búsqueda
    const textoBusqueda = limpiarTexto(textoOriginal);
    
    // Si después de limpiar queda vacío, mostrar todo
    if (textoBusqueda === '') {
        resetearPaginacion();
        mostrarHimnos(datosABuscar);
        if (tipoActual === 'himnos') {
            actualizarTitulo('himnos', datosABuscar.length);
        } else if (tipoActual === 'coros') {
            actualizarTitulo('coros', datosABuscar.length);
        } else if (tipoActual === 'favoritos') {
            actualizarTitulo('favoritos', datosABuscar.length);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    
    // 🔥 BUSCAR SOLO POR TÍTULO (no en la letra)
    let resultado;
    if (/^\d+$/.test(textoBusqueda)) {
        // Si es número, buscar por número
        resultado = datosABuscar.filter(h => 
            h.numero.toString().includes(textoBusqueda)
        );
    } else {
        // Buscar solo en el TÍTULO
        resultado = datosABuscar.filter(h => {
            const tituloLimpio = limpiarTexto(h.titulo);
            const palabras = textoBusqueda.split(' ');
            // Verificar que TODAS las palabras estén en el TÍTULO
            return palabras.every(palabra => 
                tituloLimpio.includes(palabra)
            );
        });
    }
    
    resetearPaginacion();
    mostrarHimnos(resultado);
    
    if (resultado.length > 0) {
        const primerItem = resultado[0];
        const tipo = primerItem.tipo === 'coro' ? 'coros' : 'himnos';
        actualizarTitulo(tipo, resultado.length);
    } else {
        lista.innerHTML = `<div class="sin-resultados">
            <h3>🔍 No se encontraron resultados</h3>
            <p>Intenta con otra palabra o número</p>
        </div>`;
    }
    
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// ==========================
// FAVORITOS - CORREGIDO CON PREFIJO Y TIPO EXPLÍCITO
// ==========================

function favorito(numero, tipo) {
    const prefijo = tipo === 'coro' ? 'C' : 'H';
    const idFavorito = `${prefijo}${numero}`;
    
    const index = favoritos.indexOf(idFavorito);
    if (index > -1) {
        favoritos.splice(index, 1);
    } else {
        favoritos.push(idFavorito);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    
    if (tipoActual === 'himnos') {
        mostrarHimnos(datosHimnosCache);
        actualizarTitulo('himnos', datosHimnosCache.length);
    } else if (tipoActual === 'coros') {
        mostrarHimnos(datosCorosCache);
        actualizarTitulo('coros', datosCorosCache.length);
    } else if (tipoActual === 'favoritos') {
        const todosLosDatos = [...datosHimnosCache, ...datosCorosCache];
        const listaFavoritos = todosLosDatos.filter(h => {
            const pref = h.tipo === 'coro' ? 'C' : 'H';
            return favoritos.includes(`${pref}${h.numero}`);
        });
        datosActuales = listaFavoritos;
        mostrarHimnos(listaFavoritos);
        actualizarTitulo('favoritos', listaFavoritos.length);
        
        if (listaFavoritos.length === 0) {
            lista.innerHTML = `<div class="sin-resultados">
                <h3>⭐ Sin favoritos</h3>
                <p>Agrega himnos o coros a tus favoritos presionando el corazón ❤️</p>
            </div>`;
        }
    }
}

// ==========================
// COMPARTIR
// ==========================

async function compartir(numero) {
    const himno = datosActuales.find(h => h.numero === numero);
    if (!himno) return;

    let tipoTexto = 'Himno';
    if (himno.tipo === 'coro') {
        tipoTexto = 'Adoración y Alabanza';
    }

    if (navigator.share) {
        navigator.share({
            title: himno.titulo,
            text: `${tipoTexto} ${himno.numero}\n\n${himno.titulo}\n\n${himno.letra}`
        });
    } else {
        alert("Tu navegador no admite compartir.");
    }
}

// ==========================
// PANTALLA COMPLETA
// ==========================

function pantallaCompleta(numero) {
    const tarjetas = document.querySelectorAll(".card");
    let encontrada = false;
    
    tarjetas.forEach(card => {
        if (card.dataset.numero == numero) {
            card.requestFullscreen();
            encontrada = true;
        }
    });
    
    if (!encontrada) {
        tarjetas.forEach(card => {
            if (card.innerHTML.includes(`>${numero}<`) || 
                card.innerHTML.includes(`📖 ${numero}`) ||
                card.innerHTML.includes(`🎵 ${numero}`)) {
                card.requestFullscreen();
            }
        });
    }
}

function salirPantallaCompleta(event) {
    event.stopPropagation();
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

// ==========================
// COMPARTIR APP - DESDE EL BOTÓN
// ==========================

function compartirApp() {
    const url = window.location.href;
    const titulo = '📖 Himnario IPUP Moyobamba';
    const descripcion = 'Descarga el Himnario de la Iglesia Pentecostal Unida - Moyobamba';
    
    // Verificar si ya está instalada como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    let mensaje = '';
    if (isStandalone) {
        mensaje = '📖 Himnario IPUP Moyobamba\n\n✅ Ya tienes la app instalada.\n\n📤 Comparte este enlace con tus hermanos:';
    } else {
        mensaje = '📖 Himnario IPUP Moyobamba\n\n📲 INSTALACIÓN:\n' +
                  '1. Abre este enlace en Chrome o Safari\n' +
                  '2. Presiona el botón "Instalar App" o "Agregar a pantalla de inicio"\n' +
                  '3. ¡Listo! Tendrás el himnario siempre disponible\n\n' +
                  '🔗 Enlace: ' + url;
    }
    
    if (navigator.share) {
        navigator.share({
            title: titulo,
            text: mensaje,
            url: url
        }).catch(() => {});
    } else {
        // Si no soporta compartir, copiar al portapapeles
        if (navigator.clipboard) {
            navigator.clipboard.writeText(mensaje + '\n\n🔗 ' + url).then(() => {
                mostrarToast('✅ Enlace copiado al portapapeles');
            }).catch(() => {
                alert(mensaje + '\n\n🔗 ' + url);
            });
        } else {
            alert(mensaje + '\n\n🔗 ' + url);
        }
    }
}

// ==========================
// INSTALAR PWA
// ==========================

let eventoInstalacion;
const btnInstalar = document.getElementById("btnInstalar");

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    eventoInstalacion = e;
    btnInstalar.style.display = "block";
});

btnInstalar.addEventListener("click", async () => {
    if (!eventoInstalacion) return;

    eventoInstalacion.prompt();
    const resultado = await eventoInstalacion.userChoice;

    if (resultado.outcome === "accepted") {
        console.log("✅ Aplicación instalada");
    } else {
        console.log("❌ Instalación cancelada");
    }

    eventoInstalacion = null;
    btnInstalar.style.display = "none";
});

// ==========================
// BÚSQUEDA POR VOZ - CON INDICADOR
// ==========================

const btnVoz = document.getElementById('btnVoz');
const indicadorVoz = document.getElementById('indicadorVoz');
let reconocimiento = null;
let escuchando = false;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-ES';
    reconocimiento.continuous = false;
    reconocimiento.interimResults = true;
    reconocimiento.maxAlternatives = 1;

    reconocimiento.addEventListener('result', function(event) {
        const transcript = event.results[0][0].transcript;
        const esFinal = event.results[0].isFinal;
        
        document.getElementById('buscar').value = transcript;
        
        if (esFinal) {
            escuchando = false;
            btnVoz.textContent = '🎤';
            btnVoz.style.background = '#0d47a1';
            btnVoz.style.boxShadow = 'none';
            indicadorVoz.style.display = 'none';
            
            const evento = new Event('input');
            document.getElementById('buscar').dispatchEvent(evento);
        }
    });

    reconocimiento.addEventListener('start', function() {
        escuchando = true;
        btnVoz.textContent = '🔴';
        btnVoz.style.background = '#d32f2f';
        btnVoz.style.boxShadow = '0 0 20px rgba(211, 47, 47, 0.5)';
        indicadorVoz.style.display = 'block';
        document.getElementById('buscar').placeholder = '🎤 Escuchando...';
    });

    reconocimiento.addEventListener('end', function() {
        if (escuchando) {
            escuchando = false;
            btnVoz.textContent = '🎤';
            btnVoz.style.background = '#0d47a1';
            btnVoz.style.boxShadow = 'none';
            indicadorVoz.style.display = 'none';
            document.getElementById('buscar').placeholder = 'Buscar himno o coro...';
        }
    });

    reconocimiento.addEventListener('error', function(event) {
        escuchando = false;
        btnVoz.textContent = '🎤';
        btnVoz.style.background = '#0d47a1';
        btnVoz.style.boxShadow = 'none';
        indicadorVoz.style.display = 'none';
        document.getElementById('buscar').placeholder = 'Buscar himno o coro...';
        
        if (event.error === 'not-allowed') {
            mostrarToast('⚠️ Permiso de micrófono denegado');
        } else if (event.error === 'no-speech') {
            mostrarToast('🎤 No se detectó voz, intenta de nuevo');
        }
    });

    btnVoz.addEventListener('click', function() {
        if (escuchando) {
            reconocimiento.stop();
        } else {
            try {
                reconocimiento.start();
            } catch (e) {
                reconocimiento.stop();
                setTimeout(() => {
                    reconocimiento.start();
                }, 300);
            }
        }
    });

} else {
    btnVoz.style.display = 'none';
    console.log('⚠️ El navegador no soporta reconocimiento de voz');
}


// ==========================
// INICIAR
// ==========================
// ==========================
// CABECERA DE HIMNO FIJA - VERSIÓN MEJORADA
// ==========================

// ==========================
// CABECERA DE HIMNO FIJA - VERSIÓN SIMPLIFICADA
// ==========================

// ==========================
// CABECERA DE HIMNO FIJA - VERSIÓN DEFINITIVA
// ==========================

// ==========================
// CABECERA DE HIMNO FIJA - CON MEDIA QUERIES EN JS
// ==========================

function hacerCabeceraFija() {
    // Eliminar cabeceras fijas anteriores
    document.querySelectorAll('.fixed-header-clone').forEach(el => el.remove());
    
    const cards = document.querySelectorAll('.card');
    
    // Obtener altura del topbar
    const topbar = document.querySelector('.topbar');
    const topbarHeight = topbar ? topbar.offsetHeight : 280;
    
    // 🔥 OBTENER TAMAÑO DE PANTALLA
    const screenWidth = window.innerWidth;
    
    // 🔥 CONFIGURACIÓN SEGÚN TAMAÑO (como media queries)
    let config = {};
    
    if (screenWidth <= 380) {
        // Móvil muy pequeño
        config = {
            fontSize: '12px',
            padding: '6px 8px',
            numeroPadding: '2px 6px',
            tituloMaxWidth: '45vw',
            minHeight: '36px'
        };
    } else if (screenWidth <= 480) {
        // Móvil pequeño
        config = {
            fontSize: '13px',
            padding: '8px 10px',
            numeroPadding: '2px 8px',
            tituloMaxWidth: '50vw',
            minHeight: '40px'
        };
    } else if (screenWidth <= 600) {
        // Móvil mediano
        config = {
            fontSize: '14px',
            padding: '10px 12px',
            numeroPadding: '2px 10px',
            tituloMaxWidth: '55vw',
            minHeight: '44px'
        };
    } else if (screenWidth <= 768) {
        // Tablet pequeña
        config = {
            fontSize: '15px',
            padding: '10px 14px',
            numeroPadding: '3px 10px',
            tituloMaxWidth: '60vw',
            minHeight: '48px'
        };
    } else if (screenWidth <= 1024) {
        // Tablet grande
        config = {
            fontSize: '16px',
            padding: '12px 16px',
            numeroPadding: '3px 12px',
            tituloMaxWidth: '70vw',
            minHeight: '52px'
        };
    } else {
        // PC / Escritorio
        config = {
            fontSize: '18px',
            padding: '12px 20px',
            numeroPadding: '4px 14px',
            tituloMaxWidth: '80vw',
            minHeight: '56px'
        };
    }
    
    // 🔥 GUARDAR LA CONFIGURACIÓN GLOBAL
    window.configActual = config;
    
    cards.forEach((card) => {
        const cabecera = card.querySelector('.cabecera-himno');
        const letra = card.querySelector('.letra');
        
        if (!cabecera || !letra) return;
        
        // Crear copia de la cabecera
        const clone = cabecera.cloneNode(true);
        clone.className = 'fixed-header-clone';
        
        // 🔥 APLICAR ESTILOS SEGÚN TAMAÑO
        clone.style.cssText = `
            position: fixed;
            top: ${topbarHeight}px;
            left: 0;
            right: 0;
            z-index: 1000;
            background: linear-gradient(135deg, #f8faff, #eef4fb);
            backdrop-filter: blur(10px);
            border-bottom: 2px solid rgba(13, 71, 161, 0.1);
            padding: ${config.padding};
            display: none;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            box-sizing: border-box;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            min-height: ${config.minHeight};
        `;
        
        // Ocultar acciones
        const acciones = clone.querySelector('.acciones');
        if (acciones) acciones.style.display = 'none';
        
        // 🔥 AJUSTAR TEXTO SEGÚN TAMAÑO
        const numero = clone.querySelector('.numero');
        const titulo = clone.querySelector('.titulo');
        const contenido = clone.querySelector('div');
        
        if (contenido) {
            contenido.style.display = 'flex';
            contenido.style.alignItems = 'center';
            contenido.style.gap = '6px';
            contenido.style.minWidth = '0';
            contenido.style.flex = '1';
            contenido.style.overflow = 'hidden';
            contenido.style.maxWidth = '100%';
        }
        
        if (numero) {
            numero.style.fontSize = config.fontSize;
            numero.style.padding = config.numeroPadding;
            numero.style.whiteSpace = 'nowrap';
            numero.style.flexShrink = '0';
        }
        
        if (titulo) {
            titulo.style.fontSize = config.fontSize;
            titulo.style.whiteSpace = 'nowrap';
            titulo.style.overflow = 'hidden';
            titulo.style.textOverflow = 'ellipsis';
            titulo.style.maxWidth = config.tituloMaxWidth;
            titulo.style.margin = '0';
            titulo.style.flex = '1';
        }
        
        document.body.appendChild(clone);
        
        // Variable para controlar el estado
        let isVisible = false;
        
        // Función de verificación
        function verificarScroll() {
            const rect = card.getBoundingClientRect();
            const cardTop = rect.top;
            const cardBottom = rect.bottom;
            
            const shouldShow = cardTop < topbarHeight && cardBottom > topbarHeight;
            
            if (shouldShow) {
                if (!isVisible) {
                    clone.style.display = 'flex';
                    cabecera.style.visibility = 'hidden';
                    isVisible = true;
                }
            } else {
                if (isVisible) {
                    clone.style.display = 'none';
                    cabecera.style.visibility = 'visible';
                    isVisible = false;
                }
            }
        }
        
        // Throttle para mejorar rendimiento
        let ticking = false;
        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    verificarScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        // Escuchar eventos
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', function() {
            // Recalcular altura y configuración
            const newTopbarHeight = topbar ? topbar.offsetHeight : 280;
            const newScreenWidth = window.innerWidth;
            
            // 🔥 ACTUALIZAR CONFIGURACIÓN SI CAMBIÓ EL TAMAÑO
            let newConfig = config;
            if (newScreenWidth <= 380) {
                newConfig = {
                    fontSize: '12px',
                    padding: '6px 8px',
                    numeroPadding: '2px 6px',
                    tituloMaxWidth: '45vw',
                    minHeight: '36px'
                };
            } else if (newScreenWidth <= 480) {
                newConfig = {
                    fontSize: '13px',
                    padding: '8px 10px',
                    numeroPadding: '2px 8px',
                    tituloMaxWidth: '50vw',
                    minHeight: '40px'
                };
            } else if (newScreenWidth <= 600) {
                newConfig = {
                    fontSize: '14px',
                    padding: '10px 12px',
                    numeroPadding: '2px 10px',
                    tituloMaxWidth: '55vw',
                    minHeight: '44px'
                };
            } else if (newScreenWidth <= 768) {
                newConfig = {
                    fontSize: '15px',
                    padding: '10px 14px',
                    numeroPadding: '3px 10px',
                    tituloMaxWidth: '60vw',
                    minHeight: '48px'
                };
            } else if (newScreenWidth <= 1024) {
                newConfig = {
                    fontSize: '16px',
                    padding: '12px 16px',
                    numeroPadding: '3px 12px',
                    tituloMaxWidth: '70vw',
                    minHeight: '52px'
                };
            } else {
                newConfig = {
                    fontSize: '18px',
                    padding: '12px 20px',
                    numeroPadding: '4px 14px',
                    tituloMaxWidth: '80vw',
                    minHeight: '56px'
                };
            }
            
            // Aplicar nueva configuración
            clone.style.top = newTopbarHeight + 'px';
            clone.style.padding = newConfig.padding;
            clone.style.minHeight = newConfig.minHeight;
            
            if (numero) {
                numero.style.fontSize = newConfig.fontSize;
                numero.style.padding = newConfig.numeroPadding;
            }
            if (titulo) {
                titulo.style.fontSize = newConfig.fontSize;
                titulo.style.maxWidth = newConfig.tituloMaxWidth;
            }
            
            verificarScroll();
        });
        
        // Verificar al hacer scroll en la letra
        letra.addEventListener('scroll', function() {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(verificarScroll, 100);
        });
        
        // Verificar inicialmente
        setTimeout(verificarScroll, 300);
    });
}

// Ejecutar al cargar
setTimeout(hacerCabeceraFija, 500);

// Recalcular al cambiar orientación
window.addEventListener('orientationchange', function() {
    setTimeout(function() {
        document.querySelectorAll('.fixed-header-clone').forEach(el => el.remove());
        setTimeout(hacerCabeceraFija, 400);
    }, 600);
});

// Observar cambios en la lista
const listaElement = document.getElementById('lista');
if (listaElement) {
    const observerLista = new MutationObserver(function() {
        setTimeout(hacerCabeceraFija, 300);
    });
    observerLista.observe(listaElement, { childList: true, subtree: true });
}
cargarHimnos();

// ==========================
// FIN
// ==========================