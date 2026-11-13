import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Role } from '../../../common/enums';
import { StockMovement } from '../entities/stock-movement.entity';
import { MovementType } from '../../../common/enums';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,
  ) {}

  async create(createProductDto: CreateProductDto, userId?: string): Promise<Product> {
    const existingSku = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });
    if (existingSku) {
      throw new ConflictException(`El SKU '${createProductDto.sku}' ya está registrado.`);
    }

    const existingBarcode = await this.productRepository.findOne({
      where: { barcode: createProductDto.barcode },
    });
    if (existingBarcode) {
      throw new ConflictException(`El código de barras '${createProductDto.barcode}' ya está registrado.`);
    }

    if (createProductDto.sale_price < createProductDto.cost_price) {
      throw new BadRequestException('El precio de venta no puede ser inferior al costo de compra.');
    }

    const initialStock = createProductDto.initial_stock || 0;

    const product = this.productRepository.create({
      ...createProductDto,
      current_stock: initialStock,
    });

    const saved = await this.productRepository.save(product);

    // Si tiene stock inicial, registrar movimiento de entrada
    if (initialStock > 0) {
      await this.movementRepository.save(
        this.movementRepository.create({
          product_id: saved.id,
          user_id: userId,
          movement_type: MovementType.IN_ADJUST,
          quantity: initialStock,
          previous_stock: 0,
          new_stock: initialStock,
          unit_cost: saved.cost_price,
          reason: 'Inventario inicial de apertura de producto',
          reference_id: `INIT-${saved.sku}`,
        }),
      );
    }

    return saved;
  }

  async findAll(userRole?: Role, search?: string, categoryId?: string): Promise<Product[]> {
    const qb = this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .where('p.is_active = :active', { active: true });

    if (search) {
      qb.andWhere(
        '(LOWER(p.name) LIKE LOWER(:search) OR p.barcode LIKE :search OR LOWER(p.sku) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      qb.andWhere('p.category_id = :categoryId', { categoryId });
    }

    qb.orderBy('p.name', 'ASC');

    const products = await qb.getMany();

    // Enmascarar costo si el rol es VENDEDOR
    if (userRole === Role.VENDEDOR) {
      return products.map((p) => {
        const copy = { ...p };
        delete copy.cost_price;
        return copy;
      });
    }

    return products;
  }

  async findOne(id: string, userRole?: Role): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    if (userRole === Role.VENDEDOR) {
      delete product.cost_price;
    }

    return product;
  }

  async findByBarcodeOrSku(term: string, userRole?: Role): Promise<Product> {
    const product = await this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .where('p.is_active = true')
      .andWhere('(p.barcode = :term OR p.sku = :term)', { term })
      .getOne();

    if (!product) {
      throw new NotFoundException(`Producto '${term}' no encontrado`);
    }

    if (userRole === Role.VENDEDOR) {
      delete product.cost_price;
    }

    return product;
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (
      updateDto.sale_price !== undefined &&
      updateDto.cost_price !== undefined &&
      updateDto.sale_price < updateDto.cost_price
    ) {
      throw new BadRequestException('El precio de venta no puede ser inferior al costo.');
    }

    Object.assign(product, updateDto);
    return this.productRepository.save(product);
  }

  async getLowStockAlerts(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .where('p.is_active = true')
      .andWhere('p.current_stock <= p.min_stock')
      .orderBy('p.current_stock', 'ASC')
      .getMany();
  }
}

