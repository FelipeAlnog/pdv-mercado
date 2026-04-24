import Link from 'next/link';
import {
  ShoppingCart,
  BarChart3,
  Package,
  Users,
  ScanBarcode,
  CreditCard,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ShoppingCart className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">PDV Mercado</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Criar conta grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* gradient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
          <Zap className="h-3.5 w-3.5 text-primary" />
          Grátis para sempre no plano básico
        </div>

        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          O PDV que pequenos mercados{' '}
          <span className="text-primary">merecem</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Controle vendas, estoque e clientes em um sistema simples e rápido.
          Funciona com leitor de código de barras, fiado e múltiplos métodos de pagamento.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/register">
              Começar grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Já tenho conta</Link>
          </Button>
        </div>

        {/* mini stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-10 text-sm text-muted-foreground">
          {[
            { value: 'Grátis', label: 'Para começar' },
            { value: '< 1min', label: 'Para cadastrar' },
            { value: '100%', label: 'Online, sem instalar nada' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
  {
    icon: ScanBarcode,
    title: 'Leitor de código de barras',
    desc: 'Adicione produtos ao carrinho escaneando o código. Rápido como num caixa de supermercado.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard com métricas',
    desc: 'Veja o faturamento do dia, produtos com estoque baixo e histórico de vendas em tempo real.',
  },
  {
    icon: Package,
    title: 'Controle de estoque',
    desc: 'Cadastre produtos com estoque mínimo e receba alertas antes de ficar sem mercadoria.',
  },
  {
    icon: Users,
    title: 'Cadastro de clientes',
    desc: 'Mantenha uma ficha de cada cliente com histórico de compras e dados de contato.',
  },
  {
    icon: CreditCard,
    title: 'Múltiplas formas de pagamento',
    desc: 'Dinheiro, cartão, PIX ou fiado. Registre a venda do jeito que o cliente prefere pagar.',
  },
  {
    icon: TrendingDown,
    title: 'Controle de devedores',
    desc: 'Vendas no fiado geram registro automático. Saiba exatamente quem deve e quanto.',
  },
];

function Features() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo que você precisa num só lugar
          </h2>
          <p className="mt-3 text-muted-foreground">
            Feito para o dia a dia do pequeno comércio.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1.5 font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
const steps = [
  { step: '01', title: 'Crie sua conta', desc: 'Cadastro em menos de um minuto. Sem cartão de crédito.' },
  { step: '02', title: 'Cadastre seus produtos', desc: 'Adicione nome, preço, código de barras e estoque inicial.' },
  { step: '03', title: 'Comece a vender', desc: 'Escaneie, adicione ao carrinho e finalize. Simples assim.' },
];

function HowItWorks() {
  return (
    <section className="border-t bg-muted/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Começar é simples
          </h2>
          <p className="mt-3 text-muted-foreground">
            Três passos e seu caixa está funcionando.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="relative text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-background text-xl font-bold text-primary">
                {step}
              </div>
              <h3 className="mb-2 font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: 'para sempre',
    highlight: false,
    features: [
      'Produtos ilimitados',
      'Registro de vendas',
      'Controle de estoque',
      'Cadastro de clientes',
      'Histórico de vendas',
    ],
    cta: 'Criar conta grátis',
    href: '/register',
  },
  {
    name: 'Pro',
    price: 'Em breve',
    period: '',
    highlight: true,
    features: [
      'Tudo do plano Grátis',
      'Relatórios avançados',
      'Múltiplos usuários',
      'Backup automático',
      'Suporte prioritário',
    ],
    cta: 'Entrar na fila de espera',
    href: '/register',
  },
];

function Pricing() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Preços</h2>
          <p className="mt-3 text-muted-foreground">
            Comece grátis. Evolua quando precisar.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={[
                'flex flex-col rounded-2xl border p-8',
                plan.highlight
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'bg-card shadow-sm',
              ].join(' ')}
            >
              {plan.highlight && (
                <span className="mb-4 w-fit rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Em breve
                </span>
              )}
              <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight">{plan.price}</p>
              {plan.period && (
                <p className="mt-0.5 text-sm text-muted-foreground">{plan.period}</p>
              )}

              <ul className="my-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.highlight ? 'outline' : 'default'}
                className="w-full"
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function FinalCta() {
  return (
    <section className="border-t bg-primary py-20 text-primary-foreground">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Pronto para organizar seu comércio?
        </h2>
        <p className="mt-4 text-primary-foreground/80">
          Crie sua conta agora e comece a usar em minutos. É grátis.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="secondary" className="gap-2" asChild>
            <Link href="/register">
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            asChild
          >
            <Link href="/login">Já tenho conta</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShoppingCart className="h-4 w-4 text-primary" />
          PDV Mercado
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} PDV Mercado. Todos os direitos reservados.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground transition-colors">
            Entrar
          </Link>
          <Link href="/register" className="hover:text-foreground transition-colors">
            Cadastrar
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
