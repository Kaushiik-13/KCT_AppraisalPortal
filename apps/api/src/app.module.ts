import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FrameworkStudioModule } from './modules/framework-studio/framework-studio.module';
import { IdentityModule } from './modules/identity/identity.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { PredictionModule } from './modules/prediction/prediction.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';

@Module({
  controllers: [HealthController],
  imports: [
    IdentityModule,
    OrganizationModule,
    FrameworkStudioModule,
    PredictionModule,
    RecommendationModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
