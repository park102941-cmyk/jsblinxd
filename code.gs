// Google Apps Script Code - Version 5 (Inventory System)
// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste this code (Overwriting previous code)
// 4. Update the CONFIG section below with your Telegram Keys and Sheet IDs
// 5. Redeploy: Deploy > New Deployment > Web App > Anyone > Deploy

// --- CONFIGURATION ---
const CONFIG = {
    TELEGRAM_BOT_TOKEN: 'YOUR_TELEGRAM_BOT_TOKEN', // Paste your Token here
    TELEGRAM_CHAT_ID: 'YOUR_TELEGRAM_CHAT_ID',     // Paste your Chat ID here
    PURCHASE_SHEET_ID: '1x1O4lPwindIY-VfBtJSA6W4-zfayPctZd270neF-LQ0', // Purchase Sheet ID
    INVENTORY_SHEET_NAME: 'Inventory', // Name of the sheet for stock
    PRODUCTS_SHEET_NAME: 'Products'   // Name of the sheet for products
};

// --- WEB APP FUNCTIONS ---

function doGet(e) {
    var param = e.parameter.type || e.parameter.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Handle Products Fetch
    if (param === 'products') {
        var pSheet = ss.getSheetByName(CONFIG.PRODUCTS_SHEET_NAME);
        // If no sheet, return empty
        if (!pSheet) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
        
        var data = pSheet.getDataRange().getValues();
        // If only header or empty
        if (data.length < 2) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
        
        var rows = data.slice(1);
        
        // Map simplified data (Frontend expects ID to map stock. 
        // For now, return ID and mock qty if Inventory logic isn't fully linked)
        var result = rows.map(function(row) {
             return {
                 id: row[0],
                 title: row[1],
                 // Future: Link with Inventory Sheet for real Qty
                 stockQty: 999, 
                 safetyStock: 10
             };
        });
        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Default: Fetch Orders (Sheet1)
    var sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    var rows = data.slice(1);

    var result = rows.map(function (row) {
        return {
            date: row[0],
            orderId: row[1],
            product: row[4],
            status: row[11],
            trackingNumber: row[12],
            email: row[14]
        };
    });

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    var lock = LockService.getScriptLock();
    try {
        lock.waitLock(10000); // Wait for other processes

        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
        var data = JSON.parse(e.postData.contents);

        // --- ACTION HANDLER ---
        // If action is 'sync_products', update the Products sheet and return early
        if (data.action === 'sync_products') {
            var result = syncProducts(ss, data.products);
            return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
        }

        // --- NEW: SEND TO FACTORY ACTION ---
        if (data.action === 'send_to_factory') {
            var orderData = data.order;
            var targetSs = SpreadsheetApp.openById(CONFIG.PURCHASE_SHEET_ID);
            var targetSheet = targetSs.getSheets()[0];
            
            // Append rows for each item in the ZSHINE V2.0 format
            orderData.items.forEach(function(item) {
                targetSheet.appendRow([
                    item.customerName,
                    item.sideMark,
                    item.widthInch,
                    item.heightInch,
                    item.widthCm,
                    item.heightCm,
                    item.finalWidthCm,
                    item.finalHeightCm,
                    item.fabricCode,
                    item.priceInch || 0.07,
                    item.price,
                    item.motor,
                    (item.price + item.motor),
                    item.totalSqm,
                    orderData.orderId,
                    orderData.fullAddress
                ]);
            });
            
            return ContentService.createTextOutput(JSON.stringify({ "result": "success", "message": "Order sent to Purchase Sheet" })).setMimeType(ContentService.MimeType.JSON);
        }

        // --- DEFAULT ORDER PROCESSING ---
        // Create Headers if empty
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(["주문일", "주문번호", "Side Mark", "고객명", "상품명", "Color", "W (in)", "H (in)", "Mount", "Motor/Cord", "수량", "상태", "송장번호", "판매가", "Email", "Address"]);
        }

        var items = data.items || [];
        var consumedAssets = data.consumedAssets || []; // New: Assets to deduce
        var timestamp = new Date().toLocaleDateString();

        // 1. Append Order Rows
        items.forEach(function (item) {
            sheet.appendRow([
                timestamp, data.orderId, item.location || '', data.name, item.title, item.color || 'Default',
                item.width || 0, item.height || 0, item.mount || '', item.control || 'Manual', item.quantity || 1,
                '주문접수', '', item.price, data.email, data.address
            ]);
        });

        // 2. Process Inventory Deduction
        var lowStockAlerts = [];
        if (consumedAssets.length > 0) {
            lowStockAlerts = processInventory(ss, consumedAssets);
        }

        // 3. Send Telegram Notification
        sendTelegramAlert(data, items, lowStockAlerts);

        return ContentService.createTextOutput(JSON.stringify({ "result": "success", "stockAlerts": lowStockAlerts })).setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() })).setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

