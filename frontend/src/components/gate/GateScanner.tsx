import { useEffect, useRef, useState } from "react";

type GateScannerProps = {
  disabled: boolean;
  onRead: (code: string) => void;
  onError: (message: string) => void;
};

export function GateScanner({
  disabled,
  onRead,
  onError,
}: GateScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const scanningRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("Câmera desligada.");
  const [lastRead, setLastRead] = useState("");

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      scanningRef.current = false;
    };
  }, []);

  async function startCamera() {
    if (!videoRef.current || cameraActive || disabled) return;

    try {
      onError("");
      setLastRead("");
      setCameraStatus("Solicitando acesso à câmera...");

      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();

      scanningRef.current = true;

      const controls = await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        videoRef.current,
        (scanResult, scanError) => {
          if (!scanningRef.current) return;

          if (scanResult) {
            const text = scanResult.getText();

            setLastRead(text);
            setCameraStatus("QR detectado.");
            scanningRef.current = false;

            controlsRef.current?.stop();
            controlsRef.current = null;
            setCameraActive(false);

            onRead(text);
            return;
          }

          if (scanError) {
            setCameraStatus("Câmera ativa — procurando QR Code...");
          }
        },
      );

      controlsRef.current = controls;
      setCameraActive(true);
      setCameraStatus("Câmera ativa — procurando QR Code...");
    } catch {
      scanningRef.current = false;
      controlsRef.current?.stop();
      controlsRef.current = null;

      setCameraActive(false);
      setCameraStatus("Não foi possível iniciar a câmera.");

      onError(
        "Não foi possível acessar a câmera. Use o código manual como alternativa.",
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

  return (
    <>
      <div className="gate-terminal-heading">
        <span>TERMINAL / 01</span>

        <strong>
          {cameraActive ? "LEITURA ATIVA" : "AGUARDANDO LEITURA"}
        </strong>
      </div>

      <div className="gate-camera">
        <video ref={videoRef} muted playsInline autoPlay />

        {!cameraActive && (
          <div className="gate-camera-placeholder">
            <span>LEITOR QR</span>

            <strong>
              CÂMERA
              <br />
              INATIVA
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
        <span>{cameraActive ? "●" : "○"}</span>
        <p>{cameraStatus}</p>
      </div>

      {lastRead && (
        <div className="gate-last-read">
          <span>ÚLTIMO QR DETECTADO</span>

          <code>
            {lastRead.length > 36
              ? `${lastRead.slice(0, 36)}...`
              : lastRead}
          </code>
        </div>
      )}

      <div className="gate-camera-actions">
        {!cameraActive ? (
          <button
            type="button"
            className="gate-primary"
            disabled={disabled}
            onClick={() => void startCamera()}
          >
            <span>ATIVAR CÂMERA</span>
            <span>↗</span>
          </button>
        ) : (
          <button
            type="button"
            className="gate-secondary"
            onClick={stopCamera}
          >
            ENCERRAR LEITURA
          </button>
        )}
      </div>
    </>
  );
}
