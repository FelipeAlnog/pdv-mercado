'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ExportMenuProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  disabled?: boolean;
}

export function ExportMenu({ onExportPDF, onExportExcel, disabled }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function handle(fn: () => void) {
    fn();
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5"
      >
        <Download className="h-4 w-4" />
        Exportar
        <ChevronDown
          className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')}
        />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-1.5 w-46 min-w-[170px] rounded-xl border border-border bg-card p-1 shadow-xl shadow-black/10"
          >
            <button
              onClick={() => handle(onExportPDF)}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <FileText className="h-4 w-4 shrink-0 text-red-500" />
              Exportar PDF
            </button>
            <button
              onClick={() => handle(onExportExcel)}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-500" />
              Exportar Excel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
