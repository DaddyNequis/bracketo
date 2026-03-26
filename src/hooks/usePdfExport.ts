import { useState, useCallback } from 'react';
import { useContainerRef } from '../components/Bracket/BracketContext';
import { exportBracketToPdf } from '../utils/pdf';

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useContainerRef();

  const exportToPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      await exportBracketToPdf(containerRef, { filename: 'bracket.pdf' });
    } finally {
      setIsExporting(false);
    }
  }, [containerRef]);

  return { exportToPdf, isExporting };
}
