// ==========================
// HIMNARIO IPU MOYOBAMBA
// script.js - VERSIÓN OPTIMIZADA CON CACHE DE DATOS
// ==========================

// ==========================
// VARIABLES GLOBALES
// ==========================

let himnos = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

// 🚀 NUEVO: Variables de caché para navegación rápida
let datosHimnos = [];
let datosCoros = [];
let datosFavoritos = [];
let datosActuales = [];
let tipoActual = 'himnos'; // 'himnos', 'coros', 'favoritos'

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
        'coros': 'Iglesia Pentecostal Unida - Moyobamba - Coros',
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
        const respuesta = await fetch("data/himnos.json");
        const data = await respuesta.json();
        datosHimnos = data.map(h => ({ ...h, tipo: 'himno' }));
        datosHimnos.sort((a, b) => a.numero - b.numero); // Ordenar por número
        console.log('✅ Himnos cargados:', datosHimnos.length);
        
        // Cargar coros también
        await cargarCoros();
        
        // Mostrar himnos por defecto
        datosActuales = datosHimnos;
        tipoActual = 'himnos';
        mostrarHimnos(datosHimnos);
        actualizarTitulo('himnos', datosHimnos.length);
        
    } catch (error) {
        console.error('❌ Error al cargar himnos:', error);
        lista.innerHTML = "<h2>⚠️ No se pudieron cargar los himnos.</h2><p>Verifica tu conexión a internet.</p>";
    }
}

// ==========================
// CARGAR COROS - UNA SOLA VEZ
// ==========================

async function cargarCoros() {
    try {
        const respuesta = await fetch("data/coros.json");
        const data = await respuesta.json();
        datosCoros = data.map(h => ({ ...h, tipo: 'coro' }));
        datosCoros.sort((a, b) => a.numero - b.numero); // Ordenar por número
        console.log('✅ Coros cargados:', datosCoros.length);
    } catch (error) {
        console.error('❌ Error al cargar coros:', error);
        datosCoros = [];
    }
}

// ==========================
// MOSTRAR HIMNOS - OPTIMIZADO
// ==========================

function mostrarHimnos(datos) {
    // Guardar los datos actuales
    datosActuales = datos;
    
    if (!datos || datos.length === 0) {
        lista.innerHTML = `<div class="sin-resultados">
            <h3>📭 No hay elementos</h3>
            <p>No se encontraron himnos o coros.</p>
        </div>`;
        return;
    }
    
    // Usar DocumentFragment para mejorar rendimiento
    const fragment = document.createDocumentFragment();
    
    datos.forEach(himno => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.numero = himno.numero;

        const esFavorito = favoritos.includes(himno.numero);
        
        let icono = '📖';
        if (himno.tipo === 'coro') {
            icono = '🎵';
        }

        card.innerHTML = `
            <div class="cabecera-himno">
                <div>
                    <div class="numero">${icono} ${himno.numero}</div>
                    <div class="titulo">${himno.titulo}</div>
                </div>
                <div class="acciones">
                    <button class="btnPantalla" onclick="pantallaCompleta(${himno.numero})">⛶</button>
                    <button class="btnSalir" onclick="salirPantallaCompleta(event)">✕</button>
                </div>
            </div>
            <div class="letra">${himno.letra}</div>
            <div class="botones">
                <button onclick="favorito(${himno.numero})">
                    ${esFavorito ? "⭐ Quitar" : "🤍 Favorito"}
                </button>
                <button onclick="compartir(${himno.numero})">
                    📤 Compartir
                </button>
            </div>
        `;

        fragment.appendChild(card);
    });

    // Limpiar y agregar todo de una vez
    lista.innerHTML = '';
    lista.appendChild(fragment);
}

// ==========================
// BOTÓN HIMNOS - INSTANTÁNEO
// ==========================

document.getElementById("btnHimnos").addEventListener("click", () => {
    // Ya están cargados, solo mostrar
    if (datosHimnos.length > 0) {
        tipoActual = 'himnos';
        mostrarHimnos(datosHimnos);
        actualizarTitulo('himnos', datosHimnos.length);
        buscar.value = '';
    }
});

// ==========================
// BOTÓN ADORACIÓN Y ALABANZAS - INSTANTÁNEO
// ==========================

document.getElementById("btnCoros").addEventListener("click", () => {
    if (datosCoros.length > 0) {
        tipoActual = 'coros';
        mostrarHimnos(datosCoros);
        actualizarTitulo('coros', datosCoros.length);
        buscar.value = '';
    } else {
        // Si no están cargados, cargarlos
        cargarCoros().then(() => {
            tipoActual = 'coros';
            mostrarHimnos(datosCoros);
            actualizarTitulo('coros', datosCoros.length);
            buscar.value = '';
        });
    }
});

// ==========================
// BOTÓN FAVORITOS - INSTANTÁNEO
// ==========================

document.getElementById("btnFavoritos").addEventListener("click", () => {
    const listaFavoritos = datosActuales.filter(h => favoritos.includes(h.numero));
    tipoActual = 'favoritos';
    mostrarHimnos(listaFavoritos);
    actualizarTitulo('favoritos', listaFavoritos.length);
    buscar.value = '';
});

// ==========================
// BUSCADOR OPTIMIZADO
// ==========================

let timeoutBuscador;

buscar.addEventListener("keyup", () => {
    clearTimeout(timeoutBuscador);
    timeoutBuscador = setTimeout(realizarBusqueda, 300);
});

buscar.addEventListener("keydown", () => {
    clearTimeout(timeoutBuscador);
});

function realizarBusqueda() {
    const texto = buscar.value.trim().toLowerCase();
    
    if (texto === '') {
        // Mostrar los datos según el tipo actual
        if (tipoActual === 'himnos' && datosHimnos.length > 0) {
            mostrarHimnos(datosHimnos);
            actualizarTitulo('himnos', datosHimnos.length);
        } else if (tipoActual === 'coros' && datosCoros.length > 0) {
            mostrarHimnos(datosCoros);
            actualizarTitulo('coros', datosCoros.length);
        } else if (tipoActual === 'favoritos') {
            const favoritosLista = datosActuales.filter(h => favoritos.includes(h.numero));
            mostrarHimnos(favoritosLista);
            actualizarTitulo('favoritos', favoritosLista.length);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }
    
    // Buscar en los datos actuales
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
}

// ==========================
// FAVORITOS - ACTUALIZADO
// ==========================

function favorito(numero) {
    if (favoritos.includes(numero)) {
        favoritos = favoritos.filter(n => n !== numero);
    } else {
        favoritos.push(numero);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    
    // Recargar los datos actuales para actualizar los botones
    if (tipoActual === 'himnos') {
        mostrarHimnos(datosHimnos);
    } else if (tipoActual === 'coros') {
        mostrarHimnos(datosCoros);
    } else if (tipoActual === 'favoritos') {
        const listaFavoritos = datosActuales.filter(h => favoritos.includes(h.numero));
        mostrarHimnos(listaFavoritos);
        actualizarTitulo('favoritos', listaFavoritos.length);
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