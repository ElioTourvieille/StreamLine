import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { OrganizationsModule } from './organizations/organizations.module'
import { ClientsModule } from './clients/clients.module'
import { ProjectsModule } from './projects/projects.module'

@Module({
  imports: [DatabaseModule, AuthModule, OrganizationsModule, ClientsModule, ProjectsModule],
  controllers: [AppController],
})
export class AppModule {}
