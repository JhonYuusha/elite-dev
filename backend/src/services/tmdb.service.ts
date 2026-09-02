import { TmdbError } from "../errors/tmdb-error.js";

type TmdbMovieDetails = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
};

export async function getTmdbMovie(
  movieId: string,
) {
  const accessToken =
    process.env.TMDB_ACCESS_TOKEN;

  if (!accessToken) {
    throw new TmdbError(
      "TMDB_NOT_CONFIGURED",
    );
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${encodeURIComponent(movieId)}?language=pt-BR`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: "application/json",
      },
    },
  );

  if (response.status === 404) {
    throw new TmdbError(
      "TMDB_MOVIE_NOT_FOUND",
    );
  }

  if (!response.ok) {
    throw new TmdbError(
      "TMDB_REQUEST_FAILED",
    );
  }

  const movie =
    (await response.json()) as TmdbMovieDetails;

  return {
    externalProvider: "TMDB",
    externalId: String(movie.id),

    title: movie.title,
    originalTitle: movie.original_title,

    description:
      movie.overview || null,

    imageUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,

    backdropUrl: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
      : null,

    releaseDate:
      movie.release_date || null,

    rating: movie.vote_average,
  };
}