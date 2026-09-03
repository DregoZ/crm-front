import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TableButtonConfig } from '../../button-config.model';
import { TableAction, TableColumn } from '../../table-column.model';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    ButtonComponent,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T extends { _id?: string }> {
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  columns = input.required<TableColumn<T>[]>();
  data = input.required<T[]>();
  actions = input<TableAction<T>[]>([]);
  loading = input(false);
  emptyMessage = input('No hay registros.');

  rowClickable = input(true);

  sortActive = input<string>('');
  sortDirection = input<'asc' | 'desc' | ''>('');

  withSearch = input(true);
  withOptions = input(true);
  options = input<TableButtonConfig[]>([]);
  searchPlaceholder = input('Buscar en la tabla...');

  paginated = input(true);
  pageSize = input(10);
  pageSizeOptions = input([5, 10, 25, 50]);
  pageIndex = input<number>(0); // Viene del padre

  // Si se provee este total, asumimos paginación por servidor
  totalElementsOverride = input<number | null>(null);

  sortChange = output<Sort>();
  rowClick = output<T>();
  pageChange = output<PageEvent>();
  searchChange = output<string>();

  searchTerm = signal<string>('');
  // Para paginación local (cliente) cuando no viene controlada por el padre
  localPageIndex = signal(0);

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((query) => {
        this.searchChange.emit(query);
      });
  }

  // Determina si estamos usando paginación por servidor
  isServerSide = computed(() => this.totalElementsOverride() !== null);

  // Índice activo (del padre si es backend, local si es cliente)
  effectivePageIndex = computed(() => {
    return this.isServerSide() ? this.pageIndex() : this.localPageIndex();
  });

  // 1. Datos a renderizar
  renderedData = computed(() => {
    const rawData = this.data();

    // Servidor: Devuelve los datos tal cual los envió la API
    if (this.isServerSide()) {
      return rawData;
    }

    // Cliente: Filtra y corta localmente
    const query = this.searchTerm().toLowerCase().trim();
    let result = rawData;

    if (this.withSearch() && query) {
      result = rawData.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(query),
        ),
      );
    }

    if (!this.paginated()) return result;

    const start = this.effectivePageIndex() * this.pageSize();
    return result.slice(start, start + this.pageSize());
  });

  // 2. Cálculo del Total de Elementos
  totalElements = computed(() => {
    const override = this.totalElementsOverride();
    if (override !== null) return override;

    const query = this.searchTerm().toLowerCase().trim();
    if (!this.withSearch() || !query) return this.data().length;

    return this.data().filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(query),
      ),
    ).length;
  });

  showPaginator = computed(() => {
    if (!this.paginated()) return false;
    return this.totalElements() > this.pageSize();
  });

  displayedColumns = computed(() => [
    ...this.columns().map((c) => c.name),
    ...(this.actions().length ? ['__actions'] : []),
  ]);

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);

    if (this.isServerSide()) {
      // Servidor: Notifica al sujeto (el padre se encarga de resetear la página a 1)
      this.searchSubject.next(value);
    } else {
      // Cliente: Resetea el índice local a la página 0
      this.localPageIndex.set(0);
    }
  }

  onSortChange(sort: Sort) {
    this.sortChange.emit(sort);
  }

  onRowClick(row: T) {
    if (this.rowClickable()) {
      this.rowClick.emit(row);
    }
  }

  onPageEvent(event: PageEvent) {
    if (!this.isServerSide()) {
      this.localPageIndex.set(event.pageIndex);
    }
    // Siempre emite el evento para que el padre reaccione si es paginación de servidor
    this.pageChange.emit(event);
  }

  getCellValue(row: T, column: TableColumn<T>): any {
    return (row as any)[column.name];
  }
}
