
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Query } from '@nestjs/common';
import { UserQueryDto } from './dto/user-query.dto';
import { AdminStoreQueryDto } from './dto/store-query.dto';

import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }
  @Post('stores')
createStore(@Body() dto: CreateStoreDto) {
  return this.adminService.createStore(dto);
}
@Get('dashboard')
getDashboard() {
  return this.adminService.getDashboard();
}
@Get('users')
getUsers(@Query() query: UserQueryDto) {
  return this.adminService.getUsers(query);
}
@Get('stores')
getStores(@Query() query: AdminStoreQueryDto) {
  return this.adminService.getStores(query);
}

}