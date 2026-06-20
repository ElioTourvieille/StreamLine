import { Controller, Post, Get, Patch, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common'
import { OrganizationsService } from './organizations.service'
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Role, JwtPayload } from '../auth/dto/auth.dto'

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Post()
  @Roles(Role.STUDIO)
  create(@Body() dto: CreateOrganizationDto, @CurrentUser() user: JwtPayload) {
    return this.orgsService.create(dto, user)
  }

  @Get(':id')
  @Roles(Role.STUDIO)
  findOne(@Param('id') id: string) {
    return this.orgsService.findById(id)
  }

  @Get(':id/stats')
  @Roles(Role.STUDIO)
  getStats(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    if (user.organizationId !== id) throw new ForbiddenException()
    return this.orgsService.getStats(id)
  }

  @Get(':id/activity')
  @Roles(Role.STUDIO)
  getActivity(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    if (user.organizationId !== id) throw new ForbiddenException()
    return this.orgsService.getActivity(id)
  }

  @Get(':id/messages')
  @Roles(Role.STUDIO)
  getOrgMessages(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    if (user.organizationId !== id) throw new ForbiddenException()
    return this.orgsService.getOrgMessages(id)
  }

  @Patch(':id')
  @Roles(Role.STUDIO)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orgsService.update(id, dto, user)
  }
}
