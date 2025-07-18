/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';

@Injectable()
export class MemoryService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async create(createMemoryDto: CreateMemoryDto): Promise<any> {
    const {
      text,
      date,
      emotion,
      userId,
      people,
      places,
      photos,
      linkedMemories,
    } = createMemoryDto;

    const result = await this.neo4jService.write(
      `CREATE (m:Memory {text: $text, date: $date, emotion: $emotion, userId: $userId}) RETURN m`,
      { text, date, emotion, userId },
    );
    const memoryNode = result.records[0]?.get('m');
    const memoryId = memoryNode.identity.low;

    // Create relationships for people
    for (const person of people) {
      await this.neo4jService.write(
        `MATCH (m:Memory) WHERE id(m) = $memoryId
         MERGE (p:Person {name: $personName})
         CREATE (m)-[:INVOLVES_PERSON]->(p)`,
        { memoryId, personName: person.name },
      );
    }

    // Create relationships for places
    for (const place of places) {
      await this.neo4jService.write(
        `MATCH (m:Memory) WHERE id(m) = $memoryId
         MERGE (pl:Place {name: $placeName})
         CREATE (m)-[:OCCURRED_AT]->(pl)`,
        { memoryId, placeName: place.name },
      );
    }

    // Create relationships for linked memories (only allow linking to memories of the same user)
    for (const linkedMemoryId of linkedMemories) {
      await this.neo4jService.write(
        `MATCH (m1:Memory), (m2:Memory)
         WHERE id(m1) = $memoryId AND id(m2) = $linkedMemoryId AND m2.userId = $userId
         CREATE (m1)-[:RELATED_TO]->(m2)`,
        { memoryId, linkedMemoryId: parseInt(linkedMemoryId), userId },
      );
    }

    // Handle photos (assuming photos are stored as properties or separate nodes if more complex)
    // For now, just store URLs as a property on the memory node
    if (photos && photos.length > 0) {
      await this.neo4jService.write(
        `MATCH (m:Memory) WHERE id(m) = $memoryId
         SET m.photos = $photos`,
        { memoryId, photos: photos.map((p) => p.url) },
      );
    }

