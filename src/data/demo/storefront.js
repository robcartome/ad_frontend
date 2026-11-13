// Demostración aislada. No representa precios, stock ni campañas de producción.
export const demoCategories = [
    { id: 'herramientas', name: 'Herramientas', icon: 'drill', description: 'Potencia para cada proyecto' },
    { id: 'construccion', name: 'Construcción', icon: 'brick', description: 'Desde los cimientos' },
    { id: 'gasfiteria', name: 'Gasfitería', icon: 'pipe', description: 'Conexiones que duran' },
    { id: 'electricidad', name: 'Electricidad', icon: 'cable', description: 'Todo bien conectado' },
    { id: 'pinturas', name: 'Pinturas y acabados', icon: 'paint', description: 'Dale vida a tus espacios' },
    { id: 'seguridad', name: 'Seguridad', icon: 'helmet', description: 'Trabaja con confianza' },
];
export const demoProducts = [
    { id: 'demo-taladro', name: 'Taladro percutor de 650 W', brand: 'Línea profesional', category: 'herramientas', sku: 'DEMO-H001', price: 189.9, originalPrice: 239.9, badge: 'Destacado', unit: 'unidad', image: 'drill', description: 'Ilustración de un taladro para presentar la experiencia del catálogo. Las características y el precio son de demostración.' },
    { id: 'demo-cemento', name: 'Cemento para uso general · 42.5 kg', brand: 'Línea construcción', category: 'construccion', sku: 'DEMO-C001', price: 32.5, unit: 'bolsa', image: 'cement', description: 'Producto de ejemplo para la categoría de construcción. Solicita asesoría para elegir el material adecuado para tu obra.' },
    { id: 'demo-pintura', name: 'Pintura látex blanco mate · 1 galón', brand: 'Línea hogar', category: 'pinturas', sku: 'DEMO-P001', price: 59.9, originalPrice: 79.9, badge: 'Renueva tu hogar', unit: 'galón', image: 'paint', description: 'Presentación ilustrativa de pintura para interiores. Color, rendimiento y disponibilidad pendientes de confirmar en el catálogo real.' },
    { id: 'demo-amoladora', name: 'Amoladora angular de 4½ pulgadas', brand: 'Línea profesional', category: 'herramientas', sku: 'DEMO-H002', price: 159, originalPrice: 199, unit: 'unidad', image: 'grinder', description: 'Equipo ilustrativo para mostrar la ficha de producto y el flujo de cotización. No incluye especificaciones técnicas verificadas.' },
    { id: 'demo-tubo', name: 'Tubo PVC para instalaciones', brand: 'Línea instalaciones', category: 'gasfiteria', sku: 'DEMO-G001', price: null, unit: 'unidad', image: 'pipe', description: 'Medida, aplicación y precio por confirmar con un asesor. Este artículo demuestra el comportamiento de productos sin precio publicado.' },
    { id: 'demo-cable', name: 'Cable eléctrico · rollo de 100 m', brand: 'Línea instalaciones', category: 'electricidad', sku: 'DEMO-E001', price: 129.9, unit: 'rollo', image: 'cable', description: 'Imagen ilustrativa. El tipo de conductor y la sección deben confirmarse según las necesidades de la instalación.' },
    { id: 'demo-casco', name: 'Casco de protección para obra', brand: 'Línea seguridad', category: 'seguridad', sku: 'DEMO-S001', price: 24.9, unit: 'unidad', image: 'helmet', description: 'Producto de demostración. Confirmar certificaciones y requisitos de seguridad antes de seleccionar equipo de protección.' },
    { id: 'demo-ladrillo', name: 'Ladrillo para construcción', brand: 'Línea construcción', category: 'construccion', sku: 'DEMO-C002', price: 1.8, unit: 'unidad', image: 'brick', description: 'Producto ilustrativo. Tipo, dimensiones y disponibilidad se confirmarán al integrar el catálogo comercial.' },
];
