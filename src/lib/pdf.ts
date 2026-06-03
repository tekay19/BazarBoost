import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { qrPngBuffer } from "./qr";

function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(v, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export interface QrPdfInput {
  businessName: string;
  menuName: string;
  description?: string;
  url: string;
  tableLabel?: string;
  logoPng?: Buffer; // optional PNG logo
  primaryColor?: string;
}

/** Build a print-ready A4 PDF poster with logo, title, QR code and footer. */
export async function buildQrPdf(input: QrPdfInput): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 portrait, pt
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
  const primary = hexToRgb(input.primaryColor || "#111111");

  // top accent bar
  page.drawRectangle({ x: 0, y: height - 14, width, height: 14, color: primary });

  let cursorY = height - 90;

  if (input.logoPng) {
    try {
      const img = await doc.embedPng(input.logoPng);
      const scaled = img.scaleToFit(120, 120);
      page.drawImage(img, {
        x: (width - scaled.width) / 2,
        y: cursorY - scaled.height,
        width: scaled.width,
        height: scaled.height,
      });
      cursorY -= scaled.height + 24;
    } catch {
      // ignore bad logo
    }
  }

  const drawCentered = (text: string, size: number, f = font, color = rgb(0.1, 0.1, 0.1)) => {
    const w = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y: cursorY, size, font: f, color });
    cursorY -= size + 12;
  };

  drawCentered(input.businessName, 26, font, primary);
  drawCentered(input.menuName, 18, bodyFont);
  if (input.description) drawCentered(input.description.slice(0, 80), 12, bodyFont, rgb(0.4, 0.4, 0.4));

  // QR code
  const qrBuf = await qrPngBuffer(input.url, { color: "#111111", size: 900 });
  const qrImg = await doc.embedPng(qrBuf);
  const qrSize = 280;
  cursorY -= 30;
  page.drawImage(qrImg, {
    x: (width - qrSize) / 2,
    y: cursorY - qrSize,
    width: qrSize,
    height: qrSize,
  });
  cursorY -= qrSize + 30;

  if (input.tableLabel) {
    drawCentered(input.tableLabel, 20, font, primary);
  }

  const cta = "Menüyü görmek için QR kodu okutun";
  const w = bodyFont.widthOfTextAtSize(cta, 13);
  page.drawText(cta, { x: (width - w) / 2, y: cursorY, size: 13, font: bodyFont, color: rgb(0.3, 0.3, 0.3) });

  // footer
  page.drawRectangle({ x: 0, y: 0, width, height: 10, color: primary });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
