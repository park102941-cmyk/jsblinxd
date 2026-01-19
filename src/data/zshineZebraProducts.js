// ZSHINE Zebra Roller Shades 제품을 Firebase에 추가하는 스크립트
// 사용법: Admin Dashboard > AI Assistant에서 이 스크립트를 실행

import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const zshineZebraProducts = [
  {
    id: 'zebra-manual-001',
    title: 'ZSHINE Manual Light Filtering Zebra Shades',
    category: 'Zebra Shades',
    basePrice: 88.00,
    sizeRatio: 0.15,
    minWidth: 17,
    maxWidth: 95,
    minHeight: 47,
    maxHeight: 118,
    showMotor: false,
    showColor: true,
    imageUrl: '/images/products/zebra-manual.jpg',
    description: 'Light filtering zebra shades with manual operation. Perfect for controlling light and privacy with alternating sheer and solid fabric bands. Easy to install and operate with a simple pull cord or push-pull rod system.',
    colors: [
      { name: 'White', code: 'WHITE', hex: '#FFFFFF' },
      { name: 'Beige', code: 'BEIGE', hex: '#F5F5DC' },
      { name: 'Grey', code: 'GREY', hex: '#808080' },
      { name: 'Light Coffee', code: 'LIGHT_COFFEE', hex: '#C8AD7F' }
    ],
    features: [
      'Light filtering fabric',
      'Manual operation (pull cord)',
      'Customizable dimensions (1/8 inch increments)',
      'Inside or outside mount',
      'Optional push-pull rod',
      'Easy installation',
      'Privacy control'
    ],
    mountOptions: ['Inside Mount', 'Outside Mount'],
    controlOptions: [
      { name: 'Pull Cord', price: 0 },
      { name: 'Push-Pull Rod', price: 10 }
    ],
    tags: ['manual', 'zebra', 'light-filtering', 'affordable'],
    inStock: true,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'zebra-motorized-001',
    title: 'ZSHINE Motorized Zebra Roller Blind',
    category: 'Zebra Shades',
    basePrice: 168.00,
    sizeRatio: 0.20,
    minWidth: 17,
    maxWidth: 95,
    minHeight: 47,
    maxHeight: 118,
    showMotor: true,
    showColor: true,
    imageUrl: '/images/products/zebra-motorized.jpg',
    description: 'Premium motorized zebra shades with remote control operation. Features rechargeable battery or wired power options. Compatible with smart home systems for automated light control throughout the day.',
    colors: [
      { name: 'White', code: 'WHITE', hex: '#FFFFFF' },
      { name: 'Beige', code: 'BEIGE', hex: '#F5F5DC' },
      { name: 'Grey', code: 'GREY', hex: '#808080' },
      { name: 'Light Coffee', code: 'LIGHT_COFFEE', hex: '#C8AD7F' },
      { name: 'Coffee', code: 'COFFEE', hex: '#6F4E37' }
    ],
    features: [
      'Motorized operation',
      'Remote control included',
      'Rechargeable battery or wired power',
      'Smart home compatible',
      'Quiet motor operation',
      'Customizable dimensions (1/8 inch increments)',
      'Inside or outside mount',
      'Optional valance and shading slot'
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
      { name: 'Valance', colors: ['White', 'Beige', 'Grey', 'Light Coffee', 'Coffee'], price: 20 },
      { name: 'Shading Slot', colors: ['White', 'Beige', 'Grey'], price: 15 }
    ],
    tags: ['motorized', 'zebra', 'smart-home', 'premium', 'remote-control'],
    inStock: true,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'zebra-motorized-jacquard-001',
    title: 'ZSHINE Motorized Zebra Shades (Jacquard)',
    category: 'Zebra Shades',
    basePrice: 168.00,
    sizeRatio: 0.22,
    minWidth: 17,
    maxWidth: 95,
    minHeight: 47,
    maxHeight: 118,
    showMotor: true,
    showColor: true,
    imageUrl: '/images/products/zebra-jacquard.jpg',
    description: 'Premium motorized zebra shades featuring luxurious jacquard fabric with textured patterns. Combines elegant design with modern motorized convenience. Thicker, more durable fabric provides enhanced light control and privacy.',
    colors: [
      { name: 'White Jacquard', code: 'WHITE_JACQUARD', hex: '#FFFFFF', pattern: 'Textured weave' },
      { name: 'Beige Jacquard', code: 'BEIGE_JACQUARD', hex: '#F5F5DC', pattern: 'Textured weave' },
      { name: 'Grey Jacquard', code: 'GREY_JACQUARD', hex: '#808080', pattern: 'Textured weave' },
      { name: 'Light Coffee Jacquard', code: 'LIGHT_COFFEE_JACQUARD', hex: '#C8AD7F', pattern: 'Textured weave' }
    ],
    features: [
      'Premium jacquard fabric',
      'Textured pattern design',
      'Motorized operation',
      'Remote control included',
      'Thicker, more durable fabric',
      'Enhanced light control',
      'Smart home compatible',
      'Customizable dimensions (1/8 inch increments)',
      'Inside or outside mount',
      'Fabric-wrapped valance option'
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
    valanceOptions: [
      { name: 'Standard Valance', colors: ['White', 'Beige', 'Grey', 'Light Coffee', 'Coffee'], price: 20 },
      { name: 'Fabric-Wrapped Valance', description: 'Valance wrapped in matching jacquard fabric', price: 35 }
    ],
    tags: ['motorized', 'zebra', 'jacquard', 'premium', 'luxury', 'smart-home'],
    inStock: true,
    featured: true,
    bestseller: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Firebase에 제품 추가 함수
export async function addZshineZebraProducts() {
  try {
    const results = [];

    for (const product of zshineZebraProducts) {
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
      message: `Successfully added ${results.length} ZSHINE Zebra products`,
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
export function calculateZebraPrice(product, width, height, options = {}) {
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
  if (options.valance && product.valanceOptions) {
    const valanceOption = product.valanceOptions.find(v => v.name === options.valance);
    if (valanceOption) price += valanceOption.price;
  } else if (options.valance && product.accessories) {
    const valanceAccessory = product.accessories.find(a => a.name === 'Valance');
    if (valanceAccessory) price += valanceAccessory.price;
  }

  if (options.shadingSlot && product.accessories) {
    const shadingSlot = product.accessories.find(a => a.name === 'Shading Slot');
    if (shadingSlot) price += shadingSlot.price;
  }

  return Math.round(price * 100) / 100; // Round to 2 decimal places
}

// 사용 예시
export function exampleUsage() {
  const manualShade = zshineZebraProducts[0];
  const motorizedShade = zshineZebraProducts[1];
  const jacquardShade = zshineZebraProducts[2];

  // Manual shade: 48" x 72"
  const manualPrice = calculateZebraPrice(manualShade, 48, 72, {
    control: 'Pull Cord'
  });
  console.log(`Manual Shade (48" x 72"): $${manualPrice}`);

  // Motorized shade: 60" x 84" with 5-channel remote and valance
  const motorizedPrice = calculateZebraPrice(motorizedShade, 60, 84, {
    motor: 'Rechargeable Battery Motor',
    remote: '5-Channel Remote',
    valance: 'Valance'
  });
  console.log(`Motorized Shade (60" x 84"): $${motorizedPrice}`);

  // Jacquard shade: 72" x 96" with solar motor and fabric-wrapped valance
  const jacquardPrice = calculateZebraPrice(jacquardShade, 72, 96, {
    motor: 'Solar Panel Motor',
    remote: '15-Channel Remote',
    valance: 'Fabric-Wrapped Valance'
  });
  console.log(`Jacquard Shade (72" x 96"): $${jacquardPrice}`);
}

export default {
  products: zshineZebraProducts,
  addZshineZebraProducts,
  calculateZebraPrice,
  exampleUsage
};
