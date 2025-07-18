'use client';

import Layout from '@/components/Layout';
import MemoryGraph from '@/components/MemoryGraph';
import { useMemories } from '@/contexts/MemoryContext';
import { Memory } from '@/types/memory';
import { useState } from 'react';
import { Calendar, Users, MapPin, Heart, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { memories, stats, loading, error, updateMemory, deleteMemory } = useMemories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editEmotion, setEditEmotion] = useState('neutral');
  const [editPeople, setEditPeople] = useState<string[]>([]);
  const [editPlaces, setEditPlaces] = useState<string[]>([]);

  // Get recent memories (last 10 or sorted by date)
  const recentMemories = memories
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      try {
        await deleteMemory(id);
        toast({
          title: "Memory deleted.",
          description: "Your memory has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting memory:', error);
        toast({
          title: "Error",
          description: "Failed to delete memory.",
          variant: "destructive",
        });
      }
    }
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
    
    try {
      await updateMemory(editingId, {
        text: editText,
        emotion: editEmotion as any,
        people: editPeople.filter(p => p.trim()).map(name => ({ id: '', name: name.trim() })),
        places: editPlaces.filter(p => p.trim()).map(name => ({ id: '', name: name.trim() })),
      });
      cancelEdit();
      toast({
        title: "Memory updated.",
        description: "Your memory has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating memory:', error);
      toast({
        title: "Error",
        description: "Failed to update memory.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg text-gray-600">Loading memories...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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

        {/* Recent Memories */}
        <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Memories</h2>
          {recentMemories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No memories yet. Start by adding your first memory!</p>
          ) : (
            <ul>
              {recentMemories.map(memory => (
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
          )}
        </div>
      </div>
    </Layout>
  );
}
