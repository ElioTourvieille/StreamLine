import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { PortalService } from './portal.service'
import { ValidateDeliverableDto } from '../deliverables/dto/deliverable.dto'

// Public controller — auth is the token itself, no JWT required. Tighter
// throttle than the API default: unauthenticated, so more attractive to
// abuse (token probing, scripted floods) than routes sitting behind a JWT.
const PORTAL_THROTTLE = { default: { limit: 20, ttl: 60_000 } }

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Throttle(PORTAL_THROTTLE)
  @Get(':token')
  getContext(@Param('token') token: string) {
    return this.portalService.getPortalContext(token)
  }

  @Throttle(PORTAL_THROTTLE)
  @Post(':token/deliverables/:id/validate')
  @HttpCode(HttpStatus.OK)
  validate(
    @Param('token') token: string,
    @Param('id') id: string,
    @Body() dto: ValidateDeliverableDto,
  ) {
    return this.portalService.validateDeliverable(token, id, dto)
  }

  @Throttle(PORTAL_THROTTLE)
  @Get(':token/deliverables/:id/file-url')
  getFileUrl(@Param('token') token: string, @Param('id') id: string) {
    return this.portalService.getDeliverableFileUrl(token, id)
  }
}
