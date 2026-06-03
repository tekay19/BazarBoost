import "server-only";
import QRCode from "qrcode";

export async function qrPngBuffer(
  data: string,
  opts: { color?: string; background?: string; size?: number } = {}
): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    type: "png",
    width: opts.size ?? 1024,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: opts.color ?? "#000000",
      light: opts.background ?? "#FFFFFF",
    },
  });
}

export async function qrDataUrl(
  data: string,
  opts: { color?: string; background?: string; size?: number } = {}
): Promise<string> {
  return QRCode.toDataURL(data, {
    width: opts.size ?? 320,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: opts.color ?? "#000000",
      light: opts.background ?? "#FFFFFF",
    },
  });
}
