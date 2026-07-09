import { MatPaginatorIntl } from '@angular/material/paginator';

export function createPaginatorIntlPtBr(): MatPaginatorIntl {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Itens por página';
  paginatorIntl.nextPageLabel = 'Próxima página';
  paginatorIntl.previousPageLabel = 'Página anterior';
  paginatorIntl.firstPageLabel = 'Primeira página';
  paginatorIntl.lastPageLabel = 'Última página';
  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const safeLength = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < safeLength ? Math.min(startIndex + pageSize, safeLength) : startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} de ${safeLength}`;
  };

  return paginatorIntl;
}
