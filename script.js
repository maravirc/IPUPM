// ==========================
// HIMNARIO IPU MOYOBAMBA
// script.js - VERSIÓN ULTRA RÁPIDA
// ==========================

// ==========================
// VARIABLES GLOBALES
// ==========================

let himnosCache = [];
let corosCache = [];
let todosLosDatos = [];
let datosActuales = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let tipoActual = 'himnos';
let paginaActual = 1;
const POR_PAGINA = 30;

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
// CARGAR DATOS - UNA SOLA VEZ
// ==========================

async function cargarDatos() {
    try {
        // Cargar himnos
        const resHimnos = await fetch("data/himnos.json");
        const himnosData = await resHimnos.json();
        himnosCache = himnosData.map(h => ({ ...h, tipo: 'himno' }));
        
        // Cargar coros
        const resCoros = await fetch("data/coros.json");
        const corosData = await resCoros.json();
        corosCache = corosData.map(h => ({ ...h, tipo: 'coro' }));
        
        console.log('✅ Himnos:', himnosCache.length, 'Coros:', corosCache.length);
        
        // Mostrar himnos por defecto
        datosActuales = himnosCache;
        tipoActual = 'himnos';
        paginaActual = 1;
        renderizar(datosActuales);
        actualizarTitulo('himnos', datosActuales.length);
        
    } catch (error) {
        console.error('❌ Error al cargar:', error);
        lista.innerHTML = "<h2>⚠️ Error al cargar datos</h2>";
    }
}

// ==========================
// RENDERIZAR - ULTRA RÁPIDO
// ==========================

function renderizar(datos) {
    // Guardar referencia
    datosActuales = datos;
    
    if (!datos || datos.length === 0) {
        lista.innerHTML = `<div class="sin-resultados">
            <h3>📭 No hay elementos</h3>
            <p>No se encontraron himnos o coros.</p>
        </div>`;
        return;
    }
    
    // Calcular página
    const inicio = (paginaActual - 1) * POR_PAGINA;
    const fin = inicio + POR_PAGINA;
    const datosPagina = datos.slice(inicio, fin);
    const totalPaginas = Math.ceil(datos.length / POR_PAGINA);
    
    // Construir HTML de una vez (más rápido que crear elementos)
    let html = '';
    
    datosPagina.forEach(himno => {
        const esFavorito = favoritos.includes(himno.numero);
        const icono = himno.tipo === 'coro' ? '🎵' : '📖';
        const btnFav = esFavorito ? '⭐ Quitar' : '🤍 Favorito';
        
        html += `
            <div class="card" data-numero="${himno.numero}">
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
                    <button onclick="favorito(${himno.numero})">${btnFav}</button>
                    <button onclick="compartir(${himno.numero})">📤 Compartir</button>
                </div>
            </div>
        `;
    });
    
    // Agregar controles de página
    if (totalPaginas > 1) {
        html += `
            <div class="paginacion">
                <button onclick="cambiarPagina(-1)" ${paginaActual <= 1 ? 'disabled' : ''}>◀ Anterior</button>
                <span>Página ${paginaActual} de ${totalPaginas}</span>
                <button onclick="cambiarPagina(1)" ${paginaActual >= totalPaginas ? 'disabled' : ''}>Siguiente ▶</button>
            </div>
        `;
    }
    
    // Actualizar DOM de una vez
    lista.innerHTML = html;
}

// ==========================
// CAMBIAR PÁGINA
// ==========================

function cambiarPagina(direccion) {
    const totalPaginas = Math.ceil(datosActuales.length / POR_PAGINA);
    const nuevaPagina = paginaActual + direccion;
    
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
    
    paginaActual = nuevaPagina;
    renderizar(datosActuales);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================
// MOSTRAR SECCIÓN - INSTANTÁNEO
// ==========================

function mostrarSeccion(tipo) {
    tipoActual = tipo;
    paginaActual = 1;
    
    if (tipo === 'himnos') {
        datosActuales = himnosCache;
        renderizar(datosActuales);
        actualizarTitulo('himnos', datosActuales.length);
    } else if (tipo === 'coros') {
        datosActuales = corosCache;
        renderizar(datosActuales);
        actualizarTitulo('coros', datosActuales.length);
    } else if (tipo === 'favoritos') {
        const favoritosLista = todosLosDatos.filter(h => favoritos.includes(h.numero));
        datosActuales = favoritosLista;
        renderizar(datosActuales);
        actualizarTitulo('favoritos', datosActuales.length);
    }
    
    buscar.value = '';
}

// ==========================
// BOTONES DE NAVEGACIÓN
// ==========================

document.getElementById("btnHimnos").addEventListener("click", () => {
    mostrarSeccion('himnos');
});

document.getElementById("btnCoros").addEventListener("click", () => {
    mostrarSeccion('coros');
});

document.getElementById("btnFavoritos").addEventListener("click", () => {
    mostrarSeccion('favoritos');
});

// ==========================
// BUSCADOR - OPTIMIZADO
// ==========================

let timeoutBusqueda;

buscar.addEventListener("keyup", () => {
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(buscarRapido, 300);
});

function buscarRapido() {
    const texto = buscar.value.trim().toLowerCase();
    
    if (texto === '') {
        mostrarSeccion(tipoActual);
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
    
    paginaActual = 1;
    renderizar(resultado);
    
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
}

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
    mostrarSeccion(tipoActual);
}

// ==========================
// COMPARTIR
// ==========================

async function compartir(numero) {
    const himno = datosActuales.find(h => h.numero === numero);
    if (!himno) return;
    
    const tipoTexto = himno.tipo === 'coro' ? 'Adoración y Alabanza' : 'Himno';
    
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
    const card = document.querySelector(`.card[data-numero="${numero}"]`);
    if (card) card.requestFullscreen();
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
// INICIAR
// ==========================

// Unir todos los datos para favoritos
cargarDatos().then(() => {
    todosLosDatos = [...himnosCache, ...corosCache];
});

// ==========================
// ESTILOS PARA PAGINACIÓN
// ==========================

// Agregar estilos dinámicamente
const estiloPaginacion = document.createElement('style');
estiloPaginacion.textContent = `
    .paginacion {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        padding: 20px 0 10px 0;
        flex-wrap: wrap;
    }
    .paginacion button {
        background: #0d47a1;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
    }
    .paginacion button:hover:not(:disabled) {
        background: #1565c0;
        transform: scale(1.05);
    }
    .paginacion button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    .paginacion span {
        color: #333;
        font-size: 14px;
    }
    .dark .paginacion span {
        color: #ccc;
    }
    .dark .paginacion button {
        background: #1a2744;
    }
    .dark .paginacion button:hover:not(:disabled) {
        background: #1e88e5;
    }
`;
document.head.appendChild(estiloPaginacion);

// ==========================
// FIN
// ==========================