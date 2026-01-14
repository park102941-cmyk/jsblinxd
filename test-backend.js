// Backend API Test Script
// Google Apps Script 백엔드 테스트

const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbx243jP2MALxRyxq-u_cj2YMd7shKXvGRA0HKFDrp7ohcZ-U7M-0OY9jb881F_ZomLK/exec';

// 색상 출력을 위한 헬퍼
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 테스트 결과 저장
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// 테스트 1: 주문 조회 (GET)
async function testGetOrders() {
    log('\n📋 테스트 1: 주문 조회 (GET)', 'cyan');
    try {
        const response = await fetch(BACKEND_URL);
        const data = await response.json();
        
        if (response.ok && Array.isArray(data)) {
            log(`✅ 성공: ${data.length}개의 주문을 조회했습니다`, 'green');
            if (data.length > 0) {
                log(`   샘플 데이터: ${JSON.stringify(data[0], null, 2)}`, 'blue');
            }
            testResults.passed++;
            testResults.tests.push({ name: '주문 조회', status: 'PASS' });
            return true;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        log(`❌ 실패: ${error.message}`, 'red');
        testResults.failed++;
        testResults.tests.push({ name: '주문 조회', status: 'FAIL', error: error.message });
        return false;
    }
}

// 테스트 2: 제품 조회 (GET with type=products)
async function testGetProducts() {
    log('\n📦 테스트 2: 제품 조회 (GET type=products)', 'cyan');
    try {
        const response = await fetch(`${BACKEND_URL}?type=products`);
        const data = await response.json();
        
        if (response.ok && Array.isArray(data)) {
            log(`✅ 성공: ${data.length}개의 제품을 조회했습니다`, 'green');
            if (data.length > 0) {
                log(`   샘플 데이터: ${JSON.stringify(data[0], null, 2)}`, 'blue');
            }
            testResults.passed++;
            testResults.tests.push({ name: '제품 조회', status: 'PASS' });
            return true;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        log(`❌ 실패: ${error.message}`, 'red');
        testResults.failed++;
        testResults.tests.push({ name: '제품 조회', status: 'FAIL', error: error.message });
        return false;
    }
}

// 테스트 3: 주문 생성 (POST)
async function testCreateOrder() {
    log('\n🛒 테스트 3: 주문 생성 (POST)', 'cyan');
    
    const testOrder = {
        orderId: `TEST-${Date.now()}`,
        name: '테스트 고객',
        email: 'test@example.com',
        address: '서울시 테스트구 테스트동 123',
        total: 150000,
        items: [
            {
                title: '테스트 블라인드',
                color: 'White',
                width: 100,
                height: 150,
                mount: 'Inside',
                control: 'Remote',
                quantity: 1,
                price: 150000,
                location: 'Living Room'
            }
        ],
        consumedAssets: [
            {
                component_id: 'FABRIC_BLACKOUT_WHITE',
                quantity: 1.5
            }
        ]
    };
    
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testOrder)
        });
        
        const data = await response.json();
        
        if (response.ok && data.result === 'success') {
            log(`✅ 성공: 주문이 생성되었습니다`, 'green');
            log(`   주문 ID: ${testOrder.orderId}`, 'blue');
            if (data.stockAlerts && data.stockAlerts.length > 0) {
                log(`   ⚠️  재고 알림: ${data.stockAlerts.join(', ')}`, 'yellow');
            }
            testResults.passed++;
            testResults.tests.push({ name: '주문 생성', status: 'PASS' });
            return true;
        } else {
            throw new Error(data.message || 'Order creation failed');
        }
    } catch (error) {
        log(`❌ 실패: ${error.message}`, 'red');
        testResults.failed++;
        testResults.tests.push({ name: '주문 생성', status: 'FAIL', error: error.message });
        return false;
    }
}

