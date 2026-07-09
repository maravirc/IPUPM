// ==========================
// HIMNARIO IPU MOYOBAMBA
// script.js - SOLO CIERRE
// ==========================

let himnos = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

const lista = document.getElementById("lista");
const buscar = document.getElementById("buscar");

// ==========================
// CARGAR HIMNOS
// ==========================

async function cargarHimnos() {
    try {
        const respuesta = await fetch("data/himnos.json");
        himnos = await respuesta.json();
        console.log(himnos);
        mostrarHimnos(himnos);
    } catch (error) {
        lista.innerHTML = "<h2>No se pudieron cargar los himnos.</h2>";
        console.error(error);
    }
}

function mostrarHimnos(datos) {
    lista.innerHTML = "";

    datos.forEach(himno => {
        const card = document.createElement("div");
        card.className = "card";

        const esFavorito = favoritos.includes(himno.numero);

        card.innerHTML = `
            <div class="cabecera-himno">
                <div>
                    <div class="numero">Himno ${himno.numero}</div>
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

// Botón Coros
document.getElementById("btnCoros").addEventListener("click", async () => {
    try {
        const respuesta = await fetch("data/coros.json");
        himnos = await respuesta.json();
        console.log(himnos);
        mostrarHimnos(himnos);
    } catch (error) {
        lista.innerHTML = "<h2>No se pudieron cargar los coros.</h2>";
        console.error(error);
    }
});

// Buscar
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
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// Favoritos
function favorito(numero) {
    if (favoritos.includes(numero)) {
        favoritos = favoritos.filter(n => n !== numero);
    } else {
        favoritos.push(numero);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    mostrarHimnos(himnos);
}

// Mostrar favoritos
document.getElementById("btnFavoritos").addEventListener("click", () => {
    const listaFavoritos = himnos.filter(h => favoritos.includes(h.numero));
    mostrarHimnos(listaFavoritos);
});

// Mostrar todos
document.getElementById("btnHimnos").addEventListener("click", async () => {
    try {
        const respuesta = await fetch("data/himnos.json");
        himnos = await respuesta.json();
        console.log(himnos);
        mostrarHimnos(himnos);
    } catch (error) {
        console.error(error);
    }
});

// Compartir
async function compartir(numero) {
    const himno = himnos.find(h => h.numero === numero);
    if (!himno) return;

    if (navigator.share) {
        navigator.share({
            title: himno.titulo,
            text: `Himno ${himno.numero}\n\n${himno.titulo}\n\n${himno.letra}`
        });
    } else {
        alert("Tu navegador no admite compartir.");
    }
}

// Iniciar
cargarHimnos();

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
        console.log("Aplicación instalada");
    } else {
        console.log("Instalación cancelada");
    }

    eventoInstalacion = null;
    btnInstalar.style.display = "none";
});

function pantallaCompleta(numero) {
    const tarjetas = document.querySelectorAll(".card");
    tarjetas.forEach(card => {
        if (card.innerHTML.includes(`Himno ${numero}`)) {
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
// BOTÓN DE CIERRE - SOLO ESO
// ==========================

const btnCerrarApp = document.getElementById('btnCerrarApp');

btnCerrarApp.addEventListener('click', function(e) {
    e.preventDefault();
    cerrarApp();
});

function cerrarApp() {
    console.log('Cerrando aplicación...');
    
    const isAndroid = navigator.userAgent.match(/Android/i);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Intentar cerrar con todos los métodos posibles
    try { window.close(); } catch(e) {}
    
    if (isAndroid) {
        try {
            if (window.chrome && window.chrome.app) {
                window.chrome.app.window.current().close();
            }
        } catch(e) {}
        
        setTimeout(() => {
            try { window.location.href = 'about:blank'; } catch(e) {}
        }, 300);
        
        setTimeout(() => {
            try {
                window.location.href = 'intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.HOME;end';
            } catch(e) {}
        }, 600);
    }
    
    if (isStandalone) {
        setTimeout(() => {
            try { window.history.go(-window.history.length); } catch(e) {}
        }, 900);
    }
    
    setTimeout(() => {
        try {
            window.location.href = window.location.href.split('?')[0] + '?close=true';
        } catch(e) {}
    }, 1200);
}

// ==========================
// DETECTAR CIERRE POR PARÁMETRO
// ==========================

if (window.location.search.includes('close=true')) {
    setTimeout(() => {
        try { window.close(); } catch(e) {}
        setTimeout(() => {
            try { window.location.href = 'about:blank'; } catch(e) {}
        }, 300);
    }, 500);
}

// ==========================
// FIN
// ==========================