import QRCode from "qrcode";

export interface QrOptions {
  readonly errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  readonly margin?: number;
}

export async function renderQr(
  value: string,
  options: QrOptions = {},
): Promise<string> {
  return QRCode.toString(value, {
    type: "terminal",
    errorCorrectionLevel: options.errorCorrectionLevel ?? "M",
    margin: options.margin ?? 2,
  });
}
