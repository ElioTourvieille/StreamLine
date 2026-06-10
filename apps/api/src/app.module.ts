import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { OrganizationsModule } from './organizations/organizations.module'
import { ClientsModule } from './clients/clients.module'

@Module({
  imports: [DatabaseModule, AuthModule, OrganizationsModule, ClientsModule],
  controllers: [AppController],
})
export class AppModule {}
