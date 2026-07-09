// ==========================
// HIMNARIO IPU MOYOBAMBA
// script.js
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

// Mostrar himnos
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
// BOTÓN DE CIERRE DE APP (ENGANCHE)
// ==========================

const btnConfiguracion = document.getElementById('btnConfiguracion');

btnConfiguracion.addEventListener('click', function() {
    cerrarApp();
});

function cerrarApp() {
    // Mostrar mensaje de cierre
    mostrarToast('📱 Cerrando aplicación...');
    
    // Verificar si estamos en Android
    const isAndroid = navigator.userAgent.match(/Android/i);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    console.log('Cerrando app - Android:', isAndroid, 'Standalone:', isStandalone);
    
    // Método 1: window.close()
    try {
        window.close();
        console.log('Método 1: window.close() ejecutado');
    } catch (e) {
        console.log('Error en window.close():', e);
    }
    
    // Método 2: Para Android PWA
    if (isAndroid && isStandalone) {
        // Intentar con chrome.app
        try {
            if (window.chrome && window.chrome.app) {
                window.chrome.app.window.current().close();
                console.log('Método 2: chrome.app.window.close() ejecutado');
            }
        } catch (e) {
            console.log('Error en chrome.app.window.close():', e);
        }
        
        // Método 3: Redirigir a about:blank
        setTimeout(() => {
            try {
                window.location.href = 'about:blank';
                console.log('Método 3: about:blank ejecutado');
            } catch (e) {
                console.log('Error en about:blank:', e);
            }
        }, 500);
        
        // Método 4: Intentar ir al home de Android
        setTimeout(() => {
            try {
                window.location.href = 'intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.HOME;end';
                console.log('Método 4: Intent de home ejecutado');
            } catch (e) {
                console.log('Error en intent:', e);
            }
        }, 1000);
    }
    
    // Método 5: Si no se cierra, recargar (como último recurso)
    setTimeout(() => {
        try {
            if (!document.hidden) {
                window.location.reload();
                console.log('Método 5: Recarga ejecutada');
            }
        } catch (e) {
            console.log('Error en recarga:', e);
        }
    }, 1500);
}

// ==========================
// TOAST NOTIFICATIONS
// ==========================

function mostrarToast(mensaje) {
    // Eliminar toast existente
    const toastExistente = document.querySelector('.toast-notification');
    if (toastExistente) {
        toastExistente.remove();
    }
    
    // Crear toast
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    // Estilos del toast
    const style = document.createElement('style');
    style.textContent = `
        .toast-notification {
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.85);
            color: white;
            padding: 14px 28px;
            border-radius: 14px;
            font-size: 14px;
            z-index: 10001;
            animation: toastSlideUp 0.4s ease;
            backdrop-filter: blur(10px);
            max-width: 90%;
            text-align: center;
            box-shadow: 0 8px 30px rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.1);
            font-weight: 500;
        }
        
        @keyframes toastSlideUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3000);
}

// ==========================
// FIN
// ==========================