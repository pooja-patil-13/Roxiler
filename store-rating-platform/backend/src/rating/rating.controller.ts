import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('rating')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('NORMAL_USER')
export class RatingController {
  constructor(
    private readonly ratingService: RatingService,
  ) {}

  @Post(':storeId')
  createRating(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateRatingDto,
    @Request() req: any,
  ) {
    return this.ratingService.createRating(
      req.user.userId,
      storeId,
      dto,
    );
  }

  @Patch(':storeId')
  updateRating(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateRatingDto,
    @Request() req: any,
  ) {
    return this.ratingService.updateRating(
      req.user.userId,
      storeId,
      dto,
    );
  }
}
