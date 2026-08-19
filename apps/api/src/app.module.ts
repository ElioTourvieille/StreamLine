import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { OrganizationsModule } from './organizations/organizations.module'
import { ClientsModule } from './clients/clients.module'
import { ProjectsModule } from './projects/projects.module'
import { UsersModule } from './users/users.module'
import { NotificationsModule } from './notifications/notifications.module'
import { DeliverablesModule } from './deliverables/deliverables.module'
import { PortalModule } from './portal/portal.module'

@Module({
  imports: [
    // Baseline rate limit applied API-wide; routes that need something
    // stricter (e.g. the public portal) override it with @Throttle().
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    DatabaseModule,
    NotificationsModule,
    AuthModule,
    OrganizationsModule,
    ClientsModule,
    ProjectsModule,
    UsersModule,
    DeliverablesModule,
    PortalModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
