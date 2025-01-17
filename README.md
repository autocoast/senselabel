
# SenseLabel

[![License](https://img.shields.io/badge/license-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://senselabel.vercel.app)

**SenseLabel** is an open-source, web-based application for annotating remote sensing data. It is designed to assist researchers, analysts, and developers in labelling geospatial data efficiently. The tool supports multiple satellite format and, advanced visualization.

**Live Demo**: [https://senselabel.vercel.app](https://senselabel.vercel.app)

---

## Features

- **Multi-Layer Editing**: Annotate, visualize, and manage raster layers.
- **Advanced Drawing Tools**: Includes pen, eraser, bucket fill, and gap-drawer tools.
- **Geospatial Analysis**:
  - Normalized Difference Vegetation Index (NDVI)
  - Normalized Difference Water Index (NDWI)
  - K-means clustering for vegetation and land classification.
- **Data Management**: Upload and assign metadata to satellite images.
- **Interoperability**: Supports standard GIS formats like GeoTIFF.
- **Extensibility**: Built with modern frameworks (Nuxt, TailwindCSS) for easy customization.

---

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/autocoast/remote-sensing-labelling-tool.git
cd remote-sensing-labelling-tool

# Install dependencies
npm install
```

### Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

To build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Configuration

The tool comes pre-configured to support **Sentinel-2** and **Landsat 8** bands. To add support for other satellites, you can perform a global search for the term `SatelliteType` in the codebase. Adjust the relevant files to include configurations for the new satellite bands.  
Additionally adjust the `config/config.ts` file.

---

## Technologies Used

- **Frontend**: Nuxt, TailwindCSS, Vue.js
- **Visualization**: Leaflet, PanZoom
- **Geospatial Processing**: GeoTIFF, ndArray
- **Backend Processing**: Web workers for NDVI, NDWI, k-means clustering

---

## Live Demo

Experience the tool in action: **[https://senselabel.vercel.app](https://senselabel.vercel.app)**

---

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Added feature-name"`
4. Push to the branch: `git push origin feature-name`
5. Create a pull request.

---

## License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

Special thanks to Helmholtz Imaging and the open-source community for their support and contributions.

---

## Contact

If you have questions or need support, feel free to create an issue in the repository or contact us through [david.pogorzelski@hereon.de](mailto:david.pogorzelski@hereon.de).
