import type { Request, Response } from "express";

type TmdbMovie = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
};

type TmdbSearchResponse = {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
};

export async function searchMovies(req: Request, res: Response) {
  const query =
    typeof req.query.query === "string"
      ? req.query.query.trim()
      : "";

  if (query.length < 2) {
    return res.status(400).json({
      message: "Informe pelo menos 2 caracteres para buscar um filme.",
    });
  }

  const accessToken = process.env.TMDB_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(500).json({
      message: "Integração com TMDb não configurada.",
    });
  }

  const params = new URLSearchParams({
    query,
    language: "pt-BR",
    include_adult: "false",
    page: "1",
  });

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error(
        `TMDb respondeu ${response.status} ${response.statusText}`,
      );

      return res.status(502).json({
        message: "Não foi possível consultar o catálogo de filmes.",
      });
    }

    const data = (await response.json()) as TmdbSearchResponse;

    const movies = data.results.slice(0, 10).map((movie) => ({
      externalProvider: "TMDB",
      externalId: String(movie.id),
      title: movie.title,
      originalTitle: movie.original_title,
      description: movie.overview,
      releaseDate: movie.release_date || null,
      rating: movie.vote_average,
      imageUrl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdropUrl: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
        : null,
    }));

    return res.json({
      query,
      results: movies,
    });
  } catch (error) {
    console.error("Erro ao consultar TMDb:", error);

    return res.status(502).json({
      message: "Não foi possível consultar o catálogo de filmes.",
    });
  }
}
