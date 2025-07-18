'use client';

import Layout from '@/components/Layout';
import { useMemories } from '@/contexts/MemoryContext';
import { Users, MapPin, Award } from 'lucide-react';

export default function RelationshipsPage() {
  const { peopleData, placesData, loading, error } = useMemories();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg text-gray-600">Loading relationships...</div>
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relationships & Places</h1>
          <p className="text-gray-600">Discover who and where matter most in your memories</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* People Section */}
          <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">People in Your Memories</h2>
            </div>

            <div className="space-y-4">
              {peopleData.map((item, index) => (
                <div key={item.person.id || index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {index === 0 && <Award className="h-5 w-5 text-yellow-500" />}
                    {index === 1 && <Award className="h-5 w-5 text-gray-400" />}
                    {index === 2 && <Award className="h-5 w-5 text-amber-600" />}
                    {index > 2 && <span className="text-sm text-gray-500">#{index + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.person.name}</h3>
                        {item.person.relationship && (
                          <p className="text-sm text-gray-600">{item.person.relationship}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{item.count}</span>
                        <p className="text-sm text-gray-600">memories</p>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${peopleData.length > 0 ? (item.count / Math.max(...peopleData.map(p => p.count))) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {peopleData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No people recorded yet</p>
              </div>
            )}
          </div>

          {/* Places Section */}
          <div className="bg-white/80 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <MapPin className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Places in Your Memories</h2>
            </div>

            <div className="space-y-4">
              {placesData.map((item, index) => (
                <div key={item.place.id || index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {index === 0 && <Award className="h-5 w-5 text-yellow-500" />}
                    {index === 1 && <Award className="h-5 w-5 text-gray-400" />}
                    {index === 2 && <Award className="h-5 w-5 text-amber-600" />}
                    {index > 2 && <span className="text-sm text-gray-500">#{index + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.place.name}</h3>
                        {item.place.type && (
                          <p className="text-sm text-gray-600">{item.place.type}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">{item.count}</span>
                        <p className="text-sm text-gray-600">memories</p>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${placesData.length > 0 ? (item.count / Math.max(...placesData.map(p => p.count))) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {placesData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No places recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
