/**
 * Gestor de Filtros Artísticos (Nativos Fabric.js)
 * Proporciona presets visuales sin dependencias externas.
 */
export class FilterManager {
    constructor(canvas) {
        this.canvas = canvas;
    }

    /**
     * Aplica un preset de filtro a la imagen activa
     * @param {string} type - Nombre del filtro ('normal', 'grayscale', 'sepia', 'vintage', 'polaroid')
     */
    applyFilter(type) {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'image') return;

        // 1. Limpiar filtros previos (excepto Brillo/Contraste si quisiéramos mantenerlos, 
        // pero por simplicidad para presets, reseteamos todo o base)
        // Para "sumar" filtros, deberíamos gestionar un array, pero aquí son presets "exclusivos".
        // Sin embargo, Fabric permite arrays. Vamos a asumir que el preset REEMPLAZA los filtros de color,
        // pero idealmente no debería tocar transformaciones geométricas.

        // Estrategia: Reemplazar artísticos, intentar mantener brillo/contraste si existen ya en sliders
        // (Aunque el prompt pide presets simples, así que reescribiremos filters array para garantizar el look)
        activeObject.filters = [];

        switch (type) {
            case 'grayscale':
                activeObject.filters.push(new fabric.Image.filters.Grayscale());
                break;
            case 'sepia':
                activeObject.filters.push(new fabric.Image.filters.Sepia());
                break;
            case 'vintage':
                // Sepia + un poco de ruido para textura vieja
                activeObject.filters.push(new fabric.Image.filters.Sepia());
                activeObject.filters.push(new fabric.Image.filters.Noise({ noise: 30 }));
                break;
            case 'polaroid':
                // Contraste alto + saturación (simulate using Technicolor or similar logic if available, 
                // but native fabric has limited color matrix easily accessible without plugins.
                // Usaremos filtros básicos combinados)
                // Fabric base no tiene "Saturation" directo en versiones viejas, 
                // pero v5 tiene Saturation.
                activeObject.filters.push(new fabric.Image.filters.pdfo.Saturation({ saturation: 0.5 })); // Boost saturation
                activeObject.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.2 }));
                break;
            case 'normal':
            default:
                // No filters (ya se limpió arriba)
                break;
        }

        // Aplicar cambios
        activeObject.applyFilters();
        this.canvas.requestRenderAll();
    }
}
