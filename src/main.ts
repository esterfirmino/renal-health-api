
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
    credentials: false,
  });
  const config = new DocumentBuilder()
    .setTitle('Gerador de Atas API')
    .setDescription('API para gerenciamento de projetos, reuniões e geração automática de atas usando IA')
    .setVersion('1.0')
    .addTag('Projects', 'Operações relacionadas a projetos')
    .addTag('Meetings', 'Operações relacionadas a reuniões')
    .addTag('Summary', 'Operações relacionadas a atas de reunião')
    .addTag('Chat', 'Operações de chat e conversação com IA')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
