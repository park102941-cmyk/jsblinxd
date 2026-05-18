/**
 * JSBlind Order Engine (JSBlind Blinds Standard)
 * Converts user measurements and selections into manufacturing data and pricing.
 */

export class JSBlindOrderEngine {
  constructor() {
    this.inchToCm = 2.54;
    // Smartwings-style pricing constants
    this.BASE_PRICE = 189.99;
    this.BASE_WIDTH = 23;
    this.BASE_HEIGHT = 29;
    this.WIDTH_SURCHARGE_PER_INCH = 0.50; // 가로 초과 1인치당 $0.50
    this.HEIGHT_SURCHARGE_PER_INCH = 0.50; // 세로 초과 1인치당 $0.50
  }

  /**
   * Calculates order details based on Smartwings-style logic.
   */
  calculateOrder({
    name = "",
    location = "",
    widthInch,
    heightInch,
    fabricCode = "",
    mountType = "inside",
    motorType = "standard", // standard, zigbee, alexa, matter
    solarPanel = false,
    remoteType = "none", // none, 1-channel, 5-channel, 15-channel
    basePrice = null
  }) {
    // 1. Basic CM conversion for manufacturing
    const widthCm = Number((widthInch * this.inchToCm).toFixed(4));
    const heightCm = Number((heightInch * this.inchToCm).toFixed(4));

    // 2. JSBlind Standard Deductions
    const finalWidthCm = mountType === "inside" ? Number((widthCm - 0.3).toFixed(4)) : widthCm;
    const finalHeightCm = Number((heightCm + 5.0).toFixed(4));

    // 3. Smartwings-style Pricing Logic
    const currentBasePrice = basePrice !== null ? Number(basePrice) : this.BASE_PRICE;
    let totalPrice = currentBasePrice;

    // Size Surcharges
    if (widthInch > this.BASE_WIDTH) {
      totalPrice += (widthInch - this.BASE_WIDTH) * this.WIDTH_SURCHARGE_PER_INCH;
    }
    if (heightInch > this.BASE_HEIGHT) {
      totalPrice += (heightInch - this.BASE_HEIGHT) * this.HEIGHT_SURCHARGE_PER_INCH;
    }

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
    if (arguments[0].hub) totalPrice += 149; // Added Bond Bridge Hub support

    // Remote Surcharges (Updated +$20)
    const remotePrices = {
      none: 0,
      "1-channel": 45,
      "5-channel": 55,
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
      "Size Surcharge": totalPrice - currentBasePrice - motorSurcharge - remoteSurcharge - (solarPanel ? 49 : 0),
      "Motor Surcharge": motorSurcharge,
      "Remote Surcharge": remoteSurcharge,
      "Total Price": Number(totalPrice.toFixed(2)),
      "Total SQM": Number(((finalWidthCm * finalHeightCm) / 10000).toFixed(6))
    };
  }
}

export const orderEngine = new JSBlindOrderEngine();
