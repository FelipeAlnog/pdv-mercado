'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <p className="text-5xl font-bold text-destructive">Erro</p>
      <h1 className="mt-4 text-2xl font-semibold">Algo deu errado</h1>
      <p className="mt-2 text-muted-foreground">
        Ocorreu um erro inesperado. Tente novamente ou volte ao dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Tentar novamente
        </button>
        <a
          href="/dashboard"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Voltar ao Dashboard
        </a>
      </div>
    </div>
  );
}
