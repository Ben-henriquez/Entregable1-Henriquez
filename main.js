const planetas = [
    {
        planeta: "Mercurio",
        masa: "3.30 × 10^23 kg",
        sobrevive: false,
        clima: "Extremadamente caliente de día (+430°C) y muy frío de noche (-180°C)"
    },
    {
        planeta: "Venus",
        masa: "4.87 × 10^24 kg",
        sobrevive: false,
        clima: "Muy caliente y con nubes de ácido sulfúrico, efecto invernadero extremo"
    },
    {
        planeta: "Tierra",
        masa: "5.97 × 10^24 kg",
        sobrevive: true,
        clima: "Variado, con agua líquida, atmósfera rica en oxígeno y temperaturas estables"
    },
    {
        planeta: "Marte",
        masa: "6.42 × 10^23 kg",
        sobrevive: "con asistencia",
        clima: "Frío y seco, tormentas de polvo, atmósfera delgada rica en CO₂"
    },
    {
        planeta: "Júpiter",
        masa: "1.90 × 10^27 kg",
        sobrevive: false,
        clima: "Tormentas gigantes como la Gran Mancha Roja, extremadamente ventoso"
    },
    {
        planeta: "Saturno",
        masa: "5.68 × 10^26 kg",
        sobrevive: false,
        clima: "Vientos intensos y bandas nubosas, atmósfera rica en hidrógeno y helio"
    },
    {
        planeta: "Urano",
        masa: "8.68 × 10^25 kg",
        sobrevive: false,
        clima: "Muy frío, con vientos fuertes y tormentas de metano"
    },
    {
        planeta: "Neptuno",
        masa: "1.02 × 10^26 kg",
        sobrevive: false,
        clima: "Vientos supersónicos, atmósfera rica en metano, muy frío"
    }
];


// Función 1: Solicitar el planeta al usuario
function pedirPlaneta() {
    return prompt("Escribe el nombre de un planeta para simular la supervivencia (ej: Marte):");
}

// Función 2: Busca los datos del planeta según lo solicitado por el usuario
function buscarPlaneta(nombre) {
    return planetas.find(p => p.planeta.toLowerCase() === nombre.toLowerCase());
}

// Función 3: Muestra resultado en consola
function mostrarResultado(planeta) {
    console.log("Planeta: ", planeta.planeta);
    console.log("Masa: ", planeta.masa);
    console.log("Clima: ", planeta.clima);

    if (planeta.sobrevive === true) {
        console.log("¡Puedes sobrevivir aquí sin ayuda tecnológica! ¡SALVADOS!");
    } else if (planeta.sobrevive === "con asistencia") {
        console.log("Puedes sobrevivir con asistencia tecnológica. ¡SOBREVIVISTE YEIIII!");
    } else {
        console.log("No puedes sobrevivir aquí. Condiciones extremas. ¡FATALITYYYY!");
    }
}

// Función principal que une todo el JS
function simular() {
    alert("Simulador de Supervivencia Humana en el Sistema Solar");
    const nombre = pedirPlaneta();

    if (!nombre) {
        alert("No ingresaste ningún planeta. Intenta nuevamente");
        return;
    }

    const planeta = buscarPlaneta(nombre);

    if (planeta) {
        mostrarResultado(planeta);
    } else {
        console.log("Planeta no encontrado. Intenta con otro nombre dentro del listado: Mercurio, Venus, Tierra, Marte, Jupiter, Saturno, Urano o Neptuno");
    }
}

// Ejecutar script
simular();
