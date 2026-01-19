// Google Apps Script - JSBlind 통합 주문 관리 시스템
// Version: 6.0 - Full Featured
// 배포 방법:
// 1. Google Sheets 열기 (https://docs.google.com/spreadsheets/d/1O0RSagEwk8MlxN-Yslcw8F_N5cHzaoz7GJGwWVRfiT0)
// 2. Extensions > Apps Script
// 3. 이 코드 전체 복사/붙여넣기
// 4. CONFIG 섹션 업데이트
// 5. Deploy > New Deployment > Web App > Anyone > Deploy

// ==================== CONFIGURATION ====================
const CONFIG = {
  TELEGRAM_BOT_TOKEN: 'YOUR_TELEGRAM_BOT_TOKEN',
  TELEGRAM_CHAT_ID: 'YOUR_TELEGRAM_CHAT_ID',
  FACTORY_SHEET_ID: '1O0RSagEwk8MlxN-Yslcw8F_N5cHzaoz7GJGwWVRfiT0',
  CUSTOMER_EMAIL: 'mattehoutdoor@gmail.com', // 고객 알림 발신 이메일
  ADMIN_EMAIL: 'mattehoutdoor@gmail.com',
  
  // Sheet Names
  SHEETS: {
    FACTORY_ORDER: 'FactoryOrder',
    PURCHASE: 'Purchase',
    PRODUCT: 'Product',
    RETURN: 'Return',
    INVENTORY: 'Inventory'
  }
};

// ==================== WEB APP ENDPOINTS ====================

function doGet(e) {
  const action = e.parameter.action || e.parameter.type;
  const ss = SpreadsheetApp.openById(CONFIG.FACTORY_SHEET_ID);
  
  try {
    switch(action) {
      case 'products':
        return getProducts(ss);
      case 'orders':
        return getOrders(ss);
      case 'order':
        return getOrder(ss, e.parameter.orderId);
      case 'inventory':
        return getInventory(ss);
      case 'returns':
        return getReturns(ss);
      case 'purchase_orders':
        return getPurchaseOrders(ss);
      default:
        return getOrders(ss);
    }
  } catch (error) {
    return createErrorResponse(error);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(30000);
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(CONFIG.FACTORY_SHEET_ID);
    
    switch(data.action) {
      case 'create_order':
        return createOrder(ss, data);
      case 'update_order_status':
        return updateOrderStatus(ss, data);
      case 'send_to_factory':
        return sendToFactory(ss, data);
      case 'update_tracking':
        return updateTracking(ss, data);
      case 'sync_products':
        return syncProducts(ss, data.products);
      case 'create_return':
        return createReturn(ss, data);
      case 'update_inventory':
        return updateInventory(ss, data);
      case 'batch_update_status':
        return batchUpdateStatus(ss, data);
      case 'generate_invoice':
        return generateInvoice(ss, data);
      default:
        return createErrorResponse('Unknown action: ' + data.action);
    }
  } catch (error) {
    return createErrorResponse(error);
  } finally {
    lock.releaseLock();
  }
}

// ==================== ORDER MANAGEMENT ====================

function createOrder(ss, data) {
  const sheet = getOrCreateSheet(ss, CONFIG.SHEETS.FACTORY_ORDER, [
    '주문일', '주문번호', 'Side Mark', '고객명', '배송주소', '상품명', 'Color',
    'W (in)', 'W (cm)', 'H (in)', 'H (cm)', 'Mount', 'Motor/Cord', '수량',
    '상태', '송장번호', '판매가', 'Email', 'Phone', '메모'
  ]);
  
  const timestamp = new Date();
  const orderId = data.orderId || generateOrderId();
  const items = data.items || [];
  
  // 각 아이템을 개별 행으로 추가
  items.forEach((item, index) => {
    const sideMark = `${orderId}-${index + 1}`;
    sheet.appendRow([
      timestamp,
      orderId,
      sideMark,
      data.customerName || data.name,
      data.shippingAddress || data.address,
      item.title || item.productName,
      item.color || 'Default',
      item.widthInch || item.width || 0,
      item.widthCm || (item.width * 2.54) || 0,
      item.heightInch || item.height || 0,
      item.heightCm || (item.height * 2.54) || 0,
      item.mount || 'Inside',
      item.motor || item.control || 'Manual',
      item.quantity || 1,
      '주문접수',
      '',
      item.price || 0,
      data.email,
      data.phone || '',
      data.notes || ''
    ]);
  });
  
  // 재고 처리
  if (data.consumedAssets && data.consumedAssets.length > 0) {
    processInventory(ss, data.consumedAssets);
  }
  
  // 알림 발송
  sendOrderNotifications(data, items, orderId);
  
  return createSuccessResponse({
    orderId: orderId,
    message: '주문이 성공적으로 생성되었습니다.',
    itemCount: items.length
  });
}

