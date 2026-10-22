import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';
//import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from './models/product';
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
  counter: number = 1;
  isOpen = false;
  searchProduct = '';
  private cdr = inject(ChangeDetectorRef);
  highlightedId: number | null = null;
  private highlightTime?: ReturnType<typeof setTimeout>;
  constructor() {
    const record = sessionStorage.getItem("products");
    if (record) {
      this.products = JSON.parse(record);
      this.counter = this.products.length + 1;
      this.closeSelect();
    }
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
    const newProduct: Product = { id: this.counter, productName: this.objectName, quantity: 1, selected: false }
    this.products.push(newProduct);
    this.counter++;
    this.clean();
    this.save();
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
      cancelButtonColor: '#D7E6CF',
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

  decrease(product: Product) {
    if (product.quantity > 1) {
      product.quantity--;
    }
    this.save();
  }
  increase(product: Product) {
    product.quantity++;
    if (product.id == this.highlightedId) {
      this.clearHighlight();
    }
    this.save();
  }

  indexSort() {
    for (let i = 0; i < this.products.length; i++) {
      this.products[i].id = i + 1;
    }
    this.counter = this.products.length + 1;
  }

  delete(product: Product) {
    const index = this.products.findIndex(p => p.id == product.id);
    this.products.splice(index, 1);
    this.clearHighlight();
    this.indexSort();
    this.save();
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

  clearList() {
    this.clearHighlight();
    if (this.isOpen) {
      this.products = this.products.filter(p => !p.selected);
      this.indexSort();
      this.isOpen = false;
    } else {
      this.products.length = 0;
      this.counter = 1;
    }
    this.save();
  }

  filterProducts(): Product[] {
    const searchText = this.searchProduct.trim().toLocaleLowerCase('tr');
    return this.products.filter(p => p.productName.toLocaleLowerCase('tr').includes(searchText));
  }

  save() {
    sessionStorage.setItem('products', JSON.stringify(this.products));
  }
}