//Creado por Benjamín Henríquez

// Importamos dayjs desde un CDN para formatear fechas en las cards de sistemas
import dayjs from "https://cdn.jsdelivr.net/npm/dayjs@1.11.11/+esm";

// Importamos la “capa de estado” con toda la lógica de datos / persistencia
import {
  MASA_TOPE, EstadoCarga, obtenerSist, clsAll,
  agnadirSist, borrarSist, renameSist, renamePlaneta, borrarPlaneta,
  Totales, agnadirPlaneta
} from "./state.js";

// Atajo para querySelector. Permite hacer $('selector') de forma breve.
const $ = (s,c=document)=>c.querySelector(s);
// Formateo numérico a formato local (separador de miles, etc.)
const format = n => Number(n).toLocaleString("es-CL");
// Pequeño sistema de mensajes no intrusivo (sin alert, ni confirm).
// Inserta un <div class="alert ..."> dentro de #messenger y lo limpia.
const messenger = (type,text)=>{
  const b=$("#messenger"); if(!b) return;
  b.innerHTML=`<div class="alert alert-${type} mb-0" role="alert">${text}</div>`;
  setTimeout(()=>{ if (b.firstChild) b.innerHTML=""; }, 2500);
};

// Estado SOLO para la sección de “constructor” (antes de guardar el sistema).
const builder = { planetas: [], pedirnombre:false, editIndice:null };

// Dibuja la sección del builder, los totales y filas de la tabla.
function renderBuilder(){
  // Obtenemos totales con una función de la capa de estado
  const {totalCant,totalMasa,rest}=Totales(builder.planetas);
  // Pinta totales en los spans del resumen
  $("#sumCantidad").textContent=format(totalCant);
  $("#sumMasa").textContent=format(totalMasa);
  $("#sumRestante").textContent=format(rest);

  // Construimos las filas de la tabla del builder:
  // - Si NO estamos editando esa fila se procede a mostrar texto + botones Editar y Eliminar
  // - Si SÍ estamos editando esa fila se procede a mostrar inputs + botones Guardar y Cancelar
    const rows = builder.planetas.length
      ? builder.planetas.map((p,i)=>{
          const editando = builder.editIndice === i;
          if (!editando) {
            return `
              <tr>
                <td>${p.nombre}</td>
                <td>${p.masa}</td>
                <td>${p.cantidad}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-secondary" dataccion="buil-edit" data-i="${i}">Editar</button>
                  <button class="btn btn-sm btn-outline-danger" dataccion="buil-eli" data-i="${i}">Eliminar</button>
                </td>
              </tr>`;
          } else {
            return `
              <tr>
                <td><input class="form-control form-control-sm edi-name" value="${p.nombre}"></td>
                <td><input class="form-control form-control-sm b-masa" type="number" step="0.01" min="0" value="${p.masa}"></td>
                <td><input class="form-control form-control-sm b-cant" type="number" min="1" step="1" value="${p.cantidad}"></td>
                <td class="text-end">
                  <button class="btn btn-sm btn-primary" dataccion="b-save" data-i="${i}">Guardar</button>
                  <button class="btn btn-sm btn-outline-secondary" dataccion="b-esc">Cancelar</button>
                </td>
              </tr>`;
          }
        }).join("")
      : `<tr><td colspan="4" class="text-muted">Aún no agregas planetas.</td></tr>`;

  // Inserta el HTML generado en el <tbody> del builder
  $("#cuerpoTabla").innerHTML = rows;
  // Muestra y oculta el bloque de “Nombrar sistema”
  $("#builderName").classList.toggle("d-none", !builder.pedirnombre);
}

