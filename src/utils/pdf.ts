import type { RefObject } from 'react';

export interface PdfExportOptions {
  filename?: string;
  scale?: number;
  backgroundColor?: string;
}

export async function exportBracketToPdf(
  containerRef: RefObject<HTMLDivElement | null>,
  options: PdfExportOptions = {},
): Promise<void> {
  const el = containerRef.current;
  if (!el) return;

  const { default: html2canvas } = await import('html2canvas');
  const { default: jsPDF } = await import('jspdf');

  const canvas = await html2canvas(el, {
    scale: options.scale ?? 2,
    useCORS: true,
    backgroundColor: options.backgroundColor ?? '#ffffff',
    width: el.scrollWidth,
    height: el.scrollHeight,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
  });

  const imgWidthMm = 297; // A4 landscape width
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
  const pageFormat = imgHeightMm > 210 ? 'a3' : 'a4';

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: pageFormat,
  });

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  pdf.addImage(dataUrl, 'JPEG', 0, 0, imgWidthMm, imgHeightMm);
  pdf.save(options.filename ?? 'bracket.pdf');
}
