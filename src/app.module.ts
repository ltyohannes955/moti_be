import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductsModule } from './products/products.module';
import { ProjectCategoriesModule } from './project-categories/project-categories.module';
import { ProjectsModule } from './projects/projects.module';
import { BlogPostsModule } from './blog-posts/blog-posts.module';
import { BlogCategoriesModule } from './blog-categories/blog-categories.module';
import { BlogTagsModule } from './blog-tags/blog-tags.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { CareersModule } from './careers/careers.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { CoffeeTypesModule } from './coffee-types/coffee-types.module';
import { ClientsModule } from './clients/clients.module';
import { DepartmentsModule } from './departments/departments.module';
import { TeamModule } from './team/team.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CommonModule,
    AuthModule,
    UsersModule,
    AdminModule,
    ProductCategoriesModule,
    ProductsModule,
    ProjectCategoriesModule,
    ProjectsModule,
    BlogPostsModule,
    BlogCategoriesModule,
    BlogTagsModule,
    ContactMessagesModule,
    CareersModule,
    TestimonialsModule,
    CoffeeTypesModule,
    ClientsModule,
    DepartmentsModule,
    TeamModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          transformOptions: { enableImplicitConversion: true },
          whitelist: true,
        }),
    },
  ],
})
export class AppModule {}
