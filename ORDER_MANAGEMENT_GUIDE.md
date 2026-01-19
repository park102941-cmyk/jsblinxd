# 통합 주문 관리 시스템 설치 가이드

JSBlind 웹사이트와 Google Sheets를 연동한 완전한 주문 관리 시스템입니다.

## 🎯 주요 기능

### 1. **주문 관리**
- ✅ 주문 생성 및 자동 저장
- ✅ 주문 상태 실시간 업데이트
- ✅ 일괄 상태 변경
- ✅ 주문 검색 및 필터링
- ✅ CSV 내보내기

### 2. **공장 연동**
- ✅ 원클릭 공장 발주
- ✅ Purchase 시트 자동 업데이트
- ✅ 발주 상태 추적

### 3. **재고 관리**
- ✅ 자동 재고 차감
- ✅ 저재고 알림
- ✅ 재고 현황 조회

### 4. **알림 시스템**
- ✅ Telegram 실시간 알림
- ✅ 고객 이메일 알림
- ✅ 관리자 이메일 알림
- ✅ 배송 추적 알림

### 5. **반품 관리**
- ✅ 반품 접수 및 추적
- ✅ 환불 처리

### 6. **인보이스 생성**
- ✅ PDF 인보이스 자동 생성
- ✅ 이메일 자동 발송

## 📋 설치 단계

### Step 1: Google Apps Script 배포

1. **Google Sheets 열기**
   ```
   https://docs.google.com/spreadsheets/d/1O0RSagEwk8MlxN-Yslcw8F_N5cHzaoz7GJGwWVRfiT0
   ```

2. **Apps Script 에디터 열기**
   - Extensions > Apps Script

3. **코드 복사**
   - `code_enhanced.gs` 파일의 전체 내용을 복사
   - Apps Script 에디터에 붙여넣기 (기존 코드 덮어쓰기)

4. **CONFIG 섹션 업데이트**
   ```javascript
   const CONFIG = {
     TELEGRAM_BOT_TOKEN: 'YOUR_BOT_TOKEN',        // Telegram Bot Token
     TELEGRAM_CHAT_ID: 'YOUR_CHAT_ID',            // Telegram Chat ID
     FACTORY_SHEET_ID: '1O0RSagEwk8MlxN-Yslcw8F_N5cHzaoz7GJGwWVRfiT0',
     CUSTOMER_EMAIL: 'mattehoutdoor@gmail.com',
     ADMIN_EMAIL: 'mattehoutdoor@gmail.com',
     
     SHEETS: {
       FACTORY_ORDER: 'FactoryOrder',
       PURCHASE: 'Purchase',
       PRODUCT: 'Product',
       RETURN: 'Return',
       INVENTORY: 'Inventory'
     }
   };
   ```

5. **배포하기**
   - Deploy > New deployment
   - Select type: Web app
   - Description: "JSBlind Order Management v6.0"
   - Execute as: Me
   - Who has access: **Anyone**
   - Deploy

6. **배포 URL 복사**
   - 배포 완료 후 나오는 URL을 복사
   - 형식: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`

### Step 2: 환경 변수 설정

1. **.env 파일 업데이트**
   ```bash
   cd /Users/jdxblinds/Desktop/Work/jsblindcom
   ```

2. **.env 파일 편집**
   ```env
   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   
   # Firebase 설정 (기존)
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

3. **개발 서버 재시작**
   ```bash
   # 터미널에서 Ctrl+C로 현재 서버 중지
   npm run dev
   ```

### Step 3: Telegram Bot 설정 (선택사항)

1. **Bot 생성**
   - Telegram에서 @BotFather 검색
   - `/newbot` 명령어 입력
   - Bot 이름 및 username 설정
   - Bot Token 복사

2. **Chat ID 확인**
   - Bot과 대화 시작
   - 다음 URL 방문:
     ```
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
     ```
   - `chat.id` 값 복사

3. **CONFIG 업데이트**
   - Apps Script의 CONFIG 섹션에 Token과 Chat ID 입력
   - 재배포

## 🚀 사용 방법

### 관리자 대시보드 접속

1. **로그인**
   ```
   http://localhost:5174/login
   ```
   - 관리자 계정으로 로그인

2. **통합 주문 관리 페이지**
   ```
   http://localhost:5174/admin/enhanced-orders
   ```

### 주요 기능 사용법

#### 1. 주문 조회 및 필터링
- **검색**: 주문번호, 고객명, 상품명으로 검색
- **상태 필터**: 드롭다운에서 상태 선택
- **날짜 필터**: 시작일/종료일 설정

#### 2. 주문 상태 업데이트
- **개별 업데이트**: 각 주문의 "Edit" 버튼 클릭
- **일괄 업데이트**: 
  1. 체크박스로 주문 선택
  2. 상단의 상태 버튼 클릭

#### 3. 공장 발주
- 주문 상태가 "주문접수"인 경우
- "Factory" 아이콘 버튼 클릭
- 자동으로 Purchase 시트에 추가됨

#### 4. 송장번호 입력
- "Truck" 아이콘 버튼 클릭
- 송장번호 입력
- 자동으로 고객에게 이메일 발송

#### 5. CSV 내보내기
- 주문 선택 (또는 전체)
- "CSV 내보내기" 버튼 클릭

