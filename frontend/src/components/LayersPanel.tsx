import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface LayersPanelProps {
  className?: string;
}

export function LayersPanel({ className }: LayersPanelProps) {
  const { state, actions } = useEditor();

  const handleDeleteLayer = (layerId: string) => {
    actions.deleteLayer(layerId);
    if (state.activeLayers.find((l) => l.isActive)?.id === layerId) {
      actions.setActiveLayer(null);
    }
  };

  const handleMoveLayer = (layerId: string, direction: 'up' | 'down') => {
    actions.reorderLayers(layerId, direction);
  };

  const reversedLayers = [...state.activeLayers].reverse();

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white border-r border-gray-200',
        className
      )}
    >
      {/* Header */}
      <div className='p-4 border-b border-gray-200 bg-gray-50'>
        <h2 className='text-lg font-semibold text-gray-900'>Layers</h2>
        <p className='text-xs text-gray-500 mt-1'>
          {state.activeLayers.length} layer{state.activeLayers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Layers List */}
      <div className='flex-1 overflow-y-auto p-2'>
        {state.activeLayers.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-32 text-center'>
            <p className='text-gray-500 text-sm'>No layers yet</p>
            <p className='text-xs text-gray-400 mt-2'>
              Add text, stickers, or images to get started
            </p>
          </div>
        ) : (
          <div className='space-y-1'>
            {reversedLayers.map((layer, idx) => {
              const actualIndex = state.activeLayers.length - 1 - idx;
              const isVisible = layer.properties.visible !== false;
              const isLocked = layer.properties.locked === true;
              const isActive = layer.isActive;

              return (
                <div
                  key={layer.id}
                  className={cn(
                    'p-2 rounded-lg border transition-all cursor-pointer group',
                    isActive
                      ? 'bg-primary-50 border-primary-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  )}
                  onClick={() => actions.setActiveLayer(layer.id)}
                >
                  <div className='flex items-center justify-between'>
                    {/* Layer Info */}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate capitalize'>
                        {layer.properties.name || `${layer.type} Layer`}
                      </p>
                      <p className='text-xs text-gray-500 truncate mt-0.5'>
                        {layer.type === 'text' ? layer.content.substring(0, 30) : `${layer.properties.width}×${layer.properties.height}`}
                      </p>
                    </div>

                    {/* Visibility Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        actions.toggleLayerVisibility(layer.id);
                      }}
                      className='ml-2 p-1 rounded hover:bg-gray-200 transition-colors'
                      title={isVisible ? 'Hide layer' : 'Show layer'}
                    >
                      {isVisible ? (
                        <Eye className='w-4 h-4 text-gray-600' />
                      ) : (
                        <EyeOff className='w-4 h-4 text-gray-400' />
                      )}
                    </button>

                    {/* Lock Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        actions.toggleLayerLock(layer.id);
                      }}
                      className='ml-1 p-1 rounded hover:bg-gray-200 transition-colors'
                      title={isLocked ? 'Unlock layer' : 'Lock layer'}
                    >
                      {isLocked ? (
                        <Lock className='w-4 h-4 text-red-600' />
                      ) : (
                        <Unlock className='w-4 h-4 text-gray-400' />
                      )}
                    </button>

                    {/* Move Buttons */}
                    <div className='ml-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveLayer(layer.id, 'up');
                        }}
                        disabled={actualIndex === state.activeLayers.length - 1}
                        className='p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        title='Move layer up'
                      >
                        <ChevronUp className='w-4 h-4 text-gray-600' />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveLayer(layer.id, 'down');
                        }}
                        disabled={actualIndex === 0}
                        className='p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        title='Move layer down'
                      >
                        <ChevronDown className='w-4 h-4 text-gray-600' />
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLayer(layer.id);
                      }}
                      className='ml-1 p-1 rounded hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100'
                      title='Delete layer'
                    >
                      <Trash2 className='w-4 h-4 text-red-600' />
                    </button>
                  </div>

                  {/* Z-Index Info */}
                  <div className='mt-1.5 pt-1.5 border-t border-gray-200'>
                    <p className='text-xs text-gray-500'>
                      Z-Index: <span className='font-medium'>{actualIndex}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500'>
        <p>Click to select • Drag to move • Lock to prevent edits</p>
      </div>
    </div>
  );
}
