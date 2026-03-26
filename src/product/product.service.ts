import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: CreateProductDto): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        ...data,
      },
    });
    return product;
  }

  async getProducts(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { isDeleted: false },
    });
    return products;
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateProduct(id: string, data: CreateProductDto): Promise<Product> {
    const existing = await this.prisma.product.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        description: data.description,
      },
    });
  }

  async deleteProduct(id: string): Promise<Product> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing || existing.isDeleted) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
