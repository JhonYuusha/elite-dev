import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { GateResultView } from "../components/gate/GateResultView";
import { GateScanner } from "../components/gate/GateScanner";
import { useAuth } from "../context/useAuth";
import { useGateEvents } from "../hooks/gate/useGateEvents";
import { useGateValidation } from "../hooks/gate/useGateValidation";
import type { GateResult } from "../services/gate.service";

import "../styles/gate-v2.css";

export function GatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const canUseGate = user?.role === "GATEKEEPER";

  const {
    data: events = [],
    isLoading: loadingEvents,
    isError: eventsError,
    error: eventsQueryError,
    refetch: refetchEvents,
  } = useGateEvents(canUseGate);

  const validation = useGateValidation();

  const [eventId, setEventId] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<GateResult | null>(null);
  const [error, setError] = useState("");

  const selectedEventId = eventId || events[0]?.id || "";
  const selectedEvent = events.find(
    (event) => event.id === selectedEventId,
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "GATEKEEPER") {
      navigate("/");
    }
  }, [user, navigate]);

  async function validateCode(code: string) {
    const cleanCode = code.trim();

    if (
      !cleanCode ||
      !selectedEventId ||
      validation.isPending
    ) {
      return;
    }

    try {
      setResult(null);
      setError("");

      const response = await validation.mutateAsync({
        code: cleanCode,
        eventId: selectedEventId,
      });

      setResult(response);
      setManualCode("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível validar este ingresso.",
      );
    }
  }

  function resetValidation() {
    validation.reset();
    setResult(null);
    setError("");
    setManualCode("");
  }

  function changeEvent(nextEventId: string) {
    resetValidation();
    setEventId(nextEventId);
  }

  if (!canUseGate) {
    return null;
  }

  return (
    <main className="gate-page">
      <header className="details-header">
        <Link to="/" className="brand">
          ELITE<span>/TICKETS</span>
        </Link>

        <span className="gate-mode">
          MODO / PORTARIA
        </span>
      </header>

      <section className="gate-layout">
        <div className="gate-intro">
          <p className="eyebrow">
            ACESSO / VALIDAÇÃO
          </p>

          <h1>
            ENTRADA
            <br />
            LIBERADA?
          </h1>

          <p className="gate-description">
            Selecione a sessão da portaria e leia o QR do
            ingresso. O código manual permanece disponível
            como contingência.
          </p>

          <label className="gate-event-select">
            <span>EVENTO DA PORTARIA</span>

            <select
              value={selectedEventId}
              disabled={
                loadingEvents ||
                events.length === 0
              }
              onChange={(event) =>
                changeEvent(event.target.value)
              }
            >
              {loadingEvents && (
                <option value="">
                  CARREGANDO SESSÕES...
                </option>
              )}

              {!loadingEvents &&
                events.length === 0 && (
                  <option value="">
                    NENHUMA SESSÃO DISPONÍVEL
                  </option>
                )}

              {events.map((event) => (
                <option
                  key={event.id}
                  value={event.id}
                >
                  {event.title}
                </option>
              ))}
            </select>
          </label>

          {eventsError && (
            <div className="gate-events-error">
              <p>
                {eventsQueryError instanceof Error
                  ? eventsQueryError.message
                  : "Não foi possível carregar os eventos."}
              </p>

              <button
                type="button"
                onClick={() => {
                  void refetchEvents();
                }}
              >
                TENTAR NOVAMENTE ↗
              </button>
            </div>
          )}

          {selectedEvent && (
            <div className="gate-session-meta">
              <span>
                SESSÃO SELECIONADA
              </span>

              <strong>
                {selectedEvent.title}
              </strong>
            </div>
          )}
        </div>

        <div className="gate-terminal">
          {!result ? (
            <>
              <GateScanner
                disabled={
                  !selectedEventId ||
                  validation.isPending
                }
                onRead={(code) => {
                  void validateCode(code);
                }}
                onError={setError}
              />

              <div className="gate-divider">
                <span>
                  OU / CÓDIGO MANUAL
                </span>
              </div>

              <form
                className="gate-manual"
                onSubmit={(event) => {
                  event.preventDefault();
                  void validateCode(manualCode);
                }}
              >
                <label htmlFor="gate-code">
                  CÓDIGO DO INGRESSO
                </label>

                <textarea
                  id="gate-code"
                  value={manualCode}
                  spellCheck={false}
                  placeholder="Cole aqui o código completo do ingresso."
                  onChange={(event) =>
                    setManualCode(event.target.value)
                  }
                />

                <button
                  type="submit"
                  className="gate-primary"
                  disabled={
                    !manualCode.trim() ||
                    !selectedEventId ||
                    validation.isPending
                  }
                >
                  <span>
                    {validation.isPending
                      ? "VALIDANDO..."
                      : "VALIDAR INGRESSO"}
                  </span>

                  <span>→</span>
                </button>
              </form>

              {error && (
                <p className="gate-error">
                  {error}
                </p>
              )}
            </>
          ) : (
            <GateResultView
              result={result}
              onReset={resetValidation}
            />
          )}
        </div>
      </section>
    </main>
  );
}