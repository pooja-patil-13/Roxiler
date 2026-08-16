import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StoreQueryDto } from './dto/store-query.dto';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async getStores(query: StoreQueryDto, userId: number) {
    const { search, sort, page = 1, limit = 10 } = query;

    const where: Prisma.StoreWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const total = await this.prisma.store.count({ where });
    const skip = (page - 1) * limit;

    let rows: {
      id: number;
      name: string;
      email: string;
      address: string;
      averageRating: number;
      totalRatings: number;
    }[];

    if (sort === 'rating') {
      // Sorting by an aggregate (average rating) requires the DB to do the
      // grouping/ordering itself, otherwise we'd have to pull every store's
      // ratings into memory just to sort a page of results.
      rows = await this.prisma.$queryRaw<typeof rows>(Prisma.sql`
        SELECT
          s.id,
          s.name,
          s.email,
          s.address,
          COALESCE(AVG(r.rating), 0)::float AS "averageRating",
          COUNT(r.id)::int AS "totalRatings"
        FROM "Store" s
        LEFT JOIN "Rating" r ON r."storeId" = s.id
        ${
          search
            ? Prisma.sql`WHERE s.name ILIKE ${'%' + search + '%'} OR s.address ILIKE ${'%' + search + '%'}`
            : Prisma.empty
        }
        GROUP BY s.id
        ORDER BY "averageRating" DESC
        LIMIT ${limit} OFFSET ${skip}
      `);
    } else {
      const stores = await this.prisma.store.findMany({
        where,
        orderBy: sort === 'name' ? { name: 'asc' } : { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const storeIds = stores.map((store) => store.id);

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

      rows = stores.map((store) => ({
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating:
          aggregateByStoreId.get(store.id)?.averageRating ?? 0,
        totalRatings: aggregateByStoreId.get(store.id)?.totalRatings ?? 0,
      }));
    }

    const rowStoreIds = rows.map((row) => row.id);

    const userRatings = rowStoreIds.length
      ? await this.prisma.rating.findMany({
          where: { userId, storeId: { in: rowStoreIds } },
          select: { storeId: true, rating: true },
        })
      : [];

    const userRatingByStoreId = new Map(
      userRatings.map((r) => [r.storeId, r.rating]),
    );

    const data = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      averageRating: Number(Number(row.averageRating).toFixed(1)),
      userRating: userRatingByStoreId.get(row.id) ?? null,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOwnerDashboard(ownerId: number) {
    const store = await this.prisma.store.findFirst({
      where: {
        ownerId,
      },
      include: {
        ratings: {
          include: {
            user: {
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
        },
      },
    });

    if (!store) {
      return {
        message: 'No store found for this owner',
      };
    }

    const totalRatings = store.ratings.length;

    const averageRating =
      totalRatings === 0
        ? 0
        : store.ratings.reduce(
            (sum, item) => sum + item.rating,
            0,
          ) / totalRatings;

    return {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      summary: {
        totalRatings,
        averageRating: Number(
          averageRating.toFixed(1),
        ),
      },
      ratings: store.ratings.map((rating) => ({
        id: rating.id,
        rating: rating.rating,
        createdAt: rating.createdAt,
        user: rating.user,
      })),
    };
  }
}
