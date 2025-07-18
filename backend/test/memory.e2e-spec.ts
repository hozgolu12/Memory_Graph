import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('MemoryController (e2e)', () => {
  let app: INestApplication;
  let memoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/memory (POST) should create a memory', () => {
    return request(app.getHttpServer())
      .post('/memory')
      .send({
        text: 'Test Memory',
        date: '2025-07-17T12:00:00Z',
        emotion: 'joy',
        userId: 'testUser123',
        people: [{ name: 'John Doe' }],
        places: [{ name: 'Test Location' }],
        photos: [{ url: 'http://example.com/photo.jpg' }],
        linkedMemories: [],
      })
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty('id');
        memoryId = res.body.id;
      });
  });

  it('/memory/:id (PATCH) should update a memory', () => {
    return request(app.getHttpServer())
      .patch(`/memory/${memoryId}`)
      .send({
        text: 'Updated Test Memory',
        emotion: 'sadness',
        people: [{ name: 'Jane Doe' }],
        places: [{ name: 'Updated Location' }],
      })
      .expect(200)
      .then((res) => {
        expect(res.body.text).toEqual('Updated Test Memory');
        expect(res.body.emotion).toEqual('sadness');
        expect(res.body.people[0].name).toEqual('Jane Doe');
        expect(res.body.places[0].name).toEqual('Updated Location');
      });
  });

  it('/memory/:id (DELETE) should delete a memory', () => {
    return request(app.getHttpServer())
      .delete(`/memory/${memoryId}`)
      .expect(200)
      .then((res) => {
        expect(res.body.message).toEqual('Memory deleted successfully');
      });
  });
});
