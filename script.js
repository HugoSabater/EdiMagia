document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Initialize Fabric.js Canvas ---
    const canvas = new fabric.Canvas('canvas', {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
    });

    // --- 2. DOM Elements ---
    const imageUploadInput = document.getElementById('imageUpload');
    const addTextBtn = document.getElementById('addTextBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    // Style Controls
    const controlsPanel = document.getElementById('controlsPanel');
    const noSelectionMsg = document.getElementById('noSelectionMsg');
    const colorPicker = document.getElementById('colorPicker');
    const colorValue = document.getElementById('colorValue');
    const fontFamilySelect = document.getElementById('fontFamily');
    const fontControls = document.getElementById('fontControls');

    // Advanced Controls (New)
    const filterControls = document.getElementById('filterControls');
    const brightnessInput = document.getElementById('brightness');
    const contrastInput = document.getElementById('contrast');
    const brightnessValue = document.getElementById('brightnessValue');
    const contrastValue = document.getElementById('contrastValue');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const bringForwardBtn = document.getElementById('bringForwardBtn');
    const sendBackwardsBtn = document.getElementById('sendBackwardsBtn');

    // --- 3. Functionality Implementation ---

    // A. Handle Image Upload
    imageUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (f) => {
            const data = f.target.result;
            fabric.Image.fromURL(data, (img) => {
                // Resize image logic...
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
            });
        };
        reader.readAsDataURL(file);
    });

    // B. Add Text Tool
    addTextBtn.addEventListener('click', () => {
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
    });

    // C. Object Selection, Conditional UI & Style Handling
    function updateControlsUI() {
        const activeObject = canvas.getActiveObject();

        if (activeObject) {
            controlsPanel.classList.remove('hidden');
            noSelectionMsg.classList.add('hidden');

            // Common Properies
            if (activeObject.fill && typeof activeObject.fill === 'string') {
                colorPicker.value = activeObject.fill;
                colorValue.textContent = activeObject.fill;
            }

            // Conditional Logic: Show Controls based on Type
            if (activeObject.type === 'i-text' || activeObject.type === 'text') {
                // IT'S TEXT
                if (fontControls) fontControls.classList.remove('hidden');
                if (filterControls) filterControls.classList.add('hidden');

                if (activeObject.fontFamily) {
                    fontFamilySelect.value = activeObject.fontFamily;
                }
            } else if (activeObject.type === 'image') {
                // IT'S AN IMAGE
                if (fontControls) fontControls.classList.add('hidden');
                if (filterControls) filterControls.classList.remove('hidden'); // Show Filters!

                // Let's iterate filters to find Brightness/Contrast
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
                    brightnessValue.textContent = parseFloat(brightVal).toFixed(2);
                }

                if (contrastInput) {
                    contrastInput.value = contrastVal;
                    contrastValue.textContent = parseFloat(contrastVal).toFixed(2);
                }
            } else {
                // Shape or other
                if (fontControls) fontControls.classList.add('hidden');
                if (filterControls) filterControls.classList.add('hidden');
            }

        } else {
            controlsPanel.classList.add('hidden');
            noSelectionMsg.classList.remove('hidden');
        }
    }

    canvas.on('selection:created', updateControlsUI);
    canvas.on('selection:updated', updateControlsUI);
    canvas.on('selection:cleared', updateControlsUI);

    // Style Events
    colorPicker.addEventListener('input', (e) => {
        const val = e.target.value;
        colorValue.textContent = val;

        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.set('fill', val);
            canvas.requestRenderAll();
        }
    });

    fontFamilySelect.addEventListener('change', (e) => {
        const val = e.target.value;
        const activeObject = canvas.getActiveObject();
        if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) {
            activeObject.set('fontFamily', val);
            canvas.requestRenderAll();
        }
    });

    // F. Advanced Features: Layer Management
    if (bringForwardBtn) {
        bringForwardBtn.addEventListener('click', () => {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.bringForward(activeObject);
                canvas.requestRenderAll();
            }
        });
    }

    if (sendBackwardsBtn) {
        sendBackwardsBtn.addEventListener('click', () => {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.sendBackwards(activeObject);
                canvas.requestRenderAll();
            }
        });
    }

    // G. Advanced Features: Image Filters
    function applyFilter(index, filter) {
        const obj = canvas.getActiveObject();
        if (!obj || obj.type !== 'image') return;

        obj.filters[index] = filter;
        obj.applyFilters();
        canvas.requestRenderAll();
    }

    if (brightnessInput) {
        brightnessInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            brightnessValue.textContent = val.toFixed(2);

            const filter = new fabric.Image.filters.Brightness({
                brightness: val
            });

            // We use index 0 for Brightness
            applyFilter(0, filter);
        });
    }

    if (contrastInput) {
        contrastInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            contrastValue.textContent = val.toFixed(2);

            const filter = new fabric.Image.filters.Contrast({
                contrast: val
            });

            // We use index 1 for Contrast
            applyFilter(1, filter);
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            const obj = canvas.getActiveObject();
            if (!obj || obj.type !== 'image') return;

            obj.filters = []; // Clear all
            obj.applyFilters();
            canvas.requestRenderAll();

            // Reset UI
            brightnessInput.value = 0;
            brightnessValue.textContent = '0';
            contrastInput.value = 0;
            contrastValue.textContent = '0';
        });
    }

    // D. Delete Object
    deleteBtn.addEventListener('click', () => {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeObject = canvas.getActiveObject();
            if (activeObject && !activeObject.isEditing) {
                canvas.remove(activeObject);
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }
        }
    });

    // E. Export / Download
    downloadBtn.addEventListener('click', () => {
        canvas.discardActiveObject();
        canvas.requestRenderAll();

        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
        });

        const link = document.createElement('a');
        link.download = 'edimagia-export.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    updateControlsUI();
});
