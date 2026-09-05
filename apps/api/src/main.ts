import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1', {
    exclude: ['/api/docs', '/api/docs-json'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Compensation Intelligence System API')
    .setDescription(
      'Backend API for structured, comparable compensation data. All seed data is synthetic and does not represent real-world salaries.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}/api/v1`);
  logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
