import * as XLSX from 'xlsx';

export function generateImportTemplate(): void {
  const headers = ['Nome', 'Código de Barras', 'Categoria', 'Preço', 'Estoque', 'Estoque Mínimo'];
  const example = ['Produto Exemplo', '7891234567890', 'Bebidas', '5.90', '100', '10'];

  const ws = XLSX.utils.aoa_to_sheet([headers, example]);
  ws['!cols'] = [{ wch: 30 }, { wch: 22 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
  XLSX.writeFile(wb, 'template-importacao-produtos.xlsx');
}
