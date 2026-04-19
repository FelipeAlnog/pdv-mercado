export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  cpf?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  cpf: string;
  address: string;
  notes: string;
}
