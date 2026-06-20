import {
  Controller, Post, Get, Patch, Delete, Body,
  Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { CreateProjectDto, UpdateProjectDto, UpdateMilestoneDto, MilestoneDto } from './dto/project.dto'
import { CreateMessageDto } from './dto/message.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Role, JwtPayload } from '../auth/dto/auth.dto'

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(Role.STUDIO)
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: JwtPayload) {
    return this.projectsService.create(dto, user)
  }

  @Get()
  @Roles(Role.STUDIO)
  findAll(@Query('clientId') clientId: string | undefined, @CurrentUser() user: JwtPayload) {
    return this.projectsService.findAll(user, clientId)
  }

  @Get(':id')
  @Roles(Role.STUDIO, Role.CLIENT)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.projectsService.findById(id, user)
  }

  @Patch(':id')
  @Roles(Role.STUDIO)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.update(id, dto, user)
  }

  @Delete(':id')
  @Roles(Role.STUDIO)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.projectsService.remove(id, user)
  }

  @Post(':id/milestones')
  @Roles(Role.STUDIO)
  addMilestone(
    @Param('id') id: string,
    @Body() dto: MilestoneDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.addMilestone(id, dto, user)
  }

  @Patch(':id/milestones/:milestoneId')
  @Roles(Role.STUDIO)
  updateMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdateMilestoneDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.updateMilestone(id, milestoneId, dto, user)
  }

  @Get(':id/messages')
  @Roles(Role.STUDIO)
  getMessages(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.projectsService.getMessages(id, user)
  }

  @Post(':id/messages')
  @Roles(Role.STUDIO)
  createMessage(
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.createMessage(id, dto, user)
  }
}
