import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
//import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Product } from './models/product';
import { ProductApi } from './services/product-api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('shopping-list');
  objectName = '';
  products: Product[] = [];
  isOpen = false;
  searchProduct = '';
  private cdr = inject(ChangeDetectorRef);
  private api = inject(ProductApi);
  highlightedId: string | null = null;
  private highlightTime?: ReturnType<typeof setTimeout>;

  constructor() {
    this.loadProducts();
  }
  async loadProducts() {
    try {
      this.products = await firstValueFrom(this.api.getProducts());
    } catch {
      this.showError('Ürünler yüklenemedi.');
    }
    this.cdr.markForCheck();
  }

  showError(message: string) {
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  }

  clean() {
    this.objectName = '';
  }

  async add() {
    const name = this.objectName.trim();
    if (name == '') {
      return;
    }
    const existing = this.findProduct(name);
    if (existing) {
      await this.availableProduct(existing);
      return;
    }
    try {
      const newProduct = await firstValueFrom(this.api.createProduct(name));
      this.products.push(newProduct);
      this.clean();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        await this.loadProducts();
        this.showError('Bu ürün listede zaten var.');
      } else {
        this.showError('Ürün eklenemedi.');
      }
    }
    this.cdr.markForCheck();
  }


  findProduct(name: string): Product | undefined {
    const text = name.trim().toLocaleLowerCase('tr');
    return this.products.find(p => p.productName.trim().toLocaleLowerCase('tr') == text);
  }

  async availableProduct(product: Product) {
    const result = await Swal.fire({
      title: "Ürün Eklensin mi?",
      text: `Eklemeye çalıştığınız ürün listede ${product.quantity} adet bulunuyor. Sayısı artırmak ister misiniz?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Artıralım',
      cancelButtonText: 'Yeterli',
      confirmButtonColor: 'brown',
      cancelButtonColor: 'brown',
      reverseButtons: true,
    });
    this.clean();

    if (result.isConfirmed) {
      this.searchProduct = '';
      if (this.isOpen) {
        this.openClose();
      }
      this.highlight(product);
    } else {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'info',
        title: 'Ürün eklenmedi.',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    }
    this.cdr.markForCheck();
  }

  highlight(product: Product) {
    clearTimeout(this.highlightTime);
    this.highlightedId = product.id;

    setTimeout(() => {
      document.getElementById('row-' + product.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    this.highlightTime = setTimeout(() => this.clearHighlight(), 6000);
  }

  clearHighlight() {
    clearTimeout(this.highlightTime);
    this.highlightedId = null;
    this.cdr.markForCheck();
  }

  async decrease(product: Product) {
    if (product.quantity <= 1) {
      return;
    }
    await this.changeQuantity(product, product.quantity - 1);
  }

  async increase(product: Product) {
    if (product.id == this.highlightedId) {
      this.clearHighlight();
    }
    await this.changeQuantity(product, product.quantity + 1);
  }

  async changeQuantity(product: Product, quantity: number) {
    try {
      const updated = await firstValueFrom(this.api.updateProduct(product.id, quantity));
      product.quantity = updated.quantity;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.showError('Ürün bulunamadı, liste yenilendi.');
        await this.loadProducts();
        return;
      }
      this.showError('Adet güncellenemedi.');
    }
    this.cdr.markForCheck();
  }

  async delete(product: Product) {
    try {
      await firstValueFrom(this.api.deleteProduct(product.id));
    } catch (error) {
      if (!(error instanceof HttpErrorResponse && error.status === 404)) {
        this.showError('Ürün silinemedi.');
        this.cdr.markForCheck();
        return;
      }
    }
    this.products = this.products.filter(p => p.id !== product.id);
    this.clearHighlight();
  }

  totalQuantity(): number {
    let total = 0;
    for (let i = 0; i < this.products.length; i++) {
      total += this.products[i].quantity;
    }
    return total;
  }

  closeSelect() {
    for (let i = 0; i < this.products.length; i++) {
      this.products[i].selected = false;
    }
  }

  openClose() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.closeSelect();
    }
  }

  isSelected(): boolean {
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].selected) {
        return true;
      }
    }
    return false;
  }

  async clearList() {
    this.clearHighlight();
    const toDelete = this.isOpen ? this.products.filter(p => p.selected) : this.products;
    const results = await Promise.allSettled(
      toDelete.map(p => firstValueFrom(this.api.deleteProduct(p.id)))
    );
    if (results.some(r => r.status === 'rejected')) {
      this.showError('Bazı ürünler silinemedi.');
    }
    this.isOpen = false;
    await this.loadProducts();
  }

  filterProducts(): Product[] {
    const searchText = this.searchProduct.trim().toLocaleLowerCase('tr');
    return this.products.filter(p => p.productName.toLocaleLowerCase('tr').includes(searchText));
  }
}