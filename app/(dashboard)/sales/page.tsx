"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePageHeader } from "@/hooks/usePageHeader";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { BarcodeInput } from "@/features/sales/components/BarcodeInput";
import { Cart, CartSummary } from "@/features/sales/components/Cart";
import { SaleHistory } from "@/features/sales/components/SaleHistory";
import { ProductForm } from "@/features/products/components/ProductForm";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { useSaleStore } from "@/store/useSaleStore";
import { Product, ProductFormData } from "@/types/product";
import { exportToExcel, exportToPDF } from "@/lib/export";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { cn } from "@/lib/utils";

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Dinheiro', card: 'Cartão', pix: 'PIX', pending: 'Fiado',
};

export default function SalesPage() {
  const { fetchProducts, createProduct } = useProductStore();
  const { addItem } = useCartStore();
  const { sales, loadingState, fetchSales } = useSaleStore();
  const [activeTab, setActiveTab] = useState<"pdv" | "history">("pdv");
  const [quickBarcode, setQuickBarcode] = useState<string | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [fetchProducts, fetchSales]);

  function handleProductFound(product: Product) {
    if (product.stock <= 0) {
      toast.error(`${product.name} está sem estoque!`);
      return;
    }
    addItem(product);
    toast.success(`${product.name} adicionado ao carrinho`);
  }

  async function handleQuickCreate(data: ProductFormData) {
    setQuickLoading(true);
    try {
      const product = await createProduct(data);
      toast.success("Produto cadastrado e adicionado ao carrinho!");
      addItem(product);
      setQuickBarcode(null);
    } catch {
      toast.error("Erro ao cadastrar produto.");
    } finally {
      setQuickLoading(false);
    }
  }

  const SALE_HEADERS = ['Data', 'Cliente', 'Itens', 'Total', 'Pagamento', 'Status'];

  function getSaleRows() {
    return sales.map((s) => [
      formatDate(s.createdAt),
      s.customerName ?? '—',
      s.items.map((i) => `${i.quantity}x ${i.productName}`).join(', '),
      formatCurrency(s.total),
      PAYMENT_LABELS[s.paymentMethod] ?? s.paymentMethod,
      s.paidAt ? 'Pago' : s.paymentMethod === 'pending' ? 'Pendente' : 'Concluído',
    ]);
  }

  function handleExportExcel() {
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    exportToExcel(`vendas-${date}`, SALE_HEADERS, getSaleRows(), 'Vendas');
  }

  function handleExportPDF() {
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    exportToPDF('Relatório de Vendas', SALE_HEADERS, getSaleRows(), `vendas-${date}`, true);
  }

  usePageHeader({
    title: "Vendas",
    subtitle: "PDV — Ponto de Venda",
    actions: (
      <div className="flex items-center gap-2">
        <ExportMenu onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} disabled={sales.length === 0} />
        <div className="flex overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {(["pdv", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 cursor-pointer text-sm font-medium transition-colors",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab === "pdv" ? "PDV" : "Histórico"}
            </button>
          ))}
        </div>
      </div>
    ),
  });

  return (
    <div className="space-y-6">

      {activeTab === "pdv" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Scanner */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Escanear Produto
              </p>
              <BarcodeInput
                onProductFound={handleProductFound}
                onNotFound={(barcode) => setQuickBarcode(barcode)}
              />
            </div>

            {/* Cart — same width as scanner */}
            <div className="mt-4 h-[420px] lg:h-[calc(100vh-16rem)]">
              <Cart />
            </div>
          </div>

          {/* Payment / Total — right sidebar, pinned to bottom */}
          <div className="flex flex-col justify-end lg:sticky lg:top-4 lg:self-end lg:h-[calc(100vh-8rem)]">
            <CartSummary />
          </div>
        </div>
      ) : (
        <div>
          {loadingState === "loading" ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" className="text-primary" />
            </div>
          ) : (
            <SaleHistory sales={sales} />
          )}
        </div>
      )}

      <Modal
        open={!!quickBarcode}
        onClose={() => setQuickBarcode(null)}
        title="Produto não encontrado — Cadastrar rapidamente"
        size="lg"
      >
        {quickBarcode && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-500/10">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Código{" "}
                <span className="font-mono font-semibold">{quickBarcode}</span>{" "}
                não encontrado no catálogo. Preencha os dados abaixo para
                cadastrar.
              </p>
            </div>
            <ProductForm
              prefillBarcode={quickBarcode}
              onSubmit={handleQuickCreate}
              onCancel={() => setQuickBarcode(null)}
              loading={quickLoading}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
