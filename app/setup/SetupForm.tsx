'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Store, Loader2, ArrowRight } from 'lucide-react';
import { AUTH_CARD, AUTH_FIELDS, AUTH_FIELD } from '@/lib/motion';

type SetupFormData = {
  name: string;
  cpf: string;
  phone?: string;
  address?: string;
};

export function SetupForm() {
  const router = useRouter();
  const [serverError, setServerError]     = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormData>();

  const isLoading = isSubmitting || isRedirecting;

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
      setIsRedirecting(true);
      router.push('/dashboard');
      router.refresh();
    } catch {
      setServerError('Erro de conexão. Tente novamente.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        variants={AUTH_CARD}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-2 text-center">
            <motion.div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.08 }}
            >
              <Store className="h-6 w-6 text-primary-foreground" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
            >
              <CardTitle className="text-2xl font-bold">Configurar Loja</CardTitle>
              <CardDescription>
                Complete o cadastro da sua loja para começar a usar o PDV
              </CardDescription>
            </motion.div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <motion.div variants={AUTH_FIELDS} initial="hidden" animate="visible">
              <CardContent className="space-y-4 pb-4">
                <AnimatePresence>
                  {serverError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
                    >
                      {serverError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.div variants={AUTH_FIELD} className="space-y-1.5">
                  <Label htmlFor="name">Nome da Loja *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Mercado do João"
                    disabled={isLoading}
                    {...register('name', { required: 'Nome da loja é obrigatório' })}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.16 }}
                        className="text-xs text-destructive"
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={AUTH_FIELD} className="space-y-1.5">
                  <Label htmlFor="cpf">CPF / CNPJ *</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                    disabled={isLoading}
                    {...register('cpf', { required: 'CPF/CNPJ é obrigatório' })}
                  />
                  <AnimatePresence>
                    {errors.cpf && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.16 }}
                        className="text-xs text-destructive"
                      >
                        {errors.cpf.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={AUTH_FIELD} className="space-y-1.5">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    disabled={isLoading}
                    {...register('phone')}
                  />
                </motion.div>

                <motion.div variants={AUTH_FIELD} className="space-y-1.5">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro"
                    disabled={isLoading}
                    {...register('address')}
                  />
                </motion.div>
              </CardContent>

              <CardFooter>
                <motion.div
                  variants={AUTH_FIELD}
                  className="w-full"
                  whileTap={!isLoading ? { scale: 0.97 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    <AnimatePresence mode="wait" initial={false}>
                      {isRedirecting ? (
                        <motion.span
                          key="redirecting"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <ArrowRight className="h-4 w-4 animate-pulse" />
                          Acessando dashboard...
                        </motion.span>
                      ) : isSubmitting ? (
                        <motion.span
                          key="submitting"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Criando loja...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Criar Loja e Continuar
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </CardFooter>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
