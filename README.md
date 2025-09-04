Entrega Final – Simulador de Sistema Solar

Tecnologías / Librerías
1. JavaScript (ES Modules) + DOM / Eventos
2. Bootstrap 5 (estilos UI)
3. dayjs (formato de fechas, CDN)
4. localStorage (persistencia en navegador)
5. fetch para cargar data/sistemas.json la primera vez

Estructura del proyecto
├─ CSS/
│  └─ style.css     # Estilos del sitio
│  └─ fondo.mp4     # fondo decorativo acorde a la temática
├─ JS/
│  ├─ main.js        # UI: eventos, render y validaciones de interacción
│  └─ state.js       # Lógica de datos, persistencia y reglas de negocio
├─ data/
│  └─ sistemas.json  # Base de datos vacía para cargar la primera vez (arreglo JSON)
├─ index.html        # Front del sitio
└─ README.md

Cómo usar el simulador

1. Agregar planeta
    - Campos a completar: Nombre, Masa (> 0) y Cantidad (> 1) -> Agregar.
2. Resumen
    - En tabla resumen verás: Cantidad total, Masa total y Masa restante (capacidad hasta: 1000).
3. Editar/Eliminar en el Resumen
    - Editar convierte la fila en un form editable con los botones Guardar/Cancelar.
    - Eliminar quita el planeta en cuestión del sistema seleccionado.
4. Terminar este sistema
    - Ingresa un nombre a tu sistema y guarda. El sistema queda en la lista de Sistemas guardados.
5. Sistemas guardados
    - Editar nombre (toggle contentEditable).
    - Editar planeta (Guardar / Cancelar).
    - Eliminar planeta o Eliminar sistema completo.
6. Borrar todos: limpia la lista (y localStorage).

Reglas y validaciones

- Límite de masa del sistema es de 1000.
- No se permite masa negativa ni cantidad < 1.
- Al agregar o editar planetas se valida que la masa total no supere el límite.

Arquitectura

1. JS/state.js (datos)
    Carga inicial: localStorage; si está vacío, fetch("data/sistemas.json") y persiste.
    API:
        cargarEstado(), obtenerSist(), save(), clsAll()
        agnadirSist(nombre, planetas), borrarSist(id)
        renameSist(id, name), renamePlaneta(id, idx, data), borrarPlaneta(id, idx)
        Totales(planetas) → { totalCant, totalMasa, rest }
        agnadirPlaneta(curr, nuevoPlaneta) → boolean (nuevoPlaneta = { masa, cantidad })

2. JS/app.js (interacción)
    Maneja eventos (delegación) y render mediante template strings.
    Usa dayjs para formateo de fechas.
    No contiene lógica de persistencia, lógica delegada en state.js.

Checklist de la consigna final:

1. Al menos dos archivos JavaScript ( main.js, state.js).
2. Un archivo .json (data/sistemas.json) cargado con fetch.
3. DOM + Eventos (agregar/editar/eliminar, delegación de eventos).
4. Circuito completo de interacción (builder -> nombrar -> guardar -> editar/borrar).
5. Persistencia con localStorage.
6. Validaciones y mensajes UX (sin alert/confirm/prompt).
7. Librería externa JS usada (dayjs).
8. Código dividido y comentado, HTML sin listados estáticos (render con JS).