### Google Sheets 메뉴 사용

Apps Script를 배포하면 Google Sheets에 자동으로 메뉴가 추가됩니다:

**🚀 JSBlind 관리** 메뉴:
- 📦 발주 전송: 주문접수 상태를 일괄 발주
- 📊 재고 확인: 저재고 항목 확인
- 📧 테스트 이메일: 이메일 설정 테스트
- 💬 테스트 Telegram: Telegram 연동 테스트
- ⚙️ 설정: 현재 설정 확인

## 📊 Google Sheets 구조

### FactoryOrder 시트
주문 정보가 저장되는 메인 시트
- 주문일, 주문번호, Side Mark
- 고객명, 배송주소
- 상품명, Color, 크기 (inch/cm)
- Mount, Motor/Cord, 수량
- 상태, 송장번호, 판매가
- Email, Phone, 메모

### Purchase 시트
공장 발주 정보
- PO #, No., Side Mark
- Product, Color, 크기
- Mount, Motor, Qty
- Full Address, Factory Status
- Tracking, Notes

### Product 시트
제품 카탈로그
- ID, Title, Category
- Base Price, Size Ratio
- Min/Max Width/Height
- Show Motor, Show Color
- Image URL, Description
- Colors JSON, Updated At

### Inventory 시트
재고 관리
- Component ID, Component Name
- Unit, Current Stock
- Min/Max Stock
- Last Updated, Supplier
- Unit Price

### Return 시트
반품 관리
- Return Date, Return ID
- Order ID, Customer Name
- Product, Reason
- Status, Refund Amount
- Notes, Processed By

## 🔧 API 엔드포인트

### GET 요청
```javascript
// 주문 조회
GET ?action=orders

// 특정 주문 조회
GET ?action=order&orderId=JSB240116-1234

// 제품 조회
GET ?action=products

// 재고 조회
GET ?action=inventory

// 반품 조회
GET ?action=returns

// 발주 조회
GET ?action=purchase_orders
```

### POST 요청
```javascript
// 주문 생성
POST { action: 'create_order', ... }

// 상태 업데이트
POST { action: 'update_order_status', orderId, status, ... }

// 송장번호 업데이트
POST { action: 'update_tracking', orderId, trackingNumber, email }

// 일괄 상태 업데이트
POST { action: 'batch_update_status', orderIds[], status }

// 공장 발주
POST { action: 'send_to_factory', ... }

// 재고 업데이트
POST { action: 'update_inventory', ... }

// 반품 생성
POST { action: 'create_return', ... }

// 제품 동기화
POST { action: 'sync_products', products[] }
```

## 🐛 문제 해결

### 1. "Script function not found" 오류
- Apps Script 코드가 제대로 저장되었는지 확인
- 배포를 새로 만들었는지 확인 (기존 배포 업데이트 아님)

### 2. 주문이 Google Sheets에 저장되지 않음
- `.env` 파일의 URL이 정확한지 확인
- 개발 서버를 재시작했는지 확인
- 브라우저 콘솔에서 에러 확인

### 3. Telegram 알림이 오지 않음
- Bot Token과 Chat ID가 정확한지 확인
- Bot과 대화를 시작했는지 확인
- "테스트 Telegram" 메뉴로 연동 테스트

### 4. 이메일이 발송되지 않음
- Gmail 계정으로 로그인되어 있는지 확인
- "테스트 이메일" 메뉴로 설정 테스트
- 스팸 폴더 확인

### 5. CORS 오류
- Apps Script 배포 시 "Anyone"으로 설정했는지 확인
- 배포 URL이 정확한지 확인

## 📝 추가 기능 개발

### 프론트엔드에서 API 사용 예시

```javascript
import orderAPI from '../services/orderAPI';

// 주문 생성
const result = await orderAPI.createOrder({
  customerName: '홍길동',
  email: 'customer@example.com',
  phone: '010-1234-5678',
  shippingAddress: '서울시 강남구...',
  items: [
    {
      title: 'Roller Blind',
      width: 48,
      height: 72,
      color: 'White',
      quantity: 2,
      price: 150
    }
  ],
  total: 300
});

// 상태 업데이트
await orderAPI.updateOrderStatus('JSB240116-1234', '배송중', {
  trackingNumber: '1234567890',
  notifyCustomer: true,
  email: 'customer@example.com'
});

// 공장 발주
await orderAPI.sendToFactory({
  orderId: 'JSB240116-1234',
  items: [...],
  fullAddress: '...'
});
```

## 🎓 교육 자료

### 상태 코드
- `주문접수`: 새 주문
- `발주완료`: 공장에 발주됨
- `제작중`: 공장에서 제작 중
- `배송중`: 배송 시작
- `배송완료`: 배송 완료
- `취소`: 주문 취소

### 색상 코드
각 상태별로 자동으로 색상이 지정됩니다:
- 주문접수: 흰색
- 발주완료: 노란색
- 제작중: 연두색
- 배송중: 파란색
- 배송완료: 회색
- 취소: 빨간색

## 📞 지원

문제가 발생하거나 질문이 있으시면:
- Email: mattehoutdoor@gmail.com
- Phone: 214-649-9992

---

**버전**: 6.0
**최종 업데이트**: 2026-01-16
**개발**: JSBlind Tech Team
