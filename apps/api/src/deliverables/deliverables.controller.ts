import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common'
import { DeliverablesService } from './deliverables.service'
import { CreateDeliverableDto, RequestUploadUrlDto } from './dto/deliverable.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Role, JwtPayload } from '../auth/dto/auth.dto'

@Controller('deliverables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliverablesController {
  constructor(private readonly svc: DeliverablesService) {}

  @Post()
  @Roles(Role.STUDIO)
  create(@Body() dto: CreateDeliverableDto, @CurrentUser() user: JwtPayload) {
    return this.svc.create(dto, user)
  }

  @Post('upload-url')
  @Roles(Role.STUDIO)
  requestUploadUrl(@Body() dto: RequestUploadUrlDto, @CurrentUser() user: JwtPayload) {
    return this.svc.requestUploadUrl(dto, user)
  }

  @Get()
  @Roles(Role.STUDIO, Role.CLIENT)
  findByProject(@Query('projectId') projectId: string, @CurrentUser() user: JwtPayload) {
    return this.svc.findByProject(projectId, user)
  }

  @Get(':id')
  @Roles(Role.STUDIO, Role.CLIENT)
  findOne(@Param('id') id: string) {
    return this.svc.findById(id)
  }

  @Get(':id/file-url')
  @Roles(Role.STUDIO, Role.CLIENT)
  getFileUrl(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.svc.getFileUrl(id, user)
  }
}
