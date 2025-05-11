const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializa Firebase con un try-catch para evitar errores bloqueantes
try {
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  console.log("Firebase conectado correctamente");
} catch (e) {
  console.error("Error al inicializar Firebase:", e);
}

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const resetBtn = document.getElementById('reset');
    const levelSelect = document.getElementById('level');
    const movesDisplay = document.getElementById('moves');
    const devPanel = document.getElementById('dev-panel');
    const graphContainer = document.getElementById('graph-container');

    let moves = 0;
    let frogs = [];
    let currentLevel = 3;
    let devMode = false;

    // Soluciones precalculadas (se mantienen igual)
    const solutions = {
        1: [
            "Inicio: V _ R",
            "Paso 1: _ V R  (V se mueve a la derecha)",
            "Paso 2: R V _  (R salta sobre V)",
            "Paso 3: R _ V  (R se mueve a la izquierda)"
        ],
        // ... (resto de soluciones)
    };

    // Inicializar juego (sin cambios)
    function initGame() {
        currentLevel = parseInt(levelSelect.value);
        moves = 0;
        movesDisplay.textContent = `Movimientos: ${moves}`;
        
        frogs = [
            ...Array(currentLevel).fill('green'),
            'empty',
            ...Array(currentLevel).fill('red')
        ];
        
        renderBoard();
        if (devMode) updateSolutionGraph();
    }

    // Renderizar tablero (sin cambios)
    function renderBoard() {
        board.innerHTML = '';
        frogs.forEach((frog, index) => {
            const div = document.createElement('div');
            if (frog === 'empty') {
                div.className = 'empty';
                div.addEventListener('click', () => moveFrog(index));
            } else {
                div.className = `frog ${frog}`;
                div.textContent = frog === 'green' ? '→' : '←';
                div.addEventListener('click', () => moveFrog(index));
            }
            board.appendChild(div);
        });
    }

    // Mover rana (sin cambios)
    function moveFrog(index) {
        const frog = frogs[index];
        if (frog === 'empty') return;

        const direction = frog === 'green' ? 1 : -1;
        const nextIndex = index + direction;
        const jumpIndex = index + 2 * direction;

        if (frogs[nextIndex] === 'empty') {
            [frogs[index], frogs[nextIndex]] = [frogs[nextIndex], frogs[index]];
            moves++;
        } else if (
            frogs[nextIndex] && frogs[nextIndex] !== frog && 
            frogs[jumpIndex] === 'empty'
        ) {
            [frogs[index], frogs[jumpIndex]] = [frogs[jumpIndex], frogs[index]];
            moves++;
        }

        movesDisplay.textContent = `Movimientos: ${moves}`;
        renderBoard();
        checkWin();
    }

    // Función checkWin CORREGIDA
    function checkWin() {
        const winState = [
            ...Array(currentLevel).fill('red'),
            'empty',
            ...Array(currentLevel).fill('green')
        ];
        
        if (JSON.stringify(frogs) === JSON.stringify(winState)) {
            // Guardar en Firebase si está disponible
            if (typeof database !== 'undefined') {
                const gameData = {
                    level: currentLevel,
                    moves: moves,
                    timestamp: new Date().toISOString()
                };
                
                database.ref('partidas/' + Date.now()).set(gameData)
                    .then(() => console.log("Datos guardados en Firebase"))
                    .catch(e => console.error("Error al guardar:", e));
            }
            
            setTimeout(() => alert(`¡Ganaste en ${moves} movimientos! 🎉`), 100);
        }
    }

    // Resto del código (sin cambios)
    function updateSolutionGraph() {
        if (!solutions[currentLevel]) {
            graphContainer.textContent = "Solución no disponible para este nivel.";
            return;
        }
        graphContainer.textContent = solutions[currentLevel].join('\n');
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            devMode = !devMode;
            devPanel.classList.toggle('hidden', !devMode);
            updateSolutionGraph();
        }
    });

    resetBtn.addEventListener('click', initGame);
    levelSelect.addEventListener('change', initGame);

    initGame();
});