// 테스트 4: 제품 동기화 (POST action=sync_products)
async function testSyncProducts() {
    log('\n🔄 테스트 4: 제품 동기화 (POST action=sync_products)', 'cyan');
    
    const testProducts = [
        {
            id: 'TEST-PRODUCT-1',
            title: '테스트 롤러 블라인드',
            category: 'Roller Blinds',
            basePrice: 50000,
            sizeRatio: 0.5,
            minWidth: 30,
            maxWidth: 300,
            minHeight: 30,
            maxHeight: 300,
            showMotor: true,
            showColor: true,
            imageUrl: 'https://example.com/image.jpg',
            description: '테스트용 제품입니다',
            colors: [
                { name: 'White', code: '#FFFFFF' },
                { name: 'Black', code: '#000000' }
            ]
        }
    ];
    
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'sync_products',
                products: testProducts
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.result === 'success') {
            log(`✅ 성공: ${data.count}개의 제품이 동기화되었습니다`, 'green');
            testResults.passed++;
            testResults.tests.push({ name: '제품 동기화', status: 'PASS' });
            return true;
        } else {
            throw new Error(data.message || 'Product sync failed');
        }
    } catch (error) {
        log(`❌ 실패: ${error.message}`, 'red');
        testResults.failed++;
        testResults.tests.push({ name: '제품 동기화', status: 'FAIL', error: error.message });
        return false;
    }
}

// 테스트 5: 공장 발주 (POST action=send_to_factory)
async function testSendToFactory() {
    log('\n🏭 테스트 5: 공장 발주 (POST action=send_to_factory)', 'cyan');
    
    const testFactoryOrder = {
        action: 'send_to_factory',
        order: {
            orderId: `FACTORY-TEST-${Date.now()}`,
            fullAddress: '서울시 강남구 테스트동 456',
            items: [
                {
                    customerName: '테스트 공장 고객',
                    sideMark: 'A1',
                    widthInch: 39.37,
                    heightInch: 59.06,
                    widthCm: 100,
                    heightCm: 150,
                    finalWidthCm: 102,
                    finalHeightCm: 152,
                    fabricCode: 'BL-WHITE-001',
                    priceInch: 0.07,
                    price: 150000,
                    motor: 50000,
                    totalSqm: 1.5
                }
            ]
        }
    };
    
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testFactoryOrder)
        });
        
        const data = await response.json();
        
        if (response.ok && data.result === 'success') {
            log(`✅ 성공: ${data.message}`, 'green');
            testResults.passed++;
            testResults.tests.push({ name: '공장 발주', status: 'PASS' });
            return true;
        } else {
            throw new Error(data.message || 'Factory order failed');
        }
    } catch (error) {
        log(`❌ 실패: ${error.message}`, 'red');
        testResults.failed++;
        testResults.tests.push({ name: '공장 발주', status: 'FAIL', error: error.message });
        return false;
    }
}

// 모든 테스트 실행
async function runAllTests() {
    log('='.repeat(60), 'cyan');
    log('🚀 백엔드 API 테스트 시작', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`📍 엔드포인트: ${BACKEND_URL}`, 'blue');
    
    const startTime = Date.now();
    
    // 순차적으로 테스트 실행
    await testGetOrders();
    await testGetProducts();
    await testCreateOrder();
    await testSyncProducts();
    await testSendToFactory();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // 결과 요약
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 테스트 결과 요약', 'cyan');
    log('='.repeat(60), 'cyan');
    
    testResults.tests.forEach((test, index) => {
        const icon = test.status === 'PASS' ? '✅' : '❌';
        const color = test.status === 'PASS' ? 'green' : 'red';
        log(`${index + 1}. ${icon} ${test.name}: ${test.status}`, color);
        if (test.error) {
            log(`   오류: ${test.error}`, 'red');
        }
    });
    
    log('\n' + '-'.repeat(60), 'cyan');
    log(`총 테스트: ${testResults.passed + testResults.failed}`, 'blue');
    log(`통과: ${testResults.passed}`, 'green');
    log(`실패: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
    log(`소요 시간: ${duration}초`, 'blue');
    log('-'.repeat(60), 'cyan');
    
    if (testResults.failed === 0) {
        log('\n🎉 모든 테스트가 성공했습니다!', 'green');
    } else {
        log('\n⚠️  일부 테스트가 실패했습니다. 위의 오류를 확인하세요.', 'yellow');
    }
}

// 테스트 실행
runAllTests().catch(error => {
    log(`\n💥 치명적 오류: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
