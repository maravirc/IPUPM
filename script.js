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
<div class="cabecera-himno">

    <div>

        <div class="numero">
            Himno ${himno.numero}
        </div>

        <div class="titulo">
            ${himno.titulo}
        </div>

    </div>

    <div class="acciones">

        <button class="btnPantalla"
            onclick="pantallaCompleta(${himno.numero})">

            ⛶

        </button>

        <button class="btnSalir"
            onclick="salirPantallaCompleta(event)">

            ✕

        </button>

    </div>

</div>

            

<div class="letra">
${formatearLetra(himno.letra)}
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
document.getElementById("btnHimnos").addEventListener("click", async () => {

    try {

        const respuesta = await fetch("data/himnos.json");
        himnos = await respuesta.json();

        mostrarHimnos(himnos);

    } catch (error) {

        console.error(error);

    }

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

// ==========================
// INSTALAR PWA
// ==========================

let eventoInstalacion;

const btnInstalar = document.getElementById("btnInstalar");


window.addEventListener("beforeinstallprompt", (e)=>{

    e.preventDefault();

    eventoInstalacion = e;

    btnInstalar.style.display = "block";

});


btnInstalar.addEventListener("click", async ()=>{

    if(!eventoInstalacion){
        return;
    }


    eventoInstalacion.prompt();


    const resultado = await eventoInstalacion.userChoice;


    if(resultado.outcome === "accepted"){

        console.log("Aplicación instalada");

    }else{

        console.log("Instalación cancelada");

    }


    eventoInstalacion = null;

    btnInstalar.style.display = "none";

});

function pantallaCompleta(numero){

    const tarjetas = document.querySelectorAll(".card");

    tarjetas.forEach(card=>{

        if(card.innerHTML.includes(`Himno ${numero}`)){

            card.requestFullscreen();

        }

    });

}

function salirPantallaCompleta(event){

    event.stopPropagation();

    if(document.fullscreenElement){

        document.exitFullscreen();

    }

}