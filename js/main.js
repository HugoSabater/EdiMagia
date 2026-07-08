import { HistoryManager } from './history.js';
import { GuidesManager } from './guides.js';
import { CropManager } from './crop.js';
import { FilterManager } from './filters.js';
import { OCRManager } from './ocr.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[Diagnostic] DOMContentLoaded fired. Initializing application...");

    // --- 1. Inicializar Canvas ---
    const canvasEl = document.getElementById('canvas');
    if (!canvasEl) {
        console.error("[Diagnostic] CRITICAL: <canvas id='canvas'> not found in DOM.");
        return;
    }

    // Fabric.js v5 initialization
    const canvas = new fabric.Canvas('canvas', {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
    });
    console.log("[Diagnostic] Fabric Canvas initialized:", canvas);

    // --- 2. Inicializar Módulos ---
    // Pasamos el canvas a los managers
    const historyManager = new HistoryManager(canvas);
    const guidesManager = new GuidesManager(canvas);
    const cropManager = new CropManager(canvas);
    const filterManager = new FilterManager(canvas);
    const ocrManager = new OCRManager(canvas); // Nuevo (OCR)
    console.log("[Diagnostic] Modules initialized (History, Guides, Crop, Filters, OCR).");

    // Conectar botones de historial UI
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: Undo");
            historyManager.undo();
        });
    } else console.warn("[Diagnostic] undoBtn not found");

    const redoBtn = document.getElementById('redoBtn');
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: Redo");
            historyManager.redo();
        });
    } else console.warn("[Diagnostic] redoBtn not found");

    // --- 3. Referencias DOM ---
    const imageUploadInput = document.getElementById('imageUpload');
    const addTextBtn = document.getElementById('addTextBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    // Paneles
    const controlsPanel = document.getElementById('controlsPanel');
    const noSelectionMsg = document.getElementById('noSelectionMsg');

    // Controles Estilo
    const colorPicker = document.getElementById('colorPicker');
    const colorValue = document.getElementById('colorValue');
    const fontFamilySelect = document.getElementById('fontFamily');
    const fontControls = document.getElementById('fontControls');

    // Filtros Artísticos (Botones)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterType = e.target.dataset.filter;
            console.log(`[Diagnostic] Aplicando filtro: ${filterType}`);
            filterManager.applyFilter(filterType);
            historyManager.saveState();
        });
    });

    // Botón OCR
    const ocrBtn = document.getElementById('ocrBtn');
    if (ocrBtn) {
        ocrBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: OCR");
            ocrManager.recognizeText();
        });
    }

    // Controles Avanzados (Filtros, Capas)
    const filterControls = document.getElementById('filterControls');
    const brightnessInput = document.getElementById('brightness');
    const contrastInput = document.getElementById('contrast');
    const brightnessValue = document.getElementById('brightnessValue');
    const contrastValue = document.getElementById('contrastValue');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    const bringForwardBtn = document.getElementById('bringForwardBtn');
    const sendBackwardsBtn = document.getElementById('sendBackwardsBtn');

    // --- 4. Lógica Principal ---

    // A. Subir Imagen
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', (e) => {
            console.log("[Diagnostic] Image input changed");
            const file = e.target.files[0];
            if (!file) {
                console.log("[Diagnostic] No file selected");
                return;
            }

            console.log("[Diagnostic] File selected:", file.name);

            const reader = new FileReader();
            reader.onload = (f) => {
                const data = f.target.result;
                // crossOrigin: 'anonymous' is crucial for CORS when loading from external URLs, 
                // but for DataURLs it's less critical. However, GOOD PRACTICE.
                fabric.Image.fromURL(data, (img) => {
                    if (!img) {
                        console.error("[Diagnostic] Error loading image from URL (img is null).");
                        alert("Error al cargar la imagen.");
                        return;
                    }

                    console.log("[Diagnostic] Image loaded into Fabric object:", img);

                    // Escalar imagen si es grande
                    if (img.width > canvas.width || img.height > canvas.height) {
                        const scale = Math.min(
                            (canvas.width * 0.8) / img.width,
                            (canvas.height * 0.8) / img.height
                        );
                        img.scale(scale);
                    } else {
                        img.scale(0.5);
                    }

                    img.set({
                        left: canvas.width / 2,
                        top: canvas.height / 2,
                        originX: 'center',
                        originY: 'center',
                        cornerColor: '#0ea5e9',
                        cornerStyle: 'circle',
                        borderColor: '#0ea5e9',
                        transparentCorners: false
                    });

                    canvas.add(img);
                    canvas.setActiveObject(img);
                    canvas.requestRenderAll();

                    imageUploadInput.value = '';
                    console.log("[Diagnostic] Image added to canvas successfully.");
                }, { crossOrigin: 'anonymous' }); // Added crossOrigin
            };
            reader.onerror = (err) => {
                console.error("[Diagnostic] FileReader error:", err);
                alert("Error al leer el archivo.");
            };
            reader.readAsDataURL(file);
        });
    } else console.error("[Diagnostic] CRITICAL: imageUpload input not found");

    // B. Añadir Texto
    if (addTextBtn) {
        addTextBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: Add Text");
            const text = new fabric.IText('Doble click para editar', {
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: 'center',
                originY: 'center',
                fontFamily: 'Inter',
                fill: '#0f172a',
                fontSize: 24,
                cornerColor: '#0ea5e9',
                cornerStyle: 'circle',
                borderColor: '#0ea5e9',
                transparentCorners: false
            });
            canvas.add(text);
            canvas.setActiveObject(text);
            canvas.requestRenderAll();
            console.log("[Diagnostic] Text added to canvas");
        });
    } else console.error("[Diagnostic] CRITICAL: addTextBtn not found");

    // C. Gestión UI de Selección
    function updateControlsUI() {
        // No actualizar si estamos recortando
        if (cropManager.active) return;

        const activeObject = canvas.getActiveObject();
        console.log("[Diagnostic] Selection updated. Active object:", activeObject ? activeObject.type : "None");

        if (activeObject) {
            controlsPanel.classList.remove('hidden');
            noSelectionMsg.classList.add('hidden');

            // Color
            if (activeObject.fill && typeof activeObject.fill === 'string') {
                if (colorPicker) {
                    let color = activeObject.fill;

                    // Convert rgb/rgba to hex if needed, as input[type=color] requires hex
                    if (color.startsWith('rgb')) {
                        const temp = new fabric.Color(color);
                        color = temp.toHex();
                        // Fabric's toHex might not include #
                        if (!color.startsWith('#')) color = '#' + color;
                    }

                    colorPicker.value = color;
                    if (colorValue) colorValue.textContent = color;
                }
            }

            // Tipo de objeto
            if (activeObject.type === 'i-text' || activeObject.type === 'text') {
                if (fontControls) fontControls.classList.remove('hidden');
                if (filterControls) filterControls.classList.add('hidden');

                if (activeObject.fontFamily && fontFamilySelect) {
                    fontFamilySelect.value = activeObject.fontFamily;
                }
            } else if (activeObject.type === 'image') {
                if (fontControls) fontControls.classList.add('hidden');
                if (filterControls) filterControls.classList.remove('hidden');

                // Habilitar OCR
                const ocrBtn = document.getElementById('ocrBtn');
                if (ocrBtn) ocrBtn.disabled = false;

                // Leer filtros
                let brightVal = 0;
                let contrastVal = 0;
                if (activeObject.filters && activeObject.filters.length > 0) {
                    activeObject.filters.forEach(filter => {
                        if (filter instanceof fabric.Image.filters.Brightness) brightVal = filter.brightness;
                        if (filter instanceof fabric.Image.filters.Contrast) contrastVal = filter.contrast;
                    });
                }
                if (brightnessInput) {
                    brightnessInput.value = brightVal;
                    if (brightnessValue) brightnessValue.textContent = parseFloat(brightVal).toFixed(2);
                }
                if (contrastInput) {
                    contrastInput.value = contrastVal;
                    if (contrastValue) contrastValue.textContent = parseFloat(contrastVal).toFixed(2);
                }
            } else {
                const ocrBtn = document.getElementById('ocrBtn');
                if (ocrBtn) ocrBtn.disabled = true;

                if (fontControls) fontControls.classList.add('hidden');
                if (filterControls) filterControls.classList.add('hidden');
            }

        } else {
            if (controlsPanel) controlsPanel.classList.add('hidden');
            if (noSelectionMsg) noSelectionMsg.classList.remove('hidden');
        }
    }

    canvas.on('selection:created', updateControlsUI);
    canvas.on('selection:updated', updateControlsUI);
    canvas.on('selection:cleared', updateControlsUI);

    // Eventos de Estilo
    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            const val = e.target.value;
            if (colorValue) colorValue.textContent = val;
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set('fill', val);
                canvas.requestRenderAll();
            }
        });
        colorPicker.addEventListener('change', () => {
            console.log("[Diagnostic] Color changed");
            historyManager.saveState();
        });
    }

    if (fontFamilySelect) {
        fontFamilySelect.addEventListener('change', (e) => {
            console.log("[Diagnostic] Font changed to:", e.target.value);
            const val = e.target.value;
            const activeObject = canvas.getActiveObject();
            if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) {
                activeObject.set('fontFamily', val);
                canvas.requestRenderAll();
                historyManager.saveState();
            }
        });
    }

    // Gestión de Capas
    if (bringForwardBtn) {
        bringForwardBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: Bring Forward");
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.bringForward(activeObject);
                canvas.requestRenderAll();
                historyManager.saveState();
            }
        });
    }

    if (sendBackwardsBtn) {
        sendBackwardsBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: Send Backwards");
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.sendBackwards(activeObject);
                canvas.requestRenderAll();
                historyManager.saveState();
            }
        });
    }

    // Filtros de Imagen
    function applyFilter(index, filter) {
        const obj = canvas.getActiveObject();
        if (!obj || obj.type !== 'image') return;

        // Ensure filters array exists
        if (!obj.filters) obj.filters = [];

        obj.filters[index] = filter;
        obj.applyFilters();
        canvas.requestRenderAll();
    }

    if (brightnessInput) {
        brightnessInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (brightnessValue) brightnessValue.textContent = val.toFixed(2);
            applyFilter(0, new fabric.Image.filters.Brightness({ brightness: val }));
        });
        brightnessInput.addEventListener('change', () => {
            console.log("[Diagnostic] Brightness changed");
            historyManager.saveState();
        });
    }

    if (contrastInput) {
        contrastInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (contrastValue) contrastValue.textContent = val.toFixed(2);
            applyFilter(1, new fabric.Image.filters.Contrast({ contrast: val }));
        });
        contrastInput.addEventListener('change', () => {
            console.log("[Diagnostic] Contrast changed");
            historyManager.saveState();
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: Reset Filters");
            const obj = canvas.getActiveObject();
            if (!obj || obj.type !== 'image') return;
            obj.filters = [];
            obj.applyFilters();
            canvas.requestRenderAll();
            // Reset UI
            if (brightnessInput) brightnessInput.value = 0;
            if (brightnessValue) brightnessValue.textContent = '0';
            if (contrastInput) contrastInput.value = 0;
            if (contrastValue) contrastValue.textContent = '0';
            historyManager.saveState();
        });
    }

    // Eliminar Objeto
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: Delete");
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.remove(activeObject);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeObject = canvas.getActiveObject();
            if (activeObject && !activeObject.isEditing) {
                console.log("[Diagnostic] Keydown: Delete/Backspace");
                canvas.remove(activeObject);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }
        }
    });

    // Exportar
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            console.log("[Diagnostic] Click: Download");
            canvas.discardActiveObject();
            canvas.requestRenderAll();

            // 1. Calcular Bounding Box de TODOS los objetos
            const objects = canvas.getObjects();
            if (objects.length === 0) {
                alert("El lienzo está vacío.");
                return;
            }

            // Usamos un grupo temporal para calcular límites sin alterar el canvas real
            // (Alternativamente, iterar min/max left/top es más seguro para no romper selection)
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

            objects.forEach(obj => {
                const rect = obj.getBoundingRect(true); // true = absoluto
                if (rect.left < minX) minX = rect.left;
                if (rect.top < minY) minY = rect.top;
                if (rect.left + rect.width > maxX) maxX = rect.left + rect.width;
                if (rect.top + rect.height > maxY) maxY = rect.top + rect.height;
            });

            // Sin margen extra para ajustarse al máximo al contenido
            const padding = 0;
            minX = Math.max(0, minX - padding);
            minY = Math.max(0, minY - padding);
            const width = Math.min(canvas.width - minX, (maxX - minX));
            const height = Math.min(canvas.height - minY, (maxY - minY));

            // 2. Exportar solo esa área
            const dataURL = canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 2,
                left: minX,
                top: minY,
                width: width,
                height: height
            });

            const link = document.createElement('a');
            link.download = 'edimagia-smart-export.png';
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Iniciar UI
    updateControlsUI();
    console.log("[Diagnostic] Initialization complete.");
});
