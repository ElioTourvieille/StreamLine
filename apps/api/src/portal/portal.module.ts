import { Module } from '@nestjs/common'
import { PortalController } from './portal.controller'
import { PortalService } from './portal.service'
import { DeliverablesModule } from '../deliverables/deliverables.module'

@Module({
  imports: [DeliverablesModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
