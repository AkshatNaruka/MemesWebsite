import { useEditor } from '@/contexts/EditorContext';
import { useFonts } from '@/hooks/useAssets';
import { cn } from '@/utils';
import { 
  Type, 
  Palette, 
  Move, 
  RotateCw, 
  Trash2,
  Plus,
  Minus
} from 'lucide-react';

interface PropertiesPanelProps {
  className?: string;
}

export function PropertiesPanel({ className }: PropertiesPanelProps) {
  const { state, actions } = useEditor();
  const activeLayer = state.activeLayers.find(layer => layer.isActive);

  return (
    <div className={cn(
      "flex flex-col bg-white border-l border-gray-200 h-full",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!activeLayer ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Move className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">Select a layer to edit properties</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Layer Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Layer</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {activeLayer.type} Layer
                  </span>
                  <button
                    onClick={() => actions.deleteLayer(activeLayer.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">ID: {activeLayer.id}</p>
                <p className="text-xs text-gray-500">Z-Index: {activeLayer.properties.zIndex}</p>
              </div>
            </div>

            {/* Position */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Move className="w-4 h-4" />
                Position
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">X</label>
                  <input
                    type="number"
                    value={Math.round(activeLayer.properties.x)}
                    onChange={(e) => actions.updateLayer(activeLayer.id, {
                      properties: {
                        ...activeLayer.properties,
                        x: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Y</label>
                  <input
                    type="number"
                    value={Math.round(activeLayer.properties.y)}
                    onChange={(e) => actions.updateLayer(activeLayer.id, {
                      properties: {
                        ...activeLayer.properties,
                        y: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Size (for images and stickers) */}
            {(activeLayer.type === 'image' || activeLayer.type === 'sticker') && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Width</label>
                    <input
                      type="number"
                      value={Math.round(activeLayer.properties.width || 100)}
                      onChange={(e) => actions.updateLayer(activeLayer.id, {
                        properties: {
                          ...activeLayer.properties,
                          width: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Height</label>
                    <input
                      type="number"
                      value={Math.round(activeLayer.properties.height || 100)}
                      onChange={(e) => actions.updateLayer(activeLayer.id, {
                        properties: {
                          ...activeLayer.properties,
                          height: Number(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Text Properties */}
            {activeLayer.type === 'text' && (
              <>
                {/* Text Content */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Text
                  </h3>
                  <textarea
                    value={activeLayer.content}
                    onChange={(e) => actions.updateLayer(activeLayer.id, {
                      content: e.target.value
                    })}
                    placeholder="Enter your text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm resize-none"
                    rows={3}
                  />
                </div>

                {/* Font Family */}
                <FontSelector 
                  selectedFont={activeLayer.properties.fontFamily}
                  onFontChange={(fontFamily) => actions.updateLayer(activeLayer.id, {
                    properties: {
                      ...activeLayer.properties,
                      fontFamily
                    }
                  })}
                />

                {/* Font Size */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Font Size
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newSize = Math.max(8, (activeLayer.properties.fontSize || 16) - 2);
                        actions.updateLayer(activeLayer.id, {
                          properties: {
                            ...activeLayer.properties,
                            fontSize: newSize
                          }
                        });
                      }}
                      className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={activeLayer.properties.fontSize || 16}
                      onChange={(e) => actions.updateLayer(activeLayer.id, {
                        properties: {
                          ...activeLayer.properties,
                          fontSize: Number(e.target.value)
                        }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm text-center"
                    />
                    <button
                      onClick={() => {
                        const newSize = (activeLayer.properties.fontSize || 16) + 2;
                        actions.updateLayer(activeLayer.id, {
                          properties: {
                            ...activeLayer.properties,
                            fontSize: newSize
                          }
                        });
                      }}
                      className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Color
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={activeLayer.properties.color || '#000000'}
                      onChange={(e) => actions.updateLayer(activeLayer.id, {
                        properties: {
                          ...activeLayer.properties,
                          color: e.target.value
                        }
                      })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activeLayer.properties.color || '#000000'}
                      onChange={(e) => actions.updateLayer(activeLayer.id, {
                        properties: {
                          ...activeLayer.properties,
                          color: e.target.value
                        }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Rotation */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                Rotation
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={activeLayer.properties.rotation || 0}
                  onChange={(e) => actions.updateLayer(activeLayer.id, {
                    properties: {
                      ...activeLayer.properties,
                      rotation: Number(e.target.value)
                    }
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12 text-center">
                  {activeLayer.properties.rotation || 0}°
                </span>
              </div>
            </div>

            {/* Z-Index */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Layer Order</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newZIndex = Math.max(0, activeLayer.properties.zIndex - 1);
                    actions.updateLayer(activeLayer.id, {
                      properties: {
                        ...activeLayer.properties,
                        zIndex: newZIndex
                      }
                    });
                  }}
                  className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center text-sm text-gray-600">
                  {activeLayer.properties.zIndex}
                </span>
                <button
                  onClick={() => {
                    const newZIndex = activeLayer.properties.zIndex + 1;
                    actions.updateLayer(activeLayer.id, {
                      properties: {
                        ...activeLayer.properties,
                        zIndex: newZIndex
                      }
                    });
                  }}
                  className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Font Selector Component
function FontSelector({ 
  selectedFont, 
  onFontChange 
}: { 
  selectedFont?: string; 
  onFontChange: (font: string) => void;
}) {
  const { data: fonts = [] } = useFonts();

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Font</h3>
      <select
        value={selectedFont || ''}
        onChange={(e) => onFontChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
      >
        <option value="">Select a font</option>
        {fonts.map((font) => (
          <option key={font.id} value={font.font_family}>
            {font.name}
          </option>
        ))}
      </select>
      
      {selectedFont && (
        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Preview:</p>
          <div 
            className="text-lg"
            style={{ fontFamily: selectedFont }}
          >
            Sample Text
          </div>
        </div>
      )}
    </div>
  );
}