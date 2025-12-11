import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/utils';
import { RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  className?: string;
}

export function FilterPanel({ className }: FilterPanelProps) {
  const { state, actions } = useEditor();
  const filters = state.filters;

  const handleFilterChange = (filterName: keyof typeof filters, value: number) => {
    actions.setFilter({ [filterName]: value });
  };

  const handleResetFilters = () => {
    actions.resetFilters();
  };

  const hasActiveFilters = Object.entries(filters).some((entry) => {
    const [key, value] = entry as [string, number];
    if (key === 'brightness') return value !== 100;
    if (key === 'contrast') return value !== 100;
    if (key === 'saturation') return value !== 100;
    if (key === 'blur') return value !== 0;
    if (key === 'hueRotate') return value !== 0;
    return false;
  });

  return (
    <div
      className={cn(
        'flex flex-col bg-white border-l border-gray-200 h-full',
        className
      )}
    >
      {/* Header */}
      <div className='p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-900'>Filters & Effects</h2>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className='p-1 rounded hover:bg-gray-200 transition-colors'
            title='Reset all filters'
          >
            <RotateCcw className='w-4 h-4 text-gray-600' />
          </button>
        )}
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 space-y-6'>
        {/* Brightness */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='text-sm font-medium text-gray-900'>Brightness</label>
            <span className='text-sm text-gray-600 font-medium'>
              {filters.brightness}%
            </span>
          </div>
          <input
            type='range'
            min='0'
            max='200'
            value={filters.brightness}
            onChange={(e) => handleFilterChange('brightness', Number(e.target.value))}
            className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
          />
          <p className='text-xs text-gray-500 mt-1'>0% = black, 100% = normal, 200% = white</p>
        </div>

        {/* Contrast */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='text-sm font-medium text-gray-900'>Contrast</label>
            <span className='text-sm text-gray-600 font-medium'>
              {filters.contrast}%
            </span>
          </div>
          <input
            type='range'
            min='0'
            max='200'
            value={filters.contrast}
            onChange={(e) => handleFilterChange('contrast', Number(e.target.value))}
            className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
          />
          <p className='text-xs text-gray-500 mt-1'>
            Lower = flat, 100% = normal, Higher = vivid
          </p>
        </div>

        {/* Saturation */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='text-sm font-medium text-gray-900'>Saturation</label>
            <span className='text-sm text-gray-600 font-medium'>
              {filters.saturation}%
            </span>
          </div>
          <input
            type='range'
            min='0'
            max='200'
            value={filters.saturation}
            onChange={(e) => handleFilterChange('saturation', Number(e.target.value))}
            className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
          />
          <p className='text-xs text-gray-500 mt-1'>
            0% = grayscale, 100% = normal, 200% = super saturated
          </p>
        </div>

        {/* Blur */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='text-sm font-medium text-gray-900'>Blur</label>
            <span className='text-sm text-gray-600 font-medium'>
              {filters.blur}px
            </span>
          </div>
          <input
            type='range'
            min='0'
            max='50'
            value={filters.blur}
            onChange={(e) => handleFilterChange('blur', Number(e.target.value))}
            className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
          />
          <p className='text-xs text-gray-500 mt-1'>Gaussian blur in pixels</p>
        </div>

        {/* Hue Rotate */}
        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='text-sm font-medium text-gray-900'>Hue Rotate</label>
            <span className='text-sm text-gray-600 font-medium'>
              {filters.hueRotate}°
            </span>
          </div>
          <input
            type='range'
            min='0'
            max='360'
            value={filters.hueRotate}
            onChange={(e) => handleFilterChange('hueRotate', Number(e.target.value))}
            className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
          />
          <p className='text-xs text-gray-500 mt-1'>Rotate colors around color wheel</p>
        </div>

        {/* Filter Preview */}
        {hasActiveFilters && (
          <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='text-xs font-medium text-blue-900 mb-2'>Active Filters:</p>
            <ul className='text-xs text-blue-800 space-y-1'>
              {filters.brightness !== 100 && (
                <li>• Brightness: {filters.brightness}%</li>
              )}
              {filters.contrast !== 100 && (
                <li>• Contrast: {filters.contrast}%</li>
              )}
              {filters.saturation !== 100 && (
                <li>• Saturation: {filters.saturation}%</li>
              )}
              {filters.blur !== 0 && <li>• Blur: {filters.blur}px</li>}
              {filters.hueRotate !== 0 && <li>• Hue Rotate: {filters.hueRotate}°</li>}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className='p-3 border-t border-gray-200 bg-gray-50'>
        <p className='text-xs text-gray-500'>
          Filters are applied to the entire canvas
        </p>
      </div>
    </div>
  );
}