function updateOrderStatus(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.FACTORY_ORDER);
  if (!sheet) return createErrorResponse('FactoryOrder 시트를 찾을 수 없습니다.');
  
  const values = sheet.getDataRange().getValues();
  let updated = 0;
  
  for (let i = 1; i < values.length; i++) {
    const orderId = values[i][1]; // 주문번호 컬럼
    
    if (orderId === data.orderId) {
      // 상태 업데이트 (15번째 컬럼 = 상태)
      sheet.getRange(i + 1, 15).setValue(data.status);
      
      // 송장번호가 있으면 업데이트
      if (data.trackingNumber) {
        sheet.getRange(i + 1, 16).setValue(data.trackingNumber);
      }
      
      // 행 색상 변경
      const color = getStatusColor(data.status);
      sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).setBackground(color);
      
      updated++;
    }
  }
  
  // 고객에게 상태 업데이트 이메일 발송
  if (data.notifyCustomer && updated > 0) {
    sendStatusUpdateEmail(data);
  }
  
  return createSuccessResponse({
    message: `${updated}개 항목이 업데이트되었습니다.`,
    updatedCount: updated
  });
}

function sendToFactory(ss, data) {
  const purchaseSheet = getOrCreateSheet(ss, CONFIG.SHEETS.PURCHASE, [
    'PO #', 'No.', 'Side Mark', 'Product', 'Color', 'W (in)', 'W (cm)',
    'H (in)', 'H (cm)', 'Mount', 'Motor', 'Qty', 'Full Address',
    'Factory Status', 'Tracking', 'Notes'
  ]);
  
  const factorySheet = ss.getSheetByName(CONFIG.SHEETS.FACTORY_ORDER);
  const poNumber = data.poNumber || generatePONumber();
  
  // 주문 항목을 Purchase 시트로 복사
  data.items.forEach((item, index) => {
    purchaseSheet.appendRow([
      poNumber,
      index + 1,
      item.sideMark || `${data.orderId}-${index + 1}`,
      item.productName || item.title,
      item.color || 'Default',
      item.widthInch || item.width,
      item.widthCm || (item.width * 2.54),
      item.heightInch || item.height,
      item.heightCm || (item.height * 2.54),
      item.mount || 'Inside',
      item.motor || 'Manual',
      item.quantity || 1,
      data.fullAddress || data.shippingAddress,
      'Pending',
      '',
      item.notes || ''
    ]);
  });
  
  // FactoryOrder 시트의 상태를 '발주완료'로 업데이트
  if (factorySheet) {
    const values = factorySheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][1] === data.orderId) {
        factorySheet.getRange(i + 1, 15).setValue('발주완료');
        factorySheet.getRange(i + 1, 1, 1, factorySheet.getLastColumn()).setBackground('#FFF2CC');
      }
    }
  }
  
  // Telegram 알림
  sendTelegramMessage(`🏭 공장 발주 완료\n\nPO #: ${poNumber}\n주문번호: ${data.orderId}\n항목 수: ${data.items.length}`);
  
  return createSuccessResponse({
    poNumber: poNumber,
    message: '공장 발주가 완료되었습니다.',
    itemCount: data.items.length
  });
}

function updateTracking(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.FACTORY_ORDER);
  if (!sheet) return createErrorResponse('시트를 찾을 수 없습니다.');
  
  const values = sheet.getDataRange().getValues();
  let updated = 0;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][1] === data.orderId) {
      sheet.getRange(i + 1, 16).setValue(data.trackingNumber);
      sheet.getRange(i + 1, 15).setValue('배송중');
      updated++;
    }
  }
  
  // 고객에게 배송 알림 이메일
  if (updated > 0) {
    sendTrackingEmail(data);
  }
  
  return createSuccessResponse({
    message: '송장번호가 업데이트되었습니다.',
    updatedCount: updated
  });
}

