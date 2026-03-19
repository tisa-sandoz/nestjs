import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
  private products = [
    { id: 1, pdtname: 'mobile', price: 200000, isDeleted: false },
    { id: 2, pdtname: 'laptop', price: 300000, isDeleted: false },
    { id: 3, pdtname: 'tablet', price: 2500000, isDeleted: false },
  ];

  //fetch all products
  getProducts() {
    return this.products;
  }

  //getproduct by id
  getProductById(id: number) {
    return this.products.find((p) => p.id === id);
  }

  //create a product
  createProduct(data: { pdtname: string; price: number }) {
    const pdt = {
      id: Date.now(),
      isDeleted: false,
      ...data,
    };
    return pdt;
  }

  //put update the whole product
  updateProduct(id: number, data: { pdtname: string; price: number }) {
    const pdt = this.products.find((p) => p.id === id);
    if (!pdt) {
      throw new Error('no product');
    }
    pdt.pdtname = data.pdtname;
    pdt.price = Number(data.price);
  }

  //patch : update only some values of the product
  patchProduct(id: number, data: Partial<{ pdtname: string; price: number }>) {
    const pdt = this.products.find((p) => p.id === id);
    if (!pdt) {
      throw new Error('pdt not found');
    }

    if (data.pdtname !== undefined) {
      pdt.pdtname = data.pdtname;
    }
    if (data.price !== undefined) {
      pdt.price = data.price;
    }

    return pdt;
  }

  deleteProduct(id: number) {
    const pdt = this.products.find((p) => p.id === id);
    if (!pdt) {
      throw new Error('Product not found');
    }
    pdt.isDeleted = true;
    return pdt;
  }
}
