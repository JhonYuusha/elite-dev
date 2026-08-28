import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrowserQRCodeReader } from "@zxing/browser";
import axios from "axios";

import { api } from "../services/api";
import { useAuth } from "../context/useAuth";

type GateResult =
  | {
      status: "VALID";
      message: string;
      ticketId: string;
      eventId: string;
    }
  | {
      status: "INVALID" | "WRONG_EVENT" | "ALREADY_USED";
      message: string;
      validatedAt?: string;
    };

type EventOption = {
  id: string;
  title: string;
  startsAt: string;
};

export function GatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const controlsRef = useRef<{
    stop: () => void;
  } | null>(null);

  const scanningRef = useRef(false);

  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventId, setEventId] = useState("");

  const [manualCode, setManualCode] = useState("");

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState(
    "Câmera desligada.",
  );

  const [lastRead, setLastRead] = useState("");

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<GateResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "GATEKEEPER") {
      navigate("/");
      return;
    }

    async function loadEvents() {
      try {
        const { data } = await api.get<EventOption[]>("/events");

        setEvents(data);

        if (data.length > 0) {
          setEventId(data[0].id);
        }
      } catch {
        setError("Não foi possível carregar os eventos.");
      }
    }

    loadEvents();

    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      scanningRef.current = false;
    };
  }, [user, navigate]);

  async function validateCode(code: string) {
    const cleanCode = code.trim();

    if (!cleanCode || !eventId || processing) {
      return;
    }

    try {
      setProcessing(true);
      setResult(null);
      setError("");

      const { data } = await api.post<GateResult>(
        "/gate/validate",
        {
          code: cleanCode,
          eventId,
        },
      );

      setResult(data);
      setManualCode("");
    } catch (requestError) {
      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.data
      ) {
        setResult(requestError.response.data as GateResult);
      } else {
        setError("Não foi possível validar este ingresso.");
      }
    } finally {
      setProcessing(false);
    }
  }

  async function startCamera() {
    if (!videoRef.current || cameraActive) {
      return;
    }

    try {
      setError("");
      setResult(null);
      setLastRead("");

      setCameraStatus("Solicitando acesso à câmera...");

      const reader = new BrowserQRCodeReader();

      scanningRef.current = true;

      const controls = await reader.decodeFromConstraints(
        {
          audio: false,

          video: {
            facingMode: {
              ideal: "environment",
            },

            width: {
              ideal: 1280,
            },

            height: {
              ideal: 720,
            },
          },
        },

        videoRef.current,

        (scanResult, scanError) => {
          if (!scanningRef.current) {
            return;
          }

          if (scanResult) {
            const text = scanResult.getText();

            console.log("QR lido pela câmera:", text);

            setLastRead(text);
            setCameraStatus("QR detectado.");

            scanningRef.current = false;

            controlsRef.current?.stop();
            controlsRef.current = null;

            setCameraActive(false);

            void validateCode(text);

            return;
          }

          /*
           * O ZXing gera erros constantemente enquanto procura
           * um QR nos frames da câmera. Isso é normal.
           *
           * Por isso não mostramos cada erro na interface.
           */
          if (scanError) {
            setCameraStatus(
              "Câmera ativa — procurando QR Code...",
            );
          }
        },
      );

      controlsRef.current = controls;

      setCameraActive(true);
      setCameraStatus(
        "Câmera ativa — procurando QR Code...",
      );
    } catch (cameraError) {
      console.error(
        "Erro ao iniciar leitor de QR:",
        cameraError,
      );

      scanningRef.current = false;

      controlsRef.current?.stop();
      controlsRef.current = null;

      setCameraActive(false);

      setCameraStatus("Não foi possível iniciar a câmera.");

      setError(
        "Não foi possível acessar ou iniciar a câmera. Use a digitação manual como alternativa.",
      );
    }
  }

  function stopCamera() {
    scanningRef.current = false;

    controlsRef.current?.stop();
    controlsRef.current = null;

    setCameraActive(false);
    setCameraStatus("Câmera desligada.");
  }

  function resetValidation() {
    setResult(null);
    setError("");
    setManualCode("");
    setLastRead("");
    setCameraStatus("Câmera desligada.");
  }

  const resultClass = result
    ? `gate-result gate-result-${result.status.toLowerCase()}`
    : "";

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

          <p>
            Selecione o evento da entrada e leia o QR do
            ingresso. A digitação manual permanece
            disponível como contingência.
          </p>

          <label className="gate-event-select">
            <span>
              EVENTO DA PORTARIA
            </span>

            <select
              value={eventId}
              onChange={(event) => {
                setEventId(event.target.value);
                resetValidation();
              }}
            >
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
        </div>

        <div className="gate-terminal">
          {!result && (
            <>
              <div className="gate-camera">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  autoPlay
                />

                {!cameraActive && (
                  <div className="gate-camera-placeholder">
                    <span>LEITOR QR</span>

                    <strong>
                      CÂMERA INATIVA
                    </strong>
                  </div>
                )}

                {cameraActive && (
                  <div className="gate-scan-frame">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </div>

              <div className="gate-camera-status">
                <span>
                  {cameraActive ? "●" : "○"}
                </span>

                <p>{cameraStatus}</p>
              </div>

              {lastRead && (
                <div className="gate-last-read">
                  <span>
                    ÚLTIMO QR DETECTADO
                  </span>

                  <code>
                    {lastRead.slice(0, 36)}...
                  </code>
                </div>
              )}

              <div className="gate-camera-actions">
                {!cameraActive ? (
                  <button
                    type="button"
                    className="gate-primary"
                    onClick={startCamera}
                  >
                    ATIVAR CÂMERA
                    <span>◎</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="gate-secondary"
                    onClick={stopCamera}
                  >
                    DESATIVAR CÂMERA
                  </button>
                )}
              </div>

              <div className="gate-divider">
                <span>
                  OU DIGITE O CÓDIGO
                </span>
              </div>

              <form
                className="gate-manual"
                onSubmit={(event) => {
                  event.preventDefault();

                  void validateCode(manualCode);
                }}
              >
                <textarea
                  value={manualCode}
                  onChange={(event) =>
                    setManualCode(event.target.value)
                  }
                  placeholder="Cole aqui o código manual do ingresso..."
                />

                <button
                  type="submit"
                  className="gate-primary"
                  disabled={
                    !manualCode.trim() ||
                    processing
                  }
                >
                  {processing
                    ? "VALIDANDO..."
                    : "VALIDAR INGRESSO"}

                  <span>→</span>
                </button>
              </form>
            </>
          )}

          {result && (
            <div className={resultClass}>
              <span className="gate-result-label">
                RESULTADO DA LEITURA
              </span>

              <strong className="gate-result-status">
                {result.status === "VALID" &&
                  "✓ VÁLIDO"}

                {result.status === "INVALID" &&
                  "✕ INVÁLIDO"}

                {result.status ===
                  "ALREADY_USED" &&
                  "↺ JÁ UTILIZADO"}

                {result.status ===
                  "WRONG_EVENT" &&
                  "⇄ EVENTO ERRADO"}
              </strong>

              <p>
                {result.message}
              </p>

              {"validatedAt" in result &&
                result.validatedAt && (
                  <small>
                    Validado anteriormente em{" "}
                    {new Intl.DateTimeFormat(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    ).format(
                      new Date(
                        result.validatedAt,
                      ),
                    )}
                  </small>
                )}

              <button
                type="button"
                onClick={resetValidation}
              >
                VALIDAR PRÓXIMO →
              </button>
            </div>
          )}

          {error && (
            <p className="gate-error">
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}