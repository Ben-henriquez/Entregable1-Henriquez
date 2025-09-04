//Creado por Benjamín Henríquez

// Solo funciones para leer/guardar datos y utilidades de negocio (sumas y validaciones).
export const MASA_TOPE = 1000;
const KEY = "sistemas_solares";

// Estructura en memoria (no exportamos directa para evitar ediciones accidentales)
let systems = [];

// Inicializa el simulador:
// 1. Si hay datos en localStorage, los usa.
// 2. Si NO hay, intenta cargar “data/sistemas.json” con fetch (base simulada) y lo persiste.
// 3. Si algo falla, deja un arreglo vacío y persiste.
export async function EstadoCarga() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) { systems = JSON.parse(saved) || []; return; }
    // carga inicial desde JSON
    const res = await fetch("data/sistemas.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    systems = await res.json();
    save();
  } catch (e) {
    systems = []; save();
  }
}

// Devuelve una COPIA  para no exponer referencia interna
export const obtenerSist = () => systems.slice();

// Guarda el estado actual en localStorage (try/catch por si storage está lleno o bloqueado)
export function save() { try { localStorage.setItem(KEY, JSON.stringify(systems)); } catch {} }

// Borra todo el estado (y persiste en limpiar)
export function clsAll() { systems = []; save(); }

// Crea un sistema nuevo a partir de un nombre más arreglo de planetas y lo persiste
export function agnadirSist(nombre, planetas) {
  systems.push({ id: Date.now(), fechaISO: new Date().toISOString(), nombre: (nombre||"").trim(), planetas: planetas.map(p=>({...p})) });
  save();
}

// Elimina por id
export function borrarSist(id) { systems = systems.filter(s => s.id !== id); save(); }

// Cambia el nombre de un sistema
export function renameSist(id, name) {
  const s = systems.find(x=>x.id===id);
  if (s){ s.nombre=(name||"").trim(); save(); }
}

// Actualiza un planeta de un sistema (índice i). Devuelve false si no existe.
export function renamePlaneta(id, i, data){
  const s=systems.find(x=>x.id===id);
  if(!s||!s.planetas[i])return false;
  s.planetas[i]={...s.planetas[i],...data};
  save();
  return true;
}

// Elimina un planeta (índice i) de un sistema
export function borrarPlaneta(id, i){
  const s=systems.find(x=>x.id===id);
  if(!s)return;
  s.planetas.splice(i,1);
  save();
}

// Dado un arreglo de planetas, calcula totales y “restante” respecto a MASS_TOPE
export function Totales(planetas){
  const totalMasa = planetas.reduce((a,p)=>a+Number(p.masa)*Number(p.cantidad),0);
  const totalCant = planetas.reduce((a,p)=>a+Number(p.cantidad),0);
  return { totalCant, totalMasa, rest: MASA_TOPE-totalMasa };
}

// Verifica si puedo agregar más masa a la lista actual sin pasarme del límite de 1000
export function agnadirPlaneta(curr,{masa,cantidad}){
  return Number(masa)*Number(cantidad) <= Totales(curr).rest;
}