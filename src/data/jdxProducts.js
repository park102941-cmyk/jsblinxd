export const jdxProducts = [
  // --- Zebra Shades (Light Filtering) ---
  {
    id: 'jdx-zebra-coit',
    title: 'JDX Zebra Shades - COIT',
    category: 'Zebra Shades',
    subCategory: 'Light Filtering',
    basePrice: 92.00,
    sizeRatio: 0.16,
    minWidth: 15,
    maxWidth: 110,
    minHeight: 15,
    maxHeight: 120,
    showMotor: true,
    showColor: true,
    imageUrl: '/images/products/jdx-zebra-coit.png',
    description: 'Premium light filtering zebra shades from JDX COIT collection. Features antibacterial fabric and high UV protection.',
    colors: [
      { name: 'White', code: 'WHITE', hex: '#FFFFFF' },
      { name: 'Light Grey', code: 'L_GREY', hex: '#D3D3D3' },
      { name: 'Grey', code: 'GREY', hex: '#808080' },
      { name: 'Wine', code: 'WINE', hex: '#722F37' }
    ],
    features: ['100% Polyester', 'Antibacterial', 'UV Blocking (99.1%)', 'UPF 50+', 'Light Filtering'],
    tags: ['jdx', 'zebra', 'light-filtering', 'antibacterial'],
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'jdx-zebra-las-colinas',
    title: 'JDX Zebra Shades - LAS COLINAS',
    category: 'Zebra Shades',
    subCategory: 'Light Filtering',
    basePrice: 95.00,
    sizeRatio: 0.17,
    imageUrl: '/images/products/jdx-zebra-coit.png',
    description: 'Elegant textured zebra shades from the Las Colinas collection. Perfect for modern interiors.',
    colors: [
      { name: 'Mushroom', code: 'MUSHROOM', hex: '#E1D9D1' },
      { name: 'Light Grey', code: 'L_GREY', hex: '#D3D3D3' },
      { name: 'Charcoal', code: 'CHARCOAL', hex: '#36454F' },
      { name: 'Wood', code: 'WOOD', hex: '#A0522D' }
    ],
    features: ['Textured Fabric', 'Antibacterial', 'UV Blocking', 'UPF 50+'],
    tags: ['jdx', 'zebra', 'textured', 'premium'],
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'jdx-zebra-legacy',
    title: 'JDX Zebra Shades - LEGACY',
    category: 'Zebra Shades',
    subCategory: 'Light Filtering',
    basePrice: 90.00,
    sizeRatio: 0.15,
    imageUrl: '/images/products/jdx-zebra-coit.png',
    colors: [
      { name: 'Ivory', code: 'IVORY', hex: '#FFFFF0' },
      { name: 'Mushroom', code: 'MUSHROOM', hex: '#E1D9D1' },
      { name: 'Beige', code: 'BEIGE', hex: '#F5F5DC' },
      { name: 'Charcoal', code: 'CHARCOAL', hex: '#36454F' }
    ],
    features: ['Antibacterial', 'UV Protection', 'Premium Quality'],
    tags: ['jdx', 'zebra', 'legacy', 'classic'],
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // --- Zebra Shades (Blackout) ---
  {
    id: 'jdx-zebra-apache-blackout',
    title: 'JDX Zebra Shades - APACHE (Blackout)',
    category: 'Zebra Shades',
    subCategory: 'Blackout',
    basePrice: 110.00,
    sizeRatio: 0.20,
    imageUrl: '/images/products/jdx-roller-blackout.png',
    description: 'High-performance blackout zebra shades from the Apache collection. Provides complete privacy and light control.',
    colors: [
      { name: 'Beige', code: 'BEIGE', hex: '#F5F5DC' },
      { name: 'Light Grey', code: 'L_GREY', hex: '#D3D3D3' },
      { name: 'Dark Grey', code: 'D_GREY', hex: '#555555' },
      { name: 'Wood', code: 'WOOD', hex: '#A0522D' }
    ],
    features: ['100% Blackout', 'Antibacterial', 'UV Blocking (99.9%)', 'Thermal Insulation'],
    tags: ['jdx', 'zebra', 'blackout', 'privacy'],
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'jdx-zebra-hebron-blackout',
    title: 'JDX Zebra Shades - HEBRON (Blackout)',
    category: 'Zebra Shades',
    subCategory: 'Blackout',
    basePrice: 115.00,
    sizeRatio: 0.22,
    imageUrl: '/images/products/jdx-roller-blackout.png',
    colors: [
      { name: 'Beige', code: 'BEIGE', hex: '#F5F5DC' },
      { name: 'Light Grey', code: 'L_GREY', hex: '#D3D3D3' },
      { name: 'Dark Grey', code: 'D_GREY', hex: '#555555' },
      { name: 'Ink Black', code: 'INK_BLACK', hex: '#0F0F0F' }
    ],
    features: ['Superior Blackout', 'Antibacterial', 'Modern Look'],
    tags: ['jdx', 'zebra', 'blackout', 'modern'],
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // --- Roller Shades (Light Filtering) ---
  {
    id: 'jdx-roller-alamo',
    title: 'JDX Roller Shades - ALAMO',
    category: 'Roller Shades',
    subCategory: 'Light Filtering',
    basePrice: 75.00,
    sizeRatio: 0.12,
    imageUrl: '/images/products/jdx-roller-light-filtering.png',
    colors: [
      { name: 'White', code: 'WHITE', hex: '#FFFFFF' },
      { name: 'Ivory', code: 'IVORY', hex: '#FFFFF0' },
      { name: 'Beige', code: 'BEIGE', hex: '#F5F5DC' },
      { name: 'Grey', code: 'GREY', hex: '#808080' }
    ],
    features: ['Antibacterial', 'UV Blocking', 'Smooth Operation'],
    tags: ['jdx', 'roller', 'light-filtering', 'alamo'],
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'jdx-roller-sunscreen-3',
    title: 'JDX Sunscreen Roller Shades (3%)',
    category: 'Roller Shades',
    subCategory: 'Sunscreen',
    basePrice: 85.00,
    sizeRatio: 0.14,
    imageUrl: '/images/products/jdx-roller-light-filtering.png',
    colors: [
      { name: 'White', code: 'WHITE', hex: '#FFFFFF' },
      { name: 'Ivory', code: 'IVORY', hex: '#FFFFF0' },
      { name: 'Grey', code: 'GREY', hex: '#808080' },
      { name: 'Black', code: 'BLACK', hex: '#000000' }
    ],
    features: ['3% Openness Factor', 'Heat Reduction', 'Glare Control', 'UV Protection'],
    tags: ['jdx', 'roller', 'sunscreen', 'commercial'],
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // --- Roller Shades (Blackout) ---
  {
    id: 'jdx-roller-eldorado-blackout',
    title: 'JDX Roller Shades - ELDORADO (Blackout)',
    category: 'Roller Shades',
    subCategory: 'Blackout',
    basePrice: 88.00,
    sizeRatio: 0.15,
    imageUrl: '/images/products/jdx-roller-blackout.png',
    colors: [
      { name: 'Ivory', code: 'IVORY', hex: '#FFFFF0' },
      { name: 'Beige', code: 'BEIGE', hex: '#F5F5DC' },
      { name: 'Brown', code: 'BROWN', hex: '#5D4037' },
      { name: 'Grey', code: 'GREY', hex: '#808080' }
    ],
    features: ['100% Blackout', 'Antibacterial', 'Easy Maintenance'],
    tags: ['jdx', 'roller', 'blackout', 'eldorado'],
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'jdx-roller-arbor-hills-blackout',
    title: 'JDX Roller Shades - ARBOR HILLS (Blackout)',
    category: 'Roller Shades',
    subCategory: 'Blackout',
    basePrice: 92.00,
    sizeRatio: 0.16,
    imageUrl: '/images/products/jdx-roller-blackout.png',
    colors: [
      { name: 'Sand', code: 'SAND', hex: '#C2B280' },
      { name: 'Light Grey', code: 'L_GREY', hex: '#D3D3D3' },
      { name: 'Ash', code: 'ASH', hex: '#B2BEB5' },
      { name: 'Mocha', code: 'MOCHA', hex: '#A38068' }
    ],
    features: ['Textured Blackout', 'Natural Look', 'Antibacterial'],
    tags: ['jdx', 'roller', 'blackout', 'textured'],
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // --- Unislat Living (Smart Curtains) ---
  {
    id: 'jdx-unislat-santorini',
    title: 'JDX Unislat Living - SANTORINI',
    category: 'Smart Curtains',
    subCategory: 'Unislat',
    basePrice: 195.00,
    sizeRatio: 0.30,
    showMotor: true,
    showColor: true,
    imageUrl: '/images/products/jdx-unislat-santorini.png',
    description: 'Luxury smart curtain system from Unislat Living. The Santorini collection offers a perfect blend of elegance and technology.',
    colors: [
      { name: 'Blue & White', code: 'BLUE_WHITE', hex: '#0000FF' },
      { name: 'Pure White', code: 'WHITE', hex: '#FFFFFF' }
    ],
    features: ['Smart Motorized Control', 'Unique Vertical Slat Design', 'Soft Light Diffusion', 'Remote & App Operation'],
    tags: ['jdx', 'unislat', 'smart-curtain', 'luxury', 'motorized'],
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default jdxProducts;
