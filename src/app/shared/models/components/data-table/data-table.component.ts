// shared/components/data-table/data-table.component.ts
import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TableColumn, TableAction } from '../../table-column.model';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T extends { _id?: string }> {
  columns = input.required<TableColumn<T>[]>();
  data = input.required<T[]>();
  actions = input<TableAction<T>[]>([]);
  loading = input(false);
  emptyMessage = input('No hay registros.');

  rowClickable = input(true); // en html [rowClickable]="true"

  sortActive = input<string>('');
  sortDirection = input<'asc' | 'desc' | ''>('');

  // NUEVO: Input para activar la barra de búsqueda y placeholder configurable
  withSearch = input(true);

  searchPlaceholder = input('Buscar en la tabla...');

  sortChange = output<Sort>();

  // 2. Esta es la salida que emitirá la fila al hacer clic
  rowClick = output<T>();

  // NUEVO: Signal interna para guardar el texto escrito
  searchTerm = signal<string>('');

  // NUEVO: Lógica de filtrado automática y genérica para CUALQUIER tipo de objeto <T>
  filteredData = computed(() => {
    const rawData = this.data();
    const query = this.searchTerm().toLowerCase().trim();

    if (!this.withSearch() || !query) {
      return rawData;
    }

    // Filtra el objeto buscando coincidencias de texto en cualquiera de sus propiedades dinámicamente
    return rawData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(query),
      ),
    );
  });

  displayedColumns = computed(() => [
    ...this.columns().map((c) => c.name),
    ...(this.actions().length ? ['__actions'] : []),
  ]);

  onSortChange(sort: Sort) {
    this.sortChange.emit(sort);
  }

  // 3. Modificado para usar el nuevo valor del computed automático
  onRowClick(row: T) {
    if (this.rowClickable()) {
      this.rowClick.emit(row);
    }
  }

  getCellValue(row: T, column: TableColumn<T>): any {
    return (row as any)[column.name];
  }

  trackByRow(index: number, row: T): string {
    return row._id ?? String(index);
  }

  // NUEVO: Método para actualizar la señal al escribir
  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm.set(inputElement.value);
  }
}
