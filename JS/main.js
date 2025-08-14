document.addEventListener("DOMContentLoaded", () => {
const MASA_SISTEMA_SOLAR = 1000;

const SISTEMAS_INICIO = "sistemas_solares";

let planetas = [];
let sistemaCerrado = false;
let solicitandoNombre = false;

let sistemasGuardados = [];

const btnMostrarFormulario = document.getElementById("btnMostrarFormulario");
const AgregarPlaneta = document.getElementById("AgregarPlaneta");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");

const Nombre = document.getElementById("nombrePlaneta");
const Masa = document.getElementById("masaPlaneta");
const Cantidad = document.getElementById("cantidadPlaneta");

const resumen = document.getElementById("resumen");
const resumenCantidad = document.getElementById("resumenCantidad");
const resumenMasaTotal = document.getElementById("resumenMasaTotal");
const resumenRestante = document.getElementById("resumenRestante");

const nominador = document.getElementById("nominadorSistema");
const NombreSistema = document.getElementById("nombreSistema");
const btnGuardarSistemaNombrado = document.getElementById("btnGuardarSistemaNombrado");
const btnCancelarNominador = document.getElementById("btnCancelarNominador");

const accionesResumen = document.getElementById("accionesResumen");
const btnSeguirAgregando = document.getElementById("btnSeguirAgregando");
const btnTerminarSistema = document.getElementById("btnTerminarSistema");

const mensajeFinal = document.getElementById("mensajeFinal");

const contSistemas = document.getElementById("sistemasGuardados");
const contSistemasVacio = document.getElementById("sistemasGuardadosVacio");

const contMensajes = document.querySelector(".card-body") || document.body;
const mostrarMensaje = (tipo, texto) => {
    let box = document.getElementById("mensaje");
    if (!box) {
        box = document.createElement("div");
        box.id = "mensaje";
        box.role = "alert";
        box.className = `alert alert-${tipo} mt-3`;
        contMensajes.prepend(box);
    }
    box.className = `alert alert-${tipo} mt-3`;
    box.textContent = texto;
};

const toNumber = (v) => {
const n = Number(v);
return Number.isFinite(n) ? n : 0;
};

const setFormEnabled = (enabled) => {
Nombre.disabled = !enabled;
Masa.disabled = !enabled;
Cantidad.disabled = !enabled;
btnGuardar.disabled = !enabled;
};

const calcularResumen = () => {
let totalCantidad = 0;
let totalMasaPlanetas = 0;

for (const p of planetas) {
    totalCantidad += p.cantidad;
    totalMasaPlanetas += p.masa * p.cantidad;
}

const Restante = MASA_SISTEMA_SOLAR - totalMasaPlanetas;

return {
    totalCantidad,
    totalMasaPlanetas,
    Restante
};
};

const renderResumen = () => {
const { totalCantidad, totalMasaPlanetas, Restante } = calcularResumen();

resumenCantidad.textContent = totalCantidad;
resumenMasaTotal.textContent = totalMasaPlanetas.toLocaleString("es-CL");
resumenRestante.textContent = Restante.toLocaleString("es-CL");

const hayDatos = planetas.length > 0;
resumen.style.display = hayDatos ? "block" : "none";

accionesResumen.style.display = hayDatos && !sistemaCerrado && !solicitandoNombre ? "block" : "none";

};

const resetFormulario = () => {
AgregarPlaneta.reset();
Nombre.focus();
};

const cargarSistemas = () => {
try {
    sistemasGuardados = JSON.parse(localStorage.getItem(SISTEMAS_INICIO)) || [];
} catch {
    sistemasGuardados = [];
}
};

const guardarSistemas = () => {
localStorage.setItem(SISTEMAS_INICIO, JSON.stringify(sistemasGuardados));
};

const renderSistemasGuardados = () => {
contSistemas.innerHTML = "";
if (!sistemasGuardados.length) {
    contSistemasVacio.style.display = "block";
    return;
}
contSistemasVacio.style.display = "none";

sistemasGuardados
    .slice()
    .sort((a, b) => b.id - a.id)
    .forEach((s) => {
    const div = document.createElement("div");
    div.className = "card mb-2 mostrarguardados";
    const fecha = new Date(s.fechaISO);
    const fechaTxt = fecha.toLocaleString("es-CL");

    const totalPlanetas = s.totales.totalCantidad;
    const masaTotal = s.totales.totalMasaPlanetas;
    const Restante = s.totales.Restante;

    const detallePlanetas = s.planetas
        .map((p) => `• ${p.nombre} x ${p.cantidad} (masa ${p.masa})`)
        .join("");

    const titulo = s.nombre && s.nombre.trim() ? s.nombre.trim() : `Sistema #${s.id}`;

    div.innerHTML = `
        <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">${titulo}</h5>
            <small class="text-muted">${fechaTxt}</small>
        </div>
        <p class="mb-2">
            <strong>Totales:</strong>
            Planetas: ${totalPlanetas} |
            Masa total: ${masaTotal.toLocaleString("es-CL")} |
            Restante: ${Restante.toLocaleString("es-CL")}
        </p>
        <div class="small text-muted">${detallePlanetas || "Sin planetas"}</div>
        </div>
    `;
    contSistemas.appendChild(div);
    });
};

const insistirSistemaActual = (nombreSistema) => {
const { totalCantidad, totalMasaPlanetas, Restante } = calcularResumen();

const sistema = {
    id: Date.now(),
    fechaISO: new Date().toISOString(),
    nombre: (nombreSistema || "").trim(),
    masaSistema: MASA_SISTEMA_SOLAR,
    totales: {
    totalCantidad,
    totalMasaPlanetas,
    Restante
    },
    planetas: planetas.map(p => ({ ...p }))
};

sistemasGuardados.push(sistema);
guardarSistemas();
renderSistemasGuardados();
mostrarMensaje("success", "Sistema guardado correctamente.");
};

const solicitarNombre = () => {
solicitandoNombre = true;
accionesResumen.style.display = "none";
nominador.style.display = "block";
NombreSistema.value = "";
NombreSistema.focus();
};

const cancelarNominador = () => {
solicitandoNombre = false;
nominador.style.display = "none";
accionesResumen.style.display = !sistemaCerrado ? "block" : "none";
};

const finalizarConNombre = () => {
const nombre = NombreSistema.value.trim();
if (!nombre) {
    mostrarMensaje("warning", "Por favor ingresa un nombre para el sistema.");
    NombreSistema.focus();
    return;
}
insistirSistemaActual(nombre);

sistemaCerrado = true;
nominador.style.display = "none";
setFormEnabled(false);
btnCancelar.disabled = true;
accionesResumen.style.display = "none";
mensajeFinal.style.display = "block";
btnMostrarFormulario.style.display = "none";
};

const prepararCierreConNombre = () => {
setFormEnabled(false);
solicitarNombre();
};

btnMostrarFormulario.addEventListener("click", () => {
if (sistemaCerrado) return;
AgregarPlaneta.style.display = "block";
btnMostrarFormulario.style.display = "none";
resetFormulario();
setFormEnabled(true);
});

btnCancelar.addEventListener("click", () => {
if (sistemaCerrado) return;
AgregarPlaneta.style.display = "none";
btnMostrarFormulario.style.display = "inline-block";
});

AgregarPlaneta.addEventListener("submit", (e) => {
e.preventDefault();
if (sistemaCerrado) return;

const nombre = Nombre.value.trim();
const masa = toNumber(Masa.value);
const cantidad = Math.max(1, Math.floor(toNumber(Cantidad.value)));

if (!nombre) {
    mostrarMensaje("warning", "Debes indicar un nombre para tu planeta.");
    Nombre.focus();
    return;
}
if (masa < 0) {
    mostrarMensaje("warning", "La masa no puede ser negativa.");
    Masa.focus();
    return;
}

const { Restante } = calcularResumen();
const masaAAgregar = masa * cantidad;

if (masaAAgregar > Restante) {
    const maxMasaPorUnidad = Restante / cantidad;
    const sugerencia = maxMasaPorUnidad > 0
    ? ` (máx. ${maxMasaPorUnidad.toFixed(2)} por unidad con cantidad = ${cantidad})`
    : "";
    mostrarMensaje(
    "warning",
    `No se puede guardar: la masa a agregar (${masaAAgregar}) supera el Restante disponible (${Restante}). Ajusta la masa o la cantidad${sugerencia}.`
    );
    Masa.focus();
    Masa.select?.();
    return;
}

planetas.push({ nombre, masa, cantidad });
renderResumen();
setFormEnabled(false);

accionesResumen.style.display = "block";
mostrarMensaje("info", "Planeta agregado. Puedes seguir agregando o terminar el sistema.");
});

btnSeguirAgregando.addEventListener("click", () => {
if (sistemaCerrado) return;
resetFormulario();
setFormEnabled(true);

const { Restante } = calcularResumen();
if (Restante <= 0) {
    mostrarMensaje("info", "El sistema alcanzó el límite de masa. Debes nombrarlo para guardarlo.");
    prepararCierreConNombre();
}
});

btnTerminarSistema.addEventListener("click", () => {
if (sistemaCerrado) return;
prepararCierreConNombre();
});

btnGuardarSistemaNombrado.addEventListener("click", finalizarConNombre);
btnCancelarNominador.addEventListener("click", cancelarNominador);

cargarSistemas();
renderSistemasGuardados();

setFormEnabled(true);
renderResumen();

const btnLimpiarSistemas = document.getElementById('btnLimpiarSistemas');

    if (btnLimpiarSistemas) {
        btnLimpiarSistemas.addEventListener('click', () => {
            localStorage.removeItem(SISTEMAS_INICIO);
            sistemasGuardados = [];
            renderSistemasGuardados();
            mostrarMensaje("success", "Se borraron todos los sistemas guardados.");
        });
    }
});