function batchUpdateStatus(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.FACTORY_ORDER);
  if (!sheet) return createErrorResponse('시트를 찾을 수 없습니다.');
  
  const orderIds = data.orderIds || [];
  const newStatus = data.status;
  const values = sheet.getDataRange().getValues();
  let updated = 0;
  
  for (let i = 1; i < values.length; i++) {
    if (orderIds.includes(values[i][1])) {
      sheet.getRange(i + 1, 15).setValue(newStatus);
      const color = getStatusColor(newStatus);
      sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).setBackground(color);
      updated++;
    }
  }
  
  return createSuccessResponse({
    message: `${updated}개 주문이 업데이트되었습니다.`,
    updatedCount: updated
  });
}

// ==================== PRODUCT MANAGEMENT ====================

function syncProducts(ss, products) {
  const sheet = getOrCreateSheet(ss, CONFIG.SHEETS.PRODUCT, [
    'ID', 'Title', 'Category', 'Base Price', 'Size Ratio', 'Min W', 'Max W',
    'Min H', 'Max H', 'Show Motor', 'Show Color', 'Image URL', 'Description',
    'Colors JSON', 'Updated At'
  ]);
  
  sheet.clear();
  sheet.appendRow([
    'ID', 'Title', 'Category', 'Base Price', 'Size Ratio', 'Min W', 'Max W',
    'Min H', 'Max H', 'Show Motor', 'Show Color', 'Image URL', 'Description',
    'Colors JSON', 'Updated At'
  ]);
  
  if (products && products.length > 0) {
    const rows = products.map(p => [
      p.id,
      p.title,
      p.category,
      p.basePrice,
      p.sizeRatio,
      p.minWidth,
      p.maxWidth,
      p.minHeight,
      p.maxHeight,
      p.showMotor,
      p.showColor,
      p.imageUrl,
      p.description,
      JSON.stringify(p.colors),
      new Date().toISOString()
    ]);
    
    sheet.getRange(2, 1, rows.length, 15).setValues(rows);
  }
  
  return createSuccessResponse({
    message: '제품이 동기화되었습니다.',
    count: products.length
  });
}

function getProducts(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCT);
  if (!sheet) return createJsonResponse([]);
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return createJsonResponse([]);
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const products = rows.map(row => {
    const product = {};
    headers.forEach((header, index) => {
      if (header === 'Colors JSON') {
        try {
          product.colors = JSON.parse(row[index] || '[]');
        } catch (e) {
          product.colors = [];
        }
      } else {
        product[header.toLowerCase().replace(/ /g, '_')] = row[index];
      }
    });
    return product;
  });
  
  return createJsonResponse(products);
}

// ==================== INVENTORY MANAGEMENT ====================

function updateInventory(ss, data) {
  const sheet = getOrCreateSheet(ss, CONFIG.SHEETS.INVENTORY, [
    'Component ID', 'Component Name', 'Unit', 'Current Stock', 'Min Stock',
    'Max Stock', 'Last Updated', 'Supplier', 'Unit Price'
  ]);
  
  const componentId = data.componentId;
  const quantity = data.quantity;
  const operation = data.operation || 'subtract'; // 'add' or 'subtract'
  
  const values = sheet.getDataRange().getValues();
  let updated = false;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === componentId) {
      const currentStock = Number(values[i][3]);
      const newStock = operation === 'add' 
        ? currentStock + quantity 
        : currentStock - quantity;
      
      sheet.getRange(i + 1, 4).setValue(newStock);
      sheet.getRange(i + 1, 7).setValue(new Date());
      
      // 재고 부족 알림
      const minStock = Number(values[i][4]);
      if (newStock <= minStock) {
        sendLowStockAlert(values[i][1], newStock, minStock);
      }
      
      updated = true;
      break;
    }
  }
  
  if (!updated) {
    // 새 항목 추가
    sheet.appendRow([
      componentId,
      data.componentName,
      data.unit || 'EA',
      quantity,
      data.minStock || 10,
      data.maxStock || 1000,
      new Date(),
      data.supplier || '',
      data.unitPrice || 0
    ]);
  }
  
  return createSuccessResponse({
    message: '재고가 업데이트되었습니다.',
    componentId: componentId
  });
}

function processInventory(ss, consumedAssets) {
  const alerts = [];
  
  consumedAssets.forEach(asset => {
    const result = updateInventory(ss, {
      componentId: asset.component_id,
      quantity: asset.quantity,
      operation: 'subtract'
    });
    
    // 저재고 체크는 updateInventory에서 처리
  });
  
  return alerts;
}

