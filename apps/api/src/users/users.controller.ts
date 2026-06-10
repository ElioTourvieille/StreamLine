import {
  Controller, Get, Patch, Post, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateProfileDto, AddMemberDto } from './dto/user.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Role, JwtPayload } from '../auth/dto/auth.dto'

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Profile ───────────────────────────────────────────────────────────

  @Get('users/me')
  me(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub)
  }

  @Patch('users/me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto)
  }

  @Get('users/:id')
  @Roles(Role.STUDIO)
  getUser(@Param('id') id: string) {
    return this.usersService.getProfile(id)
  }

  @Get('organizations/:orgId/members')
  @Roles(Role.STUDIO)
  listOrgMembers(@Param('orgId') orgId: string, @CurrentUser() user: JwtPayload) {
    if (user.organizationId !== orgId) throw new Error('Forbidden')
    return this.usersService.listOrgMembers(orgId)
  }

  // ─── Project membership ────────────────────────────────────────────────

  @Get('projects/:projectId/members')
  @Roles(Role.STUDIO, Role.CLIENT)
  listProjectMembers(@Param('projectId') projectId: string) {
    return this.usersService.listProjectMembers(projectId)
  }

  @Post('projects/:projectId/members')
  @Roles(Role.STUDIO)
  addMember(
    @Param('projectId') projectId: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.addProjectMember(projectId, dto, user)
  }

  @Delete('projects/:projectId/members/:userId')
  @Roles(Role.STUDIO)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.removeProjectMember(projectId, userId, user)
  }
}
