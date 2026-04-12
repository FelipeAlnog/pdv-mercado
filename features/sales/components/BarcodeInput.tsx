'use client';

import { useEffect } from 'react';
import { Product } from '@/types/product';
import { useBarcode } from '@/hooks/useBarcode';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScanLine, AlertCircle } from 'lucide-react';

interface BarcodeInputProps {
  onProductFound: (product: Product) => void;
  onNotFound: (barcode: string) => void;
  autoFocus?: boolean;
}

export function BarcodeInput({ onProductFound, onNotFound, autoFocus = true }: BarcodeInputProps) {
  const { barcode, setBarcode, isLoading, notFound, scan, reset, inputRef } = useBarcode(
    (product) => {
      onProductFound(product);
      reset();
    }
  );

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus, inputRef]);

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && barcode.trim()) {
      const product = await scan(barcode);
      if (!product) {
        onNotFound(barcode.trim());
      }
    }
  }

  async function handleScan() {
    if (!barcode.trim()) return;
    const product = await scan(barcode);
    if (!product) {
      onNotFound(barcode.trim());
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite ou escaneie o código de barras e pressione Enter"
            className={cn(
              'h-14 w-full rounded-xl border-2 bg-background px-5 font-mono text-lg font-medium placeholder-muted-foreground shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring/50',
              notFound
                ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                : 'border-border focus:border-ring'
            )}
            autoComplete="off"
            spellCheck={false}
          />
          {isLoading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <Spinner size="md" className="text-primary" />
            </span>
          )}
        </div>
        <Button
          onClick={handleScan}
          disabled={!barcode.trim() || isLoading}
          size="lg"
          className="h-14 px-5"
        >
          <ScanLine className="h-5 w-5" />
          Buscar
        </Button>
      </div>
      {notFound && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Produto não encontrado para o código{' '}
          <span className="font-mono font-semibold">{barcode}</span>
        </p>
      )}
    </div>
  );
}
