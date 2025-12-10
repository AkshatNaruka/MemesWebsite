import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi, draftsApi } from '@/utils/api';

// Templates hook
export function useTemplates(params?: {
  page?: number;
  per_page?: number;
  category_id?: number;
  search?: string;
}) {
  return useQuery(['templates', params], () => templateApi.getTemplates(params), {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Single template hook
export function useTemplate(id: number) {
  return useQuery(['template', id], () => templateApi.getTemplate(id), {
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Create draft mutation
export function useCreateDraft() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: draftsApi.createDraft,
    onSuccess: () => {
      // Invalidate drafts queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });
}

// Update draft mutation
export function useUpdateDraft() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      draftsApi.updateDraft(id, data),
    onSuccess: (_, { id }) => {
      // Update specific draft in cache
      queryClient.invalidateQueries({ queryKey: ['draft', id] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });
}

// Search templates helper hook
export function useTemplateSearch() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<number | undefined>();
  
  const { data, isLoading, error } = useTemplates({
    search: searchTerm || undefined,
    category_id: categoryFilter,
    per_page: 50, // Load more for better UX
  });
  
  return {
    templates: data?.items || [],
    isLoading,
    error: (error as Error)?.message || null,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
  };
}