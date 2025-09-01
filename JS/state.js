// Capa de “estado” y persistencia. Aquí NO hay DOM ni HTML.
// Solo funciones para leer/guardar datos y utilidades de negocio (sumas, validaciones).

export const MASS_CAP = 1000;          // Masa máxima del sistema
const KEY = "sistemas_solares";        // Clave de localStorage

// Estructura en memoria (no exportamos directa para evitar mutaciones accidentales)
let systems = []; // [{id, fechaISO, nombre, planets:[{nombre, masa, cantidad}]}]

// Inicializa el store:
// 1) Si hay datos en localStorage, los usa.
// 2) Si NO hay, intenta cargar “data/sistemas.json” con fetch (base simulada) y lo persiste.
// 3) Si algo falla, deja un arreglo vacío y persiste.
export async function initStore() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) { systems = JSON.parse(saved) || []; return; }
    // carga inicial desde JSON
    const res = await fetch("JSON/sistemas.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    systems = await res.json();
    save();
  } catch (e) {
    systems = []; save(); // fallback
  }
}

// Devuelve una COPIA (shallow) para no exponer referencia interna
export const getSystems = () => systems.slice();

// Guarda el estado actual en localStorage (try/catch por si storage está lleno/bloqueado)
export function save() { try { localStorage.setItem(KEY, JSON.stringify(systems)); } catch {} }

// Borra todo el estado (y persiste esa limpieza)
export function clearAll() { systems = []; save(); }

// ===== CRUD de sistemas =====

// Crea un sistema nuevo a partir de un nombre + arreglo de planetas y lo persiste
export function addSystem(nombre, planets) {
  systems.push({ id: Date.now(), fechaISO: new Date().toISOString(), nombre: (nombre||"").trim(), planets: planets.map(p=>({...p})) });
  save();
}

// Elimina por id
export function deleteSystem(id) { systems = systems.filter(s => s.id !== id); save(); }

// Cambia el nombre de un sistema
export function updateSystemName(id, name) { const s = systems.find(x=>x.id===id); if (s){ s.nombre=(name||"").trim(); save(); } }

// Actualiza un planeta de un sistema (índice i). Devuelve false si no existe.
export function updateSystemPlanet(id, i, data){
  const s=systems.find(x=>x.id===id);
  if(!s||!s.planets[i])return false;
  s.planets[i]={...s.planets[i],...data};
  save();
  return true;
}

// Elimina un planeta (índice i) de un sistema
export function deleteSystemPlanet(id, i){
  const s=systems.find(x=>x.id===id);
  if(!s)return;
  s.planets.splice(i,1);
  save();
}

// ===== Utilidades de negocio =====

// Dado un arreglo de planetas, calcula totales y “restante” respecto a MASS_CAP
export function summarize(planets){
  const totalMasa = planets.reduce((a,p)=>a+Number(p.masa)*Number(p.cantidad),0);
  const totalCant = planets.reduce((a,p)=>a+Number(p.cantidad),0);
  return { totalCant, totalMasa, rest: MASS_CAP-totalMasa };
}

// Verifica si puedo agregar (masa*cantidad) a la lista actual sin pasarme del tope
export function canAddPlanet(curr,{masa,cantidad}){
  return Number(masa)*Number(cantidad) <= summarize(curr).rest;
}