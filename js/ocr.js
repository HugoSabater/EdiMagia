/**
 * Gestor de OCR (Reconocimiento Óptico de Caracteres)
 * Usa Tesseract.js para convertir píxeles en objetos editables.
 */
export class OCRManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.btn = document.getElementById('ocrBtn');
    }

    /**
     * Aplica pre-procesamiento SUGGESTIVO (Soft Grayscale)
     * En lugar de binarizar a lo bestia (0 o 255), convertimos a escala de grises
     * usando el canal máximo (para salvar el azul) e INVERTIMOS para que sea texto oscuro sobre claro.
     */
    preprocessImage(canvasElement) {
        const ctx = canvasElement.getContext('2d');
        const width = canvasElement.width;
        const height = canvasElement.height;
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // 1. Max Channel Grayscale (Preserva intensidad de colores brillantes)
            const maxVal = Math.max(r, g, b);

            // 2. Inversión Suave (Soft Inversion)
            // Queremos: Texto Brillante -> Oscuro (para Tesseract)
            // Fondo Oscuro -> Claro
            // NO aplicamos umbral duro (threshold) para no perder bordes sutiles 
            // (como texto blanco sobre cuadro blanco con sombrita).

            // Simplemente invertimos el valor.
            const inverted = 255 - maxVal;

            // 3. Contrast Stretching (Opcional, para limpiar "grises" de asfalto)
            // Hacemos que los grises claros (fondo invertido) sean más blancos.
            // Si inverted > 150 (gris claro), lo empujamos a 255.
            // Esto limpia el ruido del asfalto sin borrar texto.
            let finalVal = inverted;
            if (finalVal > 180) finalVal = 255; // Limpieza de altas luces (fondo)

            data[i] = finalVal;     // R
            data[i + 1] = finalVal; // G
            data[i + 2] = finalVal; // B
            // Alpha intacto
        }

        ctx.putImageData(imgData, 0, 0);
        return canvasElement.toDataURL('image/png');
    }

    async recognizeText() {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject || activeObject.type !== 'image') {
            alert("⚠️ Selecciona una imagen primero.");
            return;
        }

        if (!window.Tesseract) {
            alert("⚠️ Error crítico: Tesseract.js no se ha cargado.");
            return;
        }

        const originalContent = this.btn.innerHTML;
        this.btn.disabled = true;
        this.btn.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-transparent"></div>
                <span class="text-xs font-semibold">Procesando...</span>
            </div>
        `;

        try {
            const multiplier = 3;
            const tempCanvas = document.createElement('canvas');
            const tempImg = new Image();

            await new Promise((resolve, reject) => {
                const dataUrl = activeObject.toDataURL({ format: 'png', multiplier: multiplier });
                tempImg.onload = () => {
                    tempCanvas.width = tempImg.width;
                    tempCanvas.height = tempImg.height;
                    const ctx = tempCanvas.getContext('2d');
                    ctx.drawImage(tempImg, 0, 0);
                    resolve();
                };
                tempImg.onerror = reject;
                tempImg.src = dataUrl;
            });

            const processedDataUrl = this.preprocessImage(tempCanvas);

            this.btn.innerHTML = `
                <div class="flex items-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-transparent"></div>
                    <span class="text-xs font-semibold">Leyendo...</span>
                </div>
            `;

            const result = await Tesseract.recognize(processedDataUrl, 'spa', {
                tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
            });

            const { data } = result;
            console.log(`[Diagnostic] OCR completado. Líneas: ${data.lines.length}`);

            if (!data.lines || data.lines.length === 0) {
                alert("No se ha detectado texto legible.");
                return;
            }

            const imgTL = activeObject.getPointByOrigin('left', 'top');
            const scaleFactor = 1 / multiplier;
            let count = 0;

            data.lines.forEach(line => {
                const text = line.text.trim();
                const isShortAndWeak = (text.length < 3 && line.confidence < 85);

                if (line.confidence < 50 || !text || isShortAndWeak) return;

                const bbox = line.bbox;

                let angleDeg = 0;
                if (line.baseline) {
                    const dx = line.baseline.x1 - line.baseline.x0;
                    const dy = line.baseline.y1 - line.baseline.y0;
                    const angleRad = Math.atan2(dy, dx);
                    angleDeg = angleRad * (180 / Math.PI);
                }

                // Filtrar ángulos extremos erróneos en líneas horizontales
                const aspect = (bbox.x1 - bbox.x0) / (bbox.y1 - bbox.y0);
                if (Math.abs(angleDeg) > 20 && aspect > 4) {
                    angleDeg = 0; // Corrección forzada para líneas muy largas que difícilmente están a 45 grados
                }

                const lineX = bbox.x0 * scaleFactor;
                const lineY = bbox.y0 * scaleFactor;

                let estimatedFontSize = (bbox.y1 - bbox.y0) * scaleFactor * 0.75;
                if (Math.abs(angleDeg) > 5) estimatedFontSize = 22;
                if (estimatedFontSize < 12) estimatedFontSize = 12;

                // Estilos
                let boldCount = 0;
                let italicCount = 0;
                line.words.forEach(w => {
                    if (w.is_bold) boldCount++;
                    if (w.is_italic) italicCount++;
                });

                const iText = new fabric.IText(text.replace(/\n/g, ''), {
                    left: imgTL.x + lineX,
                    top: imgTL.y + lineY,
                    angle: angleDeg,

                    fontFamily: 'Inter',
                    fontSize: estimatedFontSize,
                    fill: '#0f172a', // Texto oscuro

                    // Mejoras de visibilidad sin fondo
                    stroke: '#ffffff', // Borde blanco
                    strokeWidth: 2,
                    paintFirst: 'stroke', // Pintar borde antes que relleno

                    fontWeight: (boldCount > line.words.length * 0.5) ? 'bold' : 'normal',
                    fontStyle: (italicCount > line.words.length * 0.5) ? 'italic' : 'normal',

                    // Fondo transparente solicitado
                    backgroundColor: null,

                    cornerColor: '#0ea5e9',
                    cornerStyle: 'circle',
                    borderColor: '#0ea5e9',
                    transparentCorners: false
                });

                this.canvas.add(iText);
                count++;
            });

            this.canvas.requestRenderAll();

        } catch (error) {
            console.error("[Diagnostic] Error OCR:", error);
            alert(`Error OCR: ${error.message}`);
        } finally {
            this.btn.innerHTML = originalContent;
            if (activeObject === this.canvas.getActiveObject()) {
                this.btn.disabled = false;
            }
        }
    }
}
