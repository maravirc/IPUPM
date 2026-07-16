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
// BOTÓN ACTIVO - MANTENER COLOR AZUL VERDOSO
// ==========================

function activarBoton(tipo) {
    // Quitar clase 'activo' de todos los botones
    document.querySelectorAll('.menu button').forEach(btn => {
        btn.classList.remove('activo');
    });
    
    // Agregar clase 'activo' al botón correspondiente
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
        
        // Activar botón Himnos por defecto
        setTimeout(() => activarBoton('himnos'), 100);
        
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
    
    // Restaurar el botón activo después de renderizar
    setTimeout(restaurarBotonActivo, 50);
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
        activarBoton('coros');
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
        activarBoton('himnos');
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
    activarBoton('favoritos');
    
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
// 🔥 BUSCADOR EN TIEMPO REAL
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
        // Restaurar botón activo después de limpiar búsqueda
        setTimeout(restaurarBotonActivo, 50);
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
        setTimeout(restaurarBotonActivo, 50);
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
        
        // Mostrar cabecera fija
        const cabecera = document.getElementById('cabeceraFija');
        if (cabecera) cabecera.style.display = 'flex';
        
    } else {
        // 🔥 ACTUALIZAR CONTADOR A 0
        const icono = tipoActual === 'himnos' ? '📖' : tipoActual === 'coros' ? '🎵' : '⭐';
        const texto = tipoActual === 'himnos' ? 'Himnos' : tipoActual === 'coros' ? 'Adoración y Alabanzas' : 'Favoritos';
        tituloSeccion.innerHTML = `<h2>${icono} ${texto} <span class="contador">(0)</span></h2>`;
        
        // Mostrar mensaje
        lista.innerHTML = `<div class="sin-resultados">
            <h3>🔍 No se encontraron resultados</h3>
            <p>Intenta con otra palabra o número</p>
        </div>`;
        
        // Ocultar cabecera fija
        const cabecera = document.getElementById('cabeceraFija');
        if (cabecera) cabecera.style.display = 'none';
    }
    
    // Restaurar botón activo después de buscar
    setTimeout(restaurarBotonActivo, 50);
    
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
        mensaje = '📖 Himnario IPUP Moyobamba\n\n✅ IPUP-Moyobamba.\n\n📤 Instala la app desde este enlace:';
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

