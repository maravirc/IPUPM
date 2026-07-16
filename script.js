// ==========================
// HIMNARIO IPU MOYOBAMBA
// script.js - VERSIÓN COMPLETA
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
// BOTÓN ACTIVO - MANTENER COLOR AZUL VERDOSO
// ==========================

function activarBoton(tipo) {
    document.querySelectorAll('.menu button').forEach(btn => {
        btn.classList.remove('activo');
    });
    
    if (tipo === 'himnos') {
        const btn = document.getElementById('btnHimnos');
        if (btn) btn.classList.add('activo');
    } else if (tipo === 'coros') {
        const btn = document.getElementById('btnCoros');
        if (btn) btn.classList.add('activo');
    } else if (tipo === 'favoritos') {
        const btn = document.getElementById('btnFavoritos');
        if (btn) btn.classList.add('activo');
    }
}

function restaurarBotonActivo() {
    if (tipoActual === 'himnos') {
        activarBoton('himnos');
    } else if (tipoActual === 'coros') {
        activarBoton('coros');
    } else if (tipoActual === 'favoritos') {
        activarBoton('favoritos');
    }
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
        
        setTimeout(() => activarBoton('himnos'), 100);
        
    } catch (error) {
        console.error('❌ Error al cargar:', error);
        lista.innerHTML = "<h2>⚠️ No se pudieron cargar los himnos.</h2><p>Verifica tu conexión a internet.</p>";
    }
}

// ==========================
// MOSTRAR HIMNOS
// ==========================

function mostrarHimnos(datos) {
    datosActuales = datos;
    
    if (!datos || datos.length === 0) {
        lista.innerHTML = `<div class="sin-resultados">
            <h3>📭 No hay elementos</h3>
            <p>No se encontraron himnos o coros.</p>
        </div>`;
        return;
    }
    
    let datosMostrar;
    let mostrarBoton = false;
    
    if (datos.length > MAX_INICIAL && !mostrandoTodos) {
        datosMostrar = datos.slice(0, MAX_INICIAL);
        mostrarBoton = true;
    } else {
        datosMostrar = datos;
        mostrarBoton = false;
    }
    
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
                    <button onclick="compartirApp()" class="btn-compartir-app">📱 Compartir App</button>
                </div>
            </div>
        `;
    }
    
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
                ">
                    📖 Ver más (${restantes} restantes)
                </button>
            </div>
        `;
    }
    
    lista.innerHTML = html;
    
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
    
    setTimeout(restaurarBotonActivo, 50);
}

// ==========================
// BOTONES DE NAVEGACIÓN
// ==========================

document.getElementById("btnCoros").addEventListener("click", () => {
    if (datosCorosCache.length > 0) {
        tipoActual = 'coros';
        datosActuales = datosCorosCache;
        resetearPaginacion();
        mostrarHimnos(datosCorosCache);
        actualizarTitulo('coros', datosCorosCache.length);
        buscar.value = '';
        activarBoton('coros');
    } else {
        lista.innerHTML = "<h2>⚠️ No se pudieron cargar los coros.</h2>";
    }
});

document.getElementById("btnHimnos").addEventListener("click", () => {
    if (datosHimnosCache.length > 0) {
        tipoActual = 'himnos';
        datosActuales = datosHimnosCache;
        resetearPaginacion();
        mostrarHimnos(datosHimnosCache);
        actualizarTitulo('himnos', datosHimnosCache.length);
        buscar.value = '';
        activarBoton('himnos');
    }
});

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
    activarBoton('favoritos');
    
    if (listaFavoritos.length === 0) {
        lista.innerHTML = `<div class="sin-resultados">
            <h3>⭐ Sin favoritos</h3>
            <p>Agrega himnos o coros a tus favoritos presionando el corazón ❤️</p>
        </div>`;
    }
});

// ==========================
// BUSCAR
// ==========================

let timeoutBusqueda;

function quitarAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function limpiarTexto(texto) {
    return quitarAcentos(texto)
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

buscar.addEventListener("input", function() {
    clearTimeout(timeoutBusqueda);
    
    const textoOriginal = this.value.trim();
    
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
        setTimeout(restaurarBotonActivo, 50);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    
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
    
    const textoBusqueda = limpiarTexto(textoOriginal);
    
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
        setTimeout(restaurarBotonActivo, 50);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    
    let resultado;
    if (/^\d+$/.test(textoBusqueda)) {
        resultado = datosABuscar.filter(h => 
            h.numero.toString() === textoBusqueda
        );
    } else {
        resultado = datosABuscar.filter(h => {
            const tituloLimpio = limpiarTexto(h.titulo);
            const palabras = textoBusqueda.split(' ');
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
    
    setTimeout(restaurarBotonActivo, 50);
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// ==========================
// FAVORITOS
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
    tarjetas.forEach(card => {
        if (card.dataset.numero == numero) {
            card.requestFullscreen();
        }
    });
}

function salirPantallaCompleta(event) {
    event.stopPropagation();
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

// ==========================
// COMPARTIR APP
// ==========================

function compartirApp() {
    const url = window.location.href;
    const mensaje = '📖 Himnario IPUP Moyobamba\n\n📲 INSTALACIÓN:\n1. Abre este enlace en Chrome o Safari\n2. Presiona "Instalar App"\n3. ¡Listo!\n\n🔗 ' + url;
    
    if (navigator.share) {
        navigator.share({
            title: '📖 Himnario IPUP Moyobamba',
            text: mensaje,
            url: url
        }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(mensaje).then(() => {
            mostrarToast('✅ Enlace copiado');
        });
    } else {
        alert(mensaje);
    }
}

// ==========================
// TOAST
// ==========================

function mostrarToast(mensaje) {
    const toastExistente = document.querySelector('.toast-notification');
    if (toastExistente) toastExistente.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
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
    eventoInstalacion = null;
    btnInstalar.style.display = "none";
});

// ==========================
// CABECERA FIJA
// ==========================

let cabeceraFijaElement = null;
let timeoutCabecera = null;

function crearCabeceraFija() {
    if (cabeceraFijaElement) return;
    
    const topbar = document.querySelector('.topbar');
    const topbarHeight = topbar ? topbar.offsetHeight : 280;
    
    cabeceraFijaElement = document.createElement('div');
    cabeceraFijaElement.id = 'cabeceraFijaUnica';
    cabeceraFijaElement.style.cssText = `
        position: fixed;
        top: ${topbarHeight}px;
        left: 0;
        right: 0;
        z-index: 1000;
        background: linear-gradient(135deg, #f8faff, #eef4fb);
        backdrop-filter: blur(10px);
        border-bottom: 2px solid rgba(13, 71, 161, 0.1);
        padding: 12px 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        box-sizing: border-box;
        display: none;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-height: 50px;
    `;
    
    document.body.appendChild(cabeceraFijaElement);
}

function actualizarCabeceraFija() {
    if (!cabeceraFijaElement) return;
    
    // 🔥 SI HAY MENSAJE DE "SIN RESULTADOS", OCULTAR CABECERA
    const sinResultados = document.querySelector('.sin-resultados');
    if (sinResultados) {
        cabeceraFijaElement.style.display = 'none';
        return;
    }
    
    const cards = document.querySelectorAll('.card');
    let cardActiva = null;
    
    for (const card of cards) {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 50) {
            cardActiva = card;
            break;
        }
    }
    
    if (cardActiva) {
        const numero = cardActiva.dataset.numero;
        const himno = datosActuales.find(h => h.numero == numero);
        
        if (himno) {
            const icono = himno.tipo === 'coro' ? '🎵' : '📖';
            const tipoTexto = himno.tipo === 'coro' ? 'Adoración y Alabanza' : 'Himno';
            const isMobile = window.innerWidth <= 600;
            
            cabeceraFijaElement.innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;flex:1;overflow:hidden;min-width:0;">
                    <span style="font-size:${isMobile ? '14px' : '18px'};padding:${isMobile ? '2px 10px' : '4px 14px'};white-space:nowrap;flex-shrink:0;color:#0d47a1;font-weight:700;background:white;border-radius:30px;box-shadow:0 2px 8px rgba(13,71,161,0.08);">
                        ${icono} ${tipoTexto} ${himno.numero}
                    </span>
                    <span style="font-size:${isMobile ? '14px' : '18px'};font-weight:800;color:#0a1a2e;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:${isMobile ? '50vw' : '70vw'};flex:1;min-width:0;">
                        ${himno.titulo}
                    </span>
                </div>
            `;
            cabeceraFijaElement.style.display = 'flex';
        }
    } else {
        cabeceraFijaElement.style.display = 'none';
    }
}

function manejarScrollCabecera() {
    clearTimeout(timeoutCabecera);
    timeoutCabecera = setTimeout(actualizarCabeceraFija, 80);
}

function iniciarCabeceraFija() {
    crearCabeceraFija();
    
    window.addEventListener('scroll', manejarScrollCabecera);
    window.addEventListener('resize', function() {
        const topbar = document.querySelector('.topbar');
        if (cabeceraFijaElement && topbar) {
            cabeceraFijaElement.style.top = topbar.offsetHeight + 'px';
        }
        actualizarCabeceraFija();
    });
    
    const listaElement = document.getElementById('lista');
    if (listaElement) {
        const observer = new MutationObserver(() => {
            setTimeout(actualizarCabeceraFija, 200);
        });
        observer.observe(listaElement, { childList: true, subtree: true });
    }
    
    document.querySelectorAll('.menu button').forEach(btn => {
        btn.addEventListener('click', function() {
            setTimeout(actualizarCabeceraFija, 300);
        });
    });
    
    document.getElementById('buscar').addEventListener('input', function() {
        setTimeout(actualizarCabeceraFija, 200);
    });
    
    setTimeout(actualizarCabeceraFija, 500);
}

// ==========================
// BÚSQUEDA POR VOZ
// ==========================

const btnVoz = document.getElementById('btnVoz');
const indicadorVoz = document.getElementById('indicadorVoz');
let reconocimiento = null;
let escuchando = false;

function detenerReconocimiento() {
    escuchando = false;
    if (reconocimiento) {
        try { reconocimiento.abort(); } catch (e) {}
    }
    if (btnVoz) {
        btnVoz.textContent = '🎤';
        btnVoz.style.background = '#0d47a1';
        btnVoz.style.boxShadow = 'none';
    }
    if (indicadorVoz) {
        indicadorVoz.style.display = 'none';
    }
    if (document.getElementById('buscar')) {
        document.getElementById('buscar').placeholder = 'Buscar himno o coro...';
    }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition && btnVoz) {
    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-ES';
    reconocimiento.continuous = false;
    reconocimiento.interimResults = true;

    reconocimiento.addEventListener('result', function(event) {
        if (!escuchando) return;
        const transcript = event.results[0][0].transcript;
        const esFinal = event.results[0].isFinal;
        document.getElementById('buscar').value = transcript;
        if (esFinal) {
            detenerReconocimiento();
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

    reconocimiento.addEventListener('end', detenerReconocimiento);

    reconocimiento.addEventListener('error', function(event) {
        detenerReconocimiento();
        if (event.error === 'not-allowed') {
            mostrarToast('⚠️ Permiso de micrófono denegado');
        } else if (event.error === 'no-speech') {
            mostrarToast('🎤 No se detectó voz, intenta de nuevo');
        }
    });

    btnVoz.addEventListener('click', function() {
        if (escuchando) {
            detenerReconocimiento();
        } else {
            try {
                reconocimiento.start();
            } catch (e) {
                try { reconocimiento.abort(); } catch (err) {}
                setTimeout(() => {
                    try { reconocimiento.start(); } catch (err) {}
                }, 300);
            }
        }
    });
} else if (btnVoz) {
    btnVoz.style.display = 'none';
}

// ==========================
// INICIAR
// ==========================

cargarHimnos();
setTimeout(iniciarCabeceraFija, 300);

// ==========================
// FIN
// ==========================
// =================================
// VERIFICAR NUEVA VERSION
// =================================


let versionInstalada =
localStorage.getItem("versionApp") || "v0";


async function comprobarVersion(){


try{


const respuesta =
await fetch("version.json?"+Date.now());


const datos =
await respuesta.json();


const versionNueva =
datos.version;



console.log(
"Actual:",
versionInstalada,
"Nueva:",
versionNueva
);



if(versionInstalada !== versionNueva){


const banner =
document.getElementById("updateBanner");


if(banner){


banner.querySelector(".versiones").innerHTML =
`
Versión actual: ${versionInstalada}<br>
Nueva versión: ${versionNueva}
`;

banner.dataset.version = versionNueva;


banner.classList.add("mostrar");


}


}



}catch(error){

console.log(
"No se pudo comprobar versión",
error
);

}

}

document.addEventListener(
"click",
function(e){


if(e.target.id==="btnActualizarApp"){


const banner =
document.getElementById("updateBanner");


localStorage.setItem(
"versionApp",
banner.dataset.version
);


location.reload();


}


});


comprobarVersion();