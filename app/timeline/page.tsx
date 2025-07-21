'use client';

import { useMemories } from '@/contexts/MemoryContext';
import { EMOTION_COLORS } from '@/types/memory';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import { useState } from 'react';

export default function TimelinePage() {
  const { memories, loading, error } = useMemories();
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredMemories = memories.filter((memory) => {
    const search = searchTerm.toLowerCase();
    return (
      memory.text.toLowerCase().includes(search) ||
      memory.emotion.toLowerCase().includes(search) ||
      memory.people.some((person) =>
        person.name.toLowerCase().includes(search)
      ) ||
      memory.places.some((place) =>
        place.name.toLowerCase().includes(search)
      )
    );
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Memory Timeline
          </h1>
          <p className="text-gray-600">
            Journey through your memories chronologically
          </p>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search memories..."
              className="w-full max-w-md mx-auto px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 to-blue-400"></div>

          <div className="space-y-8">
            {filteredMemories.map((memory, index) => (
              <div
                key={memory.id}
                className="relative flex items-start space-x-6"
              >
                {/* Timeline node */}
                <div
                  className="relative z-10 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: EMOTION_COLORS[memory.emotion] }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>

                {/* Memory card */}
                <div className="flex-1 bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format(new Date(memory.date), 'MMMM d, yyyy h:mm a')}
                    </h3>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: EMOTION_COLORS[memory.emotion] }}
                    >
                      {memory.emotion}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">{memory.text}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {memory.people.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600">
                          People:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {memory.people.map((person) => (
                            <span
                              key={person.id}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded"
                            >
                              {person.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {memory.places.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600">
                          Places:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {memory.places.map((place) => (
                            <span
                              key={place.id}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded"
                            >
                              {place.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredMemories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No memories found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

