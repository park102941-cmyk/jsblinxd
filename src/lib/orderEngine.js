/**
 * JSBlind Order Engine (JSBlind Blinds Standard)
 * Converts user measurements and selections into manufacturing data and pricing.
 */

export class JSBlindOrderEngine {
  constructor(pricePerSqInch = 0.07) {
    this.pricePerSqInch = pricePerSqInch;
    this.inchToCm = 2.54;
  }

  /**
   * Calculates order details based on JSBlind V2.0 standards.
   *
   * @param {Object} params
   * @param {string} params.name - Customer Name
   * @param {string} params.location - Room/Label
   * @param {number} params.widthInch - Width in inches
   * @param {number} params.heightInch - Height in inches
   * @param {string} params.fabricCode - Fabric code
   * @param {string} params.mountType - 'inside' or 'outside'
   * @param {number} params.motorPrice - Default 148 if motorized
   * @returns {Object} Calculated order data
   */
  calculateOrder({
    name = "",
    location = "",
    widthInch,
    heightInch,
    fabricCode = "",
    mountType = "inside",
    motorPrice = 0,
  }) {
    // 1. Basic CM conversion
    const widthCm = Number((widthInch * this.inchToCm).toFixed(4));
    const heightCm = Number((heightInch * this.inchToCm).toFixed(4));

    // 2. JSBlind Standard Deductions (Deduction)
    // Inside Mount: Width - 0.3cm for clearance
    const finalWidthCm =
      mountType === "inside" ? Number((widthCm - 0.3).toFixed(4)) : widthCm;

    // Final Height: + 5.0cm for roll overlap and bottom allowance
    const finalHeightCm = Number((heightCm + 5.0).toFixed(4));

    // 3. Price & Area Calculation
    // Minimum Billing Area (400 sq.in as per Allesin logic or profit protection)
    const MIN_AREA = 400;
    const actualArea = widthInch * heightInch;
    const billedArea = Math.max(actualArea, MIN_AREA);

    // Price is based on Billed Area in Sq Inches
    const price = Number((billedArea * this.pricePerSqInch).toFixed(2));

    // Total SQM (Square Meters)
    const totalSqm = Number(
      ((finalWidthCm * finalHeightCm) / 10000).toFixed(12)
    );

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
      "Price/ Sq I": this.pricePerSqInch,
      Price: price,
      Motor: motorPrice,
      "Total Price": Number((price + motorPrice).toFixed(2)),
      "Total SQM": totalSqm,
      "Billed Area": billedArea,
      "Is Min Area Applied": actualArea < MIN_AREA,
    };
  }
}

export const orderEngine = new JSBlindOrderEngine();
