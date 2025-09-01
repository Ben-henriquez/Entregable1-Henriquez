// Importamos dayjs desde un CDN para formatear fechas en las tarjetas de sistemas
import dayjs from "https://cdn.jsdelivr.net/npm/dayjs@1.11.11/+esm";
// Importamos la “capa de estado” con toda la lógica de datos/persistencia
import {
  MASS_CAP, initStore, getSystems, clearAll,
  addSystem, deleteSystem, updateSystemName, updateSystemPlanet, deleteSystemPlanet,
  summarize, canAddPlanet
} from "./state.js";

/* --------- helpers UI --------- */
// Atajo para querySelector. Permite hacer $('selector') de forma breve.
const $ = (s,c=document)=>c.querySelector(s);
// Formateo numérico a formato local (separador de miles, etc.)
const fmt = n => Number(n).toLocaleString("es-CL");
// Pequeño sistema de mensajes no intrusivo (sin alert/confirm).
// Inserta un <div class="alert ..."> dentro de #msg y lo limpia a los 2.5s.
const msg = (type,text)=>{
  const b=$("#msg"); if(!b) return;
  b.innerHTML=`<div class="alert alert-${type} mb-0" role="alert">${text}</div>`;
  setTimeout(()=>{ if (b.firstChild) b.innerHTML=""; }, 2500);
};

/* --------- estado local builder --------- */
// Estado SOLO para la sección de “constructor” (antes de guardar el sistema).
// - planets: planetas que voy agregando al sistema en edición
// - naming: si estoy pidiendo el nombre del sistema para guardarlo
// - editIndex: índice de la fila que se está editando en la tabla del builder
const builder = { planets: [], naming:false, editIndex:null };

/* --------- render UI (template strings) --------- */
// Dibuja (o re-dibuja) la sección del builder: totales y filas de la tabla.
function renderBuilder(){
  // Obtenemos totales con una función de la capa de estado (sumariza el arreglo)
  const {totalCant,totalMasa,rest}=summarize(builder.planets);
  // Pinta totales en los spans del resumen
  $("#sumCantidad").textContent=fmt(totalCant);
  $("#sumMasa").textContent=fmt(totalMasa);
  $("#sumRestante").textContent=fmt(rest);

  // Construimos las filas de la tabla del builder:
  // - Si NO estamos editando esa fila: muestra texto + botones Editar/Eliminar
  // - Si SÍ estamos editando esa fila: muestra inputs + botones Guardar/Cancelar
  const rows = builder.planets.length
    ? builder.planets.map((p,i)=>{
        const editing = builder.editIndex === i;
        if (!editing) {
          return `
            <tr>
              <td>${p.nombre}</td>
              <td>${p.masa}</td>
              <td>${p.cantidad}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary" data-act="b-edit" data-i="${i}">Editar</button>
                <button class="btn btn-sm btn-outline-danger" data-act="b-del" data-i="${i}">Eliminar</button>
              </td>
            </tr>`;
        } else {
          return `
            <tr>
              <td><input class="form-control form-control-sm b-name" value="${p.nombre}"></td>
              <td><input class="form-control form-control-sm b-masa" type="number" step="0.01" min="0" value="${p.masa}"></td>
              <td><input class="form-control form-control-sm b-cant" type="number" min="1" step="1" value="${p.cantidad}"></td>
              <td class="text-end">
                <button class="btn btn-sm btn-primary" data-act="b-save" data-i="${i}">Guardar</button>
                <button class="btn btn-sm btn-outline-secondary" data-act="b-cancel">Cancelar</button>
              </td>
            </tr>`;
        }
      }).join("")
    : `<tr><td colspan="4" class="text-muted">Aún no agregas planetas.</td></tr>`;

  // Inserta el HTML generado en el <tbody> del builder
  $("#builderRows").innerHTML = rows;
  // Muestra/oculta el bloque de “Nombrar sistema” según el flag naming
  $("#builderName").classList.toggle("d-none", !builder.naming);
}

