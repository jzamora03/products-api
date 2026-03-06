import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  constructor(private zone: NgZone) {}

  show(message: string, type: 'success' | 'error' = 'success') {
    this.zone.run(() => {
      this.toastSubject.next({ message, type });
      setTimeout(() => {
        this.zone.run(() => this.toastSubject.next(null));
      }, 3000);
    });
  }
}