function getInventory(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.INVENTORY);
  if (!sheet) return createJsonResponse([]);
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return createJsonResponse([]);
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const inventory = rows.map(row => {
    const item = {};
    headers.forEach((header, index) => {
      item[header.toLowerCase().replace(/ /g, '_')] = row[index];
    });
    return item;
  });
  
  return createJsonResponse(inventory);
}

// ==================== RETURN MANAGEMENT ====================

function createReturn(ss, data) {
  const sheet = getOrCreateSheet(ss, CONFIG.SHEETS.RETURN, [
    'Return Date', 'Return ID', 'Order ID', 'Customer Name', 'Product',
    'Reason', 'Status', 'Refund Amount', 'Notes', 'Processed By'
  ]);
  
  const returnId = generateReturnId();
  
  sheet.appendRow([
    new Date(),
    returnId,
    data.orderId,
    data.customerName,
    data.product,
    data.reason,
    '접수완료',
    data.refundAmount || 0,
    data.notes || '',
    ''
  ]);
  
  // 알림 발송
  sendReturnNotification(data, returnId);
  
  return createSuccessResponse({
    returnId: returnId,
    message: '반품이 접수되었습니다.'
  });
}

function getReturns(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.RETURN);
  if (!sheet) return createJsonResponse([]);
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return createJsonResponse([]);
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const returns = rows.map(row => {
    const returnItem = {};
    headers.forEach((header, index) => {
      returnItem[header.toLowerCase().replace(/ /g, '_')] = row[index];
    });
    return returnItem;
  });
  
  return createJsonResponse(returns);
}

// ==================== DATA RETRIEVAL ====================

function getOrders(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.FACTORY_ORDER);
  if (!sheet) return createJsonResponse([]);
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return createJsonResponse([]);
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const orders = rows.map(row => {
    const order = {};
    headers.forEach((header, index) => {
      order[header] = row[index];
    });
    return order;
  });
  
  return createJsonResponse(orders);
}

function getOrder(ss, orderId) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.FACTORY_ORDER);
  if (!sheet) return createJsonResponse(null);
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const orderItems = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === orderId) {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = data[i][index];
      });
      orderItems.push(item);
    }
  }
  
  return createJsonResponse({
    orderId: orderId,
    items: orderItems,
    itemCount: orderItems.length
  });
}

function getPurchaseOrders(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEETS.PURCHASE);
  if (!sheet) return createJsonResponse([]);
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return createJsonResponse([]);
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const purchaseOrders = rows.map(row => {
    const po = {};
    headers.forEach((header, index) => {
      po[header.toLowerCase().replace(/ /g, '_')] = row[index];
    });
    return po;
  });
  
  return createJsonResponse(purchaseOrders);
}

// ==================== NOTIFICATIONS ====================

function sendOrderNotifications(data, items, orderId) {
  // Telegram 알림
  let message = `📦 *새 주문 접수*\n\n`;
  message += `🆔 주문번호: ${orderId}\n`;
  message += `👤 고객명: ${data.customerName || data.name}\n`;
  message += `💰 총액: $${data.total || 'N/A'}\n\n`;
  message += `*주문 항목:*\n`;
  
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.title}\n`;
    message += `   크기: ${item.width || 0}" x ${item.height || 0}"\n`;
    message += `   색상: ${item.color || 'N/A'} | 수량: ${item.quantity || 1}\n`;
  });
  
  sendTelegramMessage(message);
  
  // 고객 이메일 알림
  sendCustomerOrderEmail(data, items, orderId);
  
  // 관리자 이메일 알림
  sendAdminOrderEmail(data, items, orderId);
}

function sendCustomerOrderEmail(data, items, orderId) {
  const subject = `[JSBlind] 주문 확인 - ${orderId}`;
  let body = `안녕하세요 ${data.customerName || data.name}님,\n\n`;
  body += `주문이 성공적으로 접수되었습니다.\n\n`;
  body += `주문번호: ${orderId}\n`;
  body += `주문일시: ${new Date().toLocaleString('ko-KR')}\n\n`;
  body += `주문 내역:\n`;
  
  items.forEach((item, index) => {
    body += `${index + 1}. ${item.title}\n`;
    body += `   크기: ${item.width}" x ${item.height}"\n`;
    body += `   색상: ${item.color}\n`;
    body += `   수량: ${item.quantity}\n`;
    body += `   가격: $${item.price}\n\n`;
  });
  
  body += `\n배송 주소: ${data.shippingAddress || data.address}\n\n`;
  body += `주문 상태는 웹사이트에서 확인하실 수 있습니다.\n`;
  body += `감사합니다.\n\nJSBlind 팀`;
  
  try {
    MailApp.sendEmail(data.email, subject, body);
  } catch (e) {
    Logger.log('이메일 발송 실패: ' + e);
  }
}

function sendAdminOrderEmail(data, items, orderId) {
  const subject = `[JSBlind Admin] 새 주문 - ${orderId}`;
  let body = `새 주문이 접수되었습니다.\n\n`;
  body += `주문번호: ${orderId}\n`;
  body += `고객명: ${data.customerName || data.name}\n`;
  body += `이메일: ${data.email}\n`;
  body += `전화번호: ${data.phone || 'N/A'}\n`;
  body += `배송주소: ${data.shippingAddress || data.address}\n\n`;
  body += `주문 항목 수: ${items.length}\n`;
  body += `총 금액: $${data.total || 'N/A'}\n\n`;
  body += `Google Sheets에서 확인:\n`;
  body += `https://docs.google.com/spreadsheets/d/${CONFIG.FACTORY_SHEET_ID}\n`;
  
  try {
    MailApp.sendEmail(CONFIG.ADMIN_EMAIL, subject, body);
  } catch (e) {
    Logger.log('관리자 이메일 발송 실패: ' + e);
  }
}

