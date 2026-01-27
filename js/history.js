/**
 * Gestiona el historial de cambios (Undo/Redo)
 */
export class HistoryManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.undoStack = [];
        this.redoStack = [];
        this.locked = false; // Bloqueo para evitar bucles al cargar estados
        this.maxStates = 20;

        // Guardar estado inicial
        this.saveState();

        this.initEvents();
        this.initKeyboard();
    }

    initEvents() {
        // Eventos que disparan un guardado de estado
        this.canvas.on('object:added', (e) => !this.locked && this.saveState());
        this.canvas.on('object:modified', (e) => !this.locked && this.saveState());
        this.canvas.on('object:removed', (e) => !this.locked && this.saveState());
    }

    initKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
        });
    }

    saveState() {
        if (this.redoStack.length > 0) {
            this.redoStack = []; // Nuevos cambios invalidan el redo
        }

        // Use JSON representation of canvas
        const json = JSON.stringify(this.canvas.toJSON());
        this.undoStack.push(json);

        if (this.undoStack.length > this.maxStates) {
            this.undoStack.shift(); // Eliminar el más antiguo
        }
        console.log(`State saved. History: ${this.undoStack.length}`);
    }

    undo() {
        if (this.undoStack.length <= 1) return; // Mantener siempre estado inicial

        this.locked = true;

        // Mover estado actual a Redo
        const current = this.undoStack.pop();
        this.redoStack.push(current);

        // Cargar estado anterior
        const stateToLoad = this.undoStack[this.undoStack.length - 1];
        this.load(stateToLoad);
    }

    redo() {
        if (this.redoStack.length === 0) return;

        this.locked = true;

        const next = this.redoStack.pop();
        this.undoStack.push(next);
        this.load(next);
    }

    load(json) {
        this.canvas.loadFromJSON(json, () => {
            this.canvas.renderAll();
            this.locked = false;
            console.log("State loaded.");
        });
    }
}
