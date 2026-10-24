import { MatPaginatorIntl } from '@angular/material/paginator';

// Textos del paginador de Angular Material en español
export function paginadorEnEspanol(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Registros por página';
  intl.nextPageLabel = 'Página siguiente';
  intl.previousPageLabel = 'Página anterior';
  intl.firstPageLabel = 'Primera página';
  intl.lastPageLabel = 'Última página';
  intl.getRangeLabel = (pagina: number, tamano: number, total: number) => {
    if (total === 0) return '0 de 0';
    const inicio = pagina * tamano;
    const fin = Math.min(inicio + tamano, total);
    return `${inicio + 1} – ${fin} de ${total}`;
  };
  return intl;
}