function sendStatusUpdateEmail(data) {
  const subject = `[JSBlind] 주문 상태 업데이트 - ${data.orderId}`;
  let body = `주문 상태가 업데이트되었습니다.\n\n`;
  body += `주문번호: ${data.orderId}\n`;
  body += `새 상태: ${data.status}\n\n`;
  
  if (data.status === '배송중' && data.trackingNumber) {
    body += `송장번호: ${data.trackingNumber}\n`;
    body += `배송 조회는 택배사 웹사이트에서 가능합니다.\n\n`;
  }
  
  body += `감사합니다.\nJSBlind 팀`;
  
  try {
    if (data.email) {
      MailApp.sendEmail(data.email, subject, body);
    }
  } catch (e) {
    Logger.log('상태 업데이트 이메일 발송 실패: ' + e);
  }
}

function sendTrackingEmail(data) {
  const subject = `[JSBlind] 배송 시작 - ${data.orderId}`;
  let body = `주문하신 제품이 배송 시작되었습니다.\n\n`;
  body += `주문번호: ${data.orderId}\n`;
  body += `송장번호: ${data.trackingNumber}\n\n`;
  body += `배송 조회는 택배사 웹사이트에서 가능합니다.\n\n`;
  body += `감사합니다.\nJSBlind 팀`;
  
  try {
    if (data.email) {
      MailApp.sendEmail(data.email, subject, body);
    }
  } catch (e) {
    Logger.log('배송 이메일 발송 실패: ' + e);
  }
}

function sendReturnNotification(data, returnId) {
  const message = `🔄 *반품 접수*\n\n반품번호: ${returnId}\n주문번호: ${data.orderId}\n고객명: ${data.customerName}\n사유: ${data.reason}`;
  sendTelegramMessage(message);
}

function sendLowStockAlert(componentName, currentStock, minStock) {
  const message = `⚠️ *재고 부족 알림*\n\n품목: ${componentName}\n현재 재고: ${currentStock}\n최소 재고: ${minStock}\n\n재고를 보충해주세요.`;
  sendTelegramMessage(message);
}

function sendTelegramMessage(message) {
  if (!CONFIG.TELEGRAM_BOT_TOKEN || CONFIG.TELEGRAM_BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN') {
    Logger.log('Telegram 설정이 필요합니다.');
    return;
  }
  
  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CONFIG.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    UrlFetchApp.fetch(url, options);
  } catch (e) {
    Logger.log('Telegram 메시지 발송 실패: ' + e);
  }
}

// ==================== INVOICE GENERATION ====================

function generateInvoice(ss, data) {
  // 인보이스 데이터 생성 (PDF 생성은 프론트엔드에서 처리)
  const order = getOrder(ss, data.orderId);
  
  return createJsonResponse({
    orderId: data.orderId,
    invoiceData: order,
    generatedAt: new Date().toISOString()
  });
}

// ==================== UTILITY FUNCTIONS ====================

function getOrCreateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  
  return sheet;
}

function generateOrderId() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `JSB${year}${month}${day}-${random}`;
}

function generatePONumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PO${year}${month}-${random}`;
}

function generateReturnId() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RET${year}${month}-${random}`;
}

