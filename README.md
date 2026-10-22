# 🎨 EdiMagIA - Editor Gráfico Web & Estudio Creativo

[![Deploy to GitHub Pages](https://github.com/HugoSabater/EdiMagia/actions/workflows/deploy.yml/badge.svg)](https://github.com/HugoSabater/EdiMagia/actions/workflows/deploy.yml)
[![Demo en Vivo](https://img.shields.io/badge/Demo-GitHub%20Pages-brightgreen?style=flat&logo=github)](https://hugosabater.github.io/EdiMagia/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Fabric.js](https://img.shields.io/badge/Canvas-Fabric.js%20v5-orange)](https://fabricjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

> **Demo en Vivo:** [https://hugosabater.github.io/EdiMagia/](https://hugosabater.github.io/EdiMagia/)

Un editor de imágenes moderno, ligero y modular desarrollado en el cliente con **Vanilla JavaScript (ES6 Modules)**, **HTML5 Canvas**, **Fabric.js** y **Tailwind CSS**. Permite manipulación gráfica avanzada, filtros artísticos, extracción de texto mediante OCR (Tesseract.js), guías magnéticas inteligentes y recorte geométrico con máscara sombreada.

---

## 🚀 Características Principales

- **Historial Completo Deshacer / Rehacer (Undo / Redo):**
  - Navegación temporal bidireccional mediante snapshots de estado con límite circular de memoria (hasta 20 estados para prevenir leaks de RAM).
  - Sincronización en tiempo real con botones visuales y atajos de teclado estándar (`Ctrl+Z`, `Ctrl+Y` y `Ctrl+Shift+Z` / `Cmd+Z` y `Cmd+Shift+Z`).
- **Herramienta de Recorte con Máscara Sombreada:**
  - Área de recorte interactiva con sombreado oscuro translúcido exterior (`evenodd`), cálculo dinámico de coordenadas y sustitución atómica de imagen.
- **Filtros Artísticos & Procesamiento:**
  - Filtros en tiempo real (Blanco y Negro, Sepia, Vintage, Invertir) y controles continuos de brillo y contraste.
- **Reconocimiento Óptico de Caracteres (OCR):**
  - Detección y extracción de texto embebido en imágenes mediante Tesseract.js directamente en el navegador.
- **Guías Inteligentes de Alineación (Smart Guides):**
  - Snap magnético automático a los ejes centrales horizontal y vertical del lienzo.
- **Exportación HiDPI / Smart Bounding Box:**
  - Exportación PNG ajustada al cuadro delimitador exacto de los objetos con multiplicador de resolución para alta densidad de píxeles.

---

## 🎓 Competencias Técnicas & Funcionalidades Avanzadas

| Funcionalidad | Concepto / Competencia Técnica | Descripción Técnica |
| :--- | :--- | :--- |
| **Historial (Undo/Redo)** | **Patrón Memento & Gestión de Memoria** | Registro de snapshots serializados en pilas LIFO acotadas a 20 estados (`shift()` preventivo), con sincronización reactiva de botones y escucha de atajos globales previniendo colisión al editar texto. |
| **Herramienta de Recorte** | **Geometría 2D & Máscara de Renderizado** | Transformación geométrica de coordenadas relativas al viewport, hook en `after:render` con recorte `evenodd` para previsualización sombreada y exportación limpia sin elementos de interfaz. |
| **Filtros (Brillo/Contraste)** | **Manipulación de Píxeles (Matrices)** | Procesamiento gráfico matricial en tiempo real sobre los datos RGBA de la imagen. |
| **Capas (Subir/Bajar)** | **Estructuras de Datos (Pila/Z-Index)** | Modificación dinámica de la posición ordinal de los objetos en el árbol de renderizado del lienzo. |
| **Renderizado Condicional** | **Lógica de UI Dinámica** | Detección polimórfica del tipo de objeto seleccionado (`image`, `i-text`) para alternar paneles contextuales de edición de tipografía o filtros. |
| **Exportación HD** | **Data URLs & HiDPI Bounding Box** | Cálculo de límites externos de la composición y exportación de blobs optimizados con factor multiplicador. |

---

## 🛠 Tecnologías Utilizadas

- **HTML5 Canvas**: Motor nativo de renderizado gráfico 2D.
- **Fabric.js v5**: Abstracción orientada a objetos para interacción vectorial y matricial en canvas.
- **Tesseract.js**: Motor OCR WebAssembly para extracción de texto en cliente.
- **Tailwind CSS**: Estilizado atómico moderno y responsivo.
- **JavaScript (ES6 Modules)**: Código estructurado en módulos desacoplados (`history.js`, `crop.js`, `filters.js`, `guides.js`, `ocr.js`, `main.js`).

---

## 💻 Ejecución Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/HugoSabater/EdiMagia.git
   cd EdiMagia
   ```
2. Abre `index.html` en cualquier navegador moderno o sirve la carpeta con cualquier servidor local (ej. `npx serve .` o Live Server en VS Code).
3. No requiere instalación de paquetes (`npm install`) ni compilación previa.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
