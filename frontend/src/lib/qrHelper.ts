import QRCode from 'qrcode';

/**
 * Generate a high-resolution QR Code Data URL in the browser
 */
export async function generateClientQRDataUrl(qrToken: string, baseUrl?: string): Promise<string> {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const targetUrl = `${origin}/qr/${encodeURIComponent(qrToken)}`;

  try {
    const dataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 400,
      color: {
        dark: '#1B5E20', // Forest Green QR
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    // Fallback black QR
    return await QRCode.toDataURL(targetUrl, { width: 400, margin: 2 });
  }
}

/**
 * Triggers a direct browser file download for a base64 image data URL
 */
export function downloadDataUrlAsFile(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
