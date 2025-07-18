'use client';

import  Layout  from '@/components/Layout';
import MemoryGraph from '@/components/MemoryGraph';
import { useAuth } from '@/contexts/AuthContext';
import { memoryService } from '@/lib/memoryService';
import { Memory } from '@/types/memory';
import { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Heart, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileNavbar } from '@/components/MobileNavbar';

export default function DashboardPage() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editEmotion, setEditEmotion] = useState('neutral');
  const [editPeople, setEditPeople] = useState<string[]>([]);
  const [editPlaces, setEditPlaces] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalMemories: 0,
    totalPeople: 0,
    totalPlaces: 0,
    mostCommonEmotion: 'neutral'
  });

  useEffect(() => {
    if (user) {
      memoryService.getUserMemories(user.uid).then(memories => {
        setMemories(memories);

        const people = new Set(memories.flatMap(m => m.people.map(p => p.name)));
        const places = new Set(memories.flatMap(m => m.places.map(p => p.name)));

        const emotionCount = memories.reduce((acc, memory) => {
          acc[memory.emotion] = (acc[memory.emotion] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommonEmotion = Object.entries(emotionCount).reduce(
          (max, [emotion, count]) => count > max.count ? { emotion, count } : max,
          { emotion: 'neutral', count: 0 }
        ).emotion;

        setStats({
          totalMemories: memories.length,
          totalPeople: people.size,
          totalPlaces: places.size,
          mostCommonEmotion
        });
      });
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    await memoryService.deleteMemory(id);
    window.location.reload();
  };

  const startEdit = (memory: Memory) => {
    setEditingId(memory.id);
    setEditText(memory.text);
    setEditEmotion(memory.emotion);
    setEditPeople(memory.people.map(p => p.name));
    setEditPlaces(memory.places.map(p => p.name));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditEmotion('neutral');
    setEditPeople([]);
    setEditPlaces([]);
  };

  const addPerson = () => setEditPeople([...editPeople, '']);
  const removePerson = (index: number) => setEditPeople(editPeople.filter((_, i) => i !== index));
  const updatePerson = (index: number, value: string) => {
    const newPeople = [...editPeople];
    newPeople[index] = value;
    setEditPeople(newPeople);
  };

  const addPlace = () => setEditPlaces([...editPlaces, '']);
  const removePlace = (index: number) => setEditPlaces(editPlaces.filter((_, i) => i !== index));
  const updatePlace = (index: number, value: string) => {
    const newPlaces = [...editPlaces];
    newPlaces[index] = value;
    setEditPlaces(newPlaces);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await memoryService.updateMemory(editingId, {
      text: editText,
      emotion: editEmotion as any,
      people: editPeople.filter(p => p.trim()).map(name => ({ id: '', name: name.trim() })),
      places: editPlaces.filter(p => p.trim()).map(name => ({ id: '', name: name.trim() })),
    });
    window.location.reload();
  };

  return (
    <Layout>
      <MobileNavbar />
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Memory Graph
          </h1>
          <p className="text-gray-600">
            Explore your life experiences through interconnected memories
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Memories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMemories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">People</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPeople}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Places</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPlaces}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Main Emotion</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{stats.mostCommonEmotion}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Memory Graph */}
        <MemoryGraph />

        {/* Memories List */}
        <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Memories</h2>
          <ul>
            {memories.map(memory => (
              <li key={memory.id} className="border-b py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                {editingId === memory.id ? (
                  <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                    <Input
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                    />
                    <select
                      className="border rounded px-2 py-1"
                      value={editEmotion}
                      onChange={e => setEditEmotion(e.target.value)}
                    >
                      <option value="joy">Joy</option>
                      <option value="sadness">Sadness</option>
                      <option value="love">Love</option>
                      <option value="anger">Anger</option>
                      <option value="fear">Fear</option>
                      <option value="surprise">Surprise</option>
                      <option value="neutral">Neutral</option>
                    </select>
                    <div className="w-full space-y-2">
                      <label className="text-sm font-medium text-gray-700">People</label>
                      {editPeople.map((person, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={person}
                            onChange={(e) => updatePerson(index, e.target.value)}
                            placeholder="Person's name"
                          />
                          {editPeople.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePerson(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPerson}
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Person</span>
                      </Button>
                    </div>
                    <div className="w-full space-y-2">
                      <label className="text-sm font-medium text-gray-700">Places</label>
                      {editPlaces.map((place, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={place}
                            onChange={(e) => updatePlace(index, e.target.value)}
                            placeholder="Place name"
                          />
                          {editPlaces.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePlace(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPlace}
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Place</span>
                      </Button>
                    </div>
                    <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={saveEdit}>Save</button>
                    <button className="bg-gray-300 px-3 py-1 rounded" onClick={cancelEdit}>Cancel</button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                    <div className="flex-1">
                      <p className="font-semibold">{memory.text}</p>
                      <p className="text-sm text-gray-600">{memory.date} - {memory.emotion}</p>
                      {memory.people.length > 0 && (
                        <p className="text-sm text-blue-700">👥 {memory.people.map(p => p.name).join(', ')}</p>
                      )}
                      {memory.places.length > 0 && (
                        <p className="text-sm text-green-700">📍 {memory.places.map(p => p.name).join(', ')}</p>
                      )}
                    </div>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => startEdit(memory)}>Edit</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(memory.id)}>Delete</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}