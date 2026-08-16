import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { StoreService } from './store.service';
import { StoreQueryDto } from './dto/store-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('stores')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getStores(
    @Query() query: StoreQueryDto,
    @Request() req: any,
  ) {
    return this.storeService.getStores(
      query,
      req.user.userId,
    );
  }

  @Get('owner/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STORE_OWNER')
  getOwnerDashboard(@Request() req: any) {
    return this.storeService.getOwnerDashboard(
      req.user.userId,
    );
  }
}