---
title: "SenseLabel: A Flexible Framework for Remote Sensing Data Annotation"
tags:
  - remote sensing
  - semantic segmentation
  - annotation
  - geospatial data
  - labelling 
  - GIS
authors:
  - name: David Pogorzelski
    orcid: 0009-0002-1763-8978
    affiliation: 1
  - name: Peter Arlinghaus
    orcid: 0000-0003-1015-9472
    affiliation: 1
  - name: Chandrabali Karmakar
    orcid: 0000-0002-7098-344X
    affiliation: 2
  - name: Andrés Camero
    orcid: 0000-0002-8152-9381
    affiliation: 2
  - name: Wenyan Zhang
    orcid: 0000-0002-6239-8312
    affiliation: 1
affiliations:
 - name: Helmholtz-Zentrum hereon GmbH, Sediment Transport and Morphodynamics, Germany
   index: 1
 - name: German Aerospace Center (DLR), Remote Sensing Technology Institute, Germany
   index: 2
date: 17 January 2025
bibliography: paper.bib
---

# Summary

SenseLabel is an open-source, web-based platform for annotating remote sensing data, with a primary focus on semantic segmentation. Designed with flexibility and scalability in mind, SenseLabel enables researchers, analysts, and developers to efficiently label geospatial data while maintaining pixel-level accuracy, a crucial feature for remote sensing workflows.

A key feature of SenseLabel is its ability to run locally without requiring server infrastructure, aside from a lightweight setup involving Nuxt3. This makes the tool accessible for offline use and in environments with limited internet connectivity. Additionally, while SenseLabel currently supports GeoTIFF files (one file per satellite band), future updates aim to include compatibility with a broader range of formats, enhancing its versatility.

SenseLabel supports semantic segmentation tasks with specialized features, including spectral index computation (e.g., NDVI, NDWI) and preconfigured support for popular satellite products like Sentinel-2 (L1C and L2A) and Landsat-8 TOA. Its modular architecture and extensibility make it adaptable for other annotation tasks such as object detection and instance segmentation, ensuring it remains future-proof for various geospatial applications.

# Statement of Need

High-resolution remote sensing data is becoming increasingly accessible, necessitating robust annotation tools that meet the unique demands of geospatial data processing. Existing tools often lack essential capabilities like pixel-level accuracy, support for standard GIS file formats, and the ability to compute spectral indices directly. These limitations hinder researchers and practitioners in domains such as land classification, environmental monitoring, and urban planning.

SenseLabel bridges this gap by providing an intuitive and specialized annotation platform optimized for remote sensing data. Its direct support for GeoTIFF files, without interpolation, ensures that the raw pixel values critical to geospatial analysis are preserved. Furthermore, the ability to extend SenseLabel’s functionality to new data formats and annotation tasks positions it as a versatile tool for researchers and developers alike.

# Features

SenseLabel offers the following key features:

### Current Capabilities
- **Annotation Tools**: Intuitive tools for semantic segmentation, including pen, eraser, bucket fill, and gap-drawer.
- **Spectral Index Computation**: Automated NDVI and NDWI calculations for enhanced geospatial analysis.
- **Clustering**: Layer-specific k-means clustering for quick and efficient annotation.
- **Visualization**: Multi-layer raster visualization and editing for improved context.
- **External Data Integration**: OpenStreetMap integration for navigation and context.
- **Preprocessing**: Flexible normalization options for image enhancement.
- **Export Formats**: Support for exporting labeled data as NumPy arrays, ensuring compatibility with machine learning workflows.

### Extensibility
- Configurable for future annotation methods like object detection and instance segmentation.
- Adaptable to new satellite products and geospatial features.

### Interoperability
- Direct handling of GeoTIFF files ensures seamless integration with GIS workflows.

### Scalability
- Efficient processing of large datasets using web workers.

# Usage

SenseLabel is designed to address a variety of geospatial use cases:

- **Semantic Segmentation**: Creation of labeled datasets for tasks such as land cover classification, vegetation health monitoring, and water body mapping.
- **Geospatial Analysis**: Quick computation of spectral indices and clustering tools for accurate analysis.
- **Future Applications**: Extension to advanced annotation tasks such as object detection and instance segmentation.

The platform’s local setup minimizes dependencies and infrastructure requirements, while planned updates to enable server-based deployment promise scalability for larger projects.

# Acknowledgements

We acknowledge the contributions of the open-source community and the support of Helmholtz Imaging in developing SenseLabel. This collaborative effort has been instrumental in creating a robust and extensible tool that meets the specialized needs of geospatial researchers.
