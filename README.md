# 🎨 EdiMagIA - Editor de Imágenes Profesional

Un editor de imágenes moderno y potente, desarrollado con **Vanilla JavaScript**, **Fabric.js** y **Tailwind CSS**.

![App Screenshot](https://via.placeholder.com/800x400?text=Vista+Previa+de+EdiMagIA)

## 🎓 Competencias Técnicas & Funcionalidades Avanzadas

Este proyecto no es solo una interfaz visual, demuestra la implementación de conceptos complejos de desarrollo web y manipulación gráfica.

| Funcionalidad | Concepto / Competencia Técnica | Descripción Técnica |
| :--- | :--- | :--- |
| **Filtros (Brillo/Contraste)** | **Manipulación de Píxeles (Matrices)** | Comprensión de cómo se procesan los datos gráficos. Se accede a la matriz de píxeles (`ImageData`) y se aplican transformaciones algebraicas para alterar los valores RGBA en tiempo real. |
| **Capas (Subir/Bajar)** | **Estructuras de Datos (Pila/Stack)** | Manejo del orden de renderizado (Z-Index). Los objetos en Canvas se almacenan en un array; funciones como `bringForward` modifican el ndice del objeto en ese array, alterando el orden de pintado. |
| **Renderizado Condicional** | **Lógica de UI Dinámica** | El panel de control reacciona al estado de la aplicación. Se detecta el tipo de objeto (`activeObject.type === 'image'`) para mostrar selectivamente paneles de Filtros o Texto, mejorando la UX. |
| **Eventos de Teclado** | **Event Listeners Globales** | Gestión avanzada del DOM. Escucha de eventos `keydown` globales para atajos como `Delete`, implementando prevención de errores (e.g., no borrar si se está editando texto). |
| **Exportación HD** | **Data URLs & Blobs** | Conversión del estado del Canvas a una imagen estática PNG mediante `toDataURL`, manejando multiplicadores de resolución para garantizar calidad Retina/HiDPI. |
| **Herramienta de Recorte** | **Geometría de Coordenadas & Callbacks** | Implementación de un sistema de recorte no destructivo. Se calcula la intersección visual, se exporta el área específica con `toDataURL` y se reimporta la imagen procesada, gestionando referencias nulas y asincronía. |
| **Historial (Undo/Redo)** | **Patrón Monitor/Memento** | Sistema robusto de gestión de estado. Cada acción guarda un snapshot comprimido (JSON) del canvas. Se gestionan pilas (stacks) para navegar temporalmente por los cambios sin perder consistencia. |

## 🚀 Cómo empezar

1.  Clona el repositorio.
2.  Abre `index.html` en tu navegador.
3.  ¡Empieza a crear! No requiere instalación (`npm`) ni compilación.

## 🛠 Tecnologías

*   **HTML5 Canvas**: Motor de renderizado gráfico.
*   **Fabric.js**: Librería para el modelo de objetos sobre Canvas.
*   **Tailwind CSS**: Framework de utilidades para una UI moderna y responsiva.
*   **JavaScript (ES6+)**: Lógica pura sin frameworks reactivos.
