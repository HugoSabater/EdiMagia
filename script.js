// Inicializar Canvas con Fabric.js
// 'c' es el ID del elemento <canvas> en el DOM
const canvas = new fabric.Canvas('c', {
    width: 800,
    height: 600,
    backgroundColor: '#fff' // Fondo blanco por defecto para la exportación
});

// Elementos del DOM
const imgLoader = document.getElementById('imgLoader');
const addTextBtn = document.getElementById('addTextBtn');
const textColorPicker = document.getElementById('textColor');
const grayscaleBtn = document.getElementById('grayscaleBtn');
const sepiaBtn = document.getElementById('sepiaBtn');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');

// --- 1. Manejo de Subida de Imágenes ---
imgLoader.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (f) {
        const data = f.target.result;
        fabric.Image.fromURL(data, function (img) {
            // Escalar imagen si es más grande que el canvas
            const scale = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
            );

            img.set({
                scaleX: scale,
                scaleY: scale,
                left: (canvas.width - img.width * scale) / 2,
                top: (canvas.height - img.height * scale) / 2
            });

            canvas.add(img);
            canvas.setActiveObject(img); // Seleccionar la imagen recién añadida
        });
    };
    reader.readAsDataURL(file);
    // Resetear input para permitir subir la misma imagen de nuevo si se desea
    imgLoader.value = '';
});

// --- 2. Añadir Texto ---
addTextBtn.addEventListener('click', () => {
    const text = new fabric.IText('Doble click para editar', {
        left: 100,
        top: 100,
        fontFamily: 'Inter',
        fill: textColorPicker.value,
        fontSize: 24
    });
    canvas.add(text);
    canvas.setActiveObject(text);
});

// Cambiar color del texto seleccionado
textColorPicker.addEventListener('input', (e) => {
    const activeObj = canvas.getActiveObject();
    if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
        activeObj.set('fill', e.target.value);
        canvas.renderAll();
    }
});

// --- 3. Filtros de Imagen ---
// Función auxiliar para aplicar filtros
function applyFilter(filter) {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !activeObj.isType('image')) {
        alert("Por favor, selecciona una imagen primero.");
        return;
    }

    // Aplicar filtro (Fabric.js usa una estructura de arrays para filtros)
    activeObj.filters.push(filter);
    activeObj.applyFilters();
    canvas.renderAll();
}

grayscaleBtn.addEventListener('click', () => {
    applyFilter(new fabric.Image.filters.Grayscale());
});

sepiaBtn.addEventListener('click', () => {
    applyFilter(new fabric.Image.filters.Sepia());
});

resetFiltersBtn.addEventListener('click', () => {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !activeObj.isType('image')) return;

    activeObj.filters = []; // Vaciar array de filtros
    activeObj.applyFilters();
    canvas.renderAll();
});

// --- 4. Descargar / Exportar ---
downloadBtn.addEventListener('click', () => {
    // Deseleccionar objetos para que no salgan los bordes de selección en la imagen final
    canvas.discardActiveObject();
    canvas.renderAll();

    const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
    });

    // Crear enlace temporal para descargar
    const link = document.createElement('a');
    link.download = 'ediMagIA-export.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// --- 5. Limpiar Canvas ---
clearBtn.addEventListener('click', () => {
    canvas.clear();
    // Restaurar fondo blanco (canvas.clear() lo borra todo)
    canvas.backgroundColor = '#fff';
    canvas.renderAll();
});

// --- Extras: Tecla Supr para borrar objetos ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        // Evitar borrar si se está editando texto
        const activeObj = canvas.getActiveObject();
        if (activeObj && !activeObj.isEditing) {
            canvas.remove(activeObj);
        }
    }
});
