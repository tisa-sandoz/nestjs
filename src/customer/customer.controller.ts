import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer } from './interface/customer';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  getCustomers(): Customer[] {
    return this.customerService.getAllCustomers();
  }

  @Get(':id')
  getCustomerById(@Param('id') id: number): Customer | undefined {
    return this.customerService.getCustomerById(Number(id));
  }

  @Post()
  createCustomer(@Body() data: CreateCustomerDto) {
    return this.customerService.createCustomer(data);
  }
}
