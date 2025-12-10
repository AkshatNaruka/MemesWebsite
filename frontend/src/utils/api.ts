import type {
  Template,
  TemplateDetail,
  Sticker,
  Font,
  AssetCategories,
  TrendingItem,
  GifItem,
  Meme,
  MemeDraft,
  PaginatedResponse,
  ApiError,
} from '@/types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Generic fetch wrapper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}

// Template API
export const templateApi = {
  getTemplates: async (params?: {
    page?: number;
    per_page?: number;
    category_id?: number;
    search?: string;
  }): Promise<PaginatedResponse<Template>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.category_id) searchParams.append('category_id', params.category_id.toString());
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    return apiRequest<PaginatedResponse<Template>>(
      `/templates${queryString ? `?${queryString}` : ''}`
    );
  },

  getTemplate: async (id: number): Promise<TemplateDetail> => {
    return apiRequest<TemplateDetail>(`/templates/${id}`);
  },
};

// Assets API
export const assetsApi = {
  getStickers: async (categoryId?: number): Promise<Sticker[]> => {
    const queryString = categoryId ? `?category_id=${categoryId}` : '';
    return apiRequest<Sticker[]>(`/stickers${queryString}`);
  },

  getFonts: async (): Promise<Font[]> => {
    return apiRequest<Font[]>('/fonts');
  },

  getAssetCategories: async (): Promise<AssetCategories> => {
    return apiRequest<AssetCategories>('/assets/categories');
  },
};

// Trending & GIFs API
export const contentApi = {
  getTrending: async (): Promise<TrendingItem[]> => {
    return apiRequest<TrendingItem[]>('/trending');
  },

  searchGifs: async (query: string, limit = 20): Promise<GifItem[]> => {
    const searchParams = new URLSearchParams({
      query,
      limit: limit.toString(),
    });
    return apiRequest<GifItem[]>(`/gifs?${searchParams.toString()}`);
  },
};

// Memes API
export const memesApi = {
  getMemes: async (params?: {
    page?: number;
    per_page?: number;
    user_id?: number;
  }): Promise<PaginatedResponse<Meme>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.user_id) searchParams.append('user_id', params.user_id.toString());
    
    const queryString = searchParams.toString();
    return apiRequest<PaginatedResponse<Meme>>(
      `/memes${queryString ? `?${queryString}` : ''}`
    );
  },

  createMeme: async (data: {
    title: string;
    image_url: string;
    user_id: number;
    template_id?: number;
    layers?: any[];
  }): Promise<Meme> => {
    return apiRequest<Meme>('/memes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMeme: async (id: number): Promise<Meme> => {
    return apiRequest<Meme>(`/memes/${id}`);
  },
};

// Drafts API
export const draftsApi = {
  createDraft: async (data: {
    title: string;
    user_id: number;
    template_id?: number;
    data: Record<string, any>;
  }): Promise<MemeDraft> => {
    return apiRequest<MemeDraft>('/memes/draft', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDraft: async (id: number, data: Partial<{
    title: string;
    template_id?: number;
    data: Record<string, any>;
  }>): Promise<MemeDraft> => {
    return apiRequest<MemeDraft>(`/memes/draft/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getDraft: async (id: number): Promise<MemeDraft> => {
    return apiRequest<MemeDraft>(`/memes/draft/${id}`);
  },

  deleteDraft: async (id: number): Promise<void> => {
    await apiRequest<void>(`/memes/draft/${id}`, {
      method: 'DELETE',
    });
  },

  getDrafts: async (params?: {
    page?: number;
    per_page?: number;
    user_id?: number;
  }): Promise<PaginatedResponse<Pick<MemeDraft, 'id' | 'title' | 'created_at' | 'updated_at'>>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.user_id) searchParams.append('user_id', params.user_id.toString());
    
    const queryString = searchParams.toString();
    return apiRequest<PaginatedResponse<Pick<MemeDraft, 'id' | 'title' | 'created_at' | 'updated_at'>>>(
      `/memes/drafts${queryString ? `?${queryString}` : ''}`
    );
  },
};