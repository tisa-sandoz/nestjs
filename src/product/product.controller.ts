import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { SessionAuthGuard } from 'src/common/guards/session-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('product')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(Role.USER, Role.ADMIN)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  @Roles(Role.ADMIN)
  postProduct(@Body() data: CreateProductDto) {
    return this.productService.createProduct(data);
  }

  @Get()
  getProduct() {
    return this.productService.getProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  updateProduct(@Param('id') id: string, @Body() data: CreateProductDto) {
    return this.productService.updateProduct(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }
}
