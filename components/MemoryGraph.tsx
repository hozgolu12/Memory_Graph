'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { Memory, EMOTION_COLORS } from '@/types/memory';
import { memoryService } from '@/lib/memoryService';
import { useAuth } from '@/contexts/AuthContext';

interface Node {
  id: string;
  position: { x: number; y: number };
  data: { label: string; memory: Memory };
  style: any;
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

export default function MemoryGraph({ refreshTrigger }: { refreshTrigger?: any } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = 100%
  const GRAPH_BASE_WIDTH = 1600; // Base width for the graph area
  const GRAPH_BASE_HEIGHT = 1200; // Base height for the graph area
  const GRAPH_WIDTH = GRAPH_BASE_WIDTH * zoomLevel;
  const GRAPH_HEIGHT = GRAPH_BASE_HEIGHT * zoomLevel;
  const { user } = useAuth();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMemory, setEditedMemory] = useState<Memory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 2)); // Max zoom 200%
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.5)); // Min zoom 50%
  }, []);

  const generateNodesAndEdges = useCallback((memories: Memory[]) => {
    const containerWidth = GRAPH_WIDTH; // Use defined graph width
    const containerHeight = GRAPH_HEIGHT; // Use defined graph height
    const nodeSize = 150;
    const minDimension = Math.min(containerWidth, containerHeight);
    const radius = (minDimension / 2) - (nodeSize / 2) - 20;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Build nodes
    memories.forEach((memory, index) => {
      const angle = (index * 2 * Math.PI) / memories.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      newNodes.push({
        id: memory.id,
        position: { x, y },
        data: {
          label: memory.text.slice(0, 50) + '...',
          memory
        },
        style: {
          background: EMOTION_COLORS[memory.emotion],
          border: '2px solid #fff',
          borderRadius: '8px',
          padding: '10px',
          minWidth: '150px',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      });
    });

    // Add edges for explicit links (linkedMemories)
    memories.forEach(memory => {
      memory.linkedMemories.forEach(linkedId => {
        if (memories.some(m => m.id === linkedId)) {
          newEdges.push({
            id: `link-${memory.id}-${linkedId}`,
            source: memory.id,
            target: linkedId,
          });
        }
      });
    });

    // Add edges for shared people
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const memA = memories[i];
        const memB = memories[j];
        const sharedPeople = memA.people.map(p => p.name).filter(name => memB.people.map(p => p.name).includes(name));
        if (sharedPeople.length > 0) {
          newEdges.push({
            id: `person-${memA.id}-${memB.id}`,
            source: memA.id,
            target: memB.id,
          });
        }
      }
    }

    // Add edges for shared places
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const memA = memories[i];
        const memB = memories[j];
        const sharedPlaces = memA.places.map(pl => pl.name).filter(name => memB.places.map(pl => pl.name).includes(name));
        if (sharedPlaces.length > 0) {
          newEdges.push({
            id: `place-${memA.id}-${memB.id}`,
            source: memA.id,
            target: memB.id,
          });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [GRAPH_WIDTH, GRAPH_HEIGHT]);

  const refreshGraph = useCallback(() => {
    if (user) {
      memoryService.getUserMemories(user.uid).then(userMemories => {
        generateNodesAndEdges(userMemories);
      });
    }
  }, [user, generateNodesAndEdges]);

  useEffect(() => {
    refreshGraph();
  }, [user, refreshTrigger, refreshGraph]);

  const handleNodeClick = (memory: Memory) => {
    setSelectedMemory(memory);
    setEditedMemory(memory);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedMemory || !user) return;

    setIsLoading(true);
    try {
      await memoryService.updateMemory(editedMemory.id, user.uid, {
        text: editedMemory.text,
        emotion: editedMemory.emotion,
        date: editedMemory.date,
        people: editedMemory.people,
        places: editedMemory.places,
      });
      setSelectedMemory(editedMemory);
      setIsEditing(false);
      refreshGraph(); // Refresh the graph to show updated data
    } catch (error) {
      console.error('Error updating memory:', error);
      alert('Failed to update memory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMemory || !user) return;

    const confirmed = window.confirm('Are you sure you want to delete this memory? This action cannot be undone.');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await memoryService.deleteMemory(selectedMemory.id, user.uid);
      setSelectedMemory(null);
      setIsEditing(false);
      refreshGraph(); // Refresh the graph to remove the deleted node
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert('Failed to delete memory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedMemory(selectedMemory);
    setIsEditing(false);
  };

  const handleClose = () => {
    setSelectedMemory(null);
    setEditedMemory(null);
    setIsEditing(false);
  };

  return (
    <div ref={containerRef} className="bg-white/80 backdrop-blur-md rounded-lg border border-white/20 p-6 h-[600px] relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Memory Graph</h2>
        <div className="flex items-center space-x-2">
          <button onClick={handleZoomOut} className="px-3 py-1 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300">-</button>
          <span className="text-sm text-gray-600">{(zoomLevel * 100).toFixed(0)}%</span>
          <button onClick={handleZoomIn} className="px-3 py-1 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300">+</button>
        </div>
        <div className="text-sm text-gray-600">
          {nodes.length} memories mapped
        </div>
      </div>

      {/* Graph visualization using absolute positioning and SVG for edges */}
      <div className="relative w-full h-full overflow-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
        {/* SVG for edges */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, width: GRAPH_WIDTH, height: GRAPH_HEIGHT }}>
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;
            return (
              <line
                key={edge.id}
                x1={sourceNode.position.x}
                y1={sourceNode.position.y}
                x2={targetNode.position.x}
                y2={targetNode.position.y}
                stroke="#8884d8"
                strokeWidth={2}
                opacity={0.5}
              />
            );
          })}
        </svg>

        {/* Render nodes absolutely */}
        <div className="absolute inset-0" style={{ zIndex: 2, width: GRAPH_WIDTH, height: GRAPH_HEIGHT }}>
          {nodes.map(node => (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node.data.memory)}
              className="cursor-pointer transform hover:scale-105 transition-transform"
              style={{
                position: 'absolute',
                left: node.position.x,
                top: node.position.y,
                ...node.style,
                zIndex: 3,
              }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-white/50 shadow-lg">
                <div className="text-xs text-gray-500 mb-2">{node.data.memory.date}</div>
                <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-3">
                  {node.data.memory.text}
                </div>
                <div className="text-xs text-gray-600">
                  {node.data.memory.people.length > 0 && (
                    <span className="mr-2">👥 {node.data.memory.people.map(p => p.name).join(', ')}</span>
                  )}
                  {node.data.memory.places.length > 0 && (
                    <span>📍 {node.data.memory.places.map(p => p.name).join(', ')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory details modal */}
      {selectedMemory && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Memory Details</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Date:</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedMemory?.date || ''}
                    onChange={(e) => setEditedMemory(prev => prev ? { ...prev, date: e.target.value } : null)}
                    className="ml-2 text-sm border rounded px-2 py-1"
                    disabled={isLoading}
                  />
                ) : (
                  <span className="ml-2 text-sm text-gray-900">{selectedMemory.date}</span>
                )}
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Emotion:</span>
                {isEditing ? (
                  <select
                    value={editedMemory?.emotion || ''}
                    onChange={(e) => setEditedMemory(prev => prev ? { ...prev, emotion: e.target.value as any } : null)}
                    className="ml-2 text-sm border rounded px-2 py-1"
                    disabled={isLoading}
                  >
                    {Object.keys(EMOTION_COLORS).map(emotion => (
                      <option key={emotion} value={emotion}>{emotion}</option>
                    ))}
                  </select>
                ) : (
                  <span 
                    className="ml-2 px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: EMOTION_COLORS[selectedMemory.emotion] }}
                  >
                    {selectedMemory.emotion}
                  </span>
                )}
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Memory:</span>
                {isEditing ? (
                  <textarea
                    value={editedMemory?.text || ''}
                    onChange={(e) => setEditedMemory(prev => prev ? { ...prev, text: e.target.value } : null)}
                    className="mt-1 w-full text-sm border rounded px-3 py-2 resize-none"
                    rows={4}
                    disabled={isLoading}
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{selectedMemory.text}</p>
                )}
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">People:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedMemory?.people.map(p => p.name).join(', ') || ''}
                    onChange={(e) => setEditedMemory(prev => prev ? { ...prev, people: e.target.value.split(', ').map(name => ({ id: '', name: name.trim() })) } : null)}
                    className="ml-2 text-sm border rounded px-2 py-1"
                    disabled={isLoading}
                  />
                ) : (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedMemory.people.map(person => (
                      <span key={person.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {person.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedMemory.places.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Places:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedMemory?.places.map(p => p.name).join(', ') || ''}
                      onChange={(e) => setEditedMemory(prev => prev ? { ...prev, places: e.target.value.split(', ').map(name => ({ id: '', name: name.trim() })) } : null)}
                      className="ml-2 text-sm border rounded px-2 py-1"
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedMemory.places.map(place => (
                        <span key={place.id} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {place.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