// Dibuja la lista de “Sistemas guardados”. Todo se genera con template strings.
function renderSistemas(){
  const cont = $("#listaSistemas");
  // Trae una copia del estado persistido (para que no lo puedas no puedas modificar sin querer)
  const systems = obtenerSist();
  if(!systems.length){ cont.innerHTML=`<div class="text-muted">Aún no hay sistemas guardados.</div>`; return; }

  // Armamos cada tarjeta de sistema (ordenada por id descendente)
  cont.innerHTML = systems.slice().sort((a,b)=>b.id-a.id).map(s=>{
    const {totalCant,totalMasa,rest}=Totales(s.planetas);
    const fecha = dayjs(s.Formatfecha).format("DD/MM/YYYY HH:mm");
    // Filas de la tabla interna con los planetas del sistema guardado
    const rows = s.planetas.length ? s.planetas.map((p,i)=>`
      <tr data-sys="${s.id}" data-i="${i}">
        <td class="nombre-planeta" contenteditable="false">${p.nombre}</td>
        <td class="masa-planeta" contenteditable="false">${p.masa}</td>
        <td class="cantidad-planeta" contenteditable="false">${p.cantidad}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary" dataccion="sp-edit" data-sys="${s.id}" data-i="${i}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" dataccion="sp-eli" data-sys="${s.id}" data-i="${i}">Eliminar</button>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="4" class="text-muted">Sin planetas</td></tr>`;

    // Si el sistema no tiene nombre, mostramos “Sistema + #id”
    const nombre = s.nombre?.trim() || `Sistema #${s.id}`;
    // Tarjeta completa con el resumen + la tabla de planetas + las acciones
    return `
      <div class="card mb-3" data-sys="${s.id}">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center gap-2">
              <h5 class="mb-0 system-name">${nombre}</h5> <!-- system-name → titulo-sistema -->
              <button class="btn btn-sm btn-outline-primary" dataccion="sis-name" data-sys="${s.id}">Editar nombre</button> <!-- s-name → sistema-editar-nombre -->
            </div>
            <small class="text-muted">${fecha}</small>
          </div>
          <ul class="list-group mb-3">
            <li class="list-group-item d-flex justify-content-between"><span>Planetas</span><strong>${format(totalCant)}</strong></li>
            <li class="list-group-item d-flex justify-content-between"><span>Masa total</span><strong>${format(totalMasa)}</strong></li>
            <li class="list-group-item d-flex justify-content-between"><span>Masa restante</span><strong>${format(rest)}</strong></li>
          </ul>
          <div class="table-responsive mb-2">
            <table class="table table-sm align-middle">
              <thead><tr><th>Nombre</th><th>Masa</th><th>Cantidad</th><th class="text-end">Acciones</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-danger btn-sm" dataccion="s-eli" data-sys="${s.id}">Eliminar sistema</button> <!-- s-del → sistema-eliminar -->
          </div>
        </div>
      </div>`;
  }).join("");
}

// Lee el <form> del builder, valida y agrega el planeta al arreglo local.
function agregarPlaneta(form){
  const fd=new FormData(form);
  const p={ nombre:String(fd.get("nombre")||"").trim(), masa:Number(fd.get("masa")), cantidad:Math.max(1, Math.floor(Number(fd.get("cantidad"))||0)) };
  if(!p.nombre) return messenger("warning","Indica un nombre.");
  if(isNaN(p.masa)||p.masa<0) return messenger("warning","Masa inválida.");
  if(isNaN(p.cantidad)||p.cantidad<1) return messenger("warning","Cantidad inválida.");
  // Valida que no superes la masa máxima disponible (usa lógica del estado)
  if(!agnadirPlaneta(builder.planetas,p)){
    const {rest}=Totales(builder.planetas); const max=(rest/p.cantidad).toFixed(2);
    return messenger("warning",`Excedes el tope (${format(MASA_TOPE)}). Restante ${format(rest)}. Máx ${max} por unidad.`);
  }
  // Agrega, limpia el form y re-dibuja
  builder.planetas.push(p); form.reset(); renderBuilder(); messenger("success","Planeta agregado.");
}

// Pasa al modo de “poner nombre” para poder guardar el sistema
function iniciarNombre(){
  if(!builder.planetas.length) return messenger("warning","Agrega al menos un planeta.");
  builder.pedirnombre=true; renderBuilder(); $("#inputSystemName")?.focus();
}
// Toma el nombre, guarda el sistema completo en localStorage (vía state.js) y resetea el builder
function guardarSistema(){
  const name=($("#inputSystemName")?.value||"").trim();
  if(!name) return messenger("warning","Ingresa un nombre.");
  agnadirSist(name,builder.planetas); builder.planetas=[]; builder.pedirnombre=false; builder.editIndice=null;
  renderBuilder(); renderSistemas(); messenger("success","Sistema guardado.");
}
// Resetea el builder manualmente (sin guardar)
function nuevoSistema(){
  builder.planetas=[]; builder.pedirnombre=false; builder.editIndice=null;
  renderBuilder(); messenger("info","Nuevo sistema iniciado.");
}

// Un único listener para toda la página. Captura clicks en botones y decide qué hacer
document.body.addEventListener("click",(e)=>{
  const b=e.target.closest("btn"); if(!b) return;

  // Acciones del builder (por id de cada botón)
  if(b.id==="btnTerminarSistema") return iniciarNombre();
  if(b.id==="btnGuardarSistema") return guardarSistema();
  if(b.id==="btnCancelarNombre"){ builder.pedirnombre=false; return renderBuilder(); }
  if(b.id==="btnNuevoSistema") return nuevoSistema();

  // Acciones del builder por data-act (en filas)
  if(b.dataset.act==="buil-eli"){ builder.planetas.splice(Number(b.dataset.i),1); if(builder.editIndice!==null) builder.editIndice=null; return renderBuilder(); }
  if(b.dataset.act==="buil-edit"){ builder.editIndice=Number(b.dataset.i); return renderBuilder(); }
  if(b.dataset.act==="b-esc"){ builder.editIndice=null; return renderBuilder(); }
  if(b.dataset.act==="b-save"){
    // Guardar edición inline de una fila del builder
    const i = Number(b.dataset.i);
    const fila = b.closest("fila");
    const name = fila.querySelector(".edi-name").value.trim();
    const masa = Number(fila.querySelector(".b-masa").value);
    const cant = Math.max(1, Math.floor(Number(fila.querySelector(".b-cant").value)||0));
    if(!name) return messenger("warning","Nombre vacío.");
    if(isNaN(masa)||masa<0) return messenger("warning","Masa inválida.");
    if(isNaN(cant)||cant<1) return messenger("warning","Cantidad inválida.");

    // Validamos que el cambio no exceda el tope total de masa del sistema en edición de 1000
    const copy = builder.planetas.map(p=>({...p}));
    copy[i] = { nombre:name, masa, cantidad:cant };
    if (Totales(copy).rest < 0) return messenger("warning","Con esos valores excedes la masa máxima del sistema.");

    builder.planetas[i] = { nombre:name, masa, cantidad:cant };
    builder.editIndice=null; renderBuilder(); messenger("success","Planeta actualizado.");
    return;
  }

  // Acciones sobre “Sistemas guardados”
  if(b.id==="btnLimpiarSistemas"){ clsAll(); renderSistemas(); return messenger("success","Se borraron todos los sistemas."); }
  if(b.dataset.act==="s-eli"){ borrarSist(Number(b.dataset.sys)); renderSistemas(); return messenger("success","Sistema eliminado."); }

  // Editar nombre del sistema
  if(b.dataset.act==="sis-name"){
    const card=b.closest(".card"); const h=card.querySelector(".system-name");
    // Obtenemos el id del sistema desde la card
    const sysId=Number(card.parentElement.parentElement.dataset.sys || card.dataset.sys || card.closest(".card").dataset.sys);
    const editando=h.getAttribute("contenteditable")==="true";
    if(!editando){ // Entrar en modo edición
      h.setAttribute("contenteditable","true"); h.focus(); b.textContent="Guardar nombre";
    }
    else{         // Guardar los cambios
      const name=h.textContent.trim(); if(!name) return messenger("warning","Nombre vacío.");
      renameSist(sysId,name);
      h.setAttribute("contenteditable","false"); b.textContent="Editar nombre";
      renderSistemas(); messenger("success","Nombre actualizado.");
    }
    return;
  }

  // Editar un planeta dentro de un sistema guardado
  if(b.dataset.act==="sp-edit"){
    const fila=b.closest("fila");
    const sysId=Number(b.dataset.sys);
    const i=Number(b.dataset.i);
    const editando=fila.dataset.editando==="1";

    if(!editando){
      // Entrar a modo edición: se guarda los valores originales por si cancela
      fila.dataset.editando="1";
      fila.dataset.origName = fila.querySelector(".nombre-planeta").textContent;
      fila.dataset.origMasa = fila.querySelector(".masa-planeta").textContent;
      fila.dataset.origCant = fila.querySelector(".cantidad-planeta").textContent;

      // Hacer celdas editables y cambiar texto del botón
      fila.querySelectorAll(".nombre-planeta,.masa-planeta,.cantidad-planeta").forEach(td=>td.setAttribute("contenteditable","true"));
      b.textContent="Guardar";

      // Creo botón “Cancelar” al lado del “Guardar”
      const actionsTd = fila.querySelector("td:last-child");
      const cancelBtn = document.createElement("btn");
      cancelBtn.className="btn btn-sm btn-outline-secondary ms-2";
      cancelBtn.textContent="Cancelar";
      cancelBtn.setAttribute("dataccion","sist-cancel");
      cancelBtn.setAttribute("data-sys", String(sysId));
      cancelBtn.setAttribute("data-i", String(i));
      actionsTd.appendChild(cancelBtn);
    } else {
      // Guardar cambios de la edición
      const name=fila.querySelector(".nombre-planeta").textContent.trim();
      const masa=Number(fila.querySelector(".masa-planeta").textContent.trim());
      const cant=Math.max(1, Math.floor(Number(fila.querySelector(".cantidad-planeta").textContent.trim())||0));

      if(!name) return messenger("warning","Nombre vacío.");
      if(isNaN(masa)||masa<0) return messenger("warning","Masa inválida.");
      if(isNaN(cant)||cant<1) return messenger("warning","Cantidad inválida.");

      // Validación contra el tope de masa del sistema guardado
      const sys=obtenerSist().find(s=>s.id===sysId);
      const copy=sys.planetas.map(p=>({...p})); copy[i]={nombre:name, masa, cantidad:cant};
      if (Totales(copy).rest < 0) return messenger("warning","Excedes la masa máxima del sistema.");

      renamePlaneta(sysId,i,{nombre:name, masa, cantidad:cant});
      fila.dataset.editando="0";
      fila.querySelectorAll(".nombre-planeta,.masa-planeta,.cantidad-planeta").forEach(td=>td.setAttribute("contenteditable","false"));
      b.textContent="Editar";
      // Eliminar botón “Cancelar” y refrescar totales
      const cancel = fila.querySelector('[dataccion="sist-cancel"]');
      if (cancel) cancel.remove();
      renderSistemas(); messenger("success","Planeta actualizado.");
    }
    return;
  }

  // Cancelar edición de un planeta dentro de un sistema guardado
  if(b.dataset.act==="sist-cancel"){
    const fila=b.closest("fila");
    // Restaurar los valores guardados al entrar a edición
    fila.querySelector(".nombre-planeta").textContent = fila.dataset.origName || fila.querySelector(".nombre-planeta").textContent;
    fila.querySelector(".masa-planeta").textContent = fila.dataset.origMasa || fila.querySelector(".masa-planeta").textContent;
    fila.querySelector(".cantidad-planeta").textContent = fila.dataset.origCant || fila.querySelector(".cantidad-planeta").textContent;
    fila.dataset.editando="0";
    fila.querySelectorAll(".nombre-planeta,.masa-planeta,.cantidad-planeta").forEach(td=>td.setAttribute("contenteditable","false"));
    // Restaurar botón “Editar” y remover “Cancelar”
    const editBtn = fila.querySelector('[dataccion="sp-edit"]');
    if (editBtn) editBtn.textContent = "Editar";
    const cancel = fila.querySelector('[dataccion="sist-cancel"]');
    if (cancel) cancel.remove();
    return;
  }

  // Eliminar planeta de un sistema guardado
  if(b.dataset.act==="sp-eli"){ borrarPlaneta(Number(b.dataset.sys),Number(b.dataset.i)); renderSistemas(); return messenger("success","Planeta eliminado."); }
});

// Manejo del submit del formulario del builder (agrega un planeta nuevo al sistema)
$("#form-add-planet").addEventListener("submit",(e)=>{ e.preventDefault(); agregarPlaneta(e.currentTarget); });

// Inicializa el store (carga desde localStorage si es que ya existe un sistema creado o desde data/sistemas.json con fetch) y procede a dibujar la UI inicial.
await EstadoCarga();
renderBuilder();
renderSistemas();