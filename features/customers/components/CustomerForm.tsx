'use client';

import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Customer, CustomerFormData } from '@/types/customer';
import { useCustomerForm } from '../hooks/useCustomerForm';

interface CustomerFormProps {
  initial?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CustomerForm({ initial, onSubmit, onCancel, loading }: CustomerFormProps) {
  const { values, setField, validate, getError } = useCustomerForm(initial);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Nome completo *"
        value={values.name}
        onChange={(e) => setField('name', e.target.value)}
        error={getError('name')}
        placeholder="Ex: João da Silva"
        autoFocus
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Telefone / WhatsApp"
          type="tel"
          value={values.phone}
          onChange={(e) => setField('phone', e.target.value)}
          placeholder="Ex: 11 99999-9999"
        />
        <Field
          label="CPF"
          value={values.cpf}
          onChange={(e) => setField('cpf', e.target.value)}
          error={getError('cpf')}
          placeholder="000.000.000-00"
        />
      </div>

      <Field
        label="E-mail"
        type="email"
        value={values.email}
        onChange={(e) => setField('email', e.target.value)}
        error={getError('email')}
        placeholder="joao@email.com"
      />

      <Field
        label="Endereço"
        value={values.address}
        onChange={(e) => setField('address', e.target.value)}
        placeholder="Rua, número, bairro"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Observações</label>
        <textarea
          value={values.notes}
          onChange={(e) => setField('notes', e.target.value)}
          placeholder="Informações adicionais..."
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Salvar alterações' : 'Cadastrar cliente'}
        </Button>
      </div>
    </form>
  );
}
