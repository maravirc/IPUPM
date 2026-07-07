// ==========================
// HIMNARIO IPU MOYOBAMBA
// script.js
// ==========================

let himnos = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

const lista = document.getElementById("lista");
const buscar = document.getElementById("buscar");

// Cargar himnos
async function cargarHimnos() {

    try {

        const respuesta = await fetch("data/himnos.json");
        himnos = await respuesta.json();

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
            <div class="numero">Himno ${himno.numero}</div>

            <div class="titulo">${himno.titulo}</div>

            <div class="letra">
${himno.letra}
            </div>

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

        mostrarHimnos(himnos);

    } catch (error) {

        lista.innerHTML = "<h2>No se pudieron cargar los coros.</h2>";
        console.error(error);

    }

});

// Buscar
buscar.addEventListener("keyup", () => {

    const texto = buscar.value.toLowerCase();

    const resultado = himnos.filter(h =>

        h.titulo.toLowerCase().includes(texto) ||

        h.letra.toLowerCase().includes(texto) ||

        h.numero.toString().includes(texto)

    );

    mostrarHimnos(resultado);

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

    const listaFavoritos = himnos.filter(h =>
        favoritos.includes(h.numero)
    );

    mostrarHimnos(listaFavoritos);

});

// Mostrar todos
document.getElementById("btnHimnos").addEventListener("click", () => {

    mostrarHimnos(himnos);

});

// Compartir
async function compartir(numero){

    const himno = himnos.find(h=>h.numero===numero);

    if(!himno) return;

    if(navigator.share){

        navigator.share({

            title:himno.titulo,

            text:
`Himno ${himno.numero}

${himno.titulo}

${himno.letra}`

        });

    }else{

        alert("Tu navegador no admite compartir.");

    }

}

// Iniciar
cargarHimnos();