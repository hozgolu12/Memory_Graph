import { Memory, Person, Place } from '@/types/memory';
import { v4 as uuidv4 } from 'uuid';
import {config} from '@/config/config';
import { toast } from '@/hooks/use-toast';

const API_URL = config.BACKEND_API_URL;

class MemoryService {
  async updateMemory(memoryId: string, userId: string, updates: Partial<Omit<Memory, 'id' | 'createdAt'>>): Promise<Memory> {
    try {
      const response = await fetch(`${API_URL}/memory/${memoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updateMemoryDto: updates, userId }),
      });
      const updatedMemory = await response.json();
      if (!response.ok) {
        throw new Error(updatedMemory.message || 'Failed to update memory.');
      }
      toast({ title: 'Success', description: 'Memory updated successfully.' });
      return updatedMemory;
    } catch (error: any) {
      console.error('Error updating memory:', error);
      toast({ title: 'Error', description: error.message || 'Failed to update memory.', variant: 'destructive' });
      throw error;
    }
  }

  async deleteMemory(memoryId: string, userId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_URL}/memory/${memoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete memory.');
      }
      toast({ title: 'Success', description: 'Memory deleted successfully.' });
      return data;
    } catch (error: any) {
      console.error('Error deleting memory:', error);
      toast({ title: 'Error', description: error.message || 'Failed to delete memory.', variant: 'destructive' });
      throw error;
    }
  }

  async getUserMemories(userId: string): Promise<Memory[]> {
    try {
      const response = await fetch(`${API_URL}/memory?userId=${userId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch memories.');
      }
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
    } catch (error: any) {
      console.error('Error fetching user memories:', error);
      toast({ title: 'Error', description: error.message || 'Failed to fetch memories.', variant: 'destructive' });
      throw error;
    }
  }

  async getMemoryById(memoryId: string, userId: string): Promise<Memory | null> {
    try {
      const response = await fetch(`${API_URL}/memory/${memoryId}?userId=${userId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch memory.');
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
    } catch (error: any) {
      console.error('Error fetching memory by id:', error);
      toast({ title: 'Error', description: error.message || 'Failed to fetch memory.', variant: 'destructive' });
      throw error;
    }
  }

  async createMemory(memory: Omit<Memory, 'id' | 'createdAt'>): Promise<Memory> {
    try {
      const response = await fetch(`${API_URL}/memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memory),
      });
      const newMemory = await response.json();
      if (!response.ok) {
        throw new Error(newMemory.message || 'Failed to create memory.');
      }
      toast({ title: 'Success', description: 'Memory created successfully.' });
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
    } catch (error: any) {
      console.error('Error creating memory:', error);
      toast({ title: 'Error', description: error.message || 'Failed to create memory.', variant: 'destructive' });
      throw error;
    }
  }

  async linkMemories(memoryId1: string, memoryId2: string, userId: string): Promise<void> {
    try {
      // Fetch memory1 to get its current linkedMemories
      const memory1 = await this.getMemoryById(memoryId1, userId);
      if (!memory1) {
        throw new Error(`Memory with ID ${memoryId1} not found.`);
      }

      // Add memoryId2 to linkedMemories if not already present
      const updatedLinkedMemories = Array.from(new Set([...memory1.linkedMemories, memoryId2]));

      // Update memory1 with the new linkedMemories
      const response = await fetch(`${API_URL}/memory/${memoryId1}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkedMemories: updatedLinkedMemories, userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to link memories.');
      }
      toast({ title: 'Success', description: 'Memories linked successfully.' });
    } catch (error: any) {
      console.error('Error linking memories:', error);
      toast({ title: 'Error', description: error.message || 'Failed to link memories.', variant: 'destructive' });
      throw error;
    }
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