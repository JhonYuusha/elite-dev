import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { api } from "../services/api";
import { useAuth } from "../context/useAuth";

type CatalogMovie = {
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

type CatalogResponse = {
  query: string;
  results: CatalogMovie[];
};

type OrganizerEvent = {
  id: string;
  title: string;
  imageUrl: string | null;
  startsAt: string;
  venueName: string;
  venueAddress: string | null;
  capacity: number;
  availableTickets: number;
  priceCents: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  createdAt: string;
};

type CreateEventResponse = OrganizerEvent & {
  externalProvider: string;
  externalId: string;
  description: string | null;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(value))
    .replace(".", "")
    .toUpperCase();
}

export function OrganizerPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [events, setEvents] = useState<OrganizerEvent[]>([]);

  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogResults, setCatalogResults] = useState<CatalogMovie[]>([]);
  const [selectedMovie, setSelectedMovie] =
    useState<CatalogMovie | null>(null);

  const [startsAt, setStartsAt] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [price, setPrice] = useState("35,00");

  const [editingEventId, setEditingEventId] =
    useState<string | null>(null);

  const [addCapacity, setAddCapacity] = useState(0);
  const [editPrice, setEditPrice] = useState("");

  const [searching, setSearching] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);

  const [catalogError, setCatalogError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
  if (!user) {
    navigate("/login");
    return;
  }

  if (user.role !== "ORGANIZER") {
    navigate("/");
    return;
  }

  async function loadOrganizerEvents() {
    try {
      const { data } = await api.get<OrganizerEvent[]>(
        "/events/organizer",
      );

      setEvents(data);
    } catch {
      setFormError(
        "Não foi possível carregar suas sessões.",
      );
    }
  }

  void loadOrganizerEvents();
}, [user, navigate]);

  async function searchCatalog(event: FormEvent) {
    event.preventDefault();

    const query = catalogQuery.trim();

    if (query.length < 2) {
      setCatalogError(
        "Digite pelo menos 2 caracteres.",
      );
      return;
    }

    try {
      setSearching(true);
      setCatalogError("");
      setCatalogResults([]);

      const { data } = await api.get<CatalogResponse>(
        "/catalog/movies",
        {
          params: {
            query,
          },
        },
      );

      setCatalogResults(data.results);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setCatalogError(
          requestError.response?.data?.message ??
            "Não foi possível consultar o catálogo.",
        );
      } else {
        setCatalogError(
          "Não foi possível consultar o catálogo.",
        );
      }
    } finally {
      setSearching(false);
    }
  }

  function selectMovie(movie: CatalogMovie) {
    setSelectedMovie(movie);
    setCatalogResults([]);
    setCatalogQuery(movie.title);
    setFormError("");
    setSuccess("");
  }

  async function publishEvent(event: FormEvent) {
    event.preventDefault();

    if (!selectedMovie) {
      setFormError(
        "Selecione um filme do catálogo antes de publicar.",
      );
      return;
    }

    if (
      !startsAt ||
      !venueName.trim() ||
      !venueAddress.trim()
    ) {
      setFormError(
        "Preencha data, local e endereço.",
      );
      return;
    }

    if (
      !Number.isInteger(capacity) ||
      capacity <= 0
    ) {
      setFormError(
        "Informe uma capacidade válida.",
      );
      return;
    }

    const normalizedPrice = Number(
      price.replace(".", "").replace(",", "."),
    );

    if (
      !Number.isFinite(normalizedPrice) ||
      normalizedPrice <= 0
    ) {
      setFormError(
        "Informe um preço válido.",
      );
      return;
    }

    try {
      setPublishing(true);
      setFormError("");
      setSuccess("");

      const { data } =
        await api.post<CreateEventResponse>(
          "/events",
          {
            externalId: selectedMovie.externalId,
            startsAt: new Date(
              startsAt,
            ).toISOString(),
            venueName: venueName.trim(),
            venueAddress: venueAddress.trim(),
            capacity,
            priceCents: Math.round(
              normalizedPrice * 100,
            ),
          },
        );

      setEvents((current) => [
        data,
        ...current,
      ]);

      setSuccess(
        `${data.title} foi publicado na programação.`,
      );

      setSelectedMovie(null);
      setCatalogQuery("");
      setStartsAt("");
      setVenueName("");
      setVenueAddress("");
      setCapacity(100);
      setPrice("35,00");
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setFormError(
          requestError.response?.data?.message ??
            "Não foi possível publicar o evento.",
        );
      } else {
        setFormError(
          "Não foi possível publicar o evento.",
        );
      }
    } finally {
      setPublishing(false);
    }
  }

  function startEditing(event: OrganizerEvent) {
    setEditingEventId(event.id);

    setAddCapacity(0);

    setEditPrice(
      (event.priceCents / 100)
        .toFixed(2)
        .replace(".", ","),
    );

    setFormError("");
    setSuccess("");
  }

  async function saveEvent(eventId: string) {
    const normalizedPrice = Number(
      editPrice
        .replace(".", "")
        .replace(",", "."),
    );

    if (
      !Number.isFinite(normalizedPrice) ||
      normalizedPrice <= 0
    ) {
      setFormError(
        "Informe um preço válido.",
      );
      return;
    }

    if (
      !Number.isInteger(addCapacity) ||
      addCapacity < 0
    ) {
      setFormError(
        "Informe uma quantidade válida de novos lugares.",
      );
      return;
    }

    try {
      setSavingEvent(true);
      setFormError("");
      setSuccess("");

      const payload: {
        priceCents: number;
        addCapacity?: number;
      } = {
        priceCents: Math.round(
          normalizedPrice * 100,
        ),
      };

      if (addCapacity > 0) {
        payload.addCapacity = addCapacity;
      }

      const { data } =
        await api.patch<OrganizerEvent>(
          `/events/${eventId}`,
          payload,
        );

      setEvents((current) =>
        current.map((event) =>
          event.id === eventId
            ? data
            : event,
        ),
      );

      setEditingEventId(null);
      setAddCapacity(0);

      setSuccess(
        "Sessão atualizada com sucesso.",
      );
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setFormError(
          requestError.response?.data?.message ??
            "Não foi possível atualizar a sessão.",
        );
      } else {
        setFormError(
          "Não foi possível atualizar a sessão.",
        );
      }
    } finally {
      setSavingEvent(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <main className="organizer-page">
      <header className="organizer-header">
        <Link to="/" className="brand">
          ELITE
          <span>/TICKETS</span>
        </Link>

        <nav>
          <span className="organizer-user">
            {user?.name}
          </span>

          <Link to="/">
            Ver programação
          </Link>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Sair
          </button>
        </nav>
      </header>

      <section className="organizer-intro">
        <div>
          <p className="eyebrow">
            PROGRAMAÇÃO / ORGANIZADOR
          </p>

          <h1>
            MONTE SUA
            <br />
            PRÓXIMA SESSÃO.
          </h1>
        </div>

        <p>
          O filme vem do catálogo TMDb.
          Data, local, capacidade e preço
          pertencem à sua sessão.
        </p>
      </section>

      <section className="programming-workspace">
        <div className="catalog-column">
          <div className="workspace-heading">
            <span>01</span>

            <div>
              <p>
                ESCOLHA O CONTEÚDO
              </p>

              <strong>
                Catálogo TMDb
              </strong>
            </div>
          </div>

          <form
            className="catalog-search"
            onSubmit={searchCatalog}
          >
            <input
              type="search"
              placeholder="Busque por um filme..."
              value={catalogQuery}
              onChange={(event) => {
                setCatalogQuery(
                  event.target.value,
                );

                if (
                  selectedMovie &&
                  event.target.value !==
                    selectedMovie.title
                ) {
                  setSelectedMovie(null);
                }
              }}
            />

            <button
              type="submit"
              disabled={searching}
            >
              {searching
                ? "BUSCANDO..."
                : "BUSCAR"}
            </button>
          </form>

          {catalogError && (
            <p className="organizer-error">
              {catalogError}
            </p>
          )}

          {catalogResults.length > 0 && (
            <div className="catalog-results">
              {catalogResults.map(
                (movie) => (
                  <button
                    key={
                      movie.externalId
                    }
                    type="button"
                    className="catalog-result"
                    onClick={() =>
                      selectMovie(movie)
                    }
                  >
                    <div className="catalog-poster">
                      {movie.imageUrl ? (
                        <img
                          src={
                            movie.imageUrl
                          }
                          alt={
                            movie.title
                          }
                        />
                      ) : (
                        <div className="catalog-no-poster">
                          SEM PÔSTER
                        </div>
                      )}
                    </div>

                    <div className="catalog-result-info">
                      <span>
                        {movie.releaseDate?.slice(
                          0,
                          4,
                        ) || "—"}

                        {movie.rating > 0 &&
                          ` / ${movie.rating.toFixed(
                            1,
                          )}`}
                      </span>

                      <strong>
                        {movie.title}
                      </strong>

                      {movie.originalTitle !==
                        movie.title && (
                        <small>
                          {
                            movie.originalTitle
                          }
                        </small>
                      )}

                      <p>
                        {movie.description ||
                          "Descrição não disponível no catálogo."}
                      </p>
                    </div>

                    <span className="catalog-select-arrow">
                      →
                    </span>
                  </button>
                ),
              )}
            </div>
          )}

          {selectedMovie && (
            <article className="selected-movie">
              <div className="selected-movie-poster">
                {selectedMovie.imageUrl ? (
                  <img
                    src={
                      selectedMovie.imageUrl
                    }
                    alt={
                      selectedMovie.title
                    }
                  />
                ) : (
                  <div className="catalog-no-poster">
                    SEM PÔSTER
                  </div>
                )}
              </div>

              <div>
                <span>
                  SELECIONADO / TMDB #
                  {
                    selectedMovie.externalId
                  }
                </span>

                <h2>
                  {selectedMovie.title}
                </h2>

                <p>
                  {selectedMovie.description ||
                    "Descrição não disponível."}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMovie(null);
                    setCatalogQuery("");
                  }}
                >
                  TROCAR FILME
                </button>
              </div>
            </article>
          )}
        </div>

        <div className="session-column">
          <div className="workspace-heading">
            <span>02</span>

            <div>
              <p>
                CONFIGURE A EXIBIÇÃO
              </p>

              <strong>
                Dados da sessão
              </strong>
            </div>
          </div>

          <form
            className="session-form"
            onSubmit={publishEvent}
          >
            <label>
              <span>
                DATA E HORÁRIO
              </span>

              <input
                type="datetime-local"
                value={startsAt}
                onChange={(event) =>
                  setStartsAt(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>LOCAL</span>

              <input
                type="text"
                placeholder="Ex.: Cine Elite"
                value={venueName}
                onChange={(event) =>
                  setVenueName(
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              <span>ENDEREÇO</span>

              <input
                type="text"
                placeholder="Ex.: Uberlândia - MG"
                value={venueAddress}
                onChange={(event) =>
                  setVenueAddress(
                    event.target.value,
                  )
                }
              />
            </label>

            <div className="session-form-row">
              <label>
                <span>
                  CAPACIDADE
                </span>

                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(event) =>
                    setCapacity(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                />
              </label>

              <label>
                <span>
                  PREÇO / R$
                </span>

                <input
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(event) =>
                    setPrice(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            {formError && (
              <p className="organizer-error">
                {formError}
              </p>
            )}

            {success && (
              <p className="organizer-success">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="publish-button"
              disabled={
                !selectedMovie ||
                publishing
              }
            >
              <span>
                {publishing
                  ? "PUBLICANDO..."
                  : "PUBLICAR NA PROGRAMAÇÃO"}
              </span>

              <span>→</span>
            </button>
          </form>
        </div>
      </section>

      <section className="organizer-events">
        <div className="section-heading">
          <p>SUAS SESSÕES</p>

          <span>
            {events.length} cadastradas
          </span>
        </div>

        <div className="organizer-event-list">
          {events.map((event) => (
            <article
              className="organizer-event-row"
              key={event.id}
            >
              <div className="organizer-event-poster">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                  />
                ) : (
                  <div className="catalog-no-poster">
                    SEM PÔSTER
                  </div>
                )}
              </div>

              <div className="organizer-event-title">
                <span>
                  {formatDate(
                    event.startsAt,
                  )}
                </span>

                <strong>
                  {event.title}
                </strong>

                <p>
                  {event.venueName}
                </p>
              </div>

              {editingEventId ===
              event.id ? (
                <div className="organizer-event-editor">
                  <label>
                    ADICIONAR LUGARES

                    <input
                      type="number"
                      min="0"
                      value={addCapacity}
                      onChange={(event) =>
                        setAddCapacity(
                          Number(
                            event.target
                              .value,
                          ),
                        )
                      }
                    />
                  </label>

                  <label>
                    PREÇO

                    <input
                      type="text"
                      value={editPrice}
                      onChange={(event) =>
                        setEditPrice(
                          event.target
                            .value,
                        )
                      }
                    />
                  </label>

                  <button
                    type="button"
                    disabled={savingEvent}
                    onClick={() =>
                      saveEvent(
                        event.id,
                      )
                    }
                  >
                    {savingEvent
                      ? "SALVANDO..."
                      : "SALVAR"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingEventId(
                        null,
                      );

                      setAddCapacity(
                        0,
                      );
                    }}
                  >
                    FECHAR
                  </button>
                </div>
              ) : (
                <>
                  <div className="organizer-event-stat">
                    <span>
                      OCUPADOS
                    </span>

                    <strong>
                      {event.capacity -
                        event.availableTickets}

                      <small>
                        {" "}
                        / {event.capacity}
                      </small>
                    </strong>
                  </div>

                  <div className="organizer-event-stat">
                    <span>
                      DISPONÍVEIS
                    </span>

                    <strong>
                      {
                        event.availableTickets
                      }
                    </strong>
                  </div>

                  <div className="organizer-event-stat">
                    <span>
                      PREÇO
                    </span>

                    <strong>
                      {formatMoney(
                        event.priceCents,
                      )}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="manage-event-button"
                    onClick={() =>
                      startEditing(event)
                    }
                  >
                    GERENCIAR
                  </button>
                </>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}