'use client';

import { useState, useCallback, useRef } from 'react';
import { Product } from '@/types/product';
import { productService } from '@/services/productService';

interface UseBarcodeReturn {
  barcode: string;
  setBarcode: (value: string) => void;
  isLoading: boolean;
  lastScanned: Product | null;
  notFound: boolean;
  scan: (code: string) => Promise<Product | null>;
  reset: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function useBarcode(onFound?: (product: Product) => void): UseBarcodeReturn {
  const [barcode, setBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const scan = useCallback(
    async (code: string): Promise<Product | null> => {
      if (!code.trim()) return null;
      setIsLoading(true);
      setNotFound(false);
      try {
        const product = await productService.getByBarcode(code.trim());
        if (product) {
          setLastScanned(product);
          onFound?.(product);
          return product;
        } else {
          setNotFound(true);
          setLastScanned(null);
          return null;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onFound]
  );

  const reset = useCallback(() => {
    setBarcode('');
    setLastScanned(null);
    setNotFound(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  return { barcode, setBarcode, isLoading, lastScanned, notFound, scan, reset, inputRef };
}
