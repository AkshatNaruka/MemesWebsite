import React from 'react';
import { X, TrendingUp, Search, Loader2 } from 'lucide-react';
import { useTrendingContent } from '@/hooks/useTrending';
import { cn } from '@/utils';

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function BottomDrawer({ isOpen, onClose, className }: BottomDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<'trending' | 'gifs'>('trending');
  const [gifQuery, setGifQuery] = React.useState('');

  const {
    trending,
    gifs,
    isLoading,
    error,
    searchGifs,
    hasGifSearched,
  } = useTrendingContent();

  const handleGifSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (gifQuery.trim()) {
      searchGifs(gifQuery.trim());
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-y-0" : "translate-y-full",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Content Browser</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('trending')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  activeTab === 'trending'
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <TrendingUp className="w-4 h-4" />
                Trending
              </button>
              <button
                onClick={() => setActiveTab('gifs')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  activeTab === 'gifs'
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Search className="w-4 h-4" />
                GIFs
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="h-80 overflow-hidden">
          {activeTab === 'trending' && (
            <TrendingContent 
              trending={trending} 
              isLoading={isLoading} 
              error={error} 
            />
          )}

          {activeTab === 'gifs' && (
            <GifContent
              gifs={gifs}
              isLoading={isLoading}
              error={error}
              gifQuery={gifQuery}
              setGifQuery={setGifQuery}
              handleGifSearch={handleGifSearch}
              hasSearched={hasGifSearched}
            />
          )}
        </div>

        {/* Resize Handle */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded-full -translate-y-0.5" />
      </div>
    </>
  );
}

// Trending Content Component
function TrendingContent({ 
  trending, 
  isLoading, 
  error 
}: { 
  trending: any[]; 
  isLoading: boolean; 
  error: string | null;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <p className="text-red-500 mb-2">Failed to load trending content</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!trending.length) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No trending content available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="grid grid-cols-3 gap-3">
        {trending.map((item) => (
          <TrendingItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

// GIF Content Component
function GifContent({
  gifs,
  isLoading,
  error,
  gifQuery,
  setGifQuery,
  handleGifSearch,
  hasSearched,
}: {
  gifs: any[];
  isLoading: boolean;
  error: string | null;
  gifQuery: string;
  setGifQuery: (query: string) => void;
  handleGifSearch: (e: React.FormEvent) => void;
  hasSearched: boolean;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Search Form */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleGifSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for GIFs..."
              value={gifQuery}
              onChange={(e) => setGifQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!gifQuery.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && hasSearched && (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}

        {error && hasSearched && (
          <div className="flex items-center justify-center h-32 text-center">
            <div>
              <p className="text-red-500 mb-2">Failed to search GIFs</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        )}

        {!hasSearched && (
          <div className="flex items-center justify-center h-32 text-center">
            <div>
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Search for GIFs to get started</p>
            </div>
          </div>
        )}

        {hasSearched && !isLoading && !error && gifs.length === 0 && (
          <div className="flex items-center justify-center h-32 text-center">
            <div>
              <p className="text-gray-500">No GIFs found for "{gifQuery}"</p>
            </div>
          </div>
        )}

        {gifs.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {gifs.map((gif) => (
              <GifItemCard key={gif.id} gif={gif} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Trending Item Card
function TrendingItemCard({ item }: { item: any }) {
  return (
    <div className="group cursor-pointer aspect-square border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 hover:shadow-sm transition-all">
      <img
        src={item.image_url}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwQzEwMCA5NS41NDMxIDk1LjU0MzEgOTIgOTIgOTJIMTA4QzExMiA5MiAxMTYgOTUuNTQzMSAxMTYgMTAwVjExMkMxMTYgMTE2LjQ1NyAxMTIgMTIwIDExMiAxMjBINThDNTggMTIwIDU0IDExNi40NTcgNTQgMTEyVjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs truncate">{item.title}</p>
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs">{item.score || 0}</span>
        </div>
      </div>
    </div>
  );
}

// GIF Item Card
function GifItemCard({ gif }: { gif: any }) {
  return (
    <div className="group cursor-pointer aspect-square border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 hover:shadow-sm transition-all">
      <img
        src={gif.images.preview_gif?.url || gif.images.fixed_height?.url}
        alt={gif.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwQzEwMCA5NS41NDMxIDk1LjU0MzEgOTIgOTIgOTJIMTA4QzExMiA5MiAxMTYgOTUuNTQzMSAxMTYgMTAwVjExMkMxMTYgMTE2LjQ1NyAxMTIgMTIwIDExMiAxMjBINThDNTggMTIwIDU0IDExNi40NTcgNTQgMTEyVjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs truncate">{gif.title}</p>
      </div>
    </div>
  );
}