'use client';

import { useState, useRef, useEffect } from 'react';
import { Product } from '@/types/product';
import { useBarcode } from '@/hooks/useBarcode';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

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
              'w-full rounded-xl border-2 bg-white px-5 py-4 text-lg font-mono font-medium placeholder-gray-300 shadow-sm transition-all focus:outline-none',
              'dark:bg-gray-800 dark:text-white dark:placeholder-gray-600',
              notFound
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:focus:border-blue-500'
            )}
            autoComplete="off"
            spellCheck={false}
          />
          {isLoading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <Spinner size="md" className="text-blue-500" />
            </span>
          )}
        </div>
        <Button
          onClick={handleScan}
          disabled={!barcode.trim() || isLoading}
          size="lg"
          className="px-6"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5a.5.5 0 11-1 0 .5.5 0 011 0z" />
          </svg>
          Buscar
        </Button>
      </div>
      {notFound && (
        <p className="flex items-center gap-1 text-sm text-red-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Produto não encontrado para o código <span className="font-mono font-semibold">{barcode}</span>
        </p>
      )}
    </div>
  );
}
