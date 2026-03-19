import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './interface/customer';

@Injectable()
export class CustomerService {
  private customers: Customer[] = [];

  //when a function is written specify its input dto and return type that may be interface or type
  //here the input is createcustomerdto and teh function return type is Customer
  createCustomer(data: CreateCustomerDto): Customer {
    const customer: Customer = {
      id: Date.now(),
      ...data,
    };
    this.customers.push(customer);
    return customer;
  }

  //here the function returns an array of customers hence we have given the []
  getAllCustomers(): Customer[] {
    return this.customers;
  }

  getCustomerById(id: number): Customer | undefined {
    const customer = this.customers.find((c) => c.id === id);
    return customer;
  }
}
