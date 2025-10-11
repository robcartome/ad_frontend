export const fakeProducts = [
  {
    id: "acf4c714-92b4-4140-a940-ca2d6951df74",
    name: "Tee de 32 x 32 x 32 B/I Poelsan",
    sku: "RI03009",
    unit: "und",
    description: "Tee de polietileno de alta densidad 32x32x32 marca Poelsan",
    image: "https://via.placeholder.com/150",
    brand: "Poelsan",
    category: "Riego",
    price_purchase: "10.00",
    active: true,
    created_at: "2023-10-10",
  },
  {
    id: "8db31597-1491-44a6-b03e-0d969d48e3ea",
    name: "Enlace recto de 50 x 50",
    sku: "RI04001",
    unit: "und",
    description: "Enlace recto de 50 mm para manguera HDPE",
    image: "https://via.placeholder.com/150",
    brand: "Poelsan",
    category: "Riego",
    price_purchase: "15.00",
    active: true,
    created_at: "2023-10-10",
  },
];


export const fakeCatalogProducts = [
  {
    id: "acf4c714-92b4-4140-a940-ca2d6951df74",
    name: "Tee de 32 x 32 x 32 B/I Poelsan",
    sku: "RI03009",
    unit: "und",
    description: "Tee de polietileno de alta densidad 32x32x32 marca Poelsan",
    image: "https://via.placeholder.com/150",
    brand: "Poelsan",
    category: "Riego",
    price_purchase: "11.00",
    active: true,
    created_at: "2023-10-10",
    prices: {
        "menor": "13.00",
        "mayor": "14.00",
        "distribucion": "12.00",
    },
    stock: {
        "Almacen principal": 102,
        "Almacen P2": 20
    }
  },
  {
    id: "8db31597-1491-44a6-b03e-0d969d48e3e",
    name: "Enlace recto de 50 x 50",
    sku: "RI04001",
    unit: "und",
    description: "Enlace recto de 50 mm para manguera HDPE",
    image: "https://via.placeholder.com/150",
    brand: "Poelsan",
    category: "Riego",
    price_purchase: "15.00",
    active: true,
    created_at: "2023-10-10",
    prices: {
        "menor": "25.00",
        "mayor": "24.00",
        "distribucion": "22.00",
    },
    stock: {
        "Almacen principal": 10,
        "Almacen P2": 200
    }

  },
  {
    id: "acf4c714-92b4-4140-a940-ca2d6951df745",
    name: "Tee de 50 x 50 x 50 B/I Poelsan",
    sku: "RI03009",
    unit: "und",
    description: "Tee de polietileno de alta densidad 32x32x32 marca Poelsan",
    image: "https://via.placeholder.com/150",
    brand: "Poelsan",
    category: "Riego",
    price_purchase: "15.00",
    active: true,
    created_at: "2023-10-10",
    prices: {
        "menor": "25.00",
        "mayor": "22.00",
        "distribucion": "20.00",
    },
    stock: {
        "Almacen principal": 15,
        "Almacen P2": 64
    }
  },
];
