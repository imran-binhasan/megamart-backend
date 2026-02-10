import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import {
  RequirePermissions,
  RequireResource,
  Public,
} from 'src/core/auth/decorator/auth.decorator';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { NotificationService } from '../service/notification.service';
import { NotificationQueryDto } from '../dto/query.notification.dto';
import { MarkAsReadDto } from '../dto/read-notificaion.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @RequireResource('notification', 'create')
  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @RequirePermissions('read:notification')
  @Get()
  async findAll(@Query() query: NotificationQueryDto) {
    return this.notificationService.findAll(query);
  }

  @RequirePermissions('read:notification')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.findOne(id);
  }

  @RequireResource('notification', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @RequireResource('notification', 'delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.remove(id);
  }

  @RequireResource('notification', 'manage')
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.restore(id);
  }

  // Send notification to customers
  @RequireResource('notification', 'create')
  @Post(':id/send')
  async sendNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() sendNotificationDto: SendNotificationDto,
  ) {
    return this.notificationService.sendNotification(id, sendNotificationDto);
  }

  // Broadcast notification to all customers
  @RequireResource('notification', 'create')
  @Post(':id/broadcast')
  async broadcastNotification(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.broadcastNotification(id);
  }

  // Customer notification endpoints
  @Public()
  @Get('customer/:customerId')
  async getCustomerNotifications(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationService.getCustomerNotifications(customerId, query);
  }

  @Public()
  @Get('customer/:customerId/unread')
  async getUnreadNotifications(
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.notificationService.getUnreadNotifications(customerId);
  }

  @Public()
  @Get('customer/:customerId/count')
  async getNotificationCounts(
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.notificationService.getNotificationCounts(customerId);
  }

  @Public()
  @Patch('customer/:customerId/mark-as-read')
  async markNotificationsAsRead(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() markAsReadDto: MarkAsReadDto,
  ) {
    return this.notificationService.markAsRead(customerId, markAsReadDto);
  }

  @Public()
  @Patch('customer/:customerId/mark-all-as-read')
  async markAllAsRead(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.notificationService.markAllAsRead(customerId);
  }

  // Statistics endpoints
  @RequirePermissions('read:notification')
  @Get('stats/count')
  async getNotificationsCount() {
    const result = await this.notificationService.getNotificationsCount();
    return { count: result };
  }

  @RequirePermissions('read:notification')
  @Get('stats/recent')
  async getRecentNotifications(@Query('days') days: number = 7) {
    return this.notificationService.getRecentNotifications(days);
  }
}
