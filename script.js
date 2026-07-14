// ==========================
// HIMNARIO IPU MOYOBAMBA
// script.js - VERSIÓN CON CABECERA FIJA
// ==========================

let himnos = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

// Cache de datos
let datosHimnosCache = [];
let datosCorosCache = [];
let datosActuales = [];
let tipoActual = 'himnos';

// Variables de paginación
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
    const iconos = { 'himnos': '📖', 'coros': '🎵', 'favoritos': '⭐' };
    const textos = { 'himnos': 'Himnos', 'coros': 'Adoración y Alabanzas', 'favoritos': 'Favoritos' };
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
// CARGAR HIMNOS
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
// MOSTRAR HIMNOS - CON CABECERA FIJA
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
        const idUnico = `himno-${himno.numero}-${Date.now()}-${i}`;
        
        html += `
            <div class="card" data-numero="${himno.numero}" id="${idUnico}">
                <div class="cabecera-himno" id="cabecera-${idUnico}">
                    <div>
                        <div class="numero">${icono} ${tipoTexto} ${himno.numero}</div>
                        <div class="titulo">${himno.titulo}</div>
                    </div>
                    <div class="acciones">
                        <button class="btnPantalla" onclick="pantallaCompleta(${himno.numero})">⛶</button>
                        <button class="btnSalir" onclick="salirPantallaCompleta(event)">✕</button>
                    </div>
                </div>
                <div class="letra" id="letra-${idUnico}">${himno.letra}</div>
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
    
    // Aplicar cabecera fija a cada tarjeta
    aplicarCabeceraFija();
    
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
// APLICAR CABECERA FIJA A CADA TARJETA
// ==========================

function aplicarCabeceraFija() {
    const cards = document.querySelectorAll('.card');
    const topbarHeight = document.querySelector('.topbar')?.offsetHeight || 280;
    
    cards.forEach(card => {
        const cabecera = card.querySelector('.cabecera-himno');
        const letra = card.querySelector('.letra');
        
        if (!cabecera || !letra) return;
        
        // Crear una copia fija de la cabecera
        const clone = cabecera.cloneNode(true);
        clone.className = 'cabecera-fija-clone';
        clone.style.cssText = `
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
        
        // Ocultar acciones en la copia
        const acciones = clone.querySelector('.acciones');
        if (acciones) acciones.style.display = 'none';
        
        // Ajustar tamaño para móvil
        const isMobile = window.innerWidth <= 600;
        const numero = clone.querySelector('.numero');
        const titulo = clone.querySelector('.titulo');
        
        if (numero) {
            numero.style.fontSize = isMobile ? '14px' : '18px';
            numero.style.padding = isMobile ? '2px 10px' : '4px 14px';
        }
        if (titulo) {
            titulo.style.fontSize = isMobile ? '14px' : '18px';
            titulo.style.maxWidth = isMobile ? '50vw' : '70vw';
            titulo.style.whiteSpace = 'nowrap';
            titulo.style.overflow = 'hidden';
            titulo.style.textOverflow = 'ellipsis';
        }
        
        document.body.appendChild(clone);
        
        // Función para verificar scroll
        let isVisible = false;
        
        function verificarScroll() {
            const rect = card.getBoundingClientRect();
            const shouldShow = rect.top < topbarHeight && rect.bottom > topbarHeight + 30;
            
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
            const newTop = document.querySelector('.topbar')?.offsetHeight || 280;
            clone.style.top = newTop + 'px';
            verificarScroll();
        });
        
        // Verificar al hacer scroll en la letra
        letra.addEventListener('scroll', function() {
            clearTimeout(this._timeout);
            this._timeout = setTimeout(verificarScroll, 100);
        });
        
        // Verificar inicialmente
        setTimeout(verificarScroll, 200);
    });
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
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    
    timeoutBusqueda = setTimeout(() => {
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
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        
        let resultado;
        if (/^\d+$/.test(textoBusqueda)) {
            resultado = datosABuscar.filter(h => 
                h.numero.toString().includes(textoBusqueda)
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
        
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, 300);
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
// COMPARTIR APP
// ==========================

function compartirApp() {
    const url = window.location.href;
    const titulo = '📖 Himnario IPUP Moyobamba';
    const mensaje = '📖 Himnario IPUP Moyobamba\n\n📲 INSTALACIÓN:\n1. Abre este enlace en Chrome o Safari\n2. Presiona el botón "Instalar App" o "Agregar a pantalla de inicio"\n3. ¡Listo! Tendrás el himnario siempre disponible\n\n🔗 Enlace: ' + url;
    
    if (navigator.share) {
        navigator.share({
            title: titulo,
            text: mensaje,
            url: url
        }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(mensaje).then(() => {
            mostrarToast('✅ Enlace copiado al portapapeles');
        }).catch(() => {
            alert(mensaje);
        });
    } else {
        alert(mensaje);
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
// BÚSQUEDA POR VOZ
// ==========================

const btnVoz = document.getElementById('btnVoz');
let reconocimiento = null;
let escuchando = false;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    reconocimiento = new SpeechRecognition();
    reconocimiento.lang = 'es-ES';
    reconocimiento.continuous = false;
    reconocimiento.interimResults = true;

    reconocimiento.addEventListener('result', function(event) {
        const transcript = event.results[0][0].transcript;
        if (event.results[0].isFinal) {
            document.getElementById('buscar').value = transcript;
            escuchando = false;
            btnVoz.textContent = '🎤';
            btnVoz.style.background = '#0d47a1';
            const evento = new Event('input');
            document.getElementById('buscar').dispatchEvent(evento);
        }
    });

    reconocimiento.addEventListener('start', function() {
        escuchando = true;
        btnVoz.textContent = '🔴';
        btnVoz.style.background = '#d32f2f';
    });

    reconocimiento.addEventListener('end', function() {
        if (escuchando) {
            escuchando = false;
            btnVoz.textContent = '🎤';
            btnVoz.style.background = '#0d47a1';
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
}

// ==========================
// TOAST
// ==========================

function mostrarToast(mensaje) {
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
// ==========================
// CABECERA FIJA ÚNICA
// ==========================

let cabeceraFijaGlobal = null;

function crearCabeceraFija() {
    // Eliminar cabecera fija anterior si existe
    if (cabeceraFijaGlobal) {
        cabeceraFijaGlobal.remove();
        cabeceraFijaGlobal = null;
    }
    
    // Obtener altura del topbar
    const topbar = document.querySelector('.topbar');
    const topbarHeight = topbar ? topbar.offsetHeight : 280;
    
    // Crear la cabecera fija
    cabeceraFijaGlobal = document.createElement('div');
    cabeceraFijaGlobal.id = 'cabeceraFijaUnica';
    cabeceraFijaGlobal.style.cssText = `
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
    document.body.appendChild(cabeceraFijaGlobal);
    
    // Iniciar el detector de scroll
    iniciarDetectorScroll();
}

function iniciarDetectorScroll() {
    let timeoutId = null;
    let ultimoNumero = null;
    
    function actualizarCabecera() {
        const cards = document.querySelectorAll('.card');
        let cabeceraActiva = null;
        let maxArea = 0;
        
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(window.innerHeight, rect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            
            if (visibleHeight > 20 && visibleHeight > maxArea) {
                maxArea = visibleHeight;
                cabeceraActiva = card;
            }
        });
        
        if (cabeceraActiva) {
            const numero = cabeceraActiva.dataset.numero;
            const tipo = cabeceraActiva.dataset.tipo || 'himno';
            
            // Solo actualizar si cambió el himno
            if (numero !== ultimoNumero) {
                ultimoNumero = numero;
                
                // Obtener los datos del himno
                const himno = datosActuales.find(h => h.numero == numero);
                if (himno) {
                    const icono = himno.tipo === 'coro' ? '🎵' : '📖';
                    const tipoTexto = himno.tipo === 'coro' ? 'Adoración y Alabanza' : 'Himno';
                    
                    cabeceraFijaGlobal.innerHTML = `
                        <div style="display:flex;align-items:center;gap:8px;flex:1;overflow:hidden;min-width:0;">
                            <span style="font-size:${window.innerWidth <= 600 ? '14px' : '18px'};padding:${window.innerWidth <= 600 ? '2px 10px' : '4px 14px'};white-space:nowrap;flex-shrink:0;color:#0d47a1;font-weight:700;background:white;border-radius:30px;box-shadow:0 2px 8px rgba(13,71,161,0.08);">
                                ${icono} ${tipoTexto} ${himno.numero}
                            </span>
                            <span style="font-size:${window.innerWidth <= 600 ? '14px' : '18px'};font-weight:800;color:#0a1a2e;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:${window.innerWidth <= 600 ? '50vw' : '70vw'};flex:1;min-width:0;">
                                ${himno.titulo}
                            </span>
                        </div>
                    `;
                    cabeceraFijaGlobal.style.display = 'flex';
                }
            }
        } else {
            cabeceraFijaGlobal.style.display = 'none';
            ultimoNumero = null;
        }
    }
    
    function handleScroll() {
        if (timeoutId) return;
        timeoutId = setTimeout(() => {
            actualizarCabecera();
            timeoutId = null;
        }, 80);
    }
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', function() {
        const newTop = document.querySelector('.topbar')?.offsetHeight || 280;
        if (cabeceraFijaGlobal) {
            cabeceraFijaGlobal.style.top = newTop + 'px';
        }
        actualizarCabecera();
    });
    
    // Actualizar inicialmente
    setTimeout(actualizarCabecera, 200);
    setTimeout(actualizarCabecera, 500);
}
cargarHimnos();

// ==========================
// FIN
// ==========================