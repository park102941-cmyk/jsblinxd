// Roller Shades 제품을 Firebase에 추가하는 스크립트
// 사용법: Admin Dashboard > AI Assistant에서 이 스크립트를 실행

import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const rollerProducts = [
  {
    id: 'roller-blackout-001',
    title: 'Premium Blackout Roller Shades',
    category: 'Roller Shades',
    basePrice: 78.00,
    sizeRatio: 0.12,
    minWidth: 17,
    maxWidth: 95,
    minHeight: 47,
    maxHeight: 118,
    showMotor: false,
    showColor: true,
    imageUrl: '/images/products/roller-blackout.jpg',
    description: 'Premium blackout roller shades that block 100% of light. Perfect for bedrooms, media rooms, and any space requiring complete darkness. Durable fabric with thermal insulation properties.',
    colors: [
      { name: 'Pure White', code: 'WHITE', hex: '#FFFFFF' },
      { name: 'Ivory', code: 'IVORY', hex: '#FFFFF0' },
      { name: 'Beige', code: 'BEIGE', hex: '#F5F5DC' },
      { name: 'Grey', code: 'GREY', hex: '#808080' },
      { name: 'Charcoal', code: 'CHARCOAL', hex: '#36454F' },
      { name: 'Black', code: 'BLACK', hex: '#000000' }
    ],
    features: [
      '100% blackout fabric',
      'Thermal insulation',
      'Manual operation (pull cord)',
      'Customizable dimensions (1/8 inch increments)',
      'Inside or outside mount',
      'Easy installation',
      'Energy efficient',
      'UV protection'
    ],
    mountOptions: ['Inside Mount', 'Outside Mount'],
    controlOptions: [
      { name: 'Continuous Loop Chain', price: 0 },
      { name: 'Spring Roller', price: 15 }
    ],
    tags: ['manual', 'roller', 'blackout', 'thermal', 'energy-efficient'],
    inStock: true,
    featured: true,
    bestseller: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'roller-light-filtering-001',
    title: 'Light Filtering Roller Shades',
    category: 'Roller Shades',
    basePrice: 68.00,
    sizeRatio: 0.10,
    minWidth: 17,
    maxWidth: 95,
    minHeight: 47,
    maxHeight: 118,
    showMotor: false,
    showColor: true,
    imageUrl: '/images/products/roller-light-filtering.jpg',
    description: 'Elegant light filtering roller shades that diffuse natural light while maintaining privacy. Perfect for living rooms, dining areas, and offices. Soft, translucent fabric creates a warm ambiance.',
    colors: [
      { name: 'White', code: 'WHITE', hex: '#FFFFFF' },
      { name: 'Cream', code: 'CREAM', hex: '#FFFDD0' },
      { name: 'Beige', code: 'BEIGE', hex: '#F5F5DC' },
      { name: 'Light Grey', code: 'LIGHT_GREY', hex: '#D3D3D3' },
      { name: 'Taupe', code: 'TAUPE', hex: '#B38B6D' },
      { name: 'Linen', code: 'LINEN', hex: '#FAF0E6' }
    ],
    features: [
      'Light filtering fabric',
      'Privacy protection',
      'UV protection',
      'Manual operation',
      'Customizable dimensions (1/8 inch increments)',
      'Inside or outside mount',
      'Easy to clean',
      'Fade resistant'
    ],
    mountOptions: ['Inside Mount', 'Outside Mount'],
    controlOptions: [
      { name: 'Continuous Loop Chain', price: 0 },
      { name: 'Spring Roller', price: 15 }
    ],
    tags: ['manual', 'roller', 'light-filtering', 'privacy', 'affordable'],
    inStock: true,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'roller-motorized-blackout-001',
    title: 'Motorized Blackout Roller Shades',
    category: 'Roller Shades',
    basePrice: 158.00,
    sizeRatio: 0.18,
    minWidth: 17,
    maxWidth: 95,
    minHeight: 47,
    maxHeight: 118,
    showMotor: true,
    showColor: true,
    imageUrl: '/images/products/roller-motorized-blackout.jpg',
    description: 'Premium motorized blackout roller shades with smart home integration. Complete light control at your fingertips with remote or app operation. Perfect for modern homes seeking convenience and style.',
    colors: [
      { name: 'Pure White', code: 'WHITE', hex: '#FFFFFF' },
      { name: 'Ivory', code: 'IVORY', hex: '#FFFFF0' },
      { name: 'Beige', code: 'BEIGE', hex: '#F5F5DC' },
      { name: 'Grey', code: 'GREY', hex: '#808080' },
      { name: 'Charcoal', code: 'CHARCOAL', hex: '#36454F' },
      { name: 'Black', code: 'BLACK', hex: '#000000' }
    ],
    features: [
      '100% blackout fabric',
      'Motorized operation',
      'Remote control included',
      'Smart home compatible',
      'Rechargeable battery or wired power',
      'Quiet motor operation',
      'Thermal insulation',
      'Customizable dimensions (1/8 inch increments)',
      'Inside or outside mount',
      'Optional valance'
    ],
    mountOptions: ['Inside Mount', 'Outside Mount'],
    motorOptions: [
      { name: 'Rechargeable Battery Motor', price: 0, description: 'Wireless operation with rechargeable battery' },
      { name: 'Wired Motor', price: 0, description: 'Hardwired power connection' },
      { name: 'Solar Panel Motor', price: 50, description: 'Eco-friendly solar charging' }
    ],
    remoteOptions: [
      { name: '1-Channel Remote', price: 0, description: 'Controls one shade' },
      { name: '5-Channel Remote', price: 15, description: 'Controls up to 5 shades' },
      { name: '15-Channel Remote', price: 25, description: 'Controls up to 15 shades' }
    ],
    accessories: [
      { name: 'Valance', colors: ['White', 'Beige', 'Grey', 'Charcoal', 'Black'], price: 20 }
    ],
    tags: ['motorized', 'roller', 'blackout', 'smart-home', 'premium', 'remote-control'],
    inStock: true,
    featured: true,
    bestseller: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'roller-motorized-light-filtering-001',
    title: 'Motorized Light Filtering Roller Shades',
    category: 'Roller Shades',
    basePrice: 148.00,
    sizeRatio: 0.16,
    minWidth: 17,
    maxWidth: 95,
    minHeight: 47,
    maxHeight: 118,
    showMotor: true,
    showColor: true,
    imageUrl: '/images/products/roller-motorized-light-filtering.jpg',
    description: 'Smart motorized light filtering roller shades for effortless light control. Schedule your shades to open and close automatically, creating the perfect ambiance throughout the day.',
    colors: [
      { name: 'White', code: 'WHITE', hex: '#FFFFFF' },
      { name: 'Cream', code: 'CREAM', hex: '#FFFDD0' },
      { name: 'Beige', code: 'BEIGE', hex: '#F5F5DC' },
      { name: 'Light Grey', code: 'LIGHT_GREY', hex: '#D3D3D3' },
      { name: 'Taupe', code: 'TAUPE', hex: '#B38B6D' },
      { name: 'Linen', code: 'LINEN', hex: '#FAF0E6' }
    ],
    features: [
      'Light filtering fabric',
      'Motorized operation',
      'Remote control included',
      'Smart home compatible',
      'Scheduled automation',
      'Rechargeable battery or wired power',
      'Quiet motor operation',
      'UV protection',
      'Customizable dimensions (1/8 inch increments)',
      'Inside or outside mount'
    ],
    mountOptions: ['Inside Mount', 'Outside Mount'],
    motorOptions: [
      { name: 'Rechargeable Battery Motor', price: 0, description: 'Wireless operation with rechargeable battery' },
      { name: 'Wired Motor', price: 0, description: 'Hardwired power connection' },
      { name: 'Solar Panel Motor', price: 50, description: 'Eco-friendly solar charging' }
    ],
    remoteOptions: [
      { name: '1-Channel Remote', price: 0, description: 'Controls one shade' },
      { name: '5-Channel Remote', price: 15, description: 'Controls up to 5 shades' },
      { name: '15-Channel Remote', price: 25, description: 'Controls up to 15 shades' }
    ],
    accessories: [
      { name: 'Valance', colors: ['White', 'Cream', 'Beige', 'Light Grey', 'Taupe'], price: 20 }
    ],
    tags: ['motorized', 'roller', 'light-filtering', 'smart-home', 'automation'],
    inStock: true,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'roller-sheer-001',
    title: 'Sheer Roller Shades',
    category: 'Roller Shades',
    basePrice: 72.00,
    sizeRatio: 0.11,
    minWidth: 17,
    maxWidth: 95,
    minHeight: 47,
    maxHeight: 118,
    showMotor: false,
    showColor: true,
    imageUrl: '/images/products/roller-sheer.jpg',
    description: 'Elegant sheer roller shades that allow natural light while providing daytime privacy. Perfect for creating a bright, airy atmosphere in any room. Lightweight and easy to operate.',
    colors: [
      { name: 'White', code: 'WHITE', hex: '#FFFFFF' },
      { name: 'Ivory', code: 'IVORY', hex: '#FFFFF0' },
      { name: 'Cream', code: 'CREAM', hex: '#FFFDD0' },
      { name: 'Light Grey', code: 'LIGHT_GREY', hex: '#D3D3D3' }
    ],
    features: [
      'Sheer translucent fabric',
      'Daytime privacy',
      'Maximum natural light',
      'Manual operation',
      'Customizable dimensions (1/8 inch increments)',
      'Inside or outside mount',
      'Lightweight design',
      'Easy to clean'
    ],
    mountOptions: ['Inside Mount', 'Outside Mount'],
    controlOptions: [
      { name: 'Continuous Loop Chain', price: 0 },
      { name: 'Spring Roller', price: 15 }
    ],
    tags: ['manual', 'roller', 'sheer', 'light', 'privacy'],
    inStock: true,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Firebase에 제품 추가 함수
export async function addRollerProducts() {
  try {
    const results = [];

    for (const product of rollerProducts) {
      // Extract the id field and remove it from the product data
      const { id: productId, ...productData } = product;
      
      // Use setDoc to set a specific document ID
      const docRef = doc(collection(db, 'products'), productId);
      await setDoc(docRef, productData);
      
      results.push({
        id: productId,
        title: product.title,
        status: 'success'
      });
      console.log(`✅ Added: ${product.title} (${productId})`);
    }

    return {
      success: true,
      message: `Successfully added ${results.length} Roller Shade products`,
      products: results
    };
  } catch (error) {
    console.error('Error adding products:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
}

// 가격 계산 함수
export function calculateRollerPrice(product, width, height, options = {}) {
  let price = product.basePrice;

  // 사이즈 기반 가격
  const sqInches = width * height;
  const sizePrice = (sqInches * product.sizeRatio) / 144; // Convert to sq ft
  price += sizePrice;

  // 모터 옵션
  if (options.motor && product.motorOptions) {
    const motorOption = product.motorOptions.find(m => m.name === options.motor);
    if (motorOption) price += motorOption.price;
  }

  // 리모컨 옵션
  if (options.remote && product.remoteOptions) {
    const remoteOption = product.remoteOptions.find(r => r.name === options.remote);
    if (remoteOption) price += remoteOption.price;
  }

  // 컨트롤 옵션 (Manual only)
  if (options.control && product.controlOptions) {
    const controlOption = product.controlOptions.find(c => c.name === options.control);
    if (controlOption) price += controlOption.price;
  }

  // 액세서리
  if (options.valance && product.accessories) {
    const valanceAccessory = product.accessories.find(a => a.name === 'Valance');
    if (valanceAccessory) price += valanceAccessory.price;
  }

  return Math.round(price * 100) / 100; // Round to 2 decimal places
}

export default {
  products: rollerProducts,
  addRollerProducts,
  calculateRollerPrice
};
