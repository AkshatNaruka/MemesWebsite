import React from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import { useTemplates } from '@/hooks/useTemplates';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [activeTab, setActiveTab] = React.useState<'templates' | 'stickers' | 'text' | 'fonts'>('templates');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);
  const { state, actions } = useEditor();

  const { data: assets, isLoading: assetsLoading } = useAssets();
  const { data: templatesData, isLoading: templatesLoading } = useTemplates({
    search: searchTerm || undefined,
    category_id: selectedCategory || undefined,
    per_page: 20,
  });

  const isLoading = activeTab === 'templates' ? templatesLoading : assetsLoading;

  const tabs = [
    { id: 'templates', label: 'Templates', icon: Grid },
    { id: 'stickers', label: 'Stickers', icon: List },
    { id: 'text', label: 'Text', icon: Filter },
    { id: 'fonts', label: 'Fonts', icon: Filter },
  ] as const;

  const handleAddTextLayer = () => {
    if (state.selectedTemplate) {
      actions.addLayer({
        type: 'text',
        content: 'Add text here',
        properties: {
          x: 50,
          y: 50,
          fontSize: 32,
          fontFamily: 'Arial',
          color: '#000000',
          zIndex: state.activeLayers.length,
          visible: true,
          textAlign: 'center'
        },
        isActive: true
      });
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-gray-200 h-full",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Assets</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {/* Category Filter for Templates */}
        {activeTab === 'templates' && assets?.templateCategories && (
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">All Categories</option>
            {assets.templateCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}

        {/* Category Filter for Stickers */}
        {activeTab === 'stickers' && assets?.stickerCategories && (
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">All Categories</option>
            {assets.stickerCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600 bg-primary-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <>
            {/* Templates */}
            {activeTab === 'templates' && (
              <div className="space-y-3">
                {templatesData?.items.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
                {templatesData?.items.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Grid className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No templates found</p>
                  </div>
                )}
              </div>
            )}

            {/* Stickers */}
            {activeTab === 'stickers' && (
              <div className="grid grid-cols-2 gap-3">
                {assets?.stickers.map((sticker) => (
                  <StickerCard key={sticker.id} sticker={sticker} />
                ))}
                {assets?.stickers.length === 0 && (
                  <div className="col-span-2 text-center text-gray-500 py-8">
                    <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No stickers found</p>
                  </div>
                )}
              </div>
            )}

            {/* Text */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                <button
                  onClick={handleAddTextLayer}
                  disabled={!state.selectedTemplate}
                  className="w-full p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-primary-600"
                >
                  + Add Text Layer
                </button>
                {!state.selectedTemplate && (
                  <div className="text-center text-gray-500 py-8">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a template to add text</p>
                  </div>
                )}
              </div>
            )}

            {/* Fonts */}
            {activeTab === 'fonts' && (
              <div className="space-y-2">
                {assets?.fonts.map((font) => (
                  <FontCard key={font.id} font={font} />
                ))}
                {assets?.fonts.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No fonts found</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Template Card Component
function TemplateCard({ template }: { template: any }) {
  const { actions } = useEditor();

  const handleClick = () => {
    actions.setSelectedTemplate(template);
  };

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
    >
      <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
        <img
          src={template.image_url}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwQzEwMCA5NS41NDMxIDk1LjU0MzEgOTIgOTIgOTJIMTA4QzExMiA5MiAxMTYgOTUuNTQzMSAxMTYgMTAwVjExMkMxMTYgMTE2LjQ1NyAxMTIgMTIwIDExMiAxMjBINThDNTggMTIwIDU0IDExNi40NTcgNTQgMTEyVjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
          }}
        />
      </div>
      <h3 className="text-sm font-medium text-gray-900 truncate">{template.name}</h3>
      {template.category && (
        <p className="text-xs text-gray-500">{template.category.name}</p>
      )}
    </div>
  );
}

// Sticker Card Component
function StickerCard({ sticker }: { sticker: any }) {
  const { actions, state } = useEditor();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'sticker',
      content: sticker.image_url,
      name: sticker.name
    }));
  };

  const handleClick = () => {
    if (state.selectedTemplate) {
      actions.addLayer({
        type: 'sticker',
        content: sticker.image_url,
        properties: {
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          zIndex: state.activeLayers.length,
          visible: true,
          name: sticker.name
        },
        isActive: true
      });
    }
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      className="group cursor-grab active:cursor-grabbing aspect-square border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 hover:shadow-sm transition-all"
      title="Drag to canvas or click to add"
    >
      <img
        src={sticker.image_url}
        alt={sticker.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwQzEwMCA5NS41NDMxIDk1LjU0MzEgOTIgOTIgOTJIMTA4QzExMiA5MiAxMTYgOTUuNTQzMSAxMTYgMTAwVjExMkMxMTYgMTE2LjQ1NyAxMTIgMTIwIDExMiAxMjBINThDNTggMTIwIDU0IDExNi40NTcgNTQgMTEyVjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
        }}
        draggable={false}
      />
    </div>
  );
}

// Font Card Component
function FontCard({ font }: { font: any }) {
  return (
    <div className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer">
      <div className="text-lg" style={{ fontFamily: font.font_family }}>
        {font.name}
      </div>
      <p className="text-xs text-gray-500 mt-1">{font.font_family}</p>
    </div>
  );
}