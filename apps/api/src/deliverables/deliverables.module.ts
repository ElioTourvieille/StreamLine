import { Module } from '@nestjs/common'
import { DeliverablesController } from './deliverables.controller'
import { DeliverablesService } from './deliverables.service'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [StorageModule],
  controllers: [DeliverablesController],
  providers: [DeliverablesService],
  exports: [DeliverablesService],
})
export class DeliverablesModule {}
