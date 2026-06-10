import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ClientsService } from './clients.service'
import { CreateClientDto, UpdateClientDto, InviteClientDto } from './dto/client.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Role, JwtPayload } from '../auth/dto/auth.dto'

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(Role.STUDIO)
  create(@Body() dto: CreateClientDto, @CurrentUser() user: JwtPayload) {
    return this.clientsService.create(dto, user)
  }

  @Get()
  @Roles(Role.STUDIO)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.clientsService.findAll(user)
  }

  @Get(':id')
  @Roles(Role.STUDIO, Role.CLIENT)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientsService.findById(id, user)
  }

  @Patch(':id')
  @Roles(Role.STUDIO)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clientsService.update(id, dto, user)
  }

  @Delete(':id')
  @Roles(Role.STUDIO)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientsService.remove(id, user)
  }

  @Post(':id/invite')
  @Roles(Role.STUDIO)
  invite(
    @Param('id') id: string,
    @Body() dto: InviteClientDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clientsService.invite(id, dto, user)
  }
}
