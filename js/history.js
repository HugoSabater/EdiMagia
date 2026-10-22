/**
 * Gestiona el historial de cambios (Undo/Redo) con estados de Canvas Fabric.js
 * Cumple con límite de memoria (maxStates = 20) y sincronización reactiva de UI.
 */
export class HistoryManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.undoStack = [];
        this.redoStack = [];
        this.locked = false; // Bloqueo para evitar bucles de eventos al restaurar estados
        this.maxStates = 20;

        // Referencias a botones de la interfaz
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');

        // Guardar estado inicial del lienzo
        this.saveState();

        this.initEvents();
        this.initKeyboard();
        this.updateUI();
    }

    initEvents() {
        // Eventos de Fabric.js que registran automáticamente cambios
        this.canvas.on('object:added', () => !this.locked && this.saveState());
        this.canvas.on('object:modified', () => !this.locked && this.saveState());
        this.canvas.on('object:removed', () => !this.locked && this.saveState());
    }

    initKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Ignorar atajos si el usuario está escribiendo en un input, textarea o editando texto en el canvas
            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            if (activeTag === 'input' || activeTag === 'textarea') return;

            const activeObj = this.canvas ? this.canvas.getActiveObject() : null;
            if (activeObj && activeObj.isEditing) return;

            const isCtrlOrCmd = e.ctrlKey || e.metaKey;

            // Undo: Ctrl+Z / Cmd+Z (sin Shift)
            if (isCtrlOrCmd && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
                e.preventDefault();
                this.undo();
                return;
            }

            // Redo: Ctrl+Y / Cmd+Y O Ctrl+Shift+Z / Cmd+Shift+Z
            const isRedoKey = (e.key === 'y' || e.key === 'Y') || (e.shiftKey && (e.key === 'z' || e.key === 'Z'));
            if (isCtrlOrCmd && isRedoKey) {
                e.preventDefault();
                this.redo();
            }
        });
    }

    updateUI() {
        if (!this.undoBtn) this.undoBtn = document.getElementById('undoBtn');
        if (!this.redoBtn) this.redoBtn = document.getElementById('redoBtn');

        if (this.undoBtn) {
            this.undoBtn.disabled = this.undoStack.length <= 1;
        }
        if (this.redoBtn) {
            this.redoBtn.disabled = this.redoStack.length === 0;
        }
    }

    saveState() {
        if (this.locked) return;

        if (this.redoStack.length > 0) {
            this.redoStack = []; // Nuevas acciones invalidan la rama rehacer
        }

        // Serializar estado completo de objetos en formato JSON
        const json = JSON.stringify(this.canvas.toJSON(['selectable', 'evented']));
        this.undoStack.push(json);

        // Control de límite de memoria RAM (sliding window)
        if (this.undoStack.length > this.maxStates) {
            this.undoStack.shift();
        }

        this.updateUI();
    }

    undo() {
        if (this.undoStack.length <= 1 || this.locked) return;

        this.locked = true;

        // Mover estado actual a la pila de rehacer
        const current = this.undoStack.pop();
        this.redoStack.push(current);

        // Cargar estado anterior
        const stateToLoad = this.undoStack[this.undoStack.length - 1];
        this.load(stateToLoad);
    }

    redo() {
        if (this.redoStack.length === 0 || this.locked) return;

        this.locked = true;

        const next = this.redoStack.pop();
        this.undoStack.push(next);
        this.load(next);
    }

    load(json) {
        this.canvas.loadFromJSON(json, () => {
            this.canvas.requestRenderAll();
            this.locked = false;
            this.updateUI();

            // Notificar a los listeners de UI para actualizar controles de selección
            this.canvas.fire('selection:cleared');
        });
    }
}
