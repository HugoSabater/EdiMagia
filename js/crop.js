/**
 * Herramienta de Recorte
 */
export class CropManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.active = false;
        this.selectionRect = null;
        this.mainImage = null; // La imagen que estamos recortando

        // Referencias UI
        this.cropBtn = document.getElementById('cropBtn');
        this.cropMsg = document.getElementById('cropMsg');
        this.cropActions = document.getElementById('cropActions');
        this.confirmBtn = document.getElementById('confirmCropBtn');
        this.cancelBtn = document.getElementById('cancelCropBtn');

        if (!this.cropBtn || !this.confirmBtn || !this.cancelBtn) {
            console.error("[Diagnostic] CropManager: Critical UI elements missing in DOM.");
        }

        this.initEvents();
        console.log("[Diagnostic] CropManager initialized.");
    }

    initEvents() {
        if (this.cropBtn) this.cropBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: Start Crop");
            this.startCrop();
        });
        if (this.confirmBtn) this.confirmBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: Confirm Crop");
            this.performCrop();
        });
        if (this.cancelBtn) this.cancelBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: Cancel Crop");
            this.cancelCrop();
        });

        // Habilitar/deshabilitar botón según selección
        this.canvas.on('selection:created', () => this.checkSelection());
        this.canvas.on('selection:updated', () => this.checkSelection());
        this.canvas.on('selection:cleared', () => this.checkSelection());
    }

    checkSelection() {
        if (this.active) return; // Ignore selection changes while cropping

        const obj = this.canvas.getActiveObject();
        if (obj && obj.type === 'image') {
            if (this.cropBtn) this.cropBtn.disabled = false;
            if (this.cropMsg) this.cropMsg.textContent = "Haz clic para empezar";
            this.mainImage = obj;
        } else {
            if (this.cropBtn) this.cropBtn.disabled = true;
            if (this.cropMsg) this.cropMsg.textContent = "Selecciona una imagen";
            this.mainImage = null;
        }
    }

    startCrop() {
        if (!this.mainImage) {
            console.warn("[Diagnostic] startCrop called but no mainImage selected.");
            return;
        }

        // Store reference LOCALLY because discardActiveObject() triggers selection:cleared
        // which calls checkSelection() and sets this.mainImage to null!
        const img = this.mainImage;

        // Ensure coords are up to date
        img.setCoords();

        console.log("[Diagnostic] Starting crop for image:", img);

        this.active = true;
        if (this.cropActions) this.cropActions.classList.remove('hidden');
        if (this.cropBtn) this.cropBtn.classList.add('hidden'); // Ocultar botón principal

        // 1. Bloquear todo el canvas excepto el área de recorte
        this.canvas.discardActiveObject();
        this.canvas.forEachObject(o => o.selectable = false);

        // 2. Crear overlay de recorte
        // Ensure we retrieve values safely.
        const scaleX = img.scaleX || 1;
        const scaleY = img.scaleY || 1;
        const width = (img.width || 0) * scaleX;
        const height = (img.height || 0) * scaleY;
        const left = img.left || 0;
        const top = img.top || 0;

        this.selectionRect = new fabric.Rect({
            left: left,
            top: top,
            width: width,
            height: height,
            fill: 'rgba(0,0,0,0)',
            stroke: '#ffffff',
            strokeDashArray: [5, 5],
            strokeWidth: 2,
            cornerColor: 'white',
            cornerSize: 10,
            transparentCorners: false,
            hasRotatingPoint: false,
            originX: img.originX || 'center',
            originY: img.originY || 'center'
        });

        this.canvas.add(this.selectionRect);
        this.canvas.setActiveObject(this.selectionRect);
        this.canvas.requestRenderAll();
        console.log("[Diagnostic] Crop overlay added.");
    }

    performCrop() {
        if (!this.selectionRect || !this.mainImage) {
            console.warn("[Diagnostic] performCrop: Missing selectionRect or mainImage");
            return;
        }

        console.log("[Diagnostic] Performing crop...");

        // 1. Obtener coordenadas del recorte relativas al Canvas
        const rect = this.selectionRect;

        // Ajustamos las coordenadas visuales exactas
        const left = rect.left - (rect.width * rect.scaleX) / 2; // Asumiendo origin center
        const top = rect.top - (rect.height * rect.scaleY) / 2;
        const width = rect.width * rect.scaleX;
        const height = rect.height * rect.scaleY;

        // 2. Exportar esa área del canvas a una imagen
        const croppedDataURL = this.canvas.toDataURL({
            format: 'png',
            left: left,
            top: top,
            width: width,
            height: height,
            quality: 1
        });

        // 3. Crear nueva imagen
        // crossOrigin anonymous is good practice here too if we were loading external
        fabric.Image.fromURL(croppedDataURL, (newImg) => {
            if (!newImg) {
                console.error("[Diagnostic] Failed to create cropped image.");
                return;
            }

            // Reemplazar imagen original
            newImg.set({
                left: rect.left,
                top: rect.top,
                originX: 'center',
                originY: 'center'
            });

            this.canvas.remove(this.mainImage);
            this.canvas.add(newImg);

            this.endCrop();
            console.log("[Diagnostic] Crop complete. New image added.");
        });
    }

    cancelCrop() {
        console.log("[Diagnostic] Crop cancelled.");
        this.endCrop();
    }

    endCrop() {
        this.active = false;

        // Limpiar UI
        if (this.cropActions) this.cropActions.classList.add('hidden');
        if (this.cropBtn) this.cropBtn.classList.remove('hidden');

        // Eliminar rect
        if (this.selectionRect) {
            this.canvas.remove(this.selectionRect);
            this.selectionRect = null;
        }

        // Restaurar interactividad
        this.canvas.forEachObject(o => o.selectable = true);
        this.canvas.requestRenderAll();

        console.log("[Diagnostic] Crop mode ended. Interactivity restored.");
    }
}
