import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '@/utils/api';

// All assets hook
export function useAssets() {
  return useQuery(['assets'], async () => {
    const [stickers, fonts, categories] = await Promise.all([
      assetsApi.getStickers(),
      assetsApi.getFonts(),
      assetsApi.getAssetCategories(),
    ]);

    return {
      stickers,
      fonts,
      stickerCategories: categories.stickers,
      templateCategories: categories.templates,
    };
  }, {
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Stickers hook
export function useStickers(categoryId?: number) {
  return useQuery(['stickers', categoryId], () => assetsApi.getStickers(categoryId), {
    staleTime: 10 * 60 * 1000,
  });
}

// Fonts hook
export function useFonts() {
  return useQuery(['fonts'], () => assetsApi.getFonts(), {
    staleTime: 30 * 60 * 1000, // 30 minutes - fonts change rarely
  });
}

// Asset categories hook
export function useAssetCategories() {
  return useQuery(['asset-categories'], () => assetsApi.getAssetCategories(), {
    staleTime: 30 * 60 * 1000, // 30 minutes - categories change rarely
  });
}