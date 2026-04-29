'use client';

import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { generateImportTemplate } from '@/lib/parse-excel';

const MAX_FILE_MB = 5;

interface ImportProductsButtonProps {
  onSuccess?: () => void;
}

export function ImportProductsButton({ onSuccess }: ImportProductsButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef  = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (inputRef.current) inputRef.current.value = '';

    // Client-side size guard (server enforces 5 MB too)
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo ${MAX_FILE_MB} MB.`);
      return;
    }

    setLoading(true);
    setOpen(false);
    const toastId = toast.loading('Enviando planilha...');

    try {
      const form = new FormData();
      form.append('file', file);

      const res  = await fetch('/api/products/import', { method: 'POST', body: form });
      const body = await res.json() as { created?: number; parseErrors?: string[]; error?: string };

      if (!res.ok) {
        toast.error(body.error ?? 'Erro ao importar produtos.', { id: toastId });
        return;
      }

      if (body.parseErrors && body.parseErrors.length > 0) {
        toast(`${body.parseErrors.length} linha(s) com erro foram ignoradas`, { icon: '⚠️' });
      }

      toast.success(
        `${body.created} produto(s) importado(s) com sucesso!`,
        { id: toastId, duration: 4000 },
      );
      onSuccess?.();
    } catch {
      toast.error('Erro de conexão. Tente novamente.', { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFile}
      />

      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5"
      >
        <Upload className="h-4 w-4" />
        {loading ? 'Importando...' : 'Importar'}
        <ChevronDown
          className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')}
        />
      </Button>

      <AnimatePresence>
        {open && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-1.5 min-w-[200px] rounded-xl border border-border bg-card p-1 shadow-xl shadow-black/10"
          >
            <button
              onClick={() => { setOpen(false); inputRef.current?.click(); }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Upload className="h-4 w-4 shrink-0 text-indigo-500" />
              Selecionar planilha
            </button>
            <button
              onClick={() => { generateImportTemplate(); setOpen(false); }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-500" />
              Baixar modelo Excel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
