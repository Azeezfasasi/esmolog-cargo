/**
 * Generate a QR code as a data URL using a simple QR code API
 * This uses an external service to generate QR codes
 * 
 * @param {string} trackingNumber - The tracking number to encode
 * @returns {Promise<string>} - Base64 data URL of the QR code image
 */
export async function generateQRCode(trackingNumber) {
  try {
    // Using qr-server API - no installation needed
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingNumber)}`;
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

/**
 * Alternative: Generate QR code using local library (requires qrcode installation)
 * Uncomment and use after: npm install qrcode
 * 
export async function generateQRCodeLocal(trackingNumber) {
  try {
    const QRCode = require('qrcode');
    const dataUrl = await QRCode.toDataURL(trackingNumber);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}
 */
