// ==========================
// HIMNARIO IPU MOYOBAMBA
// script.js
// ==========================

let himnos = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

const lista = document.getElementById("lista");
const buscar = document.getElementById("buscar");

// ==========================
// SISTEMA DE ACTUALIZACIÓN AUTOMÁTICA
// ==========================

let newVersionAvailable = false;
let swRegistration = null;

// Registrar el Service Worker con sistema de actualización
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                swRegistration = registration;
                console.log('Service Worker registrado con éxito');
                
                // Verificar actualizaciones periódicamente (cada 5 minutos)
                setInterval(() => {
                    checkForUpdates();
                }, 300000); // 5 minutos
                
                // Verificar al volver a la página
                document.addEventListener('visibilitychange', () => {
                    if (!document.hidden) {
                        checkForUpdates();
                    }
                });
            })
            .catch(error => {
                console.log('Error al registrar Service Worker:', error);
            });
    });
}

// Función para verificar actualizaciones
function checkForUpdates() {
    if (!swRegistration) return;
    
    swRegistration.update()
        .then(() => {
            // Verificar si hay una nueva versión esperando
            if (swRegistration.waiting) {
                showUpdateNotification();
            }
        })
        .catch(error => {
            console.log('Error al verificar actualizaciones:', error);
        });
}

// Escuchar cambios en el Service Worker
if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker actualizado');
    });
}

