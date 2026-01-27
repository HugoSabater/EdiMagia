# 🎨 EdiMagIA - Editor de Imágenes Web

Un editor de imágenes moderno, rápido y elegante que funciona directamente en tu navegador. Diseñado como parte del portfolio de Desarrollo de Aplicaciones Web (DAW).

![App Screenshot](https://via.placeholder.com/800x400?text=Vista+Previa+de+EdiMagIA) <!-- Puedes reemplazar esto con una captura real más tarde -->

## ✨ Características

- **Diseño Premium**: Interfaz oscura moderna utilizando variables CSS y Glassmorphism.
- **Manipulación de Objetos**: Mueve, escala y rota imágenes y texto gracias a **Fabric.js**.
- **Filtros en Tiempo Real**: Aplica escala de grises o sepia con un solo clic.
- **Exportación HD**: Descarga tu creación como un archivo PNG de alta calidad.
- **Privacidad**: Todo el procesamiento se realiza en el navegador (Client-Side), nada se sube a la nube.

## 🤖 Desarrollo con IA (Honestidad Académica)

Este proyecto ha sido desarrollado utilizando **Google Gemini** como asistente de codificación para agilizar la estructura inicial y la lógica base de Fabric.js.

- **Rol de la IA**: Generación del esqueleto HTML, lógica base de inicialización del Canvas y sugerencia de estructura CSS.
- **Aportación Propia**:
    - Implementación manual de la estética "Premium" (Dark Mode, paleta de colores personalizada).
    - Lógica de filros (Grayscale/Sepia) y botón de "Reset".
    - Refactorización del código para asegurar legibilidad y buenas prácticas.
    - Explicación técnica detallada (ver abajo).

> *El código resultante ha sido revisado, entendido y modificado para cumplir con los estándares de calidad del ciclo formativo.*

## 🔧 Documentación Técnica

### 1. Librería Gráfica: Fabric.js
Para manejar el `canvas` de HTML5 de forma avanzada, utilizamos **Fabric.js**.
En lugar de instalarla vía `npm` (que requeriría un entorno de construcción como Webpack/Vite), la hemos importado directamente vía **CDN** para mantener el proyecto ligero y ejecutable en cualquier navegador sin dependencias.

```html
<script src="https://unpkg.com/fabric@5.3.0/dist/fabric.min.js"></script>
```

### 2. Evento de Descarga (Exportación)
La funcionalidad de descarga no requiere un servidor. Utilizamos el método nativo de HTML5 `canvas.toDataURL()` para convertir los píxeles del lienzo en una cadena Base64 (formato imagen).
Luego, creamos un enlace temporal `<a>` en el DOM, le asignamos esa URL y simulamos un clic.

**Snippet del código (`script.js`):**
```javascript
const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
const link = document.createElement('a');
link.download = 'imagen-editada.png';
link.href = dataURL;
link.click(); // Dispara la descarga automática
```

---

## 🚀 Cómo usarlo
1. Clona este repositorio o descarga los archivos.
2. Abre el archivo `index.html` en tu navegador favorito.
3. ¡Sube una imagen y empieza a crear!
