import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  categories: Category[] = [];
  submitted = false;
  loading = false;
  apiError = '';
  isEdit = false;
  productId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private svc: ProductsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      categoryId: ['', Validators.required],
      unitPrice: [0],
      quantityPerUnit: [''],
      unitsInStock: [0],
      unitsOnOrder: [0],
      reorderLevel: [0],
      discontinued: [false],
    });
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.svc.getCategories().subscribe({ next: (c) => (this.categories = c) });
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEdit = true;
      this.svc.getProduct(this.productId).subscribe({
        next: (p) => this.form.patchValue(p),
        error: () => this.router.navigate(['/products']),
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.apiError = '';
    if (this.form.invalid) return;
    this.loading = true;
    const action = this.isEdit
      ? this.svc.updateProduct(this.productId!, this.form.value)
      : this.svc.createProduct(this.form.value);
    action.subscribe({
      next: () => this.router.navigate(['/products']),
      error: (e) => { this.apiError = e.error?.message || 'Error al guardar'; this.loading = false; },
    });
  }
}