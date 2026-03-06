import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, PaginatedProducts, ProductFilter, CreateProductDto, Category } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient, private zone: NgZone) {}

  private run<T>(obs: Observable<T>): Observable<T> {
    return new Observable(observer => {
      obs.subscribe({
        next: v => this.zone.run(() => observer.next(v)),
        error: e => this.zone.run(() => observer.error(e)),
        complete: () => this.zone.run(() => observer.complete()),
      });
    });
  }

  getProducts(f: ProductFilter = {}): Observable<PaginatedProducts> {
    let p = new HttpParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return this.run(this.http.get<PaginatedProducts>(`${this.api}/Product`, { params: p }));
  }

  getProduct(id: string): Observable<Product> {
    return this.run(this.http.get<Product>(`${this.api}/Product/${id}`));
  }

  createProduct(dto: CreateProductDto): Observable<Product> {
    return this.run(this.http.post<Product>(`${this.api}/Product`, dto));
  }

  updateProduct(id: string, dto: Partial<CreateProductDto>): Observable<Product> {
    return this.run(this.http.put<Product>(`${this.api}/Product/${id}`, dto));
  }

  deleteProduct(id: string): Observable<void> {
    return this.run(this.http.delete<void>(`${this.api}/Product/${id}`));
  }

  getCategories(): Observable<Category[]> {
    return this.run(this.http.get<Category[]>(`${this.api}/Category`));
  }

  createCategory(data: { name: string }): Observable<Category> {
    return this.run(this.http.post<Category>(`${this.api}/Category`, data));
  }

  bulkCreate(count: number, categoryId: string): Observable<{ inserted: number; message: string }> {
    return this.run(this.http.post<{ inserted: number; message: string }>(
      `${this.api}/Product/bulk`, { count, categoryId }
    ));
  }
}