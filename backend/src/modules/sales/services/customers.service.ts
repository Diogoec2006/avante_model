import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customerRepository.findOne({
      where: { document_number: dto.document_number },
    });
    if (existing) {
      throw new ConflictException(
        `El cliente con documento ${dto.document_number} ya está registrado.`,
      );
    }
    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  async findAll(search?: string, sellerId?: string): Promise<Customer[]> {
    const qb = this.customerRepository.createQueryBuilder('c');
    if (search) {
      qb.where(
        '(LOWER(c.name) LIKE LOWER(:search) OR c.document_number LIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (sellerId) {
      qb.andWhere(
        '(c.assigned_seller_id = :sellerId OR c.document_number = :consumidorFinal OR c.assigned_seller_id IS NULL)',
        { sellerId, consumidorFinal: '9999999999' },
      );
    }
    qb.orderBy('c.name', 'ASC');
    return qb.getMany();
  }

  async reassign(
    id: string,
    newSellerId: string,
    newSellerName: string,
    notes: string,
  ): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.assigned_seller_id = newSellerId;
    customer.assigned_seller_name = newSellerName;
    customer.handoff_notes = notes;
    return this.customerRepository.save(customer);
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Cliente no encontrado`);
    }
    return customer;
  }

  async getCreditStatus(id: string) {
    const customer = await this.findOne(id);
    const limit = Number(customer.credit_limit);
    const debt = Number(customer.current_debt);
    const available = Math.max(0, limit - debt);

    return {
      customerId: customer.id,
      name: customer.name,
      documentNumber: customer.document_number,
      creditStatus: customer.credit_status,
      creditLimit: limit,
      currentDebt: debt,
      availableCredit: available,
      canPurchaseCredit: customer.credit_status === 'ACTIVE' && available > 0,
    };
  }
}

