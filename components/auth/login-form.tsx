"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "@/lib/auth-client";
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
import { Loader2, Mail, Lock, ShoppingCart, ArrowRight } from "lucide-react";
import { AUTH_CARD, AUTH_FIELDS, AUTH_FIELD } from "@/lib/motion";

type LoginFormData = {
  email: string;
  password: string;
};

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError]     = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  // Mantém o botão travado após sucesso até a navegação completar
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  // Bloqueia qualquer interação se estiver em algum estado de carregamento
  const isLoading = isSubmitting || isGoogleLoading || isRedirecting;

  async function onSubmit(data: LoginFormData) {
    setServerError("");
    const result = await signIn.email({ email: data.email, password: data.password });
    if (result.error) {
      setServerError(result.error.message || "Email ou senha inválidos");
    } else {
      // Travar imediatamente — componente desmonta na navegação
      setIsRedirecting(true);
      const res = await fetch("/api/admin/me");
      const { isAdmin } = await res.json();
      router.push(isAdmin ? "/superadmin" : "/dashboard");
      router.refresh();
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      // Social auth redireciona — não resetamos o estado; componente desmonta
      await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch {
      // Só reseta se falhar de fato (ex: popup bloqueado)
      setIsGoogleLoading(false);
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
            <CardTitle className="text-2xl font-bold">Bem-vindo ao PDV</CardTitle>
            <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
          </motion.div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <motion.div variants={AUTH_FIELDS} initial="hidden" animate="visible">
            <CardContent className="space-y-4 pb-5">
              {/* Server error */}
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
                    {...register("password", { required: "Senha obrigatória" })}
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
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              {/* Botão principal — travado durante submit, redirecionamento e Google */}
              <motion.div variants={AUTH_FIELD} className="w-full">
                <motion.div
                  whileTap={!isLoading ? { scale: 0.97 } : undefined}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                >
                  <Button
                    type="submit"
                    className="w-full gap-2 transition-all"
                    disabled={isLoading}
                  >
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
                          Entrando...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Entrar
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div variants={AUTH_FIELD} className="relative w-full">
                <div className="absolute inset-0 top-1/2 border-t border-border" />
                <span className="relative flex justify-center bg-card px-3 text-xs text-muted-foreground">
                  ou continue com
                </span>
              </motion.div>

              <motion.div variants={AUTH_FIELD} className="w-full">
                <motion.div
                  whileTap={!isLoading ? { scale: 0.97 } : undefined}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isLoading}
                    onClick={handleGoogleSignIn}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    Entrar com Google
                  </Button>
                </motion.div>
              </motion.div>

              <motion.p variants={AUTH_FIELD} className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="cursor-pointer font-medium text-primary hover:underline"
                >
                  Cadastre-se
                </Link>
              </motion.p>
            </CardFooter>
          </motion.div>
        </form>
      </Card>
    </motion.div>
  );
}
