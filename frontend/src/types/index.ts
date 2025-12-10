// API Types
export interface Template {
  id: number;
  name: string;
  image_url: string;
  category_id?: number;
  category?: {
    id: number;
    name: string;
  };
  created_at: string;
}

export interface TemplateDetail extends Template {
  fields: TemplateField[];
}

export interface TemplateField {
  id: number;
  name: string;
  x_pos: number;
  y_pos: number;
  width: number;
  height: number;
  default_font_id?: number;
  default_color?: string;
}

export interface Sticker {
  id: number;
  name: string;
  image_url: string;
  category_id?: number;
  category?: {
    id: number;
    name: string;
  };
}

export interface Font {
  id: number;
  name: string;
  font_family: string;
  file_path?: string;
}

export interface StickerCategory {
  id: number;
  name: string;
}

export interface TemplateCategory {
  id: number;
  name: string;
}

export interface AssetCategories {
  templates: TemplateCategory[];
  stickers: StickerCategory[];
}

export interface TrendingItem {
  id: string;
  title: string;
  image_url: string;
  score?: number;
  source: string;
}

export interface GifItem {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    preview_gif: {
      url: string;
      width: string;
      height: string;
    };
  };
}

export interface Meme {
  id: number;
  title: string;
  image_url: string;
  user_id: number;
  template_id?: number;
  layers?: MemeLayer[];
  created_at: string;
}

export interface MemeLayer {
  id: number;
  meme_id: number;
  layer_type: string;
  content: string;
  properties: Record<string, any>;
  z_index: number;
}

export interface MemeDraft {
  id: number;
  title: string;
  user_id: number;
  template_id?: number;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  page: number;
  per_page: number;
  total: number;
  items: T[];
}

export interface ApiError {
  error: string;
  message: string;
  status_code: number;
}

// Editor State Types
export interface EditorState {
  selectedTemplate: TemplateDetail | null;
  activeLayers: Layer[];
  currentUserId: number;
  isLoading: boolean;
  error: string | null;
}

export interface Layer {
  id: string;
  type: 'text' | 'sticker' | 'image' | 'gif';
  content: string;
  properties: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    rotation?: number;
    zIndex: number;
  };
  isActive: boolean;
}

// Component Props Types
export interface SidebarProps {
  className?: string;
}

export interface CanvasProps {
  className?: string;
}

export interface PropertiesPanelProps {
  className?: string;
}

export interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// Hook Return Types
export interface UseTemplatesReturn {
  templates: Template[];
  categories: TemplateCategory[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  searchTemplates: (query: string) => void;
  filterByCategory: (categoryId: number) => void;
}

export interface UseAssetsReturn {
  stickers: Sticker[];
  fonts: Font[];
  stickerCategories: StickerCategory[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseTrendingReturn {
  trending: TrendingItem[];
  gifs: GifItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  searchGifs: (query: string) => void;
}