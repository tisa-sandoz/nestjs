import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}
  @Get()
  getProduct() {
    return this.productService.getProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(Number(id));
  }

  @Post()
  postProduct(@Body() data: { pdtname: string; price: number }) {
    return this.productService.createProduct(data);
  }

  @Put(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() data: { pdtname: string; price: number },
  ) {
    return this.productService.updateProduct(Number(id), data);
  }
}
