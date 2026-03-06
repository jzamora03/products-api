import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="toast" [ngClass]="['toast', toast.type]">{{ toast.message }}</div>
  `,
  styles: [
    '.toast { position:fixed; bottom:2rem; right:2rem; padding:.875rem 1.5rem; border-radius:8px; font-family:monospace; font-size:.9rem; z-index:9999; }' +
    '.success { background:rgba(46,213,115,.15); border:1px solid #2ed573; color:#2ed573; }' +
    '.error { background:rgba(255,71,87,.15); border:1px solid #ff4757; color:#ff4757; }'
  ]
})
export class ToastComponent implements OnInit {
  toast: Toast | null = null;

  constructor(private toastSvc: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.toastSvc.toast$.subscribe((t) => {
      this.toast = t;
      this.cdr.detectChanges();
    });
  }
}