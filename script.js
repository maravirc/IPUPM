// ==========================
// HIMNARIO IPU MOYOBAMBA
// script.js - VERSIÓN COMPLETA
// ==========================

let himnos = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

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
// CARGAR HIMNOS - CON CACHÉ
// ==========================

async function cargarHimnos() {
    try {
        const respuesta = await fetch("data/himnos.json");
        himnos = await respuesta.json();
        console.log('✅ Himnos cargados:', himnos.length);
        himnos = himnos.map(h => ({ ...h, tipo: 'himno' }));
        mostrarHimnos(himnos);
        actualizarTitulo('himnos', himnos.length);
    } catch (error) {
        console.error('❌ Error al cargar himnos:', error);
        // Intentar cargar desde caché como respaldo
        try {
            const cache = await caches.open('himnario-ipu-v11');
            const cachedResponse = await cache.match('data/himnos.json');
            if (cachedResponse) {
                himnos = await cachedResponse.json();
                console.log('✅ Himnos cargados desde caché:', himnos.length);
                himnos = himnos.map(h => ({ ...h, tipo: 'himno' }));
                mostrarHimnos(himnos);
                actualizarTitulo('himnos', himnos.length);
            } else {
                lista.innerHTML = "<h2>⚠️ No se pudieron cargar los himnos.</h2><p>Verifica tu conexión a internet.</p>";
            }
        } catch (cacheError) {
            lista.innerHTML = "<h2>⚠️ No se pudieron cargar los himnos.</h2><p>Verifica tu conexión a internet.</p>";
            console.error('❌ Error al cargar desde caché:', cacheError);
        }
    }
}

// ==========================
// MOSTRAR HIMNOS
// ==========================

function mostrarHimnos(datos) {
    lista.innerHTML = "";

    datos.forEach(himno => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.numero = himno.numero;

        const esFavorito = favoritos.includes(himno.numero);
        
        let icono = '📖';
        let tipoTexto = 'Himno';
        
        if (himno.tipo === 'coro') {
            icono = '🎵';
            tipoTexto = 'Adoración y Alabanza';
        }

        card.innerHTML = `
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
                <button onclick="favorito(${himno.numero})">
                    ${esFavorito ? "⭐ Quitar" : "🤍 Favorito"}
                </button>
                <button onclick="compartir(${himno.numero})">
                    📤 Compartir
                </button>
            </div>
        `;

        lista.appendChild(card);
    });
}

// ==========================
// BOTÓN ADORACIÓN Y ALABANZAS (COROS)
// ==========================

document.getElementById("btnCoros").addEventListener("click", async () => {
    try {
        const respuesta = await fetch("data/coros.json");
        himnos = await respuesta.json();
        console.log('✅ Coros cargados:', himnos.length);
        himnos = himnos.map(h => ({ ...h, tipo: 'coro' }));
        mostrarHimnos(himnos);
        actualizarTitulo('coros', himnos.length);
        buscar.value = '';
    } catch (error) {
        console.error('❌ Error al cargar coros:', error);
        // Intentar cargar desde caché
        try {
            const cache = await caches.open('himnario-ipu-v11');
            const cachedResponse = await cache.match('data/coros.json');
            if (cachedResponse) {
                himnos = await cachedResponse.json();
                console.log('✅ Coros cargados desde caché:', himnos.length);
                himnos = himnos.map(h => ({ ...h, tipo: 'coro' }));
                mostrarHimnos(himnos);
                actualizarTitulo('coros', himnos.length);
                buscar.value = '';
            } else {
                lista.innerHTML = "<h2>⚠️ No se pudieron cargar los coros.</h2><p>Verifica tu conexión a internet.</p>";
            }
        } catch (cacheError) {
            lista.innerHTML = "<h2>⚠️ No se pudieron cargar los coros.</h2><p>Verifica tu conexión a internet.</p>";
            console.error('❌ Error al cargar coros desde caché:', cacheError);
        }
    }
});

// ==========================
// BOTÓN HIMNOS
// ==========================

document.getElementById("btnHimnos").addEventListener("click", async () => {
    try {
        const respuesta = await fetch("data/himnos.json");
        himnos = await respuesta.json();
        console.log('✅ Himnos cargados:', himnos.length);
        himnos = himnos.map(h => ({ ...h, tipo: 'himno' }));
        mostrarHimnos(himnos);
        actualizarTitulo('himnos', himnos.length);
        buscar.value = '';
    } catch (error) {
        console.error('❌ Error al cargar himnos:', error);
        // Intentar cargar desde caché
        try {
            const cache = await caches.open('himnario-ipu-v11');
            const cachedResponse = await cache.match('data/himnos.json');
            if (cachedResponse) {
                himnos = await cachedResponse.json();
                console.log('✅ Himnos cargados desde caché:', himnos.length);
                himnos = himnos.map(h => ({ ...h, tipo: 'himno' }));
                mostrarHimnos(himnos);
                actualizarTitulo('himnos', himnos.length);
                buscar.value = '';
            }
        } catch (cacheError) {
            console.error('❌ Error al cargar desde caché:', cacheError);
        }
    }
});

// ==========================
// BOTÓN FAVORITOS
// ==========================

document.getElementById("btnFavoritos").addEventListener("click", () => {
    const listaFavoritos = himnos.filter(h => favoritos.includes(h.numero));
    mostrarHimnos(listaFavoritos);
    actualizarTitulo('favoritos', listaFavoritos.length);
    buscar.value = '';
});

// ==========================
// BUSCAR
// ==========================

buscar.addEventListener("keyup", () => {
    const texto = buscar.value.trim().toLowerCase();
    let resultado;

    if (/^\d+$/.test(texto)) {
        resultado = himnos.filter(h => h.numero.toString().includes(texto));
    } else {
        resultado = himnos.filter(h =>
            h.titulo.toLowerCase().includes(texto) ||
            h.letra.toLowerCase().includes(texto)
        );
    }

    mostrarHimnos(resultado);
    
    if (resultado.length > 0) {
        const primerItem = resultado[0];
        const tipo = primerItem.tipo === 'coro' ? 'coros' : 'himnos';
        actualizarTitulo(tipo, resultado.length);
    }
    
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
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
    mostrarHimnos(himnos);
}

// ==========================
// COMPARTIR
// ==========================

async function compartir(numero) {
    const himno = himnos.find(h => h.numero === numero);
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