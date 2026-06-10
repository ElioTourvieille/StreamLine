import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { PortalService } from './portal.service'
import { ValidateDeliverableDto } from '../deliverables/dto/deliverable.dto'

// Public controller — auth is the token itself, no JWT required
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get(':token')
  getContext(@Param('token') token: string) {
    return this.portalService.getPortalContext(token)
  }

  @Post(':token/deliverables/:id/validate')
  @HttpCode(HttpStatus.OK)
  validate(
    @Param('token') token: string,
    @Param('id') id: string,
    @Body() dto: ValidateDeliverableDto,
  ) {
    return this.portalService.validateDeliverable(token, id, dto)
  }
}
