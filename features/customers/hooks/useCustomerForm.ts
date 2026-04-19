import { useState } from 'react';
import { Customer, CustomerFormData } from '@/types/customer';

const empty: CustomerFormData = {
  name: '',
  phone: '',
  email: '',
  cpf: '',
  address: '',
  notes: '',
};

type Errors = Partial<Record<keyof CustomerFormData, string>>;

export function useCustomerForm(initial?: Customer) {
  const [values, setValues] = useState<CustomerFormData>(
    initial
      ? {
          name: initial.name,
          phone: initial.phone ?? '',
          email: initial.email ?? '',
          cpf: initial.cpf ?? '',
          address: initial.address ?? '',
          notes: initial.notes ?? '',
        }
      : empty,
  );
  const [errors, setErrors] = useState<Errors>({});

  function setField<K extends keyof CustomerFormData>(key: K, value: CustomerFormData[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!values.name.trim()) next.name = 'Nome é obrigatório.';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = 'E-mail inválido.';
    }
    if (values.cpf && values.cpf.replace(/\D/g, '').length !== 11) {
      next.cpf = 'CPF deve ter 11 dígitos.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function getError(key: keyof CustomerFormData): string | undefined {
    return errors[key];
  }

  return { values, setField, validate, getError };
}