// Dibuja la lista de “Sistemas guardados”. Todo se genera con template strings.
function renderSystems(){
  const cont = $("#systemsList");
  // Trae una copia del estado persistido (para que no lo puedas mutar sin querer)
  const systems = getSystems();
  if(!systems.length){ cont.innerHTML=`<div class="text-muted">Aún no hay sistemas guardados.</div>`; return; }

  // Armamos cada tarjeta de sistema (ordenada por id descendente)
  cont.innerHTML = systems.slice().sort((a,b)=>b.id-a.id).map(s=>{
    const {totalCant,totalMasa,rest}=summarize(s.planets);
    const fecha = dayjs(s.fechaISO).format("DD/MM/YYYY HH:mm"); // formateo con dayjs
    // Filas de la tabla interna con los planetas del sistema guardado
    const rows = s.planets.length ? s.planets.map((p,i)=>`
      <tr data-sys="${s.id}" data-i="${i}">
        <td class="pname" contenteditable="false">${p.nombre}</td>
        <td class="pmasa" contenteditable="false">${p.masa}</td>
        <td class="pcant" contenteditable="false">${p.cantidad}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary" data-act="sp-edit" data-sys="${s.id}" data-i="${i}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-act="sp-del" data-sys="${s.id}" data-i="${i}">Eliminar</button>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="4" class="text-muted">Sin planetas</td></tr>`;

    // Si el sistema no tiene nombre, mostramos “Sistema #id”
    const nombre = s.nombre?.trim() || `Sistema #${s.id}`;
    // Tarjeta completa con resumen + tabla de planetas + acciones
    return `
      <div class="card mb-3" data-sys="${s.id}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center gap-2">
              <h5 class="mb-0 system-name">${nombre}</h5>
              <button class="btn btn-sm btn-outline-primary" data-act="s-name" data-sys="${s.id}">Editar nombre</button>
            </div>
            <small class="text-muted">${fecha}</small>
          </div>
          <ul class="list-group mb-3">
            <li class="list-group-item d-flex justify-content-between"><span>Planetas</span><strong>${fmt(totalCant)}</strong></li>
            <li class="list-group-item d-flex justify-content-between"><span>Masa total</span><strong>${fmt(totalMasa)}</strong></li>
            <li class="list-group-item d-flex justify-content-between"><span>Masa restante</span><strong>${fmt(rest)}</strong></li>
          </ul>
          <div class="table-responsive mb-2">
            <table class="table table-sm align-middle">
              <thead><tr><th>Nombre</th><th>Masa</th><th>Cantidad</th><th class="text-end">Acciones</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-danger btn-sm" data-act="s-del" data-sys="${s.id}">Eliminar sistema</button>
          </div>
        </div>
      </div>`;
  }).join("");
}

/* --------- acciones builder --------- */
// Lee el <form> del builder, valida y agrega el planeta al arreglo local.
function addPlanetFromForm(form){
  const fd=new FormData(form);
  const p={ nombre:String(fd.get("nombre")||"").trim(), masa:Number(fd.get("masa")), cantidad:Math.max(1, Math.floor(Number(fd.get("cantidad"))||0)) };
  if(!p.nombre) return msg("warning","Indica un nombre.");
  if(isNaN(p.masa)||p.masa<0) return msg("warning","Masa inválida.");
  if(isNaN(p.cantidad)||p.cantidad<1) return msg("warning","Cantidad inválida.");
  // Valida que no superes la masa máxima disponible (usa lógica del estado)
  if(!canAddPlanet(builder.planets,p)){
    const {rest}=summarize(builder.planets); const max=(rest/p.cantidad).toFixed(2);
    return msg("warning",`Excedes el tope (${fmt(MASS_CAP)}). Restante ${fmt(rest)}. Máx ${max} por unidad.`);
  }
  // Agrega, limpia el form y re-dibuja
  builder.planets.push(p); form.reset(); renderBuilder(); msg("success","Planeta agregado.");
}

// Pasa al modo de “poner nombre” para poder guardar el sistema
function startNaming(){ if(!builder.planets.length) return msg("warning","Agrega al menos un planeta."); builder.naming=true; renderBuilder(); $("#inputSystemName")?.focus(); }
// Toma el nombre, guarda el sistema completo en localStorage (vía state.js) y resetea el builder
function saveCurrentSystem(){
  const name=($("#inputSystemName")?.value||"").trim();
  if(!name) return msg("warning","Ingresa un nombre.");
  addSystem(name,builder.planets); builder.planets=[]; builder.naming=false; builder.editIndex=null;
  renderBuilder(); renderSystems(); msg("success","Sistema guardado.");
}
// Resetea el builder manualmente (sin guardar)
function newBuilder(){ builder.planets=[]; builder.naming=false; builder.editIndex=null; renderBuilder(); msg("info","Nuevo sistema iniciado."); }

/* --------- delegación de eventos --------- */
// Un único listener para toda la página. Captura clicks en botones y decide qué hacer
document.body.addEventListener("click",(e)=>{
  const b=e.target.closest("button"); if(!b) return;

  // Acciones del builder (por id de botón)
  if(b.id==="btnTerminarSistema") return startNaming();
  if(b.id==="btnGuardarSistema") return saveCurrentSystem();
  if(b.id==="btnCancelarNombre"){ builder.naming=false; return renderBuilder(); }
  if(b.id==="btnNuevoSistema") return newBuilder();

  // Acciones del builder por data-act (en filas)
  if(b.dataset.act==="b-del"){ builder.planets.splice(Number(b.dataset.i),1); if(builder.editIndex!==null) builder.editIndex=null; return renderBuilder(); }
  if(b.dataset.act==="b-edit"){ builder.editIndex=Number(b.dataset.i); return renderBuilder(); }
  if(b.dataset.act==="b-cancel"){ builder.editIndex=null; return renderBuilder(); }
  if(b.dataset.act==="b-save"){
    // Guardar edición inline de una fila del builder
    const i = Number(b.dataset.i);
    const tr = b.closest("tr");
    const name = tr.querySelector(".b-name").value.trim();
    const masa = Number(tr.querySelector(".b-masa").value);
    const cant = Math.max(1, Math.floor(Number(tr.querySelector(".b-cant").value)||0));
    if(!name) return msg("warning","Nombre vacío.");
    if(isNaN(masa)||masa<0) return msg("warning","Masa inválida.");
    if(isNaN(cant)||cant<1) return msg("warning","Cantidad inválida.");

    // Validar que el cambio no exceda el tope total del sistema en edición
    const copy = builder.planets.map(p=>({...p}));
    copy[i] = { nombre:name, masa, cantidad:cant };
    if (summarize(copy).rest < 0) return msg("warning","Con esos valores excedes la masa máxima del sistema.");

    builder.planets[i] = { nombre:name, masa, cantidad:cant };
    builder.editIndex=null; renderBuilder(); msg("success","Planeta actualizado.");
    return;
  }

  // Acciones sobre “Sistemas guardados”
  if(b.id==="btnLimpiarSistemas"){ clearAll(); renderSystems(); return msg("success","Se borraron todos los sistemas."); }
  if(b.dataset.act==="s-del"){ deleteSystem(Number(b.dataset.sys)); renderSystems(); return msg("success","Sistema eliminado."); }

  // Editar nombre del sistema (toggle contenteditable)
  if(b.dataset.act==="s-name"){
    const card=b.closest(".card"); const h=card.querySelector(".system-name");
    // Obtenemos el id del sistema desde la tarjeta
    const sysId=Number(card.parentElement.parentElement.dataset.sys || card.dataset.sys || card.closest(".card").dataset.sys);
    const editing=h.getAttribute("contenteditable")==="true";
    if(!editing){ // Entrar a edición
      h.setAttribute("contenteditable","true"); h.focus(); b.textContent="Guardar nombre";
    }
    else{         // Guardar edición
      const name=h.textContent.trim(); if(!name) return msg("warning","Nombre vacío.");
      updateSystemName(sysId,name);
      h.setAttribute("contenteditable","false"); b.textContent="Editar nombre";
      renderSystems(); msg("success","Nombre actualizado.");
    }
    return;
  }

  // Editar planeta dentro de un sistema guardado
  if(b.dataset.act==="sp-edit"){
    const tr=b.closest("tr");
    const sysId=Number(b.dataset.sys);
    const i=Number(b.dataset.i);
    const editing=tr.dataset.editing==="1";

    if(!editing){
      // Entrar a edición: guardo valores originales por si cancelo
      tr.dataset.editing="1";
      tr.dataset.origName = tr.querySelector(".pname").textContent;
      tr.dataset.origMasa = tr.querySelector(".pmasa").textContent;
      tr.dataset.origCant = tr.querySelector(".pcant").textContent;

      // Hacer celdas editables y cambiar texto del botón
      tr.querySelectorAll(".pname,.pmasa,.pcant").forEach(td=>td.setAttribute("contenteditable","true"));
      b.textContent="Guardar";

      // Creo botón “Cancelar” al lado del “Guardar”
      const actionsTd = tr.querySelector("td:last-child");
      const cancelBtn = document.createElement("button");
      cancelBtn.className="btn btn-sm btn-outline-secondary ms-2";
      cancelBtn.textContent="Cancelar";
      cancelBtn.setAttribute("data-act","sp-cancel");
      cancelBtn.setAttribute("data-sys", String(sysId));
      cancelBtn.setAttribute("data-i", String(i));
      actionsTd.appendChild(cancelBtn);
    } else {
      // Guardar cambios de la edición
      const name=tr.querySelector(".pname").textContent.trim();
      const masa=Number(tr.querySelector(".pmasa").textContent.trim());
      const cant=Math.max(1, Math.floor(Number(tr.querySelector(".pcant").textContent.trim())||0));

      if(!name) return msg("warning","Nombre vacío.");
      if(isNaN(masa)||masa<0) return msg("warning","Masa inválida.");
      if(isNaN(cant)||cant<1) return msg("warning","Cantidad inválida.");

      // Validación contra el tope de masa del sistema guardado
      const sys=getSystems().find(s=>s.id===sysId);
      const copy=sys.planets.map(p=>({...p})); copy[i]={nombre:name, masa, cantidad:cant};
      if (summarize(copy).rest < 0) return msg("warning","Excedes la masa máxima del sistema.");

      updateSystemPlanet(sysId,i,{nombre:name, masa, cantidad:cant});
      tr.dataset.editing="0";
      tr.querySelectorAll(".pname,.pmasa,.pcant").forEach(td=>td.setAttribute("contenteditable","false"));
      b.textContent="Editar";
      // Eliminar botón “Cancelar” y refrescar totales
      const cancel = tr.querySelector('[data-act="sp-cancel"]');
      if (cancel) cancel.remove();
      renderSystems(); msg("success","Planeta actualizado.");
    }
    return;
  }

  // Cancelar edición de un planeta dentro de un sistema guardado
  if(b.dataset.act==="sp-cancel"){
    const tr=b.closest("tr");
    // Restaurar los valores guardados al entrar a edición
    tr.querySelector(".pname").textContent = tr.dataset.origName || tr.querySelector(".pname").textContent;
    tr.querySelector(".pmasa").textContent = tr.dataset.origMasa || tr.querySelector(".pmasa").textContent;
    tr.querySelector(".pcant").textContent = tr.dataset.origCant || tr.querySelector(".pcant").textContent;
    tr.dataset.editing="0";
    tr.querySelectorAll(".pname,.pmasa,.pcant").forEach(td=>td.setAttribute("contenteditable","false"));
    // Restaurar botón “Editar” y remover “Cancelar”
    const editBtn = tr.querySelector('[data-act="sp-edit"]');
    if (editBtn) editBtn.textContent = "Editar";
    const cancel = tr.querySelector('[data-act="sp-cancel"]');
    if (cancel) cancel.remove();
    return;
  }

  // Eliminar planeta de un sistema guardado
  if(b.dataset.act==="sp-del"){ deleteSystemPlanet(Number(b.dataset.sys),Number(b.dataset.i)); renderSystems(); return msg("success","Planeta eliminado."); }
});

/* --------- form submit --------- */
// Manejo del submit del formulario del builder (agrega un planeta nuevo)
$("#form-add-planet").addEventListener("submit",(e)=>{ e.preventDefault(); addPlanetFromForm(e.currentTarget); });

/* --------- init --------- */
// Inicializa el store (carga desde localStorage o desde data/sistemas.json con fetch)
// y dibuja la UI inicial.
await initStore();
renderBuilder();
renderSystems();