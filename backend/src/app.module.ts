import { Module } from '@nestjs/common';
import { Neo4jModule, Neo4jScheme } from 'nest-neo4j';
import { MemoryModule } from './memory/memory.module';
import { config } from '../config/config';

@Module({
  imports: [
    Neo4jModule.forRoot({
      scheme: config.NEO4J_SCHEME as Neo4jScheme,
      host: config.NEO4J_HOST,
      port: config.NEO4J_PORT,
      username: config.NEO4J_USERNAME,
      password: config.NEO4J_PASSWORD,
    }),
    MemoryModule,
  ],
})
export class AppModule {}
