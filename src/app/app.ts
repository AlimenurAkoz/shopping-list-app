import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from './models/product';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
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

  add() {
    if (this.objectName.trim() == '') {
      return;
    }
    const newProduct: Product = { id: this.counter, productName: this.objectName, quantity: 1, selected: false }
    this.products.push(newProduct);
    this.counter++;
    this.clean();
    this.save();
  }

  decrease(product: Product) {
    if (product.quantity > 1) {
      product.quantity--;
    }
    this.save();
  }
  increase(product: Product) {
    product.quantity++;
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