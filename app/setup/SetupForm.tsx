'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Store, Loader2 } from 'lucide-react';

type SetupFormData = {
  name: string;
  cpf: string;
  phone?: string;
  address?: string;
};

export function SetupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormData>();

  async function onSubmit(data: SetupFormData) {
    setServerError('');
    try {
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error || 'Erro ao criar loja.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Store className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Configurar Loja</CardTitle>
          <CardDescription>
            Complete o cadastro da sua loja para começar a usar o PDV
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pb-4">
            {serverError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                {serverError}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Nome da Loja *</Label>
              <Input
                id="name"
                placeholder="Ex: Mercado do João"
                disabled={isSubmitting}
                {...register('name', { required: 'Nome da loja é obrigatório' })}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cpf">CPF / CNPJ *</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                disabled={isSubmitting}
                {...register('cpf', { required: 'CPF/CNPJ é obrigatório' })}
              />
              {errors.cpf && (
                <p className="text-xs text-destructive">{errors.cpf.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                disabled={isSubmitting}
                {...register('phone')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Rua, número, bairro"
                disabled={isSubmitting}
                {...register('address')}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando loja...
                </>
              ) : (
                'Criar Loja e Continuar'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
