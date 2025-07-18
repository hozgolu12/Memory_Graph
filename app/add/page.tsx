'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { memoryService } from '@/lib/memoryService';
import { EmotionType, EMOTION_COLORS, EMOTION_LABELS } from '@/types/memory';
import { Plus, X } from 'lucide-react';

export default function AddMemoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    date: new Date().toISOString().split('T')[0],
    emotion: 'neutral' as EmotionType,
  });
  const [people, setPeople] = useState<string[]>(['']);
  const [places, setPlaces] = useState<string[]>(['']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const memory = {
        text: formData.text,
        date: formData.date,
        emotion: formData.emotion,
        userId: user.uid,
        people: people.filter(p => p.trim()).map(name => ({ id: '', name: name.trim() })),
        places: places.filter(p => p.trim()).map(name => ({ id: '', name: name.trim() })),
        photos: [],
        linkedMemories: []
      };

      await memoryService.createMemory(memory);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating memory:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = () => setPeople([...people, '']);
  const removePerson = (index: number) => setPeople(people.filter((_, i) => i !== index));
  const updatePerson = (index: number, value: string) => {
    const newPeople = [...people];
    newPeople[index] = value;
    setPeople(newPeople);
  };

  const addPlace = () => setPlaces([...places, '']);
  const removePlace = (index: number) => setPlaces(places.filter((_, i) => i !== index));
  const updatePlace = (index: number, value: string) => {
    const newPlaces = [...places];
    newPlaces[index] = value;
    setPlaces(newPlaces);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">Add New Memory</CardTitle>
            <CardDescription>
              Capture a moment and connect it to your life story
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Memory</label>
                <Textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Describe your memory..."
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Emotion</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
                    <button
                      key={emotion}
                      type="button"
                      onClick={() => setFormData({ ...formData, emotion: emotion as EmotionType })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.emotion === emotion
                          ? 'border-gray-900 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      <div className="text-xs font-medium text-gray-900">
                        {EMOTION_LABELS[emotion as EmotionType]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">People</label>
                {people.map((person, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={person}
                      onChange={(e) => updatePerson(index, e.target.value)}
                      placeholder="Person's name"
                      className="flex-1"
                    />
                    {people.length > 1 && (
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
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Person</span>
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Places</label>
                {places.map((place, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={place}
                      onChange={(e) => updatePlace(index, e.target.value)}
                      placeholder="Place name"
                      className="flex-1"
                    />
                    {places.length > 1 && (
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
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Place</span>
                </Button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? 'Saving...' : 'Save Memory'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}