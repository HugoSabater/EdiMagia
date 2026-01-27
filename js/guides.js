/**
 * Guías inteligentes de alineación (Smart Guides)
 */
export class GuidesManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.snapThreshold = 10;
        this.guidelines = [];

        this.initEvents();
    }

    initEvents() {
        this.canvas.on('object:moving', (e) => this.handleObjectMoving(e));
        this.canvas.on('before:render', () => this.clearGuidelines());
        this.canvas.on('after:render', () => this.drawGuidelines());
        this.canvas.on('mouse:up', () => this.clearGuidelines());
    }

    handleObjectMoving(e) {
        const obj = e.target;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        // Puntos de interés del objeto (centro, bordes)
        const objCenter = obj.getCenterPoint();

        // Líneas a dibujar
        this.guidelines = [];

        let snapped = false;

        // --- Snap al Centro del Canvas ---

        // Horizontal Center (Eje X)
        if (Math.abs(objCenter.x - canvasWidth / 2) < this.snapThreshold) {
            obj.setPositionByOrigin(new fabric.Point(canvasWidth / 2, objCenter.y), 'center', 'center');

            this.guidelines.push({
                x: canvasWidth / 2,
                y1: 0,
                y2: canvasHeight,
                color: 'rgba(255, 0, 200, 0.7)' // Magenta
            });
            snapped = true;
        }

        // Vertical Center (Eje Y)
        if (Math.abs(objCenter.y - canvasHeight / 2) < this.snapThreshold) {
            obj.setPositionByOrigin(new fabric.Point(objCenter.x, canvasHeight / 2), 'center', 'center');

            this.guidelines.push({
                y: canvasHeight / 2,
                x1: 0,
                x2: canvasWidth,
                color: 'rgba(255, 0, 200, 0.7)'
            });
            snapped = true;
        }

        // --- Podríamos añadir Snap a otros objetos aquí iterando this.canvas.getObjects() ---
    }

    clearGuidelines() {
        this.guidelines = [];
    }

    drawGuidelines() {
        if (this.guidelines.length === 0) return;

        const ctx = this.canvas.getContext();
        ctx.save();
        ctx.lineWidth = 1;

        this.guidelines.forEach(line => {
            ctx.strokeStyle = line.color;
            ctx.beginPath();

            if (line.x !== undefined) {
                // Línea Vertical
                ctx.moveTo(line.x, line.y1);
                ctx.lineTo(line.x, line.y2);
            } else {
                // Línea Horizontal
                ctx.moveTo(line.x1, line.y);
                ctx.lineTo(line.x2, line.y);
            }

            ctx.stroke();
        });

        ctx.restore();
    }
}
