// Firebase에 제품을 추가하는 스크립트
import { addZshineZebraProducts } from '../data/zshineZebraProducts.js';
import { addRollerProducts } from '../data/rollerProducts.js';

async function addAllProducts() {
  console.log('🚀 Starting product import...\n');

  try {
    // Zebra Shades 추가
    console.log('📦 Adding Zebra Shades...');
    const zebraResult = await addZshineZebraProducts();
    if (zebraResult.success) {
      console.log(`✅ ${zebraResult.message}`);
      zebraResult.products.forEach(p => {
        console.log(`   - ${p.title}`);
      });
    } else {
      console.error(`❌ Failed to add Zebra Shades: ${zebraResult.message}`);
    }

    console.log('\n');

    // Roller Shades 추가
    console.log('📦 Adding Roller Shades...');
    const rollerResult = await addRollerProducts();
    if (rollerResult.success) {
      console.log(`✅ ${rollerResult.message}`);
      rollerResult.products.forEach(p => {
        console.log(`   - ${p.title}`);
      });
    } else {
      console.error(`❌ Failed to add Roller Shades: ${rollerResult.message}`);
    }

    console.log('\n🎉 Product import completed!');
    
  } catch (error) {
    console.error('❌ Error during product import:', error);
  }
}

// 스크립트 실행
addAllProducts();
