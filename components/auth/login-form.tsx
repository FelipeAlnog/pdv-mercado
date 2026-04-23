// "use client"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import Link from "next/link"
// import { useState } from "react"
// import { useForm } from "react-hook-form"
// import { useRouter } from "next/navigation"
// import { Eye, EyeOff, Loader2, Stethoscope, ArrowRight } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { authClient } from "@/lib/auth-client"
// import {  IconDashboard } from "@tabler/icons-react"

// interface LoginFormData {
//   email: string
//   password: string
// }

// export function LoginForm() {
//   const [isLoading, setIsLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const { register, handleSubmit } = useForm<LoginFormData>()
//   const router = useRouter()
//   const { toast } = useToast()

//   const onSubmit = async (data: LoginFormData) => {
//     setIsLoading(true)
//     try {
//       await authClient.signIn.email(
//         { email: data.email, password: data.password },
//         {
//           onSuccess() {
//             toast({ description: "Login realizado com sucesso!", variant: "positive" })
//             router.push("/dashboard")
//           },
//           onError() {
//             toast({ variant: "destructive", description: "Credenciais inválidas. Verifique seu email e senha." })
//           },
//         }
//       )
//     } catch {
//       toast({ variant: "destructive", description: "Credenciais inválidas. Verifique seu email e senha." })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="text-center space-y-1">
//         <div className="flex justify-center mb-4">
//           <div className="h-12 w-12 rounded-2xl bg-[#1a3b9633] flex items-center justify-center">
//             <IconDashboard className="h-6 w-6 " />
//           </div>
//         </div>
//         <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
//           Bem-vindo de volta
//         </h1>
//         <p className="text-sm text-zinc-500 dark:text-zinc-400">
//           Entre com sua conta para acessar a plataforma
//         </p>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <div className="space-y-1.5">
//           <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 font-medium text-sm">
//             Email
//           </Label>
//           <Input
//             id="email"
//             type="email"
//             placeholder="seu@email.com"
//             className="h-11 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus-visible:ring-[#9EEA6C]/30"
//             {...register("email", { required: true })}
//           />
//         </div>

//         <div className="space-y-1.5">
//           <div className="flex items-center justify-between">
//             <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300 font-medium text-sm">
//               Senha
//             </Label>
//             <a href="#" className="text-xs dark:text-zinc-200 text-[#042580] hover:text-[#8ad85c] transition-colors font-medium">
//               Esqueceu a senha?
//             </a>
//           </div>
//           <div className="relative">
//             <Input
//               id="password"
//               type={showPassword ? "text" : "password"}
//               placeholder="••••••••"
//               className="h-11 pr-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus-visible:ring-[#9EEA6C]/30"
//               {...register("password", { required: true })}
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
//             >
//               {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//             </button>
//           </div>
//         </div>

//         <Button
//           type="submit"
//           disabled={isLoading}
//           className="w-full h-11 bg-[#0d0e63] hover:bg-[#042580] text-zinc-100  font-bold rounded-xl shadow-lg  disabled:opacity-50 mt-2"
//         >
//           {isLoading ? (
//             <><Loader2 className="animate-spin h-4 w-4 mr-2" />Entrando...</>
//           ) : (
//             <>Entrar <ArrowRight className="ml-2 h-4 w-4" /></>
//           )}
//         </Button>
//       </form>

//       {/* Divisor */}
//       <div className="relative text-center text-sm">
//         <div className="absolute inset-0 top-1/2 border-t border-zinc-200 dark:border-zinc-700" />
//         <span className="relative bg-white dark:bg-zinc-900/60 px-3 text-zinc-400 dark:text-zinc-500 text-xs">
//           ou continue com
//         </span>
//       </div>

//       {/* Google */}
//       {/* <Button
//         variant="outline"
//         className="w-full h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
//         type="button"
//         disabled={isLoading}
//       >
//         <Icons.google className="mr-2 h-4 w-4" />
//         Entrar com Google
//       </Button> */}

//       {/* Links */}
//       <div className="space-y-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
//         <p>
//           Não tem conta?{" "}
//           <Link href="/register" className="text-[#0d0e63] dark:text-zinc-200 font-semibold transition-colors">
//             Cadastre-se como paciente
//           </Link>
//         </p>
//         {/* <p>
//           É profissional de saúde?{" "}
//           <Link href="/register/professional" className="text-[#9EEA6C] hover:text-[#8ad85c] font-semibold transition-colors">
//             Cadastre-se aqui
//           </Link>
//         </p> */}
//       </div>
//     </div>
//   )
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, ShoppingCart } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Erro ao fazer login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <ShoppingCart className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Bem-vindo ao PDV</CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pb-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
