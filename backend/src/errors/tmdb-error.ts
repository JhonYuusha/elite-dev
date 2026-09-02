export type TmdbErrorCode =
  | "TMDB_NOT_CONFIGURED"
  | "TMDB_MOVIE_NOT_FOUND"
  | "TMDB_REQUEST_FAILED";

export class TmdbError extends Error {
  constructor(
    public readonly code: TmdbErrorCode,
  ) {
    super(code);

    this.name = "TmdbError";
  }
}