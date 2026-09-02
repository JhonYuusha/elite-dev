import { useQuery } from "@tanstack/react-query";

import { catalogService } from "../../services/catalog.service";

export function useCatalogMovies(query: string, enabled: boolean) {
  const normalizedQuery = query.trim();

  const moviesQuery = useQuery({
    queryKey: ["catalog-movies", normalizedQuery],
    queryFn: () => catalogService.searchMovies(normalizedQuery),
    enabled: enabled && normalizedQuery.length >= 2,
    staleTime: 5 * 60_000,
  });

  return {
    movies: moviesQuery.data ?? [],
    isLoading: moviesQuery.isLoading,
    error:
      moviesQuery.error instanceof Error
        ? moviesQuery.error.message
        : "",
    refetch: moviesQuery.refetch,
  };
}
