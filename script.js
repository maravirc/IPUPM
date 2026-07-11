// ==========================
// HIMNARIO IPU MOYOBAMBA
// script.js - VERSIÓN OPTIMIZADA
// ==========================

// ==========================
// CACHE EN MEMORIA - PARA VELOCIDAD
// ==========================

let himnos = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

// 🔥 NUEVO: Cache de datos para no recargar cada vez
let datosHimnosCache = [];
let datosCorosCache = [];
let datosActuales = [];
let tipoActual = 'himnos';

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
// CARGAR HIMNOS - UNA SOLA VEZ
// ==========================

async function cargarHimnos() {
    try {
        // Cargar himnos una sola vez
        const respuesta = await fetch("data/himnos.json");
        const data = await respuesta.json();
        datosHimnosCache = data.map(h => ({ ...h, tipo: 'himno' }));
        console.log('✅ Himnos cargados:', datosHimnosCache.length);
        
        // Cargar coros una sola vez
        try {
            const respCoros = await fetch("data/coros.json");
            const dataCoros = await respCoros.json();
            datosCorosCache = dataCoros.map(h => ({ ...h, tipo: 'coro' }));
            console.log('✅ Coros cargados:', datosCorosCache.length);
        } catch (e) {
            console.log('⚠️ No se pudieron cargar coros');
            datosCorosCache = [];
        }
        
        // Mostrar himnos por defecto
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
// MOSTRAR HIMNOS - OPTIMIZADO CON HTML DIRECTO
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
    
    // 🔥 CONSTRUIR HTML DE UNA VEZ (más rápido que crear elementos)
    let html = '';
    
    for (let i = 0; i < datos.length; i++) {
        const himno = datos[i];
        const esFavorito = favoritos.includes(himno.numero);
        
        let icono = '📖';
        let tipoTexto = 'Himno';
        
        if (himno.tipo === 'coro') {
            icono = '🎵';
            tipoTexto = 'Adoración y Alabanza';
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
                    <button onclick="favorito(${himno.numero})">${btnFav}</button>
                    <button onclick="compartir(${himno.numero})">📤 Compartir</button>
                </div>
            </div>
        `;
    }
    
    // 🔥 ACTUALIZAR DOM DE UNA VEZ
    lista.innerHTML = html;
}

// ==========================
// BOTÓN ADORACIÓN Y ALABANZAS - INSTANTÁNEO
// ==========================

document.getElementById("btnCoros").addEventListener("click", () => {
    if (datosCorosCache.length > 0) {
        tipoActual = 'coros';
        datosActuales = datosCorosCache;
        mostrarHimnos(datosCorosCache);
        actualizarTitulo('coros', datosCorosCache.length);
        buscar.value = '';
    } else {
        lista.innerHTML = "<h2>⚠️ No se pudieron cargar los coros.</h2>";
    }
});

// ==========================
// BOTÓN HIMNOS - INSTANTÁNEO
// ==========================

document.getElementById("btnHimnos").addEventListener("click", () => {
    if (datosHimnosCache.length > 0) {
        tipoActual = 'himnos';
        datosActuales = datosHimnosCache;
        mostrarHimnos(datosHimnosCache);
        actualizarTitulo('himnos', datosHimnosCache.length);
        buscar.value = '';
    }
});

// ==========================
// BOTÓN FAVORITOS - INSTANTÁNEO
// ==========================

document.getElementById("btnFavoritos").addEventListener("click", () => {
    const listaFavoritos = datosActuales.filter(h => favoritos.includes(h.numero));
    tipoActual = 'favoritos';
    datosActuales = listaFavoritos;
    mostrarHimnos(listaFavoritos);
    actualizarTitulo('favoritos', listaFavoritos.length);
    buscar.value = '';
});

// ==========================
// BUSCAR - CON DEBOUNCE
// ==========================

let timeoutBusqueda;

buscar.addEventListener("keyup", () => {
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(() => {
        const texto = buscar.value.trim().toLowerCase();
        
        if (texto === '') {
            // Volver a mostrar según el tipo actual
            if (tipoActual === 'himnos') {
                mostrarHimnos(datosHimnosCache);
                actualizarTitulo('himnos', datosHimnosCache.length);
            } else if (tipoActual === 'coros') {
                mostrarHimnos(datosCorosCache);
                actualizarTitulo('coros', datosCorosCache.length);
            } else if (tipoActual === 'favoritos') {
                const favs = datosActuales.filter(h => favoritos.includes(h.numero));
                mostrarHimnos(favs);
                actualizarTitulo('favoritos', favs.length);
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        
        let resultado;
        if (/^\d+$/.test(texto)) {
            resultado = datosActuales.filter(h => h.numero.toString().includes(texto));
        } else {
            resultado = datosActuales.filter(h =>
                h.titulo.toLowerCase().includes(texto) ||
                h.letra.toLowerCase().includes(texto)
            );
        }
        
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
    }, 300); // Espera 300ms después de escribir
});

// ==========================
// FAVORITOS
// ==========================

function favorito(numero) {
    if (favoritos.includes(numero)) {
        favoritos = favoritos.filter(n => n !== numero);
    } else {
        favoritos.push(numero);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    
    // Recargar según el tipo actual
    if (tipoActual === 'himnos') {
        mostrarHimnos(datosHimnosCache);
    } else if (tipoActual === 'coros') {
        mostrarHimnos(datosCorosCache);
    } else if (tipoActual === 'favoritos') {
        const favs = datosActuales.filter(h => favoritos.includes(h.numero));
        mostrarHimnos(favs);
        actualizarTitulo('favoritos', favs.length);
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
// INICIAR
// ==========================

cargarHimnos();

// ==========================
// FIN
// ==========================