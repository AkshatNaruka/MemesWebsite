import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils';

interface CanvasProps {
  className?: string;
}

export function Canvas({ className }: CanvasProps) {
  const { state } = useEditor();

  const selectedTemplate = state.selectedTemplate;

  return (
    <div className={cn(
      "flex-1 flex items-center justify-center bg-gray-50 relative overflow-hidden",
      className
    )}>
      <div className="relative">
        {/* Template Background */}
        {selectedTemplate ? (
          <div className="relative">
            <img
              src={selectedTemplate.image_url}
              alt={selectedTemplate.name}
              className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwQzIwMCAxODUuNTQzIDE4NS41NDMgMTcyIDE3MiAxNzJIMjI0QzIzOCAxNzIgMjQyIDE4NS41NDMgMjQyIDIwMFYyNDRDMjQyIDI1OC40NTcgMjM4IDI2NCAyMzggMjY0SDE2OEMxNjggMjY0IDE2NCAyNTguNDU3IDE2NCAyNDRWMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4=';
              }}
            />
            
            {/* Template Fields Overlay */}
            {selectedTemplate.fields.map((field) => (
              <div
                key={field.id}
                className="absolute border-2 border-dashed border-primary-400 bg-primary-50 bg-opacity-20 cursor-pointer hover:border-primary-500 hover:bg-primary-100 transition-colors"
                style={{
                  left: `${field.x_pos}%`,
                  top: `${field.y_pos}%`,
                  width: `${field.width}%`,
                  height: `${field.height}%`,
                }}
              >
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-600 bg-white px-2 py-1 rounded shadow-sm">
                    {field.name}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Active Layers */}
            {state.activeLayers.map((layer) => (
              <LayerComponent key={layer.id} layer={layer} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
            <p className="text-gray-500 mb-4">
              Choose a template from the sidebar to start creating your meme
            </p>
            <div className="text-sm text-gray-400">
              <p>• Select a template to see editable fields</p>
              <p>• Add text, stickers, and other elements</p>
              <p>• Use the properties panel to customize</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Canvas Toolbar */}
      {selectedTemplate && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="px-3 py-1 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium">
            Reset
          </button>
          <button className="px-3 py-1 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 text-sm font-medium">
            Save
          </button>
        </div>
      )}
      
      {/* Zoom Controls */}
      {selectedTemplate && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="w-8 h-8 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center">
            <span className="text-sm font-bold">-</span>
          </button>
          <span className="w-12 h-8 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center justify-center text-sm">
            100%
          </span>
          <button className="w-8 h-8 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center">
            <span className="text-sm font-bold">+</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Layer Component
function LayerComponent({ layer }: { layer: any }) {
  const { actions } = useEditor();
  const isActive = layer.isActive;

  const handleClick = () => {
    actions.setActiveLayer(layer.id);
  };

  const style = {
    position: 'absolute' as const,
    left: `${layer.properties.x}px`,
    top: `${layer.properties.y}px`,
    zIndex: layer.properties.zIndex,
    transform: layer.properties.rotation ? `rotate(${layer.properties.rotation}deg)` : undefined,
    color: layer.properties.color,
    fontSize: layer.properties.fontSize,
    fontFamily: layer.properties.fontFamily,
  };

  return (
    <div
      className={cn(
        "cursor-pointer transition-all",
        isActive && "ring-2 ring-primary-500 ring-offset-2"
      )}
      style={style}
      onClick={handleClick}
    >
      {layer.type === 'text' && (
        <div
          className={cn(
            "min-w-8 min-h-6 border-2 border-dashed",
            isActive ? "border-primary-400 bg-primary-50" : "border-transparent"
          )}
        >
          {layer.content || 'Text'}
        </div>
      )}
      
      {layer.type === 'sticker' && (
        <img
          src={layer.content}
          alt="Sticker"
          className={cn(
            "max-w-32 max-h-32 object-contain",
            isActive && "ring-2 ring-primary-500"
          )}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCA2NEM2NCA1OS41NDMxIDU5LjU0MzEgNTYgNTYgNTZINzJDODAgNTYgODQgNTkuNTQzMSA4NCA2NFY3NkM4NCA4Mi40NTcgODAgODggODAgODhINDBDNDAgODggMzYgODIuNDU3IDM2IDc2VjY0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4=';
          }}
        />
      )}
    </div>
  );
}