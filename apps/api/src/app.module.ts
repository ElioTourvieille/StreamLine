import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { SentryModule, SentryGlobalFilter } from '@sentry/nestjs/setup'
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
    // Must come first — wires up Sentry's request/error interceptors.
    // No-ops cleanly when SENTRY_DSN isn't set (see instrument.ts).
    SentryModule.forRoot(),
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
  providers: [
    // Registered before other filters so Sentry sees exceptions first.
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
