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
  }

  decrease(product: Product) {
    if (product.quantity > 1) {
      product.quantity--;
    }
  }
  increase(product: Product) {
    product.quantity++;
  }
  
  indexSort(){
    for (let i = 0; i < this.products.length; i++) {
      this.products[i].id = i + 1;
    }
    this.counter = this.products.length + 1;
  }

  delete(product: Product) {
    const index = this.products.findIndex(p => p.id == product.id);
    this.products.splice(index, 1);
    this.indexSort();
  }

  totalQuantity(): number {
    let total = 0;
    for(let i = 0; i < this.products.length; i++){
      total += this.products[i].quantity;
    }
    return total;
  }

  openClose(){
    this.isOpen = !this.isOpen;
    if(!this.isSelected){
      for (let i = 0; i < this.products.length; i++) {
        this.products[i].selected = false;
      }
    }
  }

  isSelected(): boolean{
    for(let i= 0; i < this.products.length; i++){
      if(this.products[i].selected){
        return true;
      }
    }
    return false;
  }

  clearList(){
    if(this.isOpen){
      this.products = this.products.filter(p => !p.selected);
      this.indexSort();
      this.isOpen = false;
    }else{
      this.products.length = 0;
      this.counter = 1;
    }
  }
}