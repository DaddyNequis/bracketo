import { usePdfExport } from '../../hooks/usePdfExport';

interface ExportButtonProps {
  label?: string;
}

export function ExportButton({ label = 'Export PDF' }: ExportButtonProps) {
  const { exportToPdf, isExporting } = usePdfExport();

  return (
    <button
      className="bracketo-export-btn"
      onClick={exportToPdf}
      disabled={isExporting}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {isExporting ? 'Exporting...' : label}
    </button>
  );
}
