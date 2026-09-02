import axios from "axios";

import { api } from "./api";

import type {
  CatalogMovie,
  CatalogResponse,
} from "../types/catalog";

async function searchMovies(
  query: string,
): Promise<CatalogMovie[]> {
  try {
    const { data } =
      await api.get<CatalogResponse>(
        "/catalog/movies",
        {
          params: {
            query,
          },
        },
      );

    return data.results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Não foi possível consultar o catálogo.",
      );
    }

    throw new Error(
      "Não foi possível consultar o catálogo.",
    );
  }
}

export const catalogService = {
  searchMovies,
};
