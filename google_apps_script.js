// Google Apps Script Code - Version 22 (Email Support)
// Includes send_email action.

var CONFIG = {
  // FACTORY_SHEET_ID: Target Sheet
  FACTORY_SPREADSHEET_ID: "1O0RSagEwk8MlxN-Yslcw8F_N5cHzaoz7GJGwWVRfiT0",

  PRODUCT_SHEET_NAME: "Product",
  PURCHASE_SHEET_NAME: "Purchase",
  RETURN_SHEET_NAME: "Return",
};

function getSS() {
  return SpreadsheetApp.openById(CONFIG.FACTORY_SPREADSHEET_ID);
}

function doGet(e) {
  try {
    var ss = getSS();
    var type = e && e.parameter ? e.parameter.type : "product";
    var action = e && e.parameter ? e.parameter.action : "";

    if (action === "get_factory_updates")
      return outputJSON(getFactoryUpdates(ss));

    if (type === "returns") {
      var rSheet = ensureSheet(
        ss,
        CONFIG.RETURN_SHEET_NAME,
        getHeadersFor(CONFIG.RETURN_SHEET_NAME)
      );
      var data = rSheet.getDataRange().getValues().slice(1);
      var result = data.map(function (r) {
        return {
          date: r[0],
          orderId: r[1],
          customer: r[2],
          reason: r[3],
          status: r[4],
          refundAmount: r[5],
        };
      });
      return outputJSON(result);
    }

    // Product (Default)
    var pSheet = ensureSheet(
      ss,
      CONFIG.PRODUCT_SHEET_NAME,
      getHeadersFor(CONFIG.PRODUCT_SHEET_NAME)
    );
    var data = pSheet.getDataRange().getValues().slice(1);
    var result = data.map(function (r) {
      return {
        id: r[0],
        title: r[1],
        category: r[2],
        price: r[3],
        stockQty: r[15] || 0,
        safetyStock: r[16] || 10,
      };
    });
    return outputJSON(result);
  } catch (err) {
    return outputJSON({ error: err.toString() });
  }
}

function doPost(e) {
  try {
    var ss = getSS();
    var data = JSON.parse(e.postData.contents);

    if (data.action === "send_to_factory")
      return outputJSON(sendToFactory(ss, data.order));
    if (data.action === "sync_products")
      return outputJSON(syncProducts(ss, data.products));
    if (data.action === "update_return")
      return outputJSON(updateReturn(ss, data));

    // NEW: Email Action
    if (data.action === "send_email") {
      MailApp.sendEmail({
        to: data.to,
        subject: data.subject,
        htmlBody: data.body,
      });
      return outputJSON({ result: "success" });
    }

    return outputJSON({ result: "error", message: "Unknown action" });
  } catch (error) {
    return outputJSON({ result: "error", message: error.toString() });
  }
}

function outputJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// --- LOGIC ---

function syncProducts(ss, products) {
  var pSheet = ensureSheet(
    ss,
    CONFIG.PRODUCT_SHEET_NAME,
    getHeadersFor(CONFIG.PRODUCT_SHEET_NAME)
  );
  var oldData = pSheet.getDataRange().getValues();
  var stockMap = {};
  if (oldData.length > 1) {
    for (var i = 1; i < oldData.length; i++)
      stockMap[oldData[i][0]] = { s: oldData[i][15], min: oldData[i][16] };
  }
  pSheet.clearContents();
  pSheet.appendRow(getHeadersFor(CONFIG.PRODUCT_SHEET_NAME));

  if (products && products.length) {
    var rows = products.map(function (p) {
      var sm = stockMap[p.id] || { s: 0, min: 10 };
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
        JSON.stringify(p.colors),
        new Date().toISOString(),
        sm.s,
        sm.min,
      ];
    });
    pSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  return { result: "success", count: products.length };
}

function sendToFactory(ss, order) {
  var sheet = ensureSheet(
    ss,
    CONFIG.PURCHASE_SHEET_NAME,
    getHeadersFor(CONFIG.PURCHASE_SHEET_NAME)
  );
  var rows = order.items.map(function (item) {
    return [
      order.orderId,
      item.customerName || "",
      item.sideMark || "",
      item.title || "",
      item.fabricCode || "",
      item.color || "",
      item.widthInch || "",
      item.heightInch || "",
      item.widthCm || "",
      item.heightCm || "",
      item.finalWidthCm || "",
      item.finalHeightCm || "",
      item.mount || "",
      item.motor || "0",
      item.quantity || 1,
      item.totalSqm || "",
      order.fullAddress || "",
      "Pending", // Factory Status
      "", // Tracking No
    ];
  });
  sheet
    .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
    .setValues(rows);
  return { result: "success" };
}

function updateReturn(ss, data) {
  var sheet = ensureSheet(
    ss,
    CONFIG.RETURN_SHEET_NAME,
    getHeadersFor(CONFIG.RETURN_SHEET_NAME)
  );
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(data.orderId)) {
      sheet.getRange(i + 1, 5).setValue(data.status);
      return { result: "success" };
    }
  }
  sheet.appendRow([
    new Date().toLocaleDateString(),
    data.orderId,
    "Unknown",
    "Manual Update",
    data.status,
    "",
  ]);
  return { result: "success" };
}

function getFactoryUpdates(ss) {
  var sheet = ensureSheet(
    ss,
    CONFIG.PURCHASE_SHEET_NAME,
    getHeadersFor(CONFIG.PURCHASE_SHEET_NAME)
  );
  var data = sheet.getDataRange().getValues();
  var updates = [];
  var trackingCol = 19; // Tracking No column index (1-based is 19, 0-based is 18)
  for (var i = 1; i < data.length; i++) {
    if (data[i][trackingCol - 1])
      updates.push({
        orderId: data[i][0],
        trackingNumber: data[i][trackingCol - 1],
        status: "Shipped",
      });
  }
  return updates;
}

function getHeadersFor(name) {
  if (name === CONFIG.PRODUCT_SHEET_NAME)
    return [
      "ID",
      "Title",
      "Category",
      "Base Price",
      "Size Ratio",
      "Min W",
      "Max W",
      "Min H",
      "Max H",
      "Show Motor",
      "Show Color",
      "Image URL",
      "Description",
      "Colors JSON",
      "Updated At",
      "Current Stock",
      "Safety Stock",
    ];
  if (name === CONFIG.PURCHASE_SHEET_NAME)
    return [
      "PO #",
      "Customer",
      "Side Mark",
      "Product",
      "Fabric Code",
      "Color",
      "W (In)",
      "H (In)",
      "W (cm)",
      "H (cm)",
      "Final W (cm)",
      "Final H (cm)",
      "Mount",
      "Motor",
      "Qty",
      "Total SQM",
      "Full Address",
      "Status",
      "Tracking No",
    ];
  if (name === CONFIG.RETURN_SHEET_NAME)
    return [
      "Date",
      "Order ID",
      "Customer",
      "Reason",
      "Status",
      "Refund Amount",
    ];
  return [];
}

function ensureSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}
