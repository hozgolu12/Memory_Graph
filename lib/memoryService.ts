import { Memory, Person, Place, Photo } from '@/types/memory';
import { v4 as uuidv4 } from 'uuid';
import {config} from '@/config/config';

const API_URL = config.BACKEND_API_URL;

class MemoryService {
  async updateMemory(memoryId: string, userId: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>): Promise<Memory> {
    // Only send fields that are defined (avoid sending undefined)
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    const response = await fetch(`${API_URL}/memory/${memoryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...filteredUpdates, userId }),
    });
    // After updating the node, fetch the full memory object
    const updatedMemory = await this.getMemoryById(memoryId, userId);
    if (!updatedMemory) {
      throw new Error(`Memory with ID ${memoryId} not found after update.`);
    }
    return updatedMemory;
  }

  async deleteMemory(memoryId: string, userId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/memory/${memoryId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    return response.json();
  }

  async getUserMemories(userId: string): Promise<Memory[]> {
    const response = await fetch(`${API_URL}/memory?userId=${userId}`);
    const data = await response.json();
    return data.map((mem: any) => {
      // Filter out duplicate people by name
      const uniquePeople = Array.from(
        new Map(mem.people.map((p: any) => [p.name, { id: p.id.toString(), name: p.name }])).values()
      );
      // Filter out duplicate places by name
      const uniquePlaces = Array.from(
        new Map(mem.places.map((pl: any) => [pl.name, { id: pl.id.toString(), name: pl.name }])).values()
      );
      return {
        ...mem,
        id: mem.id.toString(),
        people: uniquePeople,
        places: uniquePlaces,
        linkedMemories: mem.linkedMemories.map((lm: any) => lm.toString()),
      };
    });
  }

  async getMemoryById(memoryId: string, userId: string): Promise<Memory | null> {
    const response = await fetch(`${API_URL}/memory/${memoryId}?userId=${userId}`);
    if (!response.ok) {
      return null;
    }
    const mem = await response.json();
    // Filter out duplicate people by name
    const uniquePeople = Array.from(
      new Map(mem.people.map((p: any) => [p.name, { id: p.id.toString(), name: p.name }])).values()
    );
    // Filter out duplicate places by name
    const uniquePlaces = Array.from(
      new Map(mem.places.map((pl: any) => [pl.name, { id: pl.id.toString(), name: pl.name }])).values()
    );
    return {
      ...mem,
      id: mem.id.toString(),
      people: uniquePeople,
      places: uniquePlaces,
      linkedMemories: mem.linkedMemories.map((lm: any) => lm.toString()),
    };
  }

  async createMemory(memory: Omit<Memory, 'id' | 'createdAt'>): Promise<Memory> {
    const response = await fetch(`${API_URL}/memory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memory),
    });
    const newMemory = await response.json();
    return {
      ...newMemory,
      id: newMemory.id?.toString?.() ?? '',
      people: Array.isArray(newMemory.people)
        ? newMemory.people.map((p: any) => ({ id: p.id?.toString?.() ?? '', name: p.name }))
        : [],
      places: Array.isArray(newMemory.places)
        ? newMemory.places.map((pl: any) => ({ id: pl.id?.toString?.() ?? '', name: pl.name }))
        : [],
      linkedMemories: Array.isArray(newMemory.linkedMemories)
        ? newMemory.linkedMemories.map((lm: any) => lm?.toString?.())
        : [],
    };
  }

  async linkMemories(memoryId1: string, memoryId2: string, userId: string): Promise<void> {
    // Fetch memory1 to get its current linkedMemories
    const memory1 = await this.getMemoryById(memoryId1, userId);
    if (!memory1) {
      console.error(`Memory with ID ${memoryId1} not found.`);
      return;
    }

    // Add memoryId2 to linkedMemories if not already present
    const updatedLinkedMemories = Array.from(new Set([...memory1.linkedMemories, memoryId2]));

    // Update memory1 with the new linkedMemories
    await fetch(`${API_URL}/memory/${memoryId1}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ linkedMemories: updatedLinkedMemories, userId }),
    });
  }

  async getPeopleFrequency(userId: string): Promise<Array<{ person: Person; count: number }>> {
    const memories = await this.getUserMemories(userId);
    const peopleCount: { [key: string]: number } = {};
    memories.forEach(memory => {
      memory.people.forEach(person => {
        peopleCount[person.name] = (peopleCount[person.name] || 0) + 1;
      });
    });
    return Object.entries(peopleCount).map(([name, count]) => ({
      person: { id: '', name }, // ID is not relevant for frequency, can be empty
      count,
    })).sort((a, b) => b.count - a.count);
  }

  async getPlacesFrequency(userId: string): Promise<Array<{ place: Place; count: number }>> {
    const memories = await this.getUserMemories(userId);
    const placesCount: { [key: string]: number } = {};
    memories.forEach(memory => {
      memory.places.forEach(place => {
        placesCount[place.name] = (placesCount[place.name] || 0) + 1;
      });
    });
    return Object.entries(placesCount).map(([name, count]) => ({
      place: { id: '', name }, // ID is not relevant for frequency, can be empty
      count,
    })).sort((a, b) => b.count - a.count);
  }

  getTimelineData(userId: string) {
    return this.getUserMemories(userId).then(memories => {
      // Filter out memories with invalid date values
      const validMemories = memories.filter(m => {
        const d = new Date(m.date);
        return m.date && !isNaN(d.getTime());
      });
      return validMemories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

  // Initialize with  data
}

export const memoryService = new MemoryService();
