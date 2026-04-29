'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { signOut } from '@/lib/auth-client';
import { useStoreStore } from '@/store/useStoreStore';
import { resetAllStores } from '@/store/resetAllStores';
import { cn } from '@/lib/utils';
import { X, LogOut, Camera, Building2, Phone, MapPin, CreditCard, Loader2 } from 'lucide-react';

interface SettingsFormData {
  name: string;
  phone: string;
  address: string;
}

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

const MAX_LOGO_BYTES = 600 * 1024; // 600 KB

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const router = useRouter();
  const { store, updateStore } = useStoreStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoData, setLogoData] = useState<string | null | undefined>(undefined); // undefined = unchanged
  const [signingOut, setSigningOut] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>();

  // Sync form values whenever the sheet opens or store loads
  useEffect(() => {
    if (open && store) {
      reset({ name: store.name, phone: store.phone ?? '', address: store.address ?? '' });
      setLogoPreview(store.logo ?? null);
      setLogoData(undefined);
    }
  }, [open, store, reset]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_LOGO_BYTES) {
      toast.error('Imagem muito grande. Máximo 600 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogoPreview(result);
      setLogoData(result);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveLogo() {
    setLogoPreview(null);
    setLogoData(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onSubmit(data: SettingsFormData) {
    try {
      await updateStore({
        name: data.name,
        phone: data.phone,
        address: data.address,
        ...(logoData !== undefined && { logo: logoData }),
      });
      toast.success('Configurações salvas!');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar.');
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      // Limpa todos os stores ANTES de redirecionar (proteção LGPD)
      resetAllStores();
      await signOut();
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Erro ao sair. Tente novamente.');
      setSigningOut(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-80 flex-col bg-slate-900 shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Configurações da Loja</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Logo section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo da loja"
                    className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/10"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                    <Building2 className="h-9 w-9 text-white" />
                  </div>
                )}
                {/* Camera overlay */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg transition-colors hover:bg-indigo-400"
                  title="Alterar logo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {logoPreview ? 'Trocar imagem' : 'Adicionar logo'}
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    Remover
                  </button>
                )}
              </div>
              <p className="text-center text-[11px] text-slate-600">
                PNG, JPEG ou WebP · Máx. 600 KB
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.06]" />

            {/* Store name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Building2 className="h-3.5 w-3.5" />
                Nome da Loja *
              </label>
              <input
                type="text"
                placeholder="Nome da loja"
                className={cn(
                  'w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600',
                  'outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40',
                  errors.name ? 'border-red-500/50' : 'border-white/10'
                )}
                {...register('name', { required: 'Nome obrigatório' })}
              />
              {errors.name && (
                <p className="text-[11px] text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* CPF (read-only) */}
            {store?.cpf && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <CreditCard className="h-3.5 w-3.5" />
                  CPF / CNPJ
                </label>
                <div className="flex w-full items-center rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-slate-500">
                  {store.cpf}
                  <span className="ml-auto text-[10px] text-slate-600">somente leitura</span>
                </div>
              </div>
            )}

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Phone className="h-3.5 w-3.5" />
                Telefone
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                {...register('phone')}
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                Endereço
              </label>
              <input
                type="text"
                placeholder="Rua, número, bairro"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                {...register('address')}
              />
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 space-y-2 border-t border-white/[0.06] p-4">
          {/* Save button */}
          <button
            type="submit"
            form="settings-form"
            disabled={isSubmitting}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors',
              'bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar configurações'
            )}
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {signingOut ? 'Saindo...' : 'Sair da conta'}
          </button>
        </div>
      </div>
    </>
  );
}
