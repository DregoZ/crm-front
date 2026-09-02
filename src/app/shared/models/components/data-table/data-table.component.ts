// shared/components/data-table/data-table.component.ts
import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
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
  rowClickable = input(false);
  sortActive = input<string>('');
  sortDirection = input<'asc' | 'desc' | ''>('');
  sortChange = output<Sort>();
  rowClick = output<T>();

  displayedColumns = computed(() => [
    ...this.columns().map((c) => c.name),
    ...(this.actions().length ? ['__actions'] : []),
  ]);

  onSortChange(sort: Sort) {
    this.sortChange.emit(sort);
  }

  onRowClick(row: T) {
    if (this.rowClickable()) this.rowClick.emit(row);
  }

  getCellValue(row: T, column: TableColumn<T>): any {
    return (row as any)[column.name];
  }

  trackByRow(index: number, row: T): string {
    return (row as any)._id ?? String(index);
  }
}
