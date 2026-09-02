import { useState, type FormEvent } from "react";

import { useCatalogMovies } from "../../hooks/catalog/useCatalogMovies";
import type { CatalogMovie } from "../../types/catalog";

import { EmptyState } from "../ui/EmptyState";

type CatalogSearchProps = {
  selectedMovie: CatalogMovie | null;
  onSelectMovie: (movie: CatalogMovie) => void;
  onClearMovie: () => void;
};

export function CatalogSearch({
  selectedMovie,
  onSelectMovie,
  onClearMovie,
}: CatalogSearchProps) {
  const [query, setQuery] = useState(selectedMovie?.title ?? "");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [validationError, setValidationError] = useState("");

  const {
    movies,
    isLoading,
    error,
  } = useCatalogMovies(
    submittedQuery,
    submittedQuery.length >= 2,
  );

  function handleSearch(event: FormEvent) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setValidationError("Digite pelo menos 2 caracteres.");
      setSubmittedQuery("");
      return;
    }

    setValidationError("");
    setSubmittedQuery(trimmedQuery);
  }

  function handleSelectMovie(movie: CatalogMovie) {
    setQuery(movie.title);
    setSubmittedQuery("");
    setValidationError("");
    onSelectMovie(movie);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setValidationError("");

    if (selectedMovie && value !== selectedMovie.title) {
      onClearMovie();
    }
  }

  function handleClearMovie() {
    setQuery("");
    setSubmittedQuery("");
    setValidationError("");
    onClearMovie();
  }

  return (
    <div className="catalog-column">
      <div className="workspace-heading">
        <span>01</span>

        <div>
          <p>ESCOLHA O CONTEÚDO</p>
          <strong>Catálogo TMDb</strong>
        </div>
      </div>

      <form className="catalog-search" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Busque por um filme..."
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "BUSCANDO..." : "BUSCAR"}
        </button>
      </form>

      {(validationError || error) && (
        <p className="organizer-error">
          {validationError || error}
        </p>
      )}

      {movies.length > 0 && (
        <div className="catalog-results">
          {movies.map((movie) => (
            <button
              key={movie.externalId}
              type="button"
              className="catalog-result"
              onClick={() => handleSelectMovie(movie)}
            >
              <div className="catalog-poster">
                {movie.imageUrl ? (
                  <img
                    src={movie.imageUrl}
                    alt={movie.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="catalog-no-poster">
                    SEM PÔSTER
                  </div>
                )}
              </div>

              <div className="catalog-result-info">
                <span>
                  {movie.releaseDate?.slice(0, 4) || "—"}
                  {movie.rating > 0 &&
                    ` / ${movie.rating.toFixed(1)}`}
                </span>

                <strong>{movie.title}</strong>

                {movie.originalTitle !== movie.title && (
                  <small>{movie.originalTitle}</small>
                )}

                <p>
                  {movie.description ||
                    "Descrição não disponível no catálogo."}
                </p>
              </div>

              <span className="catalog-select-arrow">→</span>
            </button>
          ))}
        </div>
      )}

      {submittedQuery &&
        !isLoading &&
        !error &&
        movies.length === 0 && (
          <EmptyState
            title="Nenhum filme encontrado"
            message={`Não encontramos resultados para “${submittedQuery}”. Tente outro título.`}
          />
        )}

      {selectedMovie && (
        <article className="selected-movie">
          <div className="selected-movie-poster">
            {selectedMovie.imageUrl ? (
              <img
                src={selectedMovie.imageUrl}
                alt={selectedMovie.title}
              />
            ) : (
              <div className="catalog-no-poster">
                SEM PÔSTER
              </div>
            )}
          </div>

          <div>
            <span>
              SELECIONADO / TMDB #{selectedMovie.externalId}
            </span>

            <h2>{selectedMovie.title}</h2>

            <p>
              {selectedMovie.description ||
                "Descrição não disponível."}
            </p>

            <button
              type="button"
              onClick={handleClearMovie}
            >
              TROCAR FILME
            </button>
          </div>
        </article>
      )}
    </div>
  );
}