import { useRef, useEffect, useState } from 'react';
import { Stage, Layer as KonvaLayer, Image, Text, Rect } from 'react-konva';
import Konva from 'konva';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils';
import type { Layer } from '@/types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface KonvaCanvasProps {
  className?: string;
}

export function KonvaCanvas({ className }: KonvaCanvasProps) {
  const { state, actions } = useEditor();
  const stageRef = useRef<Konva.Stage>(null);

  const templateImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const selectedTemplate = state.selectedTemplate;
    if (!selectedTemplate) return;

    const img = new window.Image();
    img.src = selectedTemplate.image_url;
    img.onload = () => {
      templateImageRef.current = img;
    };
  }, [state.selectedTemplate]);

  const handleCanvasClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      actions.setActiveLayer(null);
    }
  };

  const handleLayerClick = (layerId: string) => {
    actions.setActiveLayer(layerId);
  };

  const handleLayerDragEnd = (layerId: string, newX: number, newY: number) => {
    const layer = state.activeLayers.find((l) => l.id === layerId);
    if (layer && !layer.properties.locked) {
      actions.updateLayer(layerId, {
        properties: {
          ...layer.properties,
          x: newX,
          y: newY,
        },
      });
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? state.zoom * 1.2 : state.zoom / 1.2;
    actions.setZoom(newZoom);
  };

  const handleResetView = () => {
    actions.setZoom(1);
    actions.setPan(0, 0);
  };

  const templateImage = state.selectedTemplate;
  const templateWidth = 400;
  const templateHeight = 400;

  const getFilterString = (): string => {
    let filterStr = '';

    const brightness = Math.max(0, Math.min(200, state.filters.brightness));
    const contrast = Math.max(0, Math.min(200, state.filters.contrast));
    const saturation = Math.max(0, Math.min(200, state.filters.saturation));
    const blur = Math.max(0, Math.min(100, state.filters.blur));
    const hue = Math.max(0, Math.min(360, state.filters.hueRotate));

    if (brightness !== 100) filterStr += `brightness(${brightness}%) `;
    if (contrast !== 100) filterStr += `contrast(${contrast}%) `;
    if (saturation !== 100) filterStr += `saturate(${saturation}%) `;
    if (blur > 0) filterStr += `blur(${blur}px) `;
    if (hue !== 0) filterStr += `hue-rotate(${hue}deg) `;

    return filterStr.trim();
  };

  const visibleLayers = state.activeLayers.filter(
    (layer) => layer.properties.visible !== false
  );

  return (
    <div
      className={cn(
        'flex-1 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden',
        className
      )}
    >
      <div
        className="relative"
        style={{
          filter: getFilterString() || 'none',
        }}
      >
        <Stage
          ref={stageRef}
          width={800}
          height={600}
          scale={{ x: state.zoom, y: state.zoom }}
          offset={{ x: state.panX, y: state.panY }}
          onClick={handleCanvasClick}
          style={{
            border: '1px solid #e5e7eb',
            backgroundColor: '#fff',
            cursor: 'default',
          }}
        >
          <KonvaLayer>
            {/* Template Background */}
            {templateImage && templateImageRef.current && (
              <Image
                image={templateImageRef.current}
                width={templateWidth}
                height={templateHeight}
                draggable={false}
              />
            )}

            {/* Template Field Overlays */}
            {templateImage &&
              templateImage.fields.map((field) => (
                <Rect
                  key={`field-${field.id}`}
                  x={(field.x_pos / 100) * templateWidth}
                  y={(field.y_pos / 100) * templateHeight}
                  width={(field.width / 100) * templateWidth}
                  height={(field.height / 100) * templateHeight}
                  stroke='#3b82f6'
                  strokeScaleEnabled={false}
                  dash={[4, 4]}
                  opacity={0.3}
                  pointerEvents='none'
                />
              ))}

            {/* Layers */}
            {visibleLayers.map((layer) => (
              <LayerElement
                key={layer.id}
                layer={layer}
                isActive={layer.isActive}
                onLayerClick={() => handleLayerClick(layer.id)}
                onLayerDragEnd={(newX, newY) =>
                  handleLayerDragEnd(layer.id, newX, newY)
                }
                templateWidth={templateWidth}
                templateHeight={templateHeight}
              />
            ))}
          </KonvaLayer>
        </Stage>
      </div>

      {/* Canvas Toolbar */}
      {templateImage && (
        <div className='absolute top-4 right-4 flex gap-2'>
          <button
            onClick={() => handleZoom('out')}
            className='w-8 h-8 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center'
            title='Zoom out'
          >
            <ZoomOut className='w-4 h-4 text-gray-600' />
          </button>
          <span className='w-14 h-8 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center justify-center text-sm font-medium text-gray-600'>
            {Math.round(state.zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom('in')}
            className='w-8 h-8 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center'
            title='Zoom in'
          >
            <ZoomIn className='w-4 h-4 text-gray-600' />
          </button>
          <button
            onClick={handleResetView}
            className='w-8 h-8 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center'
            title='Reset view'
          >
            <RotateCcw className='w-4 h-4 text-gray-600' />
          </button>
        </div>
      )}
    </div>
  );
}

interface LayerElementProps {
  layer: Layer;
  isActive: boolean;
  onLayerClick: () => void;
  onLayerDragEnd: (x: number, y: number) => void;
  templateWidth: number;
  templateHeight: number;
}

function LayerElement({
  layer,
  onLayerClick,
  onLayerDragEnd,
}: LayerElementProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (
      layer.type === 'sticker' ||
      layer.type === 'image' ||
      layer.type === 'gif'
    ) {
      const img = new window.Image();
      img.src = layer.content;
      img.onload = () => {
        setImage(img);
      };
    }
  }, [layer.content, layer.type]);

  const width = layer.properties.width || 100;
  const height = layer.properties.height || 100;
  const opacity = layer.properties.opacity ?? 1;

  if (layer.type === 'text') {
    return (
      <Text
        text={layer.properties.uppercase ? layer.content.toUpperCase() : layer.content}
        x={layer.properties.x}
        y={layer.properties.y}
        fontSize={layer.properties.fontSize || 16}
        fontFamily={layer.properties.fontFamily || 'Arial'}
        fill={layer.properties.color || '#000000'}
        stroke={layer.properties.strokeColor}
        strokeWidth={layer.properties.strokeWidth || 0}
        rotation={layer.properties.rotation || 0}
        opacity={opacity}
        draggable={!layer.properties.locked}
        onClick={onLayerClick}
        onDragEnd={(e) => onLayerDragEnd(e.target.x(), e.target.y())}
        align={layer.properties.textAlign || 'left'}
        verticalAlign='top'
        shadowColor={layer.properties.shadowColor}
        shadowBlur={layer.properties.shadowBlur || 0}
        shadowOffsetX={layer.properties.shadowOffsetX || 0}
        shadowOffsetY={layer.properties.shadowOffsetY || 0}
        shadowOpacity={layer.properties.shadowBlur ? 0.5 : 0}
      />
    );
  }

  if (
    (layer.type === 'sticker' ||
      layer.type === 'image' ||
      layer.type === 'gif') &&
    image
  ) {
    return (
      <Image
        image={image}
        x={layer.properties.x}
        y={layer.properties.y}
        width={width}
        height={height}
        rotation={layer.properties.rotation || 0}
        opacity={opacity}
        scaleX={layer.properties.flipH ? -1 : 1}
        scaleY={layer.properties.flipV ? -1 : 1}
        draggable={!layer.properties.locked}
        onClick={onLayerClick}
        onDragEnd={(e) => onLayerDragEnd(e.target.x(), e.target.y())}
      />
    );
  }

  return null;
}
