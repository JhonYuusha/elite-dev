export type CatalogMovie = {
  externalProvider: "TMDB";
  externalId: string;

  title: string;
  originalTitle: string;

  description: string;

  releaseDate: string | null;
  rating: number;

  imageUrl: string | null;
  backdropUrl: string | null;
};

export type CatalogResponse = {
  query: string;
  results: CatalogMovie[];
};
