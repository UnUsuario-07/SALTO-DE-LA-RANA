const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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

    // Soluciones precalculadas para cada nivel
    const solutions = {
        1: [
            "Inicio: V _ R",
            "Paso 1: _ V R  (V se mueve a la derecha)",
            "Paso 2: R V _  (R salta sobre V)",
            "Paso 3: R _ V  (R se mueve a la izquierda)"
        ],
        2: [
            "Inicio: V V _ R R",
            "Paso 1: V _ V R R",
            "Paso 2: V R V _ R",
            "Paso 3: V R V R _",
            "Paso 4: V R _ R V",
            "Paso 5: _ R V R V",
            "Paso 6: R _ V R V",
            "Paso 7: R R V _ V",
            "Paso 8: R R _ V V"
        ],
        3: [
            "Inicio: V V V _ R R R",
            "Paso 1: V V _ V R R R",
            "Paso 2: V V R V _ R R",
            "Paso 3: V V R V R _ R",
            "Paso 4: V V R _ R V R",
            "Paso 5: V _ R V R V R",
            "Paso 6: _ V R V R V R",
            "Paso 7: R V _ V R V R",
            "Paso 8: R V R V _ V R",
            "Paso 9: R V R V R V _",
            "Paso 10: R V R V R _ V",
            "Paso 11: R V R _ R V V",
            "Paso 12: R _ R V R V V",
            "Paso 13: R R _ V R V V",
            "Paso 14: R R R V _ V V",
            "Paso 15: R R R _ V V V"
        ],
        4: [
            "Inicio: V V V V _ R R R R",
            "Paso 1: V V V _ V R R R R",
            "Paso 2: V V V R V _ R R R",
            "Paso 3: V V V R V R _ R R",
            "Paso 4: V V V R _ R V R R",
            "Paso 5: V V _ R V R V R R",
            "Paso 6: V _ V R V R V R R",
            "Paso 7: _ V V R V R V R R",
            "Paso 8: R V V _ V R V R R",
            "Paso 9: R V V R V _ V R R",
            "Paso 10: R V V R V R V _ R",
            "Paso 11: R V V R V R V R _",
            "Paso 12: R V V R V R _ R V",
            "Paso 13: R V V R _ R V R V",
            "Paso 14: R V _ R V R V R V",
            "Paso 15: R _ V R V R V R V",
            "Paso 16: R R V _ V R V R V",
            "Paso 17: R R V R V _ V R V",
            "Paso 18: R R V R V R V _ V",
            "Paso 19: R R V R V R _ V V",
            "Paso 20: R R V R _ R V V V",
            "Paso 21: R R _ R V R V V V",
            "Paso 22: R R R R _ V V V V"
        ],
        5: [
            "Inicio: V V V V V _ R R R R R",
            "Paso 1: V V V V _ V R R R R R",
            "Paso 2: V V V V R V _ R R R R",
            "... (continuar con los 35 pasos completos)",
            "Paso 35: R R R R R _ V V V V V"
        ]
    };

    // Inicializar juego
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

    // Renderizar tablero
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

    // Mover rana
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

    // Verificar victoria
    function checkWin() {
        const winState = [
            ...Array(currentLevel).fill('red'),
            'empty',
            ...Array(currentLevel).fill('green')
        ];
        if (JSON.stringify(frogs) === JSON.stringify(winState)) {
            setTimeout(() => alert(`¡Ganaste en ${moves} movimientos! 🎉`), 100);
        }
    }

    // Modo desarrollo (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            devMode = !devMode;
            devPanel.classList.toggle('hidden', !devMode);
            updateSolutionGraph();
        }
    });

    // Actualizar grafo de solución
    function updateSolutionGraph() {
        if (!solutions[currentLevel]) {
            graphContainer.textContent = "Solución no disponible para este nivel.";
            return;
        }
        graphContainer.textContent = solutions[currentLevel].join('\n');
    }

    // Event listeners
    resetBtn.addEventListener('click', initGame);
    levelSelect.addEventListener('change', initGame);

    initGame();
});
