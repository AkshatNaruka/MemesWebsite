import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/utils/api';
import { useState } from 'react';

// Trending content hook
export function useTrending() {
  return useQuery(['trending'], () => contentApi.getTrending(), {
    staleTime: 60 * 60 * 1000, // 1 hour - trending content updates frequently
  });
}

// GIF search hook
export function useGifSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const query = useQuery(['gifs', searchTerm], () => contentApi.searchGifs(searchTerm), {
    enabled: hasSearched && searchTerm.length > 0,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const searchGifs = (query: string) => {
    setSearchTerm(query);
    setHasSearched(true);
  };

  return {
    gifs: query.data || [],
    isLoading: query.isLoading,
    error: (query.error as Error)?.message || null,
    searchGifs,
    hasSearched,
    searchTerm,
  };
}

// Combined trending and GIFs hook
export function useTrendingContent() {
  const trendingQuery = useTrending();
  const gifSearch = useGifSearch();

  return {
    trending: trendingQuery.data || [],
    gifs: gifSearch.gifs,
    isLoading: trendingQuery.isLoading || gifSearch.isLoading,
    error: (trendingQuery.error as Error)?.message || gifSearch.error,
    refetchTrending: trendingQuery.refetch,
    searchGifs: gifSearch.searchGifs,
    hasGifSearched: gifSearch.hasSearched,
  };
}