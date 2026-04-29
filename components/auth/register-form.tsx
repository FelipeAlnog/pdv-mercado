"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Mail, Lock, User, ShoppingCart, ArrowRight } from "lucide-react";
import { AUTH_CARD, AUTH_FIELDS, AUTH_FIELD } from "@/lib/motion";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError]     = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const password = watch("password");
  const isLoading = isSubmitting || isRedirecting;

  async function onSubmit(data: RegisterFormData) {
    setServerError("");
    const result = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });
    if (result.error) {
      setServerError(result.error.message || "Erro ao criar conta");
    } else {
      setIsRedirecting(true);
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <motion.div
      variants={AUTH_CARD}
      initial="hidden"
      animate="visible"
      className="flex w-full justify-center"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <motion.div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.08 }}
          >
            <ShoppingCart className="h-6 w-6 text-primary-foreground" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
          >
            <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta no PDV
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
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
                  >
                    {serverError}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.div variants={AUTH_FIELD} className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    className="pl-10"
                    disabled={isLoading}
                    {...register("name", { required: "Nome obrigatório" })}
                  />
                </div>
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
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    disabled={isLoading}
                    {...register("email", {
                      required: "Email obrigatório",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" },
                    })}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                      className="text-xs text-destructive"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={AUTH_FIELD} className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    disabled={isLoading}
                    {...register("password", {
                      required: "Senha obrigatória",
                      minLength: { value: 8, message: "Mínimo de 8 caracteres" },
                    })}
                  />
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                      className="text-xs text-destructive"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div variants={AUTH_FIELD} className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    disabled={isLoading}
                    {...register("confirmPassword", {
                      required: "Confirmação obrigatória",
                      validate: (v) => v === password || "As senhas não coincidem",
                    })}
                  />
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.16 }}
                      className="text-xs text-destructive"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <motion.div variants={AUTH_FIELD} className="w-full">
                <motion.div
                  whileTap={!isLoading ? { scale: 0.97 } : undefined}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
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
                          Redirecionando...
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
                          Criando conta...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Criar Conta
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.p variants={AUTH_FIELD} className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="cursor-pointer font-medium text-primary hover:underline"
                >
                  Entrar
                </Link>
              </motion.p>
            </CardFooter>
          </motion.div>
        </form>
      </Card>
    </motion.div>
  );
}
