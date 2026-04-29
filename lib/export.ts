import * as XLSX from 'xlsx';

// ─── Excel ────────────────────────────────────────────────────────────────────

export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  sheetName = 'Dados',
) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map(() => ({ wch: 22 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToExcelMultiSheet(
  filename: string,
  sheets: { name: string; headers: string[]; rows: (string | number)[][] }[],
) {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([sheet.headers, ...sheet.rows]);
    ws['!cols'] = sheet.headers.map(() => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ─── PDF (browser print engine) ───────────────────────────────────────────────

export function exportToPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string,
  landscape = false,
) {
  const now = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${String(cell).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`,
    )
    .join('');

  const emptyState =
    rows.length === 0
      ? `<tr><td colspan="${headers.length}" class="empty">Nenhum dado para exibir.</td></tr>`
      : '';

  const pageSize = landscape ? 'landscape' : 'portrait';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${filename}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11px;
      color: #111827;
      background: #fff;
      padding: 28px 32px;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 2px solid #6366f1;
    }

    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #1e1b4b;
      letter-spacing: -0.02em;
    }

    .meta {
      font-size: 9.5px;
      color: #6b7280;
      margin-top: 3px;
    }

    .brand {
      font-size: 12px;
      font-weight: 600;
      color: #6366f1;
      letter-spacing: -0.01em;
    }

    .brand span {
      display: block;
      font-size: 9px;
      font-weight: 400;
      color: #9ca3af;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 2px;
    }

    thead tr {
      background: #6366f1;
    }

    thead th {
      color: #fff;
      font-size: 9.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 9px 11px;
      text-align: left;
      white-space: nowrap;
    }

    tbody tr:nth-child(even) { background: #f5f5ff; }
    tbody tr:hover { background: #eef2ff; }

    tbody td {
      padding: 7px 11px;
      border-bottom: 1px solid #e5e7eb;
      color: #374151;
      vertical-align: top;
      word-break: break-word;
    }

    td.empty {
      text-align: center;
      color: #9ca3af;
      padding: 24px;
      font-style: italic;
    }

    footer {
      margin-top: 20px;
      font-size: 9px;
      color: #9ca3af;
      text-align: center;
    }

    @media print {
      body { padding: 0; }
      @page { size: ${pageSize}; margin: 12mm 14mm; }
      header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tbody tr:nth-child(even) { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>${title}</h1>
      <p class="meta">Gerado em ${now}</p>
    </div>
    <div class="brand">
      PDV Mercado
      <span>Sistema de Vendas</span>
    </div>
  </header>

  <table>
    <thead>
      <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${tableRows || emptyState}
    </tbody>
  </table>

  <footer>
    ${filename}.pdf &nbsp;·&nbsp; ${rows.length} registro${rows.length !== 1 ? 's' : ''}
  </footer>

  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=1100,height=750');
  if (!win) {
    alert('Permita pop-ups para exportar o PDF.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

export function exportToPDFMultiSection(
  title: string,
  sections: { subtitle: string; headers: string[]; rows: (string | number)[][] }[],
  filename: string,
  landscape = false,
) {
  const now = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const pageSize = landscape ? 'landscape' : 'portrait';

  const sectionsHtml = sections
    .map(
      ({ subtitle, headers, rows }) => `
    <section>
      <h2>${subtitle}</h2>
      <table>
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>
          ${
            rows.length === 0
              ? `<tr><td colspan="${headers.length}" class="empty">Nenhum dado.</td></tr>`
              : rows
                  .map(
                    (row) =>
                      `<tr>${row.map((cell) => `<td>${String(cell).replace(/</g, '&lt;')}</td>`).join('')}</tr>`,
                  )
                  .join('')
          }
        </tbody>
      </table>
    </section>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${filename}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111827; padding: 28px 32px; }
    header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 2px solid #6366f1; }
    h1 { font-size: 20px; font-weight: 700; color: #1e1b4b; }
    .meta { font-size: 9.5px; color: #6b7280; margin-top: 3px; }
    .brand { font-size: 12px; font-weight: 600; color: #6366f1; }
    .brand span { display: block; font-size: 9px; font-weight: 400; color: #9ca3af; }
    section { margin-bottom: 28px; }
    section h2 { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #6366f1; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    thead th { color: #fff; font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 10px; text-align: left; }
    tbody tr:nth-child(even) { background: #f5f5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    tbody td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; color: #374151; }
    td.empty { text-align: center; color: #9ca3af; padding: 20px; font-style: italic; }
    footer { margin-top: 16px; font-size: 9px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 0; } @page { size: ${pageSize}; margin: 12mm 14mm; } }
  </style>
</head>
<body>
  <header>
    <div><h1>${title}</h1><p class="meta">Gerado em ${now}</p></div>
    <div class="brand">PDV Mercado<span>Sistema de Vendas</span></div>
  </header>
  ${sectionsHtml}
  <footer>${filename}.pdf</footer>
  <script>window.onload = function () { setTimeout(function () { window.print(); }, 400); };</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=1100,height=750');
  if (!win) { alert('Permita pop-ups para exportar o PDF.'); return; }
  win.document.write(html);
  win.document.close();
}