// Detener reconocimiento y restaurar la interfaz
function detenerReconocimiento() {
    escuchando = false;

    if (reconocimiento) {
        try {
            reconocimiento.abort(); // Cancela inmediatamente
        } catch (e) {}
    }

    btnVoz.textContent = '🎙️';
    btnVoz.style.background = '#0d47a1';
    btnVoz.style.boxShadow = 'none';
    indicadorVoz.style.display = 'none';
    document.getElementById('buscar').placeholder = 'Buscar himno o coro...';
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-ES';
    reconocimiento.continuous = false;
    reconocimiento.interimResults = true;
    reconocimiento.maxAlternatives = 1;

    reconocimiento.addEventListener('result', function(event) {

        // Ignora resultados si ya fue detenido
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

    reconocimiento.addEventListener('end', function() {
        detenerReconocimiento();
    });

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
                try {
                    reconocimiento.abort();
                } catch (err) {}

                setTimeout(() => {
                    try {
                        reconocimiento.start();
                    } catch (err) {}
                }, 300);
            }
        }
    });

} else {
    btnVoz.style.display = 'none';
    console.log('⚠️ El navegador no soporta reconocimiento de voz');
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
// INICIAR
// ==========================
// // CABECERA FIJA - VERSIÓN CORREGIDA
// // ==========================

// let cabeceraFija = null;
// let timeoutCabecera = null;

// function crearCabeceraFija() {
//     if (cabeceraFija) return;
    
//     const topbar = document.querySelector('.topbar');
//     const topbarHeight = topbar ? topbar.offsetHeight : 280;
    
//     cabeceraFija = document.createElement('div');
//     cabeceraFija.id = 'cabeceraFija';
//     cabeceraFija.style.cssText = `
//         position: fixed;
//         top: ${topbarHeight}px;
//         left: 0;
//         right: 0;
//         z-index: 999;
//         background: linear-gradient(135deg, #f8faff, #eef4fb);
//         backdrop-filter: blur(10px);
//         padding: 12px 16px;
//         border-bottom: 2px solid rgba(13, 71, 161, 0.1);
//         box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
//         display: none;
//         transition: all 0.3s ease;
//         box-sizing: border-box;
//         align-items: center;
//         justify-content: space-between;
//         width: 100%;
//         min-height: 50px;
//     `;
    
//     cabeceraFija.innerHTML = `
//         <div style="display:flex;align-items:center;gap:8px;flex:1;overflow:hidden;min-width:0;">
//             <span id="cabeceraNumeroFijo" style="
//                 font-size:${window.innerWidth <= 600 ? '14px' : '18px'};
//                 padding:${window.innerWidth <= 600 ? '2px 10px' : '4px 14px'};
//                 white-space:nowrap;
//                 flex-shrink:0;
//                 color:#0d47a1;
//                 font-weight:700;
//                 background:white;
//                 border-radius:30px;
//                 box-shadow:0 2px 8px rgba(13,71,161,0.08);
//             ">📖 Himno 1</span>
//             <span id="cabeceraTituloFijo" style="
//                 font-size:${window.innerWidth <= 600 ? '14px' : '18px'};
//                 font-weight:800;
//                 color:#0a1a2e;
//                 margin:0;
//                 white-space:nowrap;
//                 overflow:hidden;
//                 text-overflow:ellipsis;
//                 max-width:${window.innerWidth <= 600 ? '50vw' : '70vw'};
//                 flex:1;
//                 min-width:0;
//             ">El aposento alto</span>
//         </div>
//         <button id="btnCerrarCabeceraFija" style="
//             background: none;
//             border: none;
//             font-size: 20px;
//             cursor: pointer;
//             color: #999;
//             padding: 5px 10px;
//             border-radius: 50%;
//             transition: all 0.3s ease;
//             flex-shrink:0;
//         ">✕</button>
//     `;
    
//     document.body.appendChild(cabeceraFija);
    
//     document.getElementById('btnCerrarCabeceraFija').addEventListener('click', function(e) {
//         e.stopPropagation();
//         cabeceraFija.style.display = 'none';
//     });
// }

// function actualizarCabeceraFija() {
//     if (!cabeceraFija) return;
    
//     // 🔥 OCULTAR SI HAY MENSAJE DE "SIN RESULTADOS"
//     const sinResultados = document.querySelector('.sin-resultados');
//     if (sinResultados) {
//         cabeceraFija.style.display = 'none';
//         return;
//     }
    
//     const cards = document.querySelectorAll('.card');
//     if (!cards.length) {
//         cabeceraFija.style.display = 'none';
//         return;
//     }
    
//     // Buscar la tarjeta más visible
//     let cardVisible = null;
//     let maxArea = 0;
//     const windowHeight = window.innerHeight;
    
//     cards.forEach(card => {
//         const rect = card.getBoundingClientRect();
//         const visibleTop = Math.max(0, rect.top);
//         const visibleBottom = Math.min(windowHeight, rect.bottom);
//         const visibleHeight = Math.max(0, visibleBottom - visibleTop);
//         const area = visibleHeight * rect.width;
        
//         if (area > maxArea && visibleHeight > 20) {
//             maxArea = area;
//             cardVisible = card;
//         }
//     });
    
//     if (!cardVisible) {
//         cardVisible = cards[0];
//     }
    
//     const numero = cardVisible.querySelector('.numero');
//     const titulo = cardVisible.querySelector('.titulo');
    
//     if (numero && titulo) {
//         const numeroFijo = document.getElementById('cabeceraNumeroFijo');
//         const tituloFijo = document.getElementById('cabeceraTituloFijo');
        
//         if (numeroFijo) numeroFijo.textContent = numero.textContent;
//         if (tituloFijo) tituloFijo.textContent = titulo.textContent;
        
//         cabeceraFija.style.display = 'flex';
//     }
// }

// function manejarScrollCabecera() {
//     clearTimeout(timeoutCabecera);
//     timeoutCabecera = setTimeout(actualizarCabeceraFija, 80);
// }

// function iniciarCabeceraFija() {
//     crearCabeceraFija();
    
//     window.addEventListener('scroll', manejarScrollCabecera);
//     window.addEventListener('resize', function() {
//         const topbar = document.querySelector('.topbar');
//         if (cabeceraFija && topbar) {
//             cabeceraFija.style.top = topbar.offsetHeight + 'px';
//         }
//         actualizarCabeceraFija();
//     });
    
//     // Observar cambios en la lista
//     const listaElement = document.getElementById('lista');
//     if (listaElement) {
//         const observer = new MutationObserver(() => {
//             setTimeout(actualizarCabeceraFija, 200);
//         });
//         observer.observe(listaElement, { childList: true, subtree: true });
//     }
    
//     // Actualizar al buscar
//     document.getElementById('buscar').addEventListener('input', function() {
//         setTimeout(actualizarCabeceraFija, 200);
//     });
    
//     setTimeout(actualizarCabeceraFija, 500);
// }

// // Iniciar después de cargar
// setTimeout(iniciarCabeceraFija, 800);
// ==========================
// DETECTAR CUANDO LA CABECERA ESTÁ PEGADA
// ==========================

function detectarCabecerasPegajosas() {
    document.querySelectorAll('.card .cabecera-himno').forEach(cabecera => {
        const card = cabecera.closest('.card');
        if (!card) return;
        
        const rect = card.getBoundingClientRect();
        const cabeceraRect = cabecera.getBoundingClientRect();
        
        // Si la cabecera está pegada al borde superior de la tarjeta
        if (cabeceraRect.top <= rect.top + 5) {
            cabecera.classList.add('sticky-active');
        } else {
            cabecera.classList.remove('sticky-active');
        }
    });
}

// Ejecutar al hacer scroll
document.addEventListener('scroll', function() {
    detectarCabecerasPegajosas();
}, { passive: true });

// Ejecutar después de cargar
setTimeout(detectarCabecerasPegajosas, 500);

// Ejecutar después de renderizar himnos
function inicializarCabecerasSticky() {
    setTimeout(detectarCabecerasPegajosas, 200);
}

// Modificar mostrarHimnos para inicializar
const mostrarHimnosOriginal2 = window.mostrarHimnos;
window.mostrarHimnos = function(datos) {
    mostrarHimnosOriginal2(datos);
    setTimeout(inicializarCabecerasSticky, 300);
};
cargarHimnos();

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
