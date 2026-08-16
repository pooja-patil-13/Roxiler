import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}

  async createRating(
    userId: number,
    storeId: number,
    dto: CreateRatingDto,
  ) {
    const store = await this.prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });

    if (!store) {
      throw new BadRequestException('Store not found');
    }

    const existingRating = await this.prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (existingRating) {
      throw new BadRequestException(
        'You have already rated this store',
      );
    }

    const rating = await this.prisma.rating.create({
      data: {
        rating: dto.rating,
        userId,
        storeId,
      },
    });

    return {
      message: 'Rating submitted successfully',
      rating,
    };
  }

  async updateRating(
    userId: number,
    storeId: number,
    dto: CreateRatingDto,
  ) {
    const existingRating = await this.prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (!existingRating) {
      throw new BadRequestException(
        'You have not rated this store yet',
      );
    }

    const rating = await this.prisma.rating.update({
      where: {
        id: existingRating.id,
      },
      data: {
        rating: dto.rating,
      },
    });

    return {
      message: 'Rating updated successfully',
      rating,
    };
  }
}