    return memoryNode ? { id: memoryId, ...memoryNode.properties } : null;
  }

  async findAll(userId: string): Promise<any> {
    const result = await this.neo4jService.read(
      `MATCH (m:Memory {userId: $userId})
       OPTIONAL MATCH (m)-[:INVOLVES_PERSON]->(p:Person)
       OPTIONAL MATCH (m)-[:OCCURRED_AT]->(pl:Place)
       OPTIONAL MATCH (m)-[:RELATED_TO]->(lm:Memory {userId: $userId})
       RETURN m, COLLECT(DISTINCT p) AS people, COLLECT(DISTINCT pl) AS places, COLLECT(DISTINCT lm) AS linkedMemories`,
      { userId },
    );
    return result.records.map((record) => {
      const memory = record.get('m').properties;
      const people = record
        .get('people')
        .map((p: any) => ({ id: p.identity.low, name: p.properties.name }));
      const places = record
        .get('places')
        .map((pl: any) => ({ id: pl.identity.low, name: pl.properties.name }));
      const linkedMemories = record
        .get('linkedMemories')
        .map((lm: any) => lm.identity.low);
      return {
        ...memory,
        id: record.get('m').identity.low,
        people,
        places,
        linkedMemories,
      };
    });
  }

  async findOne(id: string, userId: string): Promise<any> {
    const result = await this.neo4jService.read(
      `MATCH (m:Memory {userId: $userId}) WHERE id(m) = $id
       OPTIONAL MATCH (m)-[:INVOLVES_PERSON]->(p:Person)
       OPTIONAL MATCH (m)-[:OCCURRED_AT]->(pl:Place)
       OPTIONAL MATCH (m)-[:RELATED_TO]->(lm:Memory {userId: $userId})
       RETURN m, COLLECT(DISTINCT p) AS people, COLLECT(DISTINCT pl) AS places, COLLECT(DISTINCT lm) AS linkedMemories`,
      { id: parseInt(id), userId },
    );
    const record = result.records[0];
    if (!record) return null;

    const memory = record.get('m').properties;
    const people = record
      .get('people')
      .map((p: any) => ({ id: p.identity.low, name: p.properties.name }));
    const places = record
      .get('places')
      .map((pl: any) => ({ id: pl.identity.low, name: pl.properties.name }));
    const linkedMemories = record
      .get('linkedMemories')
      .map((lm: any) => lm.identity.low);
    return {
      ...memory,
      id: record.get('m').identity.low,
      people,
      places,
      linkedMemories,
    };
  }

  async update(
    id: string,
    updateMemoryDto: UpdateMemoryDto,
    userId: string,
  ): Promise<any> {
    const { text, date, emotion, people, places, photos, linkedMemories } =
      updateMemoryDto;

    // First, verify that the memory belongs to the user
    const existingMemory = await this.neo4jService.read(
      `MATCH (m:Memory {userId: $userId}) WHERE id(m) = $id RETURN m`,
      { id: parseInt(id), userId },
    );

    if (!existingMemory.records.length) {
      throw new Error('Memory not found or access denied');
    }

    // Update memory properties
    const updateFields: string[] = [];
    const updateParams: Record<string, any> = { id: parseInt(id), userId };

    if (text !== undefined) {
      updateFields.push('m.text = $text');
      updateParams.text = text;
    }
    if (date !== undefined) {
      updateFields.push('m.date = $date');
      updateParams.date = date;
    }
    if (emotion !== undefined) {
      updateFields.push('m.emotion = $emotion');
      updateParams.emotion = emotion;
    }

    if (updateFields.length > 0) {
      await this.neo4jService.write(
        `MATCH (m:Memory {userId: $userId}) WHERE id(m) = $id SET ${updateFields.join(', ')}`,
        updateParams,
      );
    }

    // Handle people relationships
    if (people) {
      await this.neo4jService.write(
        `MATCH (m:Memory {userId: $userId}) WHERE id(m) = $id
         OPTIONAL MATCH (m)-[r:INVOLVES_PERSON]->(p:Person)
         DELETE r
         WITH m
         UNWIND $people AS personName
         MERGE (p:Person {name: personName.name})
         CREATE (m)-[:INVOLVES_PERSON]->(p)`,
        {
          id: parseInt(id),
          userId,
          people: people.map((p) => ({ name: p.name })),
        },
      );
    }

    // Handle places relationships
    if (places) {
      await this.neo4jService.write(
        `MATCH (m:Memory {userId: $userId}) WHERE id(m) = $id
         OPTIONAL MATCH (m)-[r:OCCURRED_AT]->(pl:Place)
         DELETE r
         WITH m
         UNWIND $places AS placeData
         MERGE (pl:Place {name: placeData.name})
         CREATE (m)-[:OCCURRED_AT]->(pl)`,
        {
          id: parseInt(id),
          userId,
          places: places.map((p) => ({ name: p.name })),
        },
      );
    }

    // Handle linked memories relationships (only allow linking to memories of the same user)
    if (linkedMemories) {
      await this.neo4jService.write(
        `MATCH (m1:Memory {userId: $userId}) WHERE id(m1) = $id
         OPTIONAL MATCH (m1)-[r:RELATED_TO]->(m2:Memory)
         DELETE r
         WITH m1
         UNWIND $linkedMemories AS linkedMemoryId
         MATCH (m2:Memory {userId: $userId}) WHERE id(m2) = linkedMemoryId
         CREATE (m1)-[:RELATED_TO]->(m2)`,
        {
          id: parseInt(id),
          userId,
          linkedMemories: linkedMemories.map((id) => parseInt(id)),
        },
      );
    }

    // Handle photos
    if (photos) {
      await this.neo4jService.write(
        `MATCH (m:Memory {userId: $userId}) WHERE id(m) = $id
         SET m.photos = $photos`,
        { id: parseInt(id), userId, photos: photos.map((p) => p.url) },
      );
    }

    // After updating, return the full memory object
    return await this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<any> {
    // First, verify that the memory belongs to the user
    const existingMemory = await this.neo4jService.read(
      `MATCH (m:Memory {userId: $userId}) WHERE id(m) = $id RETURN m`,
      { id: parseInt(id), userId },
    );

    if (!existingMemory.records.length) {
      throw new Error('Memory not found or access denied');
    }

    await this.neo4jService.write(
      `MATCH (m:Memory {userId: $userId}) WHERE id(m) = $id DETACH DELETE m`,
      {
        id: parseInt(id),
        userId,
      },
    );
    return { message: 'Memory deleted successfully' };
  }
}
