import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, Subject, takeUntil, skip } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Product, PaginatedProducts, Category } from '../../models/product.model';
import { ToastComponent } from '../../../shared/toast.component';
import { ToastService } from '../../../shared/toast.service';


@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, ToastComponent],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];
  paginated: PaginatedProducts | null = null;
  loading = false;
  currentPage = 1;
  filterForm: FormGroup;
  private destroy$ = new Subject<void>();

  showBulkModal = false;
  bulkCount = 1000;
  bulkCategoryId = '';
  bulkLoading = false;
  bulkResult = '';

  showCategoryModal = false;
  newCategoryName = '';
  categoryError = '';


  constructor(
    private productsSvc: ProductsService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      categoryId: [''],
      sortBy: ['createdAt'],
      sortOrder: ['DESC'],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.load();
    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.load();
    });
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  load(): void {
    this.loading = true;
    this.productsSvc.getProducts({ page: this.currentPage, limit: 20, ...this.filterForm.value }).subscribe({
      next: (r) => {
        this.paginated = r;
        this.products = r.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.log('❌ Error:', e);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadCategories(): void {
    this.productsSvc.getCategories().subscribe({ next: (c) => (this.categories = c) });
  }

  goToPage(page: number): void {
    if (!this.paginated || page < 1 || page > this.paginated.totalPages) return;
    this.currentPage = page;
    this.load();
  }

  resetFilters(): void {
    this.filterForm.reset({ search: '', categoryId: '', sortBy: 'createdAt', sortOrder: 'DESC' });
  }

  delete(product: Product): void {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    this.productsSvc.deleteProduct(product.id).subscribe({
      next: () => {
        this.toast.show('✅ Producto eliminado correctamente', 'success');
        this.load();
      },
      error: () => this.toast.show('Error al eliminar', 'error'),
    });
  }


  doBulk(): void {
    if (!this.bulkCategoryId) return;
    this.bulkLoading = true;
    this.bulkResult = '';
    this.productsSvc.bulkCreate(this.bulkCount, this.bulkCategoryId).subscribe({
      next: (r) => {
        this.bulkResult = r.message;
        this.bulkLoading = false;
        this.showBulkModal = false;
        this.toast.show(`⚡ ${r.inserted} productos insertados`);
        this.load();
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.bulkResult = 'Error: ' + (e.error?.message || 'Falló');
        this.bulkLoading = false;
        this.toast.show('Error en carga masiva', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  createCategory(): void {
    if (!this.newCategoryName.trim()) return;
    this.productsSvc.createCategory({ name: this.newCategoryName.trim() }).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.categoryError = '';
        this.showCategoryModal = false;
        this.toast.show('✅ Categoría creada exitosamente ');
        this.loadCategories();
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.categoryError = e.error?.message || 'Error al crear';
        this.toast.show('Error al crear categoría', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  logout(): void { this.authService.logout(); }
}