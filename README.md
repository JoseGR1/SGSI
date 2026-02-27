# Políticas SGSI

Una aplicación web moderna para la creación, gestión y exportación de políticas del **Sistema de Gestión de Seguridad de la Información (SGSI)**.

## ✨ Características

- 🚀 **Dashboard Moderno**: Visualización clara de estadísticas (aprobadas, borradores, archivadas) e historial de documentos.
- ✍️ **Editor Premium**: Layout de 3 columnas con navegación lateral, formulario de edición y vista previa en tiempo real.
- 📄 **Exportación a PDF**: Genera documentos institucionales con un diseño limpio y profesional, optimizado para impresión.
- 💾 **Persistencia Local**: Guarda automáticamente tus progresos en el navegador (Local Storage).
- 🔄 **Importación/Exportación JSON**: Descarga tus políticas en formato JSON para respaldarlas o compartirlas.
- 📱 **Diseño Responsive**: Interfaz optimizada para dispositivos móviles y escritorio.

## 🛠️ Tecnologías

- **Vite 6**: Bundler rápido y moderno.
- **Vanilla JavaScript**: Código ligero y eficiente sin frameworks pesados.
- **CSS3**: Uso de variables (Custom Properties), Grid y Flexbox para un diseño premium.
- **html2pdf.js**: Para la generación de archivos PDF de alta calidad.

## 🚀 Instalación y Uso

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v16 o superior)
- npm (incluido con Node.js)

### Pasos para ejecutar localmente

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/sgsi-politicas.git
   cd sgsi-politicas
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

### Construcción para producción

Para generar los archivos listos para desplegar:
```bash
npm run build
```
Los archivos se generarán en la carpeta `dist/`.

## 📂 Estructura del Proyecto

- `index.html`: Dashboard principal.
- `editor.html`: Editor de políticas.
- `src/`:
  - `styles/`: Hojas de estilo CSS.
  - `utils/`: Utilidades para formateo y almacenamiento.
  - `data/`: Datos iniciales (semilla).
  - `dashboard.js`: Lógica del panel principal.
  - `editor.js`: Lógica del editor y previsualización.

---
Desarrollado con enfoque institucional y profesional para la gestión de seguridad de la información.
