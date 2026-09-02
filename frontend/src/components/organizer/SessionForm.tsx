import { useState, type FormEvent } from "react";

import type { CatalogMovie } from "../../types/catalog";
import { parseMoneyToCents } from "../../utils/money";
import { getMinDateTimeLocal } from "../../utils/date";

export type SessionFormData = {
  externalId: string;
  startsAt: string;
  venueName: string;
  venueAddress: string;
  capacity: number;
  priceCents: number;
};

type SessionFormProps = {
  selectedMovie: CatalogMovie | null;
  publishing: boolean;
  error: string;
  success: string;
  onPublish: (data: SessionFormData) => Promise<boolean>;
};

export function SessionForm({
  selectedMovie,
  publishing,
  error,
  success,
  onPublish,
}: SessionFormProps) {
  const [startsAt, setStartsAt] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [price, setPrice] = useState("35,00");
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setValidationError("");

    if (!selectedMovie) {
      setValidationError("Selecione um filme do catálogo antes de publicar.");
      return;
    }

    if (!startsAt || !venueName.trim() || !venueAddress.trim()) {
      setValidationError("Preencha data, local e endereço.");
      return;
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      setValidationError("Informe uma capacidade válida.");
      return;
    }

    const parsedStartsAt = new Date(startsAt);

    if (
      Number.isNaN(parsedStartsAt.getTime()) ||
      parsedStartsAt <= new Date()
    ) {
      setValidationError(
        "Escolha uma data e horário futuros para a sessão.",
      );
      return;
    }

    const priceCents = parseMoneyToCents(price);

    if (priceCents === null) {
      setValidationError("Informe um preço válido.");
      return;
    }

    const published = await onPublish({
      externalId: selectedMovie.externalId,
      startsAt: parsedStartsAt.toISOString(),
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      capacity,
      priceCents,
    });

    if (!published) return;

    setStartsAt("");
    setVenueName("");
    setVenueAddress("");
    setCapacity(100);
    setPrice("35,00");
    setValidationError("");
  }

  return (
    <div className="session-column">
      <div className="workspace-heading">
        <span>02</span>

        <div>
          <p>CONFIGURE A EXIBIÇÃO</p>
          <strong>Dados da sessão</strong>
        </div>
      </div>

      <form className="session-form" onSubmit={handleSubmit}>
        <label>
          <span>DATA E HORÁRIO</span>

          <input
            type="datetime-local"
            value={startsAt}
            min={getMinDateTimeLocal()}
            onChange={(event) => setStartsAt(event.target.value)}
          />
        </label>

        <label>
          <span>LOCAL</span>

          <input
            type="text"
            placeholder="Ex.: Cine Elite"
            value={venueName}
            onChange={(event) => setVenueName(event.target.value)}
          />
        </label>

        <label>
          <span>ENDEREÇO</span>

          <input
            type="text"
            placeholder="Ex.: Uberlândia - MG"
            value={venueAddress}
            onChange={(event) => setVenueAddress(event.target.value)}
          />
        </label>

        <div className="session-form-row">
          <label>
            <span>CAPACIDADE</span>

            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
            />
          </label>

          <label>
            <span>PREÇO / R$</span>

            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>
        </div>

        {(validationError || error) && (
          <p className="organizer-error">{validationError || error}</p>
        )}

        {success && <p className="organizer-success">{success}</p>}

        <button
          type="submit"
          className="publish-button"
          disabled={!selectedMovie || publishing}
        >
          <span>
            {publishing ? "PUBLICANDO..." : "PUBLICAR NA PROGRAMAÇÃO"}
          </span>
          <span>→</span>
        </button>
      </form>
    </div>
  );
}
