/**
 * JSBlind Order Engine (JSBlind Blinds Standard)
 * Converts user measurements and selections into manufacturing data and pricing.
 * 
 * Pricing Formula: Final Price = Base Price + (Area in sqft × sizeRatio) + motor/remote add-ons
 */

export class JSBlindOrderEngine {
  constructor() {
    this.inchToCm = 2.54;
    this.DEFAULT_SIZE_RATIO = 7.00; // $/sqft default fallback
  }

  /**
   * Calculates order details using sqft-based pricing.
   */
  calculateOrder({
    name = "",
    location = "",
    widthInch,
    heightInch,
    fabricCode = "",
    mountType = "inside",
    motorType = "standard",
    solarPanel = false,
    remoteType = "none",
    basePrice = null,
    sizeRatio = null
  }) {
    // 1. Basic CM conversion for manufacturing
    const widthCm = Number((widthInch * this.inchToCm).toFixed(4));
    const heightCm = Number((heightInch * this.inchToCm).toFixed(4));

    // 2. JSBlind Standard Deductions
    const finalWidthCm = mountType === "inside" ? Number((widthCm - 0.3).toFixed(4)) : widthCm;
    const finalHeightCm = Number((heightCm + 5.0).toFixed(4));

    // 3. Area-based Pricing Logic
    const currentBasePrice = basePrice !== null ? Number(basePrice) : 89;
    const effectiveSizeRatio = sizeRatio !== null && sizeRatio > 0
      ? Number(sizeRatio)
      : this.DEFAULT_SIZE_RATIO;

    // Area in square feet
    const areaSqft = (widthInch * heightInch) / 144;
    const sizeSurcharge = Number((areaSqft * effectiveSizeRatio).toFixed(2));

    let totalPrice = currentBasePrice + sizeSurcharge;

    // Motor & Lift Style Surcharges
    const motorPrices = {
      standard: 0,
      cordless: 47,
      motorized: 149,
      zigbee: 25,
      alexa: 29,
      matter: 94
    };
    const motorSurcharge = motorPrices[motorType] || 0;
    totalPrice += motorSurcharge;

    // Add-ons
    if (solarPanel) totalPrice += 49;
    if (arguments[0].hub) totalPrice += 149;

    // Remote Surcharges
    const remotePrices = {
      none: 0,
      "1-channel": 45,
      "15-channel": 65
    };
    const remoteSurcharge = remotePrices[remoteType] || 0;
    totalPrice += remoteSurcharge;

    return {
      "Cus: Name": name,
      "Location/Label": location,
      "Width inch": widthInch,
      "Height inch": heightInch,
      "Width CM": widthCm,
      "Height CM": heightCm,
      "Final Width CM": finalWidthCm,
      "Final Height CM": finalHeightCm,
      "Fabric Code": fabricCode,
      Mount: mountType === "inside" ? "Inside Mount" : "Outside Mount",
      "Base Price": currentBasePrice,
      "Area sqft": Number(areaSqft.toFixed(2)),
      "Size Ratio ($/sqft)": effectiveSizeRatio,
      "Size Surcharge": sizeSurcharge,
      "Motor Surcharge": motorSurcharge,
      "Remote Surcharge": remoteSurcharge,
      "Total Price": Number(totalPrice.toFixed(2)),
      "Total SQM": Number(((finalWidthCm * finalHeightCm) / 10000).toFixed(6))
    };
  }
}

export const orderEngine = new JSBlindOrderEngine();
