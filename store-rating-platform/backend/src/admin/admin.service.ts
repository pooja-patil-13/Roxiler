import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserQueryDto } from './dto/user-query.dto';
import { AdminStoreQueryDto } from './dto/store-query.dto';

import { PrismaService } from '../prisma/prisma.service';

import {
  AdminCreatableRole,
  CreateUserDto,
} from './dto/create-user.dto';

import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        address: dto.address,
        password: hashedPassword,
        role: dto.role as AdminCreatableRole,
      },
    });

    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    };
  }

  async createStore(dto: CreateStoreDto) {
    const existingStore = await this.prisma.store.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingStore) {
      throw new BadRequestException('Store email already registered');
    }

    const owner = await this.prisma.user.findUnique({
      where: {
        id: dto.ownerId,
      },
    });

    if (!owner) {
      throw new BadRequestException('Store owner not found');
    }

    if (owner.role !== 'STORE_OWNER') {
      throw new BadRequestException(
        'Selected user is not a STORE_OWNER',
      );
    }

    const store = await this.prisma.store.create({
      data: {
        name: dto.name,
        email: dto.email,
        address: dto.address,
        ownerId: dto.ownerId,
      },
    });

    return {
      message: 'Store created successfully',
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
      },
    };
  }

  async getDashboard() {
    const [totalUsers, totalStores, totalRatings] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.store.count(),
        this.prisma.rating.count(),
      ]);

    return {
      totalUsers,
      totalStores,
      totalRatings,
    };
  }

  async getUsers(query: UserQueryDto) {
    const { search, role, page = 1, limit = 10 } = query;

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { address: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(role ? { role } : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStores(query: AdminStoreQueryDto) {
    const { search, page = 1, limit = 10 } = query;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { address: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.store.count({ where }),
    ]);

    const storeIds = stores.map((store) => store.id);

    // Aggregate ratings in the database instead of pulling every rating
    // row for every store into memory.
    const aggregates = storeIds.length
      ? await this.prisma.rating.groupBy({
          by: ['storeId'],
          where: { storeId: { in: storeIds } },
          _avg: { rating: true },
          _count: { rating: true },
        })
      : [];

    const aggregateByStoreId = new Map(
      aggregates.map((agg) => [
        agg.storeId,
        {
          averageRating: agg._avg.rating ?? 0,
          totalRatings: agg._count.rating,
        },
      ]),
    );

    return {
      data: stores.map((store) => {
        const agg = aggregateByStoreId.get(store.id);

        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          owner: store.owner,
          totalRatings: agg?.totalRatings ?? 0,
          averageRating: Number((agg?.averageRating ?? 0).toFixed(1)),
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