function getStatusColor(status) {
  const colors = {
    '주문접수': '#FFFFFF',
    '발주완료': '#FFF2CC',
    '제작중': '#D9EAD3',
    '배송중': '#C9DAF8',
    '배송완료': '#D0E0E3',
    '취소': '#F4CCCC'
  };
  return colors[status] || '#FFFFFF';
}

function createSuccessResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success', ...data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(error) {
  const message = typeof error === 'string' ? error : error.toString();
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'error', message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== MENU & AUTOMATION ====================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 JSBlind 관리')
    .addItem('📦 발주 전송', 'transferOrders')
    .addItem('📊 재고 확인', 'checkInventory')
    .addItem('📧 테스트 이메일', 'sendTestEmail')
    .addItem('💬 테스트 Telegram', 'sendTestTelegram')
    .addSeparator()
    .addItem('⚙️ 설정', 'showConfig')
    .addToUi();
}

function transferOrders() {
  const ss = SpreadsheetApp.openById(CONFIG.FACTORY_SHEET_ID);
  const factorySheet = ss.getSheetByName(CONFIG.SHEETS.FACTORY_ORDER);
  const purchaseSheet = ss.getSheetByName(CONFIG.SHEETS.PURCHASE);
  
  if (!factorySheet || !purchaseSheet) {
    SpreadsheetApp.getUi().alert('필요한 시트를 찾을 수 없습니다.');
    return;
  }
  
  const values = factorySheet.getDataRange().getValues();
  let transferred = 0;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][14] === '주문접수') { // 상태 컬럼
      const poNumber = generatePONumber();
      
      purchaseSheet.appendRow([
        poNumber,
        transferred + 1,
        values[i][2], // Side Mark
        values[i][5], // Product
        values[i][6], // Color
        values[i][7], // W (in)
        values[i][8], // W (cm)
        values[i][9], // H (in)
        values[i][10], // H (cm)
        values[i][11], // Mount
        values[i][12], // Motor
        values[i][13], // Qty
        values[i][4], // Address
        'Pending',
        '',
        ''
      ]);
      
      factorySheet.getRange(i + 1, 15).setValue('발주완료');
      factorySheet.getRange(i + 1, 1, 1, factorySheet.getLastColumn()).setBackground('#FFF2CC');
      transferred++;
    }
  }
  
  SpreadsheetApp.getUi().alert(`총 ${transferred}건의 주문이 발주되었습니다.`);
}

function checkInventory() {
  const ss = SpreadsheetApp.openById(CONFIG.FACTORY_SHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEETS.INVENTORY);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('재고 시트가 없습니다.');
    return;
  }
  
  const values = sheet.getDataRange().getValues();
  let lowStockItems = [];
  
  for (let i = 1; i < values.length; i++) {
    const currentStock = Number(values[i][3]);
    const minStock = Number(values[i][4]);
    
    if (currentStock <= minStock) {
      lowStockItems.push(`${values[i][1]}: ${currentStock} (최소: ${minStock})`);
    }
  }
  
  if (lowStockItems.length > 0) {
    SpreadsheetApp.getUi().alert('재고 부족 항목:\n\n' + lowStockItems.join('\n'));
  } else {
    SpreadsheetApp.getUi().alert('모든 재고가 충분합니다.');
  }
}

function sendTestEmail() {
  try {
    MailApp.sendEmail(CONFIG.ADMIN_EMAIL, '[JSBlind] 테스트 이메일', '이메일 설정이 정상적으로 작동합니다.');
    SpreadsheetApp.getUi().alert('테스트 이메일이 발송되었습니다.');
  } catch (e) {
    SpreadsheetApp.getUi().alert('이메일 발송 실패: ' + e);
  }
}

function sendTestTelegram() {
  sendTelegramMessage('🧪 테스트 메시지\n\nTelegram 연동이 정상적으로 작동합니다.');
  SpreadsheetApp.getUi().alert('Telegram 메시지가 발송되었습니다.');
}

function showConfig() {
  const message = `현재 설정:\n\n` +
    `Factory Sheet ID: ${CONFIG.FACTORY_SHEET_ID}\n` +
    `Admin Email: ${CONFIG.ADMIN_EMAIL}\n` +
    `Telegram Bot: ${CONFIG.TELEGRAM_BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN' ? '설정됨' : '미설정'}\n\n` +
    `설정을 변경하려면 Apps Script 코드를 수정하세요.`;
  
  SpreadsheetApp.getUi().alert(message);
}
