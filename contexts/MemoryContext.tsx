// contexts/MemoryContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { memoryService } from '@/lib/memoryService';
import { Memory, Person, Place } from '@/types/memory';

interface MemoryContextType {
  memories: Memory[];
  loading: boolean;
  error: string | null;
  refreshMemories: () => Promise<void>;
  updateMemory: (id: string, updates: Partial<Memory>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  createMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  stats: {
    totalMemories: number;
    totalPeople: number;
    totalPlaces: number;
    mostCommonEmotion: string;
  };
  peopleData: Array<{ person: Person; count: number }>;
  placesData: Array<{ place: Place; count: number }>;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export function useMemories() {
  const context = useContext(MemoryContext);
  if (context === undefined) {
    throw new Error('useMemories must be used within a MemoryProvider');
  }
  return context;
}

interface MemoryProviderProps {
  children: ReactNode;
}

export function MemoryProvider({ children }: MemoryProviderProps) {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalMemories: 0,
    totalPeople: 0,
    totalPlaces: 0,
    mostCommonEmotion: 'neutral'
  });
  const [peopleData, setPeopleData] = useState<Array<{ person: Person; count: number }>>([]);
  const [placesData, setPlacesData] = useState<Array<{ place: Place; count: number }>>([]);

  const calculateStats = (memoriesData: Memory[]) => {
    const people = new Set(memoriesData.flatMap(m => m.people.map(p => p.name)));
    const places = new Set(memoriesData.flatMap(m => m.places.map(p => p.name)));

    const emotionCount = memoriesData.reduce((acc, memory) => {
      acc[memory.emotion] = (acc[memory.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonEmotion = Object.entries(emotionCount).reduce(
      (max, [emotion, count]) => count > max.count ? { emotion, count } : max,
      { emotion: 'neutral', count: 0 }
    ).emotion;

    return {
      totalMemories: memoriesData.length,
      totalPeople: people.size,
      totalPlaces: places.size,
      mostCommonEmotion
    };
  };

  const refreshMemories = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [memoriesData, people, places] = await Promise.all([
        memoryService.getUserMemories(user.uid),
        memoryService.getPeopleFrequency(user.uid),
        memoryService.getPlacesFrequency(user.uid)
      ]);
      
      setMemories(memoriesData);
      setStats(calculateStats(memoriesData));
      setPeopleData(people);
      setPlacesData(places);
    } catch (err) {
      console.error('Error fetching memories:', err);
      setError('Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const updateMemory = async (id: string, updates: Partial<Memory>) => {
    if (!user) return;
    
    try {
      await memoryService.updateMemory(id, user.uid, updates);
      refreshMemories();
    } catch (err) {
      console.error('Error updating memory:', err);
      throw err;
    }
  };

  const deleteMemory = async (id: string) => {
    if (!user) return;
    
    try {
      await memoryService.deleteMemory(id, user.uid);
      refreshMemories();
    } catch (err) {
      console.error('Error deleting memory:', err);
      throw err;
    }
  };

  const createMemory = async (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    
    try {
      await memoryService.createMemory(memory);
      refreshMemories();
    } catch (err) {
      console.error('Error creating memory:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      refreshMemories();
    } else {
      setMemories([]);
      setStats({
        totalMemories: 0,
        totalPeople: 0,
        totalPlaces: 0,
        mostCommonEmotion: 'neutral'
      });
      setPeopleData([]);
      setPlacesData([]);
      setLoading(false);
    }
  }, [user]);

  const value: MemoryContextType = {
    memories,
    loading,
    error,
    refreshMemories,
    updateMemory,
    deleteMemory,
    createMemory,
    stats,
    peopleData,
    placesData
  };

  return (
    <MemoryContext.Provider value={value}>
      {children}
    </MemoryContext.Provider>
  );
}
