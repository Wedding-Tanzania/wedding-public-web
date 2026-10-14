import QRCode from 'qrcode';

/**
 * A QR as SVG markup, in the card's ink on a transparent ground. Error
 * correction M survives a crease, a scratched screen or a cracked phone,
 * which is what a gate in the sun actually has to read.
 */
export function qrSvg(text: string, color: string): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 0,
    color: { dark: color, light: '#0000' },
  });
}

/** The same QR as a data URL, for the card image (it cannot embed raw SVG markup). */
export async function qrDataUrl(text: string, color: string): Promise<string> {
  const svg = await qrSvg(text, color);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