// --- PRODUCT SYNC LOGIC ---
function syncProducts(ss, products) {
    var pSheet = ss.getSheetByName(CONFIG.PRODUCTS_SHEET_NAME);
    if (!pSheet) {
        pSheet = ss.insertSheet(CONFIG.PRODUCTS_SHEET_NAME);
    }

    pSheet.clear(); // Clear existing data

    // Headers
    var headers = ["ID", "Title", "Category", "Base Price", "Size Ratio", "Min W", "Max W", "Min H", "Max H", "Show Motor", "Show Color", "Image URL", "Description", "Colors JSON", "Updated At"];
    pSheet.appendRow(headers);

    // Data
    if (products && products.length > 0) {
        // Prepare 2D array for batch update (faster)
        var rows = products.map(function (p) {
            return [
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
                JSON.stringify(p.colors), // Store complex object as JSON string
                new Date().toISOString()
            ];
        });

        // Write all rows at once
        pSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }

    return { "result": "success", "count": products.length };
}

// --- INVENTORY LOGIC ---

function processInventory(ss, consumedAssets) {
    var invSheet = ss.getSheetByName(CONFIG.INVENTORY_SHEET_NAME);

    // Create Inventory Sheet if missing
    if (!invSheet) {
        invSheet = ss.insertSheet(CONFIG.INVENTORY_SHEET_NAME);
        invSheet.appendRow(["component_id", "component_name", "unit_of_measure", "is_raw_material", "current_stock_qty", "min_stock_alert", "consumption_rate"]);
        // Add some dummy data for initial setup
        invSheet.appendRow(["FABRIC_BLACKOUT_WHITE", "Blackout Fabric (White)", "M2", true, 100, 20, ""]);
        invSheet.appendRow(["MOTOR_REMOTE_A", "Standard Remote Motor", "EA", false, 50, 5, ""]);
    }

    var dataRange = invSheet.getDataRange();
    var values = dataRange.getValues();
    var headers = values[0];
    var alerts = [];

    // Map column names to indices
    var colMap = {};
    headers.forEach(function (h, i) { colMap[h] = i; });

    var idCol = colMap['component_id'];
    var stockCol = colMap['current_stock_qty'];
    var minCol = colMap['min_stock_alert'];
    var nameCol = colMap['component_name'];

    if (idCol === undefined || stockCol === undefined) return ["Error: Invalid Inventory Sheet format"];

    // Update Stock
    consumedAssets.forEach(function (asset) {
        // Find row with matching component_id
        for (var i = 1; i < values.length; i++) {
            if (values[i][idCol] === asset.component_id) {
                var currentStock = Number(values[i][stockCol]);
                var deduce = Number(asset.quantity);
                var newStock = currentStock - deduce;

                // Update cell (i+1 because rows are 1-based)
                invSheet.getRange(i + 1, stockCol + 1).setValue(newStock);

                // Check Alert
                var minStock = Number(values[i][minCol]);
                if (newStock <= minStock) {
                    alerts.push("⚠️ Low Stock: " + values[i][nameCol] + " (" + newStock + " remaining)");
                }
                break;
            }
        }
    });

    return alerts;
}

// --- TELEGRAM NOTIFICATION ---

function sendTelegramAlert(data, items, lowStockAlerts) {
    if (!CONFIG.TELEGRAM_BOT_TOKEN || CONFIG.TELEGRAM_BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN') return;

    var message = "📦 *New Order Received!*\n\n";
    message += "🆔 *Order:* " + data.orderId + "\n";
    message += "👤 *Customer:* " + data.name + "\n";
    message += "💰 *Total:* " + (data.total ? "$" + data.total : "N/A") + "\n\n";

    message += "*Items:*\n";
    items.forEach(function (item, index) {
        message += (index + 1) + ". " + item.title + " (" + (item.width || 0) + "x" + (item.height || 0) + ")\n";
        message += "   Color: " + (item.color || 'N/A') + " | Qty: " + (item.quantity || 1) + "\n";
    });

    if (lowStockAlerts && lowStockAlerts.length > 0) {
        message += "\n-------------------\n";
        message += "*🚨 INVENTORY ALERTS:*\n";
        lowStockAlerts.forEach(function (alert) {
            message += alert + "\n";
        });
    }

    var url = "https://api.telegram.org/bot" + CONFIG.TELEGRAM_BOT_TOKEN + "/sendMessage";
    var payload = {
        "chat_id": CONFIG.TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    };

    var options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(payload)
    };

    UrlFetchApp.fetch(url, options);
}

// --- OPTIONAL: AUTOMATION MENU ---

function onOpen() {
    SpreadsheetApp.getUi().createMenu('구글 안티그래비티 관리자')
        .addItem('🚀 발주 전송', 'transferOrders')
        .addToUi();
}

function transferOrders() {
    var sourceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1") || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var targetSpreadsheet = SpreadsheetApp.openById(CONFIG.PURCHASE_SHEET_ID);
    var targetSheet = targetSpreadsheet.getSheets()[0];
    var sourceData = sourceSheet.getDataRange().getValues();
    var ordersSent = 0;

    for (var i = 1; i < sourceData.length; i++) {
        var row = sourceData[i];
        if (row[11] === '주문접수') {
            targetSheet.appendRow([
                row[1], '', row[2], row[4] + ' - ' + row[5], row[6], '', row[7], '', row[8], row[9], row[10], row[15]
            ]);
            sourceSheet.getRange(i + 1, 12).setValue('발주완료');
            sourceSheet.getRange(i + 1, 1, 1, 16).setBackground('#FFF2CC');
            ordersSent++;
        }
    }
    SpreadsheetApp.getUi().alert('총 ' + ordersSent + '건의 주문이 발주서로 전송되었습니다.');
}