// Mostrar notificación de actualización
function showUpdateNotification() {
    // Evitar duplicados
    if (document.querySelector('.update-notification')) return;
    
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <div class="update-icon">📲</div>
            <div class="update-text">
                <h3>¡Nueva versión disponible!</h3>
                <p>Se han añadido nuevos himnos y mejoras</p>
            </div>
            <button id="updateAppBtn" class="update-btn">Actualizar ahora</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Añadir estilos de la notificación
    const style = document.createElement('style');
    style.textContent = `
        .update-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: #fff;
            padding: 16px 24px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            z-index: 10000;
            max-width: 90%;
            width: 500px;
            animation: slideUp 0.5s ease-out;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        .update-content {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        
        .update-icon {
            font-size: 32px;
            flex-shrink: 0;
        }
        
        .update-text {
            flex: 1;
            min-width: 150px;
        }
        
        .update-text h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #fff;
        }
        
        .update-text p {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: rgba(255,255,255,0.8);
        }
        
        .update-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none;
            color: white;
            padding: 10px 24px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }
        
        .update-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .update-btn:active {
            transform: scale(0.95);
        }
        
        @media (max-width: 600px) {
            .update-notification {
                bottom: 10px;
                padding: 12px 16px;
                width: 95%;
            }
            
            .update-content {
                flex-direction: column;
                text-align: center;
                gap: 12px;
            }
            
            .update-btn {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Manejar clic en el botón de actualización
    document.getElementById('updateAppBtn').addEventListener('click', () => {
        realizarActualizacion();
    });
}

// ==========================
// FUNCIÓN PRINCIPAL DE ACTUALIZACIÓN
// ==========================

function realizarActualizacion() {
    // Mostrar mensaje de actualización
    const btn = document.getElementById('updateAppBtn') || document.getElementById('btnActualizarDesdeMenu');
    if (btn) {
        btn.textContent = '🔄 Actualizando...';
        btn.disabled = true;
    }
    
    // Mostrar toast de actualización
    mostrarToast('🔄 Actualizando aplicación...');
    
    // Si hay un service worker esperando
    if (swRegistration && swRegistration.waiting) {
        // Enviar mensaje para activar el nuevo service worker
        swRegistration.waiting.postMessage('skipWaiting');
        
        // Esperar un momento y luego recargar
        setTimeout(() => {
            // Cerrar la aplicación (si está en PWA)
            if (window.matchMedia('(display-mode: standalone)').matches) {
                // Estamos en modo PWA, cerrar y abrir
                window.close();
                // Si no se cierra, recargar
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                // Estamos en navegador normal, recargar
                window.location.reload();
            }
        }, 1000);
    } else {
        // Si no hay service worker esperando, recargar directamente
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// Detectar mensajes del Service Worker
if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data === 'update-available') {
            showUpdateNotification();
        }
    });
}

// ==========================
// FIN SISTEMA DE ACTUALIZACIÓN
// ==========================

// Cargar himnos
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
// MENÚ DE CONFIGURACIÓN
// ==========================

// Variables del menú
const btnConfiguracion = document.getElementById('btnConfiguracion');
const menuConfiguracion = document.getElementById('menuConfiguracion');
const cerrarMenu = document.getElementById('cerrarMenu');
const btnActualizarDesdeMenu = document.getElementById('btnActualizarDesdeMenu');
const btnLimpiarCache = document.getElementById('btnLimpiarCache');
const versionActual = document.getElementById('versionActual');
const contadorFavoritos = document.getElementById('contadorFavoritos');

// Badge de actualización
let badgeActualizacion = null;

// Mostrar/Ocultar menú
btnConfiguracion.addEventListener('click', () => {
    abrirMenu();
});

cerrarMenu.addEventListener('click', () => {
    cerrarMenuConfiguracion();
});

// Cerrar menú al hacer clic fuera
menuConfiguracion.addEventListener('click', (e) => {
    if (e.target === menuConfiguracion) {
        cerrarMenuConfiguracion();
    }
});

// Cerrar con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuConfiguracion.style.display !== 'none') {
        cerrarMenuConfiguracion();
    }
});

function abrirMenu() {
    menuConfiguracion.style.display = 'flex';
    actualizarInfoMenu();
    document.body.style.overflow = 'hidden';
}

function cerrarMenuConfiguracion() {
    menuConfiguracion.style.display = 'none';
    document.body.style.overflow = '';
}

function actualizarInfoMenu() {
    // Actualizar versión
    const version = localStorage.getItem('appVersion') || 'v1.0.0';
    if (versionActual) versionActual.textContent = version;
    
    // Actualizar contador de favoritos
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    if (contadorFavoritos) {
        contadorFavoritos.textContent = `${favoritos.length} himnos`;
    }
}

// ==========================
// ACTUALIZAR DESDE EL MENÚ
// ==========================

btnActualizarDesdeMenu.addEventListener('click', async () => {
    const btn = btnActualizarDesdeMenu;
    const textoOriginal = btn.textContent;
    
    btn.textContent = '🔍 Buscando...';
    btn.disabled = true;
    
    try {
        if (swRegistration) {
            await swRegistration.update();
            
            if (swRegistration.waiting) {
                // Hay actualización disponible - usar función centralizada
                realizarActualizacion();
            } else {
                btn.textContent = '✅ Ya está actualizado';
                mostrarToast('✅ Tu app ya está en la última versión');
                
                setTimeout(() => {
                    btn.textContent = textoOriginal;
                    btn.disabled = false;
                }, 3000);
            }
        } else {
            btn.textContent = '🔄 Actualizando...';
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    } catch (error) {
        console.error('Error al actualizar:', error);
        btn.textContent = '❌ Error';
        mostrarToast('❌ Error al buscar actualizaciones');
        
        setTimeout(() => {
            btn.textContent = textoOriginal;
            btn.disabled = false;
        }, 3000);
    }
});

// ==========================
// LIMPIAR CACHÉ
// ==========================

btnLimpiarCache.addEventListener('click', async () => {
    const btn = btnLimpiarCache;
    const textoOriginal = btn.textContent;
    
    btn.textContent = '⏳ Limpiando...';
    btn.disabled = true;
    
    try {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            mostrarToast('✅ Caché limpiado correctamente');
            
            setTimeout(() => {
                btn.textContent = textoOriginal;
                btn.disabled = false;
            }, 2000);
        } else {
            mostrarToast('❌ Tu navegador no soporta esta función');
            btn.textContent = textoOriginal;
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Error al limpiar caché:', error);
        mostrarToast('❌ Error al limpiar caché');
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }
});

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
// BADGE DE ACTUALIZACIÓN
// ==========================

function mostrarBadgeActualizacion() {
    if (badgeActualizacion) return;
    
    badgeActualizacion = document.createElement('span');
    badgeActualizacion.className = 'badge-actualizacion';
    badgeActualizacion.textContent = '1';
    
    const btn = document.getElementById('btnConfiguracion');
    btn.style.position = 'relative';
    btn.appendChild(badgeActualizacion);
}

// ==========================
// SOBRESCRIBIR showUpdateNotification
// ==========================

// Guardar la función original si existe
const originalShowUpdate = window.showUpdateNotification;

// Nueva función que incluye el badge
window.showUpdateNotification = function() {
    // Llamar a la función original si existe
    if (typeof originalShowUpdate === 'function') {
        originalShowUpdate();
    }
    
    // Mostrar badge en el engranaje
    mostrarBadgeActualizacion();
    
    // Actualizar el botón en el menú
    const btn = document.getElementById('btnActualizarDesdeMenu');
    if (btn) {
        btn.textContent = '🔔 Actualizar ahora';
        btn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
    }
};

// ==========================
// INICIALIZAR VERSIÓN
// ==========================

// Guardar versión en localStorage la primera vez
if (!localStorage.getItem('appVersion')) {
    localStorage.setItem('appVersion', 'v1.0.0');
}

// ==========================
// FIN MENÚ DE CONFIGURACIÓN
// ==========================